import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../utils/auth';

import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  try {
    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all statistics in parallel
    const [totalUsers, activeUsers, adminUsers, newUsersThisMonth, recentlyActiveUsers] =
      await Promise.all([
        // Total users
        prisma.user.count(),

        // Active users
        prisma.user.count({
          where: { active: true },
        }),

        // Admin users
        prisma.user.count({
          where: { role: 'admin' },
        }),

        // New users this month
        prisma.user.count({
          where: {
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
        }),

        // Recently active users (users who have logged in within last 30 days)
        prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    const stats = {
      totalUsers,
      activeUsers,
      adminUsers,
      newUsersThisMonth,
      recentlyActiveUsers,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
}
