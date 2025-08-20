#!/bin/bash

# Shankarmala Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on any error

echo "🚀 Starting Shankarmala Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please create one from env.production.example"
    print_status "Copying env.production.example to .env..."
    cp env.production.example .env
    print_warning "Please update .env with your production configuration before continuing."
    exit 1
fi

# Check required environment variables
print_status "Checking environment variables..."

REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_success "Environment variables check passed"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache
print_success "Cleanup completed"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy
print_success "Database migrations completed"

# Build the application
print_status "Building application for production..."
npm run build
print_success "Application built successfully"

# Run type checking
print_status "Running TypeScript type checking..."
npm run type-check
print_success "Type checking passed"

# Run linting
print_status "Running ESLint..."
npm run lint
print_success "Linting passed"

# Check for security vulnerabilities
print_status "Checking for security vulnerabilities..."
npm audit --audit-level=high || {
    print_warning "Security vulnerabilities found. Please review and fix them."
    print_status "You can run 'npm audit fix' to automatically fix some issues."
}

# Create production start script
print_status "Creating production start script..."
cat > start-production.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=${PORT:-3000}
npm start
EOF

chmod +x start-production.sh
print_success "Production start script created"

# Create PM2 ecosystem file (if PM2 is preferred)
print_status "Creating PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'shankarmala',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs
print_success "PM2 ecosystem file created"

# Create health check script
print_status "Creating health check script..."
cat > health-check.sh << 'EOF'
#!/bin/bash
# Health check script for the application

HEALTH_URL="http://localhost:3000/api/health"
MAX_RETRIES=5
RETRY_DELAY=2

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        echo "✅ Application is healthy"
        exit 0
    else
        echo "❌ Health check failed (attempt $i/$MAX_RETRIES)"
        if [ $i -lt $MAX_RETRIES ]; then
            sleep $RETRY_DELAY
        fi
    fi
done

echo "❌ Application health check failed after $MAX_RETRIES attempts"
exit 1
EOF

chmod +x health-check.sh
print_success "Health check script created"

# Create deployment summary
print_status "Creating deployment summary..."
cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary

**Deployment Date:** $(date)
**Node.js Version:** $(node --version)
**NPM Version:** $(npm --version)
**Build Status:** ✅ Successful

## Environment
- **NODE_ENV:** production
- **Database:** Configured
- **Authentication:** Configured
- **Stripe:** Configured (if applicable)

## Files Created
- \`start-production.sh\` - Production start script
- \`ecosystem.config.js\` - PM2 configuration
- \`health-check.sh\` - Health check script
- \`logs/\` - Log directory

## Next Steps
1. Start the application: \`./start-production.sh\`
2. Or use PM2: \`pm2 start ecosystem.config.js\`
3. Run health check: \`./health-check.sh\`
4. Monitor logs: \`tail -f logs/combined.log\`

## Monitoring
- Application logs: \`logs/combined.log\`
- Error logs: \`logs/err.log\`
- Output logs: \`logs/out.log\`

## Rollback
If you need to rollback, use your previous deployment or git tag.
EOF

print_success "Deployment summary created"

# Final checks
print_status "Running final checks..."

# Check if build artifacts exist
if [ ! -d ".next" ]; then
    print_error "Build artifacts not found. Build may have failed."
    exit 1
fi

# Check if Prisma client exists
if [ ! -d "node_modules/.prisma" ]; then
    print_error "Prisma client not found. Generation may have failed."
    exit 1
fi

print_success "All checks passed"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Start the application: ./start-production.sh"
echo "  2. Check health: ./health-check.sh"
echo "  3. Monitor logs: tail -f logs/combined.log"
echo ""
echo "📖 See DEPLOYMENT_SUMMARY.md for detailed information"
echo ""
echo "🔗 Application will be available at: $NEXTAUTH_URL"
echo ""
