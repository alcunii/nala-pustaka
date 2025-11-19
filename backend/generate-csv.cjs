/**
 * Generate CSV for Manual Import
 */

require('dotenv').config();
const fs = require('fs');
const vectorDB = require('./src/services/vectorDB');

async function main() {
  console.log('📊 Generating CSV for manual import...\n');
  
  try {
    await vectorDB.initialize();
    
    const dummyVector = Array(1536).fill(0);
    const samples = await vectorDB.query(dummyVector, { topK: 100, includeMetadata: true });
    
    const manuscriptMap = new Map();
    samples.forEach(chunk => {
      const id = chunk.metadata?.manuscriptId;
      if (id && !manuscriptMap.has(id)) {
        manuscriptMap.set(id, chunk.metadata);
      }
    });
    
    console.log(`Found ${manuscriptMap.size} manuscripts\n`);
    console.log('Creating CSV with basic info (no full_text)...\n');
    
    let csv = 'Title,Author,Year,URL\n';
    
    for (const [id, meta] of manuscriptMap) {
      const title = (meta.title || '').replace(/,/g, ';').replace(/"/g, '\\"\"');
      const author = (meta.author || 'Tidak Diketahui').replace(/,/g, ';');
      const year = meta.year || '';
      const url = meta.url || '';
      
      csv += `"${title}","${author}","${year}","${url}"\n`;
    }
    
    fs.writeFileSync('manuscripts-for-manual-add.csv', csv, 'utf8');
    
    console.log('✅ CSV generated: manuscripts-for-manual-add.csv');
    console.log('\n📝 You can open this in Excel and copy-paste to Admin Dashboard!\n');
    
  } catch (error) {
    console.error('❌', error.message);
  }
}

main();
