import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { rateLimit } from '../../../utils/rateLimit';
import { sendMail } from '../../../utils/mailer';
import { verifyRecaptcha } from '../../../utils/recaptcha';
import { getEnv, requireEnv } from '../../../utils/env';

import { prisma } from '../../../lib/prisma';

const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const bodyEmail = email ? String(email).toLowerCase() : undefined;
  const recaptchaToken = (req.body && (req.body as any).recaptchaToken) ? String((req.body as any).recaptchaToken) : undefined;
  const recaptchaResult = await verifyRecaptcha(recaptchaToken, req.headers['x-forwarded-for'] as string | undefined);
  if (!recaptchaResult.success) {
    return res.status(400).json({ error: 'Recaptcha verification failed' });
  }
  const rl = await rateLimit({ max: 5, windowMs: 60_000, key: 'reset_request', identifier: bodyEmail, lock: { lockMs: 10 * 60 * 1000 } })(req, res);
  if (!rl.success) {
    if (rl.locked && rl.lockUntil) {
      res.setHeader('Retry-After', String(Math.max(0, Math.ceil((rl.lockUntil - Date.now()) / 1000))));
      // Keep response generic to avoid leaking whether the email exists
      return res.status(429).json({ message: 'If that email exists, a reset was sent.' });
    }
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset was sent.' });

    // Generate JWT token that expires in 1 hour
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    try {
      await sendMail({
        to: email,
        subject: 'Reset your Shankarmala password',
        html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
      });
    } catch (emailError) {
      // Log the error but return success to avoid leaking which emails exist
      const { logger } = require('../../../utils/logger');
      const { maskIdentifier, getRequestIp } = require('../../../utils/logHelpers');
      logger.warn('Password reset email failed to send', { identifier: maskIdentifier(email), ip: getRequestIp(req), error: emailError });
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          message: 'Password reset token created successfully (email not sent in development)',
          token: token // Only in development
        });
      }
    }

    return res.status(200).json({ message: 'If that email exists, a reset was sent.' });
  } catch (err: any) {
  // Use structured logging
  const { logger } = require('../../../utils/logger');
  const { maskIdentifier, getRequestIp } = require('../../../utils/logHelpers');
  logger.error('Password reset error', err, { identifier: maskIdentifier(email), ip: getRequestIp(req) });
    return res.status(500).json({ error: err.message || 'Failed to process request' });
  }
}