import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

export interface ErrorReport {
  error: Error;
  context?: Record<string, any>;
  userId?: number;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  timestamp: Date;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  timestamp: Date;
}

class MonitoringSystem {
  private metrics: PerformanceMetric[] = [];
  private errorReports: ErrorReport[] = [];
  private healthChecks: HealthCheck[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.startPeriodicTasks();
  }

  /**
   * Record performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      tags: tags || {},
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log metric
    logger.info('Performance metric recorded', {
      metric: name,
      value,
      tags,
    });

    // Send to external monitoring service in production
    if (this.isProduction) {
      this.sendMetricToExternalService(metric);
    }
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number
  ): void {
    this.recordMetric('api_response_time', responseTime, 'ms', {
      endpoint,
      method,
      status_code: statusCode.toString(),
    });
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(
    query: string,
    table: string,
    duration: number,
    rowsAffected?: number
  ): void {
    this.recordMetric('database_query_time', duration, 'ms', {
      query: query.substring(0, 50), // Truncate long queries
      table,
      rows_affected: rowsAffected ? rowsAffected.toString() : '',
    });
  }

  /**
   * Record error for monitoring
   */
  recordError(
    error: Error,
    context?: Record<string, any>,
    userId?: number,
    sessionId?: string,
    url?: string,
    userAgent?: string,
    ip?: string
  ): void {
    const errorReport: ErrorReport = {
      error,
      context,
      userId,
      sessionId,
      url,
      userAgent,
      ip,
      timestamp: new Date(),
    };

    this.errorReports.push(errorReport);

    // Keep only last 500 error reports in memory
    if (this.errorReports.length > 500) {
      this.errorReports = this.errorReports.slice(-500);
    }

    // Log error
    logger.error('Error recorded for monitoring', error, {
      context,
      tags: context?.tags || {},
      ip,
    });

    // Send to external error reporting service in production
    if (this.isProduction) {
      this.sendErrorToExternalService(errorReport);
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck(service: string): Promise<HealthCheck> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let error: string | undefined;

    try {
      switch (service) {
        case 'database':
          await this.checkDatabaseHealth();
          break;
        case 'redis':
          await this.checkRedisHealth();
          break;
        case 'external_api':
          await this.checkExternalApiHealth();
          break;
        case 'file_system':
          await this.checkFileSystemHealth();
          break;
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (err) {
      status = 'unhealthy';
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    const responseTime = Date.now() - startTime;
    const healthCheck: HealthCheck = {
      service,
      status,
      responseTime,
      error,
      timestamp: new Date(),
    };

    this.healthChecks.push(healthCheck);

    // Keep only last 100 health checks in memory
    if (this.healthChecks.length > 100) {
      this.healthChecks = this.healthChecks.slice(-100);
    }

    return healthCheck;
  }

  /**
   * Record system metrics
   */
  recordSystemMetrics(): void {
    // This is a simplified implementation
    // In production, use a proper system monitoring library
    const systemMetric: SystemMetrics = {
      cpu: Math.random() * 100, // Simulated CPU usage
      memory: Math.random() * 100, // Simulated memory usage
      disk: Math.random() * 100, // Simulated disk usage
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
      },
      timestamp: new Date(),
    };

    this.systemMetrics.push(systemMetric);

    // Keep only last 100 system metrics in memory
    if (this.systemMetrics.length > 100) {
      this.systemMetrics = this.systemMetrics.slice(-100);
    }

    // Send to external monitoring service in production
    if (this.isProduction) {
      this.sendSystemMetricsToExternalService(systemMetric);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(
    filters?: {
      name?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics];

    if (filters?.name) {
      filteredMetrics = filteredMetrics.filter(m => m.name === filters.name);
    }

    if (filters?.startDate) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= filters.endDate!);
    }

    if (filters?.limit) {
      filteredMetrics = filteredMetrics.slice(-filters.limit);
    }

    return filteredMetrics;
  }

  /**
   * Get error reports
   */
  getErrorReports(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): ErrorReport[] {
    let filteredReports = [...this.errorReports];

    if (filters?.startDate) {
      filteredReports = filteredReports.filter(r => r.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredReports = filteredReports.filter(r => r.timestamp <= filters.endDate!);
    }

    if (filters?.limit) {
      filteredReports = filteredReports.slice(-filters.limit);
    }

    return filteredReports;
  }

  /**
   * Get health check status
   */
  getHealthStatus(): { overall: string; services: HealthCheck[] } {
    const recentChecks = this.healthChecks.filter(
      check => Date.now() - check.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const unhealthyServices = recentChecks.filter(check => check.status === 'unhealthy');
    const degradedServices = recentChecks.filter(check => check.status === 'degraded');

    let overall: string = 'healthy';
    if (unhealthyServices.length > 0) {
      overall = 'unhealthy';
    } else if (degradedServices.length > 0) {
      overall = 'degraded';
    }

    return {
      overall,
      services: recentChecks,
    };
  }

  /**
   * Get system metrics summary
   */
  getSystemMetricsSummary(): {
    avgCpu: number;
    avgMemory: number;
    avgDisk: number;
    totalNetworkIn: number;
    totalNetworkOut: number;
  } {
    if (this.systemMetrics.length === 0) {
      return {
        avgCpu: 0,
        avgMemory: 0,
        avgDisk: 0,
        totalNetworkIn: 0,
        totalNetworkOut: 0,
      };
    }

    const recentMetrics = this.systemMetrics.filter(
      metric => Date.now() - metric.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );

    const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpu, 0) / recentMetrics.length;
    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memory, 0) / recentMetrics.length;
    const avgDisk = recentMetrics.reduce((sum, m) => sum + m.disk, 0) / recentMetrics.length;
    const totalNetworkIn = recentMetrics.reduce((sum, m) => sum + m.network.bytesIn, 0);
    const totalNetworkOut = recentMetrics.reduce((sum, m) => sum + m.network.bytesOut, 0);

    return {
      avgCpu,
      avgMemory,
      avgDisk,
      totalNetworkIn,
      totalNetworkOut,
    };
  }

  /**
   * Start periodic monitoring tasks
   */
  private startPeriodicTasks(): void {
    // Record system metrics every 5 minutes
    setInterval(() => {
      this.recordSystemMetrics();
    }, 5 * 60 * 1000);

    // Perform health checks every 2 minutes
    setInterval(async () => {
      await this.performHealthCheck('database');
      await this.performHealthCheck('file_system');
    }, 2 * 60 * 1000);

    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  /**
   * Clean up old monitoring data
   */
  private cleanupOldData(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    this.metrics = this.metrics.filter(m => m.timestamp > oneDayAgo);
    this.errorReports = this.errorReports.filter(r => r.timestamp > oneDayAgo);
    this.healthChecks = this.healthChecks.filter(h => h.timestamp > oneDayAgo);
    this.systemMetrics = this.systemMetrics.filter(s => s.timestamp > oneDayAgo);
  }

  /**
   * Health check implementations
   */
  private async checkDatabaseHealth(): Promise<void> {
    try {
      const { prisma } = await import('./databaseTransactions');
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      throw new Error('Database connection failed');
    }
  }

  private async checkRedisHealth(): Promise<void> {
    // Implement Redis health check
    // For now, just simulate a check
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async checkExternalApiHealth(): Promise<void> {
    // Implement external API health check
    // For now, just simulate a check
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async checkFileSystemHealth(): Promise<void> {
    // Implement file system health check
    // For now, just simulate a check
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Send metrics to external monitoring service
   */
  private async sendMetricToExternalService(metric: PerformanceMetric): Promise<void> {
    try {
      if (process.env.MONITORING_WEBHOOK_URL) {
        await fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'metric',
            data: metric,
          }),
        });
      }
    } catch (error) {
      logger.error('Failed to send metric to external service', undefined, error as Error);
    }
  }

  /**
   * Send error to external error reporting service
   */
  private async sendErrorToExternalService(errorReport: ErrorReport): Promise<void> {
    try {
      if (process.env.ERROR_REPORTING_WEBHOOK_URL) {
        await fetch(process.env.ERROR_REPORTING_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'error',
            data: {
              message: errorReport.error.message,
              stack: errorReport.error.stack,
              context: errorReport.context,
              userId: errorReport.userId,
              sessionId: errorReport.sessionId,
              url: errorReport.url,
              userAgent: errorReport.userAgent,
              ip: errorReport.ip,
              timestamp: errorReport.timestamp,
            },
          }),
        });
      }
    } catch (error) {
      logger.error('Failed to send error to external service', undefined, error as Error);
    }
  }

