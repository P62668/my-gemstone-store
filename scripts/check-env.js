// Comprehensive environment validation script for production
require('dotenv').config({ path: ['.env.local', '.env'] });

const isProd = process.env.NODE_ENV === 'production';

// Core required variables for all environments
const required = ['DATABASE_URL'];

// Additional variables required in production
const prodRequired = [
  'NEXTAUTH_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM'
];

// Check for auth secrets
const hasAuthSecret = Boolean(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);

// Check for required variables
const missing = required.filter((k) => !process.env[k]);

// Check for production-specific variables
const missingProd = isProd ? prodRequired.filter((k) => !process.env[k]) : [];

// Check for default example values that need to be replaced
const defaultValues = {
  STRIPE_SECRET_KEY: 'sk_test_your_stripe_secret_key',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_publishable_key',
  STRIPE_WEBHOOK_SECRET: 'whsec_your_stripe_webhook_secret',
  NEXTAUTH_URL: 'https://yourdomain.com',
  NEXTAUTH_SECRET: 'your-super-secret-key-here-minimum-32-characters',
  JWT_SECRET: 'your-jwt-secret-key-here-minimum-32-characters'
};

const usingDefaults = Object.entries(defaultValues)
  .filter(([key, value]) => process.env[key] === value)
  .map(([key]) => key);

// Log all issues
if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('These variables must be set in all environments. Aborting start.');
  process.exit(1);
}

if (!hasAuthSecret) {
  console.error('Missing authentication secret. Set NEXTAUTH_SECRET or JWT_SECRET in your environment.');
  process.exit(1);
}

if (isProd && missingProd.length > 0) {
  console.error('Missing production environment variables:', missingProd.join(', '));
  console.error('These variables must be set in production. Aborting start.');
  process.exit(1);
}

if (isProd && usingDefaults.length > 0) {
  console.error('Using default example values for:', usingDefaults.join(', '));
  console.error('These values must be replaced with real values in production. Aborting start.');
  process.exit(1);
}

if (!isProd && usingDefaults.length > 0) {
  console.warn('Warning: Using default example values for:', usingDefaults.join(', '));
  console.warn('These should be replaced with real values in production.');
}

console.log(`Environment validation passed for ${isProd ? 'production' : 'development'} environment.`);
