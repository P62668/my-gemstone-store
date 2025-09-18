#!/bin/bash

# Deployment Verification Script
# This script verifies that the application is properly configured for production

echo "🔍 Verifying production deployment..."

# Check if required environment variables are set
echo "Checking environment variables..."

REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "JWT_SECRET"
  "STRIPE_PUBLISHABLE_KEY"
  "STRIPE_SECRET_KEY"
  "EMAIL_HOST"
  "EMAIL_USER"
  "EMAIL_PASS"
  "ADMIN_EMAIL"
  "ADMIN_PASSWORD"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo "Please set these variables in your .env.production file"
  exit 1
else
  echo "✅ All required environment variables are set"
fi

# Check if DATABASE_URL is using PostgreSQL
if [[ $DATABASE_URL != postgresql://* ]]; then
  echo "❌ DATABASE_URL is not configured for PostgreSQL"
  echo "Current value: $DATABASE_URL"
  echo "Please update to use a PostgreSQL connection string"
  exit 1
else
  echo "✅ Database is configured for PostgreSQL"
fi

# Check if Stripe keys are live keys (not test keys)
if [[ $STRIPE_SECRET_KEY == sk_test_* ]]; then
  echo "⚠️  Warning: Using Stripe test keys. For production, use live keys."
fi

if [[ $STRIPE_PUBLISHABLE_KEY == pk_test_* ]]; then
  echo "⚠️  Warning: Using Stripe test publishable keys. For production, use live keys."
fi

# Check if secrets are properly secured
if [[ ${#NEXTAUTH_SECRET} -lt 32 ]]; then
  echo "❌ NEXTAUTH_SECRET is too short. It should be at least 32 characters."
  exit 1
fi

if [[ ${#JWT_SECRET} -lt 32 ]]; then
  echo "❌ JWT_SECRET is too short. It should be at least 32 characters."
  exit 1
fi

echo "✅ Security secrets are properly configured"

# Check if admin credentials are secure
if [[ $ADMIN_PASSWORD == "admin123" ]] || [[ $ADMIN_PASSWORD == "password" ]] || [[ $ADMIN_PASSWORD == "change-this" ]]; then
  echo "❌ Admin password is not secure. Please use a strong password."
  exit 1
fi

echo "✅ Admin credentials are secure"

# Check if email configuration is complete
if [[ $EMAIL_HOST == "smtp.gmail.com" ]] && [[ $EMAIL_USER == *"your-email"* ]]; then
  echo "⚠️  Warning: Email configuration appears to be using placeholder values."
fi

echo "✅ Email configuration is present"

echo "🎉 All checks passed! Your application is ready for production deployment."
echo ""
echo "Next steps:"
echo "1. Run the cleanup script: ./PRODUCTION_CLEANUP_SCRIPT.sh"
echo "2. Build the application: npm run build"
echo "3. Start the application: NODE_ENV=production npm run start:prod"
echo "4. Configure your web server (Nginx/Apache) to proxy requests to the application"
echo "5. Set up SSL certificate for your domain"