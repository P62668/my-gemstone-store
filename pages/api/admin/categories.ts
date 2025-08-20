import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAdminAuth } from '../../../utils/adminSecurity';
import { logger } from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate admin user
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) {
      return; // Response already sent by requireAdminAuth
    }

    if (req.method === 'GET') {
      try {
        const categories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
        });
        res.status(200).json(categories);
      } catch (error) {
        logger.error('Error fetching categories', error, {
          message: 'Failed to fetch categories',
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        res.status(500).json({ error: 'Failed to fetch categories' });
      }
    } else if (req.method === 'POST') {
      try {
        const { name, description, image, active } = req.body;
        
        // Validate required fields
        if (!name || !description) {
          return res.status(400).json({ 
            error: 'Name and description are required' 
          });
        }

        // Check if category with same name already exists
        const existingCategory = await prisma.category.findFirst({
          where: { name: name.trim() }
        });

        if (existingCategory) {
          return res.status(409).json({ 
            error: 'A category with this name already exists' 
          });
        }

        const category = await prisma.category.create({
          data: {
            name: name.trim(),
            description: description.trim(),
            image: image || null,
            active: active !== undefined ? active : true,
          },
        });
        
        logger.info('Category created successfully', {
          message: 'Category created',
          categoryId: category.id,
          categoryName: category.name,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        
        res.status(201).json(category);
      } catch (error: any) {
        logger.error('Error creating category', error, {
          message: 'Failed to create category',
          requestBody: req.body,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
          res.status(409).json({ error: 'A category with this name already exists' });
        } else {
          res.status(500).json({ error: 'Failed to create category' });
        }
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('Admin categories API error', error, {
      message: 'Internal server error in categories API',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    res.status(500).json({ error: 'Internal server error' });
  }
}
