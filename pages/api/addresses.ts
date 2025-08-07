import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user ID from JWT
  const { cookie } = req.headers;
  if (!cookie) return res.status(401).json({ error: 'Not authenticated' });
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return res.status(401).json({ error: 'Not authenticated' });
  let userId;
  try {
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as { id: number; email: string };
    userId = decoded.id;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (req.method === 'GET') {
    try {
      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' },
      });
      res.status(200).json(addresses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch addresses' });
    }
  } else if (req.method === 'POST') {
    try {
      const { type, name, address, city, state, zipCode, phone, isDefault } = req.body;
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      const newAddress = await prisma.address.create({
        data: { userId, type, name, address, city, state, zipCode, phone, isDefault },
      });
      res.status(201).json(newAddress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create address' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, type, name, address, city, state, zipCode, phone, isDefault } = req.body;
      // Only allow update if address belongs to user
      const addressRecord = await prisma.address.findUnique({ where: { id: parseInt(id) } });
      if (!addressRecord || addressRecord.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      const updatedAddress = await prisma.address.update({
        where: { id: parseInt(id) },
        data: { type, name, address, city, state, zipCode, phone, isDefault },
      });
      res.status(200).json(updatedAddress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update address' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const addressRecord = await prisma.address.findUnique({
        where: { id: parseInt(id as string) },
      });
      if (!addressRecord || addressRecord.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await prisma.address.delete({ where: { id: parseInt(id as string) } });
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete address' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
