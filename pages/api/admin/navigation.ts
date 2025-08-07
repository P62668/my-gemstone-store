import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      let settings = await prisma.navigationSettings.findUnique({ where: { id: 1 } });
      if (!settings) {
        // Create default settings if none exist
        settings = await prisma.navigationSettings.create({
          data: {
            id: 1,
            menuItems: [
              { id: 'home', label: 'Home', href: '/', order: 1, active: true },
              { id: 'shop', label: 'Shop', href: '/shop', order: 2, active: true },
              { id: 'about', label: 'About', href: '/about', order: 3, active: true },
              { id: 'contact', label: 'Contact', href: '/contact', order: 4, active: true },
            ],
            footerLinks: [
              { id: 'privacy', label: 'Privacy Policy', href: '/privacy', order: 1, active: true },
              { id: 'terms', label: 'Terms of Service', href: '/terms', order: 2, active: true },
              { id: 'shipping', label: 'Shipping Info', href: '/shipping', order: 3, active: true },
              { id: 'returns', label: 'Returns', href: '/returns', order: 4, active: true },
            ],
            socialLinks: [
              {
                id: 'facebook',
                label: 'Facebook',
                href: 'https://facebook.com',
                icon: '📘',
                order: 1,
                active: true,
              },
              {
                id: 'instagram',
                label: 'Instagram',
                href: 'https://instagram.com',
                icon: '📷',
                order: 2,
                active: true,
              },
              {
                id: 'twitter',
                label: 'Twitter',
                href: 'https://twitter.com',
                icon: '🐦',
                order: 3,
                active: true,
              },
              {
                id: 'linkedin',
                label: 'LinkedIn',
                href: 'https://linkedin.com',
                icon: '💼',
                order: 4,
                active: true,
              },
            ],
          },
        });
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
  } else if (req.method === 'PUT') {
    try {
      const navigationData = req.body;
      if (!navigationData.mainMenu || !navigationData.footerMenu || !navigationData.socialLinks) {
        return res
          .status(400)
          .json({ error: 'Main menu, footer menu, and social links are required' });
      }
      const validateMenu = (menu: any[], menuName: string) => {
        if (!Array.isArray(menu)) {
          throw new Error(`${menuName} must be an array`);
        }
        for (const item of menu) {
          if (!item.id || !item.label || !item.href) {
            throw new Error(`Each ${menuName} item must have id, label, and href`);
          }
        }
      };
      try {
        validateMenu(navigationData.mainMenu, 'mainMenu');
        validateMenu(navigationData.footerMenu, 'footerMenu');
        validateMenu(navigationData.socialLinks, 'socialLinks');
      } catch (validationError: any) {
        return res.status(400).json({ error: validationError.message });
      }
      const updated = await prisma.navigationSettings.upsert({
        where: { id: 1 },
        update: {
          menuItems: navigationData.mainMenu,
          footerLinks: navigationData.footerMenu,
          socialLinks: navigationData.socialLinks,
        },
        create: {
          id: 1,
          menuItems: navigationData.mainMenu,
          footerLinks: navigationData.footerMenu,
          socialLinks: navigationData.socialLinks,
        },
      });
      res.status(200).json({
        message: 'Navigation settings updated successfully',
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      console.error('Error updating navigation settings:', error);
      res.status(500).json({ error: 'Failed to update navigation settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
