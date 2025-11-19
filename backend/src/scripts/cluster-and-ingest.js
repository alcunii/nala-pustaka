/**
 * Cluster and Ingest Pipeline
 * Main script for clustering manuscripts and ingesting to Supabase + Pinecone
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Services
const manuscriptLoader = require('../services/manuscriptLoader');
const clusteringService = require('../services/clusteringService');
const llmClusteringService = require('../services/llmClusteringService');
const manuscriptMerger = require('../services/manuscriptMerger');
const chunker = require('../services/chunker');
const embeddingService = require('../services/embedding');
const vectorDB = require('../services/vectorDB');
const checkpointService = require('../services/checkpointService');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Configuration
const CONFIG = {
  sampleSize: process.env.SAMPLE_SIZE ? parseInt(process.env.SAMPLE_SIZE) : null, // null = all manuscripts
  targetClusters: process.env.TARGET_CLUSTERS ? parseInt(process.env.TARGET_CLUSTERS) : 500,
  skipClustering: process.env.SKIP_CLUSTERING === 'true',
  skipIngestion: process.env.SKIP_INGESTION === 'true',
  clearOldData: process.env.CLEAR_OLD_DATA !== 'false', // default true
};

async function clearOldData() {
  if (!CONFIG.clearOldData) {
    logger.warn('⚠️  Skipping data clearing (CLEAR_OLD_DATA=false)');
    return;
  }

  logger.info('========================================');
  logger.info('🗑️  Step: Clearing old data...');
  logger.info('========================================');

  try {
    // Clear Pinecone
    logger.info('🗑️  Clearing Pinecone...');
    await vectorDB.initialize();
    
    try {
      await vectorDB.deleteAll();
      logger.info('✅ Pinecone cleared');
    } catch (pineconeError) {
      // Handle 404 error (index might be empty already)
      if (pineconeError.message && pineconeError.message.includes('404')) {
        logger.warn('⚠️  Pinecone index is already empty (404). Continuing...');
      } else {
        throw pineconeError;
      }
    }

    // Clear Supabase
    logger.info('🗑️  Clearing Supabase manuscripts...');
    const { error } = await supabase
      .from('manuscripts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy

    if (error) throw error;
    logger.info('✅ Supabase cleared');

  } catch (error) {
    logger.error('❌ Error clearing old data:', error);
    throw error;
  }
}

async function saveToSupabase(manuscripts) {
  logger.info('========================================');
  logger.info('💾 Step: Saving to Supabase...');
  logger.info(`   - Manuscripts to save: ${manuscripts.length}`);
  logger.info('========================================');

  const savedCount = { success: 0, errors: 0 };
  const errorDetails = [];

  // Insert in batches of 5 (smaller for better error handling)
  const batchSize = 5;
  for (let i = 0; i < manuscripts.length; i += batchSize) {
    const batch = manuscripts.slice(i, i + batchSize);
    
    try {
      // Convert llm_analysis to JSON string if it's an object
      const preparedBatch = batch.map(m => ({
        ...m,
        llm_analysis: typeof m.llm_analysis === 'object' ? JSON.stringify(m.llm_analysis) : m.llm_analysis
      }));

      const { data, error } = await supabase
        .from('manuscripts')
        .insert(preparedBatch)
        .select();

      if (error) {
        logger.error(`❌ Batch ${i}-${i + batch.length} failed:`, error.message);
        logger.error(`   Error details:`, JSON.stringify(error, null, 2));
        logger.error(`   Sample manuscript:`, JSON.stringify(batch[0].title, null, 2));
        savedCount.errors += batch.length;
        errorDetails.push({ batch: i, error: error.message, titles: batch.map(b => b.title) });
      } else {
        savedCount.success += batch.length;
        logger.info(`   ✅ Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(manuscripts.length / batchSize)} (${savedCount.success}/${manuscripts.length})`);
      }
    } catch (error) {
      logger.error(`❌ Exception in batch ${i}-${i + batch.length}:`, error.message);
      logger.error(`   Stack:`, error.stack);
      savedCount.errors += batch.length;
      errorDetails.push({ batch: i, error: error.message });
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Log error summary
  if (errorDetails.length > 0) {
    logger.error('');
    logger.error('❌ SUPABASE SAVE ERRORS:');
    errorDetails.forEach(e => {
      logger.error(`   Batch ${e.batch}: ${e.error}`);
      if (e.titles) logger.error(`   Titles: ${e.titles.join(', ')}`);
    });
  }

  logger.info('========================================');
  logger.info('✅ Supabase save completed!');
  logger.info(`   - Success: ${savedCount.success}`);
  logger.info(`   - Errors: ${savedCount.errors}`);
  logger.info('========================================');

  return savedCount;
}

async function ingestToPinecone(manuscripts) {
  logger.info('========================================');
  logger.info('☁️  Step: Ingesting to Pinecone...');
  logger.info(`   - Manuscripts: ${manuscripts.length}`);
  logger.info('========================================');

  try {
    // Prepare manuscripts for chunking
    const manuscriptsForChunking = manuscripts.map(m => ({
      manuscriptId: m.id,
      title: m.title,
      author: m.author || 'Tidak Diketahui',
      year: m.year || '',
      url: m.source_url || '',
      fullText: m.full_text || '',
      filename: m.title
    }));

    // Step 1: Chunk
    logger.info('✂️  Step 1: Chunking manuscripts...');
    const chunks = chunker.chunkManuscripts(manuscriptsForChunking);
    logger.info(`✅ Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error('No chunks created!');
    }

    // Step 2: Generate embeddings
    logger.info('🧠 Step 2: Generating embeddings...');
    logger.info('⚠️  This may take 20-40 minutes...');
    const chunkTexts = chunks.map(c => c.chunkText);
    const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts, 10);
    logger.info(`✅ Generated ${embeddings.length} embeddings`);

    // Step 3: Prepare vectors
    logger.info('📦 Step 3: Preparing vectors...');
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

    // Step 4: Upload to Pinecone
    logger.info('☁️  Step 4: Uploading to Pinecone...');
    await vectorDB.initialize();
    const upsertedCount = await vectorDB.upsert(vectors);
    logger.info(`✅ Upserted ${upsertedCount} vectors`);

    // Step 5: Verify
    logger.info('🔍 Step 5: Verifying...');
    const stats = await vectorDB.getStats();
    logger.info('✅ Pinecone stats:', stats);

    return {
      chunks: chunks.length,
      vectors: upsertedCount,
      stats
    };

  } catch (error) {
    logger.error('❌ Error during Pinecone ingestion:', error);
    throw error;
  }
}

async function runPipeline() {
  const startTime = Date.now();
  
  try {
    logger.info('========================================');
    logger.info('🚀 CLUSTERING & MIGRATION PIPELINE');
    logger.info('========================================');
    logger.info('📊 Configuration:');
    logger.info(`   - Sample size: ${CONFIG.sampleSize || 'ALL'}`);
    logger.info(`   - Target clusters: ${CONFIG.targetClusters}`);
    logger.info(`   - Clear old data: ${CONFIG.clearOldData}`);
    logger.info(`   - Skip clustering: ${CONFIG.skipClustering}`);
    logger.info(`   - Skip ingestion: ${CONFIG.skipIngestion}`);
    logger.info('========================================');

    // PHASE 1: Load manuscripts
    logger.info('');
    logger.info('📖 PHASE 1: Loading manuscripts...');
    const manuscripts = manuscriptLoader.loadAll(CONFIG.sampleSize);
    logger.info(`✅ Loaded ${manuscripts.length} manuscripts`);
    
    // Save checkpoint
    await checkpointService.save(1, { manuscripts }, { count: manuscripts.length });

    if (manuscripts.length === 0) {
      throw new Error('No manuscripts loaded!');
    }

    // PHASE 2: Clustering
    logger.info('');
    logger.info('📊 PHASE 2: Clustering manuscripts...');
    const clusteringResult = await clusteringService.clusterManuscripts(manuscripts, {
      k: CONFIG.targetClusters,
      representativeCount: 5
    });
    logger.info(`✅ Created ${clusteringResult.totalClusters} clusters`);
    
    // Save checkpoint
    await checkpointService.save(2, { 
      clusters: clusteringResult.clusters,
      totalClusters: clusteringResult.totalClusters
    }, { totalClusters: clusteringResult.totalClusters });

    // PHASE 3: LLM Analysis
    logger.info('');
    logger.info('🤖 PHASE 3: LLM cluster analysis...');
    const analysisResult = await llmClusteringService.analyzeAllClusters(
      clusteringResult.clusters,
      {
        batchSize: 1,
        delayBetweenBatches: 1000
      }
    );
    logger.info(`✅ Analyzed ${analysisResult.analyses.length} clusters`);
    logger.info(`💰 LLM Cost: $${analysisResult.costUSD.total.toFixed(4)} USD`);
    
    // Save checkpoint
    await checkpointService.save(3, { llmAnalysis: analysisResult }, {
      clustersAnalyzed: analysisResult.analyses.length,
      cost: analysisResult.costUSD.total
    });

    // PHASE 4: Merge manuscripts
    logger.info('');
    logger.info('🔀 PHASE 4: Merging manuscripts...');
    const mergeResult = manuscriptMerger.processAllClusters(
      clusteringResult.clusters,
      analysisResult.analyses
    );
    logger.info(`✅ Created ${mergeResult.manuscripts.length} merged manuscripts`);
    logger.info(`📉 Reduction: ${mergeResult.reductionPercent}%`);
    
    // Save checkpoint
    await checkpointService.save(4, { mergeResult }, {
      manuscriptCount: mergeResult.manuscripts.length,
      reduction: mergeResult.reductionPercent
    });

    // PHASE 5: Generate descriptions (if needed)
    logger.info('');
    logger.info('📝 PHASE 5: Checking descriptions...');
    let descriptionsGenerated = 0;
    let descriptionsExisting = 0;
    
    for (const manuscript of mergeResult.manuscripts) {
      if (manuscript.description && manuscript.description.length > 50) {
        descriptionsExisting++;
      } else {
        // Generate if missing or too short
        try {
          manuscript.description = await llmClusteringService.generateDescription(
            manuscript,
            manuscript.source_manuscript_ids || []
          );
          descriptionsGenerated++;
          
          if (descriptionsGenerated % 5 === 0) {
            logger.info(`   Progress: ${descriptionsGenerated + descriptionsExisting}/${mergeResult.manuscripts.length}`);
          }
        } catch (error) {
          logger.warn(`Failed to generate description for ${manuscript.title}:`, error.message);
          // Fallback description
          manuscript.description = `Naskah ${manuscript.title} dari kategori ${manuscript.category || 'tidak diketahui'}.`;
        }
      }
    }
    
    logger.info(`✅ Descriptions status:`);
    logger.info(`   - Existing: ${descriptionsExisting}`);
    logger.info(`   - Generated: ${descriptionsGenerated}`);
    logger.info(`   - Total: ${descriptionsExisting + descriptionsGenerated}`);

    // Get final cost
    const finalCost = llmClusteringService.getCostStats();
    logger.info(`💰 Total LLM Cost: $${finalCost.costUSD.total.toFixed(4)} USD`);

    // PHASE 6: Clear old data
    logger.info('');
    logger.info('🗑️  PHASE 6: Clearing old data...');
    await clearOldData();

    // PHASE 7: Save to Supabase
    logger.info('');
    logger.info('💾 PHASE 7: Saving to Supabase...');
    const supabaseResult = await saveToSupabase(mergeResult.manuscripts);

    // PHASE 8: Ingest to Pinecone
    logger.info('');
    logger.info('☁️  PHASE 8: Ingesting to Pinecone...');
    const pineconeResult = await ingestToPinecone(mergeResult.manuscripts);

    // FINAL SUMMARY
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    
    logger.info('');
    logger.info('========================================');
    logger.info('🎉 PIPELINE COMPLETED SUCCESSFULLY!');
    logger.info('========================================');
    logger.info('📊 FINAL STATISTICS:');
    logger.info('');
    logger.info('Input:');
    logger.info(`   - Original manuscripts: ${manuscripts.length}`);
    logger.info('');
    logger.info('Clustering:');
    logger.info(`   - Clusters created: ${clusteringResult.totalClusters}`);
    logger.info(`   - Full merges: ${analysisResult.mergeStats.full}`);
    logger.info(`   - Partial merges: ${analysisResult.mergeStats.partial}`);
    logger.info(`   - Kept separate: ${analysisResult.mergeStats.separate}`);
    logger.info('');
    logger.info('Output:');
    logger.info(`   - Final manuscripts: ${mergeResult.manuscripts.length}`);
    logger.info(`   - Reduction: ${mergeResult.reductionPercent}%`);
    logger.info(`   - Descriptions (existing): ${descriptionsExisting || 0}`);
    logger.info(`   - Descriptions (generated): ${descriptionsGenerated || 0}`);
    logger.info('');
    logger.info('Database:');
    logger.info(`   - Supabase manuscripts: ${supabaseResult.success}`);
    logger.info(`   - Pinecone vectors: ${pineconeResult.vectors}`);
    logger.info('');
    logger.info('Cost & Performance:');
    logger.info(`   - LLM tokens (input): ${finalCost.tokens.input.toLocaleString()}`);
    logger.info(`   - LLM tokens (output): ${finalCost.tokens.output.toLocaleString()}`);
    logger.info(`   - Total cost: $${finalCost.costUSD.total.toFixed(4)} USD`);
    logger.info(`   - Duration: ${duration} minutes`);
    logger.info('========================================');

    process.exit(0);

  } catch (error) {
    logger.error('');
    logger.error('========================================');
    logger.error('❌ PIPELINE FAILED');
    logger.error('========================================');
    logger.error('Error:', error);
    logger.error('Stack:', error.stack);
    logger.error('========================================');
    process.exit(1);
  }
}

// Run pipeline
runPipeline();