import { NextApiRequest, NextApiResponse } from 'next';
import { processGemstonesData, processHomepageSectionData } from '../../../utils/dataProcessor';

import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  try {
    // Fetch homepage sections and featured products in parallel
    const [allSections, featuredProducts] = await Promise.all([
      prisma.homepageSection.findMany({ 
        orderBy: { order: 'asc' },
        where: { active: true }
      }),
      prisma.gemstone.findMany({
        where: { 
          featured: true,
          active: true 
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        take: 6,
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const hero = allSections.find((s) => s.key === 'hero');
    const sections = allSections.filter((s) => s.key !== 'hero');

    // Process featured products
    const processedProducts = processGemstonesData(featuredProducts);

    // Process sections
    const processedSections = sections.map((s) => {
      const processed = processHomepageSectionData(s);
      if (s.key === 'featured_products' && processed) {
        return {
          ...processed,
          products: processedProducts
        };
      }
      return processed;
    }).filter(Boolean);

    const response = {
      hero: hero ? processHomepageSectionData(hero)?.content : null,
      sections: processedSections,
      updatedAt: allSections.length > 0 ? allSections[0].updatedAt : null,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return res.status(500).json({ error: 'Failed to fetch homepage settings' });
  } finally {
    await prisma.$disconnect();
  }
}
