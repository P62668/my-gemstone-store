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
    const gemstoneId = parseInt(id as string);

    if (req.method === 'PATCH') {
      try {
        const { name, description, price, images, certificate, categoryId, active } =
          req.body;
        
        // Handle images field properly - ensure it's always a JSON string
        let imagesString = '[]';
        if (images) {
          if (Array.isArray(images)) {
            imagesString = JSON.stringify(images);
          } else if (typeof images === 'string') {
            try {
              // Validate if it's already a JSON string
              JSON.parse(images);
              imagesString = images;
            } catch {
              // If not valid JSON, treat as single image
              imagesString = JSON.stringify([images]);
            }
          }
        }

        const gemstone = await prisma.gemstone.update({
          where: { id: gemstoneId },
          data: {
            name,
            description,
            price: parseFloat(price),
            images: imagesString,
            certificate,
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            active: active !== undefined ? active : true,
          },
          include: {
            category: true,
          },
        });
        // Parse images before returning
        let parsedImages = [];
        try {
          if (typeof gemstone.images === 'string' && gemstone.images.trim()) {
            parsedImages = JSON.parse(gemstone.images);
          } else if (Array.isArray(gemstone.images)) {
            parsedImages = gemstone.images;
          }
        } catch (error) {
          console.error('Error parsing images for gemstone:', gemstone.id, error);
          parsedImages = [];
        }
        
        const gemstoneWithParsedImages = {
          ...gemstone,
          images: parsedImages
        };
        res.status(200).json(gemstoneWithParsedImages);
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
  } catch (error) {
    console.error('Admin gemstone CRUD API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
