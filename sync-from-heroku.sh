#!/bin/bash

# MiniCDE Sync from Heroku Script
# This script backs up important data and clones the latest version from Heroku

set -e

echo "🔄 Starting MiniCDE Sync from Heroku..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
BACKEND_APP_NAME="minicde-production"
FRONTEND_APP_NAME="minicde-frontend"
BACKUP_DIR="backup_$(date '+%Y%m%d_%H%M%S')"
CURRENT_DIR=$(pwd)
PARENT_DIR=$(dirname "$CURRENT_DIR")

print_status "Backend App: $BACKEND_APP_NAME"
print_status "Frontend App: $FRONTEND_APP_NAME"
print_status "Current Directory: $CURRENT_DIR"
print_status "Backup Directory: $BACKUP_DIR"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI is not installed. Please install it first."
    print_status "Visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    print_error "You are not logged in to Heroku. Please login first."
    heroku login
fi

# Function to backup important data
backup_data() {
    print_status "Creating backup of important data..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup important files
    if [ -f "deploy-heroku.sh" ]; then
        cp deploy-heroku.sh "$BACKUP_DIR/"
        print_status "Backed up deploy-heroku.sh"
    fi
    
    if [ -f "deploy-frontend-only.sh" ]; then
        cp deploy-frontend-only.sh "$BACKUP_DIR/"
        print_status "Backed up deploy-frontend-only.sh"
    fi
    
    if [ -f "app.json" ]; then
        cp app.json "$BACKUP_DIR/"
        print_status "Backed up app.json"
    fi
    
    if [ -f "package.json" ]; then
        cp package.json "$BACKUP_DIR/"
        print_status "Backed up package.json"
    fi
    
    # Backup uploads directory if exists
    if [ -d "uploads" ]; then
        cp -r uploads "$BACKUP_DIR/"
        print_status "Backed up uploads directory"
    fi
    
    # Backup backend uploads if exists
    if [ -d "backend/uploads" ]; then
        cp -r backend/uploads "$BACKUP_DIR/backend_uploads"
        print_status "Backed up backend/uploads directory"
    fi
    
    # Backup environment files if they exist
    if [ -f "backend/.env" ]; then
        cp backend/.env "$BACKUP_DIR/backend_env"
        print_status "Backed up backend/.env"
    fi
    
    if [ -f "frontend/.env" ]; then
        cp frontend/.env "$BACKUP_DIR/frontend_env"
        print_status "Backed up frontend/.env"
    fi
    
    print_success "Backup completed in $BACKUP_DIR"
}

# Function to clone backend from Heroku
clone_backend() {
    print_status "Cloning backend from Heroku..."
    
    # Create backend directory
    mkdir -p backend
    
    cd backend
    
    # Initialize git repository
    git init
    
    # Add Heroku remote
    heroku git:remote -a $BACKEND_APP_NAME
    
    # Fetch latest code
    git fetch heroku
    
    # Checkout main branch (or master if main doesn't exist)
    if git show-ref --verify --quiet refs/remotes/heroku/main; then
        git checkout -b main heroku/main
    else
        git checkout -b master heroku/master
    fi
    
    print_success "Backend cloned successfully!"
    
    cd ..
}

# Function to clone frontend from Heroku
clone_frontend() {
    print_status "Cloning frontend from Heroku..."
    
    # Create frontend directory
    mkdir -p frontend
    
    cd frontend
    
    # Initialize git repository
    git init
    
    # Add Heroku remote
    heroku git:remote -a $FRONTEND_APP_NAME
    
    # Fetch latest code
    git fetch heroku
    
    # Checkout main branch (or master if main doesn't exist)
    if git show-ref --verify --quiet refs/remotes/heroku/main; then
        git checkout -b main heroku/main
    else
        git checkout -b master heroku/master
    fi
    
    print_success "Frontend cloned successfully!"
    
    cd ..
}

# Function to restore important data
restore_data() {
    print_status "Restoring important data from backup..."
    
    # Restore deployment scripts
    if [ -f "$BACKUP_DIR/deploy-heroku.sh" ]; then
        cp "$BACKUP_DIR/deploy-heroku.sh" .
        print_status "Restored deploy-heroku.sh"
    fi
    
    if [ -f "$BACKUP_DIR/deploy-frontend-only.sh" ]; then
        cp "$BACKUP_DIR/deploy-frontend-only.sh" .
        print_status "Restored deploy-frontend-only.sh"
    fi
    
    # Restore configuration files
    if [ -f "$BACKUP_DIR/app.json" ]; then
        cp "$BACKUP_DIR/app.json" .
        print_status "Restored app.json"
    fi
    
    if [ -f "$BACKUP_DIR/package.json" ]; then
        cp "$BACKUP_DIR/package.json" .
        print_status "Restored package.json"
    fi
    
    # Restore uploads directories
    if [ -d "$BACKUP_DIR/uploads" ]; then
        cp -r "$BACKUP_DIR/uploads" .
        print_status "Restored uploads directory"
    fi
    
    if [ -d "$BACKUP_DIR/backend_uploads" ]; then
        cp -r "$BACKUP_DIR/backend_uploads" backend/uploads
        print_status "Restored backend/uploads directory"
    fi
    
    # Restore environment files
    if [ -f "$BACKUP_DIR/backend_env" ]; then
        cp "$BACKUP_DIR/backend_env" backend/.env
        print_status "Restored backend/.env"
    fi
    
    if [ -f "$BACKUP_DIR/frontend_env" ]; then
        cp "$BACKUP_DIR/frontend_env" frontend/.env
        print_status "Restored frontend/.env"
    fi
    
    print_success "Data restoration completed!"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed!"
    fi
    
    # Install frontend dependencies
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed!"
    fi
    
    # Install root dependencies if exists
    if [ -f "package.json" ]; then
        print_status "Installing root dependencies..."
        npm install
        print_success "Root dependencies installed!"
    fi
}

# Function to clean up old data
cleanup_old_data() {
    print_status "Cleaning up old data..."
    
    # Remove old git repositories
    if [ -d ".git" ]; then
        rm -rf .git
        print_status "Removed old .git directory"
    fi
    
    # Remove old backend and frontend directories
    if [ -d "backend" ]; then
        rm -rf backend
        print_status "Removed old backend directory"
    fi
    
    if [ -d "frontend" ]; then
        rm -rf frontend
        print_status "Removed old frontend directory"
    fi
    
    print_success "Cleanup completed!"
}

# Main sync process
main() {
    print_status "Starting sync process from Heroku..."
    
    # Step 1: Backup important data
    backup_data
    
    # Step 2: Clean up old data
    cleanup_old_data
    
    # Step 3: Clone backend from Heroku
    clone_backend
    
    # Step 4: Clone frontend from Heroku
    clone_frontend
    
    # Step 5: Restore important data
    restore_data
    
    # Step 6: Install dependencies
    install_dependencies
    
    print_success "🎉 Sync from Heroku completed successfully!"
    print_status "Backup location: $BACKUP_DIR"
    print_status "You can now run the application locally or deploy to Heroku again."
}

# Run main function
main "$@"
