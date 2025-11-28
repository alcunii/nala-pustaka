const multiChatService = require('./src/services/multiChatService');

const testManuscripts = [
  { id: 'test-1', title: 'Sêrat Jăngka Jayabaya', author: 'Sèh Bakir' },
  { id: 'test-2', title: 'Cariyos Purwalelana', author: 'Candranagara' }
];

const testQuery = 'Cerita tentang apa saja naskah ini?';

console.log('Testing multi-chat with title matching...\n');
console.log('Manuscripts:', testManuscripts.map(m => m.title).join(', '));
console.log('Query:', testQuery);
console.log('\nExecuting...\n');

multiChatService.chatWithMultipleManuscripts(testManuscripts, testQuery, [])
  .then(result => {
    console.log('SUCCESS!');
    console.log('Chunks used:', result.metadata.chunksUsed);
    console.log('Processing time:', result.metadata.processingTimeSeconds.toFixed(2) + 's');
    console.log('\nAnswer preview:');
    console.log(result.answer.substring(0, 300) + '...');
    console.log('\nSources:', result.sources.length, 'chunks');
  })
  .catch(error => {
    console.error('ERROR:', error.message);
  });
