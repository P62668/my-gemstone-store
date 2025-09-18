#!/bin/bash

# Production Deployment Script
# This script handles the complete deployment process for the gemstone store

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

warning() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
  warning "Running as root. This is not recommended for security reasons."
fi

# Function to check dependencies
check_dependencies() {
  log "Checking dependencies..."
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    exit 1
  fi
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    error "npm is not installed"
    exit 1
  fi
  
  # Check Docker (optional)
  if ! command -v docker &> /dev/null; then
    warning "Docker is not installed. Container deployment will not be available."
  fi
  
  success "Dependencies checked successfully"
}

# Function to validate environment
validate_environment() {
  log "Validating environment..."
  
  # Check if .env.production exists
  if [ ! -f ".env.production" ]; then
    error ".env.production file not found. Please create it with production environment variables."
    exit 1
  fi
  
  # Check required environment variables
  required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "JWT_SECRET")
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      error "Required environment variable $var is not set"
      exit 1
    fi
  done
  
  success "Environment validation passed"
}

# Function to backup current deployment
backup_current() {
  log "Creating backup of current deployment..."
  
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local backup_dir="backups/$timestamp"
  
  mkdir -p "$backup_dir"
  
  # Backup important files
  if [ -d ".next" ]; then
    cp -r .next "$backup_dir/" 2>/dev/null || true
  fi
  
  if [ -f "package-lock.json" ]; then
    cp package-lock.json "$backup_dir/"
  fi
  
  if [ -d "prisma/migrations" ]; then
    cp -r prisma/migrations "$backup_dir/" 2>/dev/null || true
  fi
  
  success "Backup created at $backup_dir"
}

# Function to install dependencies
install_dependencies() {
  log "Installing production dependencies..."
  
  # Clean install for production
  npm ci --only=production
  
  success "Dependencies installed successfully"
}

# Function to run database migrations
run_migrations() {
  log "Running database migrations..."
  
  # Generate Prisma client
  npx prisma generate
  
  # Run migrations
  npx prisma migrate deploy
  
  success "Database migrations completed"
}

# Function to build the application
build_application() {
  log "Building application..."
  
  # Clean previous builds
  rm -rf .next
  
  # Build for production
  npm run build
  
  success "Application built successfully"
}

# Function to start the application
start_application() {
  log "Starting application..."
  
  # Use PM2 if available, otherwise use npm
  if command -v pm2 &> /dev/null; then
    log "Using PM2 to start application"
    pm2 start ecosystem.config.js --env production
  else
    log "Starting application with npm (no PM2 available)"
    npm run start:prod &
  fi
  
  success "Application started"
}

# Function to run health checks
run_health_checks() {
  log "Running health checks..."
  
  # Wait a moment for the application to start
  sleep 5
  
  # Run health check script
  if [ -f "scripts/health-check.js" ]; then
    node scripts/health-check.js
  else
    # Basic health check
    curl -f http://localhost:3000/api/health || warning "Health check endpoint not responding"
  fi
  
  success "Health checks completed"
}

# Function to cleanup
cleanup() {
  log "Cleaning up..."
  
  # Remove temporary files
  rm -rf node_modules/.cache
  
  success "Cleanup completed"
}

# Main deployment function
deploy() {
  log "Starting production deployment..."
  
  # Record start time
  local start_time=$(date +%s)
  
  # Execute deployment steps
  check_dependencies
  validate_environment
  backup_current
  install_dependencies
  run_migrations
  build_application
  start_application
  run_health_checks
  cleanup
  
  # Record end time
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  
  success "Production deployment completed in $duration seconds"
  log "Application should now be running on port 3000"
}

# Rollback function
rollback() {
  log "Rolling back to previous version..."
  
  # Implementation would depend on backup strategy
  error "Rollback functionality not yet implemented"
  exit 1
}

# Show usage
usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  deploy    Deploy the application (default)"
  echo "  rollback  Rollback to previous version"
  echo "  help      Show this help message"
  echo ""
  echo "Environment variables required:"
  echo "  DATABASE_URL      - Database connection string"
  echo "  NEXTAUTH_SECRET   - NextAuth secret key"
  echo "  JWT_SECRET        - JWT secret key"
}

# Parse arguments
case "${1:-deploy}" in
  deploy)
    deploy
    ;;
  rollback)
    rollback
    ;;
  help)
    usage
    ;;
  *)
    error "Unknown command: $1"
    usage
    exit 1
    ;;
esac