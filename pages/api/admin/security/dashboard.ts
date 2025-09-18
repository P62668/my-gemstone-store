import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { logger } from '../../../../utils/logger';
import { logSecurityEvent, getClientIP } from '../../../../utils/security';

const prisma = new PrismaClient();

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const clientIP = getClientIP(req);
    logSecurityEvent('Security Dashboard Access', { 
      userId: (req as any).user?.id,
      ip: clientIP 
    });

    // Get security metrics
    const [
      totalUsers,
      adminUsers,
      inactiveUsers,
      securityLogsCount,
      auditLogsCount,
      passwordResetsCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { active: false } }),
      prisma.securityLog.count(),
      prisma.adminAuditLog.count(),
      prisma.passwordReset.count()
    ]);

    // Get recent security events
    const recentSecurityEvents = await prisma.securityLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        timestamp: true,
        event: true,
        userId: true,
        ip: true
      }
    });

    // Get recent audit logs
    const recentAuditLogs = await prisma.adminAuditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        action: true,
        userId: true,
        resource: true
      }
    });

    // Calculate security score (simplified)
    const securityScore = Math.max(0, 100 - (inactiveUsers * 2) - (adminUsers > 5 ? (adminUsers - 5) * 5 : 0));

    const dashboardData = {
      metrics: {
        totalUsers,
        adminUsers,
        inactiveUsers,
        securityLogs: securityLogsCount,
        auditLogs: auditLogsCount,
        passwordResets: passwordResetsCount,
        securityScore
      },
      recentEvents: recentSecurityEvents,
      recentAudits: recentAuditLogs
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    logger.error('Failed to fetch security dashboard data', error);
    res.status(500).json({ error: 'Failed to fetch security dashboard data' });
  } finally {
    await prisma.$disconnect();
  }
});