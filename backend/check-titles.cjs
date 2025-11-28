const vdb = require('./src/services/vectorDB');
const emb = require('./src/services/embedding');

(async () => {
  const e = await emb.generateEmbedding('test');
  const r = await vdb.query(e, { topK: 10, includeMetadata: true });
  
  console.log('Sample Pinecone titles:');
  const uniqueTitles = [...new Set(r.map(m => m.metadata.title))];
  uniqueTitles.slice(0, 10).forEach(t => console.log(' -', t));
})();
