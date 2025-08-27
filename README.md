# MiniCDE - Hệ thống Quản lý Dự án và Tài liệu

## Mô tả dự án

MiniCDE là một hệ thống quản lý dự án và tài liệu toàn diện, được phát triển với kiến trúc microservices bao gồm backend Node.js/Express và frontend React/TypeScript. Hệ thống hỗ trợ quản lý dự án, tài liệu ISO, quy trình phê duyệt, và tích hợp với các dịch vụ cloud storage.

## 🚀 Tính năng chính

- **Quản lý dự án**: Tạo, chỉnh sửa, theo dõi tiến độ dự án
- **Quản lý tài liệu ISO**: Hỗ trợ các tiêu chuẩn ISO với metadata chi tiết
- **Hệ thống phê duyệt**: Workflow phê duyệt nhiều cấp
- **Quản lý người dùng**: Phân quyền chi tiết theo vai trò
- **Tích hợp cloud storage**: OneDrive, Google Drive, Azure
- **Báo cáo và thống kê**: Dashboard với biểu đồ trực quan
- **Responsive design**: Tối ưu cho mobile và tablet
- **Real-time notifications**: Thông báo thời gian thực

## 🛠 Công nghệ sử dụng

### Backend
- **Node.js** với Express.js
- **TypeScript** cho type safety
- **Prisma ORM** cho database operations
- **PostgreSQL** database
- **JWT** authentication
- **Multer** cho file uploads
- **Nodemailer** cho email notifications

### Frontend
- **React 18** với TypeScript
- **Redux Toolkit** cho state management
- **React Router** cho routing
- **Material-UI** cho UI components
- **Chart.js** cho biểu đồ
- **Axios** cho API calls
- **React Hook Form** cho form handling

### DevOps & Deployment
- **Heroku** cho production deployment
- **Docker** containerization
- **GitHub Actions** cho CI/CD
- **Nginx** reverse proxy

## 📁 Cấu trúc dự án

```
HoangLong24/
├── backend/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── prisma/              # Database schema & migrations
│   └── migrations/          # Database migration scripts
├── frontend/                # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store & slices
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # CSS styles
│   └── public/              # Static assets
└── docs/                    # Documentation
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 18+ 
- PostgreSQL 14+
- Git

### Backend Setup

1. **Clone repository**
```bash
git clone https://github.com/monitor001/hoanglong24.git
cd hoanglong24/backend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment**
```bash
cp .env.example .env
# Chỉnh sửa các biến môi trường trong file .env
```

4. **Setup database**
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

5. **Chạy development server**
```bash
npm run dev
```

### Frontend Setup

1. **Chuyển đến thư mục frontend**
```bash
cd ../frontend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment**
```bash
cp .env.example .env
# Chỉnh sửa REACT_APP_API_URL trong file .env
```

4. **Chạy development server**
```bash
npm start
```

## 🌐 Deployment

### Heroku Deployment (Current)

Dự án đã được cấu hình để deploy lên Heroku:

- **Backend**: https://minicde-production-589be4b0d52b.herokuapp.com
- **Frontend**: https://minicde-frontend-833302d6ab3c.herokuapp.com
- **Main Site**: https://qlda.hoanglong24.com

### Shared Hosting Deployment (New)

Dự án cũng hỗ trợ deployment lên Shared Hosting (VPS/Cloud):

- **Backend API**: https://qlda.hoanglong24.com/api
- **Frontend**: https://qlda.hoanglong24.com
- **Documentation**: [shared-hosting-setup.md](./shared-hosting-setup.md)

#### Quick Start for Shared Hosting:

```bash
# 1. Prepare migration from Heroku
./migrate-from-heroku.sh

# 2. Build for shared hosting
./deploy-shared-hosting.sh

# 3. Follow deployment guide
# See: shared-hosting-setup.md
```

### Environment Variables

#### Backend (Heroku)
```bash
NODE_ENV=production
JWT_SECRET=<your-jwt-secret>
DATABASE_URL=<postgresql-url>
```

#### Backend (Shared Hosting)
```bash
NODE_ENV=production
SHARED_HOSTING=true
JWT_SECRET=<your-jwt-secret>
DATABASE_URL=postgresql://user:password@localhost:5432/minicde_db
```

#### Frontend (Heroku)
```bash
REACT_APP_API_URL=https://minicde-production-589be4b0d52b.herokuapp.com/api
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

#### Frontend (Shared Hosting)
```bash
REACT_APP_API_URL=https://qlda.hoanglong24.com/api
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

## 📱 Responsive Design

Dự án được tối ưu hóa cho:
- **Desktop**: Full feature experience
- **Tablet**: Landscape mode optimization
- **Mobile**: Touch-friendly interface

### Mobile Optimizations
- Thu gọn action buttons
- Responsive card layouts
- Mobile-first filter design
- Touch-optimized forms
- Swipe gestures support

## 🔐 Bảo mật

- JWT authentication
- Role-based access control (RBAC)
- Input validation và sanitization
- HTTPS enforcement
- CORS configuration
- Rate limiting

## 📊 Monitoring & Performance

- Error boundaries
- Performance monitoring
- Database query optimization
- Caching strategies
- Logging system

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển bởi HoangLong24 Team.

## 📞 Liên hệ

- **Website**: https://qlda.hoanglong24.com
- **Email**: support@hoanglong24.com

---

**Lưu ý**: Đây là dự án đang trong quá trình phát triển. Vui lòng kiểm tra kỹ trước khi sử dụng trong môi trường production.
