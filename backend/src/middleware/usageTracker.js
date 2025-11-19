/**
 * Usage Tracking Middleware
 * Tracks API usage, token consumption, and costs per user/IP
 */

const logger = require('"'../utils/logger'"');

class UsageTracker {
  constructor() {
    // In-memory storage (use Redis/Database for production)
    this.usage = new Map();
    this.dailyStats = new Map();
    
    // Cost per 1M tokens
    this.COST_INPUT = 0.075;
    this.COST_OUTPUT = 0.30;
    
    // Reset daily stats at midnight
    this.resetDailyStats();
    setInterval(() => this.resetDailyStats(), 86400000); // 24 hours
    
    logger.info('"' Usage Tracker initialized'"');
  }

  /**
   * Get user identifier (IP or user ID)
   */
  getUserId(req) {
    // Try to get user ID from session/auth
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    
    // Fallback to IP address
    const ip = req.ip || req.connection.remoteAddress || '"'unknown'"';
    return `ip_${ip}`;
  }

  /**
   * Track API request
   */
  trackRequest(userId, endpoint, inputTokens, outputTokens) {
    const today = new Date().toISOString().split('"'T'"')[0];
    const key = `${userId}_${today}`;
    
    if (!this.usage.has(key)) {
      this.usage.set(key, {
        userId,
        date: today,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        endpoints: {}
      });
    }
    
    const stats = this.usage.get(key);
    stats.requests++;
    stats.inputTokens += inputTokens;
    stats.outputTokens += outputTokens;
    
    // Track per endpoint
    if (!stats.endpoints[endpoint]) {
      stats.endpoints[endpoint] = { count: 0, inputTokens: 0, outputTokens: 0 };
    }
    stats.endpoints[endpoint].count++;
    stats.endpoints[endpoint].inputTokens += inputTokens;
    stats.endpoints[endpoint].outputTokens += outputTokens;
    
    // Update daily stats
    this.updateDailyStats(inputTokens, outputTokens);
  }

  /**
   * Get user usage stats
   */
  getUserUsage(userId) {
    const today = new Date().toISOString().split('"'T'"')[0];
    const key = `${userId}_${today}`;
    return this.usage.get(key) || {
      userId,
      date: today,
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      endpoints: {}
    };
  }

  /**
   * Calculate cost for user
   */
  calculateCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1000000) * this.COST_INPUT;
    const outputCost = (outputTokens / 1000000) * this.COST_OUTPUT;
    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost
    };
  }

  /**
   * Update daily aggregate stats
   */
  updateDailyStats(inputTokens, outputTokens) {
    const today = new Date().toISOString().split('"'T'"')[0];
    
    if (!this.dailyStats.has(today)) {
      this.dailyStats.set(today, {
        date: today,
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        uniqueUsers: new Set()
      });
    }
    
    const stats = this.dailyStats.get(today);
    stats.totalRequests++;
    stats.totalInputTokens += inputTokens;
    stats.totalOutputTokens += outputTokens;
  }

  /**
   * Get daily stats
   */
  getDailyStats() {
    const today = new Date().toISOString().split('"'T'"')[0];
    const stats = this.dailyStats.get(today);
    
    if (!stats) {
      return {
        date: today,
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        estimatedCost: 0
      };
    }
    
    const cost = this.calculateCost(stats.totalInputTokens, stats.totalOutputTokens);
    
    return {
      date: today,
      totalRequests: stats.totalRequests,
      totalInputTokens: stats.totalInputTokens,
      totalOutputTokens: stats.totalOutputTokens,
      estimatedCost: cost.total.toFixed(4),
      breakdown: cost
    };
  }

  /**
   * Reset daily stats
   */
  resetDailyStats() {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('"'T'"')[0];
    
    // Archive yesterday'"'s stats
    if (this.dailyStats.has(yesterday)) {
      const stats = this.dailyStats.get(yesterday);
      const cost = this.calculateCost(stats.totalInputTokens, stats.totalOutputTokens);
      logger.info(` Yesterday'"'s stats: ${stats.totalRequests} requests, $${cost.total.toFixed(2)} cost`);
    }
    
    // Keep only last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('"'T'"')[0];
    for (const [date] of this.dailyStats) {
      if (date < sevenDaysAgo) {
        this.dailyStats.delete(date);
      }
    }
  }

  /**
   * Express middleware
   */
  middleware() {
    return (req, res, next) => {
      const userId = this.getUserId(req);
      const startTime = Date.now();
      
      // Estimate tokens (rough estimation)
      const estimateTokens = (text) => {
        if (!text) return 0;
        return Math.round(text.length / 4); // Rough: 1 token  4 chars
      };
      
      // Intercept response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        const duration = Date.now() - startTime;
        
        // Estimate tokens
        const inputTokens = estimateTokens(JSON.stringify(req.body));
        const outputTokens = estimateTokens(JSON.stringify(data));
        
        // Track usage
        this.trackRequest(userId, req.path, inputTokens, outputTokens);
        
        // Add usage info to response
        data._usage = {
          inputTokens,
          outputTokens,
          duration,
          cost: this.calculateCost(inputTokens, outputTokens)
        };
        
        logger.debug(` ${userId} - ${req.path}: ${inputTokens}in/${outputTokens}out tokens`);
        
        return originalJson(data);
      };
      
      next();
    };
  }
}

const usageTracker = new UsageTracker();
module.exports = usageTracker;
