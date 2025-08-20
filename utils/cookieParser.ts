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
    // Max-Age must be seconds per cookie spec
    maxAge = 7 * 24 * 60 * 60, // 7 days in seconds
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
    path = '/',
  } = options;

  const attrs: string[] = [];
  attrs.push(`Path=${path}`);
  attrs.push(`Max-Age=${maxAge}`);
  attrs.push(`SameSite=${sameSite}`);
  if (httpOnly) attrs.push('HttpOnly');
  if (secure) attrs.push('Secure');

  const cookieValue = `${name}=${encodeURIComponent(value)}; ${attrs.join('; ')}`;

  // Normalize existing Set-Cookie header to an array
  const existing = res.getHeader('Set-Cookie');
  let cookies: string[] = [];
  if (typeof existing === 'string') cookies = [existing];
  else if (Array.isArray(existing)) cookies = existing as string[];

  cookies.push(cookieValue);
  res.setHeader('Set-Cookie', cookies);
}
