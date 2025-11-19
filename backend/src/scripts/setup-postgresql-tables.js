/**
 * PostgreSQL Migration Script
 * Creates tables for educational_content and manuscript_relationships
 */

const db = require('../config/database');
const logger = require('../utils/logger');

async function setupTables() {
  const client = await db.getClient();

  try {
    logger.info('🚀 Starting PostgreSQL table setup...');

    await client.query('BEGIN');

    // 1. Create educational_content table
    logger.info('📚 Creating educational_content table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS educational_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
        content_data JSONB NOT NULL,
        token_count INTEGER,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        UNIQUE(manuscript_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_educational_content_manuscript_id 
      ON educational_content(manuscript_id)
    `);

    logger.info('✅ educational_content table created');

    // 2. Create manuscript_relationships table
    logger.info('🔗 Creating manuscript_relationships table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS manuscript_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
        related_manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL,
        relationship_data JSONB,
        strength DECIMAL(3, 2) DEFAULT 0.5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        UNIQUE(source_manuscript_id, related_manuscript_id, relationship_type)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_relationships_source 
      ON manuscript_relationships(source_manuscript_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_relationships_related 
      ON manuscript_relationships(related_manuscript_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_relationships_type 
      ON manuscript_relationships(relationship_type)
    `);

    logger.info('✅ manuscript_relationships table created');

    await client.query('COMMIT');

    logger.info('');
    logger.info('✨ PostgreSQL setup completed successfully!');
    logger.info('');
    logger.info('📋 Tables created:');
    logger.info('   ✓ educational_content');
    logger.info('   ✓ manuscript_relationships');
    logger.info('');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    logger.info('📊 All tables in database:');
    result.rows.forEach(row => {
      logger.info(`   - ${row.table_name}`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
setupTables()
  .then(() => {
    logger.info('');
    logger.info('🎉 Migration completed! You can now use PostgreSQL instead of Supabase.');
    process.exit(0);
  })
  .catch((err) => {
    logger.error('Migration error:', err);
    process.exit(1);
  });
