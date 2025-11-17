/**
 * Check Supabase Schema
 * Verify if manuscripts table has all required columns
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('\n🔍 Checking Supabase schema...\n');
  
  try {
    // Try to query one row to see what columns exist
    const { data, error } = await supabase
      .from('manuscripts')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table "manuscripts" does not exist');
        console.log('\n📝 SQL to create table:');
        console.log(getSQLCreateTable());
        return;
      }
      throw error;
    }
    
    console.log('✅ Table "manuscripts" exists');
    
    if (data && data.length > 0) {
      console.log(`✅ Table has ${Object.keys(data[0]).length} columns:\n`);
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
      
      // Check required columns
      const required = ['manuscript_id', 'title', 'author', 'full_text'];
      const missing = required.filter(col => !Object.keys(data[0]).includes(col));
      
      if (missing.length > 0) {
        console.log(`\n⚠️  Missing required columns: ${missing.join(', ')}`);
        console.log('\n📝 SQL to add missing columns:');
        missing.forEach(col => {
          console.log(getSQLAddColumn(col));
        });
      } else {
        console.log('\n✅ All required columns present!');
      }
    } else {
      console.log('⚠️  Table is empty, cannot detect columns');
      console.log('   Assuming standard schema...');
    }
    
    // Check count
    const { count, error: countError } = await supabase
      .from('manuscripts')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📊 Current manuscript count: ${count || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function getSQLCreateTable() {
  return `
CREATE TABLE manuscripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  year TEXT,
  source_url TEXT,
  full_text TEXT,
  chunk_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  slug TEXT,
  is_pinned BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_manuscript_id ON manuscripts(manuscript_id);
CREATE INDEX idx_slug ON manuscripts(slug);
  `.trim();
}

function getSQLAddColumn(colName) {
  const sqls = {
    manuscript_id: "ALTER TABLE manuscripts ADD COLUMN manuscript_id TEXT;",
    full_text: "ALTER TABLE manuscripts ADD COLUMN full_text TEXT;",
    chunk_count: "ALTER TABLE manuscripts ADD COLUMN chunk_count INTEGER DEFAULT 0;",
    token_count: "ALTER TABLE manuscripts ADD COLUMN token_count INTEGER DEFAULT 0;"
  };
  return sqls[colName] || `ALTER TABLE manuscripts ADD COLUMN ${colName} TEXT;`;
}

checkSchema().then(() => process.exit(0));
