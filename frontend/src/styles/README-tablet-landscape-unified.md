# Tablet Landscape Unified Forms CSS

## Tổng quan

File `tablet-landscape-unified-forms.css` được tạo ra để gộp tất cả các file CSS liên quan đến tablet landscape form styles thành một file duy nhất, đồng thời căn chỉnh để giống với desktop.

## Các file đã được gộp

### Files đã xóa:
- `tablet-landscape-final-improvements.css`
- `tablet-landscape-optimization.css`
- `tablet-landscape-form-optimization.css`
- `tablet-landscape-edit-forms.css`
- `tablet-landscape-collapsible-filters.css`
- `form-size-consistency.css`
- `tablet-landscape-test.css`
- `tablet-landscape-unified.css`

### Files đã được cập nhật:
- `mobile-form-margin-optimization.css` - Đã xóa phần tablet landscape form styles

## Các cải tiến chính

### 1. **Giảm Padding/Margin**
- **Trước**: `padding: 16px`, `margin-bottom: 16px`
- **Sau**: `padding: 12px`, `margin-bottom: 8px`
- **Lý do**: Giống với desktop để tránh quá nhiều khoảng trống

### 2. **Kích thước Input/Button**
- **Trước**: `height: 40px`
- **Sau**: `height: 32px`
- **Lý do**: Giống với desktop standard

### 3. **Font Size**
- **Trước**: `font-size: 13px` cho labels
- **Sau**: `font-size: 14px` cho labels
- **Lý do**: Đồng nhất với desktop

### 4. **Modal Styling**
- **Trước**: `border-radius: 12px`, `box-shadow: 0 8px 32px`
- **Sau**: `border-radius: 8px`, `box-shadow: 0 4px 16px`
- **Lý do**: Giống với desktop modal style

## Breakpoint

```css
@media (min-width: 769px) and (max-width: 1366px) and (orientation: landscape)
```

## Các tính năng được hỗ trợ

1. **Modal Forms** - Edit forms trong modal
2. **Filter Forms** - Bộ lọc cho các trang
3. **Input Fields** - Input, Select, DatePicker, Textarea
4. **Dark Theme** - Hỗ trợ đầy đủ dark mode
5. **Responsive** - Tối ưu cho 2 breakpoint con:
   - Smaller tablets (769px - 1024px)
   - Larger tablets (1025px - 1366px)

## Cách sử dụng

File này được import tự động trong `index.css`:

```css
@import './styles/tablet-landscape-unified-forms.css';
```

## Lợi ích

1. **Giảm số lượng file** - Từ 8+ files xuống 1 file
2. **Dễ bảo trì** - Tất cả styles ở một nơi
3. **Tránh xung đột** - Không có duplicate styles
4. **Performance** - Ít HTTP requests hơn
5. **Consistency** - Đồng nhất với desktop design

## Lưu ý

- Tất cả styles đều có `!important` để đảm bảo override
- Dark theme được hỗ trợ đầy đủ
- Responsive breakpoints được tối ưu cho tablet landscape
- Padding/margin được giảm để giống với desktop
