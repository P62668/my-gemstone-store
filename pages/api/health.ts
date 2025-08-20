import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'unknown',
      disk: 'unknown',
    },
    details: {} as any,
  };

  try {
    // Database health check
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.checks.database = 'healthy';
      healthCheck.details.database = {
        status: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (dbError) {
      healthCheck.checks.database = 'unhealthy';
      healthCheck.details.database = {
        status: 'disconnected',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        timestamp: new Date().toISOString(),
      };
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    // Consider memory healthy if heap used is less than 500MB
    if (memUsageMB.heapUsed < 500) {
      healthCheck.checks.memory = 'healthy';
    } else {
      healthCheck.checks.memory = 'warning';
    }

    healthCheck.details.memory = {
      usage: memUsageMB,
      status: healthCheck.checks.memory,
      timestamp: new Date().toISOString(),
    };

    // Disk space check (simplified - in production use fs.stat)
    healthCheck.checks.disk = 'healthy'; // Assume healthy for now
    healthCheck.details.disk = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };

    // Overall health status
    const allChecks = Object.values(healthCheck.checks);
    if (allChecks.every(check => check === 'healthy')) {
      healthCheck.status = 'healthy';
    } else if (allChecks.some(check => check === 'unhealthy')) {
      healthCheck.status = 'unhealthy';
    } else {
      healthCheck.status = 'degraded';
    }

    // Add application-specific checks
    try {
      // Check if homepage sections are available
      const homepageSections = await prisma.homepageSection.count();
      healthCheck.details.homepage = {
        sections: homepageSections,
        status: homepageSections > 0 ? 'healthy' : 'warning',
      };

      // Check if gemstones are available
      const gemstoneCount = await prisma.gemstone.count();
      healthCheck.details.gemstones = {
        count: gemstoneCount,
        status: gemstoneCount > 0 ? 'healthy' : 'warning',
      };

      // Check if categories are available
      const categoryCount = await prisma.category.count();
      healthCheck.details.categories = {
        count: categoryCount,
        status: categoryCount > 0 ? 'healthy' : 'warning',
      };

    } catch (error) {
      healthCheck.details.application = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown application error',
      };
    }

    // Set appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthCheck);

  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.details.error = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json(healthCheck);
  } finally {
    await prisma.$disconnect();
  }
}
