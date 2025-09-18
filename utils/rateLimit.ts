import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

// Lazy Redis import type
type RedisType = any;
let redisClient: RedisType | null = null;
let redisAvailable = false;

function initRedisIfNeeded() {
  if (redisAvailable || !process.env.REDIS_URL) return;
    try {
      // lazy-require ioredis so environments without it don't fail
      // eslint config may not include no-var-requires rule here
      // @ts-ignore
      const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL);
    redisAvailable = true;
    logger.info('Redis rate limiter enabled');
  } catch (err) {
    logger.warn('ioredis not available or failed to initialize, falling back to in-memory rate limiter');
    redisClient = null;
    redisAvailable = false;
  }
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  limit?: number;
  key?: string;
  // Optional identifier to shard limits (e.g. email or user id)
  identifier?: string;
  // Optional lockout policy: when provided and the limit is exceeded, create a temporary lock for the identifier
  lock?: {
    // milliseconds to keep the lock
    lockMs: number;
  };
}

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: number;
  // If the request is blocked due to an active lock
  locked?: boolean;
  // epoch ms when the lock will be released
  lockUntil?: number;
}

// In-memory store for rate limiting (use Redis in production)
// Values may be either { count, resetTime } or { locked, lockUntil }
const rateLimitStore = new Map<string, any>();

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<RateLimitResult> => {
    initRedisIfNeeded();
    try {
      const ip = getClientIP(req);
      const routePart = config.key || req.url;
      const idPart = config.identifier ? `:${config.identifier}` : '';
      const key = `rate_limit:${ip}:${routePart}${idPart}`;
      const lockKey = `rate_lock:${ip}:${routePart}${idPart}`;
      const now = Date.now();
      const { windowMs, max, limit } = config;
      const actualLimit = limit || max;

      // Check for an active lock first (Redis or in-memory)
      if (redisAvailable && redisClient) {
        const lockedVal = await redisClient.get(lockKey);
        if (lockedVal) {
          // pttl gives milliseconds remaining
          const pttl = await redisClient.pttl(lockKey);
          const lockUntil = Date.now() + (pttl > 0 ? pttl : 0);
          res.setHeader('Retry-After', String(Math.ceil((lockUntil - Date.now()) / 1000)));
          return { success: false, remaining: 0, resetTime: lockUntil, locked: true, lockUntil };
        }

        // Redis-backed counting
        const multi = redisClient.multi();
        multi.incr(key);
        multi.expire(key, Math.ceil(windowMs / 1000));

        const results = await multi.exec();
        const count = (results?.[0]?.[1] as number) || 0;

        if (count > max) {
          const ttl = await redisClient.ttl(key);
          res.setHeader('X-RateLimit-Limit', String(max));
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());
          // If a lock policy is configured and an identifier is provided, set a temporary lock
          if (config.lock && config.identifier) {
            await redisClient.set(lockKey, '1', 'PX', config.lock.lockMs);
            logger.warn('Rate limiter created redis lock', { lockKey, identifier: config.identifier, ip, route: routePart, lockMs: config.lock.lockMs });
            // Clear the rate counter so attempts after unlock don't immediately re-lock
            try {
              await redisClient.del(key);
            } catch (e) {
              logger.warn('Failed to clear redis rate counter after lock', { key, error: e });
            }
            const lockUntil = Date.now() + config.lock.lockMs;
            res.setHeader('Retry-After', String(Math.ceil(config.lock.lockMs / 1000)));
            return { success: false, remaining: 0, resetTime: Date.now() + ttl * 1000, locked: true, lockUntil };
          }
          return { success: false, remaining: 0, resetTime: Date.now() + ttl * 1000 };
        }

        const ttl = await redisClient.ttl(key);
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());

        return { success: true, remaining: Math.max(0, max - count), resetTime: Date.now() + ttl * 1000 };
      }

      // In-memory fallback
      const current = rateLimitStore.get(key);

      // If there's a lock entry in-memory, respect it
      const inMemLock = rateLimitStore.get(lockKey);
      if (inMemLock && inMemLock.locked && Date.now() < inMemLock.lockUntil) {
        const lockUntil = inMemLock.lockUntil;
        res.setHeader('Retry-After', String(Math.ceil((lockUntil - Date.now()) / 1000)));
        return { success: false, remaining: 0, resetTime: lockUntil, locked: true, lockUntil };
      }

      if (!current || now > current.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: actualLimit - 1, resetTime: now + windowMs };
      }

      if (current.count >= actualLimit) {
        if (config.lock && config.identifier) {
          const lockUntil = now + config.lock.lockMs;
          rateLimitStore.set(lockKey, { locked: true, lockUntil });
          logger.warn('Rate limiter created in-memory lock', { lockKey, identifier: config.identifier, ip, route: routePart, lockMs: config.lock.lockMs });
          // Clear the corresponding rate counter so it doesn't immediately re-trigger
          try {
            rateLimitStore.delete(key);
          } catch (e) {
            // ignore
          }
          res.setHeader('Retry-After', String(Math.ceil(config.lock.lockMs / 1000)));
          return { success: false, remaining: 0, resetTime: lockUntil, locked: true, lockUntil };
        }
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
    initRedisIfNeeded();
    if (redisAvailable && redisClient) {
      // Synchronous-looking enforcement using Redis (still async under the hood)
      // Note: enforceRateLimit is used synchronously in some routes; we perform a quick blocking check by using a short async-handling hack
      // Since we cannot await in a sync function here, fallback to in-memory enforcement when Redis is enabled but synchronous behavior is required.
      // To keep behavior consistent, use in-memory enforcement when enforceRateLimit is called synchronously.
      // Implementors should prefer the async `rateLimit` middleware for Redis-backed enforcement.
    }

    const ip = getClientIP(req);
    const key = `rate_limit:${ip}:${req.url}`;
    const now = Date.now();
    const { windowMs, max, limit } = config;
    const actualLimit = limit || max;

    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', String(actualLimit));
      res.setHeader('X-RateLimit-Remaining', String(actualLimit - 1));
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      return true;
    }

    if (current.count >= actualLimit) {
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', String(actualLimit));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(current.resetTime).toISOString());
      
      logger.warn(`Rate limit exceeded for IP: ${ip}`, req);
      return false;
    }

    current.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', String(actualLimit));
    res.setHeader('X-RateLimit-Remaining', String(actualLimit - current.count));
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

