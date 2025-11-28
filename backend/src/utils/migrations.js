const db = require('../config/database');
const logger = require('./logger');

/**
 * Run database migrations to ensure schema compatibility
 */
async function runMigrations() {
  try {
    logger.info('Checking database migrations...');

    // 1. Check for 'tags' column in 'manuscripts' table
    const checkTagsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'manuscripts' AND column_name = 'tags'
    `;
    
    const { rows: tagsRows } = await db.query(checkTagsQuery);
    
    if (tagsRows.length === 0) {
      logger.info('Migration: Adding "tags" column to manuscripts table...');
      const alterQuery = `
        ALTER TABLE manuscripts 
        ADD COLUMN tags TEXT[] DEFAULT '{}'
      `;
      await db.query(alterQuery);
      logger.info('Migration: Successfully added "tags" column.');
    } else {
      logger.info('Migration: "tags" column already exists.');
    }

    // 2. Check for 'content_quality' column (used in sorting)
    const checkQualityQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'manuscripts' AND column_name = 'content_quality'
    `;

    const { rows: qualityRows } = await db.query(checkQualityQuery);

    if (qualityRows.length === 0) {
      logger.info('Migration: Adding "content_quality" column to manuscripts table...');
      const alterQualityQuery = `
        ALTER TABLE manuscripts 
        ADD COLUMN content_quality VARCHAR(50) DEFAULT 'medium'
      `;
      await db.query(alterQualityQuery);
      logger.info('Migration: Successfully added "content_quality" column.');
    }

    logger.info('Database migrations completed.');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error; // Re-throw to prevent server from starting with invalid schema
  }
}

module.exports = { runMigrations };