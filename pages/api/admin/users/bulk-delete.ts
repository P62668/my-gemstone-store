import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../utils/auth';

import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    // Check if any of the users are admins
    const adminUsers = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: 'admin',
      },
    });

    // If trying to delete admin users, check if it would leave no admins
    if (adminUsers.length > 0) {
      const totalAdminCount = await prisma.user.count({
        where: { role: 'admin' },
      });

      if (totalAdminCount <= adminUsers.length) {
        return res.status(400).json({
          error: 'Cannot delete all admin users. At least one admin must remain.',
        });
      }
    }

    // Delete users in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const deletedUsers = await tx.user.deleteMany({
        where: {
          id: { in: userIds },
        },
      });

      return deletedUsers;
    });

    res.status(200).json({
      message: `${result.count} users deleted successfully`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ error: 'Failed to delete users' });
  }
}
