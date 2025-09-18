#!/bin/bash

# Gemstone Store Startup Script

# Check if the application is already running
if pgrep -f "node .next/standalone/server.js" > /dev/null; then
    echo "Application is already running"
    exit 1
fi

# Kill any processes on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null

# Build the application if .next directory doesn't exist
if [ ! -d ".next" ]; then
    echo "Building the application..."
    npm run build
fi

# Start the application
echo "Starting the Gemstone Store application..."
node .next/standalone/server.js