/**
 * DIRECT POSTGRESQL - FIXED CONNECTION
 */

require('dotenv').config();
const { Pool } = require('pg');
const vectorDB = require('./src/services/vectorDB');

// FIXED: Correct Supabase PostgreSQL host format
const supabaseUrl = process.env.SUPABASE_URL || 'https://eosclaiinbnebgrjsgsp.supabase.co';
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

const pool = new Pool({
  host: `db.${projectRef}.supabase.co`,  // FIXED: Correct format
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'KelinciCoklat131!',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100);
}

async function discoverManuscripts() {
  console.log('📡 Discovering...\n');
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
  console.log('📦 Extracting...\n');
  const manuscripts = [];
  let processed = 0;
  
  for (const [manuscriptId, meta] of manuscriptMap) {
    try {
      processed++;
      console.log(`[${processed}/${manuscriptMap.size}] ${meta.title}...`);
      
      const chunks = await vectorDB.getByManuscriptId(manuscriptId);
      if (chunks.length === 0) {
        console.log('   ⚠️  Skip\n');
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
      
      console.log(`   ✅ ${chunks.length} chunks\n`);
    } catch (error) {
      console.error(`   ❌ ${error.message}\n`);
    }
  }
  
  return manuscripts;
}

async function saveToPostgres(manuscripts) {
  console.log('💾 Saving via PostgreSQL...\n');
  
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Clearing...');
    await client.query('DELETE FROM manuscripts');
    console.log('✅ Cleared\n');
    
    let saved = 0;
    
    for (let i = 0; i < manuscripts.length; i++) {
      const m = manuscripts[i];
      
      try {
        await client.query(
          `INSERT INTO manuscripts 
           (id, title, author, year, slug, source_url, full_text, description, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [m.id, m.title, m.author, m.year, m.slug, m.source_url, m.full_text, m.description]
        );
        
        saved++;
        console.log(`✅ [${i + 1}/${manuscripts.length}] ${m.title}`);
        
      } catch (err) {
        console.error(`❌ [${i + 1}] ${m.title}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ Saved: ${saved}/${manuscripts.length}`);
    return { saved };
    
  } finally {
    client.release();
  }
}

async function main() {
  console.log('========================================');
  console.log('🚀 DIRECT POSTGRESQL');
  console.log('========================================\n');
  
  try {
    console.log('🔌 Connecting to:', `db.${projectRef}.supabase.co`);
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connected!\n');
    
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
    
    const result = await saveToPostgres(manuscripts);
    
    console.log('\n========================================');
    console.log('✅ SUCCESS!');
    console.log('========================================');
    console.log(`Saved: ${result.saved}/${manuscripts.length}`);
    console.log('\n🎉 Check Admin Dashboard!\n');
    
    await pool.end();
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    await pool.end();
    process.exit(1);
  }
}

main();
