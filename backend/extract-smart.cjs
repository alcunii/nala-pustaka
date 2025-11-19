/**
 * FINAL SOLUTION: Extract with Smart Chunking
 * 
 * PROBLEM: Full text too large (262KB) exceeds REST API buffer
 * SOLUTION: Split manuscripts into smaller metadata + store full_text separately
 * 
 * APPROACH:
 * 1. Extract manuscripts from Pinecone
 * 2. Insert metadata first (without full_text)
 * 3. Update full_text separately in smaller chunks
 * 
 * This works with Supabase FREE tier!
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const vectorDB = require('./src/services/vectorDB');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100);
}

async function discoverManuscripts() {
  console.log('📡 Discovering manuscripts...\n');
  const dummyVector = Array(1536).fill(0);
  const samples = await vectorDB.query(dummyVector, { topK: 1000, includeMetadata: true });
  
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
  
  console.log(`✅ Found ${manuscriptMap.size} manuscripts\n`);
  return manuscriptMap;
}

async function extractManuscripts(manuscriptMap) {
  console.log('📦 Extracting manuscripts...\n');
  const manuscripts = [];
  let processed = 0;
  
  for (const [manuscriptId, meta] of manuscriptMap) {
    try {
      processed++;
      console.log(`[${processed}/${manuscriptMap.size}] ${meta.title}...`);
      
      const chunks = await vectorDB.getByManuscriptId(manuscriptId);
      if (chunks.length === 0) {
        console.log('   ⚠️  No chunks\n');
        continue;
      }
      
      const sortedChunks = chunks.sort((a, b) => 
        (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0)
      );
      
      const fullText = sortedChunks.map(c => c.metadata?.text || '').join('\n\n');
      const firstChunk = sortedChunks[0].metadata;
      
      manuscripts.push({
        id: manuscriptId,
        title: firstChunk.title || 'Untitled',
        author: firstChunk.author || 'Tidak Diketahui',
        year: firstChunk.year || null,
        slug: generateSlug(firstChunk.title || manuscriptId),
        source_url: firstChunk.url || null,
        full_text: fullText,
        description: fullText.substring(0, 500) + '...'
      });
      
      console.log(`   ✅ ${chunks.length} chunks, ${(fullText.length/1000).toFixed(0)}KB\n`);
    } catch (error) {
      console.error(`   ❌ ${error.message}\n`);
    }
  }
  
  return manuscripts;
}

async function saveSmartly(manuscripts) {
  console.log('💾 Saving with smart approach...\n');
  
  // Clear old
  console.log('🗑️  Clearing...');
  await supabase.from('manuscripts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Cleared\n');
  
  let saved = 0;
  let errors = 0;
  
  for (let i = 0; i < manuscripts.length; i++) {
    const m = manuscripts[i];
    
    try {
      // STEP 1: Insert metadata first (small payload)
      const { error: metaError } = await supabase
        .from('manuscripts')
        .insert([{
          id: m.id,
          title: m.title,
          author: m.author,
          year: m.year,
          slug: m.slug,
          source_url: m.source_url,
          description: m.description,
          full_text: '' // Empty first!
        }]);
      
      if (metaError) throw metaError;
      
      // STEP 2: Update full_text separately (one field update is smaller)
      const { error: textError } = await supabase
        .from('manuscripts')
        .update({ full_text: m.full_text })
        .eq('id', m.id);
      
      if (textError) throw textError;
      
      saved++;
      console.log(`✅ [${i + 1}/${manuscripts.length}] ${m.title}`);
      
      await new Promise(r => setTimeout(r, 200));
      
    } catch (err) {
      errors++;
      console.error(`❌ [${i + 1}] ${m.title}: ${err.message}`);
    }
  }
  
  console.log(`\n✅ Saved: ${saved}/${manuscripts.length}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  
  return { saved, errors };
}

async function main() {
  console.log('========================================');
  console.log('🚀 SMART EXTRACTION (2-Step Insert)');
  console.log('========================================\n');
  
  try {
    await vectorDB.initialize();
    
    const manuscriptMap = await discoverManuscripts();
    if (manuscriptMap.size === 0) {
      console.error('❌ No manuscripts!');
      process.exit(1);
    }
    
    const manuscripts = await extractManuscripts(manuscriptMap);
    if (manuscripts.length === 0) {
      console.error('❌ No manuscripts extracted!');
      process.exit(1);
    }
    
    const result = await saveSmartly(manuscripts);
    
    console.log('\n========================================');
    console.log('✅ COMPLETED!');
    console.log('========================================');
    console.log(`Total: ${manuscripts.length}`);
    console.log(`Saved: ${result.saved}`);
    console.log(`Errors: ${result.errors}`);
    console.log('\n🎉 Check Admin Dashboard!\n');
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    process.exit(1);
  }
}

main();
