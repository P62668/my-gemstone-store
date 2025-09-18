// Ensure deterministic prisma generate behavior across environments
const { execSync } = require('child_process');

try {
  const isProd = process.env.NODE_ENV === 'production';
  const schemaArg = '--schema=prisma/schema.prisma';
  if (isProd) {
    console.log('[scripts/prisma-generate] production environment detected, running: npx prisma generate --no-engine ' + schemaArg);
    execSync(`npx prisma generate --no-engine ${schemaArg}`, { stdio: 'inherit' });
  } else {
    console.log('[scripts/prisma-generate] development/test environment detected, running: npx prisma generate ' + schemaArg);
    execSync(`npx prisma generate ${schemaArg}`, { stdio: 'inherit' });
  }
} catch (err) {
  console.error('[scripts/prisma-generate] prisma generate failed:', err);
  process.exit(1);
}
