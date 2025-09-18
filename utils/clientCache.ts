// Client-side cache utility
// This is a simple in-memory cache for client-side use

interface CacheEntry {
  value: any;
  expiry: number;
}

class ClientCache {
  private cache: Map<string, CacheEntry> = new Map();

  // Get cached value
  get(key: string): any {
    const entry = this.cache.get(key);
    if (entry) {
      if (entry.expiry > Date.now()) {
        return entry.value;
      } else {
        // Remove expired entry
        this.cache.delete(key);
      }
    }
    return null;
  }

  // Set cached value
  set(key: string, value: any, ttl: number = 300000): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  // Delete cached value
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clear cache entries matching a pattern
  clearPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create cache instances
export const performanceCache = new ClientCache();
export const dataCache = new ClientCache();
export const longCache = new ClientCache();

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
  TRENDING_PRODUCTS: 'trending_products',
  GEMSTONES_SEARCH: 'gemstones_search'
};

export default ClientCache;