const vectorDB = require('./src/services/vectorDB');
const embeddingService = require('./src/services/embedding');

(async () => {
  console.log('🔍 Verifying Pinecone after ingestion...\n');
  
  // Step 1: Check stats
  const stats = await vectorDB.getStats();
  console.log('📊 Pinecone Stats:');
  console.log('   Total vectors:', stats.totalRecordCount);
  console.log('');
  
  // Step 2: Test query with sample
  console.log('🧪 Testing query...');
  const testEmbed = await embeddingService.generateEmbedding('raja mataram');
  const results = await vectorDB.query(testEmbed, { topK: 5, includeMetadata: true });
  
  console.log('✅ Sample Results:');
  results.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.metadata.title}`);
    console.log('   Author:', r.metadata.author);
    console.log('   manuscriptId:', r.metadata.manuscriptId);
    console.log('   Score:', (r.score * 100).toFixed(1) + '%');
    console.log('   Chunk preview:', r.metadata.chunkText.substring(0, 100) + '...');
  });
  
  console.log('\n✅ Verification complete!');
})();
