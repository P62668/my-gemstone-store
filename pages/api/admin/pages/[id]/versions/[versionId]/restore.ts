import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../../../../utils/authMiddleware';
import { prisma } from '../../../../../../../lib/prisma';
import { forceInvalidateAllCache } from '../../../../../../../utils/cache';

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

  if (req.method === 'POST') {
    try {
      // Get the specific version to restore
      const pageVersion = await prisma.pageVersion.findFirst({
        where: {
          pageId: pageId,
          version: version,
        },
      });

      if (!pageVersion) {
        return res.status(404).json({ error: 'Page version not found' });
      }

      // Get current page to check if status is changing
      const currentPage = await prisma.page.findUnique({
        where: { id: pageId },
      });

      if (!currentPage) {
        return res.status(404).json({ error: 'Page not found' });
      }

      // Create a new version before restoring (backup current version)
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

      // Restore the selected version
      const updatedPage = await prisma.page.update({
        where: { id: pageId },
        data: {
          content: pageVersion.content as any,
          seo: pageVersion.seo as any,
          version: nextVersion,
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

      // Force invalidate all cache after restore to ensure immediate consistency
      forceInvalidateAllCache();

      res.status(200).json(updatedPage);
    } catch (error) {
      console.error('Error restoring page version:', error);
      res.status(500).json({ error: 'Failed to restore page version' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);