#!/bin/bash

# MiniCDE Frontend Only Deployment Script
# Deploy only frontend to Heroku

set -e

echo "🚀 Starting Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_APP_NAME="minicde-frontend"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    print_error "You are not logged in to Heroku. Please login first."
    heroku login
fi

print_status "Frontend App: $FRONTEND_APP_NAME"

# Deploy Frontend
print_status "Deploying Frontend to Heroku..."
cd frontend

# Initialize git if needed
if [ ! -d ".git" ]; then
    print_status "Initializing git repository for frontend..."
    git init
    git add .
    git commit -m "Initial frontend commit"
fi

# Add Heroku remote if not exists
if ! git remote get-url heroku &> /dev/null; then
    print_status "Adding Heroku remote for frontend..."
    heroku git:remote -a $FRONTEND_APP_NAME
fi

# Commit and push
git add .
git commit -m "Frontend deployment $(date '+%Y-%m-%d %H:%M:%S')" || true
git push heroku main || git push heroku master

print_success "Frontend deployed successfully!"
cd ..

print_success "🎉 Frontend deployment completed!"
print_status "Frontend URL: https://$FRONTEND_APP_NAME.herokuapp.com"
