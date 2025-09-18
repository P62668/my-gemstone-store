import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

// Global declaration to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with logging configuration
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as any : ['error'] as any,
};

// Create or reuse Prisma client instance
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In standalone build, we need to ensure the Prisma client is properly initialized
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaOptions);
  }
  prisma = global.prisma;
}

// Export as both default and named
export default prisma;
export { prisma };

// Add connection management for production
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && prisma) {
  // Handle graceful shutdown to close DB connections properly
  const handleShutdown = async () => {
    console.log('[prisma] Shutting down Prisma client');
    await prisma.$disconnect();
    process.exit(0);
  };
  
  // Listen for termination signals
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

// Ensure the Prisma client connects properly on initialization
if (typeof window === 'undefined' && prisma) {
  prisma.$connect().catch((error) => {
    console.error('[prisma] Failed to connect to database on initialization', error);
  });
}

export const CACHE_STRATEGIES = {
  // For data that rarely changes (e.g., categories, settings)
  LONG_TERM: {
    ttl: 3600 // 1 hour in seconds
  },
  
  // For data that changes occasionally (e.g., products, collections)
  STANDARD: {
    swr: 300 // 5 minutes in seconds
  },
  
  // For frequently changing data with background refresh
  DYNAMIC: {
    swr: 30 // 30 seconds
  }
};