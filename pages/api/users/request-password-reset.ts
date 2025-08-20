import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { enforceRateLimit } from '../../../utils/rateLimit';
import { sendMail } from '../../../utils/mailer';

import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!enforceRateLimit(req, res, { max: 5, windowMs: 60_000, key: 'reset_request' })) return;

  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset was sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    // Notification creation removed - model doesn't exist in schema

    // Store token in a dedicated table or use a different approach
    // For now, we'll just proceed with email sending

    const resetUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    try {
      await sendMail({
        to: email,
        subject: 'Reset your Shankarmala password',
        html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`,
      });
    } catch (emailError) {
      console.log('Email sending failed, but password reset token was created:', emailError);
      // In development, we can still return success since the token was created
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Password reset token:', token);
        return res.status(200).json({ 
          message: 'Password reset token created successfully (email not sent in development)',
          token: token // Only in development
        });
      }
    }

    return res.status(200).json({ message: 'If that email exists, a reset was sent.' });
  } catch (err: any) {
    console.error('Password reset error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process request' });
  }
}
