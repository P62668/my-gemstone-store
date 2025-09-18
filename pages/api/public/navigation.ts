import { NextApiRequest, NextApiResponse } from 'next';
// // import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
  try {
    // Return default navigation (no database dependency)
    res.status(200).json({
      mainMenu: [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/shop' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ],
      footerMenu: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Terms', href: '/terms' },
        { label: 'Privacy', href: '/privacy' }
      ],
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'instagram', url: 'https://instagram.com' },
        { platform: 'twitter', url: 'https://twitter.com' }
      ],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    res.status(500).json({ error: 'Failed to fetch navigation settings' });
  }
}