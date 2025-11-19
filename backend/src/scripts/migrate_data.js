/**
 * Migration Script: Pinecone ? PostgreSQL
 * 
 * This script aggregates all Pinecone chunks per manuscript
 * and inserts complete manuscripts into PostgreSQL database.
 * 
 * Usage: node src/scripts/migrate-to-postgres.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const vectorDB = require('../services/vectorDB');
const manuscriptService = require('../services/manuscriptService');
const logger = require('../utils/logger');

/**
 * Extract unique manuscriptIds from all vectors
 * Uses iterative querying to bypass 10k limit
 */
async function getAllManuscriptIds() {
  logger.info('Fetching all vectors from Pinecone (Iterative Scan)...');
  
  try {
    const stats = await vectorDB.getStats();
    const totalVectors = stats.totalRecordCount || 0;
    logger.info(`Pinecone stats: ${totalVectors} total vectors`);

    const manuscriptIds = new Set();

    // Strategy: Run queries with random vectors to cast a wide net.
    // This is a heuristic approach since we can't iterate perfectly without ID lists.
    
    const ITERATIONS = 50; // High number of iterations to cover the vector space
    const dummyVector = new Array(1536).fill(0);

    logger.info(`Running ${ITERATIONS} iterations of random sampling to find all manuscripts...`);

    for (let i = 0; i < ITERATIONS; i++) {
        // Create a random vector
        const randomVector = dummyVector.map(() => Math.random() - 0.5);
        
        const queryResponse = await vectorDB.index.query({
            vector: randomVector,
            topK: 10000, // Max allowed
            includeMetadata: true
        });

        const matches = queryResponse.matches || [];
        let newFound = 0;
        matches.forEach(match => {
            const manuscriptId = match.metadata?.manuscriptId;
            if (manuscriptId) {
                if (!manuscriptIds.has(manuscriptId)) newFound++;
                manuscriptIds.add(manuscriptId);
            }
        });
        
        logger.info(`Iteration ${i+1}/${ITERATIONS}: Found ${matches.length} matches, ${newFound} new manuscripts. Total unique: ${manuscriptIds.size}`);
        
        // If we stop finding new things for 5 iterations in a row, maybe stop?
        // For safety, let's just run all.
        
        // Small delay to be nice to API
        await new Promise(r => setTimeout(r, 200));
    }
    
    const uniqueIds = Array.from(manuscriptIds).sort();
    logger.info(`Final scan result: ${uniqueIds.length} unique manuscripts found`);
    
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
      display_order: 0,
      description: '', // Default description
      category: 'other', // Default category
      created_by: null, // System
      knowledge_graph: null
    };
  } catch (error) {
    logger.error(`Error reconstructing manuscript ${manuscriptId}:`, error);
    return null;
  }
}

/**
 * Insert or update manuscript in PostgreSQL
 */
async function upsertManuscript(manuscript) {
  try {
    const existing = await manuscriptService.getBySlug(manuscript.slug);
    
    if (existing) {
      // Skip update if already exists to save time, or uncomment below to force update
      // logger.info(`??  Skipped (already exists): ${manuscript.title}`);
      // return { action: 'skipped', data: existing };
      
       const updated = await manuscriptService.update(existing.id, {
         ...manuscript,
         updated_at: new Date().toISOString()
       });
       logger.info(`? Updated: ${manuscript.title} (${manuscript.chunk_count} chunks)`);
       return { action: 'updated', data: updated };
    } else {
      const inserted = await manuscriptService.create(manuscript);
      
      logger.info(`? Inserted: ${manuscript.title} (${manuscript.chunk_count} chunks)`);
      return { action: 'inserted', data: inserted };
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
  console.log('\n+------------------------------------------------------------+');
  console.log('¦  ?? MIGRATION: Pinecone ? PostgreSQL                     ¦');
  console.log('+------------------------------------------------------------+\n');
  
  const startTime = Date.now();
  
  try {
    logger.info('Step 1: Initializing Pinecone connection...');
    await vectorDB.initialize();
    logger.info('? Pinecone connected');
    
    logger.info('\nStep 2: Fetching all manuscript IDs from Pinecone...');
    const manuscriptIds = await getAllManuscriptIds();
    logger.info(`? Found ${manuscriptIds.length} manuscripts to migrate`);
    
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
        logger.warn(`${progress} ??  Skipped: ${manuscriptId} (no data)`);
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
      } else if (result.action === 'skipped') {
        results.skipped++;
      }
      
      if ((i + 1) % 10 === 0) {
        logger.info(`\n?? Progress: ${i + 1}/${manuscriptIds.length} completed\n`);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n+------------------------------------------------------------+');
    console.log('¦  ? MIGRATION COMPLETE                                    ¦');
    console.log('+------------------------------------------------------------+\n');
    console.log(`?? Summary:`);
    console.log(`   Total manuscripts: ${results.total}`);
    console.log(`   ? Inserted: ${results.inserted}`);
    console.log(`   ?? Updated: ${results.updated}`);
    console.log(`   ??  Skipped: ${results.skipped}`);
    console.log(`   ? Errors: ${results.errors.length}`);
    console.log(`   ??  Duration: ${duration}s\n`);
    
    if (results.errors.length > 0) {
      console.log('? Errors encountered:');
      results.errors.forEach(err => {
        console.log(`   - ${err.manuscriptId}: ${err.error}`);
      });
      console.log('');
    }
    
    logger.info('Verifying data in PostgreSQL...');
    const manuscripts = await manuscriptService.getAll();
    logger.info(`? PostgreSQL now contains ${manuscripts.length} manuscripts`);
    
    logger.info('\n?? Migration successful! PostgreSQL is now your primary data source.');
    
  } catch (error) {
    console.error('\n? Migration failed:', error);
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
