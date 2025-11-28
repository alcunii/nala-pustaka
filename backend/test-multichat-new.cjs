const multiChatService = require('./src/services/multiChatService');

const testManuscripts = [
  { 
    id: 'f290469e-5369-479c-84b3-bc732933baf3', 
    title: 'Serat Tatacara', 
    author: 'Padmasusastra' 
  },
  { 
    id: '3876ebfc-4d66-4e1c-ab93-ea61790e907a', 
    title: 'I. Babad Alit; II. Jumênêngipun Cungkup Ing Pasarean Kuthagêdhe', 
    author: 'PrawirawinarsaJayèngpranata' 
  }
];

const testQuery = 'Cerita tentang apa saja naskah ini?';

console.log('🧪 Testing multi-chat with NEW UUID data...\n');
console.log('Manuscripts:', testManuscripts.map(m => m.title).join(' + '));
console.log('Query:', testQuery);
console.log('\nExecuting...\n');

multiChatService.chatWithMultipleManuscripts(testManuscripts, testQuery, [])
  .then(result => {
    console.log('✅ SUCCESS!');
    console.log('Chunks used:', result.metadata.chunksUsed);
    console.log('Processing time:', result.metadata.processingTimeSeconds.toFixed(2) + 's');
    console.log('\nAnswer preview:');
    console.log(result.answer.substring(0, 400) + '...');
    console.log('\nSources:', result.sources.length, 'chunks');
    result.sources.forEach((s, i) => {
      console.log(`  ${i+1}. ${s.manuscriptTitle} (${(s.relevance * 100).toFixed(1)}%)`);
    });
  })
  .catch(error => {
    console.error('❌ ERROR:', error.message);
  });