export async function clearLock(ipOrIdentifier: string, routePart: string, identifier?: string) {
  initRedisIfNeeded();
  const ip = ipOrIdentifier || 'unknown';
  const idPart = identifier ? `:${identifier}` : '';
  const lockKey = `rate_lock:${ip}:${routePart}${idPart}`;
  try {
    if (redisAvailable && redisClient) {
  await redisClient.del(lockKey);
  // Also delete rate counter key to reset state
  const rateKey = `rate_limit:${ip}:${routePart}${idPart}`;
  await redisClient.del(rateKey);
      logger.info('Cleared redis lock', { lockKey });
      return true;
    }

    if (rateLimitStore.has(lockKey)) {
  rateLimitStore.delete(lockKey);
  const rateKey = `rate_limit:${ip}:${routePart}${idPart}`;
  rateLimitStore.delete(rateKey);
      logger.info('Cleared in-memory lock', { lockKey });
      return true;
    }

    return false;
  } catch (err) {
    logger.error('Failed to clear lock', { lockKey, error: err });
    return false;
  }
}

// Testing helpers: allow tests to set/clear in-memory locks without Redis
// These are intentionally small and exported for test usage only.
export function setInMemoryLock(lockKey: string, lockMs: number) {
  const lockUntil = Date.now() + lockMs;
  rateLimitStore.set(lockKey, { locked: true, lockUntil });
}

export function clearInMemoryLock() {
  for (const key of Array.from(rateLimitStore.keys())) {
    if (key.startsWith('rate_lock:')) rateLimitStore.delete(key);
  }
}

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
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());
        
        logger.warn(`Rate limit exceeded for IP: ${ip}`, req);
        return { success: false, remaining: 0, resetTime: Date.now() + ttl * 1000 };
      }

      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));
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