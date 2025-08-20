import { NextApiRequest, NextApiResponse } from 'next';
import { User } from './auth';
import { logger } from './logger';
import { getUserFromRequest } from './getUser';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<any> => {
    try {
      const user = await getUserFromRequest(req, res);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      req.user = user;
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
      const user = await getUserFromRequest(req, res);
      if (!user) return res.status(401).json({ error: 'Authentication required' });
      if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

      req.user = user;
      return handler(req, res);
    } catch (error) {
      logger.error('Admin authentication failed', req, error as Error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}
