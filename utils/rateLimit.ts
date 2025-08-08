import type { NextApiRequest, NextApiResponse } from 'next';

type RateLimitOptions = {
  limit: number; // maximum requests per window
  windowMs: number; // window size in milliseconds
  key?: string; // optional custom key prefix per route
};

type Counter = {
  count: number;
  expiresAt: number;
};

// In-memory store. For serverless, this resets per cold start. For stronger guarantees, use Redis.
const rateLimitStore = new Map<string, Counter>();

export function getClientIp(req: NextApiRequest): string {
  const xff = (req.headers['x-forwarded-for'] as string) || '';
  const ip = xff.split(',')[0]?.trim() || (req.socket as any)?.remoteAddress || 'unknown';
  return ip;
}

export function enforceRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: RateLimitOptions,
): boolean {
  const now = Date.now();
  const ip = getClientIp(req);
  const keyBase = options.key || req.url || 'global';
  const key = `${keyBase}:${ip}`;

  const existing = rateLimitStore.get(key);
  if (!existing || now > existing.expiresAt) {
    const counter: Counter = { count: 1, expiresAt: now + options.windowMs };
    rateLimitStore.set(key, counter);
    setHeaders(res, options.limit, options.limit - 1, counter.expiresAt);
    return true;
  }

  if (existing.count >= options.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSec));
    setHeaders(res, options.limit, 0, existing.expiresAt);
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return false;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  setHeaders(res, options.limit, Math.max(0, options.limit - existing.count), existing.expiresAt);
  return true;
}

function setHeaders(res: NextApiResponse, limit: number, remaining: number, resetAtMs: number) {
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAtMs / 1000)));
}


