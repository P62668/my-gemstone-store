import { NextRequest, NextResponse } from 'next/server';
import { logger } from './utils/logger';

const ADMIN_PREFIX = '/admin';
const PROTECTED_PATHS = ['/account', '/orders', '/checkout'];
const API_RATE_LIMIT = 100; // requests per window
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Enhanced security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://*.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;",
  'X-Powered-By': 'Gemstone Store'
};

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function isRateLimited(clientIP: string, path: string): { limited: boolean; retryAfter?: number } {
  const key = `${clientIP}:${path}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { limited: false };
  }
  
  if (record.count >= API_RATE_LIMIT) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { limited: true, retryAfter };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  return { limited: false };
}

function isSuspiciousRequest(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  const suspicious = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /^$/
  ];
  
  return suspicious.some(pattern => pattern.test(userAgent));
}

function hasAuthCookie(req: NextRequest): boolean {
  try {
    const cookies = req.cookies;
    const cookieNames: string[] = [];
    
    // Get all cookie names
    if (typeof cookies.getAll === 'function') {
      const allCookies = cookies.getAll();
      cookieNames.push(...allCookies.map(c => c.name));
    } else {
      // Fallback for older Next.js versions
      for (const [name] of cookies as any) {
        cookieNames.push(name);
      }
    }
    
    return cookieNames.some(name => name.includes('next-auth'));
  } catch (e) {
    return false;
  }
}

// Security logging
function logSecurityEvent(event: string, details: any) {
  logger.warn(`Security Event: ${event}`, details);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const clientIP = getClientIP(req);
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Skip middleware for static assets
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') || 
      pathname.includes('.') ||
      pathname.startsWith('/images')) {
    return response;
  }
  
  // Log request for security monitoring
  logger.info('Request', {
    ip: clientIP,
    method: req.method,
    url: pathname,
    userAgent: req.headers.get('user-agent')
  });
  
  // Block suspicious requests
  if (isSuspiciousRequest(req)) {
    logSecurityEvent('Suspicious Request Blocked', { ip: clientIP, url: pathname });
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const rateLimitResult = isRateLimited(clientIP, '/api');
    if (rateLimitResult.limited) {
      logSecurityEvent('API Rate Limit Exceeded', { ip: clientIP, retryAfter: rateLimitResult.retryAfter });
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '900', // 15 minutes
          ...Object.fromEntries(Object.entries(securityHeaders))
        }
      });
    }
    return response;
  }
  
  // Admin route protection
  if (pathname.startsWith(ADMIN_PREFIX)) {
    // Allow admin login page
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return response;
    }
    
    // Check authentication
    if (!hasAuthCookie(req)) {
      logSecurityEvent('Admin Access Denied: No Auth Cookie', { ip: clientIP, url: pathname });
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Additional rate limiting for admin routes
    const adminRateLimitResult = isRateLimited(clientIP, '/admin');
    if (adminRateLimitResult.limited) {
      logSecurityEvent('Admin Rate Limit Exceeded', { ip: clientIP, retryAfter: adminRateLimitResult.retryAfter });
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    
    return response;
  }
  
  // Protected user routes
  for (const protectedPath of PROTECTED_PATHS) {
    if (pathname.startsWith(protectedPath)) {
      if (!hasAuthCookie(req)) {
        logSecurityEvent('Protected Route Access Denied: No Auth Cookie', { ip: clientIP, url: pathname });
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
      break;
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};