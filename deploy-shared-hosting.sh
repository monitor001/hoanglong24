#!/bin/bash

# MiniCDE Shared Hosting Deployment Script
# Deploy to tenten or other shared hosting providers

set -e

echo "🚀 Starting MiniCDE Shared Hosting Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SHARED_HOSTING_PATH="/home/username/public_html"
BACKEND_PATH="$SHARED_HOSTING_PATH/api"
FRONTEND_PATH="$SHARED_HOSTING_PATH"
DOMAIN="qlda.hoanglong24.com"

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build Backend for Shared Hosting
build_backend() {
    print_status "Building Backend for Shared Hosting..."
    cd backend
    
    # Install dependencies
    npm install --production
    
    # Build TypeScript
    npm run build
    
    # Copy environment file
    if [ -f "env.shared-hosting.txt" ]; then
        cp env.shared-hosting.txt .env
        print_success "Environment file copied"
    else
        print_warning "Environment file not found, please create .env manually"
    fi
    
    # Create uploads directory
    mkdir -p uploads
    
    # Generate Prisma client
    npx prisma generate
    
    print_success "Backend built successfully"
    cd ..
}

# Build Frontend for Shared Hosting
build_frontend() {
    print_status "Building Frontend for Shared Hosting..."
    cd frontend
    
    # Install dependencies
    npm install
    
    # Set environment variables for build
    export REACT_APP_API_URL="https://$DOMAIN/api"
    export REACT_APP_ENVIRONMENT="shared-hosting"
    export GENERATE_SOURCEMAP=false
    
    # Build React app
    npm run build
    
    print_success "Frontend built successfully"
    cd ..
}

# Deploy to Shared Hosting (via FTP/SFTP)
deploy_to_hosting() {
    print_status "Deploying to Shared Hosting..."
    
    # This section depends on your hosting provider
    # For tenten, you might use FTP/SFTP or cPanel File Manager
    
    print_warning "Manual deployment required:"
    echo "1. Upload backend/dist/* to $BACKEND_PATH"
    echo "2. Upload backend/.env to $BACKEND_PATH"
    echo "3. Upload backend/uploads/ to $BACKEND_PATH/uploads"
    echo "4. Upload frontend/build/* to $FRONTEND_PATH"
    echo "5. Set up database and run migrations"
    echo "6. Configure domain and SSL"
}

# Setup Database
setup_database() {
    print_status "Setting up database..."
    
    print_warning "Database setup required:"
    echo "1. Create PostgreSQL database on your hosting"
    echo "2. Update DATABASE_URL in .env file"
    echo "3. Run migrations: npx prisma migrate deploy"
    echo "4. Seed database: npx prisma db seed"
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy backend files
    cp -r backend/dist deployment/backend/
    cp backend/.env deployment/backend/
    cp -r backend/uploads deployment/backend/
    cp backend/package.json deployment/backend/
    
    # Copy frontend files
    cp -r frontend/build deployment/frontend/
    
    # Create deployment instructions
    cat > deployment/README.md << EOF
# MiniCDE Shared Hosting Deployment

## Backend Setup
1. Upload backend/ to your hosting API directory
2. Install dependencies: npm install --production
3. Set up environment variables in .env
4. Run database migrations: npx prisma migrate deploy
5. Start the server: npm start

## Frontend Setup
1. Upload frontend/ to your hosting public directory
2. Configure domain to point to frontend files
3. Set up SSL certificate

## Database Setup
1. Create PostgreSQL database
2. Update DATABASE_URL in backend/.env
3. Run migrations and seed data

## Domain Configuration
- Backend API: https://$DOMAIN/api
- Frontend: https://$DOMAIN
EOF
    
    print_success "Deployment package created in deployment/"
}

# Main deployment process
main() {
    print_status "Starting MiniCDE Shared Hosting Deployment..."
    
    check_dependencies
    build_backend
    build_frontend
    create_deployment_package
    deploy_to_hosting
    setup_database
    
    print_success "Deployment process completed!"
    print_status "Next steps:"
    echo "1. Upload files to your shared hosting"
    echo "2. Configure database and environment variables"
    echo "3. Set up domain and SSL certificate"
    echo "4. Test the application"
}

# Run main function
main "$@"
