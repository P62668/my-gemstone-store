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

  const { id } = req.query;
  const gemstoneId = parseInt(id as string);

  if (req.method === 'PATCH') {
    try {
      const { name, type, description, price, images, certification, categoryId, active } =
        req.body;
      const gemstone = await prisma.gemstone.update({
        where: { id: gemstoneId },
        data: {
          name,
          type,
          description,
          price: parseFloat(price),
          images: JSON.stringify(images || []),
          certification,
          categoryId: categoryId ? parseInt(categoryId) : null,
        },
        include: {
          category: true,
        },
      });
      res.status(200).json(gemstone);
    } catch (error) {
      console.error('Error updating gemstone:', error);
      res.status(500).json({ error: 'Failed to update gemstone' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if gemstone has order items
      const orderItemsCount = await prisma.orderItem.count({
        where: { gemstoneId: gemstoneId },
      });

      if (orderItemsCount > 0) {
        return res.status(400).json({
          error:
            'Cannot delete gemstone that has been ordered. Please handle existing orders first.',
        });
      }

      await prisma.gemstone.delete({
        where: { id: gemstoneId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting gemstone:', error);
      res.status(500).json({ error: 'Failed to delete gemstone' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
