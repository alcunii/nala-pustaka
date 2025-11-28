/**
 * Express Server - Nala Pustaka RAG Backend
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./utils/logger');
const cache = require('./utils/cache');
const db = require('./config/database');
// TEMPORARY DISABLED - Manual installation needed for middleware
// const usageTracker = require('./middleware/usageTracker');
// const rateLimiter = require('./middleware/rateLimiter');

const vectorDB = require('./services/vectorDB');
// Use OpenAI embedding (matches Pinecone dimension 1536)
const embeddingService = require('./services/embeddingOpenAI');
const ragChatService = require('./services/ragChat');
const deepChatService = require('./services/deepChatService');
const educationalAIService = require('./services/educationalAI');
const knowledgeGraphService = require('./services/knowledgeGraph');
const multiChatService = require('./services/multiChatService');
const manuscriptService = require('./services/manuscriptService');
const authService = require('./services/authService'); // Add Auth Service
const authMiddleware = require('./middleware/authMiddleware'); // Add Auth Middleware
const { runMigrations } = require('./utils/migrations');

const app = express();

// Trust proxy (for Railway, Heroku, etc)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// OPTIMIZATION: Enable GZIP compression (saves 60-70% bandwidth)
app.use(compression({
  level: 6, // Compression level (0-9, 6 is good balance)
  threshold: 1024, // Only compress responses > 1KB
}));
logger.info('✅ Response compression enabled (GZIP)');

// Increase JSON payload limit for large manuscripts (default: 100kb)
app.use(express.json({ limit: '10mb' }));

// Usage tracking and rate limiting (OPTIMIZED)
// TEMPORARY DISABLED - Manual installation needed
// app.use(usageTracker.middleware());
// app.use(rateLimiter.middleware({ enabled: true }));
// logger.info('  Middleware temporarily disabled - Multi-Chat optimization active');

app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

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
    const cacheStats = cache.getStats();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        vectorDB: !!stats,
        embedding: true,
        cache: true,
      },
      vectorDBStats: stats,
      cacheStats: cacheStats,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Cache stats endpoint (for monitoring)
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  res.json(stats);
});

// Clear cache endpoint (for debugging/updates)
app.post('/api/cache/clear', (req, res) => {
  cache.clear();
  logger.info('🧹 Cache cleared manually via API');
  res.json({ success: true, message: 'Cache cleared successfully' });
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

// Full Knowledge Graph Visualization Endpoint
app.get('/api/graph/explore', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 500; // Default to 500 nodes
    
    // Fetch nodes and edges
    // We prioritize "VALUE" nodes and their connections
    const result = await db.query(`
      WITH TopNodes AS (
        SELECT id, label, type, description 
        FROM knowledge_nodes 
        ORDER BY id  -- Random/Sequential for now, ideally PageRank or degree centrality
        LIMIT $1
      )
      SELECT 
        json_build_object(
          'nodes', (SELECT json_agg(row_to_json(n)) FROM TopNodes n),
          'edges', (
            SELECT json_agg(row_to_json(e)) FROM (
              SELECT id, source_id, target_id, relation_type, description, weight
              FROM knowledge_edges
              WHERE source_id IN (SELECT id FROM TopNodes)
              AND target_id IN (SELECT id FROM TopNodes)
            ) e
          )
        ) as graph
    `, [limit]);
    
    res.json(result.rows[0].graph || { nodes: [], edges: [] });
  } catch (error) {
    logger.error('Graph explore error:', error);
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

// Manuscript CRUD endpoints (OPTIMIZED with caching)
app.get('/api/manuscripts', cache.middleware({ ttl: 300, keyPrefix: 'manuscripts' }), async (req, res) => {
  try {
    const manuscripts = await manuscriptService.getAll();
    logger.info(`📚 Fetched ${manuscripts.length} manuscripts (without full_text) - Cached for 5 minutes`);
    res.json(manuscripts);
  } catch (error) {
    logger.error('Get all manuscripts error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/manuscripts/:slug', cache.middleware({ ttl: 3600, keyPrefix: 'manuscript' }), async (req, res) => {
  try {
    const manuscript = await manuscriptService.getBySlug(req.params.slug);
    if (!manuscript) return res.status(404).json({ error: 'Manuscript not found' });
    logger.info(`📖 Fetched manuscript: ${manuscript.title} (with full_text) - Cached for 1 hour`);
    res.json(manuscript);
  } catch (error) {
    logger.error('Get manuscript by slug error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/manuscripts', authMiddleware, async (req, res) => {
  try {
    const manuscript = await manuscriptService.create({ ...req.body, created_by: req.user.id });
    // Invalidate cache when data changes
    cache.delete('manuscripts:/api/manuscripts');
    logger.info('Cache invalidated after manuscript creation');
    res.status(201).json(manuscript);
  } catch (error) {
    logger.error('Create manuscript error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/manuscripts/:id', authMiddleware, async (req, res) => {
  try {
    const manuscript = await manuscriptService.update(req.params.id, req.body);
    // Invalidate cache when data changes
    cache.delete('manuscripts:/api/manuscripts');
    cache.delete(`manuscript:/api/manuscripts/${manuscript.slug}`);
    logger.info('Cache invalidated after manuscript update');
    res.json(manuscript);
  } catch (error) {
    logger.error('Update manuscript error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/manuscripts/:id', authMiddleware, async (req, res) => {
  try {
    await manuscriptService.delete(req.params.id);
    // Invalidate cache when data changes
    cache.delete('manuscripts:/api/manuscripts');
    logger.info('Cache invalidated after manuscript deletion');
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete manuscript error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Knowledge Graph endpoints
app.get('/api/knowledge-graph/:manuscriptId', async (req, res) => {
  try {
    const { manuscriptId } = req.params;
    
    // 🔍 DEBUG: Log request yang diterima
    logger.info(`🔍 Knowledge Graph Request - Manuscript ID: ${manuscriptId}`);
    
    const graph = await knowledgeGraphService.getGraphByManuscript(manuscriptId);
    
    // 🔍 DEBUG: Log response yang akan dikirim
    logger.info(`✅ Knowledge Graph Response - Nodes: ${graph.nodes?.length || 0}, Links: ${graph.links?.length || 0}`);
    
    // Disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json(graph);
  } catch (error) {
    logger.error('Get knowledge graph error:', error);
    res.status(500).json({ error: error.message, nodes: [], links: [] });
  }
});

app.post('/api/manuscripts/reorder', authMiddleware, async (req, res) => {
  try {
    const { id1, id2 } = req.body;
    await manuscriptService.reorder(id1, id2);
    res.json({ success: true });
  } catch (error) {
    logger.error('Reorder manuscripts error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/manuscripts/:id/toggle-pin', authMiddleware, async (req, res) => {
  try {
    const manuscript = await manuscriptService.togglePin(req.params.id);
    res.json(manuscript);
  } catch (error) {
    logger.error('Toggle pin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Knowledge Graph Generation (Secure)
app.post('/api/admin/generate-knowledge-graph', authMiddleware, async (req, res) => {
  try {
    const { title, author, fullText } = req.body;
    if (!title || !fullText) {
      return res.status(400).json({ error: 'Title and fullText are required' });
    }
    
    const graph = await educationalAIService.generateKnowledgeGraph(title, author, fullText);
    res.json(graph);
  } catch (error) {
    logger.error('Admin KG generation error:', error);
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
    
    // Run database migrations
    await runMigrations();

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