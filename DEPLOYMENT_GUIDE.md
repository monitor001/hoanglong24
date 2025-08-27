# 🚀 MiniCDE Data Optimization Deployment Guide

Hướng dẫn triển khai hệ thống tối ưu hóa dữ liệu MiniCDE

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Triển khai Local](#triển-khai-local)
3. [Triển khai Heroku](#triển-khai-heroku)
4. [Triển khai Production](#triển-khai-production)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

## 🔧 Yêu cầu hệ thống

### Yêu cầu tối thiểu
- **Node.js**: 18.x hoặc cao hơn
- **npm**: 8.x hoặc cao hơn
- **Git**: 2.x hoặc cao hơn
- **Database**: PostgreSQL 12+ hoặc Heroku Postgres
- **Redis**: 6.x hoặc cao hơn (tùy chọn, cho caching)

### Yêu cầu cho Production
- **CPU**: 2 cores trở lên
- **RAM**: 4GB trở lên
- **Storage**: 20GB trở lên
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

## 🏠 Triển khai Local

### Bước 1: Chuẩn bị môi trường

```bash
# Clone repository
git clone <repository-url>
cd minicde

# Cài đặt dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Bước 2: Cấu hình môi trường

```bash
# Tạo file .env cho backend
cp backend/env.txt backend/.env

# Tạo file .env cho frontend
cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:3001/api
NODE_ENV=development
GENERATE_SOURCEMAP=true
EOF
```

### Bước 3: Cấu hình Database

```bash
# Cài đặt PostgreSQL (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Tạo database
sudo -u postgres createdb minicde
sudo -u postgres createuser minicde_user
sudo -u postgres psql -c "ALTER USER minicde_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE minicde TO minicde_user;"

# Cập nhật DATABASE_URL trong backend/.env
DATABASE_URL="postgresql://minicde_user:your_password@localhost:5432/minicde"
```

### Bước 4: Chạy Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Setup data partitioning
node migrations/add-data-partitioning.js

cd ..
```

### Bước 5: Khởi động ứng dụng

```bash
# Sử dụng script tự động
chmod +x deploy-data-optimization.sh
./deploy-data-optimization.sh

# Hoặc khởi động thủ công
cd backend && npm start &
cd frontend && npm start &
```

## ☁️ Triển khai Heroku

### Bước 1: Cài đặt Heroku CLI

```bash
# Cài đặt Heroku CLI
npm install -g heroku

# Đăng nhập
heroku login
```

### Bước 2: Triển khai tự động

```bash
# Chạy script deployment Heroku
chmod +x deploy-heroku-data-optimization.sh
./deploy-heroku-data-optimization.sh
```

### Bước 3: Kiểm tra deployment

```bash
# Verify deployment
./verify-heroku-deployment.sh

# Check logs
heroku logs --tail --app minicde-production
```

## 🏭 Triển khai Production

### Bước 1: Chuẩn bị server

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Cài đặt Redis
sudo apt install redis-server -y
```

### Bước 2: Cấu hình firewall

```bash
# Cấu hình UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw enable
```

### Bước 3: Triển khai ứng dụng

```bash
# Clone và setup
git clone <repository-url>
cd minicde

# Chạy script deployment
chmod +x deploy-data-optimization.sh
./deploy-data-optimization.sh

# Chọn setup systemd services khi được hỏi
```

### Bước 4: Cấu hình Nginx (tùy chọn)

```bash
# Cài đặt Nginx
sudo apt install nginx -y

# Tạo cấu hình
sudo tee /etc/nginx/sites-available/minicde << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/minicde /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Kiểm tra sức khỏe hệ thống
./health-check.sh

# Kiểm tra logs
tail -f /var/log/minicde/*.log

# Kiểm tra database
heroku pg:info --app minicde-production
```

### Data Maintenance

```bash
# Manual cleanup
heroku run npm run data-cleanup --app minicde-production

# Manual optimization
heroku run npm run data-optimize --app minicde-production

# Check storage metrics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://minicde-production.herokuapp.com/api/admin/storage-metrics
```

### Performance Monitoring

```bash
# Check Heroku metrics
heroku ps --app minicde-production

# Monitor database performance
heroku pg:ps --app minicde-production

# Check Redis usage
heroku redis:info --app minicde-production
```

## 🔧 Troubleshooting

### Lỗi thường gặp

#### 1. Database Connection Error

```bash
# Kiểm tra DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Reset database (cẩn thận!)
npx prisma migrate reset
```

#### 2. Memory Issues

```bash
# Check memory usage
free -h

# Check Node.js memory
node --max-old-space-size=4096 dist/index.js

# Optimize database
heroku run npx prisma db execute --stdin --app minicde-production << EOF
VACUUM ANALYZE;
REINDEX DATABASE minicde;
EOF
```

#### 3. Cron Jobs Not Running

```bash
# Check cron logs
sudo tail -f /var/log/cron

# Test cron job manually
cd backend && npm run data-cleanup

# Check Heroku scheduler
heroku scheduler --app minicde-production
```

#### 4. Build Failures

```bash
# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

### Log Analysis

```bash
# Backend logs
heroku logs --tail --app minicde-production

# Frontend logs
heroku logs --tail --app minicde-frontend

# Database logs
heroku logs --tail --app minicde-production | grep "database"

# Error logs
heroku logs --tail --app minicde-production | grep "ERROR"
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Analyze table statistics
ANALYZE;

-- Reindex tables
REINDEX TABLE "ActivityLog";
REINDEX TABLE "Notification";

-- Vacuum database
VACUUM ANALYZE;
```

### Application Optimization

```bash
# Enable compression
heroku config:set ENABLE_COMPRESSION=true --app minicde-production

# Optimize caching
heroku config:set CACHE_TTL=3600 --app minicde-production

# Enable query optimization
heroku config:set ENABLE_QUERY_OPTIMIZATION=true --app minicde-production
```

### Monitoring Setup

```bash
# Setup New Relic monitoring
heroku addons:create newrelic:wayne --app minicde-production

# Setup Papertrail logging
heroku addons:create papertrail:choklad --app minicde-production

# Setup Heroku Metrics
heroku labs:enable runtime-metrics --app minicde-production
```

## 🔒 Security Considerations

### Environment Variables

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Set secure environment variables
heroku config:set JWT_SECRET=your_secure_secret --app minicde-production
heroku config:set NODE_ENV=production --app minicde-production
```

### Database Security

```sql
-- Create read-only user for monitoring
CREATE USER minicde_monitor WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE minicde TO minicde_monitor;
GRANT USAGE ON SCHEMA public TO minicde_monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO minicde_monitor;
```

### Network Security

```bash
# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from your_ip to any port 22
sudo ufw allow from your_ip to any port 80
sudo ufw allow from your_ip to any port 443
```

## 📞 Support

### Getting Help

1. **Documentation**: Kiểm tra README.md và comments trong code
2. **Logs**: Xem logs để debug vấn đề
3. **Community**: Tham gia community forum
4. **Issues**: Tạo issue trên GitHub

### Emergency Contacts

- **System Admin**: admin@yourcompany.com
- **Database Admin**: dba@yourcompany.com
- **DevOps Team**: devops@yourcompany.com

---

## 🎯 Quick Start Commands

```bash
# Local development
./deploy-data-optimization.sh

# Heroku deployment
./deploy-heroku-data-optimization.sh

# Health check
./health-check.sh

# Start services
./start-minicde.sh

# Stop services
./stop-minicde.sh

# Restart services
./restart-minicde.sh
```

**Lưu ý**: Đảm bảo backup database trước khi chạy các script migration và optimization!
