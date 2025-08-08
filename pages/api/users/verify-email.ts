import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enforceRateLimit } from '../../../utils/rateLimit';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!enforceRateLimit(req, res, { limit: 20, windowMs: 60_000, key: 'verify_email' })) return;

  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to verify email' });
  }
}
