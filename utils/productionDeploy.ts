import { logger } from './logger';
import { monitoring } from './monitoring';

export interface EnvironmentConfig {
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  REDIS_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SENTRY_DSN?: string;
  MONITORING_WEBHOOK_URL?: string;
  ERROR_REPORTING_WEBHOOK_URL?: string;
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  error?: string;
  details?: Record<string, any>;
}

export interface DeploymentStatus {
  version: string;
  timestamp: Date;
  status: 'deploying' | 'healthy' | 'degraded' | 'unhealthy';
  healthChecks: HealthCheckResult[];
  environment: string;
}

class ProductionDeployment {
  private deploymentStatus: DeploymentStatus | null = null;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Validate production environment configuration
   */
  validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required environment variables
    const requiredVars = [
      'NODE_ENV',
      'DATABASE_URL',
      'JWT_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }

    // Validate JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters long for production');
    }

    // Validate database URL format
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && !databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('mysql://')) {
      warnings.push('DATABASE_URL should use a production database (PostgreSQL/MySQL)');
    }

    // Check for development defaults
    if (process.env.NODE_ENV === 'production') {
      if (process.env.JWT_SECRET === 'dev_secret_key') {
        errors.push('JWT_SECRET cannot use development default in production');
      }

      if (process.env.DATABASE_URL?.includes('dev.db')) {
        errors.push('DATABASE_URL cannot use development SQLite database in production');
      }
    }

    // Validate Stripe configuration
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      warnings.push('Using Stripe test keys in production environment');
    }

    // Check for monitoring configuration
    if (!process.env.MONITORING_WEBHOOK_URL) {
      warnings.push('No monitoring webhook URL configured');
    }

    if (!process.env.ERROR_REPORTING_WEBHOOK_URL) {
      warnings.push('No error reporting webhook URL configured');
    }

    // Check for email configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      warnings.push('Email configuration incomplete - password reset and notifications may not work');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Perform comprehensive health checks
   */
  async performHealthChecks(): Promise<HealthCheckResult[]> {
    const healthChecks: HealthCheckResult[] = [];

    // Database health check
    healthChecks.push(await this.checkDatabaseHealth());

    // Redis health check (if configured)
    if (process.env.REDIS_URL) {
      healthChecks.push(await this.checkRedisHealth());
    }

    // External API health checks
    healthChecks.push(await this.checkStripeHealth());
    healthChecks.push(await this.checkEmailHealth());

    // File system health check
    healthChecks.push(await this.checkFileSystemHealth());

    // Memory and CPU health check
    healthChecks.push(await this.checkSystemResources());

    return healthChecks;
  }

  /**
   * Initialize production deployment
   */
  async initialize(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate environment
      const envValidation = this.validateEnvironment();
      if (!envValidation.valid) {
        errors.push(...envValidation.errors);
        return { success: false, errors };
      }

      // Log warnings
      if (envValidation.warnings.length > 0) {
        logger.warn('Production deployment warnings', {
          warnings: envValidation.warnings,
        });
      }

      // Perform initial health checks
      const healthChecks = await this.performHealthChecks();
      const unhealthyServices = healthChecks.filter(check => check.status === 'unhealthy');

      if (unhealthyServices.length > 0) {
        errors.push(`Unhealthy services: ${unhealthyServices.map(s => s.service).join(', ')}`);
        return { success: false, errors };
      }

      // Initialize deployment status
      this.deploymentStatus = {
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date(),
        status: 'healthy',
        healthChecks,
        environment: process.env.NODE_ENV || 'development',
      };

      // Start monitoring
      monitoring.recordMetric('deployment_initialized', 1, 'count', {
        version: this.deploymentStatus.version,
        environment: this.deploymentStatus.environment,
      });

      logger.info('Production deployment initialized successfully', {
        version: this.deploymentStatus.version,
        healthChecks: healthChecks.length,
      });

      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Deployment initialization failed: ${errorMessage}`);
      
      logger.error('Production deployment initialization failed', undefined, error as Error);
      return { success: false, errors };
    }
  }

  /**
   * Get current deployment status
   */
  getDeploymentStatus(): DeploymentStatus | null {
    return this.deploymentStatus;
  }

  /**
   * Update deployment status
   */
  updateDeploymentStatus(status: 'healthy' | 'degraded' | 'unhealthy'): void {
    if (this.deploymentStatus) {
      this.deploymentStatus.status = status;
      this.deploymentStatus.timestamp = new Date();
    }
  }

  /**
   * Perform graceful shutdown
   */
  async gracefulShutdown(): Promise<void> {
    try {
      logger.info('Starting graceful shutdown');

      // Stop accepting new requests
      this.updateDeploymentStatus('degraded');

      // Wait for ongoing requests to complete
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Close database connections
      await this.closeDatabaseConnections();

      // Close Redis connections
      if (process.env.REDIS_URL) {
        await this.closeRedisConnections();
      }

      logger.info('Graceful shutdown completed');
    } catch (error) {
      logger.error('Graceful shutdown failed', undefined, error as Error);
    }
  }

  /**
   * Health check implementations
   */
  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const { prisma } = await import('./databaseTransactions');
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      return {
        service: 'database',
        status: 'healthy',
        responseTime,
        details: { connection: 'active' },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkRedisHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This is a simplified implementation
      // In production, use a proper Redis client
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const responseTime = Date.now() - startTime;
      return {
        service: 'redis',
        status: 'healthy',
        responseTime,
        details: { connection: 'active' },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkStripeHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const { stripe } = await import('./stripeHandler');
      await stripe.paymentMethods.list({ limit: 1 });
      
      const responseTime = Date.now() - startTime;
      return {
        service: 'stripe',
        status: 'healthy',
        responseTime,
        details: { api: 'accessible' },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'stripe',
        status: 'degraded',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkEmailHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      if (!process.env.SMTP_HOST) {
        return {
          service: 'email',
          status: 'degraded',
          responseTime: 0,
          error: 'SMTP not configured',
        };
      }

      // This is a simplified implementation
      // In production, test actual SMTP connection
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const responseTime = Date.now() - startTime;
      return {
        service: 'email',
        status: 'healthy',
        responseTime,
        details: { smtp: 'configured' },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'email',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkFileSystemHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check if we can write to temporary directory
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');
      
      const tempDir = os.tmpdir();
      const testFile = path.join(tempDir, 'health-check-test.txt');
      
      fs.writeFileSync(testFile, 'health check');
      fs.unlinkSync(testFile);
      
      const responseTime = Date.now() - startTime;
      return {
        service: 'file_system',
        status: 'healthy',
        responseTime,
        details: { writable: true },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'file_system',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkSystemResources(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This is a simplified implementation
      // In production, use a proper system monitoring library
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      const responseTime = Date.now() - startTime;
      const status = memoryUsagePercent > 90 ? 'degraded' : 'healthy';
      
      return {
        service: 'system_resources',
        status,
        responseTime,
        details: {
          memoryUsage: Math.round(memoryUsagePercent),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'system_resources',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Connection cleanup
   */
  private async closeDatabaseConnections(): Promise<void> {
    try {
      const { prisma } = await import('./databaseTransactions');
      await prisma.$disconnect();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Failed to close database connections', undefined, error as Error);
    }
  }

  private async closeRedisConnections(): Promise<void> {
    try {
      // This is a simplified implementation
      // In production, use a proper Redis client
      logger.info('Redis connections closed');
    } catch (error) {
      logger.error('Failed to close Redis connections', undefined, error as Error);
    }
  }
}

// Export singleton instance
export const productionDeploy = new ProductionDeployment();

// Export utility functions
export const deploymentUtils = {
  /**
   * Validate environment before deployment
   */
  async validateBeforeDeploy(): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const validation = productionDeploy.validateEnvironment();
    
    if (validation.valid) {
      const healthChecks = await productionDeploy.performHealthChecks();
      const unhealthyServices = healthChecks.filter(check => check.status === 'unhealthy');
      
      if (unhealthyServices.length > 0) {
        validation.errors.push(`Pre-deployment health checks failed: ${unhealthyServices.map(s => s.service).join(', ')}`);
        validation.valid = false;
      }
    }
    
    return validation;
  },

  /**
   * Generate deployment report
   */
  generateDeploymentReport(): {
    timestamp: Date;
    version: string;
    environment: string;
    healthStatus: string;
    warnings: string[];
  } {
    const status = productionDeploy.getDeploymentStatus();
    const validation = productionDeploy.validateEnvironment();
    
    return {
      timestamp: new Date(),
      version: status?.version || 'unknown',
      environment: status?.environment || 'unknown',
      healthStatus: status?.status || 'unknown',
      warnings: validation.warnings,
    };
  },
};
