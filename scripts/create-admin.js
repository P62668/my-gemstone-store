import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@shankarmala.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@shankarmala.com');
      console.log('If you need to reset the password, set ADMIN_PASSWORD and rerun this script.');
      return;
    }
    
    // Determine password
    let adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_PASSWORD is required in production. Set ADMIN_PASSWORD in your environment before running this script.');
      }
      // Generate a secure random password for local development
      adminPassword = crypto.randomBytes(12).toString('base64').replace(/\W/g, '').slice(0, 16);
      console.log('⚠️ No ADMIN_PASSWORD provided — generating a secure temporary password for development.');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@shankarmala.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'admin',
        active: true
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@shankarmala.com');
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔑 Temporary password (development only):', adminPassword);
      console.log('Please set ADMIN_PASSWORD in your environment to a secure value to avoid a generated password on next run.');
    } else {
      console.log('🔐 Admin user created in production. Do not forget to securely store the ADMIN_PASSWORD you provided.');
    }
    console.log('🆔 User ID:', adminUser.id);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
