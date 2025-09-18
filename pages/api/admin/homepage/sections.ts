import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { prisma } from '../../../../lib/prisma';
import { forceInvalidateAllCache } from '../../../../utils/cache';

// Default sections to create if none exist
const defaultSections = [
  {
    key: 'categories',
    title: 'Explore Our Collections',
    subtitle: 'Discover gemstones from every corner of the world',
    content: 'Browse our curated collections of precious and semi-precious gemstones',
    active: true,
    order: 1,
  },
  {
    key: 'featured',
    title: 'Featured Gemstones',
    subtitle: 'Handpicked treasures from our collection',
    content: 'Our most sought-after gemstones, carefully selected for their exceptional quality',
    active: true,
    order: 2,
  },
  {
    key: 'testimonials',
    title: 'What Our Customers Say',
    subtitle: 'Trusted by gemstone enthusiasts worldwide',
    content: 'Read testimonials from our satisfied customers',
    active: true,
    order: 3,
  },
  {
    key: 'newsletter',
    title: 'Stay in the Circle of Luxury',
    subtitle: 'Get exclusive access to new collections and insights',
    content: "Join our connoisseur's list for exclusive updates",
    active: true,
    order: 4,
  },
  {
    key: 'press',
    title: 'Press & Awards',
    subtitle: 'Recognition of our commitment to excellence',
    content: 'Featured in leading publications and industry awards',
    active: true,
    order: 5,
  },
  {
    key: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about our gemstones',
    content: 'Answers to common questions about our products and services',
    active: true,
    order: 6,
  },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ error: 'Authentication required' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      let sections = await prisma.homepageSection.findMany({
        where: { key: { not: 'hero' } },
        orderBy: { order: 'asc' },
      });

      // Create default sections if none exist
      if (sections.length === 0) {
        sections = await Promise.all(
          defaultSections.map((section) =>
            prisma.homepageSection.create({
              data: {
                key: section.key,
                content: section,
                order: section.order,
                active: section.active,
              },
            })
          )
        );
      }

      res.status(200).json(sections.map((s) => s.content));
    } catch (error) {
      console.error('Error fetching sections settings:', error);
      res.status(500).json({ error: 'Failed to fetch sections settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const sectionsData = req.body;
      if (!Array.isArray(sectionsData)) {
        return res.status(400).json({ error: 'Sections data must be an array' });
      }
      for (const section of sectionsData) {
        if (!section.key || !section.title) {
          return res.status(400).json({ error: 'Each section must have a key and title' });
        }
        await prisma.homepageSection.upsert({
          where: { key: section.key },
          update: {
            content: section,
            order: section.order || 0,
            active: section.active !== undefined ? section.active : true,
          },
          create: {
            key: section.key,
            content: section,
            order: section.order || 0,
            active: section.active !== undefined ? section.active : true,
          },
        });
      }
      
      // Force invalidate all cache after update to ensure immediate consistency
      forceInvalidateAllCache();
      
      res.status(200).json({ message: 'Sections settings updated successfully' });
    } catch (error) {
      console.error('Error updating sections settings:', error);
      res.status(500).json({ error: 'Failed to update sections settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);