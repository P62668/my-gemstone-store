import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, User } from './auth';
import { logger } from './logger';
import { getTokenFromRequest } from './cookieParser';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // First try NextAuth session
      try {
        const session = await getServerSession(req, res, authOptions as any);
        if (session && (session as any).user) {
          const suser = (session as any).user;
          req.user = {
            id: typeof suser.id === 'string' ? parseInt(suser.id, 10) : suser.id,
            email: suser.email,
            role: suser.role || 'user',
            active: true,
            createdAt: new Date().toISOString(),
          };
          return handler(req, res);
        }
      } catch (e) {
        // ignore and fallback to token
      }

      // Fallback: Get token from request (cookie or header)
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Set user on request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        active: true,
        createdAt: new Date().toISOString(),
      };

      return handler(req, res);
    } catch (error) {
      logger.error('Authentication failed', req, error as Error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

export function withAdminAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<any> => {
    try {
      // Get token from request
      const token = getTokenFromRequest(req);

      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Check admin role
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      // Set user on request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        active: true,
        createdAt: new Date().toISOString(),
      };

      return handler(req, res);
    } catch (error) {
      logger.error('Admin authentication failed', req, error as Error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}
