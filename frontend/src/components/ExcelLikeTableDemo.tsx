import React, { useState } from 'react';
import { Card, Button, Space, message, Typography } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import ExcelLikeTable from './ExcelLikeTable';

const { Title, Paragraph } = Typography;

interface DemoData {
  id: number;
  name: string;
  email: string;
  age: number;
  department: string;
  isActive: boolean;
}

const ExcelLikeTableDemo: React.FC = () => {
  const [data, setData] = useState<DemoData[]>([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', age: 25, department: 'IT', isActive: true },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', age: 30, department: 'HR', isActive: false },
    { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', age: 28, department: 'Marketing', isActive: true },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', age: 32, department: 'Finance', isActive: true },
  ]);

  const [columns, setColumns] = useState([
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 250 },
    { title: 'Tuổi', dataIndex: 'age', key: 'age', width: 100 },
    { title: 'Phòng ban', dataIndex: 'department', key: 'department', width: 150 },
    { title: 'Hoạt động', dataIndex: 'isActive', key: 'isActive', width: 120 },
  ]);

  const handleDataChange = (newData: any[]) => {
    setData(newData);
    message.success('Dữ liệu đã được cập nhật');
  };

  const handleAddRow = (index: number) => {
    const newRow: DemoData = {
      id: Math.max(...data.map(d => d.id)) + 1,
      name: '',
      email: '',
      age: 0,
      department: '',
      isActive: false
    };
    
    const newData = [...data];
    newData.splice(index + 1, 0, newRow);
    setData(newData);
    message.success('Đã thêm dòng mới');
  };

  const handleRemoveRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    message.success('Đã xóa dòng');
  };

  const handleRemoveColumn = (columnIndex: number, columnKey: string) => {
    const newColumns = columns.filter((_, index) => index !== columnIndex);
    setColumns(newColumns);
    
    // Remove the column data from all rows
    const newData = data.map(row => {
      const newRow = { ...row };
      delete newRow[columnKey as keyof DemoData];
      return newRow;
    });
    setData(newData);
    
    message.success(`Đã xóa cột "${columnKey}"`);
  };

  const handleResizeTable = (width: number, height: number) => {
    console.log('Bảng đã được resize:', { width, height });
    message.info(`Kích thước bảng: ${width}px × ${height}px`);
  };

  const resetData = () => {
    setData([
      { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', age: 25, department: 'IT', isActive: true },
      { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', age: 30, department: 'HR', isActive: false },
      { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', age: 28, department: 'Marketing', isActive: true },
      { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', age: 32, department: 'Finance', isActive: true },
    ]);
    message.success('Đã reset dữ liệu');
  };

  const addNewRow = () => {
    const newRow: DemoData = {
      id: Math.max(...data.map(d => d.id)) + 1,
      name: 'Người dùng mới',
      email: 'newuser@example.com',
      age: 25,
      department: 'IT',
      isActive: true
    };
    setData([...data, newRow]);
    message.success('Đã thêm dòng mới');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={3}>ExcelLikeTable Demo - Tính năng Resize và Xóa cột</Title>
          <Paragraph>
            Bảng này hỗ trợ các tính năng:
            <ul>
              <li>✅ Chỉnh sửa dữ liệu trực tiếp</li>
              <li>✅ Thêm/xóa dòng</li>
              <li>✅ <strong>Xóa cột</strong> (nút Xóa ở góc phải trên)</li>
              <li>✅ <strong>Resize bảng</strong> (kéo góc dưới bên phải)</li>
              <li>✅ Context menu (click chuột phải)</li>
              <li>✅ Copy/paste</li>
              <li>✅ Undo/redo</li>
            </ul>
          </Paragraph>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addNewRow}
            >
              Thêm dòng
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={resetData}
            >
              Reset dữ liệu
            </Button>
          </Space>
        </div>

        <div style={{ 
          height: '500px', 
          border: '1px solid #d9d9d9', 
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <ExcelLikeTable
            data={data}
            columns={columns}
            onDataChange={handleDataChange}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onRemoveColumn={handleRemoveColumn}
            onResizeTable={handleResizeTable}
            resizable={true}
            showColumnControls={true}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <Title level={4}>Hướng dẫn sử dụng:</Title>
          <Paragraph>
            <strong>Xóa cột:</strong> Click vào nút Xóa (🗑️) ở góc phải trên của bảng, hoặc click chuột phải vào header cột và chọn "Xóa cột"
          </Paragraph>
          <Paragraph>
            <strong>Resize bảng:</strong> Kéo góc dưới bên phải của bảng để thay đổi kích thước
          </Paragraph>
          <Paragraph>
            <strong>Thêm dòng:</strong> Click chuột phải vào bảng và chọn "Thêm dòng phía trên" hoặc "Thêm dòng phía dưới"
          </Paragraph>
          <Paragraph>
            <strong>Xóa dòng:</strong> Click chuột phải vào dòng và chọn "Xóa dòng"
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ExcelLikeTableDemo; 