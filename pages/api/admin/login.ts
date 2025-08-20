import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { 
  requireAdminAuth, 
  generateAdminToken, 
  setSecureCookie, 
  checkLoginAttempts, 
  recordLoginAttempt,
  validateEmail,
  validatePassword
} from '../../../utils/adminSecurity';
import { logger } from '../../../utils/logger';

import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'INVALID_EMAIL'
        }
      });
    }

    // Check login attempts
    if (!checkLoginAttempts(email)) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many login attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        active: true
      }
    });

    if (!user) {
      recordLoginAttempt(email, false);
      logger.warn('Failed admin login attempt: user not found', {
        message: 'Admin login failed - user not found',
        email,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      recordLoginAttempt(email, false);
      logger.warn('Non-admin user attempted admin login', {
        message: 'Non-admin user attempted admin login',
        email,
        userId: user.id,
        role: user.role,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Admin privileges required.',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Check if user is active
    if (!user.active) {
      recordLoginAttempt(email, false);
      logger.warn('Inactive admin user attempted login', {
        message: 'Inactive admin user attempted login',
        email,
        userId: user.id,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      return res.status(403).json({
        success: false,
        error: {
          message: 'Account is deactivated. Please contact support.',
          code: 'ACCOUNT_DEACTIVATED'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      recordLoginAttempt(email, false);
      logger.warn('Failed admin login attempt: invalid password', {
        message: 'Admin login failed - invalid password',
        email,
        userId: user.id,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate admin token
    const token = generateAdminToken(user);

    // Set secure cookie
    setSecureCookie(res, 'adminToken', token);

    // Record successful login
    recordLoginAttempt(email, true);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    logger.info('Admin logged in successfully', {
      message: 'Admin login successful',
      userId: user.id,
      email: user.email,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Admin login error', {
      message: 'Admin login process failed',
      errorMessage,
      errorStack,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed. Please try again.',
        code: 'LOGIN_ERROR'
      }
    });
  }
}
