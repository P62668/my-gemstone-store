import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from '../../../utils/rateLimit';
import { verifyRecaptcha } from '../../../utils/recaptcha';
import { sendMail } from '../../../utils/mailer';
import { setSecureCookie } from '../../../utils/cookieParser';
import { logger } from '../../../utils/logger';
import { maskIdentifier, getRequestIp } from '../../../utils/logHelpers';
import { getEnv, requireEnv } from '../../../utils/env';

import { prisma } from '../../../lib/prisma';
const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || process.env.NEXTAUTH_SECRET || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const bodyEmail = (req.body && (req.body as any).email) ? String((req.body as any).email).toLowerCase() : undefined;
  const rl = await rateLimit({ max: 5, windowMs: 60_000, key: 'signup', identifier: bodyEmail, lock: { lockMs: 5 * 60 * 1000 } })(req, res);
  if (!rl.success) {
    if (rl.locked && rl.lockUntil) {
      res.setHeader('Retry-After', String(Math.max(0, Math.ceil((rl.lockUntil - Date.now()) / 1000))));
      return res.status(429).json({ error: 'Too many failed attempts. Try again later.' });
    }
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { firstName, lastName, email, password } = req.body;

  // Optional recaptcha protection: enforce only if RECAPTCHA_SECRET is configured
  const recaptchaToken = (req.body && (req.body as any).recaptchaToken) ? String((req.body as any).recaptchaToken) : undefined;
  const recaptchaResult = await verifyRecaptcha(recaptchaToken, req.headers['x-forwarded-for'] as string | undefined);
  if (!recaptchaResult.success) {
    return res.status(400).json({ error: 'Recaptcha verification failed' });
  }

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
      logger.warn('Welcome email send failed', { error: mailErr });
    }

  // Issue JWT and set as httpOnly cookie
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
  setSecureCookie(res, 'token', token, { maxAge: 7 * 24 * 60 * 60, httpOnly: true });

  try {
    logger.info('User signup created', { identifier: maskIdentifier(user.email), id: user.id, ip: getRequestIp(req) });
  } catch (e) {
    logger.info('User signup created (fallback)', { id: user.id });
  }

    return res.status(201).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    logger.error('Signup error', err, { url: req.url, method: req.method });
    return res.status(500).json({ error: 'Failed to create user account.' });
  }
}
