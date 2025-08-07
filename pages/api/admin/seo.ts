import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      let settings = await prisma.sEOSettings.findUnique({ where: { id: 1 } });
      if (!settings) {
        // Create default settings if none exist
        settings = await prisma.sEOSettings.create({
          data: {
            id: 1,
            global: {
              siteTitle: 'Shankarmala - Luxury Gemstone Collection',
              siteDescription:
                "Discover the finest gemstones from Shankarmala's heritage jewelry collection. GIA certified, worldwide shipping.",
              siteKeywords:
                'luxury gemstones, heritage jewelry, Shankarmala, precious stones, GIA certified',
              siteUrl: 'https://shankarmala.com',
              siteLanguage: 'en',
              siteAuthor: 'Shankarmala',
            },
            pages: {},
            social: {},
            analytics: {},
            structuredData: {},
          },
        });
      }
      res.status(200).json({
        global: settings.global,
        pages: settings.pages,
        social: settings.social,
        analytics: settings.analytics,
        structuredData: settings.structuredData,
        updatedAt: settings.updatedAt,
      });
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      res.status(500).json({ error: 'Failed to fetch SEO settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const seoData = req.body;
      if (
        !seoData.global ||
        !seoData.pages ||
        !seoData.social ||
        !seoData.analytics ||
        !seoData.structuredData
      ) {
        return res.status(400).json({ error: 'All SEO sections are required' });
      }
      if (!seoData.global.siteTitle || !seoData.global.siteDescription || !seoData.global.siteUrl) {
        return res
          .status(400)
          .json({ error: 'Global site title, description, and URL are required' });
      }
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(seoData.global.siteUrl)) {
        return res.status(400).json({ error: 'Invalid site URL format' });
      }
      const updated = await prisma.sEOSettings.upsert({
        where: { id: 1 },
        update: {
          global: seoData.global,
          pages: seoData.pages,
          social: seoData.social,
          analytics: seoData.analytics,
          structuredData: seoData.structuredData,
        },
        create: {
          id: 1,
          global: seoData.global,
          pages: seoData.pages,
          social: seoData.social,
          analytics: seoData.analytics,
          structuredData: seoData.structuredData,
        },
      });
      res
        .status(200)
        .json({ message: 'SEO settings updated successfully', updatedAt: updated.updatedAt });
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      res.status(500).json({ error: 'Failed to update SEO settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
