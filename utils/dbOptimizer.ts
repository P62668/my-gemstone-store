import { prisma } from '../lib/prisma';
import { performanceCache } from './clientCache';

// Generic cached query function with aggressive caching for performance
export async function cachedQuery(
  cacheKey: string,
  queryFn: () => Promise<any>,
  ttl: number = 60000 // 1 minute default
): Promise<any> {
  // Check cache first for instant response
  const cached = performanceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Execute query and cache result
  const result = await queryFn();
  performanceCache.set(cacheKey, result, ttl);
  return result;
}

// High-performance database operations
export class DBOptimizer {
  // Instant product queries with aggressive caching
  static async getProducts() {
    return cachedQuery('db_products', async () => {
      return await prisma.gemstone.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          stockCount: true,
          images: true,
          category: true,
          origin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }, 300000); // 5 minutes cache
  }

  // Instant featured products
  static async getFeaturedProducts() {
    return cachedQuery('db_featured_products', async () => {
      return await prisma.gemstone.findMany({
        where: { featured: true },
        select: {
          id: true,
          name: true,
          price: true,
          stockCount: true,
          images: true,
          category: true,
        },
        take: 12,
        orderBy: { createdAt: 'desc' },
      });
    }, 600000); // 10 minutes cache
  }

  // Instant product details
  static async getProductById(id: number) {
    return cachedQuery(`db_product_${id}`, async () => {
      return await prisma.gemstone.findUnique({
        where: { id },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }, 300000); // 5 minutes cache
  }

  // Instant cart operations
  static async getUserCart(userId: number) {
    return cachedQuery(`db_cart_${userId}`, async () => {
      return await prisma.cartItem.findMany({
        where: { userId },
        include: {
          gemstone: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stockCount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }, 30000); // 30 seconds cache for dynamic data
  }

  // Instant wishlist operations
  static async getUserWishlist(userId: number) {
    return cachedQuery(`db_wishlist_${userId}`, async () => {
      return await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          gemstone: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stockCount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }, 30000); // 30 seconds cache
  }

  // Instant user orders
  static async getUserOrders(userId: number) {
    return cachedQuery(`db_orders_${userId}`, async () => {
      return await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              gemstone: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit for performance
      });
    }, 120000); // 2 minutes cache
  }

  // Instant categories
  static async getCategories() {
    return cachedQuery('db_categories', async () => {
      return await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              gemstones: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }, 600000); // 10 minutes cache
  }

  // Search optimization with caching
  static async searchProducts(query: string, category?: string) {
    const cacheKey = `db_search_${query}_${category || 'all'}`;
    return cachedQuery(cacheKey, async () => {
      const where: any = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (category) {
        where.category = { equals: category };
      }

      return await prisma.gemstone.findMany({
        where,
        select: {
          id: true,
          name: true,
          price: true,
          stockCount: true,
          images: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit for performance
      });
    }, 180000); // 3 minutes cache
  }

  // Clear cache for specific patterns
  static clearCache(pattern: string) {
    performanceCache.clearPattern(pattern);
  }

  // Invalidate user-specific cache on data changes
  static invalidateUserCache(userId: number) {
    this.clearCache(`db_cart_${userId}`);
    this.clearCache(`db_wishlist_${userId}`);
    this.clearCache(`db_orders_${userId}`);
  }

  // Invalidate product cache on data changes
  static invalidateProductCache() {
    this.clearCache('db_products');
    this.clearCache('db_featured_products');
    this.clearCache('db_categories');
  }
}