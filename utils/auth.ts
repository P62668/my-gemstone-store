import { NextApiRequest } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { logger } from './logger';
import { getEnv, requireEnv } from './env';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  iat: number;
  exp: number;
}

// JWT Configuration
const JWT_SECRET: string =
  process.env.NODE_ENV === 'production'
    ? requireEnv('JWT_SECRET')
    : process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Password Configuration
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    logger.error('Password hashing failed', error, {
      message: 'Password hashing failed'
    });
    throw new Error('Password hashing failed');
  }
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Password comparison failed', error, {
      message: 'Password comparison failed'
    });
    return false;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(user: { 
  id: number; 
  email: string; 
  role: string; 
  firstName?: string; 
  lastName?: string; 
}): string {
  try {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return (jwt.sign as any)(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'shankarmala',
      audience: 'shankarmala-users',
    });
  } catch (error) {
    logger.error('Token generation failed', error, {
      message: 'Token generation failed',
      userId: user.id,
      email: user.email
    });
    throw new Error('Token generation failed');
  }
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: number): string {
  try {
    return (jwt.sign as any)({ userId, type: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'shankarmala',
      audience: 'shankarmala-refresh',
    });
  } catch (error) {
    logger.error('Refresh token generation failed', error, {
      message: 'Refresh token generation failed',
      userId
    });
    throw new Error('Refresh token generation failed');
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'shankarmala',
      audience: 'shankarmala-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    logger.error('Token verification failed', error, {
      message: 'Token verification failed'
    });
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: number } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'shankarmala',
      audience: 'shankarmala-refresh',
    }) as { userId: number; type: string };

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return { userId: decoded.userId };
  } catch (error) {
    logger.error('Refresh token verification failed', error, {
      message: 'Refresh token verification failed'
    });
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Get user from request (after authentication middleware)
 */
export function getUserFromRequest(req: NextApiRequest): User | null {
  return (req as any).user || null;
}

/**
 * Require authentication middleware
 */
export function requireAuth(req: NextApiRequest): User {
  const user = getUserFromRequest(req);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require admin authentication middleware
 */
export function requireAdmin(req: NextApiRequest): User {
  const user = requireAuth(req);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User> {
  try {
    console.info('[auth] authenticateUser lookup for:', email.toLowerCase());

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.info('[auth] User not found for email:', email.toLowerCase());
      throw new Error('Invalid credentials');
    }

    if (!user.active) {
      console.info('[auth] User account deactivated:', email.toLowerCase());
      throw new Error('Account is deactivated');
    }

    const isValidPassword = await comparePassword(password, user.password);
    console.info('[auth] Password compare result for', email.toLowerCase(), ':', isValidPassword);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      name: user.name || undefined,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error('User authentication failed', error, {
      message: 'User authentication failed',
      email: email.toLowerCase()
    });
    console.error('[auth] authenticateUser error:', (error as Error).message);
    throw error;
  }
}

/**
 * Create new user
 */
export async function createUser(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}): Promise<User> {
  try {
    const hashedPassword = await hashPassword(userData.password);

    const user = await prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        active: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      name: user.name || undefined,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error('User creation failed', undefined, error as Error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  } catch (error) {
    logger.error('Password update failed', undefined, error as Error);
    throw error;
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
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

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User, permission: string): boolean {
  if (user.role === 'admin') return true;
  
  // Add role-based permission logic here
  const permissions: Record<string, string[]> = {
    user: ['read:own', 'write:own'],
    moderator: ['read:all', 'write:own', 'moderate'],
  };

  return permissions[user.role]?.includes(permission) || false;
}
