const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const logger = require("../utils/logger");
const checkpointService = require("../services/checkpointService");
const chunker = require("../services/chunker");
const embeddingService = require("../services/embeddingOpenAI");
const vectorDB = require("../services/vectorDB");

async function phase8OpenAI() {
  try {
    logger.info("========================================");
    logger.info("⚡ PHASE 8: OpenAI Embedding (FAST!)");
    logger.info("========================================");
    logger.info("💰 Expected cost: ~$0.20 USD");
    logger.info("⏱️  Expected time: 5-10 minutes");
    
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing!");
    
    const checkpoint = await checkpointService.load(4);
    const manuscripts = checkpoint.mergeResult.manuscripts;
    logger.info(`✅ Loaded ${manuscripts.length} manuscripts`);
    
    logger.info("\n✂️  Chunking...");
    const chunks = chunker.chunkManuscripts(manuscripts.map(m => ({
      manuscriptId: m.id, title: m.title, author: m.author || "Unknown",
      year: m.year || "", url: m.source_url || "", fullText: m.full_text || "", filename: m.title
    })));
    logger.info(`✅ ${chunks.length} chunks`);
    
    logger.info("\n⚡ Generating embeddings with OpenAI...");
    const texts = chunks.map(c => c.chunkText);
    const embeddings = await embeddingService.generateBatchEmbeddings(texts);
    logger.info(`✅ ${embeddings.length} embeddings`);
    
    logger.info("\n📦 Preparing vectors...");
    const vectors = chunks.slice(0, embeddings.length).map((c, i) => ({
      id: c.id, values: embeddings[i],
      metadata: { manuscriptId: c.manuscriptId, title: c.title, author: c.author,
                  year: c.year, url: c.url, chunkIndex: c.chunkIndex, text: c.chunkText }
    }));
    
    logger.info("\n☁️  Uploading to Pinecone...");
    await vectorDB.initialize();
    await vectorDB.upsert(vectors);
    
    logger.info("\n✅ SUCCESS! System ready to use! 🎉\n");
    process.exit(0);
  } catch (error) {
    logger.error("❌ FAILED:", error.message);
    process.exit(1);
  }
}

phase8OpenAI();
