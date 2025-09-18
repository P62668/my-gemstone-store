#!/usr/bin/env node

/**
 * Production Prisma setup script
 * 
 * This script handles Prisma client generation and database connection verification
 * for production environments. It ensures the database is properly configured
 * before the application starts.
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.blue}Starting Prisma production setup...${colors.reset}`);

// Verify environment variables
if (!process.env.DATABASE_URL) {
  console.error(`${colors.red}ERROR: DATABASE_URL environment variable is not set${colors.reset}`);
  process.exit(1);
}

// Generate Prisma client
try {
  console.log(`${colors.cyan}Generating Prisma client...${colors.reset}`);
  execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit' });
  console.log(`${colors.green}Prisma client generated successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to generate Prisma client:${colors.reset}`, error.message);
  process.exit(1);
}

// Test database connection
async function testDatabaseConnection() {
  console.log(`${colors.cyan}Testing database connection...${colors.reset}`);
  const prisma = new PrismaClient();
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log(`${colors.green}Database connection successful${colors.reset}`);
    
    // Check for pending migrations
    try {
      const output = execSync('npx prisma migrate status --schema=prisma/schema.prisma').toString();
      if (output.includes('have not been applied')) {
        console.warn(`${colors.yellow}WARNING: There are pending migrations that have not been applied${colors.reset}`);
        console.warn(`${colors.yellow}Run 'npx prisma migrate deploy' to apply them${colors.reset}`);
      } else {
        console.log(`${colors.green}Database schema is up to date${colors.reset}`);
      }
    } catch (migrationError) {
      console.warn(`${colors.yellow}Could not check migration status:${colors.reset}`, migrationError.message);
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error(`${colors.red}Database connection failed:${colors.reset}`, error.message);
    await prisma.$disconnect();
    return false;
  }
}

// Run the setup
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log(`${colors.green}Prisma production setup completed successfully${colors.reset}`);
      process.exit(0);
    } else {
      console.error(`${colors.red}Prisma production setup failed${colors.reset}`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`${colors.red}Unexpected error during setup:${colors.reset}`, error.message);
    process.exit(1);
  });