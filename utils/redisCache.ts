import Redis from 'ioredis';
import { performanceCache, dataCache, longCache } from './cache';

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);

// Create Redis client
let redisClient: Redis | null = null;

// Initialize Redis client
export const initRedis = () => {
  if (process.env.NODE_ENV === 'production' && REDIS_URL) {
    try {
      redisClient = new Redis(REDIS_URL, {
        password: REDIS_PASSWORD,
        db: REDIS_DB,
        retryStrategy: (times) => {
          // Retry after increasing delays
          return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        lazyConnect: true,
      });
      
      redisClient.on('error', (err) => {
        console.warn('Redis connection error:', err);
      });
      
      redisClient.on('connect', () => {
        console.log('Redis connected successfully');
      });
      
      redisClient.on('ready', () => {
        console.log('Redis client ready');
      });
      
      redisClient.on('close', () => {
        console.log('Redis connection closed');
      });
      
      return redisClient;
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      return null;
    }
  }
  
  return null;
};

// Get Redis client
export const getRedisClient = () => redisClient;

// Enhanced cache with Redis support
class RedisCache {
  private redis: Redis | null;
  private fallbackCache: any;
  private defaultTTL: number;
  private prefix: string;

  constructor(
    fallbackCache: any, 
    defaultTTL: number = 60000, 
    prefix: string = 'cache'
  ) {
    this.redis = redisClient;
    this.fallbackCache = fallbackCache;
    this.defaultTTL = defaultTTL;
    this.prefix = prefix;
  }

  // Generate Redis key with prefix
  private generateKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  // Get data from cache (Redis first, then fallback)
  async get(key: string): Promise<any> {
    const redisKey = this.generateKey(key);
    
    try {
      // Try Redis first if available
      if (this.redis) {
        const cached = await this.redis.get(redisKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      
      // Fallback to in-memory cache
      return this.fallbackCache.get(key);
    } catch (error) {
      console.warn('Cache get error:', error);
      // Fallback to in-memory cache on error
      return this.fallbackCache.get(key);
    }
  }

  // Set data in cache (both Redis and fallback)
  async set(key: string, data: any, ttl?: number): Promise<void> {
    const redisKey = this.generateKey(key);
    const expirationTime = ttl || this.defaultTTL;
    
    try {
      // Set in Redis if available
      if (this.redis) {
        await this.redis.setex(
          redisKey, 
          Math.floor(expirationTime / 1000), // Redis uses seconds
          JSON.stringify(data)
        );
      }
      
      // Set in fallback cache
      this.fallbackCache.set(key, data, ttl);
    } catch (error) {
      console.warn('Cache set error:', error);
      // Still set in fallback cache on error
      this.fallbackCache.set(key, data, ttl);
    }
  }

  // Delete data from cache
  async delete(key: string): Promise<void> {
    const redisKey = this.generateKey(key);
    
    try {
      // Delete from Redis if available
      if (this.redis) {
        await this.redis.del(redisKey);
      }
      
      // Delete from fallback cache
      this.fallbackCache.delete(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
      // Still delete from fallback cache on error
      this.fallbackCache.delete(key);
    }
  }

  // Clear all cache entries with this prefix
  async clear(): Promise<void> {
    try {
      // Clear Redis entries with this prefix
      if (this.redis) {
        const keys = await this.redis.keys(`${this.prefix}:*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      
      // Clear fallback cache
      this.fallbackCache.clear();
    } catch (error) {
      console.warn('Cache clear error:', error);
      // Still clear fallback cache on error
      this.fallbackCache.clear();
    }
  }

  // Invalidate cache entries by pattern
  async invalidate(pattern: string): Promise<void> {
    try {
      // Invalidate Redis entries with this pattern
      if (this.redis) {
        const keys = await this.redis.keys(`${this.prefix}:*${pattern}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      
      // Invalidate fallback cache
      this.fallbackCache.invalidate(pattern);
    } catch (error) {
      console.warn('Cache invalidate error:', error);
      // Still invalidate fallback cache on error
      this.fallbackCache.invalidate(pattern);
    }
  }

  // Get cache statistics
  async getStats(): Promise<{ 
    size: number; 
    keys: string[]; 
    redisConnected: boolean;
    redisKeys?: number;
  }> {
    const stats = this.fallbackCache.getStats();
    
    try {
      if (this.redis) {
        const redisKeys = await this.redis.keys(`${this.prefix}:*`);
        return {
          ...stats,
          redisConnected: this.redis.status === 'ready',
          redisKeys: redisKeys.length
        };
      }
    } catch (error) {
      console.warn('Cache stats error:', error);
    }
    
    return {
      ...stats,
      redisConnected: false
    };
  }
}

// Create enhanced cache instances with Redis support
export const enhancedPerformanceCache = new RedisCache(performanceCache, 30000, 'perf');
export const enhancedDataCache = new RedisCache(dataCache, 60000, 'data');
export const enhancedLongCache = new RedisCache(longCache, 300000, 'long');

// Initialize Redis on startup
initRedis();

export default RedisCache;