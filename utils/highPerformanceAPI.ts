// High-Performance API Service with Aggressive Caching
// Disabled caching to ensure data consistency
import { performanceCache, CACHE_KEYS } from './clientCache';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  credentials?: 'include' | 'omit' | 'same-origin';
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

class HighPerformanceAPI {
  private baseURL = '';

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      credentials = 'include',
      cache = false, // Disabled caching by default
      cacheKey,
      cacheTTL = 60000 // 1 minute default
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const key = cacheKey || `api_${method}_${endpoint}`;

    // For GET requests, try cache first
    // Disabled caching to ensure data consistency
    // if (method === 'GET' && cache) {
    //   const cached = performanceCache.get(key);
    //   if (cached) {
    //     return cached;
    //   }
    // }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials,
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET responses
      // Disabled caching to ensure data consistency
      // if (method === 'GET' && cache) {
      //   performanceCache.set(key, data, cacheTTL);
      // }

      // Clear related cache on mutations
      // Disabled caching to ensure data consistency
      // if (method !== 'GET') {
      //   this.clearRelatedCache(endpoint);
      // }

      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Disabled cache clearing since caching is disabled
  // private clearRelatedCache(endpoint: string) {
  //   if (endpoint.includes('/cart')) {
  //     performanceCache.clearPattern('cart');
  //     performanceCache.clearPattern('navbar_counts');
  //   }
  //   if (endpoint.includes('/wishlist')) {
  //     performanceCache.clearPattern('wishlist');
  //     performanceCache.clearPattern('navbar_counts');
  //   }
  //   if (endpoint.includes('/orders')) {
  //     performanceCache.clearPattern('orders');
  //   }
  //   if (endpoint.includes('/users')) {
  //     performanceCache.clearPattern('user');
  //   }
  // }

  // Instant account operations
  async getProfile(userId?: string): Promise<any> {
    return this.request('/api/users/profile', {
      cache: false, // Explicitly disable caching
      cacheTTL: 0
    });
  }

  async updateProfile(data: any): Promise<any> {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: data,
      cache: false
    });
  }

  // Instant order operations
  async getOrders(userId?: string): Promise<any> {
    return this.request('/api/orders', {
      cache: false, // Explicitly disable caching
      cacheTTL: 0
    });
  }

  async getOrderDetails(orderId: string): Promise<any> {
    return this.request(`/api/orders/${orderId}`, {
      cache: false, // Explicitly disable caching
      cacheTTL: 0
    });
  }

  // Instant product operations
  async getProducts(): Promise<any> {
    return this.request('/api/gemstones', {
      cache: false, // Explicitly disable caching
      cacheTTL: 0
    });
  }

  async getFeaturedProducts(): Promise<any> {
    return this.request('/api/gemstones/featured', {
      cache: false, // Explicitly disable caching
      cacheTTL: 0
    });
  }

  async getProductDetails(id: string): Promise<any> {
    return this.request(`/api/gemstones/${id}`, {
      cache: false, // Explicitly disable caching
      cacheTTL: 0
    });
  }

  // Instant cart operations
  async addToCart(productId: number, quantity: number): Promise<any> {
    return this.request('/api/cart/add', {
      method: 'POST',
      body: { productId, quantity },
      cache: false
    });
  }

  async removeFromCart(itemId: number): Promise<any> {
    return this.request(`/api/cart/remove?id=${itemId}`, {
      method: 'DELETE',
      cache: false
    });
  }

  async updateCartQuantity(itemId: number, quantity: number): Promise<any> {
    return this.request('/api/cart/update', {
      method: 'PUT',
      body: { itemId, quantity },
      cache: false
    });
  }

  // Instant wishlist operations
  async addToWishlist(gemstoneId: number): Promise<any> {
    return this.request('/api/users/wishlist', {
      method: 'POST',
      body: { gemstoneId },
      cache: false
    });
  }

  async removeFromWishlist(gemstoneId: number): Promise<any> {
    return this.request('/api/users/wishlist', {
      method: 'DELETE',
      body: { gemstoneId },
      cache: false
    });
  }

  // Prefetch critical data for instant access
  async prefetchCriticalData(): Promise<void> {
    try {
      // Prefetch in parallel for maximum speed
      await Promise.all([
        this.getProducts(),
        this.getFeaturedProducts(),
        this.getProfile().catch(() => null), // Don't fail if not logged in
        this.getOrders().catch(() => null), // Don't fail if not logged in
      ]);
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  // Clear all cache
  clearAllCache(): void {
    performanceCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return performanceCache.getStats();
  }
}

export const highPerformanceAPI = new HighPerformanceAPI();