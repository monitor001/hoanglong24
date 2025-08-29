#!/bin/bash

echo "🔄 Restarting development server..."

# Kill any existing processes on port 3000
echo "📋 Killing existing processes on port 3000..."
pkill -f "react-scripts start" || true
pkill -f "node.*3000" || true

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Clear node_modules and reinstall
echo "📦 Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Start development server
echo "🚀 Starting development server..."
npm start
