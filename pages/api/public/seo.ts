import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const settings = await prisma.sEOSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      return res.status(404).json({ error: 'SEO settings not found' });
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
}
