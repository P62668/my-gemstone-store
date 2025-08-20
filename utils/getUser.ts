import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { getTokenFromRequest } from './cookieParser';
import { getEnv } from './env';
import { User } from './auth';

/**
 * Attempts to resolve an authenticated user from several sources, in order of preference:
 * 1. NextAuth server session
 * 2. NextAuth JWT token (getToken)
 * 3. Legacy JWT token from cookie/header using utils/auth.verifyToken
 */
export async function getUserFromRequest(req: NextApiRequest, res?: NextApiResponse): Promise<User | null> {
  try {
    // 1) NextAuth server session
    try {
      const session = await getServerSession(req as any, res as any, authOptions as any);
      if (session && (session as any).user) {
        const suser = (session as any).user;
        return {
          id: typeof suser.id === 'string' ? parseInt(suser.id, 10) : (suser.id as number),
          email: suser.email as string,
          firstName: (suser.firstName as string) || undefined,
          lastName: (suser.lastName as string) || undefined,
          name: (suser.name as string) || undefined,
          role: (suser.role as string) || 'user',
          active: true,
          createdAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      // continue to other checks
    }

    // 2) NextAuth JWT token
    try {
      const secret = getEnv('NEXTAUTH_SECRET') || process.env.JWT_SECRET;
      const tokenPayload = await getToken({ req: req as any, secret: secret as string });
      if (tokenPayload) {
        const rawId = (tokenPayload.sub ?? tokenPayload.userId ?? tokenPayload.id) as unknown;
        const id = typeof rawId === 'string' ? parseInt(rawId, 10) : (rawId as number);
        return {
          id: Number(id),
          email: tokenPayload.email as string,
          firstName: (tokenPayload.firstName as string) || undefined,
          lastName: (tokenPayload.lastName as string) || undefined,
          name: (tokenPayload.name as string) || undefined,
          role: (tokenPayload.role as string) || 'user',
          active: true,
          createdAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      // continue
    }

    // 3) Legacy token from cookie/header
    const legacyToken = getTokenFromRequest(req);
    if (legacyToken) {
      // dynamically import to avoid circular deps
      const { verifyToken } = await import('./auth');
      const decoded = verifyToken(legacyToken);
      if (decoded && decoded.userId) {
        return {
          id: decoded.userId,
          email: decoded.email,
          firstName: (decoded.firstName as string) || undefined,
          lastName: (decoded.lastName as string) || undefined,
          name: undefined,
          role: decoded.role || 'user',
          active: true,
          createdAt: new Date().toISOString(),
        };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
