#!/bin/bash

# MiniCDE Backend Only Deployment Script
# Deploy only backend to Heroku

set -e

echo "🚀 Starting Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_APP_NAME="minicde-production"

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

print_status "Backend App: $BACKEND_APP_NAME"

# Deploy Backend
print_status "Deploying Backend to Heroku..."
cd backend

# Initialize git if needed
if [ ! -d ".git" ]; then
    print_status "Initializing git repository for backend..."
    git init
    git add .
    git commit -m "Initial backend commit"
fi

# Add Heroku remote if not exists
if ! git remote get-url heroku &> /dev/null; then
    print_status "Adding Heroku remote for backend..."
    heroku git:remote -a $BACKEND_APP_NAME
fi

# Commit and push
git add .
git commit -m "Backend deployment $(date '+%Y-%m-%d %H:%M:%S')" || true
git push heroku main || git push heroku master

# Run database migrations
print_status "Running database migrations..."
heroku run npm run db:migrate -a $BACKEND_APP_NAME

# Run database seeding
print_status "Running database seeding..."
heroku run npm run db:seed -a $BACKEND_APP_NAME

print_success "Backend deployed successfully!"
cd ..

print_success "🎉 Backend deployment completed!"
print_status "Backend URL: https://$BACKEND_APP_NAME.herokuapp.com"
