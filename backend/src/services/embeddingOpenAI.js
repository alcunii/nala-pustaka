/**
 * OpenAI Embedding Service (FASTEST OPTION)
 * Cost: ~$0.20 for 48,226 chunks
 * Speed: 100+ embeddings/sec
 * Time: 5-10 minutes
 */
const logger = require("../utils/logger");

class OpenAIEmbeddingService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = "text-embedding-3-small";
    this.dimension = 1536;
    this.endpoint = "https://api.openai.com/v1/embeddings";
    
    logger.info(` OpenAI Embedding service initialized:`);
    logger.info(`   Model: ${this.model}`);
    logger.info(`   Dimension: ${this.dimension}`);
    logger.info(`   Estimated cost for 48,226 chunks: ~$0.20`);
  }

  /**
   * Generate single embedding (for RAG search queries)
   */
  async generateEmbedding(text) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          input: [text],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const result = await response.json();
      return result.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error.message);
      throw error;
    }
  }

  /**
   * Generate batch embeddings
   */
  async generateBatchEmbeddings(texts, batchSize = 20) {
    logger.info(`Generating ${texts.length} embeddings with OpenAI...`);
    
    const avgTokens = 200;
    const estimatedCost = (texts.length * avgTokens / 1000000) * 0.02;
    logger.info(` Estimated cost: $${estimatedCost.toFixed(4)}`);
    
    const embeddings = [];
    let processed = 0, totalCost = 0;
    const startTime = Date.now();

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, Math.min(i + batchSize, texts.length));
      
      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            input: batch,
          }),
        });

        if (!response.ok) { const errorText = await response.text(); throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`); }
        
        const result = await response.json();
        const batchEmb = result.data.sort((a,b) => a.index - b.index).map(x => x.embedding);
        embeddings.push(...batchEmb);
        processed += batch.length;
        
        if (result.usage) {
          totalCost += (result.usage.total_tokens / 1000000) * 0.02;
        }
        
        const progress = (processed / texts.length * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
        const rate = (processed / (Date.now() - startTime) * 1000).toFixed(1);
        
        if (processed % 500 === 0 || processed === texts.length) {
          logger.info(` ${processed}/${texts.length} (${progress}%) - ${elapsed}min - ${rate}/sec - $${totalCost.toFixed(4)}`);
        }
        
        await new Promise(r => setTimeout(r, 50));
      } catch (error) {
        logger.error(`Batch failed:`, error.message);
        embeddings.push(...Array(batch.length).fill(null));
      }
    }

    const duration = ((Date.now() - startTime) / 60000).toFixed(2);
    logger.info(` Done in ${duration}min - Total cost: $${totalCost.toFixed(4)}`);
    
    return embeddings.filter(e => e !== null);
  }

  getDimension() { return this.dimension; }
}

module.exports = new OpenAIEmbeddingService();


