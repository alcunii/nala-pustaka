/**
 * Test Script - Verify all API connections
 * Run this before ingestion to ensure everything works
 */

const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');
const logger = require('../utils/logger');
const config = require('../config');

async function testEmbeddingService() {
  logger.info('Testing HuggingFace Embedding Service...');
  
  try {
    const testText = 'Ini adalah teks percobaan untuk menguji embedding service.';
    logger.info('Test text: "' + testText + '"');
    
    const embedding = await embeddingService.generateEmbedding(testText);
    
    logger.info('✅ Embedding generated successfully!');
    logger.info('   - Dimension: ' + embedding.length);
    logger.info('   - First 5 values: [' + embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ') + '...]');
    logger.info('   - Model: ' + config.huggingface.model);
    
    return true;
  } catch (error) {
    logger.error('❌ Embedding service test FAILED:', error.message);
    logger.error('Possible issues:');
    logger.error('  1. HF_API_KEY is invalid or expired');
    logger.error('  2. Network/firewall blocking HuggingFace API');
    logger.error('  3. Model is not available');
    logger.error('');
    logger.error('Please:');
    logger.error('  - Check your HF_API_KEY in .env');
    logger.error('  - Get a new key from: https://huggingface.co/settings/tokens');
    logger.error('  - Ensure you have internet connection');
    return false;
  }
}

async function testVectorDB() {
  logger.info('Testing Pinecone Vector Database...');
  
  try {
    await vectorDB.initialize();
    const stats = await vectorDB.getStats();
    
    logger.info('✅ Pinecone connected successfully!');
    logger.info('   - Index: ' + config.pinecone.indexName);
    logger.info('   - Total vectors: ' + (stats.totalRecordCount || 0));
    logger.info('   - Dimensions: ' + (stats.dimension || 'N/A'));
    
    return true;
  } catch (error) {
    logger.error('❌ Pinecone test FAILED:', error.message);
    logger.error('Please check PINECONE_SETUP.md for setup instructions');
    return false;
  }
}

async function testAll() {
  logger.info('========================================');
  logger.info('🔬 Testing All Services');
  logger.info('========================================');
  logger.info('');
  
  let allPassed = true;
  
  // Test 1: Embedding Service
  const embeddingOk = await testEmbeddingService();
  logger.info('');
  
  // Test 2: Vector DB
  const vectorDBOk = await testVectorDB();
  logger.info('');
  
  allPassed = embeddingOk && vectorDBOk;
  
  // Summary
  logger.info('========================================');
  if (allPassed) {
    logger.info('✅ All services are working!');
    logger.info('You can now run: npm run ingest');
  } else {
    logger.info('❌ Some services failed. Please fix before ingestion.');
  }
  logger.info('========================================');
  
  process.exit(allPassed ? 0 : 1);
}

testAll();