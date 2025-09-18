// Simple logger without external dependencies
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Safe getter for request properties
const safeGet = (obj: any, path: string, defaultValue: any = 'unknown') => {
  try {
    if (!obj) return defaultValue;
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return current[key];
      }
      return defaultValue;
    }, obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Create log entry with complete error handling
const createLogEntry = (level: string, message: string, context?: any) => {
  const logData: any = {
    message: String(message || 'Unknown message'),
    timestamp: new Date().toISOString(),
    level: String(level || 'info')
  };

  if (context) {
    try {
      // Safely extract common request properties
      if (typeof context === 'object') {
        logData.url = safeGet(context, 'url');
        logData.method = safeGet(context, 'method');
        logData.userAgent = safeGet(context, 'userAgent');
        logData.ip = safeGet(context, 'ip');
        
        // Add any additional context properties safely
        Object.keys(context).forEach(key => {
          if (!['url', 'method', 'userAgent', 'ip'].includes(key)) {
            try {
              logData[key] = context[key];
            } catch {
              logData[key] = 'undefined';
            }
          }
        });
      }
    } catch (error) {
      logData.contextError = 'Failed to process context';
    }
  }

  return logData;
};

// Format log message with complete error handling
const formatLog = (logEntry: any) => {
  try {
    const { timestamp, level, message, ...rest } = logEntry;
    const contextStr = Object.keys(rest).length > 0 ? ` | Context: ${JSON.stringify(rest)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  } catch (error) {
    return `[${new Date().toISOString()}] ERROR: Failed to format log message`;
  }
};

// Optional integrations (lazy-init)
let prismaClient: any = null;
let integrationsInitialized = false;

// Removed dynamic import to prevent middleware issues
function initIntegrations() {
  // Only initialize integrations on the server side
  if (typeof window !== 'undefined' || integrationsInitialized) {
    return;
  }
  
  integrationsInitialized = true;
  
  // initialize Prisma client for security logs
  try {
    // Removed dynamic import to prevent middleware issues
    // const { PrismaClient } = await import('@prisma/client');
    // prismaClient = new PrismaClient();
    prismaClient = null; // Disable Prisma integration in logger
  } catch (err) {
    console.warn('[logger] Prisma client init failed for security logs');
    prismaClient = null;
  }
}

// Logger class with complete error handling
class Logger {
  private shouldLog(level: string): boolean {
    try {
      const currentLevel = LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS] || 2;
      const messageLevel = LOG_LEVELS[level as keyof typeof LOG_LEVELS] || 2;
      return messageLevel <= currentLevel;
    } catch {
      return true; // Default to logging if level check fails
    }
  }

  info(message: string, context?: any) {
    if (typeof window === 'undefined') {
      initIntegrations();
    }
    if (!this.shouldLog('info')) return;
    
    try {
      const logEntry = createLogEntry('info', message, context);
      console.log(formatLog(logEntry));
    } catch (error) {
      console.log(`[${new Date().toISOString()}] INFO: ${String(message)}`);
    }
  }

  warn(message: string, context?: any) {
    if (typeof window === 'undefined') {
      initIntegrations();
    }
    if (!this.shouldLog('warn')) return;
    
    try {
      const logEntry = createLogEntry('warn', message, context);
      console.warn(formatLog(logEntry));
    } catch (error) {
      console.warn(`[${new Date().toISOString()}] WARN: ${String(message)}`);
    }
  }

  error(message: string, error?: any, context?: any) {
    if (typeof window === 'undefined') {
      initIntegrations();
    }
    if (!this.shouldLog('error')) return;
    
    try {
      const logEntry = createLogEntry('error', message, context);
      
      if (error) {
        logEntry.error = {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        };
      }
      
      console.error(formatLog(logEntry));
    } catch (logError) {
      console.error(`[${new Date().toISOString()}] ERROR: ${String(message)}`);
      if (error) {
        console.error('Original error:', error);
      }
    }
  }

  debug(message: string, context?: any) {
    if (!this.shouldLog('debug')) return;
    
    try {
      const logEntry = createLogEntry('debug', message, context);
      console.debug(formatLog(logEntry));
    } catch (error) {
      console.debug(`[${new Date().toISOString()}] DEBUG: ${String(message)}`);
    }
  }
  
  // Log security events to database
  async security(event: string, details: any = {}) {
    // Only run on server side
    if (typeof window !== 'undefined') return;
    
    try {
      await initIntegrations();
      if (!prismaClient) return;
      
      // Extract user ID if available
      const userId = details.userId || (details.user?.id ? parseInt(details.user.id) : undefined);
      
      // Create security log entry
      await prismaClient.securityLog.create({
        data: {
          event,
          userId,
          ip: details.ip || null,
          userAgent: details.userAgent || null,
          details: details.details ? JSON.stringify(details.details) : null,
          timestamp: new Date()
        }
      });
    } catch (error) {
      // Don't let security logging failures break the application
      console.error('Failed to log security event:', error);
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Legacy logger for backward compatibility with complete error handling
const legacyLogger = {
  info: (message: string, req?: any) => {
    try {
      const context = req ? {
        url: safeGet(req, 'url'),
        method: safeGet(req, 'method'),
        userAgent: safeGet(req, 'headers.user-agent'),
        ip: safeGet(req, 'headers.x-forwarded-for') || safeGet(req, 'socket.remoteAddress')
      } : undefined;
      logger.info(message, context);
    } catch (error) {
      logger.info(message);
    }
  },

  warn: (message: string, req?: any) => {
    try {
      const context = req ? {
        url: safeGet(req, 'url'),
        method: safeGet(req, 'method'),
        userAgent: safeGet(req, 'headers.user-agent'),
        ip: safeGet(req, 'headers.x-forwarded-for') || safeGet(req, 'socket.remoteAddress')
      } : undefined;
      logger.warn(message, context);
    } catch (error) {
      logger.warn(message);
    }
  },

  error: (message: string, req?: any, error?: any) => {
    try {
      const context = req ? {
        url: safeGet(req, 'url'),
        method: safeGet(req, 'method'),
        userAgent: safeGet(req, 'headers.user-agent'),
        ip: safeGet(req, 'headers.x-forwarded-for') || safeGet(req, 'socket.remoteAddress')
      } : undefined;
      logger.error(message, error, context);
    } catch (logError) {
      logger.error(message, error);
    }
  }
};

export { logger, legacyLogger };