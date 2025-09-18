import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { getUserFromRequest } from './getUser';
import { setSecureCookie as setCookie } from './cookieParser';
import { validatePassword as securityValidatePassword, sanitizeInput as securitySanitizeInput, logSecurityEvent, getClientIP, enhancedRateLimit, validateSecureToken } from './security';

const prisma = new PrismaClient();

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

// Export the loginAttempts map so it can be cleared externally
export { loginAttempts };

export const rateLimit = {
  maxAttempts: parseInt(process.env.ADMIN_RATE_LIMIT_MAX || '5', 10),
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutDuration: 30 * 60 * 1000, // 30 minutes lockout
};

export const checkLoginAttempts = (email: string): { allowed: boolean; lockedUntil?: number } => {
  const attempts = loginAttempts.get(email);
  const now = Date.now();

  if (!attempts) {
    return { allowed: true };
  }

  // Check if account is locked
  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    return { allowed: false, lockedUntil: attempts.lockedUntil };
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > rateLimit.windowMs) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  // Check if max attempts exceeded
  if (attempts.count >= rateLimit.maxAttempts) {
    const lockedUntil = now + rateLimit.lockoutDuration;
    loginAttempts.set(email, { ...attempts, lockedUntil });
    return { allowed: false, lockedUntil };
  }

  return { allowed: true };
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

// Verify JWT token with enhanced security
export const verifyToken = (token: string): any => {
  try {
    // Validate token format first
    if (!validateSecureToken(token)) {
      return null;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, { 
      algorithms: ['HS256'],
      clockTolerance: 30 // Allow 30 seconds clock skew
    });
    return decoded;
  } catch (error) {
    logger.error('Token verification failed', error);
    return null;
  }
};

// Require admin authentication with enhanced security
export const requireAdminAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Log security event
    const clientIP = getClientIP(req);
    logSecurityEvent('Admin Auth Attempt', { ip: clientIP, url: req.url });
    
    // Apply rate limiting
    const rateLimiter = enhancedRateLimit(parseInt(process.env.ADMIN_RATE_LIMIT_MAX || '200', 10));
    const rateLimitResult = await rateLimiter(req, res);
    if (!rateLimitResult.success) {
      logSecurityEvent('Rate Limit Exceeded for Admin Auth', { ip: clientIP, url: req.url });
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      });
      return null;
    }
    
    // Prefer centralized user resolution which checks NextAuth session, NextAuth JWT, then legacy token
    const resolved = await getUserFromRequest(req, res);

    if (!resolved) {
      logSecurityEvent('Admin Auth Failed: No User Found', {
        ip: clientIP,
        url: req.url
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
      logSecurityEvent('Admin Auth Failed: Access Denied', {
        userId: resolved.id,
        userRole: user?.role,
        active: user?.active,
        ip: clientIP,
        url: req.url
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
      ip: clientIP,
      url: req.url
    });

    return user;

  } catch (error) {
    logger.error('Authentication error', error, {
      message: 'Authentication process failed',
      ip: getClientIP(req),
      url: req.url
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

// Generate admin token with enhanced security
export const generateAdminToken = (user: any): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: 'HS256',
    expiresIn: '24h'
  });
};

// Set secure cookie - delegate to central cookie helper
export const setSecureCookie = (res: NextApiResponse, name: string, value: string, options: any = {}) => {
  return setCookie(res, name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: parseInt(process.env.ADMIN_SESSION_TIMEOUT || '3600', 10),
    ...options
  });
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

// Sanitize input - use enhanced security function
export const sanitizeInput = (input: string): string => {
  return securitySanitizeInput(input);
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength - use enhanced security function
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  return securityValidatePassword(password);
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

// CSRF protection for admin actions
export const generateCSRFToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};

export const validateCSRFToken = (token: string, expected: string): boolean => {
  if (!token || !expected) return false;
  
  // Use timing-safe comparison to prevent timing attacks
  if (token.length !== expected.length) return false;
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
};

// Session validation for admin
export const validateAdminSession = async (req: NextApiRequest): Promise<boolean> => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return false;
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return false;
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
      select: { active: true, role: true }
    });
    
    return !!user && user.active && user.role === 'admin';
  } catch (error) {
    logger.error('Admin session validation failed', error);
    return false;
  }
};