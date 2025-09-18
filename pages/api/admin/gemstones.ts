import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { logger } from '../../../utils/logger';
import { invalidateGemstoneCache } from '../../../utils/cache';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      try {
        const gemstones = await prisma.gemstone.findMany({
          include: {
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        
        // Parse images for each gemstone
        const gemstonesWithParsedImages = gemstones.map(gemstone => {
          let parsedImages: any[] = [];
          try {
            if (typeof gemstone.images === 'string' && gemstone.images.trim()) {
              parsedImages = JSON.parse(gemstone.images);
            } else if (Array.isArray(gemstone.images)) {
              parsedImages = gemstone.images;
            }
          } catch (error) {
            logger.error('Error parsing images for gemstone', error, { gemstoneId: gemstone.id });
            parsedImages = [];
          }
          
          return {
            ...gemstone,
            images: parsedImages
          };
        });
        
        res.status(200).json(gemstonesWithParsedImages);
      } catch (error) {
        logger.error('Error fetching gemstones', error, {
          message: 'Failed to fetch gemstones',
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        res.status(500).json({ error: 'Failed to fetch gemstones' });
      }
    } else if (req.method === 'POST') {
      try {
        const { 
          name, 
          description, 
          price, 
          salePrice, 
          categoryId, 
          images, 
          weight, 
          dimensions, 
          clarity, 
          color, 
          cut, 
          origin, 
          certificate, 
          stockCount, 
          stockQuantity, 
          lowStockThreshold, 
          featured, 
          active 
        } = req.body;

        // Validate required fields
        if (!name || !description || !price || !categoryId) {
          return res.status(400).json({
            success: false,
            error: 'Name, description, price, and category are required'
          });
        }

        // Validate price
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Price must be a positive number'
          });
        }

        // Check if category exists
        const category = await prisma.category.findUnique({
          where: { id: parseInt(categoryId) }
        });

        if (!category) {
          return res.status(400).json({
            success: false,
            error: 'Category not found'
          });
        }

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

        const gemstone = await prisma.gemstone.create({
          data: {
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            salePrice: salePrice ? parseFloat(salePrice) : null,
            categoryId: parseInt(categoryId),
            images: imagesString,
            weight: weight ? parseFloat(weight) : null,
            dimensions: dimensions || null,
            clarity: clarity || null,
            color: color || null,
            cut: cut || null,
            origin: origin || null,
            certificate: certificate || null,
            stockCount: stockCount ? parseInt(stockCount) : 0,
            stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
            lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5,
            featured: featured || false,
            active: active !== undefined ? active : true,
          },
          include: {
            category: true,
          },
        });
        
        // Invalidate gemstone cache after creation
        invalidateGemstoneCache();

        logger.info('Gemstone created successfully', {
          message: 'Gemstone created',
          gemstoneId: gemstone.id,
          gemstoneName: gemstone.name,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        res.status(201).json(gemstone);
      } catch (error: any) {
        logger.error('Error creating gemstone', error, {
          message: 'Failed to create gemstone',
          requestBody: req.body,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
          res.status(409).json({ error: 'A gemstone with this name already exists' });
        } else if (error.code === 'P2003') {
          res.status(400).json({ error: 'Selected category does not exist' });
        } else {
          res.status(500).json({ error: 'Failed to create gemstone' });
        }
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
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