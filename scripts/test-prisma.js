const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient();

(async () => {
  try {
    await p.$connect();
    console.log('Prisma connected');
    const count = await p.homepageSection.count();
    console.log('homepageSection count:', count);
    await p.$disconnect();
  } catch (e) {
    console.error('Prisma error:');
    console.error(e);
    process.exitCode = 1;
  }
})();
