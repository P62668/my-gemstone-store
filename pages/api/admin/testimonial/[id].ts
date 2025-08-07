import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../../../../utils/auth';

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
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }
  const { id } = req.query;
  if (req.method === 'PATCH') {
    const { name, content, order, active } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: Number(id) },
      data: { name, content, order, active },
    });
    return res.status(200).json(testimonial);
  }
  if (req.method === 'DELETE') {
    await prisma.testimonial.delete({ where: { id: Number(id) } });
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
