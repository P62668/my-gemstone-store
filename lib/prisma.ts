// Force Prisma to use the library/native engine in local/dev environments
// Override any .env value to avoid wasm/daemon fallbacks that fail in this environment.
if (typeof process !== 'undefined') {
  process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
  process.env.PRISMA_FORCE_NAPI = '1';
}

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

// Attach runtime listeners to surface engine errors in server logs
prisma.$on('warn', (e) => {
  // Lightweight warning - keep concise
  // eslint-disable-next-line no-console
  console.warn('[prisma][warn]', e);
});
prisma.$on('info', (e) => {
  // eslint-disable-next-line no-console
  console.info('[prisma][info]', e);
});
prisma.$on('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('[prisma][error]', e);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
