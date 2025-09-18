import { NextApiRequest, NextApiResponse } from 'next';
import { monitoring } from './monitoring';
import { logger } from './logger';

/**
 * Performance monitoring middleware for API routes
 * Tracks response times, errors, and other performance metrics
 */
export function performanceMiddleware(handler: Function) {
  return async function(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();
    const requestId = `${req.method}-${req.url}-${Date.now()}`;
    
    // Log request start
    logger.info(`API Request Started: ${req.method} ${req.url}`, {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    // Track original response methods
    const originalJson = res.json;
    const originalEnd = res.end;
    const originalStatus = res.status;

    // Override response methods to add monitoring
    let responseSent = false;
    
    res.json = function(body: any) {
      if (!responseSent) {
        responseSent = true;
        const duration = Date.now() - startTime;
        
        // Record API response time
        monitoring.recordApiResponseTime(
          req.url || 'unknown',
          req.method || 'unknown',
          duration,
          res.statusCode
        );
        
        // Log response
        logger.info(`API Request Completed: ${req.method} ${req.url}`, {
          requestId,
          statusCode: res.statusCode,
          duration,
          responseSize: JSON.stringify(body).length,
        });
      }
      return originalJson.call(this, body);
    };

    res.end = function(chunk?: any) {
      if (!responseSent) {
        responseSent = true;
        const duration = Date.now() - startTime;
        
        // Record API response time
        monitoring.recordApiResponseTime(
          req.url || 'unknown',
          req.method || 'unknown',
          duration,
          res.statusCode
        );
        
        // Log response
        logger.info(`API Request Completed: ${req.method} ${req.url}`, {
          requestId,
          statusCode: res.statusCode,
          duration,
          responseSize: chunk ? chunk.length : 0,
        });
      }
      return originalEnd.call(this, chunk);
    };

    // Error handling
    try {
      return await handler(req, res);
    } catch (error) {
      if (!responseSent) {
        responseSent = true;
        const duration = Date.now() - startTime;
        
        // Record error
        monitoring.recordError(
          error as Error,
          { 
            endpoint: req.url,
            method: req.method,
            requestId 
          },
          undefined,
          requestId,
          req.url,
          req.headers['user-agent'],
          req.headers['x-forwarded-for'] as string || req.socket.remoteAddress as string
        );
        
        // Log error
        logger.error(`API Request Failed: ${req.method} ${req.url}`, error as Error, {
          requestId,
          duration,
        });
      }
      
      // If no response was sent, send error response
      if (!res.writableEnded) {
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error',
          requestId 
        });
      }
      
      throw error;
    }
  };
}

/**
 * Database query performance monitoring
 */
export function withDatabaseMonitoring<T>(queryName: string, table: string, queryFn: () => Promise<T>): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Record database query performance
      monitoring.recordDatabaseQuery(queryName, table, duration);
      
      // Log slow queries
      if (duration > 1000) { // Log queries taking more than 1 second
        logger.warn(`Slow database query detected: ${queryName}`, {
          table,
          duration,
          query: queryName,
        });
      }
      
      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record database query error
      monitoring.recordDatabaseQuery(queryName, table, duration);
      monitoring.recordError(error as Error, { 
        query: queryName,
        table,
        duration 
      });
      
      logger.error(`Database query failed: ${queryName}`, error as Error, {
        table,
        duration,
      });
      
      reject(error);
    }
  });
}

/**
 * Performance monitoring decorator for API route handlers
 */
export function withPerformanceMonitoring(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const [req, res] = args;
    const startTime = Date.now();
    
    // Call original method
    const result = originalMethod.apply(this, args);
    
    // Handle async methods
    if (result instanceof Promise) {
      return result.then((resolvedResult) => {
        const duration = Date.now() - startTime;
        monitoring.recordApiResponseTime(
          req.url || 'unknown',
          req.method || 'unknown',
          duration,
          res.statusCode
        );
        return resolvedResult;
      }).catch((error) => {
        const duration = Date.now() - startTime;
        monitoring.recordApiResponseTime(
          req.url || 'unknown',
          req.method || 'unknown',
          duration,
          500
        );
        monitoring.recordError(error, { 
          endpoint: req.url,
          method: req.method 
        });
        throw error;
      });
    } else {
      // Handle sync methods
      const duration = Date.now() - startTime;
      monitoring.recordApiResponseTime(
        req.url || 'unknown',
        req.method || 'unknown',
        duration,
        res.statusCode
      );
      return result;
    }
  };
  
  return descriptor;
}