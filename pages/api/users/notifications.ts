import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../utils/auth';

// Use singleton pattern for Prisma client
import { prisma } from '../../../lib/prisma';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let user;
  try {
    user = getUserFromRequest(req);
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
  if (req.method === 'GET') {
    try {
      // Notification model doesn't exist yet, return empty array for now
      // TODO: Implement notifications when the model is added to schema
      return res.status(200).json([]);
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch notifications', details: err.message || err });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
