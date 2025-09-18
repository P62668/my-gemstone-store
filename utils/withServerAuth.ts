import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { verifyToken } from './adminSecurity';
import { prisma } from '../lib/prisma';

type RedirectResult = { redirect: { destination: string; permanent: boolean } };

/**
 * Server-side helper: return session or a redirect result.
 * Usage: const res = await getSessionOrRedirect(ctx); if ('redirect' in res) return res; const { session } = res;
 */
export async function getSessionOrRedirect(
  ctx: GetServerSidePropsContext,
  opts?: { requireAdmin?: boolean; redirectTo?: string },
): Promise<{ session: Session } | RedirectResult> {
  try {
    console.log('getSessionOrRedirect called with opts:', opts);
    
    // First check for NextAuth session
    const session = (await getServerSession(ctx.req as any, ctx.res as any, authOptions as any)) as
      | Session
      | null;
    
    console.log('Session from getServerSession:', session);

    if (session && session.user) {
      // If we have a NextAuth session and admin is required, check role
      if (opts?.requireAdmin && session.user.role !== 'admin') {
        console.log('User is not admin, redirecting to /admin/login');
        return { redirect: { destination: '/admin/login', permanent: false } };
      }
      
      console.log('User authenticated via NextAuth, returning session');
      return { session };
    }

    // If no NextAuth session, check for admin token (legacy admin auth)
    if (opts?.requireAdmin) {
      const adminToken = ctx.req.cookies?.adminToken;
      if (adminToken) {
        try {
          const decoded = verifyToken(adminToken);
          if (decoded && decoded.userId) {
            // Fetch user from database to verify role and active status
            const user = await prisma.user.findUnique({
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

            if (user && user.role === 'admin' && user.active) {
              // Create a session-like object for admin users
              const adminSession: Session = {
                user: {
                  id: String(user.id),
                  email: user.email,
                  name: `${user.firstName} ${user.lastName}`.trim(),
                  role: user.role
                },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
              };
              
              console.log('Admin authenticated via adminToken, returning session');
              return { session: adminSession };
            }
          }
        } catch (err) {
          console.log('Error verifying admin token:', err);
        }
      }
      
      console.log('Admin required but no valid authentication found, redirecting to /admin/login');
      return { redirect: { destination: '/admin/login', permanent: false } };
    }
    
    // For non-admin routes, redirect to login if no session
    const dest = opts?.redirectTo || `/login?redirect=${encodeURIComponent(ctx.resolvedUrl || ctx.req.url || '/')}`;
    console.log('No authentication found, redirecting to:', dest);
    return { redirect: { destination: dest, permanent: false } };
  } catch (err) {
    console.log('Error in getSessionOrRedirect:', err);
    const dest = opts?.requireAdmin ? '/admin/login' : '/login';
    return { redirect: { destination: dest, permanent: false } };
  }
}

export default getSessionOrRedirect;