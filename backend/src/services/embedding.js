/**
 * Embedding Service
 * Generates embeddings using HuggingFace Inference Providers
 */

const logger = require('../utils/logger');
const config = require('../config');

class EmbeddingService {
  constructor() {
    this.apiKey = config.huggingface.apiKey;
    this.model = config.huggingface.model;
    this.dimension = config.huggingface.dimension;
    this.provider = config.huggingface.provider || 'auto';
    
    // Build API endpoint based on provider
    if (this.provider === 'nebius') {
      this.endpoint = 'https://router.huggingface.co/nebius/v1/embeddings';
    } else if (this.provider === 'sambanova') {
      this.endpoint = 'https://router.huggingface.co/sambanova/v1/embeddings';
    } else if (this.provider === 'scaleway') {
      this.endpoint = 'https://router.huggingface.co/scaleway/v1/embeddings';
    } else {
      // Use HuggingFace default Inference API
      this.endpoint = 'https://api-inference.huggingface.co/models/' + this.model;
    }
    
    logger.info(` Embedding service initialized:`);
    logger.info(`   Model: ${this.model}`);
    logger.info(`   Provider: ${this.provider}`);
    logger.info(`   Dimension: ${this.dimension}`);
    logger.info(`   Endpoint: ${this.endpoint}`);
  }

  /**
   * Generate embedding for a single text with retry logic
   */
  async generateEmbedding(text, retries = 3) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text provided for embedding');
      }

      // Truncate if too long (Qwen3 supports 32k tokens, but we limit for safety)
      const maxChars = 8000; // ~2000 tokens
      const truncatedText = text.length > maxChars 
        ? text.substring(0, maxChars) 
        : text;

      let lastError;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          // Build request payload
          const payload = this.provider === 'nebius' || this.provider === 'sambanova' || this.provider === 'scaleway'
            ? { model: this.model, input: truncatedText } // Inference Providers format
            : { inputs: truncatedText }; // Default HF format
          
          // Make HTTP request
          const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          
          // Extract embedding based on response format
          let embedding;
          if (result.data && Array.isArray(result.data) && result.data[0]?.embedding) {
            // Inference Providers format: { data: [{ embedding: [...] }] }
            embedding = result.data[0].embedding;
          } else if (Array.isArray(result)) {
            // Default HF format: [0.1, 0.2, ...]
            embedding = result;
          } else {
            throw new Error(`Unexpected response format: ${JSON.stringify(result).substring(0, 200)}`);
          }

          // Validate dimension
          if (!Array.isArray(embedding) || embedding.length !== this.dimension) {
            throw new Error(`Invalid embedding dimension: expected ${this.dimension}, got ${embedding?.length}`);
          }

          return embedding;
        } catch (err) {
          lastError = err;
          
          // Only log and retry on rate limit or network errors
          if (err.message.includes('rate limit') || err.message.includes('ECONNRESET')) {
            logger.warn(`Embedding attempt ${attempt}/${retries} failed: ${err.message}`);
            
            if (attempt < retries) {
              // Exponential backoff: 1s, 2s (reduced from 2s, 4s, 8s)
              const waitTime = Math.pow(2, attempt - 1) * 1000;
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          } else {
            // Other errors, throw immediately
            throw err;
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
   * Generate embedding for MULTIPLE texts in ONE request (Batch API)
   */
  async generateBatchEmbedding(texts, retries = 3) {
    try {
      if (!texts || texts.length === 0) {
        throw new Error('Empty texts array provided');
      }

      // Truncate each text if needed
      const maxChars = 8000;
      const truncatedTexts = texts.map(text => 
        text.length > maxChars ? text.substring(0, maxChars) : text
      );

      let lastError;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          // Build request payload - send ARRAY of texts
          const payload = this.provider === 'nebius' || this.provider === 'sambanova' || this.provider === 'scaleway'
            ? { model: this.model, input: truncatedTexts } // Array of texts!
            : { inputs: truncatedTexts };
          
          const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          
          // Extract embeddings - should be array of embeddings
          let embeddings;
          if (result.data && Array.isArray(result.data)) {
            // Inference Providers format: { data: [{embedding: [...]}, {embedding: [...]}, ...] }
            embeddings = result.data.map(item => item.embedding);
          } else if (Array.isArray(result)) {
            // Default HF format: [[0.1, 0.2, ...], [0.3, 0.4, ...], ...]
            embeddings = result;
          } else {
            throw new Error(`Unexpected batch response format`);
          }

          // Validate
          if (!Array.isArray(embeddings) || embeddings.length !== texts.length) {
            throw new Error(`Expected ${texts.length} embeddings, got ${embeddings?.length}`);
          }

          // Validate each embedding dimension
          for (const emb of embeddings) {
            if (!Array.isArray(emb) || emb.length !== this.dimension) {
              throw new Error(`Invalid embedding dimension: expected ${this.dimension}, got ${emb?.length}`);
            }
          }

          return embeddings;
        } catch (err) {
          lastError = err;
          
          if (err.message.includes('rate limit') || err.message.includes('429')) {
            logger.warn(`Batch embedding attempt ${attempt}/${retries} failed: ${err.message}`);
            
            if (attempt < retries) {
              const waitTime = Math.pow(2, attempt - 1) * 1000;
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          } else {
            throw err;
          }
        }
      }

      throw lastError;
    } catch (error) {
      logger.error('Error generating batch embedding:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (OPTIMIZED with Batch API)
   */
  async generateBatchEmbeddings(texts, batchSize = 50) {
    logger.info(`Generating embeddings for ${texts.length} texts...`);
    logger.info(`Using OPTIMIZED batch API: batchSize=${batchSize}, provider=${this.provider}`);
    
    const embeddings = [];
    const total = texts.length;
    let processed = 0;
    const startTime = Date.now();

    // Process in batches using batch embedding API (multiple texts per request!)
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, Math.min(i + batchSize, texts.length));
      
      try {
        // Send ENTIRE batch in ONE request (much faster!)
        const batchEmbeddings = await this.generateBatchEmbedding(batch);
        embeddings.push(...batchEmbeddings);
        processed += batch.length;
        
        // Log progress
        const progress = ((processed / total) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        const rate = (processed / (Date.now() - startTime) * 1000).toFixed(1);
        
        if (processed % 100 === 0 || processed === total) {
          logger.info(` Embedding progress: ${processed}/${total} (${progress}%) - ${elapsed}min elapsed - ${rate} embeddings/sec`);
        }
        
        // Small delay between batches (much shorter now!)
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }
      } catch (error) {
        logger.error(`Batch ${i}-${i + batch.length} failed:`, error.message);
        // Fallback: process individually
        logger.warn('Falling back to individual processing...');
        for (const text of batch) {
          try {
            const emb = await this.generateEmbedding(text);
            embeddings.push(emb);
            processed++;
          } catch (err) {
            logger.error(`Failed to embed text:`, err.message);
            embeddings.push(null);
          }
        }
      }
    }

    // Filter out null values (from errors)
    const validEmbeddings = embeddings.filter(e => e !== null && e !== undefined);

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    logger.info(` Completed in ${duration} minutes`);
    logger.info(`Successfully generated ${validEmbeddings.length} embeddings (${errors} errors)`);
    
    return validEmbeddings;
  }

  /**
   * Get embedding dimension
   */
  getDimension() {
    return this.dimension;
  }
}

module.exports = new EmbeddingService();