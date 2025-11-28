const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

const pool = new Pool({
  user: config.postgres.user,
  host: config.postgres.host,
  database: config.postgres.database,
  password: config.postgres.password,
  port: config.postgres.port,
  ssl: config.postgres.ssl,
  // Longer timeouts for Neon database (handles auto-suspend/wake)
  connectionTimeoutMillis: 30000, // 30 seconds to establish connection
  idleTimeoutMillis: 30000, // 30 seconds before idle connection closes
  max: 20, // Maximum pool size
});

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Query the database
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error });
    throw error;
  }
};

/**
 * Get a client from the pool (for transactions)
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Monkey patch the query method to keep track of the last query executed
  const timeout = 5000;
  const lastQuery = { text: '', params: [] };

  client.query = (...args) => {
    lastQuery.text = args[0];
    lastQuery.params = args[1];
    return query.apply(client, args);
  };

  client.release = () => {
    // clear the timeout
    clearTimeout(client.connectionTimeout);
    // set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client, []);
  };

  return client;
};

module.exports = {
  query,
  getClient,
  pool,
};
