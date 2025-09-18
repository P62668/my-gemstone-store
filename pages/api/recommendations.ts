import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'GET') {
      // Get personalized recommendations based on user's purchase history and preferences
      const recommendations = await getPersonalizedRecommendations(user.id);
      res.status(200).json(recommendations);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Recommendations API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get personalized recommendations for a user
async function getPersonalizedRecommendations(userId: number) {
  // 1. Get user's purchase history
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
          tags: true
        }
      }
    }
  });
  
  // 2. Get user's wishlist items
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId: userId
    },
    select: {
      gemstone: {
        select: {
          id: true,
          categoryId: true,
          tags: true
        }
      }
    }
  });
  
  // 3. Get user's viewed items (from recently viewed)
  const viewedItems = await prisma.recentlyViewed.findMany({
    where: {
      userId: userId
    },
    select: {
      gemstone: {
        select: {
          id: true,
          categoryId: true,
          tags: true
        }
      }
    },
    orderBy: {
      viewedAt: 'desc'
    },
    take: 10
  });
  
  // 4. Extract categories and tags from user's interactions
  const categoryIds = new Set<number>();
  const tags = new Set<string>();
  
  [...purchasedItems, ...wishlistItems, ...viewedItems].forEach(item => {
    if (item.gemstone.categoryId) {
      categoryIds.add(item.gemstone.categoryId);
    }
    if (item.gemstone.tags) {
      // Assuming tags is a comma-separated string
      item.gemstone.tags.split(',').forEach(tag => {
        if (tag.trim()) {
          tags.add(tag.trim());
        }
      });
    }
  });
  
  // 5. Get recommendations based on categories and tags
  const recommendations = await prisma.gemstone.findMany({
    where: {
      AND: [
        { active: true },
        {
          OR: [
            { categoryId: { in: Array.from(categoryIds) } },
            { tags: { in: Array.from(tags) } }
          ]
        }
      ]
    },
    orderBy: {
      averageRating: 'desc'
    },
    take: 12,
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
  });
  
  // 6. Add diversity to recommendations by including some popular items
  if (recommendations.length < 12) {
    const popularItems = await prisma.gemstone.findMany({
      where: {
        active: true,
        featured: true
      },
      orderBy: {
        reviewCount: 'desc'
      },
      take: 12 - recommendations.length,
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
    });
    
    // Combine recommendations with popular items
    return [...recommendations, ...popularItems];
  }
  
  return recommendations;
}

export default withAuth(handler);