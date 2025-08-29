# License Management System - MiniCDE

## Tổng quan

Hệ thống quản lý License cho MiniCDE cho phép quản lý license theo ID máy và thời gian sử dụng. Hệ thống bao gồm:

- **Backend API**: Quản lý license với đầy đủ CRUD operations
- **Frontend Admin**: Giao diện quản lý license cho admin
- **License Checker**: Component để kiểm tra và kích hoạt license
- **Database Schema**: Bảng License với các trường cần thiết

## Tính năng chính

### 1. Quản lý License
- ✅ Tạo license mới với license key tự động
- ✅ Chỉnh sửa thông tin license
- ✅ Xóa license
- ✅ Tìm kiếm và lọc license
- ✅ Xuất danh sách license ra CSV
- ✅ Thống kê license theo trạng thái

### 2. Thông tin License
- 🔑 **License Key**: Mã license duy nhất (format: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX)
- 💻 **Machine ID**: ID máy tính sử dụng
- 👤 **User Information**: Tên, số điện thoại, email người dùng
- 📅 **Usage Period**: Số ngày sử dụng
- 📊 **Status**: Trạng thái (ACTIVE, EXPIRED, SUSPENDED, REVOKED)
- 📅 **Date Range**: Ngày bắt đầu và kết thúc
- 🕒 **Last Used**: Lần sử dụng cuối cùng

### 3. Bảo mật
- 🔒 License key được tạo tự động và duy nhất
- 🛡️ Kiểm tra machine ID để tránh sử dụng trái phép
- ⏰ Tự động cập nhật trạng thái khi hết hạn
- 📝 Ghi log lần sử dụng cuối

## Cài đặt và Triển khai

### 1. Database Migration

```bash
# Chạy migration để tạo bảng License
cd backend
npx prisma db push

# Seed dữ liệu mẫu
node seed-licenses.js
```

### 2. Backend API

Các endpoint API:

```
POST   /api/licenses          - Tạo license mới
GET    /api/licenses          - Lấy danh sách license
GET    /api/licenses/stats    - Lấy thống kê license
GET    /api/licenses/:id      - Lấy chi tiết license
PUT    /api/licenses/:id      - Cập nhật license
DELETE /api/licenses/:id      - Xóa license
POST   /api/licenses/activate - Kích hoạt license
```

### 3. Frontend

#### Admin Panel
- Truy cập: `/licenses` (chỉ admin)
- Quản lý đầy đủ license với giao diện thân thiện
- Thống kê real-time
- Tìm kiếm và lọc nâng cao

#### License Checker
- Component để kiểm tra license
- Hiển thị thông tin chi tiết
- Tự động tạo machine ID

## Sử dụng

### 1. Tạo License mới

1. Vào trang **Quản lý License** trong admin panel
2. Click **"Tạo License"**
3. Điền thông tin:
   - **Machine ID**: ID máy tính (bắt buộc)
   - **Tên người dùng**: Tên người sử dụng (bắt buộc)
   - **Số điện thoại**: Số điện thoại (tùy chọn)
   - **Email**: Email (tùy chọn)
   - **Số ngày sử dụng**: Thời hạn license (bắt buộc)
   - **Ghi chú**: Ghi chú bổ sung (tùy chọn)

4. Click **"Tạo"** để tạo license

### 2. Kiểm tra License

1. Sử dụng component **LicenseChecker**
2. Nhập **License Key** cần kiểm tra
3. Click **"Kiểm tra và Kích hoạt License"**
4. Hệ thống sẽ hiển thị thông tin chi tiết license

### 3. Quản lý License

#### Tìm kiếm và Lọc
- **Tìm kiếm**: Theo license key, machine ID, tên người dùng
- **Lọc theo trạng thái**: ACTIVE, EXPIRED, SUSPENDED, REVOKED

#### Thống kê
- Tổng số license
- Số license đang hoạt động
- Số license đã hết hạn
- Số license tạm ngưng
- Số license sắp hết hạn (30 ngày)
- Tỷ lệ hoạt động

## Database Schema

```sql
model License {
  id          String   @id @default(uuid())
  licenseKey  String   @unique
  machineId   String
  userName    String
  userPhone   String?
  userEmail   String?
  usageDays   Int
  status      LicenseStatus @default(ACTIVE)
  startDate   DateTime @default(now())
  endDate     DateTime
  lastUsed    DateTime?
  notes       String?
  createdBy   User?    @relation("LicenseCreatedBy")
  createdById String?
  updatedBy   User?    @relation("LicenseUpdatedBy")
  updatedById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum LicenseStatus {
  ACTIVE
  EXPIRED
  SUSPENDED
  REVOKED
}
```

## API Examples

### Tạo License mới

```javascript
const response = await axios.post('/api/licenses', {
  machineId: 'MACHINE-001',
  userName: 'Nguyễn Văn A',
  userPhone: '0123456789',
  userEmail: 'nguyenvana@example.com',
  usageDays: 365,
  notes: 'License cho máy tính văn phòng'
});
```

### Kích hoạt License

```javascript
const response = await axios.post('/api/licenses/activate', {
  licenseKey: 'A1B2-C3D4-E5F6-G7H8-I9J0-K1L2-M3N4-O5P6',
  machineId: 'MACHINE-001'
});
```

### Lấy danh sách License

```javascript
const response = await axios.get('/api/licenses?page=1&limit=10&search=test&status=ACTIVE');
```

## Bảo mật và Quyền hạn

### Quyền hạn
- **manage_licenses**: Tạo, chỉnh sửa, xóa license
- **view_licenses**: Xem danh sách và thống kê license

### Bảo mật
- License key được tạo tự động và duy nhất
- Machine ID được kiểm tra để tránh sử dụng trái phép
- Tự động cập nhật trạng thái khi hết hạn
- Ghi log đầy đủ các thao tác

## Monitoring và Alerts

### Thống kê Real-time
- Số license đang hoạt động
- Số license sắp hết hạn
- Tỷ lệ sử dụng license

### Cảnh báo
- License sắp hết hạn (30 ngày)
- License đã hết hạn
- License bị tạm ngưng

## Troubleshooting

### Lỗi thường gặp

1. **"Machine ID đã được sử dụng"**
   - Mỗi machine ID chỉ được sử dụng cho một license
   - Kiểm tra và sử dụng machine ID khác

2. **"License đã hết hạn"**
   - License đã quá thời hạn sử dụng
   - Cần gia hạn hoặc tạo license mới

3. **"License không được phép sử dụng trên máy này"**
   - Machine ID không khớp với license
   - Kiểm tra machine ID và license key

### Log và Debug

```bash
# Xem log backend
cd backend
npm run dev

# Test API
node test-license-api.js
```

## Roadmap

### Tính năng sắp tới
- [ ] QR Code cho license
- [ ] Email thông báo khi license sắp hết hạn
- [ ] Bulk operations (tạo nhiều license cùng lúc)
- [ ] License templates
- [ ] Advanced reporting
- [ ] Integration với payment system

### Cải tiến
- [ ] Performance optimization
- [ ] Mobile responsive improvements
- [ ] Advanced search filters
- [ ] Export to Excel/PDF
- [ ] Real-time notifications

## Support

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
- Email: support@minicde.com
- Documentation: https://docs.minicde.com/license-management
- GitHub Issues: https://github.com/minicde/license-management/issues
