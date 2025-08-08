#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment...');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  No .env file found. Please create one with your production environment variables.');
  console.log('📝 Copy env.production.example to .env and update the values.');
  process.exit(1);
}

// Check if DATABASE_URL is set
const envContent = fs.readFileSync('.env', 'utf8');
if (!envContent.includes('DATABASE_URL=')) {
  console.log('❌ DATABASE_URL not found in .env file');
  console.log('📝 Please add your production database URL to .env file');
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🗄️  Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('🌱 Seeding database...');
  execSync('npm run prisma:seed', { stdio: 'inherit' });

  console.log('🏗️  Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Production deployment completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Start the server: npm run server');
  console.log('2. Or use: npm start');
  console.log('3. Make sure all environment variables are set correctly');
  console.log('4. Test all functionality');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 