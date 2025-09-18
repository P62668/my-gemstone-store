import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Fetch all homepage sections
    const allSections = await prisma.homepageSection.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    // Fetch featured products
    const featuredProducts = await prisma.gemstone.findMany({
      where: {
        active: true,
        featured: true,
      },
      take: 8,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check for dynamic homepage content
    const dynamicPage = await prisma.page.findFirst({
      where: {
        slug: 'homepage',
        status: 'published',
      },
    });

    // Get hero section
    const hero = allSections.find((s) => s.key === 'hero');
    const sections = allSections.filter((s) => s.key !== 'hero');

    // Process featured products with proper image parsing
    const processedProducts = featuredProducts.map((gemstone) => {
      // Parse images if they're stored as JSON string
      let images: string[] = [];
      if (typeof gemstone.images === 'string') {
        try {
          images = JSON.parse(gemstone.images);
        } catch (e) {
          images = [gemstone.images];
        }
      } else if (Array.isArray(gemstone.images)) {
        images = gemstone.images as string[];
      } else {
        images = ['/images/placeholder-gemstone.jpg'];
      }

      return {
        ...gemstone,
        images: images
      };
    });

    const response = {
      hero: hero ? hero.content : null,
      sections: sections,
      featuredProducts: processedProducts,
      dynamicContent: dynamicPage ? (typeof dynamicPage.content === 'string' ? JSON.parse(dynamicPage.content) : dynamicPage.content) : null,
      updatedAt: allSections.length > 0 ? allSections[0].updatedAt : null,
    };

    // Removed caching to ensure fresh data is always returned
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({ error: 'Failed to fetch homepage settings' });
  }
}