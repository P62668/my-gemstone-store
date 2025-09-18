import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  
  try {
    if (req.method === 'GET') {
      // Get AI-powered personalized recommendations
      const recommendations = await getAIRecommendations(user?.id);
      res.status(200).json(recommendations);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('AI Recommendations API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get AI-powered personalized recommendations for a user
async function getAIRecommendations(userId?: number) {
  try {
    let recommendations: any[] = [];
    
    if (userId) {
      // Get comprehensive user profile data
      const userProfile = await getUserProfile(userId);
      
      // Get recommendations based on user profile
      recommendations = await getProfileBasedRecommendations(userProfile);
    } else {
      // For anonymous users, get trending and popular items
      recommendations = await getAnonymousRecommendations();
    }
    
    // Add diversity to recommendations
    const diverseRecommendations = await addDiversity(recommendations, userId);
    
    // Enrich recommendations with additional data
    const enrichedRecommendations = await enrichRecommendations(diverseRecommendations);
    
    return enrichedRecommendations.slice(0, 12); // Limit to 12 recommendations
  } catch (error) {
    logger.error('Error getting AI recommendations', error);
    // Fallback to basic recommendations
    return await getFallbackRecommendations(userId);
  }
}

// Get comprehensive user profile
async function getUserProfile(userId: number) {
  try {
    // Get user's purchase history
    const purchasedItems = await prisma.orderItem.findMany({
      where: {
        order: {
          userId: userId,
          status: 'DELIVERED'
        }
      },
      select: {
        gemstone: {
          select: {
            id: true,
            categoryId: true,
            tags: true,
            price: true,
            color: true,
          }
        },
        quantity: true,
      }
    });
    
    // Get user's wishlist items
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: userId
      },
      select: {
        gemstone: {
          select: {
            id: true,
            categoryId: true,
            tags: true,
            price: true,
            color: true,
          }
        }
      }
    });
    
    // Get user's viewed items (from recently viewed)
    const viewedItems = await prisma.recentlyViewed.findMany({
      where: {
        userId: userId
      },
      select: {
        gemstone: {
          select: {
            id: true,
            categoryId: true,
            tags: true,
            price: true,
            color: true,
          }
        },
        viewedAt: true,
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 20
    });
    
    // Get user's reviews
    const reviews = await prisma.review.findMany({
      where: {
        userId: userId
      },
      select: {
        gemstoneId: true,
        rating: true,
        helpfulCount: true,
      }
    });
    
    return {
      userId,
      purchasedItems,
      wishlistItems,
      viewedItems,
      reviews,
    };
  } catch (error) {
    logger.error('Error getting user profile', error);
    return {
      userId,
      purchasedItems: [],
      wishlistItems: [],
      viewedItems: [],
      reviews: [],
    };
  }
}

// Get recommendations based on user profile
async function getProfileBasedRecommendations(userProfile: any) {
  try {
    // Extract preferences from user profile
    const { purchasedItems, wishlistItems, viewedItems, reviews } = userProfile;
    
    // 1. Get categories and tags from user's interactions
    const categoryIds = new Set<number>();
    const tags = new Set<string>();
    const colors = new Set<string>();
    const priceRanges: number[] = [];
    
    [...purchasedItems, ...wishlistItems, ...viewedItems].forEach(item => {
      if (item.gemstone.categoryId) {
        categoryIds.add(item.gemstone.categoryId);
      }
      if (item.gemstone.tags) {
        item.gemstone.tags.split(',').forEach(tag => {
          if (tag.trim()) {
            tags.add(tag.trim());
          }
        });
      }
      if (item.gemstone.color) {
        colors.add(item.gemstone.color);
      }
      if (item.gemstone.price) {
        priceRanges.push(item.gemstone.price);
      }
    });
    
    // Calculate preferred price range (middle 50%)
    let minPrice = 0;
    let maxPrice = Number.MAX_VALUE;
    if (priceRanges.length > 0) {
      priceRanges.sort((a, b) => a - b);
      const lowerQuartile = priceRanges[Math.floor(priceRanges.length * 0.25)];
      const upperQuartile = priceRanges[Math.floor(priceRanges.length * 0.75)];
      minPrice = lowerQuartile * 0.7; // 30% buffer below
      maxPrice = upperQuartile * 1.3; // 30% buffer above
    }
    
    // 2. Build recommendation query based on user preferences
    const recommendationQuery: any = {
      AND: [
        { active: true },
        { stockCount: { gt: 0 } },
        {
          OR: [
            { categoryId: { in: Array.from(categoryIds) } },
            { tags: { in: Array.from(tags) } },
            { color: { in: Array.from(colors) } },
            {
              price: {
                gte: minPrice,
                lte: maxPrice,
              }
            }
          ]
        }
      ]
    };
    
    // 3. Get recommendations with scoring
    const recommendations = await prisma.gemstone.findMany({
      where: recommendationQuery,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        categoryId: true,
        stockCount: true,
        featured: true,
        cashOnDelivery: true,
        createdAt: true,
        averageRating: true,
        reviewCount: true,
        viewCount: true,
        color: true,
        tags: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: 20, // Get more to allow for diversity
    });
    
    // 4. Score recommendations based on user preferences
    const scoredRecommendations = recommendations.map(gemstone => {
      let score = 0;
      
      // Category match bonus
      if (categoryIds.has(gemstone.categoryId)) {
        score += 30;
      }
      
      // Tag match bonus
      if (gemstone.tags) {
        const gemTags = gemstone.tags.split(',').map(t => t.trim());
        const matchingTags = gemTags.filter(tag => tags.has(tag));
        score += matchingTags.length * 10;
      }
      
      // Color match bonus
      if (gemstone.color && colors.has(gemstone.color)) {
        score += 15;
      }
      
      // Price range match bonus
      if (gemstone.price >= minPrice && gemstone.price <= maxPrice) {
        score += 10;
      }
      
      // Popularity bonus
      score += (gemstone.averageRating || 0) * 5;
      score += (gemstone.reviewCount || 0) * 2;
      score += (gemstone.viewCount || 0) * 0.1;
      
      // Freshness bonus
      const daysSinceCreation = (Date.now() - new Date(gemstone.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 20 - daysSinceCreation); // Bonus for newer items
      
      return {
        ...gemstone,
        aiScore: score,
      };
    });
    
    // Sort by AI score
    return scoredRecommendations.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  } catch (error) {
    logger.error('Error getting profile-based recommendations', error);
    return [];
  }
}

// Get recommendations for anonymous users
async function getAnonymousRecommendations() {
  try {
    // Get trending and popular items
    const recommendations = await prisma.gemstone.findMany({
      where: {
        active: true,
        stockCount: { gt: 0 },
        featured: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        categoryId: true,
        stockCount: true,
        featured: true,
        cashOnDelivery: true,
        createdAt: true,
        averageRating: true,
        reviewCount: true,
        viewCount: true,
        color: true,
        tags: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: 12,
    });
    
    // Add AI score for consistency
    return recommendations.map(gemstone => ({
      ...gemstone,
      aiScore: (gemstone.averageRating || 0) * 10 + 
               (gemstone.reviewCount || 0) * 5 + 
               (gemstone.viewCount || 0) * 0.5,
    }));
  } catch (error) {
    logger.error('Error getting anonymous recommendations', error);
    return [];
  }
}

// Add diversity to recommendations
async function addDiversity(recommendations: any[], userId?: number) {
  try {
    // If we don't have enough recommendations, add some popular items
    if (recommendations.length < 12) {
      const additionalItems = await prisma.gemstone.findMany({
        where: {
          active: true,
          stockCount: { gt: 0 },
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          categoryId: true,
          stockCount: true,
          featured: true,
          cashOnDelivery: true,
          createdAt: true,
          averageRating: true,
          reviewCount: true,
          viewCount: true,
          color: true,
          tags: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { averageRating: 'desc' },
          { reviewCount: 'desc' },
        ],
        take: 12 - recommendations.length,
      });
      
      // Add AI scores to additional items
      const scoredAdditionalItems = additionalItems.map(gemstone => ({
        ...gemstone,
        aiScore: (gemstone.averageRating || 0) * 8 + 
                 (gemstone.reviewCount || 0) * 4 + 
                 (gemstone.viewCount || 0) * 0.3,
      }));
      
      return [...recommendations, ...scoredAdditionalItems];
    }
    
    return recommendations;
  } catch (error) {
    logger.error('Error adding diversity to recommendations', error);
    return recommendations;
  }
}

// Enrich recommendations with additional data
async function enrichRecommendations(recommendations: any[]) {
  try {
    // Add additional computed fields for better presentation
    return recommendations.map(gemstone => {
      // Parse images if needed
      let images: string[] = [];
      try {
        if (Array.isArray(gemstone.images)) {
          images = gemstone.images;
        } else if (typeof gemstone.images === 'string') {
          images = JSON.parse(gemstone.images);
        }
      } catch (e) {
        images = ['/images/placeholder-gemstone.jpg'];
      }
      
      // Ensure we have at least one image
      if (images.length === 0) {
        images = ['/images/placeholder-gemstone.jpg'];
      }
      
      return {
        ...gemstone,
        images,
        // Add computed fields for UI
        discountPercentage: gemstone.salePrice && gemstone.price 
          ? Math.round(((gemstone.price - gemstone.salePrice) / gemstone.price) * 100)
          : 0,
        isNew: (Date.now() - new Date(gemstone.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000, // Less than 7 days old
      };
    });
  } catch (error) {
    logger.error('Error enriching recommendations', error);
    return recommendations;
  }
}

// Fallback recommendations
async function getFallbackRecommendations(userId?: number) {
  try {
    const recommendations = await prisma.gemstone.findMany({
      where: {
        active: true,
        stockCount: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        categoryId: true,
        stockCount: true,
        featured: true,
        cashOnDelivery: true,
        createdAt: true,
        averageRating: true,
        reviewCount: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    
    return recommendations;
  } catch (error) {
    logger.error('Error getting fallback recommendations', error);
    return [];
  }
}

export default withAuth(handler);