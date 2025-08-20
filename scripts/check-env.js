// Simple environment validation script for production
const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('In production these variables must be set. Aborting start.');
  process.exit(1);
}
console.log('Environment validation passed.');
