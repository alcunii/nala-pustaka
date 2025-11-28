/**
 * Manuscript Loader Service
 * Loads manuscripts from data_naskah_sastra_org directory
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class ManuscriptLoader {
  constructor() {
    this.dataDir = path.join(__dirname, '../../../data_naskah_sastra_org');
  }

  /**
   * Parse manuscript filename to extract metadata
   * Format: "0001_Title, Author, Year, #ID.txt"
   */
  parseFilename(filename) {
    try {
      const nameWithoutExt = filename.replace('.txt', '');
      const parts = nameWithoutExt.split('_');
      
      if (parts.length < 2) {
        return {
          title: nameWithoutExt,
          author: 'Tidak Diketahui',
          year: null,
          sourceId: null
        };
      }

      const metadata = parts.slice(1).join('_');
      const metaParts = metadata.split(',').map(p => p.trim());
      
      const title = metaParts[0] || nameWithoutExt;
      const author = metaParts[1] || 'Tidak Diketahui';
      const year = metaParts[2] || null;
      const sourceId = metaParts[3] ? metaParts[3].replace('#', '').trim() : null;

      return { title, author, year, sourceId };
    } catch (error) {
      logger.warn(`Failed to parse filename: ${filename}`, error.message);
      return {
        title: filename.replace('.txt', ''),
        author: 'Tidak Diketahui',
        year: null,
        sourceId: null
      };
    }
  }

  /**
   * Parse manuscript content to extract URL and clean text
   */
  parseContent(content) {
    try {
      const lines = content.split('\n');
      let url = null;
      let fullText = content;

      // Try to find URL in first few lines
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        if (line.startsWith('URL:') || line.startsWith('https://www.sastra.org')) {
          url = line.replace('URL:', '').trim();
          break;
        }
      }

      // Clean text: remove header lines
      const textLines = lines.filter((line, idx) => {
        if (idx < 10) {
          // Skip common header patterns
          if (line.startsWith('Judul:')) return false;
          if (line.startsWith('URL:')) return false;
          if (line.includes('====')) return false;
          if (line.startsWith('Pencarian Teks')) return false;
          if (line.startsWith('Terakhir diubah:')) return false;
        }
        return true;
      });

      fullText = textLines.join('\n').trim();

      return { url, fullText };
    } catch (error) {
      logger.warn('Failed to parse content', error.message);
      return { url: null, fullText: content };
    }
  }

  /**
   * Load a single manuscript from file
   */
  loadManuscript(filePath, category = null) {
    try {
      const filename = path.basename(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const { title, author, year, sourceId } = this.parseFilename(filename);
      const { url, fullText } = this.parseContent(content);

      // Generate unique ID based on file path
      const manuscriptId = `ms_${sourceId || path.basename(filePath, '.txt')}`;

      return {
        manuscriptId,
        title,
        author,
        year,
        sourceUrl: url,
        fullText,
        category,
        filename,
        filePath,
        textLength: fullText.length
      };
    } catch (error) {
      logger.error(`Failed to load manuscript: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Recursively scan directory and load all manuscripts
   */
  scanDirectory(dir, category = null) {
    const manuscripts = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Use directory name as category if not set
          const subCategory = category || item;
          const subManuscripts = this.scanDirectory(fullPath, subCategory);
          manuscripts.push(...subManuscripts);
        } else if (item.endsWith('.txt')) {
          const manuscript = this.loadManuscript(fullPath, category);
          if (manuscript && manuscript.fullText.length > 100) {
            manuscripts.push(manuscript);
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to scan directory: ${dir}`, error);
    }

    return manuscripts;
  }

  /**
   * Load all manuscripts from data directory
   */
  loadAll(limit = null) {
    logger.info('========================================');
    logger.info(' Loading manuscripts from file system...');
    logger.info(`Data directory: ${this.dataDir}`);
    logger.info('========================================');

    if (!fs.existsSync(this.dataDir)) {
      throw new Error(`Data directory not found: ${this.dataDir}`);
    }

    const manuscripts = this.scanDirectory(this.dataDir);

    // Apply limit if specified (for testing)
    const result = limit ? manuscripts.slice(0, limit) : manuscripts;

    logger.info(` Loaded ${result.length} manuscripts`);
    
    // Log statistics
    const stats = {
      total: result.length,
      categories: [...new Set(result.map(m => m.category))].length,
      avgLength: Math.round(result.reduce((sum, m) => sum + m.textLength, 0) / result.length),
      withUrl: result.filter(m => m.sourceUrl).length,
      withYear: result.filter(m => m.year).length
    };

    logger.info(' Statistics:');
    logger.info(`   - Total manuscripts: ${stats.total}`);
    logger.info(`   - Categories: ${stats.categories}`);
    logger.info(`   - Average length: ${stats.avgLength} characters`);
    logger.info(`   - With URL: ${stats.withUrl}`);
    logger.info(`   - With year: ${stats.withYear}`);

    return result;
  }

  /**
   * Load manuscripts by category
   */
  loadByCategory(category) {
    const categoryPath = path.join(this.dataDir, category);
    
    if (!fs.existsSync(categoryPath)) {
      throw new Error(`Category not found: ${category}`);
    }

    return this.scanDirectory(categoryPath, category);
  }

  /**
   * Get available categories
   */
  getCategories() {
    try {
      const items = fs.readdirSync(this.dataDir);
      return items.filter(item => {
        const fullPath = path.join(this.dataDir, item);
        return fs.statSync(fullPath).isDirectory();
      });
    } catch (error) {
      logger.error('Failed to get categories', error);
      return [];
    }
  }
}

module.exports = new ManuscriptLoader();