  /**
   * Send system metrics to external monitoring service
   */
  private async sendSystemMetricsToExternalService(metrics: SystemMetrics): Promise<void> {
    try {
      if (process.env.MONITORING_WEBHOOK_URL) {
        await fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'system_metrics',
            data: metrics,
          }),
        });
      }
    } catch (error) {
      logger.error('Failed to send system metrics to external service', undefined, error as Error);
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringSystem();

// Export utility functions
export const monitoringUtils = {
  /**
   * Performance monitoring decorator
   */
  withPerformanceMonitoring<T extends (...args: any[]) => any>(
    fn: T,
    metricName: string
  ): T {
    return ((...args: any[]) => {
      const startTime = Date.now();
      
      try {
        const result = fn(...args);
        
        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = Date.now() - startTime;
            monitoring.recordMetric(metricName, duration);
          });
        } else {
          const duration = Date.now() - startTime;
          monitoring.recordMetric(metricName, duration);
          return result;
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        monitoring.recordMetric(metricName, duration);
        throw error;
      }
    }) as T;
  },

  /**
   * Error monitoring decorator
   */
  withErrorMonitoring<T extends (...args: any[]) => any>(
    fn: T,
    context?: Record<string, any>
  ): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);
        
        if (result instanceof Promise) {
          return result.catch((error: Error) => {
            monitoring.recordError(error, context);
            throw error;
          });
        } else {
          return result;
        }
      } catch (error) {
        monitoring.recordError(error as Error, context);
        throw error;
      }
    }) as T;
  },
};
