/**
 * Test PostgreSQL Database Connection
 * Quick script to verify database setup
 */

const db = require('../config/database');
const logger = require('../utils/logger');

async function testConnection() {
  try {
    logger.info('🔍 Testing PostgreSQL connection...');
    logger.info('');

    // Test 1: Basic connection
    const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
    logger.info('✅ Connection successful!');
    logger.info(`   Current Time: ${result.rows[0].current_time}`);
    logger.info(`   PostgreSQL Version: ${result.rows[0].pg_version.split(' ')[0]}`);
    logger.info('');

    // Test 2: Check database
    const dbResult = await db.query('SELECT current_database() as db_name');
    logger.info(`📊 Connected to database: ${dbResult.rows[0].db_name}`);
    logger.info('');

    // Test 3: List all tables
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      logger.info(`📋 Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => {
        logger.info(`   - ${row.table_name}`);
      });
    } else {
      logger.warn('⚠️  No tables found. Run migration script:');
      logger.warn('   node src/scripts/setup-postgresql-tables.js');
    }
    logger.info('');

    // Test 4: Check required tables
    const requiredTables = ['manuscripts', 'educational_content', 'manuscript_relationships'];
    const existingTables = tablesResult.rows.map(r => r.table_name);

    logger.info('🔍 Checking required tables:');
    let allTablesExist = true;
    for (const table of requiredTables) {
      const exists = existingTables.includes(table);
      const status = exists ? '✅' : '❌';
      logger.info(`   ${status} ${table}`);
      if (!exists) allTablesExist = false;
    }
    logger.info('');

    if (allTablesExist) {
      logger.info('🎉 All required tables exist!');

      // Test 5: Count records
      logger.info('');
      logger.info('📊 Table statistics:');
      for (const table of requiredTables) {
        const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        logger.info(`   - ${table}: ${countResult.rows[0].count} records`);
      }
    } else {
      logger.warn('⚠️  Some tables are missing. Run migration script:');
      logger.warn('   node src/scripts/setup-postgresql-tables.js');
    }

    logger.info('');
    logger.info('✨ Database test completed!');

  } catch (error) {
    logger.error('');
    logger.error('❌ Database connection failed!');
    logger.error('');
    logger.error('Error details:', error.message);
    logger.error('');

    // Helpful troubleshooting
    if (error.message.includes('password authentication failed')) {
      logger.error('💡 Troubleshooting:');
      logger.error('   1. Check DB_PASSWORD in your .env file');
      logger.error('   2. Verify PostgreSQL user credentials');
      logger.error('   3. Reset password if needed');
    } else if (error.message.includes('ECONNREFUSED')) {
      logger.error('💡 Troubleshooting:');
      logger.error('   1. Check if PostgreSQL is running');
      logger.error('   2. For Docker: docker-compose up -d');
      logger.error('   3. For local: Start PostgreSQL service');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      logger.error('💡 Troubleshooting:');
      logger.error('   1. Create database: psql -U postgres -c "CREATE DATABASE nala_pustaka"');
      logger.error('   2. Or use Docker setup (automatic database creation)');
    }

    logger.error('');
    throw error;
  }
}

// Run test
testConnection()
  .then(() => {
    logger.info('');
    logger.info('✅ All checks passed! Database is ready.');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
