/**
 * Embedding Service
 * Generates embeddings using HuggingFace Inference API
 */

const { HfInference } = require('@huggingface/inference');
const logger = require('../utils/logger');
const config = require('../config');

class EmbeddingService {
  constructor() {
    this.hf = new HfInference(config.huggingface.apiKey);
    this.model = config.huggingface.model;
    this.dimension = config.huggingface.dimension;
  }

  /**
   * Generate embedding for a single text with retry logic
   */
  async generateEmbedding(text, retries = 3) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text provided for embedding');
      }

      // Truncate if too long (max 512 tokens for most models)
      const maxChars = 2000; // ~500 tokens
      const truncatedText = text.length > maxChars 
        ? text.substring(0, maxChars) 
        : text;

      let lastError;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const embedding = await this.hf.featureExtraction({
            model: this.model,
            inputs: truncatedText,
          });

          // HF returns array, ensure it's the right dimension
          if (!Array.isArray(embedding) || embedding.length !== this.dimension) {
            throw new Error(`Invalid embedding dimension: ${embedding?.length}`);
          }

          return embedding;
        } catch (err) {
          lastError = err;
          logger.warn(`Embedding attempt ${attempt}/${retries} failed: ${err.message}`);
          
          if (attempt < retries) {
            // Exponential backoff: 2s, 4s, 8s
            const waitTime = Math.pow(2, attempt) * 1000;
            logger.info(`Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      throw lastError;
    } catch (error) {
      logger.error('Error generating embedding:', error.message);
      logger.error('Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async generateBatchEmbeddings(texts, batchSize = 5) {
    logger.info(`Generating embeddings for ${texts.length} texts...`);
    logger.info(`Using batch size: ${batchSize}, with rate limiting`);
    
    const embeddings = [];
    const total = texts.length;
    let processed = 0;
    let errors = 0;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        // Process batch sequentially to avoid rate limits
        const batchEmbeddings = [];
        for (const text of batch) {
          try {
            const embedding = await this.generateEmbedding(text);
            batchEmbeddings.push(embedding);
            processed++;
            
            // Small delay between each request
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            logger.error(`Failed to generate embedding for text: ${text.substring(0, 50)}...`);
            errors++;
            throw error;
          }
        }
        
        embeddings.push(...batchEmbeddings);
        
        const progress = ((processed / total) * 100).toFixed(1);
        logger.info(`✅ Embedding progress: ${processed}/${total} (${progress}%) - Errors: ${errors}`);
        
        // Rate limiting: wait 2 seconds between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        logger.error(`❌ Error in batch ${i}-${i + batchSize}:`, error.message);
        logger.error('This batch will be skipped. You may need to re-run ingestion.');
        throw error;
      }
    }

    logger.info(`Successfully generated ${embeddings.length} embeddings (${errors} errors)`);
    return embeddings;
  }

  /**
   * Get embedding dimension
   */
  getDimension() {
    return this.dimension;
  }
}

module.exports = new EmbeddingService();