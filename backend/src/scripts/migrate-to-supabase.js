/**
 * Migration Script: Pinecone → Supabase
 * 
 * This script aggregates all Pinecone chunks per manuscript
 * and inserts complete manuscripts into Supabase database.
 * 
 * Usage: node src/scripts/migrate-to-supabase.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const vectorDB = require('../services/vectorDB');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Extract unique manuscriptIds from all vectors
 */
async function getAllManuscriptIds() {
  logger.info('Fetching all vectors from Pinecone...');
  
  try {
    const stats = await vectorDB.getStats();
    logger.info('Pinecone stats:', JSON.stringify(stats, null, 2));
    
    const dummyVector = new Array(768).fill(0);
    const queryResponse = await vectorDB.index.query({
      vector: dummyVector,
      topK: 10000,
      includeMetadata: true
    });
    
    const matches = queryResponse.matches || [];
    logger.info(`Retrieved ${matches.length} total vectors from Pinecone`);
    
    const manuscriptIds = new Set();
    matches.forEach(match => {
      const manuscriptId = match.metadata?.manuscriptId;
      if (manuscriptId) {
        manuscriptIds.add(manuscriptId);
      }
    });
    
    const uniqueIds = Array.from(manuscriptIds).sort();
    logger.info(`Found ${uniqueIds.length} unique manuscripts`);
    
    return uniqueIds;
  } catch (error) {
    logger.error('Error fetching manuscript IDs:', error);
    throw error;
  }
}

/**
 * Reconstruct full text from chunks for one manuscript
 */
async function reconstructManuscript(manuscriptId) {
  try {
    const chunks = await vectorDB.getByManuscriptId(manuscriptId);
    
    if (!chunks || chunks.length === 0) {
      logger.warn(`No chunks found for manuscriptId: ${manuscriptId}`);
      return null;
    }
    
    const sortedChunks = chunks.sort((a, b) => 
      (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0)
    );
    
    const fullText = sortedChunks
      .map(chunk => chunk.metadata?.chunkText || '')
      .join('\n\n');
    
    const metadata = sortedChunks[0]?.metadata || {};
    
    return {
      manuscript_id: manuscriptId,
      title: metadata.title || 'Unknown Title',
      author: metadata.author || 'Unknown Author',
      year: metadata.year || null,
      source_url: metadata.url || null,
      full_text: fullText,
      chunk_count: chunks.length,
      token_count: sortedChunks.reduce((sum, chunk) => 
        sum + (chunk.metadata?.tokenCount || 0), 0
      ),
      slug: metadata.title 
        ? metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : `manuscript-${manuscriptId}`,
      is_pinned: false,
      display_order: 0
    };
  } catch (error) {
    logger.error(`Error reconstructing manuscript ${manuscriptId}:`, error);
    return null;
  }
}

/**
 * Insert or update manuscript in Supabase
 */
async function upsertManuscript(manuscript) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('manuscripts')
      .select('id, manuscript_id')
      .eq('manuscript_id', manuscript.manuscript_id)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existing) {
      const { data, error } = await supabase
        .from('manuscripts')
        .update({
          ...manuscript,
          updated_at: new Date().toISOString()
        })
        .eq('manuscript_id', manuscript.manuscript_id)
        .select()
        .single();
      
      if (error) throw error;
      
      logger.info(`✅ Updated: ${manuscript.title} (${manuscript.chunk_count} chunks)`);
      return { action: 'updated', data };
    } else {
      const { data, error } = await supabase
        .from('manuscripts')
        .insert([manuscript])
        .select()
        .single();
      
      if (error) throw error;
      
      logger.info(`✅ Inserted: ${manuscript.title} (${manuscript.chunk_count} chunks)`);
      return { action: 'inserted', data };
    }
  } catch (error) {
    logger.error(`Error upserting manuscript ${manuscript.manuscript_id}:`, error);
    return { action: 'error', error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 MIGRATION: Pinecone → Supabase                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  
  try {
    logger.info('Step 1: Initializing Pinecone connection...');
    await vectorDB.initialize();
    logger.info('✅ Pinecone connected');
    
    logger.info('\nStep 2: Fetching all manuscript IDs from Pinecone...');
    const manuscriptIds = await getAllManuscriptIds();
    logger.info(`✅ Found ${manuscriptIds.length} manuscripts to migrate`);
    
    logger.info('\nStep 3: Migrating manuscripts...\n');
    
    const results = {
      total: manuscriptIds.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    
    for (let i = 0; i < manuscriptIds.length; i++) {
      const manuscriptId = manuscriptIds[i];
      const progress = `[${i + 1}/${manuscriptIds.length}]`;
      
      logger.info(`${progress} Processing: ${manuscriptId}`);
      
      const manuscript = await reconstructManuscript(manuscriptId);
      
      if (!manuscript) {
        logger.warn(`${progress} ⚠️  Skipped: ${manuscriptId} (no data)`);
        results.skipped++;
        continue;
      }
      
      const result = await upsertManuscript(manuscript);
      
      if (result.action === 'inserted') {
        results.inserted++;
      } else if (result.action === 'updated') {
        results.updated++;
      } else if (result.action === 'error') {
        results.errors.push({
          manuscriptId,
          error: result.error
        });
      }
      
      if ((i + 1) % 10 === 0) {
        logger.info(`\n📊 Progress: ${i + 1}/${manuscriptIds.length} completed\n`);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ MIGRATION COMPLETE                                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Summary:`);
    console.log(`   Total manuscripts: ${results.total}`);
    console.log(`   ✅ Inserted: ${results.inserted}`);
    console.log(`   🔄 Updated: ${results.updated}`);
    console.log(`   ⚠️  Skipped: ${results.skipped}`);
    console.log(`   ❌ Errors: ${results.errors.length}`);
    console.log(`   ⏱️  Duration: ${duration}s\n`);
    
    if (results.errors.length > 0) {
      console.log('❌ Errors encountered:');
      results.errors.forEach(err => {
        console.log(`   - ${err.manuscriptId}: ${err.error}`);
      });
      console.log('');
    }
    
    logger.info('Verifying data in Supabase...');
    const { count, error } = await supabase
      .from('manuscripts')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      logger.error('Verification error:', error);
    } else {
      logger.info(`✅ Supabase now contains ${count} manuscripts`);
    }
    
    logger.info('\n🎉 Migration successful! You can now use Supabase as your primary data source.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
