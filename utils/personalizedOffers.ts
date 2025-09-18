import { prisma } from '../lib/prisma';
import { logger } from './logger';

// Get personalized offers for a user
export async function getPersonalizedOffers(userId?: number) {
  try {
    const offers: any[] = [];
    
    // Add generic offers that apply to all users
    offers.push({
      id: 1,
      title: "Welcome Offer",
      description: "Get 10% off your first purchase",
      discountPercentage: 10,
      type: 'welcome',
      applicableTo: 'all',
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    });
    
    // Add flash sale offer
    offers.push({
      id: 2,
      title: "Flash Sale",
      description: "Limited time offer on premium gemstones",
      discountPercentage: 15,
      type: 'flash_sale',
      applicableTo: 'all',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    });
    
    if (userId) {
      // Get user-specific data for personalization
      const [userProfile, userOrders, userWishlist] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { 
            id: true, 
            name: true, 
            email: true, 
            createdAt: true,
            loyalty: {
              select: {
                points: true,
                tier: true,
              }
            }
          }
        }),
        prisma.order.findMany({
          where: { 
            userId: userId,
            status: 'DELIVERED'
          },
          select: {
            id: true,
            total: true,
            createdAt: true,
            items: {
              select: {
                gemstone: {
                  select: {
                    categoryId: true,
                    price: true,
                  }
                }
              }
            }
          }
        }),
        prisma.wishlistItem.findMany({
          where: { userId: userId },
          select: {
            gemstone: {
              select: {
                id: true,
                categoryId: true,
                price: true,
              }
            }
          }
        })
      ]);
      
      // Add loyalty-based offers
      if (userProfile?.loyalty) {
        const tier = userProfile.loyalty.tier;
        const points = userProfile.loyalty.points;
        
        if (tier === 'Silver' || tier === 'Gold' || tier === 'Platinum') {
          offers.push({
            id: 3,
            title: `${tier} Tier Bonus`,
            description: `Exclusive ${tier} member discount`,
            discountPercentage: tier === 'Silver' ? 5 : tier === 'Gold' ? 10 : 15,
            type: 'loyalty_bonus',
            applicableTo: 'loyalty_members',
            tier: tier,
          });
        }
        
        // Points redemption offer
        if (points >= 100) {
          offers.push({
            id: 4,
            title: "Points Redemption",
            description: "Redeem your points for discounts",
            discountPercentage: Math.min(20, Math.floor(points / 100) * 5),
            type: 'points_redemption',
            applicableTo: 'loyalty_members',
            pointsRequired: Math.min(1000, Math.floor(points / 100) * 100),
          });
        }
      }
      
      // Add anniversary offer for returning customers
      if (userOrders.length > 0) {
        const firstOrderDate = new Date(userOrders[0].createdAt);
        const daysSinceFirstOrder = (Date.now() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceFirstOrder > 30) { // Customer for more than 30 days
          offers.push({
            id: 5,
            title: "Customer Anniversary",
            description: "Special discount for our valued customer",
            discountPercentage: 12,
            type: 'anniversary',
            applicableTo: 'returning_customers',
          });
        }
      }
      
      // Add wishlist-based offers
      if (userWishlist.length > 0) {
        const wishlistCategories = userWishlist.map(item => item.gemstone.categoryId);
        const uniqueCategories = [...new Set(wishlistCategories)];
        
        if (uniqueCategories.length > 0) {
          offers.push({
            id: 6,
            title: "Wishlist Special",
            description: "Special offer on items from your wishlist",
            discountPercentage: 8,
            type: 'wishlist',
            applicableTo: 'wishlist_customers',
            categories: uniqueCategories,
          });
        }
      }
      
      // Add birthday offer if we had birthday data (simulated)
      const userBirthday = new Date();
      userBirthday.setMonth(userBirthday.getMonth() + 1); // Next month
      
      offers.push({
        id: 7,
        title: "Birthday Special",
        description: "Celebrate with 20% off your special day",
        discountPercentage: 20,
        type: 'birthday',
        applicableTo: 'authenticated_users',
        endTime: userBirthday.toISOString(),
      });
    }
    
    return offers;
  } catch (error) {
    logger.error('Error getting personalized offers', error);
    // Return basic offers as fallback
    return [
      {
        id: 1,
        title: "Welcome Offer",
        description: "Get 10% off your first purchase",
        discountPercentage: 10,
        type: 'welcome',
        applicableTo: 'all',
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        title: "Flash Sale",
        description: "Limited time offer on premium gemstones",
        discountPercentage: 15,
        type: 'flash_sale',
        applicableTo: 'all',
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }
}