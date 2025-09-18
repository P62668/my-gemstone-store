import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAdminAuth } from '../../../utils/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  // Create a new Prisma client for each request to avoid connection issues
  const prisma = new PrismaClient();
  
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    // Set cache control headers for real-time data
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Get basic counts with error handling
    let userCount = 0, orderCount = 0, gemstoneCount = 0, categoryCount = 0;
    
    try {
      userCount = await prisma.user.count({ where: { role: { not: 'admin' } } });
    } catch (e) {
      console.error('Error counting users:', e);
    }
    
    try {
      orderCount = await prisma.order.count();
    } catch (e) {
      console.error('Error counting orders:', e);
    }
    
    try {
      gemstoneCount = await prisma.gemstone.count();
    } catch (e) {
      console.error('Error counting gemstones:', e);
    }
    
    try {
      categoryCount = await prisma.category.count();
    } catch (e) {
      console.error('Error counting categories:', e);
    }

    // Get revenue data
    let totalRevenue = 0;
    try {
      const revenueData = await prisma.order.aggregate({
        where: { status: 'completed' },
        _sum: { total: true }
      });
      totalRevenue = revenueData._sum?.total || 0;
    } catch (e) {
      console.error('Error getting revenue:', e);
    }

    // Get recent orders (last 24 hours for more real-time feel)
    let recentOrders: any[] = [];
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      recentOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        },
        take: 10, // Increase to 10 for better real-time view
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      });
    } catch (e) {
      console.error('Error getting recent orders:', e);
    }

    // Get low stock items (critical threshold for real-time alerts)
    let lowStockItems: any[] = [];
    try {
      lowStockItems = await prisma.gemstone.findMany({
        where: { 
          stockCount: { lte: 10 }, // Lower threshold for better alerts
          active: true
        },
        take: 10, // Increase to 10 items
        orderBy: { stockCount: 'asc' },
        include: {
          category: {
            select: { name: true }
          }
        }
      });
    } catch (e) {
      console.error('Error getting low stock items:', e);
    }

    // Get order status counts
    let pendingOrders = 0, completedOrders = 0, processingOrders = 0, cancelledOrders = 0;
    try {
      const orderStatusCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      });
      
      const orderStatusMap = orderStatusCounts.reduce((acc: any, item: any) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {});
      
      pendingOrders = orderStatusMap.pending || 0;
      completedOrders = orderStatusMap.completed || 0;
      processingOrders = orderStatusMap.processing || 0;
      cancelledOrders = orderStatusMap.cancelled || 0;
    } catch (e) {
      console.error('Error getting order status counts:', e);
    }

    // Calculate performance metrics
    const averageOrderValue = completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(2) : '0.00';
    const orderCompletionRate = orderCount > 0 ? ((completedOrders / orderCount) * 100).toFixed(2) : '0.00';
    const conversionRate = userCount > 0 ? (orderCount / userCount * 100).toFixed(2) : '0.00';

    // Calculate inventory value
    let inventoryValue = 0;
    try {
      const inventoryData = await prisma.gemstone.aggregate({
        _sum: {
          price: true
        },
        where: {
          active: true
        }
      });
      inventoryValue = inventoryData._sum?.price || 0;
    } catch (e) {
      console.error('Error calculating inventory value:', e);
    }

    // Calculate user growth (last 30 days)
    let userGrowth = 0;
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentUserCount = await prisma.user.count({
        where: {
          role: { not: 'admin' },
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });
      userGrowth = recentUserCount;
    } catch (e) {
      console.error('Error calculating user growth:', e);
    }

    // Get monthly revenue data for the last 6 months
    let monthlyRevenue: any[] = [];
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyRevenueData = await prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          status: 'completed',
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        _sum: {
          total: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      // Process data to group by month
      const monthlyMap: Record<string, number> = {};
      monthlyRevenueData.forEach(item => {
        const date = new Date(item.createdAt);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + (item._sum.total || 0);
      });
      
      monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({
        month,
        revenue: parseFloat(revenue.toFixed(2))
      }));
    } catch (e) {
      console.error('Error getting monthly revenue:', e);
    }

    // Get top categories by sales
    let topCategories: any[] = [];
    try {
      const categorySales: any[] = await prisma.$queryRaw`
        SELECT 
          c.name as category,
          COUNT(o.id) as orderCount,
          SUM(o.total) as totalRevenue
        FROM "Order" o
        JOIN "OrderItem" oi ON o.id = oi."orderId"
        JOIN "Gemstone" g ON oi."gemstoneId" = g.id
        JOIN "Category" c ON g."categoryId" = c.id
        WHERE o.status = 'completed'
        GROUP BY c.id, c.name
        ORDER BY totalRevenue DESC
        LIMIT 5
      `;
      
      topCategories = categorySales.map((item: any) => ({
        name: item.category,
        orderCount: parseInt(item.ordercount),
        totalRevenue: parseFloat(item.totalrevenue)
      }));
    } catch (e) {
      console.error('Error getting top categories:', e);
    }

    const dashboardData = {
      overview: {
        totalUsers: userCount,
        totalOrders: orderCount,
        totalGemstones: gemstoneCount,
        totalCategories: categoryCount,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        userGrowth,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        averageOrderValue
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email,
        total: parseFloat(order.total.toFixed(2)),
        status: order.status,
        items: order.items || 0,
        createdAt: order.createdAt
      })),
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        stockCount: item.stockCount,
        price: parseFloat(item.price.toFixed(2)),
        category: item.category?.name || 'Uncategorized'
      })),
      monthlyRevenue,
      topCategories,
      performance: {
        orderCompletionRate,
        averageOrderValue,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        inventoryValue: parseFloat(inventoryValue.toFixed(2))
      },
      conversionRate
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate dashboard data'
    });
  } finally {
    // Always disconnect the Prisma client after use
    await prisma.$disconnect();
  }
}

export default withAdminAuth(handler);