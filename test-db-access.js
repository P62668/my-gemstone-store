const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseAccess() {
  try {
    console.log('Testing database connection...');
    
    // Test connection by fetching admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin'
      }
    });
    
    console.log(`Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
    // Test fetching some gemstones
    const gemstones = await prisma.gemstone.findMany({
      take: 5,
      include: {
        category: true
      }
    });
    
    console.log(`\nFound ${gemstones.length} gemstone(s):`);
    gemstones.forEach(gem => {
      console.log(`- ${gem.name} (${gem.category?.name || 'No category'}) - $${gem.price}`);
    });
    
    console.log('\n✅ Database connection successful!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseAccess();