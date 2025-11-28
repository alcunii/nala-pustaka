const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://eosclaiinbnebgrjsgsp.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2NsYWlpbmJuZWJncmpzZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDU0NTEsImV4cCI6MjA3ODQ4MTQ1MX0.m9GR6732A5MwgafqkdghCTgbX0Y9ddHKWbJSA1Ccqpg'
);

(async () => {
  const testManuscripts = [
    { id: '18a93590-a700-4c75-ba6a-8ed9a4f3f76f', title: 'Babad Mataram' },
    { id: 'b1ba4845-20ad-4794-b2b5-c0697488b418', title: 'Pabrik Tasikmadu' }
  ];
  
  console.log('🔍 Checking manuscripts in Supabase:\n');
  
  for (const ms of testManuscripts) {
    const { data, error } = await supabase
      .from('manuscripts')
      .select('id, title, full_text')
      .eq('id', ms.id)
      .single();
    
    if (error) {
      console.log(`❌ ${ms.title}: NOT FOUND`);
      continue;
    }
    
    console.log(`📜 ${data.title}`);
    console.log('   ID:', data.id);
    console.log('   Has full_text:', !!data.full_text);
    console.log('   Text length:', data.full_text?.length || 0, 'chars');
    
    if (data.full_text && data.full_text.length > 100) {
      console.log('   Preview:', data.full_text.substring(0, 100) + '...');
    }
    console.log('');
  }
})();
