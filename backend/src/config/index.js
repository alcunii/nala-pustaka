/**
 * Configuration module - Loads and validates environment variables
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Pinecone Vector Database
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
    indexName: process.env.PINECONE_INDEX_NAME || 'nala-pustaka',
  },

  // HuggingFace Embedding
  huggingface: {
    apiKey: process.env.HF_API_KEY,
    model: 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2',
    dimension: 768,
  },

  // Google Gemini LLM
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.0-flash-exp',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    'supabase.url',
    'supabase.anonKey',
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
