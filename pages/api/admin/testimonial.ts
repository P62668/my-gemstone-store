import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

function getUserFromReq(req: NextApiRequest): { id: number; email: string } | null {
  const { cookie } = req.headers;
  if (!cookie) return null;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return null;
  try {
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as { id: number; email: string };
    return decoded;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromReq(req);
  if (!user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  if (req.method === 'GET') {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
    return res.status(200).json(testimonials);
  }
  if (req.method === 'POST') {
    const { name, content, order, active } = req.body;
    if (!name || !content) return res.status(400).json({ error: 'Missing required fields' });
    const testimonial = await prisma.testimonial.create({
      data: { name, content, order, active },
    });
    return res.status(201).json(testimonial);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
