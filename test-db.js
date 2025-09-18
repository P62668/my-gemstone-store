const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    const gemstones = await prisma.gemstone.findMany({
      take: 1
    });
    console.log('Database connection successful');
    console.log('Found gemstones:', gemstones.length);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();