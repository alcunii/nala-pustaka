require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');
const vectorDB = require('./src/services/vectorDB');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function discoverPineconeManuscripts() {
  console.log('📡 Discovering Pinecone manuscripts...');
  const dummyVector = Array(1536).fill(0);
  // Fetch enough samples to likely cover all manuscripts
  const samples = await vectorDB.query(dummyVector, { topK: 10000, includeMetadata: true });
  
  const titleToId = new Map();
  
  samples.forEach(chunk => {
    if (chunk.metadata?.title && chunk.metadata?.manuscriptId) {
      // Normalize title for better matching
      const normalizedTitle = chunk.metadata.title.toLowerCase().trim();
      titleToId.set(normalizedTitle, chunk.metadata.manuscriptId);
    }
  });
  
  console.log(`✅ Found ${titleToId.size} unique manuscripts in Pinecone.`);
  return titleToId;
}

async function fixFullText() {
  console.log('🔧 STARTING FULL TEXT RECOVERY (Smart Match)...');
  try {
    await vectorDB.initialize();
    const client = await pool.connect();
    console.log('✅ Database connected.');

    const pineconeMap = await discoverPineconeManuscripts();

    const res = await client.query('SELECT id, title FROM manuscripts');
    const manuscripts = res.rows;
    console.log(`Found ${manuscripts.length} manuscripts in DB.`);
    
    let updatedCount = 0;
    for (const m of manuscripts) {
      console.log(`\nProcessing: ${m.title}`);
      
      // Try ID match first
      let chunks = await vectorDB.getByManuscriptId(m.id);
      
      // If no chunks, try Title match
      if (!chunks || chunks.length === 0) {
        const normalizedTitle = m.title.toLowerCase().trim();
        const pineconeId = pineconeMap.get(normalizedTitle);
        
        if (pineconeId) {
          console.log(`  🔄 ID Mismatch! Found matching title in Pinecone. ID: ${pineconeId}`);
          chunks = await vectorDB.getByManuscriptId(pineconeId);
        }
      }

      if (!chunks || chunks.length === 0) {
        console.log('  ⚠️ No chunks found in Pinecone (checked ID and Title).');
        continue;
      }
      
      const sortedChunks = chunks.sort((a, b) => (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0));
      const firstMeta = sortedChunks[0].metadata || {};
      let textField = null;
      if (firstMeta.text) textField = 'text';
      else if (firstMeta.chunkText) textField = 'chunkText';
      else if (firstMeta.content) textField = 'content';
      else if (firstMeta.pageContent) textField = 'pageContent';
      
      if (!textField) {
        console.log('  ❌ Could not determine text field.');
        continue;
      }

      const fullText = sortedChunks.map(c => c.metadata?.[textField] || '').join('\n\n');
        
      if (fullText.trim().length === 0) {
        console.log('  ⚠️ Reconstructed text is empty.');
        continue;
      }
      
      console.log(`  📝 Text length: ${fullText.length} chars`);
      await client.query('UPDATE manuscripts SET full_text = $1, updated_at = NOW() WHERE id = $2', [fullText, m.id]);
      updatedCount++;
      console.log('  ✅ Updated.');
    }
    console.log(`\n🎉 Finished. Updated ${updatedCount}/${manuscripts.length} manuscripts.`);
    client.release();
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
    process.exit(0); 
  }
}

fixFullText();

/* 
Old code below ignored

const { Pinecone } = require('@pinecone-database/pinecone');

async function check() {
  console.log('Checking API Key...', process.env.PINECONE_API_KEY ? 'Present' : 'Missing');
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const idx = pc.index(process.env.PINECONE_INDEX_NAME || 'nala-pustaka');
  const stats = await idx.describeIndexStats();
  console.log('?? Total Vectors in Pinecone:', stats.totalRecordCount);
}

check();
*/
