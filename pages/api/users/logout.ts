import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../../utils/logger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const isProd = process.env.NODE_ENV === 'production';
  
  // Clear both token and refreshToken cookies
  const tokenCookie = 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict' + (isProd ? '; Secure; Priority=High' : '');
  const refreshTokenCookie = 'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict' + (isProd ? '; Secure; Priority=High' : '');
  
  res.setHeader('Set-Cookie', [tokenCookie, refreshTokenCookie]);
  
  logger.info('User logged out');
  res.status(200).json({ message: 'Logged out successfully' });
}
