import { PrismaClient } from '@prisma/client';
import { enhancedPerformanceCache, enhancedDataCache, enhancedLongCache } from './redisCache';
import { CACHE_KEYS } from './cache';

// Performance optimization utilities
class PerformanceOptimizer {
  private prisma: PrismaClient;
  private cacheEnabled: boolean;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cacheEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_CACHE === 'true';
  }

  // Get cached or fetch gemstones with optimized query
  async getCachedGemstones(options: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      limit = 20,
      offset = 0,
      categoryId,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // Generate cache key based on options
    const cacheKey = `gemstones:${limit}:${offset}:${categoryId || 'all'}:${featured ? 'featured' : 'all'}:${sortBy}:${sortOrder}`;
    
    if (this.cacheEnabled) {
      const cached = await enhancedLongCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Build query conditions
    const where: any = {
      active: true
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured) {
      where.featured = true;
    }

    // Execute optimized query
    const gemstones = await this.prisma.gemstone.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        [sortBy]: sortOrder
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        images: true,
        weight: true,
        dimensions: true,
        clarity: true,
        color: true,
        cut: true,
        origin: true,
        stockCount: true,
        featured: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });

    // Cache the result
    if (this.cacheEnabled) {
      await enhancedLongCache.set(cacheKey, gemstones, 300000); // 5 minutes
    }

    return gemstones;
  }

  // Get cached featured gemstones
  async getFeaturedGemstones(limit: number = 8) {
    const cacheKey = CACHE_KEYS.FEATURED_GEMSTONES;
    
    if (this.cacheEnabled) {
      const cached = await enhancedLongCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const gemstones = await this.prisma.gemstone.findMany({
      where: {
        active: true,
        featured: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        images: true,
        weight: true,
        dimensions: true,
        clarity: true,
        color: true,
        cut: true,
        origin: true,
        stockCount: true,
        featured: true,
        createdAt: true
      }
    });

    if (this.cacheEnabled) {
      await enhancedLongCache.set(cacheKey, gemstones, 300000); // 5 minutes
    }

    return gemstones;
  }

  // Get cached categories with product counts
  async getCachedCategories() {
    const cacheKey = CACHE_KEYS.ALL_CATEGORIES;
    
    if (this.cacheEnabled) {
      const cached = await enhancedDataCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const categories = await this.prisma.category.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            gemstones: {
              where: {
                active: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (this.cacheEnabled) {
      await enhancedDataCache.set(cacheKey, categories, 600000); // 10 minutes
    }

    return categories;
  }

  // Get cached homepage data
  async getHomepageData() {
    const cacheKey = CACHE_KEYS.HOMEPAGE_DATA;
    
    if (this.cacheEnabled) {
      const cached = await enhancedLongCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Fetch all homepage data in parallel
    const [featuredGemstones, categories, testimonials, faqs, banners] = await Promise.all([
      // Featured gemstones
      this.prisma.gemstone.findMany({
        where: {
          active: true,
          featured: true
        },
        take: 8,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          salePrice: true,
          images: true,
          weight: true,
          dimensions: true,
          clarity: true,
          color: true,
          cut: true,
          origin: true,
          stockCount: true,
          featured: true
        }
      }),
      
      // Categories
      this.prisma.category.findMany({
        where: {
          active: true
        },
        take: 8,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          _count: {
            select: {
              gemstones: {
                where: {
                  active: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      
      // Testimonials
      this.prisma.testimonial.findMany({
        where: {
          active: true
        },
        take: 6,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          role: true,
          company: true,
          content: true,
          rating: true,
          image: true
        }
      }),
      
      // FAQs
      this.prisma.fAQ.findMany({
        where: {
          active: true
        },
        take: 6,
        orderBy: {
          order: 'asc'
        },
        select: {
          id: true,
          question: true,
          answer: true,
          category: true
        }
      }),
      
      // Banners
      this.prisma.banner.findMany({
        where: {
          active: true
        },
        orderBy: {
          order: 'asc'
        },
        select: {
          id: true,
          title: true,
          subtitle: true,
          image: true,
          link: true
        }
      })
    ]);

    const homepageData = {
      featuredGemstones,
      categories,
      testimonials,
      faqs,
      banners
    };

    if (this.cacheEnabled) {
      await enhancedLongCache.set(cacheKey, homepageData, 600000); // 10 minutes
    }

    return homepageData;
  }

  // Invalidate all related caches when data changes
  async invalidateRelatedCaches() {
    if (this.cacheEnabled) {
      await Promise.all([
        enhancedPerformanceCache.invalidate('gemstones'),
        enhancedDataCache.invalidate('gemstones'),
        enhancedLongCache.invalidate('gemstones'),
        enhancedPerformanceCache.invalidate('categories'),
        enhancedDataCache.invalidate('categories'),
        enhancedLongCache.invalidate('categories'),
        enhancedLongCache.invalidate(CACHE_KEYS.HOMEPAGE_DATA)
      ]);
    }
  }

  // Get cache statistics
  async getCacheStats() {
    if (!this.cacheEnabled) {
      return { enabled: false };
    }

    const [perfStats, dataStats, longStats] = await Promise.all([
      enhancedPerformanceCache.getStats(),
      enhancedDataCache.getStats(),
      enhancedLongCache.getStats()
    ]);

    return {
      enabled: true,
      performance: perfStats,
      data: dataStats,
      long: longStats
    };
  }
}

export default PerformanceOptimizer;