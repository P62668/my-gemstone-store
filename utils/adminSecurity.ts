import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { getUserFromRequest } from './getUser';
import { setSecureCookie as setCookie } from './cookieParser';

const prisma = new PrismaClient();

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const rateLimit = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export const checkLoginAttempts = (email: string): boolean => {
  const attempts = loginAttempts.get(email);
  const now = Date.now();

  if (!attempts) {
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > rateLimit.windowMs) {
    loginAttempts.delete(email);
    return true;
  }

  return attempts.count < rateLimit.maxAttempts;
};

export const recordLoginAttempt = (email: string, success: boolean) => {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: Date.now() };
  
  if (success) {
    loginAttempts.delete(email);
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(email, attempts);
  }
};

// Get token from request (cookie or header)
export const getTokenFromRequest = (req: NextApiRequest): string | null => {
  // Check cookies first - Next.js automatically parses cookies
  const token = req.cookies?.adminToken || req.cookies?.token;
  if (token) return token;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    return null;
  }
};

// Require admin authentication
export const requireAdminAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Prefer centralized user resolution which checks NextAuth session, NextAuth JWT, then legacy token
    const resolved = await getUserFromRequest(req, res);

    if (!resolved) {
      logger.warn('No authenticated user found', {
        message: 'Authentication required',
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_ERROR'
        }
      });
      return null;
    }

    // Fetch fresh user from DB to verify role and active state
    const user = await prisma.user.findUnique({
      where: { id: Number(resolved.id) },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        active: true
      }
    });

    if (!user || user.role !== 'admin' || !user.active) {
      logger.warn('Unauthorized access attempt', {
        message: 'User not authorized for admin access',
        userId: resolved.id,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
      return null;
    }

    logger.info('Admin authentication successful', {
      message: 'Admin user authenticated',
      userId: user.id,
      userEmail: user.email,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return user;

  } catch (error) {
    logger.error('Authentication error', error, {
      message: 'Authentication process failed',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      }
    });
    return null;
  }
};

// Generate admin token
export const generateAdminToken = (user: any): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'admin'
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h'
  });
};

// Set secure cookie - delegate to central cookie helper
export const setSecureCookie = (res: NextApiResponse, name: string, value: string, options: any = {}) => {
  return setCookie(res, name, value, options);
};

// Validate admin input
export const validateAdminInput = (data: any, requiredFields: string[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Permission system
export const getPermissionsByRole = (role: string): string[] => {
  const permissions: { [key: string]: string[] } = {
    admin: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'products:read', 'products:create', 'products:update', 'products:delete',
      'orders:read', 'orders:update', 'orders:delete',
      'analytics:read', 'settings:read', 'settings:update'
    ],
    manager: [
      'users:read', 'products:read', 'products:update',
      'orders:read', 'orders:update', 'analytics:read'
    ],
    user: [
      'products:read', 'orders:read'
    ]
  };

  return permissions[role] || [];
};

export const hasPermission = (user: any, permission: string): boolean => {
  if (!user || !user.role) return false;
  
  const userPermissions = getPermissionsByRole(user.role);
  return userPermissions.includes(permission);
};

export const hasAnyPermission = (user: any, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (user: any, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};
