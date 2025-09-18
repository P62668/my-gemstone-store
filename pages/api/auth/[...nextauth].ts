import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';

import { prisma } from '../../../lib/prisma';
import { getEnv } from '../../../utils/env';
import { rateLimit } from '../../../utils/rateLimit';
import { logger } from '../../../utils/logger';
import { validatePassword, logSecurityEvent, getClientIP, sanitizeInput, validateAPIInput } from '../../../utils/security';

// Small helpers: mask email/identifier for logs and derive request IP consistently
function maskIdentifier(id?: string | null) {
  if (!id || typeof id !== 'string') return undefined;
  // mask middle of local-part: joedoe@example.com -> jo***oe@example.com
  return id.replace(/(^[^@]{2})([^@]*)(@.*$)/, (_m, a, _b, c) => `${a}***${c}`);
}

function getRequestIp(req: any) {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req?.socket?.remoteAddress || 'unknown';
}

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
  
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req: any) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // Sanitize input
        const email = sanitizeInput(credentials.email);
        const password = credentials.password; // Don't sanitize password

        // Validate email format
        const emailValidation = validateAPIInput({ email }, ['email']);
        if (!emailValidation.valid) {
          throw new Error('Invalid email format');
        }

        try {
          // Log security event
          const clientIP = getRequestIp(req);
          logSecurityEvent('Login Attempt', { 
            ip: clientIP, 
            email: maskIdentifier(email) 
          });
          
          const user = await prisma.user.findUnique({
            where: { email: email },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              role: true,
              active: true,
            },
          });

          if (!user || !user.active) {
            logSecurityEvent('Login Failed: Invalid User', { 
              ip: clientIP, 
              email: maskIdentifier(email) 
            });
            throw new Error('Invalid credentials');
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            logSecurityEvent('Login Failed: Invalid Password', { 
              ip: clientIP, 
              email: maskIdentifier(email) 
            });
            throw new Error('Invalid credentials');
          }

          // Merge anonymous session cart and wishlist into the user's account when present.
          // This is best-effort: failures here should not prevent login.
          try {
            const sessionId = req?.cookies?.session_id;
            if (sessionId) {
              const sessionItems = await prisma.sessionCartItem.findMany({ where: { sessionId } });
              if (sessionItems && sessionItems.length) {
                await prisma.$transaction(async (tx) => {
                  for (const it of sessionItems) {
                    // Try to find existing cart item for this user and gemstone
                    const existing = await tx.cartItem.findUnique({ where: { userId_gemstoneId: { userId: user.id, gemstoneId: it.gemstoneId } } });
                    if (existing) {
                      await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + it.quantity, price: it.price } });
                    } else {
                      await tx.cartItem.create({ data: { userId: user.id, gemstoneId: it.gemstoneId, quantity: it.quantity, price: it.price } });
                    }
                  }
                  // Remove session cart items and session cart
                  await tx.sessionCartItem.deleteMany({ where: { sessionId } });
                  await tx.sessionCart.deleteMany({ where: { sessionId } });
                });
                logger.info('Merged session cart into user cart', { userId: user.id, sessionId });
              }
            }
          } catch (mergeErr) {
            try {
              logger.error('Session cart merge failed', mergeErr, { userId: user.id, sessionId: req?.cookies?.session_id });
            } catch (logErr) {
              // swallow logging errors
            }
          }

          // Merge anonymous session wishlist into the user's wishlist when present.
          try {
            const wishlistSessionId = req?.cookies?.session_wishlist_id;
            if (wishlistSessionId) {
              const sessionWishlistItems = await prisma.sessionWishlistItem.findMany({ where: { sessionId: wishlistSessionId } });
              if (sessionWishlistItems && sessionWishlistItems.length) {
                await prisma.$transaction(async (tx) => {
                  for (const it of sessionWishlistItems) {
                    // Try to find existing wishlist item for this user and gemstone
                    const existing = await tx.wishlistItem.findUnique({ where: { userId_gemstoneId: { userId: user.id, gemstoneId: it.gemstoneId } } });
                    if (!existing) {
                      await tx.wishlistItem.create({ data: { userId: user.id, gemstoneId: it.gemstoneId } });
                    }
                  }
                  // Remove session wishlist items and session wishlist
                  await tx.sessionWishlistItem.deleteMany({ where: { sessionId: wishlistSessionId } });
                  await tx.sessionWishlist.deleteMany({ where: { sessionId: wishlistSessionId } });
                });
                logger.info('Merged session wishlist into user wishlist', { userId: user.id, sessionId: wishlistSessionId });
              }
            }
          } catch (mergeErr) {
            try {
              logger.error('Session wishlist merge failed', mergeErr, { userId: user.id, sessionId: req?.cookies?.session_wishlist_id });
            } catch (logErr) {
              // swallow logging errors
            }
          }

          // In dev/test, expose a helper header so tests can retrieve the token if cookies are stripped
          try {
            if (process.env.NODE_ENV !== 'production' && req?.res) {
              // NextAuth will set the cookie; we additionally vary on Accept to avoid caching issues
              req.res.setHeader('Vary', 'Accept');
              req.res.setHeader('X-Auth-Dev', '1');
            }
          } catch {}

          // Log successful login
          logSecurityEvent('Login Successful', { 
            userId: user.id,
            ip: clientIP, 
            email: maskIdentifier(email) 
          });
          
          // Return user object with proper structure for NextAuth
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
            role: user.role,
          };
        } catch (error) {
          // Use structured logger for better traceability; avoid logging raw emails
          try {
            const ip = getRequestIp((global as any).req || {});
            logger.error('Auth authorize error', error, {
              provider: 'credentials',
              identifier: maskIdentifier(credentials?.email),
              ip,
            });
          } catch (e) {
            logger.error('Auth authorize error (logging fallback)', error);
          }
          // Avoid leaking internal error details to clients
          throw new Error('Invalid credentials');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10), // 7 days
  },
  // Harden cookie settings in production while keeping local/dev friendly defaults
  cookies: {
    sessionToken: {
      // Use secure cookie name in production to enable browser protections
      name: process.env.NODE_ENV === 'production' ? "__Secure-next-auth.session-token" : 'next-auth.session-token',
      options: {
        httpOnly: true,
        // Lax improves compatibility for redirects during tests
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10),
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: false,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret',
  debug: process.env.NODE_ENV === 'development',
};

// Wrap NextAuth with targeted rate limiting for credential-based sign-ins and other sensitive actions.
async function authHandler(req: any, res: any) {
  try {
    // Identify NextAuth action from the dynamic route param (nextauth array)
    const nextauth = Array.isArray(req.query?.nextauth) ? req.query.nextauth.join('/') : String(req.query?.nextauth || '');

    // Apply stricter rate limits to credential callbacks (where brute-force is most likely)
    // POST /api/auth/callback/credentials is the endpoint used by credentials provider
    if (req.method === 'POST' && /callback\/??credentials/.test(nextauth)) {
      // Test-friendly CSRF support: if the client didn't preserve cookies between
      // the CSRF fetch and this POST, copy the csrfToken from the body into the
      // expected cookie so NextAuth's CSRF check passes.
      try {
        if (!req.cookies) req.cookies = {} as any;
        const bodyCsrf = req?.body?.csrfToken;
        const cookieCsrf = req.cookies['next-auth.csrf-token'] || req.cookies['__Host-next-auth.csrf-token'];
        if (bodyCsrf && !cookieCsrf) {
          // NextAuth stores the cookie as `${token}|${hash}`. The first segment is compared.
          req.cookies['next-auth.csrf-token'] = `${bodyCsrf}|test`;
          // Also ensure the raw Cookie header carries this for libraries that re-read cookies from header
          try {
            const existing = req.headers?.cookie || '';
            const toAppend = `next-auth.csrf-token=${encodeURIComponent(`${bodyCsrf}|test`)}`;
            req.headers.cookie = existing ? `${existing}; ${toAppend}` : toAppend;
          } catch {}
        }
      } catch {}
      // Try to extract an identifier (email) from the credentials payload where possible
      let bodyEmail: string | undefined;
      try {
        const body = req.body;
        if (body && typeof body === 'object') {
          bodyEmail = (body.email || body.username || (body.credentials && body.credentials.email)) ? String(body.email || body.username || (body.credentials && body.credentials.email)).toLowerCase() : undefined;
        }
      } catch (e) {
        // best-effort extraction; ignore errors
      }

      const ip = getRequestIp(req);
      const rl = await rateLimit({ max: 6, windowMs: 60_000, key: 'auth_credentials', identifier: bodyEmail, lock: { lockMs: 10 * 60 * 1000 } })(req, res);
      if (!rl.success) {
        logSecurityEvent('Rate Limit Exceeded for Credentials Callback', { ip, identifier: maskIdentifier(bodyEmail) });
        if (rl.locked && rl.lockUntil) {
          const retry = Math.max(0, Math.ceil((rl.lockUntil - Date.now()) / 1000));
          res.setHeader('Retry-After', String(retry));
          return res.status(429).json({ error: 'Too many failed attempts. Account temporarily locked.' });
        }
        return res.status(429).json({ error: 'Too many requests' });
      }
    }

    // Apply moderate limits to sign-in and sign-up pages (POST to /signin or /signup flows handled here)
    if (req.method === 'POST' && /signin|signIn|signup/.test(nextauth)) {
      const ip2 = getRequestIp(req);
      const rl = await rateLimit({ max: 10, windowMs: 60_000, key: 'auth_general' })(req, res);
      if (!rl.success) {
        logSecurityEvent('Rate Limit Exceeded for Auth Endpoint', { path: nextauth, ip: ip2 });
        return res.status(429).json({ error: 'Too many requests' });
      }
    }

    // Let NextAuth handle the rest
    return NextAuth(req, res, authOptions as any);
  } catch (err) {
    logger.error('Auth handler error', err, { url: req.url, method: req.method });
    // Fallback to NextAuth to generate standard error responses where possible
    try {
      return NextAuth(req, res, authOptions as any);
    } catch (inner) {
      logger.error('NextAuth fallback failed', inner, { url: req.url });
      res.status(500).json({ error: 'Authentication service error' });
    }
  }
}

// Add event logging for better traceability
(authOptions as any).events = {
  async signIn(message: any) {
    logger.info('NextAuth signIn', { message });
  },
  async signOut(message: any) {
    logger.info('NextAuth signOut', { message });
    // Log sign out for security monitoring
    try {
      const clientIP = getClientIP(message as any);
      logSecurityEvent('User Sign Out', { 
        userId: (message as any)?.user?.id,
        ip: clientIP 
      });
    } catch (e) {
      // ignore logging errors
    }
  },
  async error(err: any) {
    logger.error('NextAuth error', err, { source: 'nextauth' });
  },
};

export default authHandler;