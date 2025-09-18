#!/bin/bash

# Production Startup Script
# This script prepares and starts the gemstone store in production mode

set -e

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

# Function to check if running as root
check_root() {
  if [ "$EUID" -eq 0 ]; then
    warning "Running as root. This is not recommended for security reasons."
  fi
}

# Function to check system resources
check_resources() {
  log "Checking system resources..."
  
  # Check available memory
  local mem_total=$(free -m | awk '/^Mem:/{print $2}')
  local mem_available=$(free -m | awk '/^Mem:/{print $7}')
  
  log "Total memory: ${mem_total}MB, Available: ${mem_available}MB"
  
  if [ "$mem_available" -lt 512 ]; then
    warning "Low available memory (${mem_available}MB). Performance may be affected."
  fi
  
  # Check disk space
  local disk_usage=$(df -h . | awk 'NR==2{print $5}' | sed 's/%//')
  local disk_available=$(df -h . | awk 'NR==2{print $4}')
  
  log "Disk usage: ${disk_usage}%, Available: ${disk_available}"
  
  if [ "$disk_usage" -gt 90 ]; then
    warning "High disk usage (${disk_usage}%). Cleanup may be needed."
  fi
  
  success "System resources check completed"
}

# Function to validate environment
validate_environment() {
  log "Validating environment..."
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    exit 1
  fi
  
  local node_version=$(node --version)
  log "Node.js version: $node_version"
  
  # Check if .env.production exists
  if [ ! -f ".env.production" ]; then
    warning ".env.production file not found. Using .env file instead."
    if [ ! -f ".env" ]; then
      error "No environment file found. Please create .env or .env.production"
      exit 1
    fi
  else
    export NODE_ENV=production
    set -a
    . ./.env.production
    set +a
    log "Loaded production environment variables"
  fi
  
  # Check required environment variables
  required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "JWT_SECRET")
  missing_vars=()
  
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -ne 0 ]; then
    error "Missing required environment variables: ${missing_vars[*]}"
    exit 1
  fi
  
  # Validate database connection
  log "Testing database connection..."
  npx prisma validate || warning "Database validation failed. Continuing anyway."
  
  success "Environment validation passed"
}

# Function to prepare the application
prepare_application() {
  log "Preparing application..."
  
  # Create necessary directories
  mkdir -p logs
  mkdir -p public/images/uploads
  
  # Set proper permissions
  chmod 755 public/images/uploads
  
  # Clean previous builds
  rm -rf .next
  
  # Install production dependencies
  log "Installing production dependencies..."
  npm ci --only=production
  
  # Generate Prisma client
  log "Generating Prisma client..."
  npx prisma generate
  
  # Run database migrations
  log "Running database migrations..."
  npx prisma migrate deploy
  
  success "Application prepared successfully"
}

# Function to build the application
build_application() {
  log "Building application..."
  
  # Build Next.js application
  npm run build
  
  success "Application built successfully"
}

# Function to start the application
start_application() {
  log "Starting application..."
  
  # Check if PM2 is available
  if command -v pm2 &> /dev/null; then
    log "Using PM2 to start application"
    
    # Check if app is already running
    if pm2 list | grep -q "gemstone-store"; then
      pm2 reload gemstone-store
      log "Application reloaded with PM2"
    else
      pm2 start ecosystem.config.js --env production
      log "Application started with PM2"
    fi
    
    # Save PM2 configuration
    pm2 save
  else
    log "PM2 not found, starting application directly"
    
    # Start application in background
    npm run start:prod &
    
    # Save the process ID
    echo $! > .app.pid
    log "Application started with PID $(cat .app.pid)"
  fi
  
  success "Application started"
}

# Function to verify the application is running
verify_application() {
  log "Verifying application status..."
  
  # Wait a moment for the application to start
  sleep 10
  
  # Check if the application is responding
  local max_attempts=30
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
      success "Application is responding correctly"
      return 0
    fi
    
    log "Attempt $attempt/$max_attempts: Application not responding yet, waiting..."
    sleep 5
    attempt=$((attempt + 1))
  done
  
  error "Application failed to start or respond after $max_attempts attempts"
  exit 1
}

# Function to show status
show_status() {
  log "Application Status:"
  
  if command -v pm2 &> /dev/null; then
    pm2 list | grep gemstone-store || echo "Application not found in PM2"
  else
    if [ -f ".app.pid" ]; then
      local pid=$(cat .app.pid)
      if ps -p $pid > /dev/null; then
        echo "Application running with PID $pid"
      else
        echo "Application PID file exists but process is not running"
      fi
    else
      echo "Application is not running"
    fi
  fi
}

# Show usage
usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  start     Start the application (default)"
  echo "  prepare   Prepare the application (install deps, migrate, build)"
  echo "  status    Show application status"
  echo "  help      Show this help message"
  echo ""
  echo "This script will:"
  echo "  1. Validate the environment"
  echo "  2. Prepare the application (dependencies, migrations)"
  echo "  3. Build the application"
  echo "  4. Start the application"
  echo "  5. Verify it's running correctly"
}

# Main function
main() {
  check_root
  check_resources
  validate_environment
  prepare_application
  build_application
  start_application
  verify_application
  
  success "Production startup completed successfully!"
  log "Application should now be accessible on port 3000"
}

# Parse arguments
case "${1:-start}" in
  start)
    main
    ;;
  prepare)
    check_root
    validate_environment
    prepare_application
    build_application
    ;;
  status)
    show_status
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