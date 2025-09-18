import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { logger } from '../../../../utils/logger';
import { invalidateCategoryCache } from '../../../../utils/cache';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    const { id } = req.query;
    const categoryId = parseInt(id as string);

    if (req.method === 'PATCH') {
      try {
        const { name, description, image, active } = req.body;

        // Validate required fields
        if (!name || !description) {
          return res.status(400).json({ error: 'Name and description are required' });
        }

        const updatedCategory = await prisma.category.update({
          where: { id: categoryId },
          data: {
            name,
            description,
            image,
            active: active !== undefined ? active : true,
          },
        });
        
        // Invalidate category cache after update
        invalidateCategoryCache();

        res.status(200).json(updatedCategory);
      } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
      }
    } else if (req.method === 'DELETE') {
      try {
        await prisma.category.delete({ where: { id: categoryId } });
        
        // Invalidate category cache after delete
        invalidateCategoryCache();
        
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
      }
    }
  } catch (error) {
    logger.error('API Handler Error', req, error as Error);
    const statusCode = (error as any)?.statusCode || 500;
    const message = (error as any)?.message || 'Internal server error';
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
}

export default withAdminAuth(handler);