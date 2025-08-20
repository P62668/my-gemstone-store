import { NextApiRequest, NextApiResponse } from 'next';
import { User } from './auth';
import { logger } from './logger';
import { getTokenFromRequest } from './cookieParser';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { getEnv } from './env';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<any> => {
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

      // Fallback: try NextAuth JWT token (server-side helper)
      try {
        const secret = getEnv('NEXTAUTH_SECRET') || process.env.JWT_SECRET;
        const tokenPayload = await getToken({ req, secret: secret as string });
        if (!tokenPayload) {
          // Last resort: try legacy token in cookie/header
          const legacyToken = getTokenFromRequest(req);
          if (!legacyToken) return res.status(401).json({ error: 'Authentication required' });
          // If legacy token exists, attempt to decode using existing verify function
          const { verifyToken } = await (async () => await import('./auth'))();
          const decoded = verifyToken(legacyToken);
          req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            active: true,
            createdAt: new Date().toISOString(),
          };
        } else {
          // tokenPayload shape varies; map common fields
          req.user = {
            id: typeof tokenPayload.sub === 'string' ? parseInt(tokenPayload.sub as unknown as string, 10) : (tokenPayload.userId as unknown as number) || (tokenPayload.id as unknown as number),
            email: tokenPayload.email as string,
            role: (tokenPayload.role as string) || 'user',
            active: true,
            createdAt: new Date().toISOString(),
          };
        }
      } catch (innerErr) {
        logger.error('Token decode failed', req, innerErr as Error);
        return res.status(401).json({ error: 'Authentication required' });
      }

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
      // Prefer NextAuth session or JWT
      const session = await getServerSession(req, res, authOptions as any);
      if (session && (session as any).user && (session as any).user.role === 'admin') {
        const suser = (session as any).user;
        req.user = {
          id: typeof suser.id === 'string' ? parseInt(suser.id, 10) : suser.id,
          email: suser.email,
          role: suser.role || 'admin',
          active: true,
          createdAt: new Date().toISOString(),
        };
        return handler(req, res);
      }

      // NextAuth JWT fallback
      const secret = getEnv('NEXTAUTH_SECRET') || process.env.JWT_SECRET;
      const tokenPayload = await getToken({ req, secret: secret as string });
      if (tokenPayload && ((tokenPayload.role as string) === 'admin' || (tokenPayload.userRole as string) === 'admin')) {
        req.user = {
          id: typeof tokenPayload.sub === 'string' ? parseInt(tokenPayload.sub as unknown as string, 10) : (tokenPayload.userId as unknown as number) || (tokenPayload.id as unknown as number),
          email: tokenPayload.email as string,
          role: (tokenPayload.role as string) || 'admin',
          active: true,
          createdAt: new Date().toISOString(),
        };
        return handler(req, res);
      }

      // Legacy token fallback
      const legacyToken = getTokenFromRequest(req);
      if (legacyToken) {
        const { verifyToken } = await (async () => await import('./auth'))();
        const decoded = verifyToken(legacyToken);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          active: true,
          createdAt: new Date().toISOString(),
        };
        return handler(req, res);
      }

      return res.status(401).json({ error: 'Authentication required' });
    } catch (error) {
      logger.error('Admin authentication failed', req, error as Error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}
