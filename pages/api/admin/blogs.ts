import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        const { page = '1', limit = '10', status } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status && status !== 'all') {
          where.status = status;
        }

        const [blogs, total] = await Promise.all([
          prisma.blog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum,
          }),
          prisma.blog.count({ where }),
        ]);

        res.status(200).json({
          blogs,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
          },
        });
      } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
      }
    } else if (req.method === 'POST') {
      try {
        const { title, slug, excerpt, content, status, featuredImage, tags, metaTitle, metaDescription } = req.body;
        
        // Validate required fields
        if (!title || !content) {
          return res.status(400).json({ error: 'Title and content are required' });
        }

        // Generate slug if not provided
        const finalSlug = slug || title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');

        const blog = await prisma.blog.create({
          data: {
            title,
            slug: finalSlug,
            excerpt,
            content,
            status: status || 'draft',
            featuredImage,
            tags,
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || excerpt,
            author: {
              connect: { id: adminUser.id }
            }
          },
        });

        res.status(201).json(blog);
      } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Failed to create blog' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('Authentication error:', err);
    return res.status(401).json({ error: 'Authentication required' });
  }
}

export default withAdminAuth(handler);