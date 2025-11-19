const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://eosclaiinbnebgrjsgsp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2NsYWlpbmJuZWJncmpzZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDU0NTEsImV4cCI6MjA3ODQ4MTQ1MX0.m9GR6732A5MwgafqkdghCTgbX0Y9ddHKWbJSA1Ccqpg');
async function test() {
  console.log('Testing frontend data access...\n');
  const { data, error, count } = await supabase.from('manuscripts').select('*', { count: 'exact' }).limit(10);
  if (error) { console.error('ERROR:', error); return; }
  console.log(`Total: ${count} manuscripts`);
  console.log(`\nFirst 5:`);
  data?.slice(0,5).forEach((m,i) => console.log(`${i+1}. ${m.title}`));
  console.log('\n✅ Frontend CAN access data!');
}
test();
