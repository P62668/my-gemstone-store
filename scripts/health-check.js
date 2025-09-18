#!/usr/bin/env node

/**
 * Production Health Check Script
 * Verifies all critical systems are operational
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  title: (msg) => console.log(`\\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

async function checkEnvironment() {
  log.title('🔧 Environment Check');
  
  const required = [
    'NODE_ENV',
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET'
  ];
  
  const recommended = [
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];
  
  let issues = 0;
  
  // Check required variables
  for (const variable of required) {
    if (process.env[variable]) {
      log.success(`${variable} is set`);
    } else {
      log.error(`${variable} is missing (required)`);
      issues++;
    }
  }
  
  // Check recommended variables
  for (const variable of recommended) {
    if (process.env[variable]) {
      log.success(`${variable} is set`);
    } else {
      log.warning(`${variable} is missing (recommended)`);
    }
  }
  
  // Check secret strength
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    log.warning('NEXTAUTH_SECRET should be at least 32 characters long');
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    log.warning('JWT_SECRET should be at least 32 characters long');
  }
  
  return issues === 0;
}

async function checkDatabase() {
  log.title('🗄️ Database Check');
  
  try {
    // Test connection
    await prisma.$connect();
    log.success('Database connection successful');
    
    // Check if tables exist
    const tableCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'`;
    const count = Array.isArray(tableCount) ? tableCount[0]?.count : tableCount?.count;
    
    if (count > 0) {
      log.success(`Database contains ${count} tables`);
    } else {
      log.error('Database appears to be empty');
      return false;
    }
    
    // Test basic operations
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const gemstoneCount = await prisma.gemstone.count();
    
    log.success(`Found ${userCount} users, ${categoryCount} categories, ${gemstoneCount} gemstones`);
    
    // Check for admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (adminUser) {
      log.success('Admin user exists');
    } else {
      log.warning('No admin user found');
    }
    
    return true;
  } catch (error) {
    log.error(`Database check failed: ${error.message}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkFilePermissions() {
  log.title('📁 File System Check');
  
  const paths = [
    './public',
    './public/images',
    './public/images/uploads',
    './.next',
    './node_modules'
  ];
  
  let issues = 0;
  
  for (const dir of paths) {
    try {
      if (fs.existsSync(dir)) {
        const stats = fs.statSync(dir);
        if (stats.isDirectory()) {
          log.success(`${dir} exists and is accessible`);
        } else {
          log.error(`${dir} exists but is not a directory`);
          issues++;
        }
      } else {
        if (dir === './.next') {
          log.warning(`${dir} does not exist (run 'npm run build' first)`);
        } else {
          log.error(`${dir} does not exist`);
          issues++;
        }
      }
    } catch (error) {
      log.error(`Cannot access ${dir}: ${error.message}`);
      issues++;
    }
  }
  
  return issues === 0;
}

async function checkDependencies() {
  log.title('📦 Dependencies Check');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    log.success('package.json is valid');
    
    // Check if node_modules exists
    if (fs.existsSync('./node_modules')) {
      log.success('node_modules directory exists');
    } else {
      log.error('node_modules directory missing (run npm install)');
      return false;
    }
    
    // Check critical dependencies
    const critical = ['next', 'react', 'prisma', '@prisma/client'];
    for (const dep of critical) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        log.success(`${dep} is listed in dependencies`);
      } else {
        log.error(`${dep} is missing from dependencies`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Dependencies check failed: ${error.message}`);
    return false;
  }
}

async function checkSecurity() {
  log.title('🔒 Security Check');
  
  let issues = 0;
  
  // Check for default passwords
  if (process.env.ADMIN_PASSWORD === 'admin123') {
    log.warning('Using default admin password (change in production)');
  }
  
  // Check for development secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXTAUTH_SECRET?.includes('dev') || 
        process.env.NEXTAUTH_SECRET?.includes('change')) {
      log.error('Using development NEXTAUTH_SECRET in production');
      issues++;
    }
    
    if (process.env.JWT_SECRET?.includes('dev') || 
        process.env.JWT_SECRET?.includes('change')) {
      log.error('Using development JWT_SECRET in production');
      issues++;
    }
  }
  
  // Check file permissions on sensitive files
  const sensitiveFiles = ['.env', '.env.production', '.env.local'];
  for (const file of sensitiveFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      if (mode !== '600' && mode !== '644') {
        log.warning(`${file} has permissive permissions (${mode})`);
      } else {
        log.success(`${file} has appropriate permissions`);
      }
    }
  }
  
  return issues === 0;
}

async function main() {
  console.log(`${colors.bold}${colors.blue}🏥 Health Check Report${colors.reset}`);
  console.log(`${colors.blue}Timestamp: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.blue}Environment: ${process.env.NODE_ENV || 'development'}${colors.reset}`);
  
  const checks = [
    { name: 'Environment', fn: checkEnvironment },
    { name: 'Database', fn: checkDatabase },
    { name: 'File System', fn: checkFilePermissions },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Security', fn: checkSecurity }
  ];
  
  const results = {};
  let overallHealth = true;
  
  for (const check of checks) {
    try {
      results[check.name] = await check.fn();
      overallHealth = overallHealth && results[check.name];
    } catch (error) {
      log.error(`${check.name} check failed: ${error.message}`);
      results[check.name] = false;
      overallHealth = false;
    }
  }
  
  // Summary
  log.title('📊 Health Check Summary');
  
  for (const [name, status] of Object.entries(results)) {
    if (status) {
      log.success(`${name}: HEALTHY`);
    } else {
      log.error(`${name}: ISSUES DETECTED`);
    }
  }
  
  console.log('\\n' + '='.repeat(50));
  if (overallHealth) {
    log.success(`${colors.bold}OVERALL STATUS: HEALTHY${colors.reset}`);
    process.exit(0);
  } else {
    log.error(`${colors.bold}OVERALL STATUS: ISSUES DETECTED${colors.reset}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\nHealth check interrupted');
  await prisma.$disconnect();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\\nHealth check terminated');
  await prisma.$disconnect();
  process.exit(1);
});

main().catch(async (error) => {
  log.error(`Health check failed: ${error.message}`);
  await prisma.$disconnect();
  process.exit(1);
});