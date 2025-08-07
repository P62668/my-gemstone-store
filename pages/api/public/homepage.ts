import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const allSections = await prisma.homepageSection.findMany({ orderBy: { order: 'asc' } });
    console.log('Public homepage - All sections from DB:', allSections);

    const hero = allSections.find((s) => s.key === 'hero');
    const sections = allSections.filter((s) => s.key !== 'hero');

    console.log('Public homepage - Hero section:', hero);
    console.log('Public homepage - Other sections:', sections);

    const response = {
      hero: hero ? hero.content : null,
      sections: sections.map((s) => ({
        key: s.key,
        ...(s.content as any),
        order: s.order,
        active: s.active,
      })),
      updatedAt: allSections.length > 0 ? allSections[0].updatedAt : null,
    };

    console.log('Public homepage - Final response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching homepage settings:', error);
    res.status(500).json({ error: 'Failed to fetch homepage settings' });
  }
}
