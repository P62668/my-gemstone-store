import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { enforceRateLimit } from '../../../utils/rateLimit';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!enforceRateLimit(req, res, { limit: 8, windowMs: 60_000, key: 'admin_login' })) return;

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  console.log('[ADMIN LOGIN] Incoming body:', req.body);
  // Authenticate against the real database
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, role: true },
  });
  console.log('[ADMIN LOGIN] User from DB:', user);
  if (!user || user.role !== 'admin') {
    console.log('[ADMIN LOGIN] Invalid credentials: user not found or not admin');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('[ADMIN LOGIN] Password match:', isMatch);
  if (!isMatch) {
    console.log('[ADMIN LOGIN] Invalid credentials: password mismatch');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' },
  );

  // Set HTTP-only cookie
  const cookieString = `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure; Priority=High' : ''}`;
  console.log('[ADMIN LOGIN] Setting cookie:', cookieString);
  res.setHeader('Set-Cookie', cookieString);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, email: user.email, role: user.role },
  });
}
