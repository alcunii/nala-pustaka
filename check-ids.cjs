const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://eosclaiinbnebgrjsgsp.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2NsYWlpbmJuZWJncmpzZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDU0NTEsImV4cCI6MjA3ODQ4MTQ1MX0.m9GR6732A5MwgafqkdghCTgbX0Y9ddHKWbJSA1Ccqpg'
);

supabase.from('manuscripts').select('id,title').limit(3).then(r => {
  console.log('Sample manuscripts:');
  r.data.forEach(m => {
    console.log('UUID:', m.id);
    console.log('Title:', m.title);
    console.log('');
  });
}).catch(e => console.error('Error:', e.message));
