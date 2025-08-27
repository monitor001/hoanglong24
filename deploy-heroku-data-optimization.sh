#!/bin/bash

# MiniCDE Heroku Data Optimization Deployment Script
# Tự động triển khai hệ thống tối ưu hóa dữ liệu lên Heroku

set -e  # Exit on any error

echo "🚀 Starting MiniCDE Heroku Data Optimization Deployment..."

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

# Check Heroku CLI
check_heroku_cli() {
    print_status "Checking Heroku CLI..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first:"
        echo "  npm install -g heroku"
        echo "  or visit: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if logged in
    if ! heroku auth:whoami &> /dev/null; then
        print_error "Not logged in to Heroku. Please run: heroku login"
        exit 1
    fi
    
    print_success "Heroku CLI is ready"
}

# Setup Heroku apps
setup_heroku_apps() {
    print_status "Setting up Heroku apps..."
    
    # Check if apps already exist
    if ! heroku apps:info minicde-production &> /dev/null; then
        print_status "Creating backend app: minicde-production"
        heroku create minicde-production --region us
    else
        print_status "Backend app already exists: minicde-production"
    fi
    
    if ! heroku apps:info minicde-frontend &> /dev/null; then
        print_status "Creating frontend app: minicde-frontend"
        heroku create minicde-frontend --region us
    else
        print_status "Frontend app already exists: minicde-frontend"
    fi
    
    print_success "Heroku apps configured"
}

# Setup Heroku add-ons
setup_heroku_addons() {
    print_status "Setting up Heroku add-ons..."
    
    # Backend add-ons
    print_status "Setting up backend add-ons..."
    heroku addons:create heroku-postgresql:mini --app minicde-production
    heroku addons:create heroku-redis:mini --app minicde-production
    
    # Frontend add-ons
    print_status "Setting up frontend add-ons..."
    heroku addons:create heroku-redis:mini --app minicde-frontend
    
    print_success "Heroku add-ons configured"
}

# Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."
    
    # Backend environment variables
    print_status "Setting backend environment variables..."
    heroku config:set NODE_ENV=production --app minicde-production
    heroku config:set JWT_SECRET=$(openssl rand -base64 32) --app minicde-production
    heroku config:set CORS_ORIGIN="https://minicde-frontend.herokuapp.com,https://qlda.hoanglong24.com" --app minicde-production
    heroku config:set ENABLE_DATA_OPTIMIZATION=true --app minicde-production
    heroku config:set DATA_MAINTENANCE_ENABLED=true --app minicde-production
    
    # Frontend environment variables
    print_status "Setting frontend environment variables..."
    heroku config:set REACT_APP_API_URL=https://minicde-production.herokuapp.com/api --app minicde-frontend
    heroku config:set NODE_ENV=production --app minicde-frontend
    heroku config:set GENERATE_SOURCEMAP=false --app minicde-frontend
    
    print_success "Environment variables configured"
}

# Setup Heroku Scheduler for data maintenance
setup_heroku_scheduler() {
    print_status "Setting up Heroku Scheduler for data maintenance..."
    
    # Add Heroku Scheduler add-on
    heroku addons:create scheduler:standard --app minicde-production
    
    # Schedule daily cleanup (2 AM UTC)
    heroku scheduler:add "npm run data-cleanup" --app minicde-production --frequency daily --at 02:00
    
    # Schedule weekly optimization (Sunday 3 AM UTC)
    heroku scheduler:add "npm run data-optimize" --app minicde-production --frequency daily --at 03:00 --dyno-size standard
    
    # Schedule monthly deep cleanup (1st of month 4 AM UTC)
    heroku scheduler:add "npm run data-deep-cleanup" --app minicde-production --frequency daily --at 04:00 --dyno-size standard
    
    print_success "Heroku Scheduler configured"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to Heroku..."
    
    cd backend
    
    # Create Procfile if not exists
    if [[ ! -f "Procfile" ]]; then
        cat > Procfile << EOF
web: node dist/index.js
release: npx prisma migrate deploy
EOF
    fi
    
    # Add build script to package.json if not exists
    if ! grep -q '"build"' package.json; then
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.build = 'npx prisma generate && npm run build:ts';
        pkg.scripts['build:ts'] = 'tsc';
        pkg.scripts.start = 'node dist/index.js';
        pkg.scripts['data-cleanup'] = 'node -e \"require(\"./dist/services/dataMaintenanceService\").getInstance().dailyCleanup()\"';
        pkg.scripts['data-optimize'] = 'node -e \"require(\"./dist/services/dataMaintenanceService\").getInstance().weeklyOptimization()\"';
        pkg.scripts['data-deep-cleanup'] = 'node -e \"require(\"./dist/services/dataMaintenanceService\").getInstance().monthlyDeepCleanup()\"';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
    fi
    
    # Deploy to Heroku
    git add .
    git commit -m "Deploy data optimization system" || true
    git push heroku main
    
    cd ..
    
    print_success "Backend deployed successfully"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Heroku..."
    
    cd frontend
    
    # Create Procfile if not exists
    if [[ ! -f "Procfile" ]]; then
        cat > Procfile << EOF
web: npx serve -s build -l \$PORT
EOF
    fi
    
    # Add serve dependency
    npm install serve --save
    
    # Build the application
    npm run build
    
    # Deploy to Heroku
    git add .
    git commit -m "Deploy frontend with data management" || true
    git push heroku main
    
    cd ..
    
    print_success "Frontend deployed successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Run migrations on Heroku
    heroku run npx prisma migrate deploy --app minicde-production
    
    # Run data partitioning migration
    heroku run node migrations/add-data-partitioning.js --app minicde-production
    
    print_success "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Add Papertrail for logging
    heroku addons:create papertrail:choklad --app minicde-production
    
    # Add New Relic for performance monitoring
    heroku addons:create newrelic:wayne --app minicde-production
    
    print_success "Monitoring configured"
}

