import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export interface AuthUser {
  id: number;
  email: string;
  role?: string;
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const { cookie } = req.headers;
  if (!cookie) return null;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

export function getUserFromRequest(req: NextApiRequest): AuthUser {
  const token = getTokenFromRequest(req);
  if (!token) {
    console.error('No token found in request');
    throw new Error('Not authenticated');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (!decoded || !decoded.id) {
      throw new Error('Invalid token structure');
    }
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

export function createToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (!decoded || !decoded.id) {
      throw new Error('Invalid token structure');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

export function requireAdmin(req: NextApiRequest): AuthUser {
  const user = getUserFromRequest(req);
  if (user.role !== 'admin') throw new Error('Forbidden: Admins only');
  return user;
}
