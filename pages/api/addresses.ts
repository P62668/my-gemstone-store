import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';

// Use singleton pattern for Prisma client
import { prisma } from '../../lib/prisma';



export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const addresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: { isDefault: 'desc' },
      });
      res.status(200).json(addresses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch addresses' });
    }
  } else if (req.method === 'POST') {
    try {
      const { type, firstName, lastName, address1, address2, city, state, postalCode, country, phone, isDefault } = req.body;
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      const newAddress = await prisma.address.create({
        data: { userId: user.id, type, firstName, lastName, address1, address2, city, state, postalCode, country, phone, isDefault },
      });
      res.status(201).json(newAddress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create address' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, type, firstName, lastName, address1, address2, city, state, postalCode, country, phone, isDefault } = req.body;
      // Only allow update if address belongs to user
      const addressRecord = await prisma.address.findUnique({ where: { id: parseInt(id) } });
      if (!addressRecord || addressRecord.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      const updatedAddress = await prisma.address.update({
        where: { id: parseInt(id) },
        data: { type, firstName, lastName, address1, address2, city, state, postalCode, country, phone, isDefault },
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
      if (!addressRecord || addressRecord.userId !== user.id) {
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
});
