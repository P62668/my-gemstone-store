/**
 * CommonJS version of the Prisma client for use in scripts
 */

const { PrismaClient } = require('@prisma/client');

const isProd = process.env.NODE_ENV === 'production';
const prismaOptions = {
  errorFormat: isProd ? 'minimal' : 'pretty',
  log: isProd 
    ? [{ level: 'error', emit: 'event' }, { level: 'warn', emit: 'event' }]
    : [{ level: 'query', emit: 'event' }, { level: 'info', emit: 'event' }, { level: 'warn', emit: 'event' }, { level: 'error', emit: 'event' }],
};

// Add connection URL parameters for production
if (isProd && process.env.DATABASE_URL) {
  // Only add parameters if they're not already in the URL
  const url = process.env.DATABASE_URL;
  const hasParams = url.includes('?');
  
  prismaOptions.datasources = {
    db: {
      url: url + 
        (hasParams ? '&' : '?') + 
        `connection_limit=10&pool_timeout=15`
    }
  };
}

// Create Prisma client with optimized settings
const prisma = new PrismaClient(prismaOptions);

// Attach error listeners
prisma.$on('warn', (e) => {
  console.warn('[prisma][warn]', e);
});

prisma.$on('error', (e) => {
  console.error('[prisma][error]', e);
});

module.exports = { prisma };