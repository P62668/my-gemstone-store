#!/bin/bash

# Production Cleanup Script
# This script removes unnecessary development and test files for production deployment

echo "🧹 Starting production cleanup..."

# Remove markdown documentation files (except README.md)
find . -name "*.md" -not -name "README.md" -delete
echo "✅ Removed markdown documentation files"

# Remove test files
find . -name "*test*" -not -path "./node_modules/*" -not -path "./.git/*" -delete
echo "✅ Removed test files"

# Remove debug files
find . -name "*debug*" -delete
echo "✅ Removed debug files"

# Remove development scripts
find . -name "*dev*" -delete
echo "✅ Removed development scripts"

# Remove local environment files
rm -f .env.local
echo "✅ Removed local environment files"

# Remove log files
find . -name "*.log" -delete
echo "✅ Removed log files"

# Remove temporary files
find . -name "*.tmp" -delete
find . -name "*.temp" -delete
echo "✅ Removed temporary files"

# Remove cache directories
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Removed cache directories"

# Remove dist directory if it exists
rm -rf dist
echo "✅ Removed dist directory"

# Remove generated files directory
rm -rf generated
echo "✅ Removed generated files directory"

# Remove logs directory
rm -rf logs
echo "✅ Removed logs directory"

# Remove SQLite database files
find . -name "*.db" -delete
echo "✅ Removed SQLite database files"

echo "🎉 Production cleanup completed!"
echo "Next steps:"
echo "1. Configure your production environment variables in .env.production"
echo "2. Set up PostgreSQL database"
echo "3. Configure real Stripe API keys"
echo "4. Set up email service"
echo "5. Deploy to your production environment"