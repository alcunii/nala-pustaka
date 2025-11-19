/**
 * LLM Clustering Service
 * Uses Gemini AI to analyze clusters and make intelligent merge decisions
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const config = require('../config');

class LLMClusteringService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
    this.totalCost = { input: 0, output: 0 };
  }

  /**
   * Build prompt for cluster analysis
   */
  buildClusterAnalysisPrompt(representatives) {
    const manuscriptsSummary = representatives.map((m, idx) => {
      const preview = m.fullText.substring(0, 800);
      return `
[Naskah ${idx + 1}]
Judul: ${m.title}
Pengarang: ${m.author || 'Tidak Diketahui'}
Tahun: ${m.year || 'Tidak Diketahui'}
Kategori: ${m.category}
Cuplikan: ${preview}...
---`;
    }).join('\n');

    return `Anda adalah ahli filologi dan sastra Jawa. Tugas Anda adalah menganalisis sekelompok naskah-naskah kuno Jawa yang telah dikelompokkan berdasarkan kemiripan konten.

NASKAH-NASKAH DALAM CLUSTER:
${manuscriptsSummary}

TUGAS ANDA:
1. Analisis tema dan konten utama dari naskah-naskah ini
2. Tentukan apakah naskah-naskah ini sebaiknya digabungkan atau tetap terpisah
3. Jika digabungkan, buat judul yang merepresentasikan semua naskah
4. Buat deskripsi singkat (150-300 kata) yang menjelaskan:
   - Tema utama naskah-naskah ini
   - Konteks historis dan budaya
   - Tokoh atau peristiwa penting (jika ada)
   - Nilai penting dalam khazanah sastra Jawa

KRITERIA PENGGABUNGAN:
- GABUNG PENUH: Jika naskah-naskah adalah versi berbeda dari cerita yang sama, atau membahas topik yang sangat spesifik dan sama
- GABUNG SEBAGIAN: Jika ada beberapa naskah yang sangat mirip tapi ada yang unik
- PISAH: Jika naskah-naskah membahas tema berbeda meski dalam kategori sama

Berikan respons dalam format JSON:
{
  "shouldMerge": true/false,
  "mergeStrategy": "full" atau "partial" atau "keep_separate",
  "mergedTitle": "Judul gabungan (jika merge)",
  "description": "Deskripsi lengkap dalam bahasa Indonesia",
  "reasoning": "Alasan keputusan merge",
  "keyManuscripts": [index naskah yang paling penting, misal: [0, 2]]
}`;
  }

  /**
   * Analyze a single cluster using Gemini
   */
  async analyzeCluster(clusterId, clusterData, retries = 3) {
    try {
      const { representatives } = clusterData;

      logger.info(` Analyzing cluster ${clusterId} (${clusterData.size} manuscripts)...`);

      const prompt = this.buildClusterAnalysisPrompt(representatives);
      
      // Estimate token count (rough)
      const inputTokens = Math.ceil(prompt.length / 4);
      
      let lastError;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const result = await this.model.generateContent(prompt);
          const response = result.response;
          const text = response.text();

          // Estimate output tokens
          const outputTokens = Math.ceil(text.length / 4);
          
          // Track costs
          this.totalCost.input += inputTokens;
          this.totalCost.output += outputTokens;

          // Parse JSON response
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON found in response');
          }

          const analysis = JSON.parse(jsonMatch[0]);

          logger.info(`    Cluster ${clusterId}: ${analysis.mergeStrategy} - ${analysis.mergedTitle || 'No merge'}`);

          return {
            clusterId,
            clusterSize: clusterData.size,
            ...analysis,
            inputTokens,
            outputTokens
          };

        } catch (err) {
          lastError = err;
          logger.warn(`     Attempt ${attempt}/${retries} failed: ${err.message}`);
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          }
        }
      }

      throw lastError;

    } catch (error) {
      logger.error(` Error analyzing cluster ${clusterId}:`, error.message);
      
      // Return safe default
      return {
        clusterId,
        clusterSize: clusterData.size,
        shouldMerge: false,
        mergeStrategy: 'keep_separate',
        mergedTitle: clusterData.manuscripts[0].title,
        description: `Cluster ${clusterId} - ${clusterData.size} naskah`,
        reasoning: 'Error during analysis, keeping separate',
        keyManuscripts: [0],
        error: error.message
      };
    }
  }

  /**
   * Analyze all clusters in batches
   */
  async analyzeAllClusters(clusters, options = {}) {
    const {
      batchSize = 1, // Process one at a time to respect rate limits
      delayBetweenBatches = 1000
    } = options;

    const clusterEntries = Object.entries(clusters);
    const analyses = [];

    logger.info('========================================');
    logger.info(' Starting LLM cluster analysis...');
    logger.info(`   - Total clusters: ${clusterEntries.length}`);
    logger.info(`   - Batch size: ${batchSize}`);
    logger.info('========================================');

    for (let i = 0; i < clusterEntries.length; i += batchSize) {
      const batch = clusterEntries.slice(i, i + batchSize);
      
      logger.info(` Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(clusterEntries.length / batchSize)}...`);

      const batchResults = await Promise.all(
        batch.map(([clusterId, clusterData]) => 
          this.analyzeCluster(clusterId, clusterData)
        )
      );

      analyses.push(...batchResults);

      // Progress update
      const progress = ((analyses.length / clusterEntries.length) * 100).toFixed(1);
      logger.info(`   Progress: ${analyses.length}/${clusterEntries.length} (${progress}%)`);

      // Delay between batches
      if (i + batchSize < clusterEntries.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    // Calculate statistics
    const mergeStats = {
      full: analyses.filter(a => a.mergeStrategy === 'full').length,
      partial: analyses.filter(a => a.mergeStrategy === 'partial').length,
      separate: analyses.filter(a => a.mergeStrategy === 'keep_separate').length,
      errors: analyses.filter(a => a.error).length
    };

    // Calculate costs
    const costUSD = {
      input: (this.totalCost.input / 1_000_000) * 0.10,
      output: (this.totalCost.output / 1_000_000) * 0.40,
      total: 0
    };
    costUSD.total = costUSD.input + costUSD.output;

    logger.info('========================================');
    logger.info(' LLM analysis completed!');
    logger.info('========================================');
    logger.info(' Merge Statistics:');
    logger.info(`   - Full merge: ${mergeStats.full}`);
    logger.info(`   - Partial merge: ${mergeStats.partial}`);
    logger.info(`   - Keep separate: ${mergeStats.separate}`);
    logger.info(`   - Errors: ${mergeStats.errors}`);
    logger.info('');
    logger.info(' Cost Summary:');
    logger.info(`   - Input tokens: ${this.totalCost.input.toLocaleString()}`);
    logger.info(`   - Output tokens: ${this.totalCost.output.toLocaleString()}`);
    logger.info(`   - Input cost: $${costUSD.input.toFixed(4)}`);
    logger.info(`   - Output cost: $${costUSD.output.toFixed(4)}`);
    logger.info(`   - Total cost: $${costUSD.total.toFixed(4)} USD`);
    logger.info('========================================');

    return {
      analyses,
      mergeStats,
      costUSD,
      totalTokens: this.totalCost
    };
  }

  /**
   * Generate description for a merged manuscript
   */
  async generateDescription(manuscript, sourceManuscripts = []) {
    try {
      const textPreview = manuscript.fullText.substring(0, 2000);
      
      const prompt = `Anda adalah ahli filologi dan sastra Jawa. Buatkan deskripsi lengkap untuk naskah berikut:

JUDUL: ${manuscript.title}
PENGARANG: ${manuscript.author || 'Tidak Diketahui'}
TAHUN: ${manuscript.year || 'Tidak Diketahui'}
KATEGORI: ${manuscript.category}

CUPLIKAN TEKS:
${textPreview}

${sourceManuscripts.length > 0 ? `
CATATAN: Naskah ini adalah hasil penggabungan dari ${sourceManuscripts.length} naskah terkait.
` : ''}

Buatkan deskripsi komprehensif (300-500 kata) dalam bahasa Indonesia yang mencakup:
1. Ringkasan isi dan tema utama
2. Konteks historis dan budaya
3. Tokoh-tokoh atau peristiwa penting
4. Nilai dan signifikansi dalam khazanah sastra Jawa/Indonesia
5. Gaya penulisan atau keunikan naskah

Gunakan bahasa yang informatif namun mudah dipahami oleh pembaca umum.`;

      const result = await this.model.generateContent(prompt);
      const description = result.response.text();

      // Track tokens
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(description.length / 4);
      this.totalCost.input += inputTokens;
      this.totalCost.output += outputTokens;

      return description.trim();

    } catch (error) {
      logger.error('Error generating description:', error.message);
      return `${manuscript.title} adalah naskah dari kategori ${manuscript.category}. Naskah ini memiliki panjang ${manuscript.fullText.length} karakter.`;
    }
  }

  /**
   * Get current cost statistics
   */
  getCostStats() {
    const costUSD = {
      input: (this.totalCost.input / 1_000_000) * 0.10,
      output: (this.totalCost.output / 1_000_000) * 0.40,
      total: 0
    };
    costUSD.total = costUSD.input + costUSD.output;

    return {
      tokens: this.totalCost,
      costUSD
    };
  }
}

module.exports = new LLMClusteringService();