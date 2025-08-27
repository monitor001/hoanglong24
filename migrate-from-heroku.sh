#!/bin/bash

# MiniCDE Migration Script - From Heroku to Shared Hosting
# This script helps migrate data from Heroku to your new shared hosting

set -e

echo "🔄 Starting MiniCDE Migration from Heroku to Shared Hosting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
HEROKU_BACKEND_APP="minicde-production"
HEROKU_FRONTEND_APP="minicde-frontend"
BACKUP_DIR="./migration-backup"
SHARED_HOSTING_DB="minicde_db"
SHARED_HOSTING_USER="minicde_user"

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

# Check if Heroku CLI is installed and logged in
check_heroku() {
    print_status "Checking Heroku CLI..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first."
        print_status "Visit: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    if ! heroku auth:whoami &> /dev/null; then
        print_error "You are not logged in to Heroku. Please login first."
        heroku login
    fi
    
    print_success "Heroku CLI is ready"
}

# Create backup directory
create_backup_dir() {
    print_status "Creating backup directory..."
    mkdir -p $BACKUP_DIR
    mkdir -p $BACKUP_DIR/database
    mkdir -p $BACKUP_DIR/uploads
    mkdir -p $BACKUP_DIR/config
    print_success "Backup directory created: $BACKUP_DIR"
}

# Backup database from Heroku
backup_database() {
    print_status "Creating database backup from Heroku..."
    
    # Create backup
    heroku pg:backups:capture -a $HEROKU_BACKEND_APP
    
    # Download backup
    heroku pg:backups:download -a $HEROKU_BACKEND_APP -o $BACKUP_DIR/database/heroku_backup.dump
    
    print_success "Database backup created: $BACKUP_DIR/database/heroku_backup.dump"
}

# Backup environment variables
backup_environment() {
    print_status "Backing up environment variables..."
    
    # Get Heroku config vars
    heroku config -a $HEROKU_BACKEND_APP > $BACKUP_DIR/config/heroku_config.txt
    
    # Extract important variables
    cat > $BACKUP_DIR/config/important_vars.txt << EOF
# Important environment variables from Heroku
# Copy these to your shared hosting .env file

# Database URL (update with your shared hosting details)
# DATABASE_URL="postgresql://minicde_user:password@localhost:5432/minicde_db"

# JWT Secret (generate new one for security)
JWT_SECRET="$(openssl rand -base64 32)"

# Other variables from Heroku:
EOF
    
    # Extract specific variables
    heroku config -a $HEROKU_BACKEND_APP | grep -E "(CLOUDINARY_|AZURE_|SMTP_|EMAIL_)" >> $BACKUP_DIR/config/important_vars.txt
    
    print_success "Environment variables backed up"
}

# Backup uploads (if using Cloudinary)
backup_uploads() {
    print_status "Checking for file uploads..."
    
    # Check if Cloudinary is configured
    if heroku config -a $HEROKU_BACKEND_APP | grep -q "CLOUDINARY_"; then
        print_warning "Cloudinary detected. Files are stored in cloud."
        print_status "You may need to download specific files manually."
        
        # Create script to download files
        cat > $BACKUP_DIR/download_cloudinary_files.sh << 'EOF'
#!/bin/bash
# Script to download files from Cloudinary
# You'll need to implement this based on your specific needs

echo "To download files from Cloudinary:"
echo "1. Use Cloudinary Admin API"
echo "2. Or use Cloudinary CLI"
echo "3. Or download specific files manually"
EOF
        chmod +x $BACKUP_DIR/download_cloudinary_files.sh
    else
        print_status "No Cloudinary detected. Files may be stored locally on Heroku."
        print_warning "You may need to download files manually from Heroku."
    fi
}

# Create migration script for shared hosting
create_migration_script() {
    print_status "Creating migration script for shared hosting..."
    
    cat > $BACKUP_DIR/migrate_to_shared_hosting.sh << 'EOF'
#!/bin/bash

# MiniCDE Migration Script for Shared Hosting
# Run this on your shared hosting server

set -e

echo "🔄 Starting migration to shared hosting..."

# Configuration
BACKUP_DIR="./migration-backup"
DB_NAME="minicde_db"
DB_USER="minicde_user"
DB_PASSWORD="your_password_here"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is installed
check_postgresql() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed"
        exit 1
    fi
    print_success "PostgreSQL is available"
}

# Create database and user
setup_database() {
    print_warning "Setting up database..."
    
    # Create database
    sudo -u postgres createdb $DB_NAME
    
    # Create user (if not exists)
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || true
    
    # Grant privileges
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    
    print_success "Database setup completed"
}

# Import database backup
import_database() {
    print_warning "Importing database backup..."
    
    if [ -f "$BACKUP_DIR/database/heroku_backup.dump" ]; then
        pg_restore -h localhost -U $DB_USER -d $DB_NAME $BACKUP_DIR/database/heroku_backup.dump
        print_success "Database imported successfully"
    else
        print_error "Database backup file not found"
        exit 1
    fi
}

