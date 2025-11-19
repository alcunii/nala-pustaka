/**
 * Text Processor Service
 * Reads and parses manuscript files from data_naskah/naskah_babad
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

class TextProcessor {
  /**
   * Parse manuscript metadata from filename and content
   */
  parseMetadata(filename, content) {
    // Extract from filename: "001_Babad Bdhahipun ing Mangir, Sasrawinata, 1922, #930.txt"
    const filenameMatch = filename.match(/^(\d+)_(.+)\.txt$/);
    if (!filenameMatch) {
      throw new Error(`Invalid filename format: ${filename}`);
    }

    const [, number, titlePart] = filenameMatch;
    
    // Parse title part: "Title, Author, Year, #ID"
    const parts = titlePart.split(',').map(p => p.trim());
    const title = parts[0] || 'Unknown';
    const author = parts[1] || 'Tidak Diketahui';
    const year = parts[2] || '';
    const idMatch = parts[3]?.match(/#(\d+)/);
    const manuscriptId = idMatch ? idMatch[1] : number;

    // Extract URL from content header
    const urlMatch = content.match(/URL:\s*(https?:\/\/[^\n]+)/);
    const url = urlMatch ? urlMatch[1].trim() : '';

    // Extract full text (skip header until "---" markers)
    const textMatch = content.match(/---\s*\[\d+\]\s*---\n([\s\S]+)/);
    const fullText = textMatch ? textMatch[1].trim() : content;

    return {
      manuscriptId,
      number: parseInt(number),
      title,
      author,
      year,
      url,
      fullText,
      filename,
    };
  }

  /**
   * Read a single manuscript file
   */
  async readManuscript(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const filename = path.basename(filepath);
      const metadata = this.parseMetadata(filename, content);

      logger.debug(`Parsed manuscript: ${metadata.title}`);
      return metadata;
    } catch (error) {
      logger.error(`Error reading manuscript ${filepath}:`, error);
      throw error;
    }
  }

  /**
   * Read all manuscript files from directory
   */
  async readAllManuscripts() {
    try {
      const dirPath = config.paths.naskahDir;
      logger.info(`Reading manuscripts from: ${dirPath}`);

      const files = await fs.readdir(dirPath);
      const txtFiles = files.filter(f => f.endsWith('.txt')).sort();

      logger.info(`Found ${txtFiles.length} manuscript files`);

      const manuscripts = [];
      for (const file of txtFiles) {
        const filepath = path.join(dirPath, file);
        const manuscript = await this.readManuscript(filepath);
        manuscripts.push(manuscript);
      }

      logger.info(`Successfully read ${manuscripts.length} manuscripts`);
      return manuscripts;
    } catch (error) {
      logger.error('Error reading manuscripts:', error);
      throw error;
    }
  }
}

module.exports = new TextProcessor();