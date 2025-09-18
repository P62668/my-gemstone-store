import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { prisma } from '../../../../lib/prisma';
import { forceInvalidateAllCache } from '../../../../utils/cache';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ error: 'Authentication required' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const pageId = parseInt(id as string);

  if (req.method === 'GET') {
    try {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5, // Get last 5 versions
          },
        },
      });

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.status(200).json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, slug, content, seo, template, status, parentId, order } = req.body;

      // Validate required fields
      if (!title || !slug) {
        return res.status(400).json({ error: 'Title and slug are required' });
      }

      // Check if another page with the same slug exists
      const existingPage = await prisma.page.findFirst({
        where: {
          slug,
          NOT: {
            id: pageId,
          },
        },
      });

      if (existingPage) {
        return res.status(400).json({ error: 'A page with this slug already exists' });
      }

      // Get current page to check if status is changing
      const currentPage = await prisma.page.findUnique({
        where: { id: pageId },
      });

      if (!currentPage) {
        return res.status(404).json({ error: 'Page not found' });
      }

      // Create a new version before updating
      const nextVersion = currentPage.version + 1;
      await prisma.pageVersion.create({
        data: {
          pageId: pageId,
          content: currentPage.content as any,
          seo: currentPage.seo as any,
          version: currentPage.version,
          authorId: (req as any).user.id,
        },
      });

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

      // Update the page
      const page = await prisma.page.update({
        where: { id: pageId },
        data: {
          title,
          slug,
          content: processedContent,
          seo: processedSeo,
          template: template || null,
          status: status || 'draft',
          parentId: parentId !== undefined ? parentId : currentPage.parentId,
          order: order !== undefined ? order : currentPage.order,
          version: nextVersion,
          publishedAt: status === 'published' && !currentPage.publishedAt ? new Date() : undefined,
          updatedAt: new Date(),
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

      // Force invalidate all cache after update to ensure immediate consistency
      forceInvalidateAllCache();

      res.status(200).json(page);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ error: 'Failed to update page' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete the page
      await prisma.page.delete({
        where: { id: pageId },
      });

      // Force invalidate all cache after deletion to ensure immediate consistency
      forceInvalidateAllCache();

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);