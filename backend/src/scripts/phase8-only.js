/**
 * Quick Phase 8 - Ingest from Supabase to Pinecone
 * Use this when Phase 7 already completed
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

async function phase8Only() {
  try {
    logger.info('========================================');
    logger.info('☁️  PHASE 8: Pinecone Ingestion ONLY');
    logger.info('========================================');
    
    // Load manuscripts from Supabase
    logger.info('📂 Loading manuscripts from Supabase...');
    const { data: manuscripts, error } = await supabase
      .from('manuscripts')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to load from Supabase: ${error.message}`);
    }
    
    logger.info(`✅ Loaded ${manuscripts.length} manuscripts from Supabase`);
    
    // Step 1: Chunk
    logger.info('\n✂️  Step 1: Chunking manuscripts...');
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
    logger.info('\n🧠 Step 2: Generating embeddings...');
    logger.info('⚠️  This may take 30-60 minutes...');
    const vectors = await embeddingService.generateEmbeddingsForChunks(chunks);
    logger.info(`✅ Generated ${vectors.length} vectors`);
    
    // Step 3: Upload to Pinecone
    logger.info('\n☁️  Step 3: Uploading to Pinecone...');
    await vectorDB.initialize();
    const upsertedCount = await vectorDB.upsert(vectors);
    logger.info(`✅ Upserted ${upsertedCount} vectors to Pinecone`);
    
    logger.info('\n========================================');
    logger.info('✅ PHASE 8 COMPLETED SUCCESSFULLY!');
    logger.info('========================================');
    logger.info(`📊 Summary:`);
    logger.info(`   - Manuscripts: ${manuscripts.length}`);
    logger.info(`   - Chunks: ${chunks.length}`);
    logger.info(`   - Vectors: ${upsertedCount}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('\n========================================');
    logger.error('❌ PHASE 8 FAILED');
    logger.error('========================================');
    logger.error('Error:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}

phase8Only();
