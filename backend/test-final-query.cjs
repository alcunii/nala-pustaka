const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://eosclaiinbnebgrjsgsp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2NsYWlpbmJuZWJncmpzZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDU0NTEsImV4cCI6MjA3ODQ4MTQ1MX0.m9GR6732A5MwgafqkdghCTgbX0Y9ddHKWbJSA1Ccqpg');
async function test() {
  console.log('Testing FINAL OPTIMIZED query...\n');
  console.time('Query');
  const { data, error } = await supabase.from('manuscripts').select('id, title, author, year, description, slug, source_url, is_pinned, display_order, category, created_at, updated_at');
  console.timeEnd('Query');
  if (error) {
    console.error('\nERROR:', error.message);
  } else {
    console.log('\n✅ SUCCESS!');
    console.log('Total manuscripts:', data?.length);
    console.log('\nFirst 5:');
    data?.slice(0,5).forEach((m,i) => console.log(`${i+1}. ${m.title} (${m.year || 'N/A'})`));
    console.log('\n🎉 Frontend should work now!');
  }
}
test();
