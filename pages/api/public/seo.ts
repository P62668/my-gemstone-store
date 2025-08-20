import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    let settings = await prisma.sEO.findFirst();

    // If no settings exist, return default values instead of 404
    if (!settings) {
      return res.status(200).json({
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
        updatedAt: new Date(),
      });
    }

    res.status(200).json({
      id: settings.id,
      page: settings.page,
      title: settings.title,
      description: settings.description,
      keywords: settings.keywords,
      ogImage: settings.ogImage,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    // Return default values on error instead of 500
    res.status(200).json({
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
      updatedAt: new Date(),
    });
  }
}
