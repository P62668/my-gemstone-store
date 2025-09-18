#!/bin/bash

# Production Management Script
# This script provides management functions for the gemstone store in production

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

# Check if PM2 is installed
check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Please install it with: npm install -g pm2"
    exit 1
  fi
}

# Start the application
start() {
  log "Starting gemstone store application..."
  
  check_pm2
  
  if pm2 list | grep -q "gemstone-store"; then
    pm2 start gemstone-store
    success "Application started"
  else
    pm2 start ecosystem.config.js
    success "Application started with ecosystem configuration"
  fi
}

# Stop the application
stop() {
  log "Stopping gemstone store application..."
  
  check_pm2
  
  if pm2 list | grep -q "gemstone-store"; then
    pm2 stop gemstone-store
    success "Application stopped"
  else
    warning "Application is not running"
  fi
}

# Restart the application
restart() {
  log "Restarting gemstone store application..."
  
  check_pm2
  
  if pm2 list | grep -q "gemstone-store"; then
    pm2 restart gemstone-store
    success "Application restarted"
  else
    pm2 start ecosystem.config.js
    success "Application started with ecosystem configuration"
  fi
}

# Reload the application (graceful restart)
reload() {
  log "Reloading gemstone store application..."
  
  check_pm2
  
  if pm2 list | grep -q "gemstone-store"; then
    pm2 reload gemstone-store
    success "Application reloaded"
  else
    pm2 start ecosystem.config.js
    success "Application started with ecosystem configuration"
  fi
}

# Show application status
status() {
  check_pm2
  pm2 list
}

# Show application logs
logs() {
  check_pm2
  
  if [ "$2" = "error" ]; then
    pm2 logs gemstone-store --err
  elif [ "$2" = "out" ]; then
    pm2 logs gemstone-store --out
  else
    pm2 logs gemstone-store
  fi
}

# Show application metrics
metrics() {
  check_pm2
  pm2 monit
}

# Backup database
backup_db() {
  log "Creating database backup..."
  
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local backup_file="backups/db_backup_$timestamp.sql"
  
  mkdir -p backups
  
  # Check if using SQLite or PostgreSQL
  if [[ "$DATABASE_URL" == *"sqlite"* ]]; then
    # SQLite backup
    local db_file=$(echo $DATABASE_URL | sed 's/sqlite://')
    if [ -f "$db_file" ]; then
      cp "$db_file" "$backup_file"
      success "SQLite database backed up to $backup_file"
    else
      error "Database file not found: $db_file"
      exit 1
    fi
  elif [[ "$DATABASE_URL" == *"postgresql"* ]]; then
    # PostgreSQL backup
    pg_dump $DATABASE_URL > "$backup_file"
    success "PostgreSQL database backed up to $backup_file"
  else
    error "Unsupported database type in DATABASE_URL"
    exit 1
  fi
}

# Run database migrations
migrate() {
  log "Running database migrations..."
  
  npx prisma migrate deploy
  success "Database migrations completed"
}

# Seed database
seed() {
  log "Seeding database..."
  
  npx prisma db seed
  success "Database seeding completed"
}

# Run health checks
health() {
  log "Running health checks..."
  
  if [ -f "scripts/health-check.js" ]; then
    node scripts/health-check.js
  else
    curl -f http://localhost:3000/api/health || warning "Health check endpoint not responding"
  fi
}

# Show system information
info() {
  log "System Information:"
  echo "  Node.js version: $(node --version)"
  echo "  npm version: $(npm --version)"
  
  if command -v pm2 &> /dev/null; then
    echo "  PM2 version: $(pm2 --version)"
  fi
  
  if command -v docker &> /dev/null; then
    echo "  Docker version: $(docker --version)"
  fi
  
  echo "  Current directory: $(pwd)"
  echo "  Environment: ${NODE_ENV:-development}"
}

# Show usage
usage() {
  echo "Usage: $0 [COMMAND]"
  echo ""
  echo "Commands:"
  echo "  start     Start the application"
  echo "  stop      Stop the application"
  echo "  restart   Restart the application"
  echo "  reload    Reload the application (graceful restart)"
  echo "  status    Show application status"
  echo "  logs      Show application logs"
  echo "  metrics   Show application metrics"
  echo "  backup    Create database backup"
  echo "  migrate   Run database migrations"
  echo "  seed      Seed database"
  echo "  health    Run health checks"
  echo "  info      Show system information"
  echo ""
  echo "Log commands:"
  echo "  logs      Show all logs"
  echo "  logs err  Show error logs"
  echo "  logs out  Show output logs"
}

# Parse arguments
case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    restart
    ;;
  reload)
    reload
    ;;
  status)
    status
    ;;
  logs)
    logs "$1" "$2"
    ;;
  metrics)
    metrics
    ;;
  backup)
    backup_db
    ;;
  migrate)
    migrate
    ;;
  seed)
    seed
    ;;
  health)
    health
    ;;
  info)
    info
    ;;
  help)
    usage
    ;;
  *)
    usage
    ;;
esac