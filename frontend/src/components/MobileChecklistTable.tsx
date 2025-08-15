import React from 'react';
import { Card, List, Avatar, Tag, Progress, Button, Space, Typography, Badge } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ProjectOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;

interface Checklist {
  id: string;
  name: string;
  project: {
    id: string;
    name: string;
    code: string;
  };
  description?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  items: any[];
  _count?: {
    items: number;
  };
}

interface MobileChecklistTableProps {
  checklists: Checklist[];
  onViewChecklist: (checklist: Checklist) => void;
  onEditChecklist: (checklist: Checklist) => void;
  onDeleteChecklist: (id: string) => void;
  loading?: boolean;
}

const MobileChecklistTable: React.FC<MobileChecklistTableProps> = ({
  checklists,
  onViewChecklist,
  onEditChecklist,
  onDeleteChecklist,
  loading = false
}) => {
  const getProgressPercentage = (checklist: Checklist) => {
    const totalItems = checklist._count?.items || checklist.items.length;
    const checkedItems = checklist.items.filter(item => item.isChecked).length;
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage === 100) return 'green';
    if (percentage > 0) return 'blue';
    return 'default';
  };

  const getStatusText = (percentage: number) => {
    if (percentage === 100) return 'Hoàn thành';
    if (percentage > 0) return 'Đang thực hiện';
    return 'Chưa bắt đầu';
  };

  const renderChecklistCard = (checklist: Checklist) => {
    const progressPercentage = getProgressPercentage(checklist);
    const statusColor = getStatusColor(progressPercentage);
    const statusText = getStatusText(progressPercentage);

    return (
      <Card 
        key={checklist.id} 
        className="mobile-checklist-card"
        style={{ marginBottom: 16 }}
      >
        <div className="mobile-checklist-header">
          <div className="mobile-checklist-title">
            <Title level={5} style={{ margin: 0, color: '#1890ff', cursor: 'pointer' }}>
              {checklist.name}
            </Title>
            {checklist.description && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {checklist.description}
              </Text>
            )}
          </div>
          <Badge 
            status={statusColor as any} 
            text={statusText}
            style={{ fontSize: '12px' }}
          />
        </div>

        <div className="mobile-checklist-info">
          <div className="mobile-checklist-project">
            <Avatar size="small" icon={<ProjectOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div>
              <Text strong style={{ fontSize: '13px' }}>{checklist.project.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '11px' }}>{checklist.project.code}</Text>
            </div>
          </div>

          <div className="mobile-checklist-creator">
            <Avatar size="small" icon={<UserOutlined />} />
            <Text style={{ fontSize: '12px' }}>{checklist.createdBy.name}</Text>
          </div>
        </div>

        <div className="mobile-checklist-progress">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: '12px' }}>Tiến độ</Text>
            <Text style={{ fontSize: '12px', fontWeight: 500 }}>
              {checklist.items.filter(item => item.isChecked).length}/{checklist._count?.items || checklist.items.length}
            </Text>
          </div>
          <Progress 
            percent={progressPercentage} 
            size="small" 
            strokeColor={statusColor === 'green' ? '#52c41a' : statusColor === 'blue' ? '#1890ff' : '#d9d9d9'}
          />
        </div>

        <div className="mobile-checklist-meta">
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Tạo: {moment(checklist.createdAt).format('DD/MM/YYYY')}
          </Text>
        </div>

        <div className="mobile-checklist-actions">
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewChecklist(checklist)}
              className="mobile-action-btn"
            >
              Xem
            </Button>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditChecklist(checklist)}
              className="mobile-action-btn"
            >
              Sửa
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteChecklist(checklist.id)}
              className="mobile-action-btn"
            >
              Xóa
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="mobile-loading-container">
        <div className="mobile-loading-spinner"></div>
        <Text>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="mobile-empty-state">
        <div className="mobile-empty-illustration">
          <FileTextOutlined />
        </div>
        <Title level={4} style={{ textAlign: 'center', margin: '16px 0 8px 0' }}>
          Chưa có checklist nào
        </Title>
        <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
          Bắt đầu tạo checklist đầu tiên để quản lý hồ sơ thiết kế của bạn
        </Text>
      </div>
    );
  }

  return (
    <div className="mobile-checklist-list">
      {checklists.map(renderChecklistCard)}
    </div>
  );
};

export default MobileChecklistTable; 