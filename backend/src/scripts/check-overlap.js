/**
 * Check Overlap between Existing and New Manuscripts
 * Compares titles to find potential duplicates
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

// Simple similarity function (Levenshtein-like)
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

async function checkOverlap() {
  try {
    logger.info('========================================');
    logger.info('🔍 Checking overlap between existing and new manuscripts...');
    logger.info('========================================');

    // Step 1: Load existing manuscripts from Supabase
    logger.info('📖 Step 1: Loading existing manuscripts...');
    const { data: existingManuscripts, error } = await supabase
      .from('manuscripts')
      .select('id, title, author');

    if (error) throw error;
    logger.info(`✅ Loaded ${existingManuscripts.length} existing manuscripts`);

    // Step 2: Load new manuscripts from data_naskah_sastra_org
    logger.info('📖 Step 2: Loading new manuscripts from files...');
    const dataDir = path.join(__dirname, '../../../data_naskah_sastra_org');
    const newManuscripts = [];

    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.txt')) {
          // Parse title from filename (format: "0001_Title, Author, Year, #ID.txt")
          const filename = item.replace('.txt', '');
          const parts = filename.split('_');
          if (parts.length > 1) {
            const titlePart = parts[1].split(',')[0].trim();
            newManuscripts.push({
              filename: item,
              title: titlePart,
              fullPath: fullPath
            });
          }
        }
      }
    }

    scanDirectory(dataDir);
    logger.info(`✅ Found ${newManuscripts.length} new manuscripts`);

    // Step 3: Compare for overlaps
    logger.info('🔍 Step 3: Checking for overlaps (similarity > 85%)...');
    const overlaps = [];
    const similarityThreshold = 0.85;

    for (const existing of existingManuscripts) {
      for (const newMs of newManuscripts) {
        const sim = similarity(existing.title, newMs.title);
        if (sim >= similarityThreshold) {
          overlaps.push({
            existingTitle: existing.title,
            newTitle: newMs.title,
            similarity: (sim * 100).toFixed(1) + '%',
            existingId: existing.id,
            newFile: newMs.filename
          });
        }
      }
    }

    logger.info(`✅ Found ${overlaps.length} potential overlaps`);

    // Step 4: Display results
    logger.info('========================================');
    logger.info('📊 OVERLAP ANALYSIS:');
    logger.info('========================================');
    logger.info(`Existing manuscripts: ${existingManuscripts.length}`);
    logger.info(`New manuscripts: ${newManuscripts.length}`);
    logger.info(`Potential overlaps: ${overlaps.length}`);
    logger.info('');

    if (overlaps.length > 0) {
      logger.info('🔍 Potential Duplicates:');
      overlaps.forEach((overlap, i) => {
        logger.info(`\n${i + 1}. Similarity: ${overlap.similarity}`);
        logger.info(`   Existing: "${overlap.existingTitle}"`);
        logger.info(`   New:      "${overlap.newTitle}"`);
      });
    } else {
      logger.info('✅ No overlaps found! All new manuscripts are unique.');
    }

    // Step 5: Save report
    const reportFile = path.join(__dirname, '../../../backups', 'overlap_report.json');
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      existingCount: existingManuscripts.length,
      newCount: newManuscripts.length,
      overlapCount: overlaps.length,
      overlaps: overlaps
    }, null, 2));
    logger.info(`\n📄 Report saved to: ${reportFile}`);

    logger.info('========================================');
    logger.info('✅ Overlap check completed!');
    logger.info('========================================');

    return {
      existingCount: existingManuscripts.length,
      newCount: newManuscripts.length,
      overlapCount: overlaps.length,
      overlaps
    };

  } catch (error) {
    logger.error('❌ Error during overlap check:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkOverlap()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = checkOverlap;