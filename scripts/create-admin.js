import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
      console.log('Password: admin123');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
    
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
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', adminUser.id);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
