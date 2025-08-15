# TabletLandscapeFAB Component

Component `TabletLandscapeFAB` được thiết kế để quản lý nhiều Floating Action Button (FAB) cho tablet landscape với layout responsive và animations mượt mà.

## Tính năng chính

- ✅ **Responsive Design**: Tự động hiển thị/ẩn dựa trên breakpoint
- ✅ **Multiple Actions**: Hỗ trợ nhiều actions với SpeedDial
- ✅ **Main Action**: Hỗ trợ main action với sub-actions
- ✅ **Flexible Positioning**: 4 vị trí khác nhau (bottom-right, bottom-left, top-right, top-left)
- ✅ **Customizable Colors**: Mỗi action có thể có màu riêng
- ✅ **Accessibility**: Hỗ trợ keyboard navigation và screen readers
- ✅ **Dark Theme**: Tự động hỗ trợ dark theme
- ✅ **Animations**: Smooth animations và hover effects

## Cài đặt

```bash
# Component đã được tạo sẵn trong thư mục components/
# Import và sử dụng trực tiếp
```

## Cách sử dụng

### 1. Import Component

```tsx
import TabletLandscapeFAB, { FABAction } from './components/TabletLandscapeFAB';
```

### 2. Định nghĩa Actions

```tsx
const actions: FABAction[] = [
  {
    id: 'add',
    icon: <Add />,
    label: 'Thêm mới',
    onClick: () => console.log('Thêm mới'),
    color: 'primary',
    tooltip: 'Thêm item mới'
  },
  {
    id: 'edit',
    icon: <Edit />,
    label: 'Chỉnh sửa',
    onClick: () => console.log('Chỉnh sửa'),
    color: 'info'
  },
  {
    id: 'delete',
    icon: <Delete />,
    label: 'Xóa',
    onClick: () => console.log('Xóa'),
    color: 'error'
  }
];
```

### 3. Sử dụng Component

```tsx
// FAB đơn giản với một action
<TabletLandscapeFAB
  actions={[singleAction]}
  position="bottom-right"
  showOnTablet={true}
  showOnDesktop={true}
  showOnMobile={true}
/>

// SpeedDial với nhiều actions
<TabletLandscapeFAB
  actions={actions}
  position="bottom-right"
  showOnTablet={true}
  showOnDesktop={false}
  showOnMobile={false}
/>

// SpeedDial với main action
<TabletLandscapeFAB
  actions={subActions}
  mainAction={mainAction}
  position="bottom-right"
  showOnTablet={true}
/>
```

## Props

### TabletLandscapeFABProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `FABAction[]` | `[]` | Danh sách các actions |
| `mainAction` | `FABAction?` | `undefined` | Main action (optional) |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Vị trí của FAB |
| `showOnTablet` | `boolean` | `true` | Hiển thị trên tablet |
| `showOnDesktop` | `boolean` | `false` | Hiển thị trên desktop |
| `showOnMobile` | `boolean` | `false` | Hiển thị trên mobile |
| `className` | `string` | `''` | CSS class tùy chỉnh |
| `style` | `React.CSSProperties` | `{}` | Inline styles |

### FABAction

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Unique identifier |
| `icon` | `React.ReactNode` | - | Icon component |
| `label` | `string` | - | Label hiển thị |
| `onClick` | `() => void` | - | Function được gọi khi click |
| `color` | `'primary' \| 'secondary' \| 'error' \| 'info' \| 'success' \| 'warning'` | `'primary'` | Màu của action |
| `disabled` | `boolean` | `false` | Disable action |
| `tooltip` | `string` | - | Custom tooltip text |

## Ví dụ sử dụng

### 1. FAB đơn giản

```tsx
const singleAction: FABAction = {
  id: 'add',
  icon: <Add />,
  label: 'Thêm mới',
  onClick: () => handleAdd(),
  color: 'primary'
};

<TabletLandscapeFAB actions={[singleAction]} />
```

### 2. Quản lý dự án

```tsx
const projectActions: FABAction[] = [
  {
    id: 'add-project',
    icon: <Add />,
    label: 'Thêm dự án',
    onClick: () => handleAddProject(),
    color: 'primary'
  },
  {
    id: 'edit-project',
    icon: <Edit />,
    label: 'Chỉnh sửa',
    onClick: () => handleEditProject(),
    color: 'info'
  },
  {
    id: 'delete-project',
    icon: <Delete />,
    label: 'Xóa dự án',
    onClick: () => handleDeleteProject(),
    color: 'error'
  }
];

<TabletLandscapeFAB 
  actions={projectActions}
  position="bottom-left"
  showOnTablet={true}
/>
```

### 3. Quản lý tài liệu với main action

```tsx
const mainAction: FABAction = {
  id: 'document-actions',
  icon: <MoreVert />,
  label: 'Tùy chọn tài liệu',
  onClick: () => console.log('Mở menu tài liệu'),
  color: 'primary'
};

const documentActions: FABAction[] = [
  {
    id: 'download',
    icon: <Download />,
    label: 'Tải xuống',
    onClick: () => handleDownload(),
    color: 'primary'
  },
  {
    id: 'share',
    icon: <Share />,
    label: 'Chia sẻ',
    onClick: () => handleShare(),
    color: 'info'
  },
  {
    id: 'print',
    icon: <Print />,
    label: 'In tài liệu',
    onClick: () => handlePrint(),
    color: 'warning'
  }
];

<TabletLandscapeFAB 
  actions={documentActions}
  mainAction={mainAction}
  position="top-right"
/>
```

## Responsive Behavior

Component tự động điều chỉnh dựa trên breakpoint:

- **Mobile** (`< 768px`): Chỉ hiển thị khi `showOnMobile={true}`
- **Tablet** (`768px - 1024px`): Chỉ hiển thị khi `showOnTablet={true}`
- **Desktop** (`> 1024px`): Chỉ hiển thị khi `showOnDesktop={true}`

## Styling

Component sử dụng CSS modules với các class:

- `.tablet-landscape-fab`: Class chính
- `.single-fab`: Cho FAB đơn giản
- `.speed-dial`: Cho SpeedDial
- `.bottom-right`, `.bottom-left`, `.top-right`, `.top-left`: Vị trí

## Accessibility

- Hỗ trợ keyboard navigation
- ARIA labels cho screen readers
- Focus management
- High contrast mode support

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- React 16.8+
- Material-UI 5+
- TypeScript 4.0+

## Demo

Xem file `TabletLandscapeFABDemo.tsx` để có ví dụ đầy đủ về cách sử dụng component.
