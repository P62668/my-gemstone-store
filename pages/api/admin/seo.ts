import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getEnv, requireEnv } from '../../../utils/env';
import { withAdminAuth } from '../../../utils/authMiddleware';

const JWT_SECRET = process.env.NODE_ENV === 'production' 
  ? requireEnv('JWT_SECRET') 
  : getEnv('JWT_SECRET') || 'dev-secret';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        let settings = await prisma.sEO.findUnique({ where: { id: 1 } });
        if (!settings) {
          // Create default settings if none exist
          settings = await prisma.sEO.create({
            data: {
              id: 1,
              page: 'global',
              title: 'Shankarmala - Luxury Gemstone Collection',
              description: "Discover the finest gemstones from Shankarmala's heritage jewelry collection. GIA certified, worldwide shipping.",
              keywords: 'luxury gemstones, heritage jewelry, Shankarmala, precious stones, GIA certified',
              ogImage: '/images/og-image.jpg',
              robots: 'index, follow',
              canonical: '',
              metaTags: '',
            },
          });
        }
        
        // Parse structured data if it exists
        let structuredData = {};
        if (settings.structuredData) {
          try {
            structuredData = JSON.parse(settings.structuredData);
          } catch (e) {
            console.error('Error parsing structured data:', e);
          }
        }
        
        // Parse meta tags if they exist
        let metaTags = [];
        if (settings.metaTags) {
          try {
            metaTags = JSON.parse(settings.metaTags);
          } catch (e) {
            console.error('Error parsing meta tags:', e);
          }
        }
        
        res.status(200).json({
          id: settings.id,
          page: settings.page,
          title: settings.title,
          description: settings.description,
          keywords: settings.keywords,
          ogImage: settings.ogImage,
          robots: settings.robots || 'index, follow',
          canonical: settings.canonical || '',
          metaTags,
          structuredData,
          updatedAt: settings.updatedAt,
        });
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
        res.status(500).json({ error: 'Failed to fetch SEO settings' });
      }
    } else if (req.method === 'PUT') {
      try {
        const seoData = req.body;
        if (!seoData.title || !seoData.description) {
          return res.status(400).json({ error: 'Title and description are required' });
        }
        
        // Convert structured data to string for storage
        let structuredDataString: string | null = null;
        if (seoData.structuredData) {
          try {
            structuredDataString = JSON.stringify(seoData.structuredData);
          } catch (e) {
            console.error('Error stringifying structured data:', e);
          }
        }
        
        // Convert meta tags to string for storage
        let metaTagsString: string | null = null;
        if (seoData.metaTags && seoData.metaTags.length > 0) {
          try {
            metaTagsString = JSON.stringify(seoData.metaTags);
          } catch (e) {
            console.error('Error stringifying meta tags:', e);
          }
        }
        
        const updated = await prisma.sEO.upsert({
          where: { id: 1 },
          update: {
            page: seoData.page || 'global',
            title: seoData.title,
            description: seoData.description,
            keywords: seoData.keywords,
            ogImage: seoData.ogImage,
            robots: seoData.robots || 'index, follow',
            canonical: seoData.canonical,
            metaTags: metaTagsString,
            structuredData: structuredDataString,
          },
          create: {
            id: 1,
            page: seoData.page || 'global',
            title: seoData.title,
            description: seoData.description,
            keywords: seoData.keywords,
            ogImage: seoData.ogImage,
            robots: seoData.robots || 'index, follow',
            canonical: seoData.canonical,
            metaTags: metaTagsString,
            structuredData: structuredDataString,
          },
        });
        
        res.status(200).json({ message: 'SEO settings updated successfully', updatedAt: updated.updatedAt });
      } catch (error) {
        console.error('Error updating SEO settings:', error);
        res.status(500).json({ error: 'Failed to update SEO settings' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export default withAdminAuth(handler);