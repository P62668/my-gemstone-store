import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { logger } from '../../../utils/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = req.user;
      if (!user || !user.id) {
        logger.warn('Authentication failed - no user or user ID', {
          url: req.url,
          method: req.method,
          userAgent: req.headers['user-agent'],
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });
        
        return res.status(401).json({
          error: 'Authentication required. Please log in again.',
          code: 'AUTH_REQUIRED',
        });
      }
      
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: true,
        },
      });
      
      if (!dbUser) {
        logger.warn('User not found in database', {
          userId: user.id,
          url: req.url,
          method: req.method
        });
        
        return res.status(404).json({ 
          error: 'User not found. Please contact support.',
          code: 'USER_NOT_FOUND'
        });
      }
      
      return res.status(200).json(dbUser);
    } catch (error) {
      logger.error('GET /api/users/me error', error, {
        url: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      });
      
      return res.status(500).json({
        error: 'Unable to fetch user data. Please try again later.',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  } else if (req.method === 'PATCH') {
    try {
      const user = req.user;
      if (!user || !user.id) {
        logger.warn('Authentication failed for profile update', {
          url: req.url,
          method: req.method,
          userAgent: req.headers['user-agent'],
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });
        
        return res.status(401).json({
          error: 'Authentication required. Please log in again.',
          code: 'AUTH_REQUIRED',
        });
      }

      const { firstName, lastName, email } = req.body;
      
      if (!firstName && !lastName && !email) {
        return res.status(400).json({ 
          error: 'No fields to update.',
          code: 'NO_FIELDS_TO_UPDATE'
        });
      }
      
      const data: any = {};
      if (firstName) data.firstName = firstName;
      if (lastName) data.lastName = lastName;
      if (email) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          return res.status(400).json({ 
            error: 'Invalid email format.',
            code: 'INVALID_EMAIL'
          });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== user.id) {
          return res.status(400).json({ 
            error: 'Email already in use.',
            code: 'EMAIL_ALREADY_EXISTS'
          });
        }
        data.email = email;
      }
      
      const updated = await prisma.user.update({
        where: { id: user.id },
        data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: true,
        },
      });
      
      logger.info('User profile updated successfully', {
        userId: user.id,
        url: req.url,
        method: req.method
      });
      
      return res.status(200).json(updated);
    } catch (error) {
      logger.error('PATCH /api/users/me error', error, {
        url: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      });
      
      return res.status(500).json({
        error: 'Unable to update profile. Please try again later.',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  } else {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }
}

export default withAuth(handler);
