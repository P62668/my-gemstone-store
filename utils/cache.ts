import Redis from 'ioredis';
import { promisify } from 'util';

// Initialize Redis client
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
} else if (process.env.REDIS_HOST) {
  redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });
}

// In-memory cache as fallback
const memoryCache: Map<string, { value: any; expiry: number }> = new Map();

// Cache interface
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  useRedis?: boolean; // Whether to use Redis or memory cache
}

// Default cache options
const defaultOptions: CacheOptions = {
  ttl: 300, // 5 minutes default
  useRedis: !!redisClient, // Use Redis if available
};

// Get cached value
export async function getCachedValue(key: string, options: CacheOptions = {}): Promise<any> {
  const opts = { ...defaultOptions, ...options };
  
  try {
    if (opts.useRedis && redisClient) {
      // Use Redis cache
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
    } else {
      // Use in-memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      } else if (cached) {
        // Remove expired entry
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.warn('Cache get error:', error);
  }
  
  return null;
}

// Set cached value
export async function setCachedValue(key: string, value: any, options: CacheOptions = {}): Promise<void> {
  const opts = { ...defaultOptions, ...options };
  
  try {
    if (opts.useRedis && redisClient) {
      // Use Redis cache
      await redisClient.setex(key, opts.ttl!, JSON.stringify(value));
    } else {
      // Use in-memory cache
      memoryCache.set(key, {
        value,
        expiry: Date.now() + (opts.ttl! * 1000),
      });
    }
  } catch (error) {
    console.warn('Cache set error:', error);
  }
}

// Delete cached value
export async function deleteCachedValue(key: string, options: CacheOptions = {}): Promise<void> {
  const opts = { ...defaultOptions, ...options };
  
  try {
    if (opts.useRedis && redisClient) {
      // Use Redis cache
      await redisClient.del(key);
    } else {
      // Use in-memory cache
      memoryCache.delete(key);
    }
  } catch (error) {
    console.warn('Cache delete error:', error);
  }
}

// Clear all cache
export async function clearAllCache(options: CacheOptions = {}): Promise<void> {
  const opts = { ...defaultOptions, ...options };
  
  try {
    if (opts.useRedis && redisClient) {
      // Use Redis cache
      await redisClient.flushall();
    } else {
      // Use in-memory cache
      memoryCache.clear();
    }
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
}

// Cache wrapper for async functions
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get cached value first
  const cached = await getCachedValue(key, options);
  if (cached !== null) {
    return cached;
  }
  
  // If not cached, execute function and cache result
  const result = await fn();
  await setCachedValue(key, result, options);
  
  return result;
}

// Cache wrapper with tags for easier invalidation
const tagKeyPrefix = 'tag:';
const keyTagPrefix = 'key_tags:';

// Set cached value with tags
export async function setCachedValueWithTags(
  key: string,
  value: any,
  tags: string[],
  options: CacheOptions = {}
): Promise<void> {
  const opts = { ...defaultOptions, ...options };
  
  // Store the value
  await setCachedValue(key, value, opts);
  
  // Store tags for this key
  const keyTagsKey = `${keyTagPrefix}${key}`;
  await setCachedValue(keyTagsKey, tags, { ...opts, ttl: opts.ttl! * 2 });
  
  // Add this key to each tag's list
  for (const tag of tags) {
    const tagKey = `${tagKeyPrefix}${tag}`;
    let tagKeys: string[] = await getCachedValue(tagKey, opts) || [];
    
    // Add key to tag list if not already present
    if (!tagKeys.includes(key)) {
      tagKeys.push(key);
      await setCachedValue(tagKey, tagKeys, { ...opts, ttl: opts.ttl! * 2 });
    }
  }
}

// Invalidate cache by tags
export async function invalidateCacheByTags(tags: string[], options: CacheOptions = {}): Promise<void> {
  const opts = { ...defaultOptions, ...options };
  
  for (const tag of tags) {
    const tagKey = `${tagKeyPrefix}${tag}`;
    const keys: string[] = await getCachedValue(tagKey, opts) || [];
    
    // Delete all keys associated with this tag
    for (const key of keys) {
      await deleteCachedValue(key, opts);
      
      // Also delete the key's tags reference
      const keyTagsKey = `${keyTagPrefix}${key}`;
      await deleteCachedValue(keyTagsKey, opts);
    }
    
    // Delete the tag's key list
    await deleteCachedValue(tagKey, opts);
  }
}

// Cache keys
export const CACHE_KEYS = {
  FEATURED_GEMSTONES: 'featured_gemstones',
  ALL_CATEGORIES: 'all_categories',
  HOMEPAGE_DATA: 'homepage_data',
  CART_ITEMS: 'cart_items',
  WISHLIST_ITEMS: 'wishlist_items',
  USER_PROFILE: 'user_profile',
  USER_ORDERS: 'user_orders',
  SEARCH_SUGGESTIONS: 'search_suggestions',
  TRENDING_PRODUCTS: 'trending_products'
};

// Export cache instances
export const performanceCache = {
  get: getCachedValue,
  set: setCachedValue,
  delete: deleteCachedValue,
  clear: clearAllCache,
  clearPattern: (pattern: string) => {
    // Simple implementation for clearPattern
    console.warn('clearPattern not implemented in client cache');
  },
  getStats: () => {
    return {
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys())
    };
  }
};

export const dataCache = performanceCache;
export const longCache = performanceCache;

// Export functions for cache invalidation
export const invalidateCategoryCache = async () => {
  await invalidateCacheByTags(['category']);
};

export const invalidateGemstoneCache = async () => {
  await invalidateCacheByTags(['gemstone']);
};

export const forceInvalidateAllCache = async () => {
  await clearAllCache();
};
