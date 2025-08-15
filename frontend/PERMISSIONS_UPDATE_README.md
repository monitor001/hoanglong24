# Cập Nhật Hệ Thống Phân Quyền

## Tổng Quan

Đã cập nhật ứng dụng để đảm bảo 3 yêu cầu chính:

1. **Luôn login khi lần đầu vào ứng dụng** - Tự động redirect đến login nếu chưa có token
2. **Luôn Load phân quyền khi login** - Load permissions ngay sau khi login thành công
3. **Chỉ load phân quyền tại database** - Đảm bảo permissions chỉ được load từ database

## Các Thay Đổi Chính

### 1. App.tsx - Cải thiện Authentication Flow

- **PrivateRoute**: Tự động redirect đến login nếu chưa có token
- **AppInitializer**: Component mới để khởi tạo app và load permissions
- **PermissionValidator**: Validation để đảm bảo permissions được load từ database

```typescript
// Tự động load permissions sau khi login
useEffect(() => {
  if (auth.user?.id && !auth.isLoading) {
    dispatch(fetchUserPermissions(auth.user.id));
  }
}, [auth.user?.id, auth.isLoading, dispatch]);
```

### 2. AuthSlice - Tự động Load Permissions

- **Login**: Tự động load permissions sau khi login thành công
- **2FA Verification**: Tự động load permissions sau khi xác thực 2FA
- **Session Management**: Sử dụng SessionManager để quản lý session

```typescript
// Load user permissions immediately after successful login
if (response.data.user?.id) {
  console.log('🔄 Login successful, loading user permissions...');
  const { fetchUserPermissions } = await import('./permissionSlice');
  dispatch(fetchUserPermissions(response.data.user.id));
}
```

### 3. PermissionSlice - Chỉ Database Source

- **fetchUserPermissions**: Chỉ load từ database, không có fallback
- **Validation**: Kiểm tra response từ database
- **Error Handling**: Xử lý lỗi khi không thể load từ database

```typescript
// Ensure we only use database permissions, no fallback
if (!response.data || !response.data.permissions) {
  throw new Error('Invalid permissions response from database');
}
```

### 4. usePermissionsOptimized - Loại bỏ Fallback

- **Database Only**: Chỉ sử dụng permissions từ database
- **No Hardcoded Permissions**: Loại bỏ tất cả fallback permissions
- **Better Error Handling**: Hiển thị lỗi rõ ràng khi không load được permissions

### 5. usePermissions - Cải thiện Database Loading

- **Database Source**: Chỉ load từ database
- **Validation**: Kiểm tra permissions có hợp lệ không
- **Retry Mechanism**: Tự động thử lại nếu load thất bại

### 6. Components Mới

#### PermissionLoadingIndicator
- Hiển thị loading state khi đang load permissions
- Hiển thị error state khi load thất bại
- Có nút "Thử lại" để reload

#### PermissionValidator
- Utility để validate permissions được load từ database
- Kiểm tra trạng thái permissions
- Logging cho debugging

### 7. MainLayout - Permission Loading State

- Hiển thị loading indicator khi permissions đang load
- Hiển thị error message khi load thất bại
- Chỉ render content khi permissions đã load xong

## Cách Hoạt Động

### 1. Khi User Truy Cập Lần Đầu

```
1. User truy cập ứng dụng
2. App kiểm tra token trong localStorage
3. Nếu không có token → Redirect đến /login
4. User đăng nhập thành công
5. Tự động load permissions từ database
6. Redirect đến trang chính
```

### 2. Khi User Đã Login

```
1. App khởi tạo với token có sẵn
2. AppInitializer kiểm tra user
3. Tự động load permissions từ database
4. PermissionValidator validate permissions
5. Render ứng dụng với permissions đã load
```

### 3. Permission Loading Flow

```
1. Login thành công
2. Dispatch fetchUserPermissions(userId)
3. API call đến /permissions/user/{userId}
4. Backend query database cho user permissions
5. Response chứa permissions từ database
6. Store permissions trong Redux state
7. Components sử dụng permissions từ store
```

## Testing

### Test Script

Chạy script test để kiểm tra permissions loading:

```bash
cd frontend
node test-permissions-loading.js
```

### Manual Testing

1. **Login Test**:
   - Đăng nhập với user bất kỳ
   - Kiểm tra console log có hiển thị "Loading user permissions..."
   - Kiểm tra permissions được load thành công

2. **Permission Check Test**:
   - Truy cập các trang khác nhau
   - Kiểm tra permissions hoạt động đúng
   - Kiểm tra không có fallback permissions

3. **Error Handling Test**:
   - Tắt database connection
   - Kiểm tra error message hiển thị đúng
   - Kiểm tra không có fallback permissions

## Database Requirements

### Permissions Table

```sql
-- Đảm bảo có permissions trong database
SELECT * FROM "Permission" WHERE "isActive" = true;

-- Đảm bảo có role permissions
SELECT * FROM "RolePermission" WHERE "granted" = true;

-- Đảm bảo user có role
SELECT * FROM "User" WHERE "id" = 'user-id';
```

### API Endpoints

- `GET /api/permissions/user/{userId}` - Load user permissions
- `GET /api/settings/permissions-config` - Load permission matrix
- `POST /api/auth/check-permission` - Check specific permission

## Monitoring

### Console Logs

- `🔄 Login successful, loading user permissions...`
- `✅ User permissions loaded from database`
- `❌ Failed to fetch user permissions from database`

### Redux State

```typescript
// Kiểm tra permissions state
const permissions = useSelector((state) => state.permissions);
console.log('Permissions state:', permissions);
```

## Troubleshooting

### Lỗi Thường Gặp

1. **"No permissions found in database"**
   - Kiểm tra user có role không
   - Kiểm tra role có permissions không
   - Kiểm tra database connection

2. **"Failed to load permissions from database"**
   - Kiểm tra API endpoint có hoạt động không
   - Kiểm tra authentication token
   - Kiểm tra backend logs

3. **"Empty permissions array"**
   - Kiểm tra RolePermission table
   - Kiểm tra Permission table có active permissions
   - Kiểm tra user role mapping

### Debug Commands

```bash
# Test permissions loading
node test-permissions-loading.js

# Check Redux state
# Mở Redux DevTools trong browser

# Check API endpoints
curl -H "Authorization: Bearer TOKEN" \
  https://api-url/permissions/user/USER_ID
```

## Performance

### Optimizations

- **Caching**: Permissions được cache trong Redux state
- **Lazy Loading**: Chỉ load khi cần thiết
- **Validation**: Kiểm tra permissions trước khi sử dụng
- **Error Recovery**: Tự động retry khi load thất bại

### Monitoring

- Theo dõi thời gian load permissions
- Theo dõi số lần retry
- Theo dõi error rate
- Theo dõi cache hit rate

## Security

### Database Security

- Permissions chỉ được load từ database
- Không có hardcoded permissions
- Validation tất cả permissions
- Audit logging cho permission changes

### API Security

- Authentication required cho tất cả permission endpoints
- Authorization check cho user permissions
- Rate limiting cho permission requests
- Input validation cho permission parameters
