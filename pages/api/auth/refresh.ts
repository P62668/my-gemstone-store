import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyRefreshToken, generateToken } from '../../../utils/auth';
import { setSecureCookie } from '../../../utils/cookieParser';
import { rateLimit } from '../../../utils/rateLimit';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting to prevent abuse
  const rl = await rateLimit({ max: 10, windowMs: 60_000, key: 'token_refresh' })(req, res);
  if (!rl.success) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      logger.warn('Refresh token missing', { url: req.url });
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify the refresh token
    const { userId } = verifyRefreshToken(refreshToken);
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true }
    });

    if (!user || !user.active) {
      logger.warn('User not found or inactive during token refresh', { userId });
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate a new access token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    });
    
    // Set the new token as a cookie
    setSecureCookie(res, 'token', newToken, {
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Return success with minimal user info
    logger.info('Token refreshed successfully', { userId });
    return res.status(200).json({
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Token refresh error', error, { url: req.url });
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}