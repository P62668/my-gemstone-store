const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['info', 'warn', 'error'] });

prisma.$on('info', (e) => console.log('[prisma][info]', e.message));
prisma.$on('warn', (e) => console.warn('[prisma][warn]', e.message));
prisma.$on('error', (e) => console.error('[prisma][error]', e.message));

(async () => {
  try {
    console.log('Attempting prisma.$connect()');
    await prisma.$connect();
    console.log('Connected. Running test query');
    const res = await prisma.category.findMany({ take: 1 });
    console.log('Query result:', res);
  } catch (err) {
    console.error('Error during prisma test:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
