import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { logger } from '../../../utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        const { type = 'sales', period = '30d', startDate, endDate } = req.query;

        // Parse date range
        let dateFilter: any = {};
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          };
        } else {
          const now = new Date();
          let pastDate = new Date();
          
          switch (period) {
            case '7d':
              pastDate.setDate(now.getDate() - 7);
              break;
            case '30d':
              pastDate.setDate(now.getDate() - 30);
              break;
            case '90d':
              pastDate.setDate(now.getDate() - 90);
              break;
            case '1y':
              pastDate.setFullYear(now.getFullYear() - 1);
              break;
            default:
              pastDate.setDate(now.getDate() - 30);
          }
          
          dateFilter = {
            gte: pastDate,
            lte: now,
          };
        }

        let reportData: any = {};

        switch (type) {
          case 'sales':
            reportData = await generateSalesReport(dateFilter);
            break;
          case 'customers':
            reportData = await generateCustomerReport(dateFilter);
            break;
          case 'products':
            reportData = await generateProductReport(dateFilter);
            break;
          case 'inventory':
            reportData = await generateInventoryReport();
            break;
          default:
            return res.status(400).json({ error: 'Invalid report type' });
        }

        res.status(200).json({
          success: true,
          type,
          period,
          startDate: dateFilter.gte?.toISOString(),
          endDate: dateFilter.lte?.toISOString(),
          data: reportData,
        });
      } catch (error) {
        logger.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('Reports API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Generate sales report data
async function generateSalesReport(dateFilter: any) {
  try {
    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        status: 'completed',
      },
      include: {
        items: {
          include: {
            gemstone: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Calculate sales metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Group sales by date for chart data
    const dailySales: { [key: string]: { revenue: number; orders: number } } = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { revenue: 0, orders: 0 };
      }
      dailySales[date].revenue += order.total;
      dailySales[date].orders += 1;
    });

    // Top selling products
    const productSales: { [key: number]: { name: string; quantity: number; revenue: number } } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.gemstoneId]) {
          productSales[item.gemstoneId] = {
            name: item.gemstone.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.gemstoneId].quantity += item.quantity;
        productSales[item.gemstoneId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Payment method distribution
    const paymentMethods: { [key: string]: number } = {};
    orders.forEach(order => {
      paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
    });

    return {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        uniqueCustomers: new Set(orders.map(order => order.userId)).size,
      },
      chartData: Object.entries(dailySales).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      })),
      topProducts,
      paymentMethods,
    };
  } catch (error) {
    logger.error('Error generating sales report:', error);
    throw error;
  }
}

// Generate customer report data
async function generateCustomerReport(dateFilter: any) {
  try {
    // Get new customers within date range
    const newCustomers = await prisma.user.findMany({
      where: {
        createdAt: dateFilter,
        role: { not: 'admin' },
      },
      include: {
        orders: {
          where: {
            status: 'completed',
          },
        },
      },
    });

    // Customer growth data
    const dailyNewCustomers: { [key: string]: number } = {};
    newCustomers.forEach(customer => {
      const date = customer.createdAt.toISOString().split('T')[0];
      dailyNewCustomers[date] = (dailyNewCustomers[date] || 0) + 1;
    });

    // Customer value segmentation
    const customerValues = newCustomers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
      orderCount: customer.orders.length,
    }));

    const highValueCustomers = customerValues
      .filter(customer => customer.totalSpent > 1000)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const frequentCustomers = customerValues
      .filter(customer => customer.orderCount > 2)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);

    // Customer retention data
    const totalCustomers = await prisma.user.count({
      where: { role: { not: 'admin' } },
    });

    const activeCustomers = await prisma.user.count({
      where: {
        role: { not: 'admin' },
        orders: {
          some: {
            createdAt: dateFilter,
          },
        },
      },
    });

    return {
      summary: {
        newCustomers: newCustomers.length,
        totalCustomers,
        activeCustomers,
        retentionRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
      },
      chartData: Object.entries(dailyNewCustomers).map(([date, count]) => ({
        date,
        newCustomers: count,
      })),
      highValueCustomers,
      frequentCustomers,
    };
  } catch (error) {
    logger.error('Error generating customer report:', error);
    throw error;
  }
}

