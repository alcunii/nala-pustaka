/**
 * Vector Database Service (Pinecone)
 * Handles vector storage and similarity search
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');
const config = require('../config');

class VectorDBService {
  constructor() {
    this.pinecone = null;
    this.index = null;
    this.indexName = config.pinecone.indexName;
  }

  /**
   * Initialize Pinecone connection
   */
  async initialize() {
    try {
      logger.info('Initializing Pinecone...');
      
      this.pinecone = new Pinecone({
        apiKey: config.pinecone.apiKey,
      });

      // Get index
      this.index = this.pinecone.index(this.indexName);
      
      // Verify index exists
      const stats = await this.index.describeIndexStats();
      logger.info(`Connected to Pinecone index: ${this.indexName}`);
      logger.info(`Index stats:`, stats);
      
      return true;
    } catch (error) {
      logger.error('Error initializing Pinecone:', error.message);
      throw error;
    }
  }

  /**
   * Upsert vectors to Pinecone
   */
  async upsert(vectors) {
    try {
      if (!this.index) {
        await this.initialize();
      }

      if (!vectors || vectors.length === 0) {
        throw new Error('No vectors provided for upsert');
      }

      logger.info(`Upserting ${vectors.length} vectors to Pinecone...`);

      // Pinecone expects format: { id, values, metadata }
      const formattedVectors = vectors.map(v => ({
        id: v.id,
        values: v.values,
        metadata: v.metadata || {},
      }));

      // Batch upsert (max 100 vectors per batch)
      const batchSize = 100;
      let upserted = 0;

      for (let i = 0; i < formattedVectors.length; i += batchSize) {
        const batch = formattedVectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
        upserted += batch.length;
        
        const progress = ((upserted / formattedVectors.length) * 100).toFixed(1);
        logger.info(`Upsert progress: ${upserted}/${formattedVectors.length} (${progress}%)`);
      }

      logger.info(`Successfully upserted ${upserted} vectors`);
      return upserted;
    } catch (error) {
      logger.error('Error upserting vectors:', error.message);
      throw error;
    }
  }

  /**
   * Query vectors by similarity
   */
  async query(queryVector, options = {}) {
    try {
      if (!this.index) {
        await this.initialize();
      }

      const {
        topK = 5,
        filter = null,
        includeMetadata = true,
      } = options;

      logger.debug(`Querying Pinecone with topK=${topK}`);

      const queryResponse = await this.index.query({
        vector: queryVector,
        topK,
        filter,
        includeMetadata,
      });

      const results = queryResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      }));

      logger.debug(`Found ${results.length} results`);
      return results;
    } catch (error) {
      logger.error('Error querying vectors:', error.message);
      throw error;
    }
  }

  /**
   * Delete vectors by IDs
   */
  async delete(ids) {
    try {
      if (!this.index) {
        await this.initialize();
      }

      if (!ids || ids.length === 0) {
        throw new Error('No IDs provided for deletion');
      }

      logger.info(`Deleting ${ids.length} vectors from Pinecone...`);
      await this.index.deleteMany(ids);
      logger.info('Vectors deleted successfully');
      
      return true;
    } catch (error) {
      logger.error('Error deleting vectors:', error.message);
      throw error;
    }
  }

  /**
   * Delete all vectors (use with caution!)
   */
  async deleteAll() {
    try {
      if (!this.index) {
        await this.initialize();
      }

      logger.warn('Deleting ALL vectors from Pinecone...');
      await this.index.deleteAll();
      logger.info('All vectors deleted');
      
      return true;
    } catch (error) {
      logger.error('Error deleting all vectors:', error.message);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getStats() {
    try {
      if (!this.index) {
        await this.initialize();
      }

      const stats = await this.index.describeIndexStats();
      return stats;
    } catch (error) {
      logger.error('Error getting index stats:', error.message);
      throw error;
    }
  }

  /**
   * Get all chunks for a specific manuscript by manuscriptId
   */
  async getByManuscriptId(manuscriptId) {
    try {
      if (!this.index) {
        await this.initialize();
      }

      logger.info(`Fetching all chunks for manuscriptId: ${manuscriptId}`);
      const dummyVector = new Array(768).fill(0);
      
      const queryResponse = await this.index.query({
        vector: dummyVector,
        topK: 10000,
        includeMetadata: true,
        filter: { manuscriptId: { $eq: manuscriptId } }
      });
      
      const matchCount = queryResponse.matches?.length || 0;
      logger.info(`Found ${matchCount} chunks for manuscriptId: ${manuscriptId}`);
      return queryResponse.matches || [];
    } catch (error) {
      logger.error(`getByManuscriptId error:`, error);
      throw error;
    }
  }
}

module.exports = new VectorDBService();

