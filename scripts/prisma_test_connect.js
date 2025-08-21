// Quick Prisma connectivity test
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    console.log('Prisma client created. Attempting simple query...');
    const res = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log('sqlite_master tables:', res);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Prisma connectivity error:', err);
    process.exit(1);
  }
})();