// Generate product report data
async function generateProductReport(dateFilter: any) {
  try {
    // Get products with sales data
    const productsWithSales = await prisma.gemstone.findMany({
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: dateFilter,
              status: 'completed',
            },
          },
        },
        category: true,
      },
    });

    // Calculate product metrics
    const productData = productsWithSales.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        price: product.price,
        totalSold,
        totalRevenue,
        stockCount: product.stockCount,
        viewCount: product.viewCount,
      };
    });

    // Top selling products
    const topSelling = [...productData]
      .filter(p => p.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Top revenue products
    const topRevenue = [...productData]
      .filter(p => p.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Low stock products
    const lowStock = [...productData]
      .filter(p => p.stockCount <= 5 && p.stockCount >= 0)
      .sort((a, b) => a.stockCount - b.stockCount);

    // Category performance
    const categoryPerformance: { [key: string]: { products: number; revenue: number; sold: number } } = {};
    productData.forEach(product => {
      if (!categoryPerformance[product.category]) {
        categoryPerformance[product.category] = {
          products: 0,
          revenue: 0,
          sold: 0,
        };
      }
      categoryPerformance[product.category].products += 1;
      categoryPerformance[product.category].revenue += product.totalRevenue;
      categoryPerformance[product.category].sold += product.totalSold;
    });

    return {
      summary: {
        totalProducts: productData.length,
        totalSold: productData.reduce((sum, p) => sum + p.totalSold, 0),
        totalRevenue: productData.reduce((sum, p) => sum + p.totalRevenue, 0),
        lowStockItems: lowStock.length,
      },
      topSelling,
      topRevenue,
      lowStock,
      categoryPerformance: Object.entries(categoryPerformance).map(([category, data]) => ({
        category,
        ...data,
      })),
    };
  } catch (error) {
    logger.error('Error generating product report:', error);
    throw error;
  }
}

// Generate inventory report data
async function generateInventoryReport() {
  try {
    // Get all products with inventory data
    const products = await prisma.gemstone.findMany({
      include: {
        category: true,
      },
    });

    // Inventory metrics
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stockCount), 0);
    
    // Low stock products
    const lowStock = products
      .filter(p => p.stockCount <= p.lowStockThreshold)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || 'Uncategorized',
        stockCount: p.stockCount,
        lowStockThreshold: p.lowStockThreshold,
        price: p.price,
      }))
      .sort((a, b) => a.stockCount - b.stockCount);

    // Out of stock products
    const outOfStock = products
      .filter(p => p.stockCount <= 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || 'Uncategorized',
        stockCount: p.stockCount,
        price: p.price,
      }));

    // Overstock products (more than 50 units)
    const overstock = products
      .filter(p => p.stockCount > 50)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || 'Uncategorized',
        stockCount: p.stockCount,
        price: p.price,
      }))
      .sort((a, b) => b.stockCount - a.stockCount);

    // Category stock distribution
    const categoryStock: { [key: string]: { products: number; totalStock: number; value: number } } = {};
    products.forEach(product => {
      const category = product.category?.name || 'Uncategorized';
      if (!categoryStock[category]) {
        categoryStock[category] = {
          products: 0,
          totalStock: 0,
          value: 0,
        };
      }
      categoryStock[category].products += 1;
      categoryStock[category].totalStock += product.stockCount;
      categoryStock[category].value += product.price * product.stockCount;
    });

    return {
      summary: {
        totalProducts,
        totalStockValue,
        lowStockItems: lowStock.length,
        outOfStockItems: outOfStock.length,
        overstockItems: overstock.length,
      },
      lowStock,
      outOfStock,
      overstock,
      categoryStock: Object.entries(categoryStock).map(([category, data]) => ({
        category,
        ...data,
      })),
    };
  } catch (error) {
    logger.error('Error generating inventory report:', error);
    throw error;
  }
}

export default withAdminAuth(handler);