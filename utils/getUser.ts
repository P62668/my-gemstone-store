import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { getEnv } from './env';
import { User } from './auth';
import { verifyToken } from './adminSecurity'; // Import verifyToken directly
import { PrismaClient } from '@prisma/client';

/**
 * Attempts to resolve an authenticated user from several sources, in order of preference:
 * 1. NextAuth server session
 * 2. NextAuth JWT token (getToken)
 * 3. Legacy JWT token from cookie/header using utils/adminSecurity.verifyToken
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
      console.error('NextAuth session check failed:', e);
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
      console.error('NextAuth JWT check failed:', e);
      // continue
    }

    // 3) Legacy token from cookie/header
    // Use the admin security getTokenFromRequest function instead of cookieParser
    try {
      const { getTokenFromRequest } = await import('./adminSecurity');
      const legacyToken = getTokenFromRequest(req);
      if (legacyToken) {
        // Use the admin security verifyToken function
        const decoded = verifyToken(legacyToken);
        if (decoded && decoded.userId) {
          // Verify the user exists and is active in the database
          try {
            const prisma = new PrismaClient();
            const dbUser = await prisma.user.findUnique({
              where: { id: Number(decoded.userId) },
              select: { 
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                active: true
              }
            });
            
            await prisma.$disconnect();
            
            if (dbUser && dbUser.active) {
              return {
                id: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.firstName || undefined,
                lastName: dbUser.lastName || undefined,
                name: dbUser.firstName && dbUser.lastName ? `${dbUser.firstName} ${dbUser.lastName}` : undefined,
                role: dbUser.role || 'user',
                active: dbUser.active,
                createdAt: new Date().toISOString(),
              };
            }
          } catch (dbError) {
            console.error('Database verification failed for legacy token:', dbError);
            // If database check fails, still return the decoded token user
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
      }
    } catch (e) {
      console.error('Legacy token check failed:', e);
    }

    return null;
  } catch (error) {
    console.error('getUserFromRequest failed:', error);
    return null;
  }
}