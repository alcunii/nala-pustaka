const vectorDB = require('./src/services/vectorDB');

(async () => {
  const stats = await vectorDB.getStats();
  console.log('📊 Pinecone Stats:');
  console.log('Total vectors:', stats.totalRecordCount);
  
  // Get sample to see unique manuscripts
  const testEmbed = Array(1536).fill(0); // Dummy embedding (1536 for OpenAI)
  const samples = await vectorDB.query(testEmbed, { topK: 100, includeMetadata: true });
  
  const uniqueManuscripts = [...new Set(samples.map(s => s.metadata.title))];
  
  console.log('\n📚 Unique manuscripts in Pinecone:', uniqueManuscripts.length);
  console.log('\nList:');
  uniqueManuscripts.slice(0, 20).forEach((title, i) => {
    console.log(`  ${i+1}. ${title}`);
  });
  
  if (uniqueManuscripts.length > 20) {
    console.log(`  ... and ${uniqueManuscripts.length - 20} more`);
  }
})();
