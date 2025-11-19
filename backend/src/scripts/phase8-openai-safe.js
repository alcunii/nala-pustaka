/**
 * Phase 8 OpenAI - SAFE MODE
 * Smaller batches, better error handling, direct to Pinecone
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const logger = require("../utils/logger");
const checkpointService = require("../services/checkpointService");
const chunker = require("../services/chunker");
const embeddingService = require("../services/embeddingOpenAI");
const vectorDB = require("../services/vectorDB");

async function phase8Safe() {
  try {
    logger.info("========================================");
    logger.info("⚡ PHASE 8: OpenAI SAFE MODE");
    logger.info("========================================");
    logger.info("🔧 Settings:");
    logger.info("   - Batch size: 20 (conservative)");
    logger.info("   - Better error handling");
    logger.info("   - Upload directly to Pinecone");
    logger.info("");
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY missing!");
    }
    
    // Load manuscripts
    const checkpoint = await checkpointService.load(4);
    const manuscripts = checkpoint.mergeResult.manuscripts;
    logger.info(`✅ Loaded ${manuscripts.length} manuscripts`);
    
    // Chunk
    logger.info("\n✂️  Step 1: Chunking...");
    const chunks = chunker.chunkManuscripts(manuscripts.map(m => ({
      manuscriptId: m.id, title: m.title, author: m.author || "Unknown",
      year: m.year || "", url: m.source_url || "", fullText: m.full_text || "", filename: m.title
    })));
    logger.info(`✅ ${chunks.length} chunks`);
    
    // Initialize Pinecone FIRST
    logger.info("\n☁️  Initializing Pinecone...");
    await vectorDB.initialize();
    logger.info("✅ Connected to Pinecone");
    
    // Generate embeddings in small batches and upload incrementally
    logger.info("\n⚡ Step 2: Generate embeddings + upload to Pinecone");
    logger.info("💡 Uploading incrementally (every 1000 vectors)");
    logger.info("");
    
    const megaBatchSize = 1000; // Upload every 1000 vectors
    let totalUploaded = 0;
    let totalCost = 0;
    const startTime = Date.now();
    
    for (let mega = 0; mega < chunks.length; mega += megaBatchSize) {
      const megaChunks = chunks.slice(mega, Math.min(mega + megaBatchSize, chunks.length));
      const megaTexts = megaChunks.map(c => c.chunkText);
      
      logger.info(`\n📦 Processing batch ${Math.floor(mega/megaBatchSize)+1}/${Math.ceil(chunks.length/megaBatchSize)}`);
      logger.info(`   Chunks ${mega} to ${mega + megaChunks.length}`);
      
      // Generate embeddings for this mega batch
      const embeddings = await embeddingService.generateBatchEmbeddings(megaTexts, 20);
      
      // Prepare vectors
      const vectors = [];
      for (let i = 0; i < megaChunks.length && i < embeddings.length; i++) {
        const chunk = megaChunks[i];
        if (embeddings[i]) { // Skip null embeddings
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
              text: chunk.chunkText.substring(0, 500) // Limit metadata
            }
          });
        }
      }
      
      // Upload this batch to Pinecone
      if (vectors.length > 0) {
        logger.info(`☁️  Uploading ${vectors.length} vectors to Pinecone...`);
        const uploaded = await vectorDB.upsert(vectors);
        totalUploaded += uploaded;
        logger.info(`✅ Uploaded! Total so far: ${totalUploaded}`);
      }
      
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      logger.info(`⏱️  Elapsed: ${elapsed} minutes`);
    }
    
    // Verify
    logger.info("\n🔍 Verifying...");
    const stats = await vectorDB.getStats();
    logger.info(`📊 Pinecone: ${stats.totalRecordCount || 0} vectors`);
    
    logger.info("\n========================================");
    logger.info("✅ PHASE 8 COMPLETED!");
    logger.info("========================================");
    logger.info(`📊 Summary:`);
    logger.info(`   - Chunks: ${chunks.length}`);
    logger.info(`   - Uploaded: ${totalUploaded}`);
    logger.info(`   - Success rate: ${(totalUploaded/chunks.length*100).toFixed(1)}%`);
    logger.info("\n🎉 System ready! Check OpenAI usage:");
    logger.info("   https://platform.openai.com/usage");
    logger.info("========================================");
    
    process.exit(0);
  } catch (error) {
    logger.error("\n❌ FAILED:", error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

phase8Safe();
