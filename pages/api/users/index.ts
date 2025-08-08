import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { enforceRateLimit } from '../../../utils/rateLimit';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    if (!enforceRateLimit(req, res, { limit: 5, windowMs: 60_000, key: 'signup_legacy' })) return;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });
      return res
        .status(201)
        .json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  // Remove GET endpoint for listing users in production
};

export default handler;
