/**
 * EXTRACT FROM PINECONE TO SUPABASE
 * Extract manuscripts from Pinecone chunks and save to Supabase
 * 
 * SAFE: Only reads from Pinecone, controlled writes to Supabase
 * Time: ~5-8 minutes for 14 manuscripts
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const vectorDB = require('./src/services/vectorDB');
const logger = require('./src/utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for higher limits
);

// Helper: Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

// PHASE 1: Discover unique manuscripts
async function discoverManuscripts() {
  console.log('📡 PHASE 1: Discovering manuscripts in Pinecone...\n');
  
  const dummyVector = Array(1536).fill(0);
  const samples = await vectorDB.query(dummyVector, { 
    topK: 1000, 
    includeMetadata: true 
  });
  
  // Extract unique manuscript IDs
  const manuscriptMap = new Map();
  
  samples.forEach(chunk => {
    const id = chunk.metadata?.manuscriptId;
    if (id && !manuscriptMap.has(id)) {
      manuscriptMap.set(id, {
        manuscriptId: id,
        title: chunk.metadata.title,
        author: chunk.metadata.author,
        year: chunk.metadata.year,
        url: chunk.metadata.url
      });
    }
  });
  
  console.log(`✅ Found ${manuscriptMap.size} unique manuscripts:\n`);
  let i = 1;
  for (const [id, meta] of manuscriptMap) {
    console.log(`   ${i}. ${meta.title}`);
    console.log(`      Author: ${meta.author}`);
    console.log(`      ID: ${id}\n`);
    i++;
  }
  
  return manuscriptMap;
}

// PHASE 2: Extract full manuscripts
async function extractManuscripts(manuscriptMap) {
  console.log('\n📦 PHASE 2: Extracting full manuscripts...\n');
  
  const manuscripts = [];
  let processed = 0;
  
  for (const [manuscriptId, meta] of manuscriptMap) {
    try {
      processed++;
      console.log(`[${processed}/${manuscriptMap.size}] Extracting: ${meta.title}...`);
      
      // Fetch all chunks for this manuscript
      const chunks = await vectorDB.getByManuscriptId(manuscriptId);
      
      if (chunks.length === 0) {
        console.log(`   ⚠️  No chunks found, skipping\n`);
        continue;
      }
      
      // Sort by chunkIndex
      const sortedChunks = chunks.sort((a, b) => {
        const aIndex = a.metadata?.chunkIndex || 0;
        const bIndex = b.metadata?.chunkIndex || 0;
        return aIndex - bIndex;
      });
      
      // Reconstruct full text
      const fullText = sortedChunks
        .map(c => c.metadata?.text || '')
        .join('\n\n');
      
      // Get metadata from first chunk (most complete)
      const firstChunk = sortedChunks[0].metadata;
      
      manuscripts.push({
        id: manuscriptId,
        title: firstChunk.title || 'Untitled',
        author: firstChunk.author || 'Tidak Diketahui',
        year: firstChunk.year || null,
        slug: generateSlug(firstChunk.title || manuscriptId),
        source_url: firstChunk.url || null,
        full_text: fullText,
        description: fullText.substring(0, 500) + '...' // First 500 chars
      });
      
      console.log(`   ✅ ${chunks.length} chunks, ${fullText.length} chars\n`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log(`✅ Extracted ${manuscripts.length} manuscripts\n`);
  return manuscripts;
}

// PHASE 3: Save to Supabase
async function saveToSupabase(manuscripts) {
  console.log('💾 PHASE 3: Saving to Supabase...\n');
  
  // Clear old data
  console.log('🗑️  Clearing old manuscripts...');
  await supabase
    .from('manuscripts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Cleared\n');
  
  let saved = 0;
  let errors = 0;
  
  console.log(`📝 Inserting ${manuscripts.length} manuscripts (one-by-one)...\n`);
  
  for (let i = 0; i < manuscripts.length; i++) {
    const m = manuscripts[i];
    
    try {
      const { error } = await supabase
        .from('manuscripts')
        .insert([m]);
      
      if (error) {
        console.error(`❌ [${i + 1}] ${m.title}: ${error.message}`);
        errors++;
      } else {
        saved++;
        console.log(`✅ [${i + 1}/${manuscripts.length}] ${m.title}`);
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
      
    } catch (err) {
      console.error(`❌ [${i + 1}] ${m.title}: ${err.message}`);
      errors++;
    }
  }
  
  console.log(`\n✅ Saved: ${saved}/${manuscripts.length}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  
  return { saved, errors };
}

// MAIN
async function main() {
  console.log('========================================');
  console.log('🚀 EXTRACT PINECONE → SUPABASE');
  console.log('========================================\n');
  
  try {
    // Initialize
    await vectorDB.initialize();
    
    // Phase 1: Discovery
    const manuscriptMap = await discoverManuscripts();
    
    if (manuscriptMap.size === 0) {
      console.error('❌ No manuscripts found in Pinecone!');
      process.exit(1);
    }
    
    // Confirm
    console.log('⏳ Estimated time: ~5-8 minutes\n');
    console.log('⚠️  This will:');
    console.log('   1. Read all chunks from Pinecone (read-only, safe)');
    console.log('   2. Clear old manuscripts in Supabase');
    console.log('   3. Insert new manuscripts to Supabase\n');
    
    // Phase 2: Extract
    const manuscripts = await extractManuscripts(manuscriptMap);
    
    if (manuscripts.length === 0) {
      console.error('❌ No manuscripts extracted!');
      process.exit(1);
    }
    
    // Phase 3: Save
    const result = await saveToSupabase(manuscripts);
    
    // Summary
    console.log('\n========================================');
    console.log('✅ EXTRACTION COMPLETED!');
    console.log('========================================');
    console.log(`📊 Results:`);
    console.log(`   Total manuscripts: ${manuscripts.length}`);
    console.log(`   Saved to Supabase: ${result.saved}`);
    console.log(`   Errors: ${result.errors}`);
    console.log('');
    console.log('🎉 Manuscripts now visible in Admin Dashboard!');
    console.log('🔍 Try searching or using Deep Chat');
    console.log('');
    
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ EXTRACTION FAILED');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
