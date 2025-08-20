import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { enforceRateLimit } from '../../../utils/rateLimit';
import { sendMail } from '../../../utils/mailer';
import { getEnv, requireEnv } from '../../../utils/env';

import { prisma } from '../../../lib/prisma';
const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || process.env.NEXTAUTH_SECRET || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!enforceRateLimit(req, res, { max: 5, windowMs: 60_000, key: 'signup' })) return;

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'user',
        active: true,
      },
    });

    // Send welcome email (best effort)
    try {
      await sendMail({
        to: user.email,
        subject: 'Welcome to Shankarmala!',
        html: `<p>Welcome to Shankarmala!</p><p>Thank you for creating your account. You can now start exploring our luxury gemstone collection.</p>`,
      });
    } catch (mailErr) {
      console.warn('Welcome email send failed:', mailErr);
    }

    // Issue JWT and set as httpOnly cookie
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure; Priority=High' : ''}`,
    );

    return res.status(201).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create user account.' });
  }
}
