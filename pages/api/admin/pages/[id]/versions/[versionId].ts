import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../../../utils/authMiddleware';
import { prisma } from '../../../../../../lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ error: 'Authentication required' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id, versionId } = req.query;
  const pageId = parseInt(id as string);
  const version = parseInt(versionId as string);

  if (req.method === 'GET') {
    try {
      // Get a specific version of a page
      const pageVersion = await prisma.pageVersion.findFirst({
        where: {
          pageId: pageId,
          version: version,
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
          page: {
            select: {
              title: true,
              slug: true,
              template: true,
              status: true,
            },
          },
        },
      });

      if (!pageVersion) {
        return res.status(404).json({ error: 'Page version not found' });
      }

      // Return the version data in a format compatible with the page editor
      const versionData = {
        id: pageVersion.id,
        title: pageVersion.page.title,
        slug: pageVersion.page.slug,
        content: pageVersion.content,
        seo: pageVersion.seo,
        template: pageVersion.page.template,
        status: pageVersion.page.status,
        version: pageVersion.version,
        author: pageVersion.author,
        createdAt: pageVersion.createdAt,
      };

      res.status(200).json(versionData);
    } catch (error) {
      console.error('Error fetching page version:', error);
      res.status(500).json({ error: 'Failed to fetch page version' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);