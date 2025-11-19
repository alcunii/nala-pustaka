const vdb = require('./src/services/vectorDB');
const emb = require('./src/services/embedding');

(async () => {
  try {
    const e = await emb.generateEmbedding('test');
    const r = await vdb.query(e, { topK: 3, includeMetadata: true });
    
    console.log('Sample results:');
    r.forEach((m, i) => {
      console.log(`${i + 1}. ID:`, m.id);
      console.log('   Metadata keys:', Object.keys(m.metadata));
      console.log('   manuscriptId:', m.metadata.manuscriptId);
      console.log('   manuscript_id:', m.metadata.manuscript_id);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
