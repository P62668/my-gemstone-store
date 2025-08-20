import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { logger } from '../../../utils/logger';

// Cache for analytics data (in production, use Redis)
let analyticsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check system health
async function checkSystemHealth() {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;
    
    return {
      database: dbResponseTime < 1000 ? 'healthy' : 'slow',
      api: 'healthy',
      uptime: 99.9,
      responseTime: dbResponseTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    logger.error('System health check failed', error, {
      message: 'System health check failed'
    });
    
    return {
      database: 'error',
      api: 'error',
      uptime: 0,
      responseTime: 0,
      lastChecked: new Date().toISOString()
    };
  }
}

// Helper function to generate revenue chart data
async function generateRevenueChartData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        total: true,
        createdAt: true
      }
    });
    
    // Group by date and sum totals
    const dailyRevenue: { [key: string]: number } = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total;
    });
    
    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue
    }));
  } catch (error) {
    logger.error('Failed to generate revenue chart data', error, {
      message: 'Revenue chart data generation failed'
    });
    return [];
  }
}

// Helper function to generate user growth data
async function generateUserGrowthData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'admin' },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true
      }
    });
    
    // Group by date and count users
    const dailyUsers: { [key: string]: number } = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      dailyUsers[date] = (dailyUsers[date] || 0) + 1;
    });
    
    return Object.entries(dailyUsers).map(([date, count]) => ({
      date,
      count
    }));
  } catch (error) {
    logger.error('Failed to generate user growth data', error, {
      message: 'User growth data generation failed'
    });
    return [];
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' } 
    });
  }

  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: { message: 'Authentication required', code: 'AUTHENTICATION_ERROR' } });

    // Check cache first
    if (analyticsCache && Date.now() - analyticsCache.timestamp < CACHE_DURATION) {
      logger.info('Analytics data served from cache', {
        userId: adminUser.id,
        userEmail: adminUser.email
      });

      return res.status(200).json({
        success: true,
        data: analyticsCache.data,
        cached: true,
        timestamp: analyticsCache.timestamp
      });
    }

    // Fetch analytics data with proper error handling
    let totalUsers = 0;
    let totalOrders = 0;
    let totalProducts = 0;
    let totalRevenue = 0;
    let recentOrders: any[] = [];
    let topProducts: any[] = [];
    let systemHealth: any = {};

    try {
      // Total users
      totalUsers = await prisma.user.count({
        where: { role: { not: 'admin' } }
      });
    } catch (error) {
      logger.error('Failed to fetch total users', error, {
        userId: adminUser.id,
        userEmail: adminUser.email
      });
    }

    try {
      // Total orders
      totalOrders = await prisma.order.count();
    } catch (error) {
      logger.error('Failed to fetch total orders', error, {
        userId: adminUser.id,
        userEmail: adminUser.email
      });
    }

    try {
      // Total products
      totalProducts = await prisma.gemstone.count();
    } catch (error) {
      logger.error('Failed to fetch total products', error, {
        userId: adminUser.id,
        userEmail: adminUser.email
      });
    }

    try {
      // Total revenue
      const revenueResult = await prisma.order.aggregate({
        where: { status: 'completed' },
        _sum: { total: true }
      });
      totalRevenue = revenueResult._sum.total || 0;
    } catch (error) {
      logger.error('Failed to fetch total revenue', error, {
        userId: adminUser.id,
        userEmail: adminUser.email
      });
    }

    try {
      // Recent orders
      recentOrders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              gemstone: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to fetch recent orders', error, {
        userId: adminUser.id,
        userEmail: adminUser.email
      });
    }

    try {
      // Top products - simplified query to avoid type issues
      const topProductsRaw = await prisma.orderItem.groupBy({
        by: ['gemstoneId'],
        _sum: {
          quantity: true,
        },
      });
      
      // Sort manually to get top 10
      topProducts = topProductsRaw
        .sort((a, b) => (b._sum.quantity || 0) - (a._sum.quantity || 0))
        .slice(0, 10);
    } catch (error) {
      logger.error('Failed to fetch top products', error, {
        userId: adminUser.id,
        userEmail: adminUser.email
      });
    }

    try {
      // System health check
      systemHealth = await checkSystemHealth();
    } catch (error) {
      logger.error('Failed to check system health', error, {
        userId: adminUser.id,
        userEmail: adminUser.email
      });
      systemHealth = {
        database: 'error',
        api: 'error',
        uptime: 0,
        responseTime: 0,
        lastChecked: new Date().toISOString()
      };
    }

    // Process recent orders
    const processedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Unknown',
      amount: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.length
    }));

    // Process top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        try {
          const gemstone = await prisma.gemstone.findUnique({
            where: { id: item.gemstoneId },
            select: { name: true, price: true }
          });
          return {
            id: item.gemstoneId,
            name: gemstone?.name || 'Unknown Product',
            totalSold: item._sum.quantity || 0,
            revenue: (gemstone?.price || 0) * (item._sum.quantity || 0)
          };
        } catch (error) {
          logger.error('Failed to fetch gemstone details', error, {
            gemstoneId: item.gemstoneId,
            userId: adminUser.id
          });
          return {
            id: item.gemstoneId,
            name: 'Unknown Product',
            totalSold: item._sum.quantity || 0,
            revenue: 0
          };
        }
      })
    );

    // Generate additional data
    const revenueChartData = await generateRevenueChartData();
    const userGrowthData = await generateUserGrowthData();

    // Get real-time stats
    let pendingOrders = 0;
    let lowStockItems = 0;
    let recentActivity = 0;

    try {
      pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
    } catch (error) {
      logger.error('Failed to fetch pending orders count', error, {
        userId: adminUser.id
      });
    }

    try {
      lowStockItems = await prisma.gemstone.count({ where: { stockCount: { lte: 5 } } });
    } catch (error) {
      logger.error('Failed to fetch low stock items count', error, {
        userId: adminUser.id
      });
    }

    try {
      recentActivity = await prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });
    } catch (error) {
      logger.error('Failed to fetch recent activity count', error, {
        userId: adminUser.id
      });
    }

    const analyticsData = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders: processedRecentOrders,
      topProducts: topProductsWithDetails,
      revenueChart: revenueChartData,
      userGrowth: userGrowthData,
      systemHealth,
      realTimeStats: {
        pendingOrders,
        lowStockItems,
        onlineUsers: Math.floor(Math.random() * 50) + 10, // Mock data
        recentActivity
      }
    };

    // Update cache
    analyticsCache = {
      data: analyticsData,
      timestamp: Date.now()
    };

    logger.info('Analytics data generated successfully', {
      userId: adminUser.id,
      userEmail: adminUser.email,
      dataPoints: Object.keys(analyticsData).length
    });

    res.status(200).json({
      success: true,
      data: analyticsData,
      cached: false,
      timestamp: Date.now()
    });

  } catch (error) {
    // Proper error handling to prevent [object Object] errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Analytics API error', error, {
      message: 'Analytics API failed',
      errorMessage,
      errorStack,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to load analytics data',
        code: 'ANALYTICS_ERROR',
        details: errorMessage
      }
    });
  }
}

export default withAdminAuth(handler);

// Clear cache endpoint (for admin use)
export async function clearAnalyticsCache() {
  analyticsCache = null;
  logger.info('Analytics cache cleared');
}
