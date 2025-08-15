# Hướng dẫn đóng góp cho MiniCDE

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án MiniCDE! Tài liệu này sẽ hướng dẫn bạn cách đóng góp một cách hiệu quả.

## 🚀 Bắt đầu

### Yêu cầu hệ thống
- Node.js 18+
- PostgreSQL 14+
- Git

### Thiết lập môi trường phát triển

1. **Fork repository**
   ```bash
   # Fork repository trên GitHub, sau đó clone về máy
   git clone https://github.com/YOUR_USERNAME/hoanglong24.git
   cd hoanglong24
   ```

2. **Thiết lập upstream**
   ```bash
   git remote add upstream https://github.com/monitor001/hoanglong24.git
   ```

3. **Cài đặt dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Cấu hình environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Chỉnh sửa các biến môi trường
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Chỉnh sửa REACT_APP_API_URL
   ```

5. **Setup database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

## 📝 Quy trình đóng góp

### 1. Tạo Issue
- Kiểm tra xem issue đã tồn tại chưa
- Tạo issue mới với mô tả chi tiết
- Sử dụng template có sẵn

### 2. Tạo Branch
```bash
git checkout -b feature/your-feature-name
# hoặc
git checkout -b fix/your-fix-name
```

### 3. Phát triển
- Tuân thủ coding standards
- Viết tests cho tính năng mới
- Cập nhật documentation nếu cần

### 4. Commit
```bash
git add .
git commit -m "feat: add new feature description"
```

**Convention cho commit messages:**
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật documentation
- `style:` - Thay đổi format code
- `refactor:` - Refactor code
- `test:` - Thêm/sửa tests
- `chore:` - Cập nhật build tools, dependencies

### 5. Push và tạo Pull Request
```bash
git push origin feature/your-feature-name
```

## 🎯 Coding Standards

### TypeScript
- Sử dụng strict mode
- Định nghĩa interface cho tất cả objects
- Tránh sử dụng `any` type
- Sử dụng type guards khi cần thiết

### React
- Sử dụng functional components
- Implement proper hooks usage
- Sử dụng React.memo cho performance
- Implement error boundaries

### Backend
- Sử dụng async/await thay vì callbacks
- Implement proper error handling
- Validate input data
- Sử dụng TypeScript cho type safety

### Styling
- Sử dụng CSS modules hoặc styled-components
- Implement responsive design
- Tuân thủ design system
- Tối ưu cho mobile

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
# Chạy toàn bộ test suite
npm run test:e2e
```

## 📱 Mobile & Tablet Optimization

Khi phát triển tính năng mới, đảm bảo:

1. **Responsive Design**
   - Test trên mobile (320px - 768px)
   - Test trên tablet landscape (768px - 1024px)
   - Test trên desktop (1024px+)

2. **Touch Optimization**
   - Touch targets tối thiểu 44px
   - Swipe gestures support
   - Mobile-friendly forms

3. **Performance**
   - Lazy loading
   - Optimized images
   - Minimal network requests

## 🔍 Code Review

### Checklist cho Pull Request
- [ ] Code tuân thủ coding standards
- [ ] Tests đã được viết và pass
- [ ] Documentation đã được cập nhật
- [ ] Responsive design đã được test
- [ ] Performance không bị ảnh hưởng
- [ ] Security best practices được tuân thủ

### Review Process
1. Tạo Pull Request với mô tả chi tiết
2. Assign reviewers
3. Address feedback
4. Merge sau khi được approve

## 🚀 Deployment

### Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### Production
Dự án được deploy tự động lên Heroku khi merge vào main branch.

## 📚 Documentation

### Cập nhật Documentation
- README.md cho thay đổi lớn
- API documentation cho backend changes
- Component documentation cho frontend changes
- Update CHANGELOG.md

### Code Comments
- Comment cho complex logic
- JSDoc cho functions và classes
- Inline comments cho business logic

## 🐛 Bug Reports

### Template cho Bug Report
```markdown
**Mô tả bug**
Mô tả ngắn gọn về bug

**Các bước tái hiện**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
Mô tả hành vi mong đợi

**Screenshots**
Nếu có thể, thêm screenshots

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 22]

**Additional context**
Thông tin bổ sung
```

## 💡 Feature Requests

### Template cho Feature Request
```markdown
**Mô tả tính năng**
Mô tả chi tiết tính năng mong muốn

**Use case**
Tại sao tính năng này cần thiết

**Proposed solution**
Đề xuất cách implement

**Alternatives considered**
Các giải pháp thay thế

**Additional context**
Thông tin bổ sung
```

## 🤝 Community

### Communication
- Sử dụng GitHub Issues cho discussions
- Join Discord/Slack channel nếu có
- Follow code of conduct

### Recognition
- Contributors sẽ được ghi nhận trong README
- Significant contributions sẽ được highlight
- Regular contributors có thể được mời làm maintainer

## 📄 License

Bằng cách đóng góp, bạn đồng ý rằng đóng góp của bạn sẽ được cấp phép theo cùng license của dự án.

---

**Cảm ơn bạn đã đóng góp cho MiniCDE! 🎉**
