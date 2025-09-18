import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdminAuth } from '../../../utils/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        // Fetch all SEO settings
        const seoSettings = await prisma.sEO.findMany();
        
        // Structure the data by page
        const structuredSettings: any = {
          global: {},
          pages: {},
          social: {},
          analytics: {},
          structuredData: {}
        };
        
        seoSettings.forEach(setting => {
          if (setting.page === 'global') {
            structuredSettings.global = {
              siteTitle: setting.title,
              siteDescription: setting.description,
              siteKeywords: setting.keywords,
              siteUrl: setting.ogImage || '', // Using ogImage field temporarily for site URL
            };
          } else if (setting.page === 'social') {
            try {
              structuredSettings.social = JSON.parse(setting.description);
            } catch (e) {
              structuredSettings.social = {};
            }
          } else if (setting.page === 'analytics') {
            try {
              structuredSettings.analytics = JSON.parse(setting.description);
            } catch (e) {
              structuredSettings.analytics = {};
            }
          } else if (setting.page === 'structuredData') {
            try {
              structuredSettings.structuredData = JSON.parse(setting.description);
            } catch (e) {
              structuredSettings.structuredData = {};
            }
          } else {
            // Regular page settings
            structuredSettings.pages[setting.page] = {
              title: setting.title,
              description: setting.description,
              keywords: setting.keywords,
              ogImage: setting.ogImage,
            };
          }
        });
        
        res.status(200).json(structuredSettings);
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
        res.status(500).json({ error: 'Failed to fetch SEO settings' });
      }
    } else if (req.method === 'PUT') {
      try {
        const { global, pages, social, analytics, structuredData } = req.body;
        
        // Update global settings
        if (global) {
          await prisma.sEO.upsert({
            where: { page: 'global' },
            update: {
              title: global.siteTitle,
              description: global.siteDescription,
              keywords: global.siteKeywords,
              ogImage: global.siteUrl, // Using ogImage field temporarily for site URL
            },
            create: {
              page: 'global',
              title: global.siteTitle,
              description: global.siteDescription,
              keywords: global.siteKeywords,
              ogImage: global.siteUrl,
            },
          });
        }
        
        // Update social settings
        if (social) {
          await prisma.sEO.upsert({
            where: { page: 'social' },
            update: {
              title: 'Social Settings',
              description: JSON.stringify(social),
            },
            create: {
              page: 'social',
              title: 'Social Settings',
              description: JSON.stringify(social),
            },
          });
        }
        
        // Update analytics settings
        if (analytics) {
          await prisma.sEO.upsert({
            where: { page: 'analytics' },
            update: {
              title: 'Analytics Settings',
              description: JSON.stringify(analytics),
            },
            create: {
              page: 'analytics',
              title: 'Analytics Settings',
              description: JSON.stringify(analytics),
            },
          });
        }
        
        // Update structured data settings
        if (structuredData) {
          await prisma.sEO.upsert({
            where: { page: 'structuredData' },
            update: {
              title: 'Structured Data Settings',
              description: JSON.stringify(structuredData),
            },
            create: {
              page: 'structuredData',
              title: 'Structured Data Settings',
              description: JSON.stringify(structuredData),
            },
          });
        }
        
        // Update page-specific settings
        if (pages) {
          for (const [pageKey, pageData] of Object.entries(pages)) {
            const data = pageData as any;
            await prisma.sEO.upsert({
              where: { page: pageKey },
              update: {
                title: data.title,
                description: data.description,
                keywords: data.keywords,
                ogImage: data.ogImage,
              },
              create: {
                page: pageKey,
                title: data.title,
                description: data.description,
                keywords: data.keywords,
                ogImage: data.ogImage,
              },
            });
          }
        }
        
        res.status(200).json({ message: 'SEO settings updated successfully' });
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