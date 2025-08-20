import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../../utils/adminSecurity';
// For now, we'll use a simple in-memory approach or file-based storage
// In a production environment, you'd want to use a proper database

import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) {
      return; // Response already sent by requireAdminAuth
    }
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      let section = await prisma.homepageSection.findFirst({ where: { key: 'hero' } });
      if (!section) {
        section = await prisma.homepageSection.create({
          data: {
            key: 'hero',
            content: {
              title: 'Timeless Elegance',
              subtitle: "Discover the finest gemstones from Kolkata's heritage jewelry district",
              primaryCTA: 'Explore Collection',
              secondaryCTA: 'Learn Our Story',
              backgroundImage: '/images/hero-gemstones.jpg',
              primaryCTALink: '/shop',
              secondaryCTALink: '/about',
            },
            order: 1,
            active: true,
          },
        });
      }

      // Convert the stored data to the expected frontend format
      const content = section.content as any;
      const heroData = {
        title: content.title || 'Timeless Elegance',
        subtitle:
          content.subtitle ||
          "Discover the finest gemstones from Kolkata's heritage jewelry district",
        primaryCTA: content.primaryCTA || 'Explore Collection',
        secondaryCTA: content.secondaryCTA || 'Learn Our Story',
        backgroundImage: content.backgroundImage || '/images/hero-gemstones.jpg',
        primaryCTALink: content.primaryCTALink || '/shop',
        secondaryCTALink: content.secondaryCTALink || '/about',
      };

      res.status(200).json(heroData);
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      res.status(500).json({ error: 'Failed to fetch hero settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const heroData = req.body;
      if (!heroData.title || !heroData.subtitle) {
        return res.status(400).json({ error: 'Title and subtitle are required' });
      }
      // First try to find existing hero section
      let section = await prisma.homepageSection.findFirst({ where: { key: 'hero' } });

      if (section) {
        // Update existing section
        const updated = await prisma.homepageSection.update({
          where: { id: section.id },
          data: {
            content: heroData,
          },
        });
        res
          .status(200)
          .json({ message: 'Hero settings updated successfully', updatedAt: updated.updatedAt });
      } else {
        // Create new section
        const created = await prisma.homepageSection.create({
          data: {
            key: 'hero',
            content: heroData,
            order: 1,
            active: true,
          },
        });
        res
          .status(200)
          .json({ message: 'Hero settings created successfully', updatedAt: created.updatedAt });
      }
    } catch (error) {
      console.error('Error updating hero settings:', error);
      res.status(500).json({ error: 'Failed to update hero settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
