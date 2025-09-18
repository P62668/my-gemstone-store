#!/bin/bash

# Database Migration Script
# This script helps with migrating from SQLite to PostgreSQL for production

echo "🐘 Starting database migration process..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL before running this script"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set it in your .env.production file"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Extract database credentials from DATABASE_URL
DB_USER=$(echo $DATABASE_URL | cut -d'/' -f3 | cut -d':' -f1)
DB_PASS=$(echo $DATABASE_URL | cut -d'/' -f3 | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DATABASE_URL | cut -d'/' -f3 | cut -d'@' -f2 | cut -d':' -f1)
DB_PORT=$(echo $DATABASE_URL | cut -d'/' -f3 | cut -d':' -f3 | cut -d'/' -f1)
DB_NAME=$(echo $DATABASE_URL | cut -d'/' -f4 | cut -d'?' -f1)

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Test database connection
echo "Testing database connection..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your database credentials and ensure the database exists"
    exit 1
fi

# Generate Prisma client for PostgreSQL
echo "Generating Prisma client for PostgreSQL..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

# Seed database with initial data (if needed)
echo "Seeding database with initial data..."
node prisma/seed.js

if [ $? -eq 0 ]; then
    echo "✅ Database seeding completed successfully"
else
    echo "❌ Database seeding failed"
    exit 1
fi

echo "🎉 Database migration process completed!"
echo ""
echo "Next steps:"
echo "1. Verify the data in your PostgreSQL database"
echo "2. Test the application with the new database"
echo "3. Update any remaining configuration as needed"