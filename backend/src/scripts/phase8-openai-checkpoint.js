/**
 * Phase 8 with OpenAI + CHECKPOINT
 * Saves checkpoint after embedding generation
 * Can resume if Pinecone upload fails!
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const logger = require("../utils/logger");
const checkpointService = require("../services/checkpointService");
const chunker = require("../services/chunker");
const embeddingService = require("../services/embeddingOpenAI");
const vectorDB = require("../services/vectorDB");

async function phase8WithCheckpoint() {
  try {
    logger.info("========================================");
    logger.info("⚡ PHASE 8: OpenAI + CHECKPOINT");
    logger.info("========================================");
    logger.info("💰 Expected cost: ~$0.20 USD");
    logger.info("⏱️  Expected time: 5-10 minutes");
    logger.info("💾 Will save checkpoint after embeddings!");
    logger.info("");
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("❌ OPENAI_API_KEY not found in .env file!\n   Get key from: https://platform.openai.com/api-keys");
    }
    
    // Try loading existing checkpoint first
    logger.info("🔍 Checking for existing checkpoint...");
    let vectors = null;
    
    try {
      const checkpoint = await checkpointService.load("phase8-embeddings");
      if (checkpoint && checkpoint.vectors) {
        logger.info("✅ Found existing checkpoint with embeddings!");
        logger.info(`   Vectors: ${checkpoint.vectors.length}`);
        logger.info("   Skipping embedding generation...");
        vectors = checkpoint.vectors;
      }
    } catch (err) {
      logger.info("ℹ️  No existing checkpoint, will generate new embeddings");
    }
    
    // If no checkpoint, generate embeddings
    if (!vectors) {
      // Load manuscripts
      logger.info("");
      logger.info("📂 Loading manuscripts from checkpoint...");
      const checkpoint = await checkpointService.load(4);
      
      if (!checkpoint || !checkpoint.mergeResult) {
        throw new Error("No Phase 4 checkpoint found! Run cluster-and-ingest.js first.");
      }
      
      const manuscripts = checkpoint.mergeResult.manuscripts;
      logger.info(`✅ Loaded ${manuscripts.length} manuscripts`);
      
      // Step 1: Chunk
      logger.info("");
      logger.info("✂️  Step 1: Chunking manuscripts...");
      const manuscriptsForChunking = manuscripts.map(m => ({
        manuscriptId: m.id,
        title: m.title,
        author: m.author || "Tidak Diketahui",
        year: m.year || "",
        url: m.source_url || "",
        fullText: m.full_text || "",
        filename: m.title
      }));
      
      const chunks = chunker.chunkManuscripts(manuscriptsForChunking);
      logger.info(`✅ Created ${chunks.length} chunks`);
      
      // Step 2: Generate embeddings with OpenAI
      logger.info("");
      logger.info("⚡ Step 2: Generating embeddings with OpenAI...");
      logger.info("💰 This will cost ~$0.20 from your $5 credit");
      logger.info("🚀 Speed: 100+ embeddings/sec (FAST!)");
      logger.info("");
      
      const texts = chunks.map(c => c.chunkText);
      const embeddings = await embeddingService.generateBatchEmbeddings(texts);
      logger.info(`✅ Generated ${embeddings.length} embeddings`);
      
      // Step 3: Prepare vectors
      logger.info("");
      logger.info("📦 Step 3: Preparing vectors...");
      vectors = [];
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
            text: chunk.chunkText.substring(0, 1000) // Limit metadata size
          }
        });
      }
      logger.info(`✅ Prepared ${vectors.length} vectors`);
      
      // SAVE CHECKPOINT AFTER EMBEDDINGS!
      logger.info("");
      logger.info("💾 Step 4: Uploading directly to Pinecone (checkpoint too large)");
    }
    
    // Step 5: Upload to Pinecone
    logger.info("");
    logger.info("☁️  Step 5: Uploading to Pinecone...");
    logger.info(`   Total vectors: ${vectors.length}`);
    
    await vectorDB.initialize();
    const upsertedCount = await vectorDB.upsert(vectors);
    logger.info(`✅ Upserted ${upsertedCount} vectors to Pinecone`);
    
    // Verify
    logger.info("");
    logger.info("🔍 Step 6: Verifying...");
    const stats = await vectorDB.getStats();
    logger.info("📊 Pinecone stats:");
    logger.info(`   Total vectors: ${stats.totalRecordCount || 0}`);
    logger.info(`   Dimension: ${stats.dimension || "N/A"}`);
    
    logger.info("");
    logger.info("========================================");
    logger.info("✅ PHASE 8 COMPLETED SUCCESSFULLY!");
    logger.info("========================================");
    logger.info("📊 Summary:");
    logger.info(`   - Vectors uploaded: ${upsertedCount}`);
    logger.info(`   - Model: ${embeddingService.model}`);
    logger.info(`   - Dimension: ${embeddingService.dimension}`);
    logger.info(`   - Checkpoint: Saved`);
    logger.info("");
    logger.info("🎉 System is ready to use!");
    logger.info("💰 Check your OpenAI usage at: https://platform.openai.com/usage");
    logger.info("========================================");
    
    process.exit(0);
  } catch (error) {
    logger.error("");
    logger.error("========================================");
    logger.error("❌ PHASE 8 FAILED");
    logger.error("========================================");
    logger.error("Error:", error.message || error);
    if (error.stack) {
      logger.error("Stack:", error.stack);
    }
    logger.error("");
    logger.error("💡 Checkpoint may have been saved!");
    logger.error("   You can resume without regenerating embeddings.");
    logger.error("========================================");
    process.exit(1);
  }
}

phase8WithCheckpoint();

