import { NextApiRequest, NextApiResponse } from 'next';
import cookieParser from 'cookie-parser';

// Parse cookies middleware
export function parseCookies(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  // NextApiRequest already has cookies parsed, so we don't need cookieParser
  next();
}

// Get token from request
export function getTokenFromRequest(req: NextApiRequest): string | null {
  // Try to get from cookies first
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  // Try to get from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// Set secure cookie
export function setSecureCookie(res: NextApiResponse, name: string, value: string, options: {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
} = {}) {
  const {
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
    path = '/'
  } = options;

  // Always set Path=/ for global cookie access
  const cookieValue = `${name}=${value}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=${sameSite}; Max-Age=${maxAge}`;

  // Get existing cookies
  const existingCookies = res.getHeader('Set-Cookie') as string[] || [];

  // Add new cookie
  res.setHeader('Set-Cookie', [...existingCookies, cookieValue]);
}
