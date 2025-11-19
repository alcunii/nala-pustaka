/**
 * Ingest to Pinecone Only (OPTIMIZED)
 * Assumes manuscripts already in Supabase
 * Uses optimized parallel embedding generation
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const chunker = require('../services/chunker');
const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function ingestToPineconeOnly() {
  const startTime = Date.now();
  
  try {
    logger.info('========================================');
    logger.info('☁️  PINECONE-ONLY INGESTION (OPTIMIZED)');
    logger.info('========================================');
    logger.info('📊 Using optimized parallel processing');
    logger.info('⚡ Expected time: ~45-60 minutes for 48k vectors');
    logger.info('========================================');

    // Step 1: Load manuscripts from Supabase
    logger.info('');
    logger.info('📖 Step 1: Loading manuscripts from Supabase...');
    const { data: manuscripts, error } = await supabase
      .from('manuscripts')
      .select('id, title, author, year, source_url, full_text')
      .eq('is_clustered', true)
      .not('full_text', 'is', null);

    if (error) throw error;
    logger.info(`✅ Loaded ${manuscripts.length} manuscripts from Supabase`);

    if (manuscripts.length === 0) {
      throw new Error('No clustered manuscripts found in Supabase! Run full pipeline first.');
    }

    // Step 2: Prepare for chunking
    logger.info('');
    logger.info('📋 Step 2: Preparing manuscripts for chunking...');
    const manuscriptsForChunking = manuscripts.map(m => ({
      manuscriptId: m.id,
      title: m.title,
      author: m.author || 'Tidak Diketahui',
      year: m.year || '',
      url: m.source_url || '',
      fullText: m.full_text || '',
      filename: m.title
    }));
    logger.info(`✅ Prepared ${manuscriptsForChunking.length} manuscripts`);

    // Step 3: Chunk manuscripts
    logger.info('');
    logger.info('✂️  Step 3: Chunking manuscripts...');
    const chunks = chunker.chunkManuscripts(manuscriptsForChunking);
    logger.info(`✅ Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error('No chunks created! Check manuscript content.');
    }

    // Step 4: Generate embeddings (OPTIMIZED - parallel processing!)
    logger.info('');
    logger.info('🧠 Step 4: Generating embeddings (OPTIMIZED)...');
    logger.info(`   - Chunks to process: ${chunks.length}`);
    logger.info(`   - Batch size: 20 (optimized)`);
    logger.info(`   - Parallel batches: 3`);
    logger.info(`   - Estimated time: ${Math.ceil(chunks.length / 60)} minutes`);
    logger.info('');
    
    const chunkTexts = chunks.map(c => c.chunkText);
    const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts, 20);
    
    logger.info(`✅ Generated ${embeddings.length} embeddings`);

    if (embeddings.length === 0) {
      throw new Error('No embeddings generated!');
    }

    // Step 5: Prepare vectors
    logger.info('');
    logger.info('📦 Step 5: Preparing vectors for Pinecone...');
    const vectors = chunks.map((chunk, index) => ({
      id: chunk.id,
      values: embeddings[index],
      metadata: {
        manuscriptId: chunk.manuscriptId,
        title: chunk.title,
        author: chunk.author,
        year: chunk.year,
        url: chunk.url,
        chunkIndex: chunk.chunkIndex,
        chunkText: chunk.chunkText.substring(0, 1000),
        tokenCount: chunk.tokenCount,
        isClusteredManuscript: true
      },
    }));
    logger.info(`✅ Prepared ${vectors.length} vectors`);

    // Step 6: Clear old Pinecone data
    logger.info('');
    logger.info('🗑️  Step 6: Clearing old Pinecone data...');
    await vectorDB.initialize();
    
    try {
      await vectorDB.deleteAll();
      logger.info('✅ Old Pinecone data cleared');
    } catch (error) {
      logger.warn('⚠️  Could not clear old data (index might be empty):', error.message);
    }

    // Step 7: Upload to Pinecone
    logger.info('');
    logger.info('☁️  Step 7: Uploading vectors to Pinecone...');
    const upsertedCount = await vectorDB.upsert(vectors);
    logger.info(`✅ Successfully upserted ${upsertedCount} vectors`);

    // Step 8: Verify
    logger.info('');
    logger.info('🔍 Step 8: Verifying Pinecone...');
    const stats = await vectorDB.getStats();
    logger.info('✅ Pinecone stats:', stats);

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    
    logger.info('');
    logger.info('========================================');
    logger.info('🎉 PINECONE INGESTION COMPLETED!');
    logger.info('========================================');
    logger.info('📊 Final Summary:');
    logger.info(`   - Manuscripts processed: ${manuscripts.length}`);
    logger.info(`   - Chunks created: ${chunks.length}`);
    logger.info(`   - Embeddings generated: ${embeddings.length}`);
    logger.info(`   - Vectors uploaded: ${upsertedCount}`);
    logger.info(`   - Duration: ${duration} minutes`);
    logger.info(`   - Average speed: ${(chunks.length / (Date.now() - startTime) * 1000 * 60).toFixed(1)} chunks/min`);
    logger.info('========================================');

    process.exit(0);
  } catch (error) {
    logger.error('');
    logger.error('========================================');
    logger.error('❌ PINECONE INGESTION FAILED');
    logger.error('========================================');
    logger.error('Error:', error.message);
    logger.error('Stack:', error.stack);
    logger.error('========================================');
    process.exit(1);
  }
}

// Run the ingestion
ingestToPineconeOnly();