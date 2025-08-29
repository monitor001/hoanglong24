#!/bin/bash

# Script deploy tính năng Kaizen lên Heroku
# Tác giả: Hoàng Long 24
# Ngày tạo: $(date)

set -e

echo "🚀 Bắt đầu deploy tính năng Kaizen lên Heroku..."

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hàm log với màu sắc
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Kiểm tra xem có đang ở thư mục gốc không
if [ ! -f "package.json" ]; then
    log_error "Vui lòng chạy script này từ thư mục gốc của dự án"
    exit 1
fi

# Kiểm tra Heroku CLI
if ! command -v heroku &> /dev/null; then
    log_error "Heroku CLI chưa được cài đặt. Vui lòng cài đặt Heroku CLI trước."
    exit 1
fi

# Kiểm tra đăng nhập Heroku
if ! heroku auth:whoami &> /dev/null; then
    log_error "Chưa đăng nhập Heroku. Vui lòng chạy: heroku login"
    exit 1
fi

# Cấu hình
BACKEND_APP="minicde-production"
FRONTEND_APP="minicde-frontend"

log_info "Cấu hình deploy:"
log_info "  Backend App: $BACKEND_APP"
log_info "  Frontend App: $FRONTEND_APP"

# 1. Deploy Backend
log_info "📦 Bắt đầu deploy Backend..."

cd backend

# Kiểm tra remote Heroku
if ! git remote | grep -q heroku; then
    log_info "Thêm remote Heroku cho backend..."
    heroku git:remote -a $BACKEND_APP
fi

# Push code lên Heroku
log_info "Pushing code lên Heroku..."
git push heroku master:master

# Chạy migration
log_info "Chạy database migration..."
heroku run npx prisma db push --app $BACKEND_APP

# Seed dữ liệu Kaizen
log_info "Seed dữ liệu Kaizen..."
heroku run node seed-kaizen-tags.js --app $BACKEND_APP || log_warning "Không thể chạy seed tags"
heroku run node seed-kaizen-examples.js --app $BACKEND_APP || log_warning "Không thể chạy seed examples"

log_success "Backend đã được deploy thành công!"

cd ..

# 2. Deploy Frontend
log_info "📦 Bắt đầu deploy Frontend..."

cd frontend

# Kiểm tra remote Heroku
if ! git remote | grep -q heroku; then
    log_info "Thêm remote Heroku cho frontend..."
    heroku git:remote -a $FRONTEND_APP
fi

# Build production
log_info "Building production..."
npm run build

# Push code lên Heroku
log_info "Pushing code lên Heroku..."
git push heroku master:master

log_success "Frontend đã được deploy thành công!"

cd ..

# 3. Kiểm tra health check
log_info "🔍 Kiểm tra health check..."

# Kiểm tra backend
BACKEND_URL="https://$BACKEND_APP.herokuapp.com"
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    log_success "Backend health check: OK"
else
    log_warning "Backend health check: FAILED"
fi

# Kiểm tra frontend
FRONTEND_URL="https://$FRONTEND_APP.herokuapp.com"
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    log_success "Frontend health check: OK"
else
    log_warning "Frontend health check: FAILED"
fi

# 4. Test API Kaizen
log_info "🧪 Test API Kaizen..."

# Test API lấy danh sách Kaizen
if curl -f "$BACKEND_URL/api/kaizen" > /dev/null 2>&1; then
    log_success "Kaizen API test: OK"
else
    log_warning "Kaizen API test: FAILED"
fi

# Test API lấy thống kê
if curl -f "$BACKEND_URL/api/kaizen/stats" > /dev/null 2>&1; then
    log_success "Kaizen Stats API test: OK"
else
    log_warning "Kaizen Stats API test: FAILED"
fi

# 5. Hiển thị thông tin
log_info "📊 Thông tin deploy:"
echo "  Backend URL: $BACKEND_URL"
echo "  Frontend URL: $FRONTEND_URL"
echo "  Kaizen API: $BACKEND_URL/api/kaizen"
echo "  Kaizen Stats: $BACKEND_URL/api/kaizen/stats"

# 6. Mở ứng dụng
log_info "🌐 Mở ứng dụng trong trình duyệt..."
if command -v open &> /dev/null; then
    open "$FRONTEND_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$FRONTEND_URL"
else
    log_info "Vui lòng mở trình duyệt và truy cập: $FRONTEND_URL"
fi

log_success "🎉 Deploy tính năng Kaizen hoàn thành!"
log_info "Tính năng Kaizen đã sẵn sàng sử dụng tại: $FRONTEND_URL/kaizen"

# 7. Hiển thị hướng dẫn sử dụng
echo ""
log_info "📖 Hướng dẫn sử dụng:"
echo "  1. Truy cập: $FRONTEND_URL/kaizen"
echo "  2. Đăng nhập với tài khoản của bạn"
echo "  3. Xem danh sách cải tiến mẫu đã được tạo sẵn"
echo "  4. Tạo cải tiến mới hoặc chỉnh sửa cải tiến hiện có"
echo "  5. Sử dụng các tính năng like, comment, share"
echo "  6. Xem thống kê tại nút 'Thống kê'"

echo ""
log_info "📚 Tài liệu chi tiết:"
echo "  - README: KAIZEN_FEATURE_README.md"
echo "  - API Documentation: $BACKEND_URL/api/kaizen"
echo "  - Database Schema: backend/prisma/schema.prisma"

echo ""
log_success "🚀 Tính năng Kaizen đã sẵn sàng! Chúc bạn sử dụng hiệu quả!"
