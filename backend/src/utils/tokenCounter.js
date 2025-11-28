/**
 * Token counter utility
 * Simple approximation: 1 token  4 characters for Indonesian/Javanese text
 */

function countTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Simple approximation for Indonesian/Javanese
  // More accurate would be to use tiktoken, but this is sufficient
  const chars = text.length;
  const tokens = Math.ceil(chars / 4);
  
  return tokens;
}

function splitIntoTokens(text, maxTokens) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];
  let currentTokens = 0;

  for (const word of words) {
    const wordTokens = countTokens(word);
    
    if (currentTokens + wordTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
      currentTokens = 0;
    }
    
    currentChunk.push(word);
    currentTokens += wordTokens;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

module.exports = {
  countTokens,
  splitIntoTokens,
};