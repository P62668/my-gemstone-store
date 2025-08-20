import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '../../../utils/auth';

// Use singleton pattern for Prisma client
import { prisma } from '../../../lib/prisma';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let user;
  try {
    user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }
  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    console.error('Error changing password for user', user.id, err);
    return res.status(500).json({ error: err.message });
  }
}
