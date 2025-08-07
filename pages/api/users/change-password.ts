import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { cookie } = req.headers;
  if (!cookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const token = tokenMatch[1];
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    console.error('Error changing password for user', userId, err);
    return res.status(500).json({ error: err.message });
  }
}
