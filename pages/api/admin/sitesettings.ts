import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getEnv, requireEnv } from '../../../utils/env';
import { withAdminAuth } from '../../../utils/authMiddleware';

// read secrets consistently; not used directly here
const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || 'dev-secret';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        let settings = await prisma.siteSettings.findUnique({
          where: { id: 1 },
        });

        if (!settings) {
          // Create default settings if none exist
          await prisma.siteSettings.createMany({
            data: [
              { key: 'siteName', value: 'Shankarmala', type: 'string' },
              { key: 'siteDescription', value: 'Luxury Gemstone Collection', type: 'string' },
              { key: 'contactEmail', value: 'info@shankarmala.com', type: 'string' },
              { key: 'contactPhone', value: '+91 98765 43210', type: 'string' },
              { key: 'address', value: 'Kolkata, West Bengal, India', type: 'string' },
              { key: 'socialMedia', value: JSON.stringify({
                facebook: 'https://facebook.com/shankarmala',
                instagram: 'https://instagram.com/shankarmala',
                twitter: 'https://twitter.com/shankarmala',
              }), type: 'json' },
            ],
          });
        }
        
        // Fetch all settings
        const allSettings = await prisma.siteSettings.findMany();
        const settingsObject = allSettings.reduce((acc, setting) => {
          acc[setting.key] = setting.type === 'json' ? JSON.parse(setting.value) : setting.value;
          return acc;
        }, {} as any);

        res.status(200).json(settingsObject);
      } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ error: 'Failed to fetch site settings' });
      }
    } else if (req.method === 'PATCH') {
      try {
        const { siteName, siteDescription, contactEmail, contactPhone, address, socialMedia } =
          req.body;

        // Update each setting individually
        const updates: Promise<any>[] = [];
        if (siteName) {
          updates.push(prisma.siteSettings.upsert({
            where: { key: 'siteName' },
            update: { value: siteName },
            create: { key: 'siteName', value: siteName, type: 'string' },
          }));
        }
        if (siteDescription) {
          updates.push(prisma.siteSettings.upsert({
            where: { key: 'siteDescription' },
            update: { value: siteDescription },
            create: { key: 'siteDescription', value: siteDescription, type: 'string' },
          }));
        }
        if (contactEmail) {
          updates.push(prisma.siteSettings.upsert({
            where: { key: 'contactEmail' },
            update: { value: contactEmail },
            create: { key: 'contactEmail', value: contactEmail, type: 'string' },
          }));
        }
        if (contactPhone) {
          updates.push(prisma.siteSettings.upsert({
            where: { key: 'contactPhone' },
            update: { value: contactPhone },
            create: { key: 'contactPhone', value: contactPhone, type: 'string' },
          }));
        }
        if (address) {
          updates.push(prisma.siteSettings.upsert({
            where: { key: 'address' },
            update: { value: address },
            create: { key: 'address', value: address, type: 'string' },
          }));
        }
        if (socialMedia) {
          updates.push(prisma.siteSettings.upsert({
            where: { key: 'socialMedia' },
            update: { value: JSON.stringify(socialMedia) },
            create: { key: 'socialMedia', value: JSON.stringify(socialMedia), type: 'json' },
          }));
        }

        await Promise.all(updates);

        // Fetch updated settings
        const allSettings = await prisma.siteSettings.findMany();
        const settingsObject = allSettings.reduce((acc, setting) => {
          acc[setting.key] = setting.type === 'json' ? JSON.parse(setting.value) : setting.value;
          return acc;
        }, {} as any);

        res.status(200).json(settingsObject);
      } catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ error: 'Failed to update site settings' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);
