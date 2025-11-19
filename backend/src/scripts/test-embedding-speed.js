/**
 * Phase 8 with DETAILED LOGGING - Debug slow embeddings
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const logger = require('../utils/logger');
const checkpointService = require('../services/checkpointService');
const chunker = require('../services/chunker');
const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');

async function testEmbeddingSpeed() {
  try {
    logger.info('========================================');
    logger.info('🧪 TESTING EMBEDDING SPEED');
    logger.info('========================================');
    
    // Load checkpoint
    logger.info('📂 Loading manuscripts from checkpoint...');
    const checkpoint = await checkpointService.load(4);
    
    if (!checkpoint || !checkpoint.mergeResult) {
      throw new Error('No checkpoint found!');
    }
    
    const manuscripts = checkpoint.mergeResult.manuscripts;
    logger.info(`✅ Loaded ${manuscripts.length} manuscripts`);
    
    // Step 1: Chunk (just first 10 manuscripts for testing)
    logger.info('');
    logger.info('✂️  Chunking first 10 manuscripts for speed test...');
    const testManuscripts = manuscripts.slice(0, 10).map(m => ({
      manuscriptId: m.id,
      title: m.title,
      author: m.author || 'Tidak Diketahui',
      year: m.year || '',
      url: m.source_url || '',
      fullText: m.full_text || '',
      filename: m.title
    }));
    
    const chunks = chunker.chunkManuscripts(testManuscripts);
    logger.info(`✅ Created ${chunks.length} chunks from 10 manuscripts`);
    
    // Step 2: Test embedding speed with different batch sizes
    logger.info('');
    logger.info('🧠 Testing embedding generation speed...');
    logger.info('Testing with small sample to measure speed...');
    
    const testChunks = chunks.slice(0, 60); // Test with 60 chunks
    const texts = testChunks.map(c => c.chunkText);
    
    logger.info(`Testing ${texts.length} embeddings...`);
    
    const startTime = Date.now();
    
    // Test with optimized settings
    const embeddings = await embeddingService.generateBatchEmbeddings(texts, 20);
    
    const duration = (Date.now() - startTime) / 1000;
    const rate = texts.length / duration;
    
    logger.info('');
    logger.info('========================================');
    logger.info('📊 SPEED TEST RESULTS');
    logger.info('========================================');
    logger.info(`✅ Generated ${embeddings.length} embeddings`);
    logger.info(`⏱️  Duration: ${duration.toFixed(1)} seconds`);
    logger.info(`🚀 Speed: ${rate.toFixed(2)} embeddings/sec`);
    logger.info('');
    logger.info(`📈 Estimated time for ${chunks.length} chunks:`);
    const estimatedSeconds = chunks.length / rate;
    logger.info(`   ${(estimatedSeconds / 60).toFixed(1)} minutes`);
    logger.info('');
    logger.info(`📈 Estimated time for ALL 48,226 chunks:`);
    const fullEstimate = 48226 / rate;
    logger.info(`   ${(fullEstimate / 60).toFixed(1)} minutes (${(fullEstimate / 3600).toFixed(1)} hours)`);
    logger.info('========================================');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ TEST FAILED:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}

testEmbeddingSpeed();
