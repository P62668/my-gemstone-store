import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    content: 'Common questions about our products and services',
    active: true,
    order: 6,
  },
  {
    key: 'cta',
    title: 'Ready to Find Your Perfect Gemstone?',
    subtitle: 'Start your journey with Shankarmala today',
    content: 'Explore our collection and find the gemstone that speaks to you',
    active: true,
    order: 7,
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      const sections = await prisma.homepageSection.findMany({ orderBy: { order: 'asc' } });

      // If no sections exist, create default sections
      if (sections.length === 0) {
        console.log('No sections found, creating default sections...');
        for (const section of defaultSections) {
          await prisma.homepageSection.create({
            data: {
              key: section.key,
              content: section,
              order: section.order,
              active: section.active,
            },
          });
        }
        console.log('Default sections created successfully');

        // Fetch the newly created sections
        const newSections = await prisma.homepageSection.findMany({ orderBy: { order: 'asc' } });
        res.status(200).json(
          newSections.map((s) => ({
            key: s.key,
            ...(s.content as any),
            order: s.order,
            active: s.active,
          })),
        );
      } else {
        res.status(200).json(
          sections.map((s) => ({
            key: s.key,
            ...(s.content as any),
            order: s.order,
            active: s.active,
          })),
        );
      }
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
