import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../../../utils/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      let settings = await prisma.siteSettings.findUnique({
        where: { id: 1 },
      });

      if (!settings) {
        // Create default settings if none exist
        const siteSettings = {
          name: 'Shankarmala',
          tagline: 'Luxury Gemstone Collection',
          about:
            'Welcome to Shankarmala, your premier destination for luxury gemstones and heritage jewelry.',
          contact: 'Contact us for premium gemstones and heritage jewelry',
          address: 'Kolkata, West Bengal, India',
          phone: '+91 98765 43210',
          email: 'info@shankarmala.com',
        };
        settings = await prisma.siteSettings.create({
          data: {
            id: 1,
            siteName: 'Shankarmala',
            siteDescription: 'Luxury Gemstone Collection',
            contactEmail: 'info@shankarmala.com',
            contactPhone: '+91 98765 43210',
            address: 'Kolkata, West Bengal, India',
            socialMedia: {
              facebook: 'https://facebook.com/shankarmala',
              instagram: 'https://instagram.com/shankarmala',
              twitter: 'https://twitter.com/shankarmala',
            },
          },
        });
      }

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      res.status(500).json({ error: 'Failed to fetch site settings' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { siteName, siteDescription, contactEmail, contactPhone, address, socialMedia } =
        req.body;

      // Upsert settings (create if doesn't exist, update if it does)
      const settings = await prisma.siteSettings.upsert({
        where: { id: 1 },
        update: {
          siteName,
          siteDescription,
          contactEmail,
          contactPhone,
          address,
          socialMedia,
        },
        create: {
          id: 1,
          siteName,
          siteDescription,
          contactEmail,
          contactPhone,
          address,
          socialMedia,
        },
      });

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error updating site settings:', error);
      res.status(500).json({ error: 'Failed to update site settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
