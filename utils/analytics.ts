import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowth: number;
  topCustomers: Array<{
    id: number;
    name: string;
    email: string;
    totalSpent: number;
    orders: number;
  }>;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  topViewedProducts: Array<{
    id: number;
    name: string;
    views: number;
    sales: number;
  }>;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderGrowth: number;
  recentOrders: Array<{
    id: number;
    user: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

export interface SalesAnalytics {
  totalSales: number;
  salesGrowth: number;
  topSellingProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export class Analytics {
  /**
   * Get user analytics
   */
  static async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      // Get total users
      const totalUsers = await prisma.user.count({ where: { role: 'user' } });

      // Get new users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = await prisma.user.count({
        where: {
          role: 'user',
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      // Get active users (users with orders in last 30 days)
      const activeUsers = await prisma.user.count({
        where: {
          role: 'user',
          orders: {
            some: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      });

      // Calculate user growth
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const previousPeriodUsers = await prisma.user.count({
        where: {
          role: 'user',
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      });
      const userGrowth = previousPeriodUsers > 0 ? ((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100 : 0;

      // Get top customers
      const topCustomers = await prisma.user.findMany({
        where: { role: 'user' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          orders: {
            where: { status: 'paid' },
            select: { total: true },
          },
        },
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
        take: 10,
      });

      const topCustomersWithStats = topCustomers.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
        orders: user.orders.length,
      })).sort((a, b) => b.totalSpent - a.totalSpent);

      return {
        totalUsers,
        newUsers,
        activeUsers,
        userGrowth,
        topCustomers: topCustomersWithStats,
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return {
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
        userGrowth: 0,
        topCustomers: [],
      };
    }
  }

  /**
   * Get product analytics
   */
  static async getProductAnalytics(): Promise<ProductAnalytics> {
    try {
      // Get total products
      const totalProducts = await prisma.gemstone.count();
      const activeProducts = await prisma.gemstone.count({ where: { active: true } });

      // Get low stock and out of stock products
      const lowStockProducts = await prisma.gemstone.count({
        where: {
          active: true,
          stockCount: {
            lte: 10, // Default low stock threshold
            gt: 0,
          },
        },
      });

      const outOfStockProducts = await prisma.gemstone.count({
        where: {
          active: true,
          stockCount: 0,
        },
      });

      // Get top viewed products (using reviews count as proxy for views)
      const topViewedProducts = await prisma.gemstone.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          reviews: {
            select: { id: true },
          },
        },
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
        take: 10,
      });

      // Transform to match interface
      const transformedTopViewedProducts = topViewedProducts.map(product => ({
        id: product.id,
        name: product.name,
        views: product.reviews.length, // Using reviews count as proxy
        sales: 0, // This would need to be calculated from order items
      }));

      return {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        topViewedProducts: transformedTopViewedProducts,
      };
    } catch (error) {
      console.error('Error getting product analytics:', error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        topViewedProducts: [],
      };
    }
  }

  /**
   * Get order analytics
   */
  static async getOrderAnalytics(): Promise<OrderAnalytics> {
    try {
      // Get total orders
      const totalOrders = await prisma.order.count();

      // Get total revenue
      const totalRevenue = await prisma.order.aggregate({
        where: { status: 'paid' },
        _sum: { total: true },
      });

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;

      // Get order growth (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentOrders = await prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      });

      const previousOrders = await prisma.order.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      });

      const orderGrowth = previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0;

      // Get recent orders
      const recentOrdersData = await prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const recentOrdersFormatted = recentOrdersData.map((order) => ({
        id: order.id,
        user: order.user?.firstName && order.user?.lastName ? `${order.user.firstName} ${order.user.lastName}` : order.user?.email || 'Unknown',
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      }));

      return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        averageOrderValue,
        orderGrowth,
        recentOrders: recentOrdersFormatted,
      };
    } catch (error) {
      console.error('Error getting order analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        orderGrowth: 0,
        recentOrders: [],
      };
    }
  }

  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(): Promise<SalesAnalytics> {
    try {
      // Get total sales
      const totalSales = await prisma.order.aggregate({
        where: { status: 'paid' },
        _sum: { total: true },
      });

      // Calculate sales growth
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentSales = await prisma.order.aggregate({
        where: {
          status: 'paid',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { total: true },
      });

      const previousSales = await prisma.order.aggregate({
        where: {
          status: 'paid',
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
        _sum: { total: true },
      });

      const salesGrowth = (previousSales._sum.total || 0) > 0 
        ? ((recentSales._sum.total || 0) - (previousSales._sum.total || 0)) / (previousSales._sum.total || 0) * 100 
        : 0;

      // Get top selling products
      const topSellingProducts = await prisma.orderItem.groupBy({
        by: ['gemstoneId'],
        _sum: {
          quantity: true,
          price: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      });

      const topSellingProductsWithDetails = await Promise.all(
        topSellingProducts.map(async (item) => {
          const gemstone = await prisma.gemstone.findUnique({
            where: { id: item.gemstoneId },
            select: { name: true },
          });

          return {
            id: item.gemstoneId,
            name: gemstone?.name || 'Unknown',
            sales: item._sum.quantity || 0,
            revenue: (item._sum.price || 0) * (item._sum.quantity || 0),
          };
        })
      );

      return {
        totalSales: totalSales._sum.total || 0,
        salesGrowth,
        topSellingProducts: topSellingProductsWithDetails,
      };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      return {
        totalSales: 0,
        salesGrowth: 0,
        topSellingProducts: [],
      };
    }
  }

  /**
   * Get comprehensive analytics
   */
  static async getComprehensiveAnalytics() {
    try {
      const [userAnalytics, productAnalytics, orderAnalytics, salesAnalytics] = await Promise.all([
        this.getUserAnalytics(),
        this.getProductAnalytics(),
        this.getOrderAnalytics(),
        this.getSalesAnalytics(),
      ]);

      return {
        userAnalytics,
        productAnalytics,
        orderAnalytics,
        salesAnalytics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting comprehensive analytics:', error);
      return {
        userAnalytics: {
          totalUsers: 0,
          newUsers: 0,
          activeUsers: 0,
          userGrowth: 0,
          topCustomers: [],
        },
        productAnalytics: {
          totalProducts: 0,
          activeProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          topViewedProducts: [],
        },
        orderAnalytics: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          orderGrowth: 0,
          recentOrders: [],
        },
        salesAnalytics: {
          totalSales: 0,
          salesGrowth: 0,
          topSellingProducts: [],
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
