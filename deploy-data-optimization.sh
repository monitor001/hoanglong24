#!/bin/bash

# MiniCDE Data Optimization Deployment Script
# Tự động triển khai hệ thống tối ưu hóa dữ liệu

set -e  # Exit on any error

echo "🚀 Starting MiniCDE Data Optimization Deployment..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check required tools
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
        print_error "Please run this script from the MiniCDE project root directory"
        exit 1
    fi
    
    print_success "System requirements check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    
    # Install additional packages for data optimization
    npm install cron node-cron --save
    
    cd ..
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Check if .env files exist
    if [[ ! -f "backend/.env" ]]; then
        print_warning "backend/.env not found. Creating from template..."
        cp backend/env.txt backend/.env
    fi
    
    if [[ ! -f "frontend/.env" ]]; then
        print_warning "frontend/.env not found. Creating from template..."
        cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:3001/api
NODE_ENV=development
GENERATE_SOURCEMAP=true
EOF
    fi
    
    print_success "Environment variables configured"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    print_status "Running database migrations..."
    npx prisma migrate deploy
    
    # Run data partitioning migration
    print_status "Setting up data partitioning..."
    node migrations/add-data-partitioning.js
    
    cd ..
    
    print_success "Database migrations completed"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    
    cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    
    cd ..
    
    print_success "Applications built successfully"
}

# Setup cron jobs for data maintenance
setup_cron_jobs() {
    print_status "Setting up cron jobs for data maintenance..."
    
    # Create cron job for data cleanup (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd)/backend && npm run data-cleanup >> /var/log/minicde-cleanup.log 2>&1") | crontab -
    
    # Create cron job for weekly optimization (Sunday at 3 AM)
    (crontab -l 2>/dev/null; echo "0 3 * * 0 cd $(pwd)/backend && npm run data-optimize >> /var/log/minicde-optimize.log 2>&1") | crontab -
    
    # Create cron job for monthly deep cleanup (1st of month at 4 AM)
    (crontab -l 2>/dev/null; echo "0 4 1 * * cd $(pwd)/backend && npm run data-deep-cleanup >> /var/log/minicde-deep-cleanup.log 2>&1") | crontab -
    
    print_success "Cron jobs configured"
}

# Create systemd service for production
create_systemd_service() {
    print_status "Creating systemd service for production deployment..."
    
    # Create service file
    sudo tee /etc/systemd/system/minicde-backend.service > /dev/null << EOF
[Unit]
Description=MiniCDE Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Create frontend service
    sudo tee /etc/systemd/system/minicde-frontend.service > /dev/null << EOF
[Unit]
Description=MiniCDE Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/frontend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npx serve -s build -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable services
    sudo systemctl daemon-reload
    sudo systemctl enable minicde-backend
    sudo systemctl enable minicde-frontend
    
    print_success "Systemd services created and enabled"
}

# Setup monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."
    
    # Create log directories
    sudo mkdir -p /var/log/minicde
    sudo chown $USER:$USER /var/log/minicde
    
    # Create logrotate configuration
    sudo tee /etc/logrotate.d/minicde > /dev/null << EOF
/var/log/minicde/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
    
    print_success "Monitoring and logging configured"
}

# Create deployment scripts
create_deployment_scripts() {
    print_status "Creating deployment scripts..."
    
    # Create start script
    cat > start-minicde.sh << 'EOF'
#!/bin/bash
echo "Starting MiniCDE services..."

# Start backend
cd backend
npm start &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "MiniCDE services started"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF

    # Create stop script
    cat > stop-minicde.sh << 'EOF'
#!/bin/bash
echo "Stopping MiniCDE services..."

# Stop backend
pkill -f "node.*backend"

# Stop frontend
pkill -f "node.*frontend"

echo "MiniCDE services stopped"
EOF

    # Create restart script
    cat > restart-minicde.sh << 'EOF'
#!/bin/bash
echo "Restarting MiniCDE services..."

./stop-minicde.sh
sleep 2
./start-minicde.sh
EOF

    # Make scripts executable
    chmod +x start-minicde.sh stop-minicde.sh restart-minicde.sh
    
    print_success "Deployment scripts created"
}

# Add npm scripts to backend package.json
add_npm_scripts() {
    print_status "Adding npm scripts for data optimization..."
    
    cd backend
    
    # Check if scripts already exist
    if ! grep -q "data-cleanup" package.json; then
        # Add scripts to package.json
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts['data-cleanup'] = 'node -e \"require(\"./dist/services/dataMaintenanceService\").getInstance().dailyCleanup()\"';
        pkg.scripts['data-optimize'] = 'node -e \"require(\"./dist/services/dataMaintenanceService\").getInstance().weeklyOptimization()\"';
        pkg.scripts['data-deep-cleanup'] = 'node -e \"require(\"./dist/services/dataMaintenanceService\").getInstance().monthlyDeepCleanup()\"';
        pkg.scripts['data-maintenance'] = 'node -e \"require(\"./dist/services/dataMaintenanceService\").getInstance().initializeJobs()\"';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
    fi
    
    cd ..
    
    print_success "NPM scripts added"
}

# Create health check script
create_health_check() {
    print_status "Creating health check script..."
    
    cat > health-check.sh << 'EOF'
#!/bin/bash

echo "🔍 MiniCDE Health Check"

# Check backend
echo "Checking backend..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not responding"
fi

# Check frontend
echo "Checking frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

# Check database
echo "Checking database..."
if curl -f http://localhost:3001/health/db > /dev/null 2>&1; then
    echo "✅ Database is connected"
else
    echo "❌ Database connection failed"
fi

# Check cron jobs
echo "Checking cron jobs..."
if crontab -l | grep -q "minicde"; then
    echo "✅ Cron jobs are configured"
else
    echo "❌ Cron jobs not found"
fi

echo "Health check completed"
EOF

    chmod +x health-check.sh
    
    print_success "Health check script created"
}

# Main deployment function
main() {
    print_status "Starting MiniCDE Data Optimization Deployment..."
    
    check_requirements
    install_dependencies
    setup_environment
    run_migrations
    add_npm_scripts
    build_applications
    setup_cron_jobs
    create_deployment_scripts
    create_health_check
    
    # Ask if user wants to set up systemd services (production)
    read -p "Do you want to set up systemd services for production deployment? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_systemd_service
        setup_monitoring
    fi
    
    print_success "🎉 MiniCDE Data Optimization Deployment completed!"
    
    echo
    echo "📋 Next steps:"
    echo "1. Configure your environment variables in backend/.env and frontend/.env"
    echo "2. Start the services: ./start-minicde.sh"
    echo "3. Check health: ./health-check.sh"
    echo "4. Access the application: http://localhost:3000"
    echo "5. Access admin dashboard: http://localhost:3000/data-management"
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo
        echo "🚀 For production deployment:"
        echo "1. Start services: sudo systemctl start minicde-backend minicde-frontend"
        echo "2. Check status: sudo systemctl status minicde-backend minicde-frontend"
        echo "3. View logs: sudo journalctl -u minicde-backend -f"
    fi
}

# Run main function
main "$@"
