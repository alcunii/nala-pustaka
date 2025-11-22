/**
 * Cache Service - In-Memory Caching with node-cache
 * Reduces database queries and network transfer
 */

const NodeCache = require('node-cache');
const logger = require('./logger');

class CacheService {
  constructor() {
    // Initialize cache with default TTL of 1 hour (3600 seconds)
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour default
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false, // Don't clone data (faster, but be careful with mutations)
    });

    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
    };

    this.cache.on('set', (key, value) => {
      this.stats.sets++;
      logger.debug(`Cache SET: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache EXPIRED: ${key}`);
    });

    logger.info('Cache service initialized with 1 hour TTL');
  }

  /**
   * Get value from cache
   */
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
      logger.debug(`Cache HIT: ${key}`);
      return value;
    }
    this.stats.misses++;
    logger.debug(`Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key, value, ttl = undefined) {
    return this.cache.set(key, value, ttl);
  }

  /**
   * Delete key from cache
   */
  delete(key) {
    return this.cache.del(key);
  }

  /**
   * Delete multiple keys (accepts array or pattern)
   */
  deleteMany(keys) {
    return this.cache.del(keys);
  }

  /**
   * Clear all cache
   */
  clear() {
    logger.info('Clearing all cache');
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const keys = this.cache.keys();
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
      : 0;

    return {
      keys: keys.length,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Middleware to cache GET requests
   */
  middleware(options = {}) {
    const { ttl = 3600, keyPrefix = 'api' } = options;

    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `${keyPrefix}:${req.originalUrl}`;
      const cached = this.get(key);

      if (cached) {
        // Return cached response
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        this.set(key, data, ttl);
        return originalJson(data);
      };

      next();
    };
  }
}

// Export singleton instance
module.exports = new CacheService();
