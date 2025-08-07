import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cookie } = req.headers;
  if (!cookie) return res.status(401).json({ error: 'Not authenticated' });
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return res.status(401).json({ error: 'Not authenticated' });
  const token = tokenMatch[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  if (req.method === 'GET') {
    try {
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: decoded.id },
        include: { gemstone: true },
      });
      return res.status(200).json(wishlist);
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch wishlist', details: err.message || err });
    }
  } else if (req.method === 'POST') {
    // Add to wishlist: expects gemstoneId in body
    try {
      const { gemstoneId } = req.body;
      if (!gemstoneId) return res.status(400).json({ error: 'Missing gemstoneId' });
      // Prevent duplicates
      const exists = await prisma.wishlist.findFirst({ where: { userId: decoded.id, gemstoneId } });
      if (exists) return res.status(409).json({ error: 'Already in wishlist' });
      await prisma.wishlist.create({ data: { userId: decoded.id, gemstoneId } });
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: decoded.id },
        include: { gemstone: true },
      });
      return res.status(200).json(wishlist);
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Failed to add to wishlist', details: err.message || err });
    }
  } else if (req.method === 'DELETE') {
    // Remove from wishlist: expects id in body
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing wishlist id' });
      await prisma.wishlist.delete({ where: { id } });
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: decoded.id },
        include: { gemstone: true },
      });
      return res.status(200).json(wishlist);
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Failed to remove from wishlist', details: err.message || err });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
