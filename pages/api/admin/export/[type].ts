import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  try {
    let csvData = '';
    let filename = '';

    switch (type) {
      case 'orders':
        const orders = await prisma.order.findMany({
          include: {
            user: true,
            items: {
              include: {
                gemstone: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        csvData = 'Order ID,User,Total,Status,Items,Date\n';
        orders.forEach((order) => {
          const items = order.items
            .map((item) => `${item.gemstone.name} (${item.quantity})`)
            .join('; ');
          csvData += `${order.id},"${order.user.name || order.user.email}",${order.total},${order.status},"${items}",${order.createdAt.toISOString()}\n`;
        });
        filename = 'orders.csv';
        break;

      case 'users':
        const users = await prisma.user.findMany({
          include: {
            orders: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        csvData = 'User ID,Name,Email,Total Orders,Total Spent,Join Date\n';
        users.forEach((user) => {
          const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
          csvData += `${user.id},"${user.name}","${user.email}",${user.orders.length},${totalSpent},${user.createdAt.toISOString()}\n`;
        });
        filename = 'users.csv';
        break;

      case 'gemstones':
        const gemstones = await prisma.gemstone.findMany({
          include: {
            category: true,
            orderItems: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        csvData = 'ID,Name,Type,Category,Price,Certification,Total Sold,Images\n';
        gemstones.forEach((gem) => {
          const totalSold = gem.orderItems.reduce((sum, item) => sum + item.quantity, 0);
          csvData += `${gem.id},"${gem.name}","${gem.type}","${gem.category?.name || 'Uncategorized'}",${gem.price},"${gem.certification}",${totalSold},"${gem.images}"\n`;
        });
        filename = 'gemstones.csv';
        break;

      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
}
