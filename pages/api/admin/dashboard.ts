import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdminAuth } from '../../../utils/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

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

    // Get recent orders
    let recentOrders: any[] = [];
    try {
      recentOrders = await prisma.order.findMany({
        take: 5,
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

    // Get low stock items
    let lowStockItems: any[] = [];
    try {
      lowStockItems = await prisma.gemstone.findMany({
        where: { stockCount: { lte: 5 } },
        take: 5,
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
    let pendingOrders = 0, completedOrders = 0;
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
    } catch (e) {
      console.error('Error getting order status counts:', e);
    }

    // Calculate performance metrics
    const averageOrderValue = completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(2) : '0';
    const orderCompletionRate = orderCount > 0 ? ((completedOrders / orderCount) * 100).toFixed(2) : '0.00';
    const conversionRate = userCount > 0 ? (orderCount / userCount * 100).toFixed(2) : '0.00';

    const dashboardData = {
      overview: {
        totalUsers: userCount,
        totalOrders: orderCount,
        totalGemstones: gemstoneCount,
        totalCategories: categoryCount,
        totalRevenue: totalRevenue,
        userGrowth: 0,
        pendingOrders,
        completedOrders,
        averageOrderValue
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        total: order.total,
        status: order.status,
        items: 0, // Simplified
        createdAt: order.createdAt
      })),
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        stockCount: item.stockCount,
        price: item.price,
        category: item.category?.name || 'Uncategorized'
      })),
      monthlyRevenue: [],
      topCategories: [],
      performance: {
        orderCompletionRate,
        averageOrderValue,
        totalRevenue,
        inventoryValue: 0
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
  }
}

export default withAdminAuth(handler);
