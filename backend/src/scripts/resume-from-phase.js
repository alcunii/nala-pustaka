/**
 * Resume Pipeline from Checkpoint
 * Usage: node resume-from-phase.js [PHASE_NUMBER]
 * Example: node resume-from-phase.js 5
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Services
const checkpointService = require('../services/checkpointService');
const chunker = require('../services/chunker');
const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function clearOldData() {
  try {
    logger.info('???  Clearing Pinecone...');
    await vectorDB.initialize();
    
    try {
      await vectorDB.deleteAll();
      logger.info('? Pinecone cleared');
    } catch (pineconeError) {
      if (pineconeError.message && pineconeError.message.includes('404')) {
        logger.warn('??  Pinecone index is already empty (404). Continuing...');
      } else {
        throw pineconeError;
      }
    }

    logger.info('???  Clearing Supabase manuscripts...');
    const { error } = await supabase
      .from('manuscripts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) throw error;
    logger.info('? Supabase cleared');
  } catch (error) {
    logger.error('? Error clearing old data:', error);
    throw error;
  }
}

async function saveToSupabase(manuscripts) {
  logger.info(`?? Saving ${manuscripts.length} manuscripts to Supabase...`);
  
  const savedCount = { success: 0, errors: 0, total: manuscripts.length };
  const batchSize = 5;

  for (let i = 0; i < manuscripts.length; i += batchSize) {
    const batch = manuscripts.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('manuscripts')
        .insert(batch)
        .select();
      
      if (error) {
        logger.error(`❌ Batch ${i}-${i + batch.length} FAILED:`);
        logger.error(`   Code: ${error.code}`);
        logger.error(`   Message: ${error.message}`);
        logger.error(`   Details: ${error.details}`);
        logger.error(`   Hint: ${error.hint}`);
        savedCount.errors += batch.length;
      } else {
        savedCount.success += batch.length;
        if ((i + batch.length) % 25 === 0) {
          logger.info(`   Progress: ${savedCount.success}/${manuscripts.length}`);
        }
      }
    } catch (error) {
      logger.error(`❌ Batch ${i}-${i + batch.length} EXCEPTION:`);
        logger.error(`   Message: ${error.message}`);
        logger.error(`   Stack: ${error.stack}`);
      savedCount.errors += batch.length;
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  logger.info(`? Saved ${savedCount.success}/${manuscripts.length} manuscripts`);
  return savedCount;
}

async function ingestToPinecone(manuscripts) {
  logger.info(`??  Ingesting ${manuscripts.length} manuscripts to Pinecone...`);
  
  // Step 1: Chunk
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
  logger.info(`? Created ${chunks.length} chunks`);
  
  // Step 2: Generate embeddings
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
  logger.info(`? Generated ${vectors.length} vectors`);
  
  // Step 3: Upload to Pinecone
  await vectorDB.initialize();
  const upsertedCount = await vectorDB.upsert(vectors);
  logger.info(`? Upserted ${upsertedCount} vectors to Pinecone`);
  
  return {
    chunks: chunks.length,
    vectors: upsertedCount
  };
}

async function resume() {
  try {
    const fromPhase = parseInt(process.argv[2] || '5');
    
    logger.info('========================================');
    logger.info(`?? RESUMING PIPELINE FROM PHASE ${fromPhase}`);
    logger.info('========================================');
    
    // Load checkpoint from previous phase
    const checkpointPhase = fromPhase - 1;
    logger.info(`?? Loading Phase ${checkpointPhase} checkpoint...`);
    
    const checkpoint = await checkpointService.load(checkpointPhase);
    
    if (!checkpoint) {
      logger.error(`? No checkpoint found for Phase ${checkpointPhase}!`);
      logger.info('');
      logger.info('Available checkpoints:');
      const checkpoints = checkpointService.listCheckpoints();
      checkpoints.slice(0, 5).forEach(cp => {
        logger.info(`   Phase ${cp.phase}: ${cp.filename} (${cp.size})`);
      });
      process.exit(1);
    }
    
    logger.info('? Checkpoint loaded!');
    logger.info(`   Timestamp: ${checkpoint.timestamp || 'N/A'}`);
    
    // Extract manuscripts
    let manuscripts;
    
    if (checkpoint.manuscripts) {
      manuscripts = checkpoint.manuscripts;
    } else if (checkpoint.mergeResult) {
      manuscripts = checkpoint.mergeResult.manuscripts;
    } else {
      logger.error('? Cannot find manuscripts in checkpoint!');
      process.exit(1);
    }
    
    logger.info(`?? Loaded ${manuscripts.length} manuscripts`);
    
    // Continue from requested phase
    if (fromPhase <= 6) {
      logger.info('');
      logger.info('???  PHASE 6: Clearing old data...');
      await clearOldData();
    }
    
    if (fromPhase <= 7) {
      logger.info('');
      logger.info('?? PHASE 7: Saving to Supabase...');
      const supabaseResult = await saveToSupabase(manuscripts);
      logger.info(`? Saved ${supabaseResult.success}/${supabaseResult.total}`);
    }
    
    if (fromPhase <= 8) {
      logger.info('');
      logger.info('??  PHASE 8: Ingesting to Pinecone...');
      const pineconeResult = await ingestToPinecone(manuscripts);
      logger.info(`? Uploaded ${pineconeResult.vectors} vectors`);
    }
    
    logger.info('');
    logger.info('========================================');
    logger.info('? PIPELINE COMPLETED SUCCESSFULLY!');
    logger.info('========================================');
    
    process.exit(0);
  } catch (error) {
    logger.error('');
    logger.error('========================================');
    logger.error('? RESUME FAILED');
    logger.error('========================================');
    logger.error('Error:', error);
    process.exit(1);
  }
}

resume();




