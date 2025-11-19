/**
 * Configuration module - Loads and validates environment variables
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Server
  port: parseInt(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // PostgreSQL (Direct Connection)
  // Supports both DATABASE_URL (Railway) and individual DB_* variables
  postgres: (() => {
    // If DATABASE_URL is provided (Railway, Heroku, etc)
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      return {
        user: url.username,
        host: url.hostname,
        database: url.pathname.slice(1), // Remove leading slash
        password: url.password,
        port: parseInt(url.port) || 5432,
        ssl: { rejectUnauthorized: false }, // Railway requires SSL
      };
    }
    // Fallback to individual variables
    return {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'nala_pustaka',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT) || 5432,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  })(),

  // Pinecone Vector Database
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
    indexName: process.env.PINECONE_INDEX_NAME || 'nala-pustaka',
  },

  // Embedding Configuration
  huggingface: {
    apiKey: process.env.HF_API_KEY,
    // NOTE: Currently using OpenAI embedding (embeddingOpenAI.js) not HuggingFace
    // because Pinecone index was created with OpenAI dimension (1536)
    model: 'text-embedding-3-small',
    dimension: 1536,
    provider: 'openai',
  },

  // Google Gemini LLM
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash-lite',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
  },

  // CORS - Support multiple origins
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim()),
  },

  // Chunking Strategy
  chunking: {
    maxTokens: 1000,
    overlapTokens: 200,
  },

  // Data paths
  paths: {
    naskahDir: path.join(__dirname, '../../../data_naskah/naskah_babad'),
  },
};

// Validate required config
function validateConfig() {
  const required = [
    // Supabase is now OPTIONAL (we use PostgreSQL directly)
    // 'supabase.url',
    // 'supabase.anonKey',
    'pinecone.apiKey',
    'pinecone.environment',
    'huggingface.apiKey',
    'gemini.apiKey',
  ];

  const missing = [];
  required.forEach((key) => {
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value?.[k];
    }
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
}

// Validate on load
validateConfig();

module.exports = config;
