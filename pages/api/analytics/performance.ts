import { NextApiRequest, NextApiResponse } from 'next';
import { performanceMiddleware } from '../../../utils/performanceMiddleware';
import { logger } from '../../../utils/logger';

interface PerformanceMetrics {
  pageLoadTime?: number;
  domContentLoadedTime?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  userAgent?: string;
  screen?: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timestamp: string;
}

// In-memory storage for performance metrics (in production, you'd use a database)
const performanceMetricsStorage: PerformanceMetrics[] = [];

/**
 * API endpoint for collecting client-side performance metrics
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const metrics: PerformanceMetrics = req.body;
        
        // Validate required fields
        if (!metrics.timestamp) {
          return res.status(400).json({ 
            success: false, 
            error: 'Timestamp is required' 
          });
        }
        
        // Store metrics
        performanceMetricsStorage.push({
          ...metrics,
          timestamp: new Date().toISOString(),
        });
        
        // Keep only last 1000 metrics in memory
        if (performanceMetricsStorage.length > 1000) {
          performanceMetricsStorage.shift();
        }
        
        // Log the metrics
        logger.info('Client performance metrics received', {
          metrics: {
            pageLoadTime: metrics.pageLoadTime,
            firstContentfulPaint: metrics.firstContentfulPaint,
            largestContentfulPaint: metrics.largestContentfulPaint,
          },
          userAgent: metrics.userAgent,
        });
        
        res.status(200).json({ 
          success: true, 
          message: 'Performance metrics recorded successfully' 
        });
      } catch (error) {
        logger.error('Error recording performance metrics', error as Error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to record performance metrics' 
        });
      }
      break;

    case 'GET':
      try {
        // Return recent performance metrics
        const recentMetrics = performanceMetricsStorage.slice(-50); // Last 50 metrics
        
        res.status(200).json({ 
          success: true, 
          data: recentMetrics,
          count: recentMetrics.length
        });
      } catch (error) {
        logger.error('Error fetching performance metrics', error as Error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch performance metrics' 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default performanceMiddleware(handler);