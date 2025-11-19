/**
 * Recreate Pinecone Index with New Dimension
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const { Pinecone } = require("@pinecone-database/pinecone");
const logger = require("../utils/logger");
const config = require("../config");

async function recreateIndex() {
  try {
    logger.info("========================================");
    logger.info("🔄 RECREATING PINECONE INDEX");
    logger.info("========================================");
    
    const pinecone = new Pinecone({ apiKey: config.pinecone.apiKey });
    const indexName = config.pinecone.indexName;
    const newDimension = config.huggingface.dimension;
    
    logger.info(`Index: ${indexName}, New dimension: ${newDimension}`);
    
    // Check existing
    const indexes = await pinecone.listIndexes();
    const existingIndex = indexes.indexes?.find(idx => idx.name === indexName);
    
    if (existingIndex) {
      logger.warn("⚠️  Deleting old index...");
      await pinecone.deleteIndex(indexName);
      logger.info("✅ Deleted");
      await new Promise(r => setTimeout(r, 10000));
    }
    
    // Create new
    logger.info("🆕 Creating new index...");
    await pinecone.createIndex({
      name: indexName,
      dimension: newDimension,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } }
    });
    
    logger.info("✅ Created! Waiting for ready...");
    let ready = false, attempts = 0;
    while (!ready && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
      try {
        await pinecone.index(indexName).describeIndexStats();
        ready = true;
        logger.info(`✅ Ready! (${attempts} attempts)`);
      } catch (e) {
        if (attempts % 5 === 0) logger.info(`   Waiting... (${attempts}/30)`);
      }
    }
    
    logger.info("\n✅ SUCCESS! Next: node src/scripts/phase8-checkpoint.js\n");
    process.exit(0);
  } catch (error) {
    logger.error("❌ FAILED:", error.message);
    process.exit(1);
  }
}

recreateIndex();
