/**
 * Migrate Supabase Schema
 * Adds clustering-related columns to manuscripts table
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function migrateSchema() {
  logger.info('========================================');
  logger.info('🔧 Migrating Supabase schema...');
  logger.info('========================================');

  try {
    // Note: Since we're using Supabase client (not direct SQL), 
    // we'll just verify the schema and log SQL for manual execution

    logger.info('📋 Required SQL migrations:');
    logger.info('');
    logger.info('Execute this SQL in your Supabase SQL editor:');
    logger.info('');
    logger.info(`
-- Add clustering columns to manuscripts table
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS cluster_id TEXT,
ADD COLUMN IF NOT EXISTS source_manuscript_ids TEXT[],
ADD COLUMN IF NOT EXISTS is_clustered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cluster_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS merge_strategy TEXT,
ADD COLUMN IF NOT EXISTS llm_analysis JSONB,
ADD COLUMN IF NOT EXISTS clustering_method TEXT DEFAULT 'manual';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manuscripts_cluster_id ON manuscripts(cluster_id);
CREATE INDEX IF NOT EXISTS idx_manuscripts_is_clustered ON manuscripts(is_clustered);
CREATE INDEX IF NOT EXISTS idx_manuscripts_clustering_method ON manuscripts(clustering_method);

-- Update existing manuscripts (set defaults for new columns)
UPDATE manuscripts 
SET is_clustered = false, 
    cluster_size = 1,
    clustering_method = 'manual'
WHERE is_clustered IS NULL;
    `);

    // Try to verify by checking if we can read a manuscript
    logger.info('🔍 Verifying current schema...');
    const { data, error } = await supabase
      .from('manuscripts')
      .select('*')
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      logger.info('✅ Current columns:', columns.join(', '));

      const newColumns = [
        'description',
        'cluster_id',
        'source_manuscript_ids',
        'is_clustered',
        'cluster_size',
        'merge_strategy',
        'llm_analysis',
        'created_by'
      ];

      const missingColumns = newColumns.filter(col => !columns.includes(col));

      if (missingColumns.length > 0) {
        logger.warn('');
        logger.warn('⚠️  Missing columns:', missingColumns.join(', '));
        logger.warn('');
        logger.warn('Please execute the SQL above in Supabase SQL editor');
        logger.warn('Then run this script again to verify');
      } else {
        logger.info('');
        logger.info('✅ All clustering columns exist!');
        logger.info('Schema is ready for clustering migration');
      }
    }

    logger.info('========================================');
    logger.info('✅ Schema check completed!');
    logger.info('========================================');

  } catch (error) {
    logger.error('❌ Error checking schema:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  migrateSchema()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = migrateSchema;