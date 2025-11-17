/**
 * Express Server - Nala Pustaka RAG Backend
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./utils/logger');
const vectorDB = require('./services/vectorDB');
const embeddingService = require('./services/embedding');
const ragChatService = require('./services/ragChat');
const deepChatService = require('./services/deepChatService');

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const stats = await vectorDB.getStats();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        vectorDB: !!stats,
        embedding: true,
      },
      vectorDBStats: stats,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Semantic search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, topK = 5, minScore = 0.5 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    logger.info(`Search query: ${query}`);

    // Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Search in vector DB
    const results = await vectorDB.query(queryEmbedding, { topK });

    // Filter by minimum score
    const filteredResults = results.filter(r => r.score >= minScore);

    res.json({
      query,
      results: filteredResults,
      totalResults: filteredResults.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// RAG Chat endpoint - Conversational AI with cross-document retrieval
app.post('/api/rag-chat', async (req, res) => {
  try {
    const { query, conversationHistory } = req.body;

    // Validate input
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    logger.info(`RAG Chat request: "${query}"`);

    // Call RAG chat service
    const result = await ragChatService.chat(query, conversationHistory || []);

    res.json({
      query,
      answer: result.answer,
      sources: result.sources,
      timestamp: result.timestamp
    });
  } catch (error) {
    logger.error('RAG Chat error:', error);
    res.status(500).json({ 
      error: 'RAG Chat failed', 
      message: error.message 
    });
  }
});

// Get full manuscript from Pinecone (all chunks)
app.post('/api/get-full-manuscript', async (req, res) => {
  try {
    const { manuscriptId } = req.body;
    
    if (!manuscriptId) {
      logger.error('Missing manuscriptId in request');
      return res.status(400).json({ error: 'manuscriptId is required' });
    }
    
    logger.info(`Getting full manuscript for: ${manuscriptId}`);
    
    // Get all chunks for this manuscript
    const allChunks = await vectorDB.getByManuscriptId(manuscriptId);
    
    logger.info(`Retrieved ${allChunks?.length || 0} chunks for manuscriptId: ${manuscriptId}`);
    
    if (!allChunks || allChunks.length === 0) {
      logger.warn(`No chunks found for manuscriptId: ${manuscriptId}`);
      return res.status(404).json({ 
        error: `Manuscript not found for ID: ${manuscriptId}. Please check if this manuscript exists in Pinecone.` 
      });
    }
    
    // Sort by chunk index
    const sortedChunks = allChunks.sort((a, b) => 
      (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0)
    );
    
    // Reconstruct full text
    const fullText = sortedChunks
      .map(c => c.metadata?.chunkText || '')
      .join('\n\n');
    
    const metadata = sortedChunks[0]?.metadata || {};
    
    res.json({
      manuscriptId,
      title: metadata.title || 'Unknown',
      author: metadata.author || 'Unknown',
      year: metadata.year || 'Unknown',
      url: metadata.url || '',
      fullText,
      chunkCount: allChunks.length,
      totalTokens: sortedChunks.reduce((sum, c) => sum + (c.metadata?.tokenCount || 0), 0)
    });
  } catch (error) {
    logger.error('Get full manuscript error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deep chat with full manuscript context
app.post('/api/deep-chat', async (req, res) => {
  try {
    const { manuscriptId, fullText, manuscriptTitle, query, conversationHistory } = req.body;
    
    if (!query || !fullText) {
      return res.status(400).json({ error: 'query and fullText are required' });
    }
    
    logger.info(`Deep chat request - Manuscript: ${manuscriptTitle}`);
    
    const result = await deepChatService.chat(
      manuscriptId,
      fullText,
      manuscriptTitle,
      query,
      conversationHistory || []
    );
    
    res.json(result);
  } catch (error) {
    logger.error('Deep chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
async function startServer() {
  try {
    // Initialize vector DB connection
    await vectorDB.initialize();
    logger.info('Vector DB initialized');

    app.listen(config.port, () => {
      logger.info('========================================');
      logger.info(`🚀 Nala Pustaka Backend Server`);
      logger.info(`📡 Server running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
      logger.info('========================================');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();