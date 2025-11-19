require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const checkpointService = require('./src/services/checkpointService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function quickSync() {
  console.log('🚀 QUICK SYNC\n');
  try {
    const checkpoint = await checkpointService.load(4);
    const manuscripts = checkpoint.mergeResult.manuscripts;
    console.log('✅ Loaded', manuscripts.length, 'manuscripts\n');

    await supabase.from('manuscripts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let saved = 0;
    for (let i = 0; i < manuscripts.length; i += 10) {
      const batch = manuscripts.slice(i, i + 10);
      const { data, error } = await supabase.from('manuscripts').insert(batch);
      if (error) {
        console.error('❌ Batch', i, 'error:', error.message, error.code);
      } else {
        saved += batch.length;
        if (saved % 50 === 0) console.log('  ', saved, '/', manuscripts.length);
      }
      await new Promise(r => setTimeout(r, 100));
    }
    console.log('\n✅ Saved:', saved, '/', manuscripts.length);
  } catch (e) {
    console.error('❌', e.message);
  }
}
quickSync();
