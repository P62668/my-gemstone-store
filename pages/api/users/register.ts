import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, generateToken } from '../../../utils/auth';
import { logger } from '../../../utils/logger';
import { rateLimit } from '../../../utils/rateLimit';
import { setSecureCookie } from '../../../utils/cookieParser';
import jwt from 'jsonwebtoken';
import { getEnv, requireEnv } from '../../../utils/env';

import { prisma } from '../../../lib/prisma';
const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bodyEmail = (req.body && (req.body as any).email) ? String((req.body as any).email).toLowerCase() : undefined;
  const rl = await rateLimit({ max: 6, windowMs: 60_000, key: 'register', identifier: bodyEmail, lock: { lockMs: 5 * 60 * 1000 } })(req, res);
  if (!rl.success) {
    if (rl.locked && rl.lockUntil) {
      res.setHeader('Retry-After', String(Math.max(0, Math.ceil((rl.lockUntil - Date.now()) / 1000))));
      return res.status(429).json({ success: false, error: 'Too many failed attempts. Try again later.' });
    }
    return res.status(429).json({ success: false, error: 'Too many requests' });
  }

  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        active: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      }
    });

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    });

    const refreshToken = jwt.sign({
      userId: user.id,
      type: 'refresh',
    }, JWT_SECRET, { expiresIn: '30d' });

  // Set secure cookies using helper
  setSecureCookie(res, 'token', token, { maxAge: 7 * 24 * 60 * 60, httpOnly: true });
  setSecureCookie(res, 'refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true });

    logger.info('User registration successful', {
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || (req.socket as any)?.remoteAddress,
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
        refreshToken,
      },
      message: 'Registration successful'
    });

  } catch (error) {
    logger.error('User registration failed', {
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({ 
      success: false,
      error: 'Registration failed. Please try again.' 
    });
  }
}
