/**
 * Clear Educational Content Cache
 * 
 * Usage:
 *   node src/scripts/clear-educational-cache.js                    # Clear all cache
 *   node src/scripts/clear-educational-cache.js <manuscript-id>    # Clear specific manuscript
 *   node src/scripts/clear-educational-cache.js --old 7            # Clear cache older than 7 days
 */

require('dotenv').config();
const db = require('../config/database');
const logger = require('../utils/logger');

async function clearCache(options = {}) {
  const { manuscriptId, olderThanDays, dryRun = false } = options;

  try {
    logger.info('Connected to database');

    let query;
    let params = [];
    let description;

    if (manuscriptId) {
      // Clear specific manuscript
      query = 'SELECT manuscript_id, generated_at FROM educational_content WHERE manuscript_id = $1';
      params = [manuscriptId];
      description = `manuscript ${manuscriptId}`;
    } else if (olderThanDays) {
      // Clear old cache
      query = `SELECT manuscript_id, generated_at FROM educational_content 
               WHERE generated_at < NOW() - INTERVAL '${olderThanDays} days'`;
      description = `cache older than ${olderThanDays} days`;
    } else {
      // Clear all cache
      query = 'SELECT manuscript_id, generated_at FROM educational_content';
      description = 'all cache';
    }

    // Get records to be deleted
    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      logger.info(`No cache entries found for ${description}`);
      return;
    }

    logger.info(`Found ${rows.length} cache entries for ${description}`);
    
    if (dryRun) {
      logger.info('DRY RUN - Would delete:');
      rows.forEach((row, idx) => {
        logger.info(`  ${idx + 1}. ${row.manuscript_id} (generated: ${row.generated_at})`);
      });
      logger.info('Run without --dry-run to actually delete');
      return;
    }

    // Delete cache entries
    let deleteQuery;
    let deleteParams = [];

    if (manuscriptId) {
      deleteQuery = 'DELETE FROM educational_content WHERE manuscript_id = $1';
      deleteParams = [manuscriptId];
    } else if (olderThanDays) {
      deleteQuery = `DELETE FROM educational_content WHERE generated_at < NOW() - INTERVAL '${olderThanDays} days'`;
    } else {
      deleteQuery = 'DELETE FROM educational_content';
    }

    const result = await db.query(deleteQuery, deleteParams);
    logger.info(`✓ Successfully deleted ${result.rowCount} cache entries`);

  } catch (error) {
    logger.error('Failed to clear cache:', error);
    throw error;
  } finally {
    await db.pool.end();
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    manuscriptId: null,
    olderThanDays: null
  };

  // Check for --old flag
  const oldIndex = args.indexOf('--old');
  if (oldIndex !== -1 && args[oldIndex + 1]) {
    options.olderThanDays = parseInt(args[oldIndex + 1], 10);
  }

  // Check for manuscript ID (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const manuscriptIdArg = args.find(arg => uuidRegex.test(arg));
  if (manuscriptIdArg) {
    options.manuscriptId = manuscriptIdArg;
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();

  console.log('Educational Content Cache Cleaner');
  console.log('==================================\n');

  if (options.dryRun) {
    console.log('MODE: DRY RUN (no actual deletion)\n');
  }

  clearCache(options)
    .then(() => {
      console.log('\n✓ Cache clearing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Cache clearing failed:', error.message);
      process.exit(1);
    });
}

module.exports = { clearCache };