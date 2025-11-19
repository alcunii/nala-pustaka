require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const checkpointService = require('./src/services/checkpointService');

// Use SERVICE_ROLE_KEY for higher limits
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickSync() {
  console.log('🚀 QUICK SYNC WITH SERVICE ROLE\n');
  try {
    const checkpoint = await checkpointService.load(4);
    const manuscripts = checkpoint.mergeResult.manuscripts;
    console.log('✅ Loaded', manuscripts.length, 'manuscripts\n');
    console.log('⏳ This will take ~5-10 minutes (one-by-one insert)...\n');

    await supabase.from('manuscripts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let saved = 0;
    let errors = 0;
    
    // Insert ONE at a time due to large full_text
    for (let i = 0; i < manuscripts.length; i++) {
      const m = manuscripts[i];
      const { data, error } = await supabase.from('manuscripts').insert([m]);
      
      if (error) {
        console.error('❌', i, error.message.substring(0, 80));
        errors++;
      } else {
        saved++;
        if (saved % 25 === 0) console.log('   Progress:', saved, '/', manuscripts.length);
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
    
    console.log('\n✅ Saved:', saved, '/', manuscripts.length);
    if (errors > 0) console.log('❌ Errors:', errors);
    console.log('\n🎉 Done! Check Admin Dashboard!\n');
  } catch (e) {
    console.error('❌', e.message);
  }
}
quickSync();
