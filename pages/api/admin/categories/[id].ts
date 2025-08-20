import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAdminAuth } from '../../../../utils/adminSecurity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate admin user
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) {
      return; // Response already sent by requireAdminAuth
    }

    const { id } = req.query;
    const categoryId = parseInt(id as string);

    if (req.method === 'PATCH') {
      try {
        const { name, description, image, active } = req.body;
        const category = await prisma.category.update({
          where: { id: categoryId },
          data: {
            name,
            description,
            image,
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
  } catch (error) {
    console.error('Admin category CRUD API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