# Setup environment variables
setup_environment() {
    print_warning "Setting up environment variables..."
    
    if [ -f "$BACKUP_DIR/config/important_vars.txt" ]; then
        cp $BACKUP_DIR/config/important_vars.txt .env
        print_success "Environment file created"
    else
        print_error "Environment backup not found"
        exit 1
    fi
}

# Main migration process
main() {
    check_postgresql
    setup_database
    import_database
    setup_environment
    
    print_success "Migration completed!"
    print_warning "Next steps:"
    echo "1. Update .env file with correct database credentials"
    echo "2. Run database migrations: npx prisma migrate deploy"
    echo "3. Start the application"
}

main "$@"
EOF
    
    chmod +x $BACKUP_DIR/migrate_to_shared_hosting.sh
    print_success "Migration script created: $BACKUP_DIR/migrate_to_shared_hosting.sh"
}

# Create deployment checklist
create_checklist() {
    print_status "Creating deployment checklist..."
    
    cat > $BACKUP_DIR/DEPLOYMENT_CHECKLIST.md << 'EOF'
# MiniCDE Deployment Checklist - Shared Hosting

## Pre-deployment
- [ ] Shared hosting server is ready
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and configured
- [ ] Nginx installed and configured
- [ ] SSL certificate configured
- [ ] Domain DNS updated

## Database Setup
- [ ] PostgreSQL database created
- [ ] Database user created with proper permissions
- [ ] Database backup imported
- [ ] Database migrations run
- [ ] Database seeded with initial data

## Backend Deployment
- [ ] Backend files uploaded to server
- [ ] Environment variables configured (.env)
- [ ] Dependencies installed (npm install --production)
- [ ] Prisma client generated
- [ ] Application started with PM2
- [ ] Backend API accessible

## Frontend Deployment
- [ ] Frontend built with correct API URL
- [ ] Frontend files uploaded to server
- [ ] Nginx configured for frontend
- [ ] Static files served correctly
- [ ] Frontend accessible via domain

## Testing
- [ ] Backend API health check
- [ ] Frontend loads correctly
- [ ] User authentication works
- [ ] File uploads work
- [ ] Database operations work
- [ ] Email functionality works

## Security
- [ ] SSL certificate active
- [ ] Environment variables secured
- [ ] Database credentials secure
- [ ] File permissions correct
- [ ] Firewall configured

## Monitoring
- [ ] PM2 monitoring active
- [ ] Nginx logs monitored
- [ ] Database performance monitored
- [ ] Error logging configured
- [ ] Backup system in place

## Post-deployment
- [ ] Update DNS records
- [ ] Test all functionality
- [ ] Monitor performance
- [ ] Set up regular backups
- [ ] Document deployment process
EOF
    
    print_success "Deployment checklist created: $BACKUP_DIR/DEPLOYMENT_CHECKLIST.md"
}

# Create rollback script
create_rollback_script() {
    print_status "Creating rollback script..."
    
    cat > $BACKUP_DIR/rollback_to_heroku.sh << 'EOF'
#!/bin/bash

# MiniCDE Rollback Script - Back to Heroku
# Use this if you need to rollback to Heroku

set -e

echo "🔄 Rolling back to Heroku..."

# Configuration
HEROKU_BACKEND_APP="minicde-production"
HEROKU_FRONTEND_APP="minicde-frontend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Deploy backend to Heroku
deploy_backend() {
    print_warning "Deploying backend to Heroku..."
    cd backend
    git add .
    git commit -m "Rollback to Heroku $(date)"
    git push heroku main
    print_success "Backend deployed to Heroku"
    cd ..
}

# Deploy frontend to Heroku
deploy_frontend() {
    print_warning "Deploying frontend to Heroku..."
    cd frontend
    git add .
    git commit -m "Rollback to Heroku $(date)"
    git push heroku main
    print_success "Frontend deployed to Heroku"
    cd ..
}

# Main rollback process
main() {
    print_warning "This will rollback your application to Heroku"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_backend
        deploy_frontend
        print_success "Rollback completed!"
    else
        print_warning "Rollback cancelled"
    fi
}

main "$@"
EOF
    
    chmod +x $BACKUP_DIR/rollback_to_heroku.sh
    print_success "Rollback script created: $BACKUP_DIR/rollback_to_heroku.sh"
}

# Main migration process
main() {
    print_status "Starting MiniCDE migration from Heroku to Shared Hosting..."
    
    check_heroku
    create_backup_dir
    backup_database
    backup_environment
    backup_uploads
    create_migration_script
    create_checklist
    create_rollback_script
    
    print_success "Migration preparation completed!"
    print_status "Next steps:"
    echo "1. Review files in $BACKUP_DIR"
    echo "2. Update database credentials in migration script"
    echo "3. Upload backup files to your shared hosting server"
    echo "4. Run migrate_to_shared_hosting.sh on your server"
    echo "5. Follow the deployment checklist"
    echo ""
    print_warning "Important: Keep your Heroku apps running until migration is complete!"
}

# Run main function
main "$@"
