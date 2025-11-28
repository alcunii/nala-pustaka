require('dotenv').config();
const { Pool } = require('pg');
const vectorDB = require('./src/services/vectorDB');

// Try Connection Pooler (more reliable)
const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.eosclaiinbnebgrjsgsp',
  password: 'KelinciCoklat131!',
  ssl: { rejectUnauthorized: false }
});

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100);
}

async function main() {
  console.log('🚀 TRYING CONNECTION POOLER...\n');
  
  try {
    console.log('🔌 Connecting...');
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connected!\n');
    
    await vectorDB.initialize();
    
    // Discover
    console.log('📡 Discovering...');
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
    
    console.log(`✅ Found ${manuscriptMap.size}\n`);
    
    // Extract
    console.log('📦 Extracting...\n');
    const manuscripts = [];
    let processed = 0;
    
    for (const [manuscriptId, meta] of manuscriptMap) {
      try {
        processed++;
        console.log(`[${processed}/${manuscriptMap.size}] ${meta.title}...`);
        
        const chunks = await vectorDB.getByManuscriptId(manuscriptId);
        if (chunks.length === 0) continue;
        
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
    
    console.log(`\n💾 Saving ${manuscripts.length} manuscripts...\n`);
    
    const dbClient = await pool.connect();
    try {
      await dbClient.query('DELETE FROM manuscripts');
      console.log('✅ Cleared\n');
      
      let saved = 0;
      for (let i = 0; i < manuscripts.length; i++) {
        const m = manuscripts[i];
        try {
          await dbClient.query(
            'INSERT INTO manuscripts (id, title, author, year, slug, source_url, full_text, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
            [m.id, m.title, m.author, m.year, m.slug, m.source_url, m.full_text, m.description]
          );
          saved++;
          console.log(`✅ [${i + 1}] ${m.title}`);
        } catch (err) {
          console.error(`❌ [${i + 1}] ${err.message}`);
        }
      }
      
      console.log(`\n✅ SUCCESS: ${saved}/${manuscripts.length}\n`);
      
    } finally {
      dbClient.release();
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    await pool.end();
    process.exit(1);
  }
}

main();
