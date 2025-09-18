import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../../utils/adminSecurity';
import { prisma } from '../../../../lib/prisma';
import { invalidateGemstoneCache, forceInvalidateAllCache } from '../../../../utils/cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use admin-specific authentication
  const user = await requireAdminAuth(req, res);
  if (!user) {
    // requireAdminAuth already sent the response
    return;
  }

  if (req.method === 'PUT') {
    const { featuredIds, action, productId } = req.body;

    try {
      // Handle individual product toggle
      if (action === 'toggle' && productId) {
        const product = await prisma.gemstone.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const updatedProduct = await prisma.gemstone.update({
          where: { id: productId },
          data: { featured: !product.featured },
        });
        
        // Force invalidate all cache after update to ensure immediate consistency
        forceInvalidateAllCache();

        return res.status(200).json({
          message: `Product ${updatedProduct.featured ? 'featured' : 'unfeatured'} successfully`,
          featured: updatedProduct.featured,
          productId: updatedProduct.id
        });
      }

      // Handle reordering of featured products
      if (action === 'reorder' && Array.isArray(featuredIds)) {
        // First, set all products to not featured
        await prisma.gemstone.updateMany({
          where: { featured: true },
          data: { featured: false },
        });

        // Then set selected products to featured in the specified order
        if (featuredIds.length > 0) {
          // Update each product individually to maintain order
          for (let i = 0; i < featuredIds.length; i++) {
            const id = featuredIds[i];
            await prisma.gemstone.update({
              where: { id: id },
              data: { featured: true },
            });
          }
        }
        
        // Force invalidate all cache after reorder to ensure immediate consistency
        forceInvalidateAllCache();

        // Fetch updated featured products
        const updatedFeatured = await prisma.gemstone.findMany({
          where: { featured: true },
          select: { id: true, name: true, featured: true }
        });

        return res.status(200).json({
          message: 'Featured products reordered successfully',
          updatedCount: updatedFeatured.length,
          featuredProducts: updatedFeatured
        });
      }

      // Handle bulk update (backward compatibility)
      if (!action && Array.isArray(featuredIds)) {
        // First, set all products to not featured
        await prisma.gemstone.updateMany({
          where: { featured: true },
          data: { featured: false },
        });

        // Then set selected products to featured
        if (featuredIds.length > 0) {
          await prisma.gemstone.updateMany({
            where: { id: { in: featuredIds } },
            data: { featured: true },
          });
        }
        
        // Force invalidate all cache after bulk update to ensure immediate consistency
        forceInvalidateAllCache();

        // Fetch updated featured products
        const updatedFeatured = await prisma.gemstone.findMany({
          where: { featured: true },
          select: { id: true, name: true, featured: true }
        });

        return res.status(200).json({
          message: 'Featured products updated successfully',
          updatedCount: updatedFeatured.length,
          featuredProducts: updatedFeatured
        });
      }

      return res.status(400).json({ error: 'Invalid request format' });
    } catch (error) {
      console.error('Featured update error:', error);
      return res.status(500).json({ error: 'Failed to update featured products' });
    }
  } else if (req.method === 'GET') {
    try {
      const featuredProducts = await prisma.gemstone.findMany({
        where: { 
          featured: true,
          active: true 
        },
        select: { 
          id: true, 
          name: true, 
          featured: true,
          price: true,
          images: true,
          description: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(featuredProducts);
    } catch (error) {
      console.error('Featured fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch featured products' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}