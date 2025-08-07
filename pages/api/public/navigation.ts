import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const settings = await prisma.navigationSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      return res.status(404).json({ error: 'Navigation settings not found' });
    }
    res.status(200).json({
      mainMenu: settings.menuItems,
      footerMenu: settings.footerLinks,
      socialLinks: settings.socialLinks,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    res.status(500).json({ error: 'Failed to fetch navigation settings' });
  }
}
