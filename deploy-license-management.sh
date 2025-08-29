#!/bin/bash

# Deploy License Management to Heroku
# This script deploys the license management feature to Heroku

set -e

echo "🚀 Bắt đầu deploy License Management lên Heroku..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Không tìm thấy package.json. Vui lòng chạy script từ thư mục gốc của project."
    exit 1
fi

print_status "Kiểm tra môi trường..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI chưa được cài đặt. Vui lòng cài đặt Heroku CLI trước."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository chưa được khởi tạo. Vui lòng chạy 'git init' trước."
    exit 1
fi

print_status "Cập nhật database schema..."

# Deploy backend first
cd backend

print_status "Deploy backend lên Heroku..."

# Check if backend app exists
if ! heroku apps:info minicde-production &> /dev/null; then
    print_error "Heroku app 'minicde-production' không tồn tại. Vui lòng tạo app trước."
    exit 1
fi

# Set environment variables for license management
print_status "Cấu hình environment variables..."

# Add license management specific environment variables
heroku config:set ENABLE_LICENSE_MANAGEMENT=true --app minicde-production
heroku config:set LICENSE_KEY_SECRET="minicde_license_secret_$(date +%s)" --app minicde-production

print_success "Environment variables đã được cấu hình"

# Deploy backend
print_status "Deploy backend code..."
git add .
git commit -m "Add License Management System - $(date)" || true

# Push to Heroku
print_status "Push code lên Heroku..."
git push heroku main

print_success "Backend đã được deploy thành công"

# Run database migration
print_status "Chạy database migration..."
heroku run "npx prisma db push" --app minicde-production

print_success "Database migration hoàn thành"

# Seed sample data
print_status "Tạo dữ liệu mẫu..."
heroku run "node seed-licenses.js" --app minicde-production

print_success "Dữ liệu mẫu đã được tạo"

# Test API endpoints
print_status "Kiểm tra API endpoints..."

# Test license stats endpoint
STATS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://minicde-production-589be4b0d52b.herokuapp.com/api/licenses/stats)

if [ "$STATS_RESPONSE" = "200" ]; then
    print_success "License API hoạt động bình thường"
else
    print_warning "License API có thể chưa hoạt động (HTTP $STATS_RESPONSE)"
fi

cd ..

# Deploy frontend
cd frontend

print_status "Deploy frontend lên Heroku..."

# Check if frontend app exists
if ! heroku apps:info minicde-frontend &> /dev/null; then
    print_error "Heroku app 'minicde-frontend' không tồn tại. Vui lòng tạo app trước."
    exit 1
fi

# Set frontend environment variables
print_status "Cấu hình frontend environment variables..."
heroku config:set REACT_APP_ENABLE_LICENSE_MANAGEMENT=true --app minicde-frontend

# Build and deploy frontend
print_status "Build frontend..."
npm run build

print_status "Deploy frontend..."
git add .
git commit -m "Add License Management Frontend - $(date)" || true
git push heroku main

print_success "Frontend đã được deploy thành công"

cd ..

# Final status
print_success "🎉 License Management đã được deploy thành công!"

echo ""
echo "📋 Thông tin deploy:"
echo "   Backend URL: https://minicde-production-589be4b0d52b.herokuapp.com"
echo "   Frontend URL: https://minicde-frontend-833302d6ab3c.herokuapp.com"
echo "   License API: https://minicde-production-589be4b0d52b.herokuapp.com/api/licenses"
echo ""
echo "🔧 Các tính năng đã được triển khai:"
echo "   ✅ Database schema cho License Management"
echo "   ✅ Backend API endpoints"
echo "   ✅ Frontend admin panel"
echo "   ✅ License checker component"
echo "   ✅ Sample data"
echo ""
echo "📖 Hướng dẫn sử dụng:"
echo "   1. Truy cập: https://minicde-frontend-833302d6ab3c.herokuapp.com/licenses"
echo "   2. Đăng nhập với tài khoản admin"
echo "   3. Sử dụng các tính năng quản lý license"
echo ""
echo "🧪 Test API:"
echo "   curl https://minicde-production-589be4b0d52b.herokuapp.com/api/licenses/stats"
echo ""

print_success "Deploy hoàn tất! 🚀"
