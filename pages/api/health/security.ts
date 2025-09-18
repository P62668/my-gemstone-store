import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../utils/logger';
import { logSecurityEvent, getClientIP } from '../../../utils/security';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Perform security health checks
    const checks = await Promise.allSettled([
      checkDatabaseConnection(),
      checkSecurityLogs(),
      checkActiveAdmins(),
      checkInactiveUsers(),
      checkRecentSecurityEvents()
    ]);

    // Process results
    const results = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: [
        {
          name: 'database_connection',
          status: checks[0].status === 'fulfilled' ? 'ok' : 'error',
          details: checks[0].status === 'fulfilled' ? checks[0].value : checks[0].reason
        },
        {
          name: 'security_logs',
          status: checks[1].status === 'fulfilled' ? 'ok' : 'warning',
          details: checks[1].status === 'fulfilled' ? checks[1].value : checks[1].reason
        },
        {
          name: 'active_admins',
          status: checks[2].status === 'fulfilled' ? 'ok' : 'warning',
          details: checks[2].status === 'fulfilled' ? checks[2].value : checks[2].reason
        },
        {
          name: 'inactive_users',
          status: checks[3].status === 'fulfilled' ? 'ok' : 'warning',
          details: checks[3].status === 'fulfilled' ? checks[3].value : checks[3].reason
        },
        {
          name: 'recent_security_events',
          status: checks[4].status === 'fulfilled' ? 'ok' : 'warning',
          details: checks[4].status === 'fulfilled' ? checks[4].value : checks[4].reason
        }
      ]
    };

    // Determine overall status
    const hasErrors = results.checks.some(check => check.status === 'error');
    const hasWarnings = results.checks.some(check => check.status === 'warning');
    
    if (hasErrors) {
      results.status = 'unhealthy';
    } else if (hasWarnings) {
      results.status = 'degraded';
    }

    // Log health check
    logSecurityEvent('Security Health Check', { 
      ip: clientIP,
      status: results.status,
      checks: results.checks.map(check => ({ name: check.name, status: check.status }))
    });

    // Return appropriate status code
    const statusCode = results.status === 'healthy' ? 200 : 
                      results.status === 'degraded' ? 200 : 503;

    return res.status(statusCode).json(results);
  } catch (error) {
    logger.error('Security health check failed', error);
    logSecurityEvent('Security Health Check Failed', { 
      ip: getClientIP(req),
      error: error.message
    });
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: 'Security health check failed'
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'Database connection successful';
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

async function checkSecurityLogs() {
  try {
    const count = await prisma.securityLog.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    return `Found ${count} security events in the last 24 hours`;
  } catch (error) {
    throw new Error(`Failed to check security logs: ${error.message}`);
  }
}

async function checkActiveAdmins() {
  try {
    const count = await prisma.user.count({
      where: {
        role: 'admin',
        active: true
      }
    });
    
    return `Found ${count} active admin users`;
  } catch (error) {
    throw new Error(`Failed to check active admins: ${error.message}`);
  }
}

async function checkInactiveUsers() {
  try {
    const count = await prisma.user.count({
      where: {
        active: false
      }
    });
    
    if (count > 10) {
      throw new Error(`Found ${count} inactive users, consider cleanup`);
    }
    
    return `Found ${count} inactive users`;
  } catch (error) {
    throw new Error(`Inactive user check: ${error.message}`);
  }
}

async function checkRecentSecurityEvents() {
  try {
    const recentEvents = await prisma.securityLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });
    
    return `Found ${recentEvents.length} recent security events`;
  } catch (error) {
    throw new Error(`Failed to check recent events: ${error.message}`);
  }
}