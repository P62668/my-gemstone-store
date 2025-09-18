import { NextApiRequest, NextApiResponse } from 'next';
import { User } from './auth';
import { logger } from './logger';
import { getUserFromRequest } from './getUser';
import { securityHeaders, logSecurityEvent, getClientIP, isIPBlocked, validateSession } from './security';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<any> => {
    try {
      // Apply security headers to all responses
      securityHeaders(req, res, () => {});
      
      // Check for blocked IPs
      const clientIP = getClientIP(req);
      if (isIPBlocked(clientIP)) {
        logSecurityEvent('Blocked IP Access Attempt', { ip: clientIP, url: req.url });
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Validate session integrity
      if (!validateSession(req)) {
        logSecurityEvent('Invalid Session Access Attempt', { ip: clientIP, url: req.url });
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      const user = await getUserFromRequest(req, res);
      if (!user) {
        logSecurityEvent('Authentication Required', { ip: clientIP, url: req.url });
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Additional security check: verify user is active in database
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { active: true }
        });
        
        await prisma.$disconnect();
        
        if (!dbUser || !dbUser.active) {
          logSecurityEvent('Authentication Failed: User Not Active', { 
            userId: user.id, 
            ip: clientIP,
            url: req.url 
          });
          return res.status(403).json({ error: 'Account is not active' });
        }
      } catch (dbError) {
        logger.error('Database check failed during auth', dbError, { 
          userId: user.id,
          url: req.url 
        });
        // If database check fails, still allow access if token was valid
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      logger.error('Authentication failed', error, req);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

export function withAdminAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<any> => {
    try {
      // Apply security headers to all responses
      securityHeaders(req, res, () => {});
      
      // Check for blocked IPs
      const clientIP = getClientIP(req);
      if (isIPBlocked(clientIP)) {
        logSecurityEvent('Blocked IP Access Attempt', { ip: clientIP, url: req.url });
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Validate session integrity
      if (!validateSession(req)) {
        logSecurityEvent('Invalid Session Access Attempt', { ip: clientIP, url: req.url });
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      const user = await getUserFromRequest(req, res);
      if (!user) {
        logSecurityEvent('Admin Authentication Failed: No User Found', { 
          ip: clientIP, 
          url: req.url 
        });
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user is admin
      if (user.role !== 'admin') {
        logSecurityEvent('Admin Authentication Failed: User Not Admin', { 
          userId: user.id, 
          userRole: user.role,
          ip: clientIP,
          url: req.url 
        });
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Verify user is active by checking database
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { active: true, role: true }
        });
        
        await prisma.$disconnect();
        
        if (!dbUser || !dbUser.active) {
          logSecurityEvent('Admin Authentication Failed: User Not Active', { 
            userId: user.id, 
            ip: clientIP,
            url: req.url 
          });
          return res.status(403).json({ error: 'Account is not active' });
        }
        
        if (dbUser.role !== 'admin') {
          logSecurityEvent('Admin Authentication Failed: Role Mismatch', { 
            userId: user.id, 
            userRole: user.role,
            dbRole: dbUser.role,
            ip: clientIP,
            url: req.url 
          });
          return res.status(403).json({ error: 'Admin access required' });
        }
      } catch (dbError) {
        logger.error('Database check failed during admin auth', dbError, { 
          userId: user.id,
          url: req.url 
        });
        // If database check fails, still allow access if token was valid
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      logger.error('Admin authentication failed', error, req);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

// Rate-limited authentication middleware
export function withRateLimitedAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<any> => {
    try {
      // Apply security headers to all responses
      securityHeaders(req, res, () => {});
      
      // Check for blocked IPs
      const clientIP = getClientIP(req);
      if (isIPBlocked(clientIP)) {
        logSecurityEvent('Blocked IP Access Attempt', { ip: clientIP, url: req.url });
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Apply rate limiting for authentication attempts
      const rateLimit = (await import('./security')).enhancedRateLimit(20); // Lower limit for auth endpoints
      const rateLimitResult = await rateLimit(req, res);
      if (!rateLimitResult.success) {
        logSecurityEvent('Rate Limit Exceeded for Auth Endpoint', { ip: clientIP, url: req.url });
        return res.status(429).json({ error: 'Too many requests' });
      }
      
      // Validate session integrity
      if (!validateSession(req)) {
        logSecurityEvent('Invalid Session Access Attempt', { ip: clientIP, url: req.url });
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      const user = await getUserFromRequest(req, res);
      if (!user) {
        logSecurityEvent('Authentication Required', { ip: clientIP, url: req.url });
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Additional security check: verify user is active in database
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { active: true }
        });
        
        await prisma.$disconnect();
        
        if (!dbUser || !dbUser.active) {
          logSecurityEvent('Authentication Failed: User Not Active', { 
            userId: user.id, 
            ip: clientIP,
            url: req.url 
          });
          return res.status(403).json({ error: 'Account is not active' });
        }
      } catch (dbError) {
        logger.error('Database check failed during auth', dbError, { 
          userId: user.id,
          url: req.url 
        });
        // If database check fails, still allow access if token was valid
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      logger.error('Authentication failed', error, req);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}