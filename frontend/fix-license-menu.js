const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra menu License trong MainLayout...');

const mainLayoutPath = path.join(__dirname, 'src', 'layouts', 'MainLayout.tsx');
const content = fs.readFileSync(mainLayoutPath, 'utf8');

// Kiểm tra import KeyOutlined
if (content.includes('KeyOutlined')) {
  console.log('✅ KeyOutlined đã được import');
} else {
  console.log('❌ KeyOutlined chưa được import');
}

// Kiểm tra menu item licenses
if (content.includes("key: 'licenses'")) {
  console.log('✅ Menu item licenses đã được thêm');
} else {
  console.log('❌ Menu item licenses chưa được thêm');
}

// Kiểm tra navigate('/licenses')
if (content.includes("navigate('/licenses')")) {
  console.log('✅ Navigation đến /licenses đã được cấu hình');
} else {
  console.log('❌ Navigation đến /licenses chưa được cấu hình');
}

// Kiểm tra label
if (content.includes("label: 'Quản lý License'")) {
  console.log('✅ Label "Quản lý License" đã được cấu hình');
} else {
  console.log('❌ Label "Quản lý License" chưa được cấu hình');
}

console.log('\n📋 Hướng dẫn khắc phục:');
console.log('1. Clear browser cache (Ctrl+Shift+R)');
console.log('2. Restart development server');
console.log('3. Kiểm tra console browser để xem lỗi');
console.log('4. Đảm bảo đã đăng nhập với quyền admin');
