import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, generateToken } from '../../../utils/auth';
import { logger } from '../../../utils/logger';
import jwt from 'jsonwebtoken';
import { getEnv, requireEnv } from '../../../utils/env';

import { prisma } from '../../../lib/prisma';
const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Set secure cookies
    const secureFlags = process.env.NODE_ENV === 'production' ? '; Secure; Priority=High' : '';
    res.setHeader('Set-Cookie', [
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${secureFlags}`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${secureFlags}`
    ]);

    logger.info('User registration successful', {
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userId: user.id,
      email: user.email
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
