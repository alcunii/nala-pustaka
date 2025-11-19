/**
 * Rate Limiting Middleware
 * Prevents abuse and controls costs
 */

const logger = require('"'../utils/logger'"');

class RateLimiter {
  constructor() {
    // In-memory storage (use Redis for production)
    this.limits = new Map();
    
    // Rate limits configuration
    this.config = {
      deepChat: {
        free: { maxRequests: 10, windowMs: 86400000 }, // 10 per day
        premium: { maxRequests: 100, windowMs: 86400000 }
      },
      multiChat: {
        free: { maxRequests: 20, windowMs: 86400000 }, // 20 per day
        premium: { maxRequests: 200, windowMs: 86400000 }
      },
      ragSearch: {
        free: { maxRequests: 30, windowMs: 86400000 }, // 30 per day
        premium: { maxRequests: 300, windowMs: 86400000 }
      },
      default: {
        free: { maxRequests: 50, windowMs: 86400000 }, // 50 per day total
        premium: { maxRequests: 500, windowMs: 86400000 }
      }
    };
    
    // Clean up old entries every hour
    setInterval(() => this.cleanup(), 3600000);
    
    logger.info('"'  Rate Limiter initialized'"');
  }

  /**
   * Get user identifier
   */
  getUserId(req) {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    const ip = req.ip || req.connection.remoteAddress || '"'unknown'"';
    return `ip_${ip}`;
  }

  /**
   * Get user tier (free or premium)
   */
  getUserTier(req) {
    // Check if user is premium (implement your own logic)
    if (req.user && req.user.isPremium) {
      return '"'premium'"';
    }
    return '"'free'"';
  }

  /**
   * Determine endpoint type
   */
  getEndpointType(path) {
    if (path.includes('"'/deep'"') || path.includes('"'/manuscript'"')) return '"'deepChat'"';
    if (path.includes('"'/multi'"')) return '"'multiChat'"';
    if (path.includes('"'/search'"') || path.includes('"'/rag'"')) return '"'ragSearch'"';
    return '"'default'"';
  }

  /**
   * Check if user exceeded rate limit
   */
  checkLimit(userId, endpointType, tier) {
    const now = Date.now();
    const key = `${userId}_${endpointType}`;
    
    if (!this.limits.has(key)) {
      this.limits.set(key, {
        count: 0,
        resetAt: now + this.config[endpointType][tier].windowMs
      });
    }
    
    const limit = this.limits.get(key);
    
    // Reset if window expired
    if (now > limit.resetAt) {
      limit.count = 0;
      limit.resetAt = now + this.config[endpointType][tier].windowMs;
    }
    
    // Check if exceeded
    const maxRequests = this.config[endpointType][tier].maxRequests;
    const exceeded = limit.count >= maxRequests;
    
    if (!exceeded) {
      limit.count++;
    }
    
    return {
      exceeded,
      current: limit.count,
      max: maxRequests,
      resetAt: limit.resetAt,
      resetIn: Math.ceil((limit.resetAt - now) / 1000 / 60) // minutes
    };
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.limits) {
      if (now > value.resetAt + 86400000) { // 24 hours after reset
        this.limits.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`  Cleaned ${cleaned} old rate limit entries`);
    }
  }

  /**
   * Get user'"'s current limits
   */
  getUserLimits(userId) {
    const limits = {};
    
    for (const [key, value] of this.limits) {
      if (key.startsWith(userId)) {
        const endpointType = key.split('"'_'"')[1];
        limits[endpointType] = {
          used: value.count,
          resetAt: new Date(value.resetAt).toISOString()
        };
      }
    }
    
    return limits;
  }

  /**
   * Express middleware
   */
  middleware(options = {}) {
    const enableRateLimiting = options.enabled !== false;
    
    return (req, res, next) => {
      if (!enableRateLimiting) {
        return next();
      }
      
      const userId = this.getUserId(req);
      const tier = this.getUserTier(req);
      const endpointType = this.getEndpointType(req.path);
      
      const result = this.checkLimit(userId, endpointType, tier);
      
      // Add rate limit info to response headers
      res.setHeader('"'X-RateLimit-Limit'"', result.max);
      res.setHeader('"'X-RateLimit-Remaining'"', Math.max(0, result.max - result.current));
      res.setHeader('"'X-RateLimit-Reset'"', result.resetAt);
      
      if (result.exceeded) {
        logger.warn(`  Rate limit exceeded for ${userId} on ${endpointType}`);
        
        return res.status(429).json({
          error: '"'Rate limit exceeded'"',
          message: `You have exceeded the ${endpointType} limit. Please try again in ${result.resetIn} minutes.`,
          limit: result.max,
          resetIn: result.resetIn,
          tier: tier,
          upgrade: tier === '"'free'"' ? '"'Consider upgrading to premium for higher limits'"' : null
        });
      }
      
      logger.debug(`  ${userId} - ${endpointType}: ${result.current}/${result.max}`);
      next();
    };
  }

  /**
   * Get all limits info (for admin dashboard)
   */
  getAllLimits() {
    const summary = {
      totalUsers: new Set([...this.limits.keys()].map(k => k.split('"'_'"')[0])).size,
      endpoints: {},
      topUsers: []
    };
    
    // Count by endpoint
    for (const [key, value] of this.limits) {
      const endpointType = key.split('"'_'"')[1];
      if (!summary.endpoints[endpointType]) {
        summary.endpoints[endpointType] = { users: 0, totalRequests: 0 };
      }
      summary.endpoints[endpointType].users++;
      summary.endpoints[endpointType].totalRequests += value.count;
    }
    
    return summary;
  }
}

const rateLimiter = new RateLimiter();
module.exports = rateLimiter;
