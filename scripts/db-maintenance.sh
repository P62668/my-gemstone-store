#!/bin/bash

# Database Maintenance Script
# This script handles database backups, cleanup, and maintenance tasks

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

# Create backups directory
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Function to create database backup
backup() {
  log "Creating database backup..."
  
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local backup_file="$BACKUP_DIR/db_backup_$timestamp.sql"
  local db_type="unknown"
  
  # Determine database type from DATABASE_URL
  if [[ "$DATABASE_URL" == *"sqlite"* ]]; then
    db_type="sqlite"
  elif [[ "$DATABASE_URL" == *"postgresql"* ]]; then
    db_type="postgresql"
  elif [[ "$DATABASE_URL" == *"mysql"* ]]; then
    db_type="mysql"
  fi
  
  case $db_type in
    sqlite)
      # SQLite backup
      local db_file=$(echo $DATABASE_URL | sed 's/sqlite://')
      if [ -f "$db_file" ]; then
        cp "$db_file" "$backup_file"
        success "SQLite database backed up to $backup_file"
      else
        error "Database file not found: $db_file"
        exit 1
      fi
      ;;
    postgresql)
      # PostgreSQL backup
      pg_dump "$DATABASE_URL" > "$backup_file"
      success "PostgreSQL database backed up to $backup_file"
      ;;
    mysql)
      # MySQL backup
      mysqldump "$DATABASE_URL" > "$backup_file"
      success "MySQL database backed up to $backup_file"
      ;;
    *)
      error "Unsupported database type or DATABASE_URL not set"
      exit 1
      ;;
  esac
  
  # Compress the backup
  gzip "$backup_file"
  success "Backup compressed to $backup_file.gz"
}

# Function to cleanup old backups
cleanup() {
  log "Cleaning up old backups..."
  
  local keep_days=${1:-30}  # Default to 30 days
  local cutoff_date=$(date -d "$keep_days days ago" +%s)
  
  # Find and remove old backups
  find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f | while read backup_file; do
    local file_date=$(stat -f %B "$backup_file" 2>/dev/null || stat -c %Y "$backup_file")
    if [ "$file_date" -lt "$cutoff_date" ]; then
      rm "$backup_file"
      log "Removed old backup: $backup_file"
    fi
  done
  
  success "Backup cleanup completed (kept last $keep_days days)"
}

# Function to restore database from backup
restore() {
  local backup_file=$1
  
  if [ -z "$backup_file" ]; then
    error "Please specify a backup file to restore"
    exit 1
  fi
  
  if [ ! -f "$backup_file" ]; then
    error "Backup file not found: $backup_file"
    exit 1
  fi
  
  log "Restoring database from $backup_file..."
  
  # Stop the application first
  if command -v pm2 &> /dev/null && pm2 list | grep -q "gemstone-store"; then
    pm2 stop gemstone-store
    log "Application stopped for restore"
  fi
  
  local db_type="unknown"
  
  # Determine database type from DATABASE_URL
  if [[ "$DATABASE_URL" == *"sqlite"* ]]; then
    db_type="sqlite"
  elif [[ "$DATABASE_URL" == *"postgresql"* ]]; then
    db_type="postgresql"
  elif [[ "$DATABASE_URL" == *"mysql"* ]]; then
    db_type="mysql"
  fi
  
  case $db_type in
    sqlite)
      # SQLite restore
      local db_file=$(echo $DATABASE_URL | sed 's/sqlite://')
      gunzip -c "$backup_file" > "$db_file"
      success "SQLite database restored from $backup_file"
      ;;
    postgresql)
      # PostgreSQL restore
      gunzip -c "$backup_file" | psql "$DATABASE_URL"
      success "PostgreSQL database restored from $backup_file"
      ;;
    mysql)
      # MySQL restore
      gunzip -c "$backup_file" | mysql "$DATABASE_URL"
      success "MySQL database restored from $backup_file"
      ;;
    *)
      error "Unsupported database type or DATABASE_URL not set"
      exit 1
      ;;
  esac
  
  # Start the application
  if command -v pm2 &> /dev/null && pm2 list | grep -q "gemstone-store"; then
    pm2 start gemstone-store
    log "Application started after restore"
  fi
  
  success "Database restore completed"
}

# Function to optimize database
optimize() {
  log "Optimizing database..."
  
  local db_type="unknown"
  
  # Determine database type from DATABASE_URL
  if [[ "$DATABASE_URL" == *"sqlite"* ]]; then
    db_type="sqlite"
  elif [[ "$DATABASE_URL" == *"postgresql"* ]]; then
    db_type="postgresql"
  elif [[ "$DATABASE_URL" == *"mysql"* ]]; then
    db_type="mysql"
  fi
  
  case $db_type in
    sqlite)
      # SQLite optimization
      local db_file=$(echo $DATABASE_URL | sed 's/sqlite://')
      if [ -f "$db_file" ]; then
        sqlite3 "$db_file" "VACUUM;"
        sqlite3 "$db_file" "ANALYZE;"
        success "SQLite database optimized"
      else
        error "Database file not found: $db_file"
        exit 1
      fi
      ;;
    postgresql)
      # PostgreSQL optimization
      psql "$DATABASE_URL" -c "VACUUM ANALYZE;"
      success "PostgreSQL database optimized"
      ;;
    mysql)
      # MySQL optimization
      mysql "$DATABASE_URL" -e "OPTIMIZE TABLE *;"
      success "MySQL database optimized"
      ;;
    *)
      error "Unsupported database type or DATABASE_URL not set"
      exit 1
      ;;
  esac
}

# Function to show backup list
list_backups() {
  log "Available backups:"
  ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null || echo "No backups found"
}

# Show usage
usage() {
  echo "Usage: $0 [COMMAND] [OPTIONS]"
  echo ""
  echo "Commands:"
  echo "  backup          Create a new database backup"
  echo "  cleanup [days]  Cleanup backups older than specified days (default: 30)"
  echo "  restore FILE    Restore database from specified backup file"
  echo "  optimize        Optimize database performance"
  echo "  list            List available backups"
  echo ""
  echo "Examples:"
  echo "  $0 backup"
  echo "  $0 cleanup 7"
  echo "  $0 restore backups/db_backup_20231201_120000.sql.gz"
}

# Parse arguments
case "$1" in
  backup)
    backup
    ;;
  cleanup)
    cleanup "$2"
    ;;
  restore)
    restore "$2"
    ;;
  optimize)
    optimize
    ;;
  list)
    list_backups
    ;;
  help)
    usage
    ;;
  *)
    usage
    ;;
esac