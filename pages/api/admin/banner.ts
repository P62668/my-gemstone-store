import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../../../utils/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

function getUserFromReq(req: NextApiRequest): { id: number; email: string } | null {
  const { cookie } = req.headers;
  if (!cookie) return null;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return null;
  try {
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as { id: number; email: string };
    return decoded;
  } catch {
    return null;
  }
}

// Disabled due to missing Prisma model: banner
