/**
 * Manuscript Merger Service
 * Merges manuscripts based on LLM analysis decisions
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class ManuscriptMerger {
  /**
   * Merge manuscripts with full strategy
   */
  mergeFullStrategy(clusterData, analysis) {
    const { manuscripts, representatives } = clusterData;
    
    // Use first representative as base
    const baseManuscript = representatives[0];
    
    // Combine all full texts with separators
    const combinedText = manuscripts.map((m, idx) => {
      return `\n\n========== ${m.title} ==========\n${m.fullText}`;
    }).join('\n\n');

    // Collect all source IDs
    const sourceIds = manuscripts.map(m => m.manuscriptId);
    
    // Get unique authors
    const authors = [...new Set(manuscripts.map(m => m.author).filter(a => a && a !== 'Tidak Diketahui'))];
    const mergedAuthor = authors.length > 0 ? authors.join('; ') : 'Tidak Diketahui';

    // Get year range
    const years = manuscripts.map(m => m.year).filter(y => y && y !== 'N/A');
    const mergedYear = years.length > 0 ? years.sort().join('-') : null;

    return {
      id: uuidv4(),
      title: analysis.mergedTitle || baseManuscript.title,
      author: mergedAuthor,
      year: mergedYear,
      source_url: baseManuscript.sourceUrl,
      full_text: combinedText,
      description: analysis.description,
      cluster_id: analysis.clusterId,
      source_manuscript_ids: sourceIds,
      is_clustered: true,
      cluster_size: manuscripts.length,
      merge_strategy: 'full',
      llm_analysis: {
        reasoning: analysis.reasoning,
        keyManuscripts: analysis.keyManuscripts
      },
      clustering_method: 'llm-clustering'
    };
  }

  /**
   * Merge manuscripts with partial strategy
   */
  mergePartialStrategy(clusterData, analysis) {
    const { manuscripts, representatives } = clusterData;
    
    // Select key manuscripts as identified by LLM
    const keyIndices = analysis.keyManuscripts || [0, 1, 2];
    const keyManuscripts = keyIndices
      .map(idx => representatives[idx])
      .filter(m => m);

    // Combine only key manuscripts
    let combinedText = keyManuscripts.map((m, idx) => {
      return `\n\n========== ${m.title} ==========\n${m.fullText}`;
    }).join('\n\n');

    // Add reference to other manuscripts
    const otherManuscripts = manuscripts.filter(
      m => !keyManuscripts.find(km => km.manuscriptId === m.manuscriptId)
    );
    
    if (otherManuscripts.length > 0) {
      const references = otherManuscripts.map(m => m.title).join(', ');
      combinedText += `\n\n========== Naskah Terkait ==========\n${references}`;
    }

    const sourceIds = manuscripts.map(m => m.manuscriptId);
    const baseManuscript = keyManuscripts[0];

    const authors = [...new Set(keyManuscripts.map(m => m.author).filter(a => a && a !== 'Tidak Diketahui'))];
    const mergedAuthor = authors.length > 0 ? authors.join('; ') : 'Tidak Diketahui';

    return {
      id: uuidv4(),
      title: analysis.mergedTitle || baseManuscript.title,
      author: mergedAuthor,
      year: baseManuscript.year,
      source_url: baseManuscript.sourceUrl,
      full_text: combinedText,
      description: analysis.description,
      cluster_id: analysis.clusterId,
      source_manuscript_ids: sourceIds,
      is_clustered: true,
      cluster_size: manuscripts.length,
      merge_strategy: 'partial',
      llm_analysis: {
        reasoning: analysis.reasoning,
        keyManuscripts: analysis.keyManuscripts
      },
      clustering_method: 'llm-clustering'
    };
  }

  /**
   * Keep manuscripts separate (single representative)
   */
  keepSeparateStrategy(clusterData, analysis) {
    const { representatives } = clusterData;
    
    // Use the most representative manuscript
    const baseManuscript = representatives[0];

    return {
      id: uuidv4(),
      title: baseManuscript.title,
      author: baseManuscript.author || 'Tidak Diketahui',
      year: baseManuscript.year,
      source_url: baseManuscript.sourceUrl,
      full_text: baseManuscript.fullText,
      description: analysis.description,
      cluster_id: analysis.clusterId,
      source_manuscript_ids: [baseManuscript.manuscriptId],
      is_clustered: true,
      cluster_size: 1,
      merge_strategy: 'keep_separate',
      llm_analysis: {
        reasoning: analysis.reasoning
      },
      clustering_method: 'llm-clustering'
    };
  }

  /**
   * Merge cluster based on analysis
   */
  mergeCluster(clusterData, analysis) {
    try {
      const strategy = analysis.mergeStrategy;

      switch (strategy) {
        case 'full':
          return this.mergeFullStrategy(clusterData, analysis);
        
        case 'partial':
          return this.mergePartialStrategy(clusterData, analysis);
        
        case 'keep_separate':
          return this.keepSeparateStrategy(clusterData, analysis);
        
        default:
          logger.warn(`Unknown merge strategy: ${strategy}, using keep_separate`);
          return this.keepSeparateStrategy(clusterData, analysis);
      }
    } catch (error) {
      logger.error(`Error merging cluster ${analysis.clusterId}:`, error);
      // Fallback to keep separate
      return this.keepSeparateStrategy(clusterData, analysis);
    }
  }

  /**
   * Process all clusters and analyses
   */
  processAllClusters(clusters, analyses) {
    logger.info('========================================');
    logger.info(' Merging manuscripts based on analysis...');
    logger.info(`   - Total clusters: ${analyses.length}`);
    logger.info('========================================');

    const mergedManuscripts = [];
    const stats = {
      full: 0,
      partial: 0,
      separate: 0,
      errors: 0
    };

    for (const analysis of analyses) {
      try {
        const clusterData = clusters[analysis.clusterId];
        
        if (!clusterData) {
          logger.warn(`Cluster ${analysis.clusterId} not found, skipping...`);
          stats.errors++;
          continue;
        }

        const merged = this.mergeCluster(clusterData, analysis);
        mergedManuscripts.push(merged);

        // Update stats
        if (analysis.mergeStrategy === 'full') stats.full++;
        else if (analysis.mergeStrategy === 'partial') stats.partial++;
        else stats.separate++;

      } catch (error) {
        logger.error(`Error processing cluster ${analysis.clusterId}:`, error);
        stats.errors++;
      }
    }

    // Calculate reduction
    const originalCount = Object.values(clusters).reduce(
      (sum, cluster) => sum + cluster.size,
      0
    );
    const reductionPercent = (
      ((originalCount - mergedManuscripts.length) / originalCount) * 100
    ).toFixed(1);

    logger.info('========================================');
    logger.info(' Merging completed!');
    logger.info('========================================');
    logger.info(' Merge Statistics:');
    logger.info(`   - Full merges: ${stats.full}`);
    logger.info(`   - Partial merges: ${stats.partial}`);
    logger.info(`   - Kept separate: ${stats.separate}`);
    logger.info(`   - Errors: ${stats.errors}`);
    logger.info('');
    logger.info(' Reduction:');
    logger.info(`   - Original manuscripts: ${originalCount}`);
    logger.info(`   - Final manuscripts: ${mergedManuscripts.length}`);
    logger.info(`   - Reduction: ${reductionPercent}%`);
    logger.info('========================================');

    return {
      manuscripts: mergedManuscripts,
      stats,
      originalCount,
      reductionPercent
    };
  }
}

module.exports = new ManuscriptMerger();