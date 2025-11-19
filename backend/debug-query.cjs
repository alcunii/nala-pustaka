const vectorDB = require('./src/services/vectorDB');
const embeddingService = require('./src/services/embedding');

(async () => {
  console.log('🔍 Testing manuscript-specific query...\n');
  
  // Test query untuk Babad Mataram
  const testQuery = 'apa isi naskah ini';
  const testEmbed = await embeddingService.generateEmbedding(testQuery);
  
  console.log('Query:', testQuery);
  console.log('Target: Babad Mataram (18a93590-a700-4c75-ba6a-8ed9a4f3f76f)\n');
  
  // Query tanpa filter
  const allResults = await vectorDB.query(testEmbed, { topK: 10, includeMetadata: true });
  
  console.log('Top 10 results (no filter):');
  allResults.forEach((r, i) => {
    console.log(`${i+1}. ${r.metadata.title}`);
    console.log('   UUID:', r.metadata.manuscriptId);
    console.log('   Score:', (r.score * 100).toFixed(1) + '%');
  });
  
  console.log('\n🔍 Checking if Babad Mataram chunks exist:');
  const babadMataram = allResults.filter(r => 
    r.metadata.manuscriptId === '18a93590-a700-4c75-ba6a-8ed9a4f3f76f' ||
    r.metadata.title?.toLowerCase().includes('babad mataram')
  );
  
  console.log('Found:', babadMataram.length, 'chunks from Babad Mataram');
})();
