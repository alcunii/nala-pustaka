require('dotenv').config({ path: '../../.env' });
const { createClient } = require('@supabase/supabase-js');
const chunker = require('../services/chunker');
const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function ingestFromSupabase() {
  const startTime = Date.now();
  
  try {
    logger.info('========================================');
    logger.info('🚀 Starting Supabase → Pinecone ingestion...');
    logger.info('========================================');

    logger.info('📖 Step 1: Fetching ALL manuscripts from Supabase...');
    const { data: manuscripts, error } = await supabase
      .from('manuscripts')
      .select('id, title, author, year, source_url, full_text, description')
      .not('full_text', 'is', null)
      .order('title', { ascending: true });

    if (error) throw error;
    
    logger.info('✅ Fetched ' + manuscripts.length + ' manuscripts');

    logger.info('✂️  Step 2: Chunking manuscripts...');
    const manuscriptsForChunking = manuscripts.map(m => ({
      manuscriptId: m.id,
      title: m.title,
      author: m.author || 'Tidak Diketahui',
      year: m.year || '',
      url: m.source_url || '',
      fullText: m.full_text || m.description || '',
      filename: m.title
    }));

    const chunks = chunker.chunkManuscripts(manuscriptsForChunking);
    logger.info('✅ Created ' + chunks.length + ' chunks');

    if (chunks.length === 0) {
      throw new Error('No chunks created!');
    }

    logger.info('🧠 Step 3: Generating embeddings...');
    logger.info('⚠️  This may take 10-20 minutes...');
    
    const chunkTexts = chunks.map(c => c.chunkText);
    const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts, 10);
    logger.info('✅ Generated ' + embeddings.length + ' embeddings');

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
        chunkText: chunk.chunkText.substring(0, 1000),
        tokenCount: chunk.tokenCount,
      },
    }));
    logger.info('✅ Prepared ' + vectors.length + ' vectors');

    logger.info('🗑️  Step 5: Clearing old data...');
    try {
      await vectorDB.deleteAll();
      logger.info('✅ Old data cleared');
    } catch (error) {
      logger.warn('Could not clear:', error.message);
    }

    logger.info('☁️  Step 6: Uploading to Pinecone...');
    await vectorDB.initialize();
    const upsertedCount = await vectorDB.upsert(vectors);
    logger.info('✅ Upserted ' + upsertedCount + ' vectors');

    logger.info('🔍 Step 7: Verifying...');
    const stats = await vectorDB.getStats();
    logger.info('✅ Stats:', stats);

    logger.info('🧪 Step 8: Testing query...');
    const testEmbed = await embeddingService.generateEmbedding('test');
    const testResults = await vectorDB.query(testEmbed, { topK: 3, includeMetadata: true });
    logger.info('Sample results:');
    testResults.forEach((r, i) => {
      logger.info('  ' + (i+1) + '. ' + r.metadata.title + ' (UUID: ' + r.metadata.manuscriptId + ')');
    });

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    
    logger.info('========================================');
    logger.info('🎉 Success!');
    logger.info('========================================');
    logger.info('📊 Summary:');
    logger.info('   - Manuscripts: ' + manuscripts.length);
    logger.info('   - Chunks: ' + chunks.length);
    logger.info('   - Vectors: ' + upsertedCount);
    logger.info('   - Duration: ' + duration + ' minutes');
    logger.info('========================================');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error:', error);
    process.exit(1);
  }
}

ingestFromSupabase();
