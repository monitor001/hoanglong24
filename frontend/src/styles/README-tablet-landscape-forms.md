# Tablet Landscape Forms CSS Guide

## Tổng quan

Bộ CSS này được thiết kế để tối ưu hóa tất cả các form trong dự án cho chế độ tablet xoay ngang (landscape) với breakpoint từ 769px đến 1366px.

## Files CSS

### 1. `tablet-landscape-unified-forms.css`
- File gốc với các quy tắc cơ bản cho project, task, issue forms
- Tối ưu modal, form layout, input fields
- Hỗ trợ dark theme

### 2. `tablet-landscape-all-forms.css`
- Mở rộng cho tất cả các form khác trong dự án
- Bao gồm: Documents, Calendar, Notes, Approval, Users, Settings
- Quy tắc chung cho tất cả form elements

### 3. `tablet-landscape-special-forms.css`
- Xử lý các trường hợp đặc biệt và form phức tạp
- Dynamic forms, rich text editors, upload forms
- Inline editing, wizard forms, validation forms

## Cách sử dụng

### 1. Form cơ bản
```jsx
<Form className="tablet-landscape-edit-form">
  {/* Form content */}
</Form>
```

### 2. Form theo loại
```jsx
// Document forms
<Form className="document-upload-form">
<Form className="iso-metadata-form">
<Form className="document-edit-form">

// Calendar forms
<Form className="calendar-event-form">
<Form className="event-edit-form">
<Form className="event-create-form">

// Notes forms
<Form className="note-form">
<Form className="note-edit-form">
<Form className="note-create-form">

// Approval forms
<Form className="approval-form">
<Form className="approval-edit-form">
<Form className="approval-create-form">

// User forms
<Form className="user-form">
<Form className="user-edit-form">
<Form className="user-create-form">

// Settings forms
<Form className="settings-form">
<Form className="settings-edit-form">
```

### 3. Form đặc biệt
```jsx
// Dynamic forms
<Form className="dynamic-form">
<Form className="form-array">
<Form className="repeatable-form">

// Complex forms
<Form className="tabbed-form">
<Form className="collapsible-form">

// Upload forms
<Form className="upload-form">

// Rich text editors
<div className="rich-text-editor">
<div className="wysiwyg-editor">

// Search and filter forms
<Form className="advanced-search-form">
<Form className="complex-filter-form">

// Validation forms
<Form className="validation-form">

// Conditional forms
<Form className="conditional-form">

// Wizard forms
<Form className="wizard-form">

// Inline editing forms
<Form className="inline-edit-form">

// Ultra-compact forms
<Form className="ultra-compact-form">

// Responsive grid forms
<Form className="responsive-grid-form">

// Modal forms with scroll
<Modal className="modal-form-with-scroll">

// Drawer forms
<Drawer className="drawer-form">
```

## Tối ưu hóa

### 1. Kích thước input fields
- Height: 24px (compact) / 20px (ultra-compact)
- Font size: 12px (compact) / 10px (ultra-compact)
- Padding: 0 6px (compact) / 0 3px (ultra-compact)

### 2. Spacing
- Form gap: 4px (compact) / 1px (ultra-compact)
- Form item margin: 2px (compact) / 0px (ultra-compact)
- Row gap: 4px (compact) / 2px (ultra-compact)

### 3. Modal optimization
- Body padding: 2px 8px
- Header padding: 1px 8px
- Footer padding: 1px 8px 2px

## Responsive breakpoints

### Smaller tablets (769px - 1024px)
- Font size: 11px
- Button height: 24px
- Ultra-compact font: 9px

### Larger tablets (1025px - 1366px)
- Font size: 12px
- Button height: 24px
- Ultra-compact font: 10px

## Dark theme support

Tất cả các form đều hỗ trợ dark theme với các màu sắc tương ứng:
- Background: #141414
- Border: #434343
- Text: rgba(255, 255, 255, 0.85)
- Placeholder: rgba(255, 255, 255, 0.45)

## Lưu ý

1. Sử dụng `!important` để đảm bảo override các style mặc định
2. Tất cả các class đều có responsive adjustments
3. Hỗ trợ đầy đủ dark theme
4. Tối ưu cho không gian hạn chế trên tablet landscape

## Ví dụ sử dụng

```jsx
// Form đơn giản
<Form className="tablet-landscape-edit-form">
  <Form.Item label="Tên">
    <Input />
  </Form.Item>
  <Form.Item label="Mô tả">
    <TextArea />
  </Form.Item>
</Form>

// Form với modal
<Modal 
  className="tablet-landscape-edit-modal"
  title="Chỉnh sửa"
  visible={visible}
>
  <Form className="document-edit-form">
    {/* Form content */}
  </Form>
</Modal>

// Form phức tạp
<Form className="tabbed-form">
  <Tabs>
    <Tabs.TabPane tab="Thông tin cơ bản">
      <Form className="ultra-compact-form">
        {/* Compact form content */}
      </Form>
    </Tabs.TabPane>
  </Tabs>
</Form>
```
