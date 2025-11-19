/**
 * DEBUG Script - Test Supabase Insert
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { createClient } = require('@supabase/supabase-js');
const checkpointService = require('../services/checkpointService');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function debugSupabase() {
  console.log('='.repeat(50));
  console.log('SUPABASE DEBUG TEST');
  console.log('='.repeat(50));
  
  // Test 1: Simple insert
  console.log('\n1. Testing simple insert...');
  try {
    const testData = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'DEBUG TEST',
      author: 'Test Author',
      year: '2024',
      source_url: 'http://test.com',
      full_text: 'Test content',
      description: 'Test description'
    };
    
    const { data, error } = await supabase
      .from('manuscripts')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('❌ FAILED:');
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log('✅ SUCCESS!');
      console.log('   Inserted:', data.length, 'rows');
      
      // Clean up
      await supabase.from('manuscripts').delete().eq('id', testData.id);
    }
  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
  }
  
  // Test 2: Load checkpoint and try first manuscript
  console.log('\n2. Testing checkpoint manuscript...');
  try {
    const checkpoint = await checkpointService.load(4);
    if (!checkpoint || !checkpoint.mergeResult) {
      console.error('❌ No checkpoint found!');
      return;
    }
    
    const manuscripts = checkpoint.mergeResult.manuscripts;
    console.log('   Loaded:', manuscripts.length, 'manuscripts');
    
    if (manuscripts.length > 0) {
      const first = manuscripts[0];
      console.log('\n   First manuscript:');
      console.log('   - Title:', first.title);
      console.log('   - Author:', first.author);
      console.log('   - Keys:', Object.keys(first).join(', '));
      console.log('   - Has description:', !!first.description);
      console.log('   - Full text length:', first.full_text?.length || 0);
      
      // Check for problematic fields
      const problematicFields = [];
      if (!first.id) problematicFields.push('id');
      if (!first.title) problematicFields.push('title');
      if (!first.full_text) problematicFields.push('full_text');
      
      if (problematicFields.length > 0) {
        console.error('   ⚠️  Missing required fields:', problematicFields.join(', '));
      }
      
      // Try insert
      console.log('\n   Attempting insert...');
      const { data, error } = await supabase
        .from('manuscripts')
        .insert([first])
        .select();
      
      if (error) {
        console.error('   ❌ FAILED:');
        console.error('      Code:', error.code);
        console.error('      Message:', error.message);
        console.error('      Details:', error.details);
        console.error('      Hint:', error.hint);
      } else {
        console.log('   ✅ SUCCESS!');
        // Clean up
        await supabase.from('manuscripts').delete().eq('id', first.id);
      }
    }
  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
    console.error('   Stack:', err.stack);
  }
  
  console.log('\n' + '='.repeat(50));
}

debugSupabase();
