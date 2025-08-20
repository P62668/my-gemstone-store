#!/bin/bash

# 🚀 Shankarmala Gemstone Store - Quick Start Script
# This script helps you get the application running quickly

echo "🌟 Welcome to Shankarmala Gemstone Store!"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up database..."
npx prisma generate
npx prisma migrate deploy

echo "🌱 Seeding database with sample data..."
npm run prisma:seed

echo "🏗️ Building the application..."
npm run build

echo "🚀 Starting the development server..."
echo ""
echo "✅ Your Shankarmala Gemstone Store is now running!"
echo "🌐 Open http://localhost:3000 in your browser"
echo "🔧 Admin panel: http://localhost:3000/admin"
echo ""
echo "📝 Next steps:"
echo "1. Set up your environment variables in .env.local"
echo "2. Configure your database connection"
echo "3. Set up Stripe for payments"
echo "4. Deploy to production using the deployment guide"
echo ""

npm run dev
