import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  limit?: number;
  key?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<RateLimitResult> => {
    try {
      const ip = getClientIP(req);
      const key = `rate_limit:${ip}:${req.url}`;
      const now = Date.now();
      const { windowMs, max, limit } = config;
      const actualLimit = limit || max;

      const current = rateLimitStore.get(key);
      
      if (!current || now > current.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: actualLimit - 1, resetTime: now + windowMs };
      }

      if (current.count >= actualLimit) {
        return { success: false, remaining: 0, resetTime: current.resetTime };
      }

      current.count++;
      return { success: true, remaining: actualLimit - current.count, resetTime: current.resetTime };
    } catch (error) {
      logger.error('Rate limit check failed', req, error as Error);
      return { success: true, remaining: 999 };
    }
  };
}

export function enforceRateLimit(req: NextApiRequest, res: NextApiResponse, config: RateLimitConfig): boolean {
    try {
      const ip = getClientIP(req);
      const key = `rate_limit:${ip}:${req.url}`;
      const now = Date.now();
      const { windowMs, max, limit } = config;
      const actualLimit = limit || max;

      const current = rateLimitStore.get(key);
      
      if (!current || now > current.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', actualLimit);
        res.setHeader('X-RateLimit-Remaining', actualLimit - 1);
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
        
        return true;
      }

      if (current.count >= actualLimit) {
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', actualLimit);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(current.resetTime).toISOString());
        
        logger.warn(`Rate limit exceeded for IP: ${ip}`, req);
        return false;
      }

      current.count++;
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', actualLimit);
      res.setHeader('X-RateLimit-Remaining', actualLimit - current.count);
      res.setHeader('X-RateLimit-Reset', new Date(current.resetTime).toISOString());
      
      return true;
    } catch (error) {
      logger.error('Rate limiting error', req, error as Error);
      // Allow request if rate limiting fails
      return true;
    }
}

function getClientIP(req: NextApiRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of Array.from(rateLimitStore.entries())) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Production-ready Redis rate limiter (uncomment and configure for production)
/*
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export function redisRateLimit(config: RateLimitConfig) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<RateLimitResult> => {
    try {
      const ip = getClientIP(req);
      const key = `rate_limit:${ip}:${req.url}`;
      const { windowMs, max } = config;

      const multi = redis.multi();
      multi.incr(key);
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      const count = results?.[0]?.[1] as number || 0;

      if (count > max) {
        const ttl = await redis.ttl(key);
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());
        
        logger.warn(`Rate limit exceeded for IP: ${ip}`, req);
        return { success: false, remaining: 0, resetTime: Date.now() + ttl * 1000 };
      }

      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());

      return { 
        success: true, 
        remaining: Math.max(0, max - count), 
        resetTime: Date.now() + ttl * 1000 
      };
    } catch (error) {
      logger.error('Redis rate limiting error', req, error as Error);
      return { success: true };
    }
  };
}
*/