# Create deployment verification script
create_verification_script() {
    print_status "Creating deployment verification script..."
    
    cat > verify-heroku-deployment.sh << 'EOF'
#!/bin/bash

echo "🔍 Verifying Heroku Deployment..."

# Check backend health
echo "Checking backend health..."
BACKEND_URL=$(heroku info -s --app minicde-production | grep web_url | cut -d= -f2)
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check database health
echo "Checking database health..."
if curl -f "$BACKEND_URL/health/db" > /dev/null 2>&1; then
    echo "✅ Database is connected"
else
    echo "❌ Database health check failed"
fi

# Check frontend
echo "Checking frontend..."
FRONTEND_URL=$(heroku info -s --app minicde-frontend | grep web_url | cut -d= -f2)
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Check scheduler jobs
echo "Checking scheduler jobs..."
heroku scheduler --app minicde-production

echo "Verification completed"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
EOF

    chmod +x verify-heroku-deployment.sh
    
    print_success "Verification script created"
}

# Create rollback script
create_rollback_script() {
    print_status "Creating rollback script..."
    
    cat > rollback-heroku.sh << 'EOF'
#!/bin/bash

echo "🔄 Rolling back Heroku deployment..."

# Rollback backend
echo "Rolling back backend..."
heroku rollback --app minicde-production

# Rollback frontend
echo "Rolling back frontend..."
heroku rollback --app minicde-frontend

echo "Rollback completed"
EOF

    chmod +x rollback-heroku.sh
    
    print_success "Rollback script created"
}

# Main deployment function
main() {
    print_status "Starting MiniCDE Heroku Data Optimization Deployment..."
    
    check_heroku_cli
    setup_heroku_apps
    setup_heroku_addons
    configure_environment
    setup_heroku_scheduler
    deploy_backend
    deploy_frontend
    run_migrations
    setup_monitoring
    create_verification_script
    create_rollback_script
    
    print_success "🎉 MiniCDE Heroku Data Optimization Deployment completed!"
    
    echo
    echo "📋 Deployment Summary:"
    echo "Backend: https://minicde-production.herokuapp.com"
    echo "Frontend: https://minicde-frontend.herokuapp.com"
    echo "Admin Dashboard: https://minicde-frontend.herokuapp.com/data-management"
    
    echo
    echo "🔧 Management Commands:"
    echo "Check logs: heroku logs --tail --app minicde-production"
    echo "Run migrations: heroku run npx prisma migrate deploy --app minicde-production"
    echo "Manual cleanup: heroku run npm run data-cleanup --app minicde-production"
    echo "Verify deployment: ./verify-heroku-deployment.sh"
    echo "Rollback: ./rollback-heroku.sh"
    
    echo
    echo "📊 Monitoring:"
    echo "Papertrail logs: heroku addons:open papertrail --app minicde-production"
    echo "New Relic: heroku addons:open newrelic --app minicde-production"
    echo "Scheduler: heroku scheduler --app minicde-production"
}

# Run main function
main "$@"
