/**
 * Express Server - Nala Pustaka RAG Backend
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./utils/logger');
// TEMPORARY DISABLED - Manual installation needed for middleware
// const usageTracker = require('./middleware/usageTracker');
// const rateLimiter = require('./middleware/rateLimiter');

const vectorDB = require('./services/vectorDB');
const embeddingService = require('./services/embeddingOpenAI');
const ragChatService = require('./services/ragChat');
const deepChatService = require('./services/deepChatService');
const educationalAIService = require('./services/educationalAI');
const knowledgeGraphService = require('./services/knowledgeGraph');
const multiChatService = require('./services/multiChatService');
const manuscriptService = require('./services/manuscriptService');
const authService = require('./services/authService'); // Add Auth Service

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Increase JSON payload limit for large manuscripts (default: 100kb)
app.use(express.json({ limit: '10mb' }));

// Usage tracking and rate limiting (OPTIMIZED)
// TEMPORARY DISABLED - Manual installation needed
// app.use(usageTracker.middleware());
// app.use(rateLimiter.middleware({ enabled: true }));
logger.info('  Middleware temporarily disabled - Multi-Chat optimization active');

app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'Nala Pustaka Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      manuscripts: '/api/manuscripts',
      search: 'POST /api/search',
      ragChat: 'POST /api/rag-chat',
      deepChat: 'POST /api/deep-chat',
      multiChat: 'POST /api/chat/multi-manuscript',
      knowledgeGraph: 'POST /api/knowledge-graph',
      educational: 'POST /api/educational/generate',
    },
    documentation: 'https://github.com/alcunii/nala-pustaka',
  });
});

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

// Educational AI endpoints
// Generate educational content for a manuscript
app.post('/api/educational/generate', async (req, res) => {
  try {
    const { manuscript } = req.body;
    
    if (!manuscript || !manuscript.id || !manuscript.title) {
      return res.status(400).json({ error: 'Valid manuscript object required (id, title, full_text)' });
    }
    
    logger.info(`Generate educational content request for: ${manuscript.title}`);
    
    const content = await educationalAIService.generateAllEducationalContent(manuscript);
    
    res.json({
      manuscriptId: manuscript.id,
      content,
      cached: false, // Just generated
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Educational content generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get educational content (cache or generate)
app.get('/api/educational/:manuscriptId', async (req, res) => {
  try {
    const { manuscriptId } = req.params;
    
    logger.info(`Get educational content for: ${manuscriptId}`);
    
    // Try to get from cache
    const cached = await educationalAIService.getCachedContent(manuscriptId);
    
    if (cached) {
      return res.json({
        manuscriptId,
        content: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Not cached - need manuscript data to generate
    res.status(404).json({ 
      error: 'Content not cached. Use POST /api/educational/generate with full manuscript data to generate.'
    });
  } catch (error) {
    logger.error('Get educational content error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Knowledge Graph endpoint
app.post('/api/knowledge-graph', async (req, res) => {
  try {
    const { manuscriptId, manuscriptData } = req.body;
    
    if (!manuscriptId) {
      return res.status(400).json({ error: 'manuscriptId required' });
    }
    
    logger.info(`Get knowledge graph for: ${manuscriptId}`);
    
    const relationships = await knowledgeGraphService.findRelatedManuscripts(
      manuscriptId,
      manuscriptData
    );
    
    res.json({
      manuscriptId,
      relationships,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Knowledge graph error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Multi-Manuscript Chat endpoint (Max 3 manuscripts)
app.post('/api/chat/multi-manuscript', async (req, res) => {
  try {
    const { manuscripts, query, conversationHistory } = req.body;
    
    if (!manuscripts || !Array.isArray(manuscripts)) {
      return res.status(400).json({ 
        error: 'Manuscripts array required' 
      });
    }
    
    if (manuscripts.length < 2) {
      return res.status(400).json({ 
        error: 'Minimum 2 manuscripts required for multi-chat' 
      });
    }
    
    if (manuscripts.length > 3) {
      return res.status(400).json({ 
        error: 'Maximum 3 manuscripts allowed for multi-chat' 
      });
    }
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    logger.info(`Multi-chat: ${manuscripts.length} manuscripts, query: "${query.substring(0, 50)}..."`);
    
    const result = await multiChatService.chatWithMultipleManuscripts(
      manuscripts,
      query,
      conversationHistory || []
    );
    
    res.json(result);
  } catch (error) {
    logger.error('Multi-chat error:', error);
    res.status(500).json({ 
      error: 'Multi-chat failed',
      message: error.message 
    });
  }
});

// Manuscript CRUD endpoints
app.get('/api/manuscripts', async (req, res) => {
  try {
    const manuscripts = await manuscriptService.getAll();
    res.json(manuscripts);
  } catch (error) {
    logger.error('Get all manuscripts error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/manuscripts/:slug', async (req, res) => {
  try {
    const manuscript = await manuscriptService.getBySlug(req.params.slug);
    if (!manuscript) return res.status(404).json({ error: 'Manuscript not found' });
    res.json(manuscript);
  } catch (error) {
    logger.error('Get manuscript by slug error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/manuscripts', async (req, res) => {
  try {
    const manuscript = await manuscriptService.create(req.body);
    res.status(201).json(manuscript);
  } catch (error) {
    logger.error('Create manuscript error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/manuscripts/:id', async (req, res) => {
  try {
    const manuscript = await manuscriptService.update(req.params.id, req.body);
    res.json(manuscript);
  } catch (error) {
    logger.error('Update manuscript error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/manuscripts/:id', async (req, res) => {
  try {
    await manuscriptService.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete manuscript error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/manuscripts/reorder', async (req, res) => {
  try {
    const { id1, id2 } = req.body;
    await manuscriptService.reorder(id1, id2);
    res.json({ success: true });
  } catch (error) {
    logger.error('Reorder manuscripts error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/manuscripts/:id/toggle-pin', async (req, res) => {
  try {
    const manuscript = await manuscriptService.togglePin(req.params.id);
    res.json(manuscript);
  } catch (error) {
    logger.error('Toggle pin error:', error);
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
    // Test database connection
    const db = require('./config/database');
    const dbTest = await db.query('SELECT current_database() as db_name, current_user, version()');
    logger.info(`Database connected: ${dbTest.rows[0].db_name} (user: ${dbTest.rows[0].current_user})`);
    
    // Count manuscripts
    const countResult = await db.query('SELECT COUNT(*) as count FROM manuscripts');
    logger.info(`Manuscripts in database: ${countResult.rows[0].count}`);
    
    // Initialize vector DB connection
    await vectorDB.initialize();
    logger.info('Vector DB initialized');

    app.listen(config.port, '0.0.0.0', () => {
      logger.info('========================================');
      logger.info(` Nala Pustaka Backend Server`);
      logger.info(` Server running on port ${config.port}`);
      logger.info(` Environment: ${config.nodeEnv}`);
      logger.info(` Listening on 0.0.0.0:${config.port}`);
      logger.info(` Health check: /health`);
      logger.info(` API endpoints: /api/*`);
      logger.info('========================================');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();