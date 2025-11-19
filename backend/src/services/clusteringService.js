/**
 * Clustering Service
 * Performs K-means clustering on manuscript embeddings
 */

const { kmeans } = require('ml-kmeans');
const logger = require('../utils/logger');
const embeddingService = require('./embedding');

class ClusteringService {
  /**
   * Generate embeddings for all manuscripts
   */
  async generateEmbeddings(manuscripts) {
    logger.info('========================================');
    logger.info(' Generating embeddings for manuscripts...');
    logger.info(`Total manuscripts: ${manuscripts.length}`);
    logger.info('========================================');

    const texts = manuscripts.map(m => {
      // Combine title and first 1000 chars of text for embedding
      const preview = m.fullText.substring(0, 1000);
      return `${m.title}. ${preview}`;
    });

    logger.info(' This may take 30-45 minutes...');
    
    const embeddings = await embeddingService.generateBatchEmbeddings(
      texts,
      10 // batch size
    );

    logger.info(' Embeddings generated successfully!');
    return embeddings;
  }

  /**
   * Perform K-means clustering
   */
  performKMeans(embeddings, k = 500) {
    logger.info('========================================');
    logger.info(` Performing K-means clustering (k=${k})...`);
    logger.info('========================================');

    const result = kmeans(embeddings, k, {
      initialization: 'kmeans++',
      maxIterations: 100
    });

    logger.info(' Clustering completed!');
    logger.info(`   - Clusters: ${result.clusters.length}`);
    logger.info(`   - Iterations: ${result.iterations}`);

    return {
      clusterIds: result.clusters, // Array of cluster IDs for each manuscript
      centroids: result.centroids,
      iterations: result.iterations
    };
  }

  /**
   * Group manuscripts by cluster
   */
  groupByCluster(manuscripts, clusterIds) {
    logger.info(' Grouping manuscripts by cluster...');

    const clusters = {};

    manuscripts.forEach((manuscript, index) => {
      const clusterId = clusterIds[index];
      
      if (!clusters[clusterId]) {
        clusters[clusterId] = [];
      }
      
      clusters[clusterId].push({
        ...manuscript,
        clusterIndex: index
      });
    });

    // Calculate statistics
    const clusterSizes = Object.values(clusters).map(c => c.length);
    const avgSize = (clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length).toFixed(1);
    const maxSize = Math.max(...clusterSizes);
    const minSize = Math.min(...clusterSizes);

    logger.info(' Grouping completed!');
    logger.info(`   - Total clusters: ${Object.keys(clusters).length}`);
    logger.info(`   - Average size: ${avgSize} manuscripts`);
    logger.info(`   - Size range: ${minSize} - ${maxSize}`);

    return clusters;
  }

  /**
   * Calculate distance from centroid for each manuscript in cluster
   */
  calculateDistances(cluster, embeddings, centroid) {
    return cluster.map(manuscript => {
      const embedding = embeddings[manuscript.clusterIndex];
      const distance = this.cosineSimilarity(embedding, centroid);
      return {
        ...manuscript,
        distanceFromCentroid: distance
      };
    });
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Select representative manuscripts from cluster (closest to centroid)
   */
  selectRepresentatives(cluster, embeddings, centroid, count = 5) {
    // Fallback if no centroid
    if (!centroid || !Array.isArray(centroid) || centroid.length === 0) {
      logger.warn('No valid centroid provided, returning first N manuscripts');
      return cluster.slice(0, Math.min(count, cluster.length));
    }
    
    const withDistances = this.calculateDistances(cluster, embeddings, centroid);
    
    // Sort by distance (higher = closer to centroid)
    withDistances.sort((a, b) => b.distanceFromCentroid - a.distanceFromCentroid);
    
    return withDistances.slice(0, Math.min(count, withDistances.length));
  }

  /**
   * Main clustering workflow
   */
  async clusterManuscripts(manuscripts, options = {}) {
    const {
      k = 500,
      representativeCount = 5
    } = options;

    try {
      logger.info('========================================');
      logger.info(' Starting clustering workflow...');
      logger.info(`   - Manuscripts: ${manuscripts.length}`);
      logger.info(`   - Target clusters: ${k}`);
      logger.info('========================================');

      // Step 1: Generate embeddings
      const embeddings = await this.generateEmbeddings(manuscripts);

      // Step 2: Perform K-means
      const { clusterIds, centroids } = this.performKMeans(embeddings, k);

      // Step 3: Group by cluster
      const clusters = this.groupByCluster(manuscripts, clusterIds);

      // Step 4: Select representatives for each cluster
      logger.info(' Selecting representative manuscripts...');
      const clustersWithReps = {};

      for (const [clusterId, clusterManuscripts] of Object.entries(clusters)) {
        const centroid = centroids[parseInt(clusterId)];
        
        // Handle invalid/missing centroid
        if (!centroid || !Array.isArray(centroid) || centroid.length === 0) {
          logger.warn(`Cluster ${clusterId}: Invalid centroid, using fallback`);
          clustersWithReps[clusterId] = {
            manuscripts: clusterManuscripts,
            representatives: clusterManuscripts.slice(0, Math.min(representativeCount, clusterManuscripts.length)),
            centroid: null,
            size: clusterManuscripts.length
          };
          continue;
        }
        
        const representatives = this.selectRepresentatives(
          clusterManuscripts,
          embeddings,
          centroid,
          representativeCount
        );

        clustersWithReps[clusterId] = {
          manuscripts: clusterManuscripts,
          representatives: representatives,
          centroid: centroid,
          size: clusterManuscripts.length
        };
      }

      logger.info(' Representatives selected!');
      logger.info('========================================');
      logger.info(' Clustering workflow completed!');
      logger.info('========================================');

      return {
        clusters: clustersWithReps,
        totalClusters: Object.keys(clustersWithReps).length,
        embeddings,
        centroids
      };

    } catch (error) {
      logger.error(' Error during clustering:', error);
      throw error;
    }
  }
}

module.exports = new ClusteringService();