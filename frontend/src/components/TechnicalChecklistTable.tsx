import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Table, Tag, message } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ChecklistItem {
  id: string;
  order: number;
  content: string;
  category: string;
  isChecked?: boolean;
  notes?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'reviewed';
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface TechnicalChecklistTableProps {
  category: string;
  items: ChecklistItem[];
  onDataChange?: (data: ChecklistItem[]) => void;
  readOnly?: boolean;
}

const TechnicalChecklistTable: React.FC<TechnicalChecklistTableProps> = ({
  category,
  items,
  onDataChange,
  readOnly = false
}) => {
  const [data, setData] = useState<ChecklistItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!Array.isArray(items)) {
      console.error('Items is not an array:', items);
      setData([]);
      return;
    }
    
    setData(items.map(item => ({
      ...item,
      isChecked: item.isChecked || false,
      notes: item.notes || '',
      status: item.status || 'pending',
      assignee: item.assignee || '',
      dueDate: item.dueDate || '',
      priority: item.priority || 'medium'
    })));
  }, [items]);

  const handleSave = () => {
    message.success('Đã lưu thay đổi');
    setIsEditing(false);
    onDataChange?.(data);
  };

  const handleCancel = () => {
    if (!Array.isArray(items)) {
      console.error('Items is not an array:', items);
      setData([]);
      setIsEditing(false);
      message.info('Đã hủy thay đổi');
      return;
    }
    
    setData(items.map(item => ({
      ...item,
      isChecked: item.isChecked || false,
      notes: item.notes || '',
      status: item.status || 'pending',
      assignee: item.assignee || '',
      dueDate: item.dueDate || '',
      priority: item.priority || 'medium'
    })));
    setIsEditing(false);
    message.info('Đã hủy thay đổi');
  };

  const getProgressStats = () => {
    const total = data.length;
    const completed = data.filter(item => item.isChecked).length;
    const inProgress = data.filter(item => item.status === 'in-progress').length;
    const pending = data.filter(item => item.status === 'pending').length;
    const reviewed = data.filter(item => item.status === 'reviewed').length;

    return { total, completed, inProgress, pending, reviewed };
  };

  const statusMap: { [key: string]: { text: string; color: string } } = {
    'pending': { text: 'Chờ thực hiện', color: 'orange' },
    'in-progress': { text: 'Đang thực hiện', color: 'blue' },
    'completed': { text: 'Hoàn thành', color: 'green' },
    'reviewed': { text: 'Đã kiểm tra', color: 'purple' }
  };

  const priorityMap: { [key: string]: { text: string; color: string } } = {
    'low': { text: 'Thấp', color: 'green' },
    'medium': { text: 'Trung bình', color: 'orange' },
    'high': { text: 'Cao', color: 'red' },
    'critical': { text: 'Khẩn cấp', color: 'red' }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'order',
      key: 'order',
      width: 60,
      render: (text: number) => <Text strong>{text}</Text>
    },
    {
      title: 'Nội dung kiểm tra',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      render: (text: string) => (
        <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
          {text}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusInfo = statusMap[status] || statusMap['pending'];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: 'Đã kiểm tra',
      dataIndex: 'isChecked',
      key: 'isChecked',
      width: 100,
      render: (checked: boolean) => (
        <span style={{ color: checked ? '#52c41a' : '#d9d9d9', fontSize: '16px' }}>
          {checked ? '✓' : '○'}
        </span>
      )
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 150
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120
    },
    {
      title: 'Mức độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority: string) => {
        const priorityInfo = priorityMap[priority] || priorityMap['medium'];
        return <Tag color={priorityInfo.color}>{priorityInfo.text}</Tag>;
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 200
    }
  ];

  const stats = getProgressStats();

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Bảng kiểm tra chi tiết - {category}
          </Title>
          {!readOnly && (
            <Space>
              {!isEditing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                  >
                    Lưu
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>
                </>
              )}
            </Space>
          )}
        </Space>
      }
      extra={
        <Space>
          <Text strong>Tổng cộng: {stats.total}</Text>
          <Text type="warning">Chờ thực hiện: {stats.pending}</Text>
          <Text>Đang thực hiện: {stats.inProgress}</Text>
          <Text type="success">Hoàn thành: {stats.completed}</Text>
          <Text type="secondary">Đã kiểm tra: {stats.reviewed}</Text>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 1200 }}
        size="small"
        bordered
      />
    </Card>
  );
};

export default TechnicalChecklistTable; 