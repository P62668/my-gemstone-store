import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import os from 'os';
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { logger } from '../../utils/logger';

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
      stripe: 'unknown',
      email: 'unknown'
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
      logger.error('Health check - Database connection failed', dbError);
    }

    // Check Stripe API connection
    if (process.env.STRIPE_SECRET_KEY && 
        process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key') {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });
        // Make a simple API call to verify connection
        await stripe.balance.retrieve();
        healthCheck.checks.stripe = 'healthy';
        healthCheck.details.stripe = {
          status: 'connected',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        healthCheck.checks.stripe = 'unhealthy';
        healthCheck.details.stripe = {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown Stripe error',
          timestamp: new Date().toISOString(),
        };
        logger.error('Health check - Stripe connection failed', error);
      }
    } else {
      healthCheck.checks.stripe = 'not_configured';
      healthCheck.details.stripe = {
        status: 'not_configured',
        timestamp: new Date().toISOString(),
      };
    }

    // Email service check
    if (process.env.EMAIL_HOST) {
      healthCheck.checks.email = 'configured';
      healthCheck.details.email = {
        status: 'configured',
        host: process.env.EMAIL_HOST,
        timestamp: new Date().toISOString(),
      };
    } else {
      healthCheck.checks.email = 'not_configured';
      healthCheck.details.email = {
        status: 'not_configured',
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

    // Add system memory info
    const systemMemory = {
      total: Math.round(os.totalmem() / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024),
      used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
    };

    // Consider memory healthy if heap used is less than 500MB
    if (memUsageMB.heapUsed < 500) {
      healthCheck.checks.memory = 'healthy';
    } else {
      healthCheck.checks.memory = 'warning';
    }

    healthCheck.details.memory = {
      usage: memUsageMB,
      system: systemMemory,
      status: healthCheck.checks.memory,
      timestamp: new Date().toISOString(),
    };

    // Disk space check (using fs.statfs)
    try {
      const rootDir = path.parse(process.cwd()).root;
      const stats = fs.statfsSync(rootDir);
      const total = stats.blocks * stats.bsize;
      const free = stats.bfree * stats.bsize;
      const used = total - free;

      const diskGB = {
        total: Math.round(total / 1024 / 1024 / 1024),
        free: Math.round(free / 1024 / 1024 / 1024),
        used: Math.round(used / 1024 / 1024 / 1024),
      };

      // Consider disk healthy if more than 10% free space
      const freePercentage = (free / total) * 100;
      if (freePercentage > 10) {
        healthCheck.checks.disk = 'healthy';
      } else if (freePercentage > 5) {
        healthCheck.checks.disk = 'warning';
      } else {
        healthCheck.checks.disk = 'unhealthy';
      }

      healthCheck.details.disk = {
        usage: diskGB,
        freePercentage: Math.round(freePercentage),
        status: healthCheck.checks.disk,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Disk space check might fail in serverless environments
      healthCheck.checks.disk = 'unknown';
      healthCheck.details.disk = {
        status: 'unknown',
        error: 'Disk check not available in this environment',
        timestamp: new Date().toISOString(),
      };
      logger.warn('Health check - Disk space check failed', error);
    }

    // Overall health status
    const allChecks = Object.values(healthCheck.checks);
    if (allChecks.every(check => check === 'healthy' || check === 'configured' || check === 'not_configured')) {
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
    logger.error('Health check - Critical failure', error);
  } finally {
    await prisma.$disconnect();
  }
}
