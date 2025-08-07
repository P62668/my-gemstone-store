import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../../utils/auth';
import { handleApiError } from '../../../utils/errorHandler';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let user;
  try {
    user = getUserFromRequest(req);
  } catch (err: any) {
    console.error('Authentication error in /api/users/me:', err);
    handleApiError(err, req, res, 'Authentication required. Please log in again.');
    return;
  }

  if (req.method === 'GET') {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
          profileImage: true,
        },
      });
      if (!dbUser) {
        return res.status(404).json({ error: 'User not found. Please contact support.' });
      }
      return res.status(200).json(dbUser);
    } catch (err: any) {
      console.error('GET /api/users/me error:', err);
      return res.status(500).json({
        error: 'Unable to fetch profile. Please try again later.',
        details: err.message || err,
      });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { name, email, profileImage } = req.body;
      if (!name && !email && !profileImage) {
        return res.status(400).json({ error: 'No fields to update.' });
      }
      const data: any = {};
      if (name) data.name = name;
      if (email) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          return res.status(400).json({ error: 'Invalid email format.' });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== user.id) {
          return res.status(400).json({ error: 'Email already in use.' });
        }
        data.email = email;
      }
      if (profileImage) {
        data.profileImage = profileImage;
      }
      const updated = await prisma.user.update({
        where: { id: user.id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
          profileImage: true,
        },
      });
      return res.status(200).json(updated);
    } catch (err: any) {
      console.error('PATCH /api/users/me error:', err);
      return res.status(500).json({
        error: 'Unable to update profile. Please try again later.',
        details: err.message || err,
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
