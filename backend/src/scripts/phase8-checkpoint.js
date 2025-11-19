/**
 * Phase 8 from Checkpoint - More Stable
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const logger = require('../utils/logger');
const checkpointService = require('../services/checkpointService');
const chunker = require('../services/chunker');
const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');

async function phase8FromCheckpoint() {
  try {
    logger.info('========================================');
    logger.info('☁️  PHASE 8: Pinecone Ingestion');
    logger.info('========================================');
    
    // Load from checkpoint
    logger.info('📂 Loading manuscripts from checkpoint...');
    const checkpoint = await checkpointService.load(4);
    
    if (!checkpoint || !checkpoint.mergeResult) {
      throw new Error('No checkpoint found! Run cluster-and-ingest.js first.');
    }
    
    const manuscripts = checkpoint.mergeResult.manuscripts;
    logger.info(`✅ Loaded ${manuscripts.length} manuscripts from checkpoint`);
    
    // Step 1: Chunk
    logger.info('');
    logger.info('✂️  Step 1: Chunking manuscripts...');
    const manuscriptsForChunking = manuscripts.map(m => ({
      manuscriptId: m.id,
      title: m.title,
      author: m.author || 'Tidak Diketahui',
      year: m.year || '',
      url: m.source_url || '',
      fullText: m.full_text || '',
      filename: m.title
    }));
    
    const chunks = chunker.chunkManuscripts(manuscriptsForChunking);
    logger.info(`✅ Created ${chunks.length} chunks`);
    
    // Step 2: Generate embeddings
    logger.info('');
    logger.info('🧠 Step 2: Generating embeddings...');
    logger.info('⚠️  This will take approximately 45-60 minutes...');
    logger.info('');
    
    // Extract text from chunks
    const texts = chunks.map(c => c.chunkText);
    const embeddings = await embeddingService.generateBatchEmbeddings(texts);
    logger.info(`✅ Generated ${embeddings.length} embeddings`);
    
    // Map embeddings back to chunks with metadata
    const vectors = [];
    for (let i = 0; i < chunks.length && i < embeddings.length; i++) {
      const chunk = chunks[i];
      vectors.push({
        id: chunk.id,
        values: embeddings[i],
        metadata: {
          manuscriptId: chunk.manuscriptId,
          title: chunk.title,
          author: chunk.author,
          year: chunk.year,
          url: chunk.url,
          chunkIndex: chunk.chunkIndex,
          text: chunk.chunkText
        }
      });
    }
    logger.info(`✅ Prepared ${vectors.length} vectors for upload`);
    const vectors2 = vectors
    logger.info(`✅ Generated ${vectors.length} vectors`);
    
    // Step 3: Upload to Pinecone
    logger.info('');
    logger.info('☁️  Step 3: Uploading to Pinecone...');
    await vectorDB.initialize();
    
    const upsertedCount = await vectorDB.upsert(vectors);
    logger.info(`✅ Upserted ${upsertedCount} vectors to Pinecone`);
    
    // Verify
    logger.info('');
    logger.info('🔍 Step 4: Verifying...');
    const stats = await vectorDB.getStats();
    logger.info('📊 Pinecone stats:', JSON.stringify(stats, null, 2));
    
    logger.info('');
    logger.info('========================================');
    logger.info('✅ PHASE 8 COMPLETED SUCCESSFULLY!');
    logger.info('========================================');
    logger.info(`📊 Summary:`);
    logger.info(`   - Manuscripts: ${manuscripts.length}`);
    logger.info(`   - Chunks: ${chunks.length}`);
    logger.info(`   - Vectors: ${upsertedCount}`);
    logger.info('');
    logger.info('🎉 System is ready to use!');
    logger.info('========================================');
    
    process.exit(0);
  } catch (error) {
    logger.error('');
    logger.error('========================================');
    logger.error('❌ PHASE 8 FAILED');
    logger.error('========================================');
    logger.error('Error:', error.message || error);
    if (error.stack) {
      logger.error('Stack:', error.stack);
    }
    logger.error('========================================');
    process.exit(1);
  }
}

phase8FromCheckpoint().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});


