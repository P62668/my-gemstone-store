import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { enforceRateLimit } from '../../../utils/rateLimit';
import { sendMail } from '../../../utils/mailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!enforceRateLimit(req, res, { limit: 5, windowMs: 60_000, key: 'reset_request' })) return;

  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset was sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Password reset requested at ${new Date().toISOString()}`,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        /* store token in a dedicated table ideally; for simplicity, reuse verify field */ emailVerifyToken:
          token,
      },
    });

    const resetUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendMail({
      to: email,
      subject: 'Reset your Shankarmala password',
      html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`,
    });

    return res.status(200).json({ message: 'If that email exists, a reset was sent.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process request' });
  }
}
