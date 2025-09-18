#!/bin/bash

# Gemstone Store Stop Script

# Kill any processes running the standalone server
pids=$(pgrep -f "node .next/standalone/server.js")

if [ -z "$pids" ]; then
    echo "Application is not running"
    exit 1
fi

echo "Stopping the Gemstone Store application..."
kill -9 $pids

echo "Application stopped successfully"