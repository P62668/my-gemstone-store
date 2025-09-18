import type { NextApiRequest, NextApiResponse } from 'next';
import { clearLock } from '../../../../utils/rateLimit';
import { logger } from '../../../../utils/logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prefer a real authenticated admin session (NextAuth). Fall back to static ADMIN_UNLOCK_TOKEN for automation.
  try {
    const session = await getServerSession(req as any, res as any, authOptions as any);
    if (session && (session as any).user && (session as any).user.role === 'admin') {
      // authorized
    } else {
      // Prefer HMAC short-lived token when ADMIN_UNLOCK_SECRET is configured.
      const providedRaw = (req.headers['x-admin-token'] || req.headers['X-ADMIN-TOKEN']) as string | undefined;
      const provided = providedRaw ? providedRaw.replace(/^Bearer\s+/i, '').trim() : undefined;
      const secret = process.env.ADMIN_UNLOCK_SECRET;
      const ttl = Number(process.env.ADMIN_UNLOCK_TTL || '300'); // seconds

      const validateHmacToken = (token: string | undefined, ipVal: string, routeVal: string, identifierVal?: string) => {
        try {
          if (!token || !secret) return false;
          // token format: <ts>:<hexsig>
          const parts = token.split(':');
          if (parts.length !== 2) return false;
          const ts = Number(parts[0]);
          const sig = parts[1];
          if (!Number.isFinite(ts) || !sig) return false;
          const now = Math.floor(Date.now() / 1000);
          if (Math.abs(now - ts) > ttl) return false;

          const payload = `${routeVal}|${identifierVal || ''}|${ipVal}|${ts}`;
          const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
          const hb = Buffer.from(h, 'hex');
          const sb = Buffer.from(sig, 'hex');
          if (hb.length !== sb.length) return false;
          return crypto.timingSafeEqual(hb, sb);
        } catch (e) {
          return false;
        }
      };

      const ipHeader = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string | undefined;
      const ipForCheck = ipHeader || 'unknown';
      const routeForCheck = (req.body && (req.body.route as string)) || (req.query && (req.query.route as string)) || '';
      const identifierForCheck = (req.body && (req.body.identifier as string)) || (req.query && (req.query.identifier as string));

      if (secret) {
        const ok = validateHmacToken(provided, ipForCheck, routeForCheck, identifierForCheck as string | undefined);
        if (!ok) {
          logger.warn('Unauthorized attempt to clear lock (bad HMAC token)', { ip: ipForCheck, route: routeForCheck, identifier: identifierForCheck });
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
      } else {
        // legacy static token fallback
        const adminToken = process.env.ADMIN_UNLOCK_TOKEN;
        if (!adminToken || provided !== adminToken) {
          logger.warn('Unauthorized attempt to clear lock', { ip: ipForCheck });
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
      }
    }
  } catch (sessionErr) {
    // If session retrieval fails, fall back to token
    const providedRaw = (req.headers['x-admin-token'] || req.headers['X-ADMIN-TOKEN']) as string | undefined;
    const provided = providedRaw ? providedRaw.replace(/^Bearer\s+/i, '').trim() : undefined;
    const secret = process.env.ADMIN_UNLOCK_SECRET;
    const ttl = Number(process.env.ADMIN_UNLOCK_TTL || '300');

    const ipHeader = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string | undefined;
    const ipForCheck = ipHeader || 'unknown';
    const routeForCheck = (req.body && (req.body.route as string)) || (req.query && (req.query.route as string)) || '';
    const identifierForCheck = (req.body && (req.body.identifier as string)) || (req.query && (req.query.identifier as string));

    const validateHmacToken = (token: string | undefined, ipVal: string, routeVal: string, identifierVal?: string) => {
      try {
        if (!token || !secret) return false;
        const parts = token.split(':');
        if (parts.length !== 2) return false;
        const ts = Number(parts[0]);
        const sig = parts[1];
        if (!Number.isFinite(ts) || !sig) return false;
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - ts) > ttl) return false;
        const payload = `${routeVal}|${identifierVal || ''}|${ipVal}|${ts}`;
        const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        const hb = Buffer.from(h, 'hex');
        const sb = Buffer.from(sig, 'hex');
        if (hb.length !== sb.length) return false;
        return crypto.timingSafeEqual(hb, sb);
      } catch (e) {
        return false;
      }
    };

    if (secret) {
      const ok = validateHmacToken(provided, ipForCheck, routeForCheck, identifierForCheck as string | undefined);
      if (!ok) {
        logger.warn('Unauthorized attempt to clear lock (session error, bad HMAC token)', { ip: ipForCheck, route: routeForCheck, identifier: identifierForCheck, error: sessionErr });
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
    } else {
      const adminToken = process.env.ADMIN_UNLOCK_TOKEN;
      if (!adminToken || provided !== adminToken) {
        logger.warn('Unauthorized attempt to clear lock (session error)', { ip: ipForCheck, error: sessionErr });
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = req.body as { ip?: string; route?: string; identifier?: string } | undefined;
  const ip = (body && body.ip) || (req.query && (req.query.ip as string)) || 'unknown';
  const route = (body && body.route) || (req.query && (req.query.route as string));
  const identifier = (body && body.identifier) || (req.query && (req.query.identifier as string));

  if (!route) {
    return res.status(400).json({ success: false, error: 'Missing required "route" parameter' });
  }

  try {
    const ok = await clearLock(ip, route, identifier as string | undefined);
    if (ok) return res.status(200).json({ success: true, cleared: true });
    return res.status(404).json({ success: false, cleared: false, error: 'Lock not found' });
  } catch (err) {
    logger.error('Error clearing lock', err as Error);
    return res.status(500).json({ success: false, cleared: false, error: 'Failed to clear lock' });
  }
}
