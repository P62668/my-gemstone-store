import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ error: 'Page slug is required' });
      return;
    }

    const page = await prisma.page.findFirst({
      where: {
        slug,
        status: 'published',
      },
    });

    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    // Increment view count
    await prisma.page.update({
      where: { id: page.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.status(200).json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
}