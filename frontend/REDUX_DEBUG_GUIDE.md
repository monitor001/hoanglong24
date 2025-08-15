# Redux Debug Guide

Hướng dẫn sử dụng các công cụ debug Redux để tìm và sửa lỗi "Cannot destructure property 'store' of 'i' as it is null".

## 🔧 Các Công Cụ Debug Đã Tạo

### 1. Debug Store Utility (`src/utils/debugStore.ts`)
Cung cấp các chức năng debug Redux store:

```javascript
// Kiểm tra sức khỏe store
debugStore.checkStoreHealth()

// Xóa dữ liệu Redux
debugStore.clearReduxData()

// Test chức năng store
debugStore.testStore(store)

// Theo dõi thay đổi store
debugStore.monitorStore(store)

// Lấy thông tin chi tiết store
debugStore.getStoreInfo(store)
```

### 2. Redux Error Handler (`src/utils/reduxErrorHandler.ts`)
Xử lý và log chi tiết các lỗi Redux:

```javascript
// Xử lý lỗi
reduxErrorHandler.handleError(error, context)

// Kiểm tra lỗi thường gặp
reduxErrorHandler.checkCommonIssues()

// Theo dõi store
reduxErrorHandler.monitorStore(store)

// Validate cấu hình store
reduxErrorHandler.validateStoreConfig(store)

// Tạo báo cáo lỗi chi tiết
reduxErrorHandler.getErrorReport()
```

### 3. Safe Store Provider (`src/components/SafeStoreProvider.tsx`)
Provider an toàn với error handling và debug:

- Hiển thị loading state khi khởi tạo store
- Hiển thị error state khi có lỗi
- Tự động clear Redux data khi có lỗi
- Debug information trong development mode

### 4. Redux Debug Panel (`src/components/ReduxDebugPanel.tsx`)
Panel debug trực quan trong development mode:

- Nút debug nổi ở góc phải dưới
- Hiển thị thông tin store health
- Hiển thị thông tin store
- Hiển thị current state
- Các action debug (Health Check, Test Store, Clear & Reload)

### 5. Redux Error Boundary (`src/components/ReduxErrorBoundary.tsx`)
Error boundary với enhanced error handling:

- Bắt lỗi Redux
- Hiển thị error UI
- Log chi tiết lỗi
- Debug information trong development

## 🚀 Cách Sử Dụng

### Trong Browser Console

1. **Chạy test script:**
```javascript
// Copy và paste script từ test-redux-store.js vào console
```

2. **Sử dụng debug functions:**
```javascript
// Kiểm tra store health
debugStore.checkStoreHealth()

// Xóa Redux data
debugStore.clearReduxData()

// Lấy error report
reduxErrorHandler.getErrorReport()

// Xem test results
console.log(window.__REDUX_TEST_RESULTS__)
```

### Trong Development Mode

1. **Debug Panel:**
   - Nhấn nút 🔧 ở góc phải dưới để mở debug panel
   - Nhấn nút 🧹 để clear Redux data
   - Sử dụng các action buttons để test

2. **Console Logs:**
   - Tất cả debug information sẽ được log ra console
   - Error handling sẽ tự động capture Redux errors
   - Store monitoring sẽ log state changes

## 🔍 Tìm Lỗi "Cannot destructure property 'store'"

### Nguyên nhân có thể:

1. **Store chưa được khởi tạo đúng cách**
2. **Redux DevTools gây lỗi**
3. **Dữ liệu localStorage/sessionStorage bị corrupt**
4. **Provider không được wrap đúng cách**
5. **Circular dependencies**

### Các bước debug:

1. **Chạy test script:**
```javascript
// Copy test-redux-store.js vào console
```

2. **Kiểm tra store existence:**
```javascript
console.log('Store exists:', !!window.__REDUX_STORE__)
console.log('Store type:', typeof window.__REDUX_STORE__)
```

3. **Kiểm tra Redux DevTools:**
```javascript
console.log('DevTools available:', !!window.__REDUX_DEVTOOLS_EXTENSION__)
```

4. **Clear Redux data:**
```javascript
debugStore.clearReduxData()
window.location.reload()
```

5. **Kiểm tra Provider setup:**
```javascript
// Đảm bảo Provider được wrap đúng cách trong App.tsx
```

## 🛠️ Sửa Lỗi

### Nếu store không tồn tại:

1. Kiểm tra import store trong `src/store/index.ts`
2. Đảm bảo store được export default
3. Kiểm tra Provider setup trong App.tsx

### Nếu Redux DevTools gây lỗi:

1. Disable DevTools trong production
2. Clear DevTools data
3. Reload page

### Nếu dữ liệu bị corrupt:

1. Clear localStorage/sessionStorage
2. Clear Redux data
3. Reload page

### Nếu Provider setup sai:

1. Đảm bảo Provider wrap toàn bộ app
2. Kiểm tra thứ tự các providers
3. Đảm bảo store được pass đúng

## 📊 Monitoring

### Auto-monitoring trong development:

- Store health check tự động
- Error capture tự động
- State change monitoring
- Console error override

### Manual monitoring:

```javascript
// Start store monitoring
const monitor = reduxErrorHandler.monitorStore(store)

// Check error count
console.log('Error count:', monitor.errorCount())

// Get error log
console.log('Error log:', monitor.errorLog())

// Stop monitoring
monitor.unsubscribe()
```

## 🎯 Best Practices

1. **Luôn sử dụng SafeStoreProvider** thay vì Provider trực tiếp
2. **Wrap app với ReduxErrorBoundary** để catch errors
3. **Sử dụng debug tools** trong development
4. **Clear Redux data** khi có lỗi
5. **Monitor store** trong development mode
6. **Log errors** với context chi tiết

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **"Store is null"**
   - Kiểm tra store initialization
   - Clear Redux data và reload

2. **"Cannot destructure property 'store'"**
   - Kiểm tra Provider setup
   - Clear localStorage/sessionStorage

3. **"Redux DevTools error"**
   - Disable DevTools
   - Clear DevTools data

4. **"Store methods missing"**
   - Kiểm tra store configuration
   - Rebuild store

### Commands hữu ích:

```javascript
// Full debug
debugStore.checkStoreHealth()
reduxErrorHandler.getErrorReport()

// Quick fix
debugStore.clearReduxData()
window.location.reload()

// Test store
debugStore.testStore(window.__REDUX_STORE__)
```
