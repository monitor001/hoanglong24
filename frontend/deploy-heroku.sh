#!/bin/bash

# 🚀 Heroku Deployment Script for MiniCDE Frontend
# Usage: ./deploy-heroku.sh [app-name]

set -e  # Exit on any error

echo "🚀 Starting Heroku deployment..."

# Check if app name is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide Heroku app name"
    echo "Usage: ./deploy-heroku.sh your-app-name"
    exit 1
fi

APP_NAME=$1

echo "📦 Building production version..."
npm run build

echo "🔍 Checking build status..."
if [ ! -d "build" ]; then
    echo "❌ Error: Build directory not found"
    exit 1
fi

echo "📁 Build directory size:"
du -sh build/

echo "🔧 Adding build files to git..."
git add build/
git add .

echo "📝 Committing changes..."
git commit -m "Deploy frontend to Heroku - $(date)"

echo "🚀 Deploying to Heroku..."
git push heroku main

echo "✅ Deployment completed!"
echo "🌐 Your app is available at: https://$APP_NAME.herokuapp.com"

echo "📊 Checking deployment status..."
heroku logs --tail --num 10

echo "🎉 Deployment successful!" 