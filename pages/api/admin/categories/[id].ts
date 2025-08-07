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
  const categoryId = parseInt(id as string);

  if (req.method === 'PATCH') {
    try {
      const { name, description, image, order, active } = req.body;
      const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name,
          description,
          profileImage: image,
          order,
          active,
        },
      });
      res.status(200).json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if category has gemstones
      const gemstonesCount = await prisma.gemstone.count({
        where: { categoryId: categoryId },
      });

      if (gemstonesCount > 0) {
        return res.status(400).json({
          error:
            'Cannot delete category that has gemstones. Please remove or reassign gemstones first.',
        });
      }

      await prisma.category.delete({
        where: { id: categoryId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
