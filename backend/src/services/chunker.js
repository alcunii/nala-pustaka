/**
 * Chunker Service
 * Splits manuscript text into chunks with overlap
 */

const logger = require('../utils/logger');
const { countTokens } = require('../utils/tokenCounter');
const config = require('../config');

class Chunker {
  constructor() {
    this.maxTokens = config.chunking.maxTokens;
    this.overlapTokens = config.chunking.overlapTokens;
  }

  /**
   * Split text into sentences (basic sentence boundary detection)
   */
  splitIntoSentences(text) {
    // Split on common sentence endings for Indonesian/Javanese
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);
    return sentences;
  }

  /**
   * Create chunks from text with overlap
   */
  chunkText(manuscript) {
    const { fullText, manuscriptId, title, author, year, url } = manuscript;

    if (!fullText || fullText.trim().length === 0) {
      logger.warn(`Empty text for manuscript: ${title}`);
      return [];
    }

    const sentences = this.splitIntoSentences(fullText);
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = countTokens(sentence);

      // If adding this sentence exceeds max tokens, save current chunk
      if (currentTokens + sentenceTokens > this.maxTokens && currentChunk.length > 0) {
        const chunkText = currentChunk.join(' ');
        chunks.push({
          id: `${manuscriptId}_chunk_${chunkIndex}`,
          manuscriptId,
          title,
          author,
          year,
          url,
          chunkIndex,
          chunkText,
          tokenCount: currentTokens,
        });

        chunkIndex++;

        // Create overlap: keep last N tokens
        const overlapSentences = [];
        let overlapTokens = 0;
        
        for (let j = currentChunk.length - 1; j >= 0; j--) {
          const s = currentChunk[j];
          const t = countTokens(s);
          if (overlapTokens + t <= this.overlapTokens) {
            overlapSentences.unshift(s);
            overlapTokens += t;
          } else {
            break;
          }
        }

        currentChunk = overlapSentences;
        currentTokens = overlapTokens;
      }

      currentChunk.push(sentence);
      currentTokens += sentenceTokens;
    }

    // Add last chunk
    if (currentChunk.length > 0) {
      const chunkText = currentChunk.join(' ');
      chunks.push({
        id: `${manuscriptId}_chunk_${chunkIndex}`,
        manuscriptId,
        title,
        author,
        year,
        url,
        chunkIndex,
        chunkText,
        tokenCount: currentTokens,
      });
    }

    logger.debug(`Created ${chunks.length} chunks for: ${title}`);
    return chunks;
  }

  /**
   * Process all manuscripts and return chunks
   */
  chunkManuscripts(manuscripts) {
    logger.info(`Chunking ${manuscripts.length} manuscripts...`);
    
    const allChunks = [];
    for (const manuscript of manuscripts) {
      const chunks = this.chunkText(manuscript);
      allChunks.push(...chunks);
    }

    logger.info(`Created ${allChunks.length} total chunks`);
    return allChunks;
  }
}

module.exports = new Chunker();