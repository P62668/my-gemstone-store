import { prisma } from '../lib/prisma';

export interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'price' | 'name' | 'views' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: number;
  name: string;
  type: string;
  description: string;
  price: number;
  images: string[];
  stockCount: number;
  rating?: number;
  reviewCount: number;
  category?: {
    id: number;
    name: string;
  };
  score?: number;
}

export class SearchManager {
  /**
   * Search gemstones with filters
   */
  static async searchGemstones(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ results: SearchResult[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {
        active: true,
      };

      // Text search
      if (query) {
        where.OR = [
          { name: { contains: query } },
          { description: { contains: query } },
          { type: { contains: query } },
        ];
      }

      // Apply filters
      if (filters.category) {
        where.category = { name: { contains: filters.category } };
      }

      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        where.price = {};
        if (filters.priceMin !== undefined) where.price.gte = filters.priceMin;
        if (filters.priceMax !== undefined) where.price.lte = filters.priceMax;
      }

      if (filters.inStock !== undefined) {
        if (filters.inStock) {
          where.stockCount = { gt: 0 };
        } else {
          where.stockCount = 0;
        }
      }

      if (filters.featured !== undefined) {
        where.featured = filters.featured;
      }

      // Build order by
      const orderBy: any = {};
      if (filters.sortBy) {
        orderBy[filters.sortBy] = filters.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      // Execute search
      const [results, total] = await Promise.all([
        prisma.gemstone.findMany({
          where,
          include: {
            category: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.gemstone.count({ where }),
      ]);

      // Transform results
      const searchResults = results.map(gemstone => ({
        id: gemstone.id,
        name: gemstone.name,
        description: gemstone.description,
        price: gemstone.price,
        images: gemstone.images ? JSON.parse(gemstone.images) : [],
        stockCount: gemstone.stockCount,
        category: gemstone.category ? {
          id: gemstone.category.id,
          name: gemstone.category.name,
        } : undefined,
      })) as SearchResult[];

      return {
        results: searchResults,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error searching gemstones:', error);
      return {
        results: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  /**
   * Get product recommendations based on user behavior
   */
  static async getRecommendations(
    userId?: number,
    gemstoneId?: number,
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      let recommendations: any[] = [];

      if (userId) {
        // Get recommendations based on user's purchase history
        const userOrders = await prisma.order.findMany({
          where: {
            userId,
            status: 'paid',
          },
          include: {
            items: {
              include: {
                gemstone: {
                  include: { category: true },
                },
              },
            },
          },
        });

        if (userOrders.length > 0) {
          // Get categories user has purchased from
          const purchasedCategories = new Set<number>();
          userOrders.forEach(order => {
            order.items.forEach(item => {
              if (item.gemstone.categoryId) {
                purchasedCategories.add(item.gemstone.categoryId);
              }
            });
          });

          // Get similar products from same categories
          if (purchasedCategories.size > 0) {
            recommendations = await prisma.gemstone.findMany({
              where: {
                active: true,
                categoryId: { in: Array.from(purchasedCategories) },
                stockCount: { gt: 0 },
              },
              include: { category: true },
              orderBy: { createdAt: 'desc' },
              take: limit,
            });
          }
        }

        // If no recommendations from purchase history, get from recently viewed
        if (recommendations.length === 0) {
          const recentlyViewed = await prisma.recentlyViewed.findMany({
            where: { userId },
            include: {
              gemstone: {
                include: { category: true },
              },
            },
            orderBy: { viewedAt: 'desc' },
            take: 5,
          });

          if (recentlyViewed.length > 0) {
            const viewedCategories = recentlyViewed
              .map(rv => rv.gemstone.categoryId)
              .filter(Boolean);

            if (viewedCategories.length > 0) {
              recommendations = await prisma.gemstone.findMany({
                where: {
                  active: true,
                  categoryId: { in: viewedCategories },
                  stockCount: { gt: 0 },
                  id: { notIn: recentlyViewed.map(rv => rv.gemstoneId) },
                },
                include: { category: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
              });
            }
          }
        }
      }

      // If still no recommendations, get featured products
      if (recommendations.length === 0) {
        recommendations = await prisma.gemstone.findMany({
          where: {
            active: true,
            featured: true,
            stockCount: { gt: 0 },
          },
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          take: limit,
        });
      }

      // If still no recommendations, get popular products
      if (recommendations.length === 0) {
        recommendations = await prisma.gemstone.findMany({
          where: {
            active: true,
            stockCount: { gt: 0 },
          },
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          take: limit,
        });
      }

      // Transform results
      return recommendations.map(gemstone => ({
        id: gemstone.id,
        name: gemstone.name,
        description: gemstone.description,
        price: gemstone.price,
        images: gemstone.images ? JSON.parse(gemstone.images) : [],
        stockCount: gemstone.stockCount,
        category: gemstone.category ? {
          id: gemstone.category.id,
          name: gemstone.category.name,
        } : undefined,
      })) as SearchResult[];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get related products for a specific gemstone
   */
  static async getRelatedProducts(
    gemstoneId: number,
    limit: number = 8
  ): Promise<SearchResult[]> {
    try {
      const gemstone = await prisma.gemstone.findUnique({
        where: { id: gemstoneId },
        include: { category: true },
      });

      if (!gemstone) return [];

      const relatedProducts = await prisma.gemstone.findMany({
        where: {
          active: true,
          id: { not: gemstoneId },
          stockCount: { gt: 0 },
                      OR: [
              { categoryId: gemstone.categoryId },
              {
                price: {
                  gte: gemstone.price * 0.7,
                  lte: gemstone.price * 1.3,
                },
              },
            ],
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return relatedProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images ? JSON.parse(product.images) : [],
        stockCount: product.stockCount,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
        } : undefined,
      })) as SearchResult[];
    } catch (error) {
      console.error('Error getting related products:', error);
      return [];
    }
  }

  /**
   * Get trending products
   */
  static async getTrendingProducts(limit: number = 10): Promise<SearchResult[]> {
    try {
      const trendingProducts = await prisma.gemstone.findMany({
        where: {
          active: true,
          stockCount: { gt: 0 },
        },
        include: { category: true },
        orderBy: [
          { createdAt: 'desc' },
          { price: 'desc' },
        ],
        take: limit,
      });

      return trendingProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images ? JSON.parse(product.images) : [],
        stockCount: product.stockCount,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
        } : undefined,
      })) as SearchResult[];
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      if (!query || query.length < 2) return [];

      const suggestions = await prisma.gemstone.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        select: { name: true, description: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const uniqueSuggestions = new Set<string>();
      suggestions.forEach(item => {
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          uniqueSuggestions.add(item.name);
        }
        if (item.description && item.description.toLowerCase().includes(query.toLowerCase())) {
          uniqueSuggestions.add(item.description.substring(0, 50));
        }
      });

      return Array.from(uniqueSuggestions).slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  static async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
    try {
      const popularTerms = await prisma.gemstone.findMany({
        where: { active: true },
        select: { name: true },
        orderBy: { createdAt: 'desc' },
        take: limit * 2, // Get more to account for duplicates
      });

      const termCounts = new Map<string, number>();
      popularTerms.forEach(item => {
        const count = termCounts.get(item.name) || 0;
        termCounts.set(item.name, count + 1);
      });

      return Array.from(termCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([term]) => term);
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      return [];
    }
  }
}
