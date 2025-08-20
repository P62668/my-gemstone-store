import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return default SEO settings
    const seoSettings = {
      title: 'Shankarmala - Luxury Gemstone Collection',
      description: 'Discover the finest gemstones from Shankarmala\'s heritage jewelry collection. GIA certified, worldwide shipping.',
      keywords: 'gemstones, jewelry, luxury, GIA certified, diamonds, rubies, emeralds, sapphires',
      ogImage: '/images/placeholder-gemstone.jpg',
      ogUrl: 'https://shankarmala.com',
      canonical: 'https://shankarmala.com',
      twitterSite: '@shankarmala',
      themeColor: '#f59e0b',
    };

    return res.status(200).json(seoSettings);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
}
