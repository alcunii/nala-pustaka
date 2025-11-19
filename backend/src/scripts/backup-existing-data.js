/**
 * Backup Existing Manuscripts
 * Exports all current manuscripts from Supabase before clustering migration
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function backupExistingData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../../backups');
  
  try {
    logger.info('========================================');
    logger.info('💾 Starting backup of existing manuscripts...');
    logger.info('========================================');

    // Create backup directory if not exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info('✅ Created backup directory');
    }

    // Step 1: Get count
    logger.info('📊 Step 1: Checking manuscript count...');
    const { count, error: countError } = await supabase
      .from('manuscripts')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    logger.info(`✅ Found ${count} manuscripts to backup`);

    if (count === 0) {
      logger.warn('⚠️  No manuscripts found to backup!');
      return;
    }

    // Step 2: Fetch all manuscripts
    logger.info('📖 Step 2: Fetching all manuscripts...');
    const { data: manuscripts, error } = await supabase
      .from('manuscripts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    logger.info(`✅ Fetched ${manuscripts.length} manuscripts`);

    // Step 3: Save to file
    const backupFile = path.join(backupDir, `manuscripts_backup_${timestamp}.json`);
    logger.info('💾 Step 3: Saving to file...');
    
    fs.writeFileSync(backupFile, JSON.stringify(manuscripts, null, 2), 'utf8');
    logger.info(`✅ Saved to: ${backupFile}`);

    // Step 4: Create summary report
    const summary = {
      backupDate: new Date().toISOString(),
      totalManuscripts: manuscripts.length,
      manuscripts: manuscripts.map(m => ({
        id: m.id,
        title: m.title,
        author: m.author || 'Unknown',
        year: m.year || 'N/A',
        hasFullText: !!m.full_text,
        textLength: m.full_text ? m.full_text.length : 0,
        createdAt: m.created_at
      }))
    };

    const summaryFile = path.join(backupDir, `backup_summary_${timestamp}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
    logger.info(`✅ Summary saved to: ${summaryFile}`);

    // Step 5: Display summary
    logger.info('========================================');
    logger.info('📊 BACKUP SUMMARY:');
    logger.info('========================================');
    logger.info(`Total manuscripts: ${manuscripts.length}`);
    logger.info(`Backup file: ${backupFile}`);
    logger.info(`File size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
    logger.info('');
    logger.info('Sample manuscripts:');
    manuscripts.slice(0, 10).forEach((m, i) => {
      logger.info(`  ${i + 1}. ${m.title}`);
      logger.info(`     Author: ${m.author || 'Unknown'}`);
      logger.info(`     Text length: ${m.full_text ? m.full_text.length : 0} chars`);
    });
    
    if (manuscripts.length > 10) {
      logger.info(`  ... and ${manuscripts.length - 10} more`);
    }

    logger.info('========================================');
    logger.info('✅ Backup completed successfully!');
    logger.info('========================================');

    return {
      success: true,
      count: manuscripts.length,
      backupFile,
      summaryFile,
      manuscripts
    };

  } catch (error) {
    logger.error('❌ Error during backup:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  backupExistingData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = backupExistingData;