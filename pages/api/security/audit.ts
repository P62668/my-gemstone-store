import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { logger } from '../../../utils/logger';
import { prisma } from '../../../lib/prisma';

// Security audit log entry
interface SecurityLogEntry {
  id: number;
  timestamp: string;
  event: string;
  userId?: number;
  ip?: string;
  userAgent?: string;
  details?: string;
}

// Get security audit logs
const getAuditLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { page = '1', limit = '50', search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-100)' });
    }
    
    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { event: { contains: search as string, mode: 'insensitive' } },
        { ip: { contains: search as string, mode: 'insensitive' } },
        { details: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    // Get total count
    const totalCount = await prisma.securityLog.count({ where });
    
    // Get logs with pagination
    const logs = await prisma.securityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    });
    
    // Format logs for response
    const formattedLogs: SecurityLogEntry[] = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      event: log.event,
      userId: log.userId || undefined,
      ip: log.ip || undefined,
      userAgent: log.userAgent || undefined,
      details: log.details || undefined
    }));
    
    res.status(200).json({
      logs: formattedLogs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum * limitNum < totalCount,
        hasPrevious: pageNum > 1
      }
    });
  } catch (error) {
    logger.error('Failed to fetch security audit logs', error, req);
    res.status(500).json({ error: 'Failed to fetch security audit logs' });
  }
};

// Clear security audit logs (with confirmation)
const clearAuditLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({ error: 'Confirmation required to clear logs' });
    }
    
    // Only allow clearing if confirmed
    if (confirm !== 'CLEAR_ALL_LOGS') {
      return res.status(400).json({ error: 'Invalid confirmation code' });
    }
    
    const deletedCount = await prisma.securityLog.deleteMany({});
    
    logger.info('Security audit logs cleared', {
      deletedCount: deletedCount.count,
      userId: (req as any).user?.id,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
    
    res.status(200).json({ 
      message: `Successfully cleared ${deletedCount.count} security audit logs`,
      deletedCount: deletedCount.count
    });
  } catch (error) {
    logger.error('Failed to clear security audit logs', error, req);
    res.status(500).json({ error: 'Failed to clear security audit logs' });
  }
};

// Get security statistics
const getSecurityStats = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get recent logs for statistics
    const recentLogs = await prisma.securityLog.findMany({
      where: {
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    
    // Calculate statistics
    const totalLogs = recentLogs.length;
    const eventTypes: Record<string, number> = {};
    const ipAddresses: Record<string, number> = {};
    
    // Count event types and IP addresses
    recentLogs.forEach(log => {
      // Count event types
      eventTypes[log.event] = (eventTypes[log.event] || 0) + 1;
      
      // Count IP addresses (if available)
      if (log.ip) {
        ipAddresses[log.ip] = (ipAddresses[log.ip] || 0) + 1;
      }
    });
    
    // Get top 10 most frequent events
    const topEvents = Object.entries(eventTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));
    
    // Get top 10 most frequent IPs
    const topIPs = Object.entries(ipAddresses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
    
    res.status(200).json({
      statistics: {
        totalLogs,
        dateRange: {
          start: thirtyDaysAgo.toISOString(),
          end: new Date().toISOString()
        },
        topEvents,
        topIPs
      }
    });
  } catch (error) {
    logger.error('Failed to fetch security statistics', error, req);
    res.status(500).json({ error: 'Failed to fetch security statistics' });
  }
};

// Main handler
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS?.split(',') || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  switch (req.method) {
    case 'GET':
      if (req.query.stats === 'true') {
        return await getSecurityStats(req, res);
      }
      return await getAuditLogs(req, res);
      
    case 'POST':
      return await clearAuditLogs(req, res);
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
};

export default withAdminAuth(handler);