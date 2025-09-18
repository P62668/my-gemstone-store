import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';

type RateLimitOptions = {
  windowMs?: number; // window in ms
  max?: number; // max requests per window
  keyPrefix?: string;
};

const DEFAULTS: Required<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyPrefix: 'rl:',
};

const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

function getKey(req: NextApiRequest, prefix = DEFAULTS.keyPrefix) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  return `${prefix}${ip}`;
}

export async function rateLimit(req: NextApiRequest, res: NextApiResponse, opts?: RateLimitOptions) {
  const { windowMs, max, keyPrefix } = { ...DEFAULTS, ...(opts || {}) } as Required<RateLimitOptions>;
  const key = getKey(req, keyPrefix);

  if (redisClient) {
    // Redis-based rate limiting (atomic)
    const now = Date.now();
    const tx = redisClient.multi();
    tx.zadd(key, now.toString(), `${now}`);
    tx.zremrangebyscore(key, 0, now - windowMs);
    tx.zcard(key);
    tx.pexpire(key, windowMs);
    const [, , count] = await tx.exec().then((r) => r?.map((x) => x[1]) ?? []);
    const current = typeof count === 'number' ? count : parseInt(String(count || '0'), 10);
    const remaining = Math.max(0, max - current);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    if (current > max) {
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
      res.status(429).json({ success: false, error: { message: 'Too many requests', code: 'RATE_LIMIT' } });
      return false;
    }
    return true;
  }

  // Fallback in-memory limiter (per-process)
  const store = (global as any).__rateLimiterStore || ((global as any).__rateLimiterStore = new Map<string, number[]>());
  const now = Date.now();
  const timestamps = store.get(key) || [];
  const recent = timestamps.filter((t) => t > now - windowMs);
  recent.push(now);
  store.set(key, recent);
  const current = recent.length;
  const remaining = Math.max(0, max - current);
  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  if (current > max) {
    res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
    res.status(429).json({ success: false, error: { message: 'Too many requests', code: 'RATE_LIMIT' } });
    return false;
  }

  return true;
}

export default rateLimit;
