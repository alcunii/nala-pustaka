/**
 * Data Ingestion Script
 * Orchestrates: Read manuscripts → Chunk → Embed → Upsert to Vector DB → Store metadata
 */

const textProcessor = require('../services/textProcessor');
const chunker = require('../services/chunker');
const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');
const logger = require('../utils/logger');

async function ingestData() {
  const startTime = Date.now();
  
  try {
    logger.info('========================================');
    logger.info('🚀 Starting data ingestion pipeline...');
    logger.info('========================================');

    // Step 1: Read all manuscripts
    logger.info('📖 Step 1: Reading manuscripts...');
    const manuscripts = await textProcessor.readAllManuscripts();
    logger.info(`✅ Read ${manuscripts.length} manuscripts`);

    // Step 2: Chunk manuscripts
    logger.info('✂️  Step 2: Chunking manuscripts...');
    const chunks = chunker.chunkManuscripts(manuscripts);
    logger.info(`✅ Created ${chunks.length} chunks`);

    // Step 3: Generate embeddings
    logger.info('🧠 Step 3: Generating embeddings...');
    logger.info('⚠️  This may take 20-30 minutes depending on API rate limits...');
    
    const chunkTexts = chunks.map(c => c.chunkText);
    const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts, 10);
    logger.info(`✅ Generated ${embeddings.length} embeddings`);

    // Step 4: Prepare vectors for Pinecone
    logger.info('📦 Step 4: Preparing vectors...');
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
        chunkText: chunk.chunkText.substring(0, 1000), // Pinecone metadata limit
        tokenCount: chunk.tokenCount,
      },
    }));
    logger.info(`✅ Prepared ${vectors.length} vectors`);

    // Step 5: Upload to Pinecone
    logger.info('☁️  Step 5: Uploading to Pinecone...');
    await vectorDB.initialize();
    const upsertedCount = await vectorDB.upsert(vectors);
    logger.info(`✅ Upserted ${upsertedCount} vectors to Pinecone`);

    // Step 6: Verify upload
    logger.info('🔍 Step 6: Verifying upload...');
    const stats = await vectorDB.getStats();
    logger.info('✅ Pinecone index stats:', stats);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
    
    logger.info('========================================');
    logger.info('🎉 Data ingestion completed successfully!');
    logger.info('========================================');
    logger.info(`📊 Summary:`);
    logger.info(`   - Manuscripts: ${manuscripts.length}`);
    logger.info(`   - Chunks: ${chunks.length}`);
    logger.info(`   - Embeddings: ${embeddings.length}`);
    logger.info(`   - Vectors uploaded: ${upsertedCount}`);
    logger.info(`   - Duration: ${duration} minutes`);
    logger.info('========================================');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during ingestion:', error);
    process.exit(1);
  }
}

// Run ingestion
ingestData();