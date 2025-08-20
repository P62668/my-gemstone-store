import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';
import { rateLimit } from './rateLimit';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiHandlerConfig {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  methods?: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

export function createApiHandler<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => Promise<void>,
  config: ApiHandlerConfig = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    try {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Method validation
      if (config.methods && !config.methods.includes(req.method || '')) {
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`,
        });
      }

      // Rate limiting
      if (config.rateLimit) {
        const limiter = rateLimit(config.rateLimit);
        const result = await limiter(req, res);
        if (!result.success) {
          return res.status(429).json({
            success: false,
            error: 'Too many requests',
          });
        }
      }

      // Authentication check
      if (config.requireAuth || config.requireAdmin) {
        const authResult = await checkAuthentication(req, config.requireAdmin);
        if (!authResult.success) {
          return res.status(401).json({
            success: false,
            error: authResult.error,
          });
        }
      }

      // Log request
      logger.info(`${req.method} ${req.url}`, req);

      // Execute handler
      await handler(req, res);

    } catch (error) {
      logger.error('API Handler Error', req, error as Error);
      
      const statusCode = (error as any)?.statusCode || 500;
      const message = (error as any)?.message || 'Internal server error';
      
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  };
}

async function checkAuthentication(req: NextApiRequest, requireAdmin?: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { success: false, error: 'No authorization token provided' };
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (requireAdmin && decoded.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    // Add user info to request
    (req as any).user = decoded;
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid or expired token' };
  }
}

export function validateRequest<T>(
  req: NextApiRequest,
  schema: Record<string, any>
): { success: boolean; data?: T; error?: string } {
  try {
    const { body } = req;
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        return { success: false, error: `${field} is required` };
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          return { success: false, error: `${field} must be of type ${rules.type}` };
        }
        
        if (rules.minLength && value.length < rules.minLength) {
          return { success: false, error: `${field} must be at least ${rules.minLength} characters` };
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          return { success: false, error: `${field} must be at most ${rules.maxLength} characters` };
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          return { success: false, error: `${field} format is invalid` };
        }
      }
    }
    
    return { success: true, data: body as T };
  } catch (error) {
    return { success: false, error: 'Request validation failed' };
  }
}

export function handleApiError(error: unknown, req: NextApiRequest): { statusCode: number; message: string } {
  logger.error('API Error', req, error as Error);
  
  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      return { statusCode: 404, message: 'Resource not found' };
    }
    if (error.message.includes('unauthorized')) {
      return { statusCode: 401, message: 'Unauthorized' };
    }
    if (error.message.includes('forbidden')) {
      return { statusCode: 403, message: 'Forbidden' };
    }
    if (error.message.includes('validation')) {
      return { statusCode: 400, message: error.message };
    }
  }
  
  return { statusCode: 500, message: 'Internal server error' };
}
