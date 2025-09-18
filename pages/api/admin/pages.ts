import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';
import { forceInvalidateAllCache } from '../../../utils/cache';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ error: 'Authentication required' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', status, search } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      let where: any = {};

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { slug: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [pages, total] = await Promise.all([
        prisma.page.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        prisma.page.count({ where }),
      ]);

      res.status(200).json({
        pages,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ error: 'Failed to fetch pages' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, slug, content, seo, template, status, parentId, order } = req.body;

      // Validate required fields
      if (!title || !slug) {
        return res.status(400).json({ error: 'Title and slug are required' });
      }

      // Check if slug already exists
      const existingPage = await prisma.page.findUnique({
        where: { slug },
      });

      if (existingPage) {
        return res.status(400).json({ error: 'A page with this slug already exists' });
      }

      // Process SEO data - ensure it's properly formatted
      let processedSeo = seo || {};
      if (typeof processedSeo === 'string') {
        try {
          processedSeo = JSON.parse(processedSeo);
        } catch (e) {
          processedSeo = {};
        }
      }

      // Process content data - ensure it's properly formatted
      let processedContent = content || [];
      if (typeof processedContent === 'string') {
        try {
          processedContent = JSON.parse(processedContent);
        } catch (e) {
          processedContent = [];
        }
      }

      const page = await prisma.page.create({
        data: {
          title,
          slug,
          content: processedContent,
          seo: processedSeo,
          template: template || null,
          status: status || 'draft',
          parentId: parentId || null,
          order: order || 0,
          authorId: (req as any).user.id,
          publishedAt: status === 'published' ? new Date() : null,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Create initial version
      await prisma.pageVersion.create({
        data: {
          pageId: page.id,
          content: page.content as any,
          seo: page.seo as any,
          version: 1,
          authorId: (req as any).user.id,
        },
      });

      // Force invalidate all cache after creation to ensure immediate consistency
      forceInvalidateAllCache();

      res.status(201).json(page);
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ error: 'Failed to create page' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);