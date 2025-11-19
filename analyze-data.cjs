const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://eosclaiinbnebgrjsgsp.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2NsYWlpbmJuZWJncmpzZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDU0NTEsImV4cCI6MjA3ODQ4MTQ1MX0.m9GR6732A5MwgafqkdghCTgbX0Y9ddHKWbJSA1Ccqpg'
);

(async () => {
  // Count total manuscripts
  const { count: totalCount } = await supabase
    .from('manuscripts')
    .select('*', { count: 'exact', head: true });
  
  // Count manuscripts with full_text
  const { count: withFullText } = await supabase
    .from('manuscripts')
    .select('*', { count: 'exact', head: true })
    .not('full_text', 'is', null);
  
  // Sample data
  const { data: samples } = await supabase
    .from('manuscripts')
    .select('title, full_text')
    .not('full_text', 'is', null)
    .limit(3);
  
  console.log('📊 SUPABASE DATA ANALYSIS:');
  console.log('==========================');
  console.log('Total manuscripts:', totalCount);
  console.log('Manuscripts with full_text:', withFullText);
  console.log('Manuscripts WITHOUT full_text:', totalCount - withFullText);
  console.log('');
  console.log('📝 Sample full_text lengths:');
  samples.forEach((m, i) => {
    console.log(`  ${i+1}. ${m.title}`);
    console.log(`     Length: ${m.full_text?.length || 0} characters`);
  });
  console.log('');
  console.log('⚠️  IMPACT ANALYSIS:');
  console.log('Current Pinecone: ~1061 vectors');
  console.log('After ingestion: ~' + (withFullText * 15) + '-' + (withFullText * 25) + ' vectors');
  console.log('(Estimate: ' + withFullText + ' manuscripts × 15-25 chunks/manuscript)');
})();
