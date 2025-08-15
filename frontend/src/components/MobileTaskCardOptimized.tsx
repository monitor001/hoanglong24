import React from 'react';
import { Card, Tag, Button, Avatar, Progress, Space, Dropdown, Menu } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MessageOutlined,
  MoreOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

interface MobileTaskCardOptimizedProps {
  task: any;
  isDarkMode: boolean;
  onEdit: (task: any) => void;
  onDelete: (task: any) => void;
  onComment: (task: any) => void;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
}

const MobileTaskCardOptimized: React.FC<MobileTaskCardOptimizedProps> = ({
  task,
  isDarkMode,
  onEdit,
  onDelete,
  onComment,
  canEditTasks,
  canDeleteTasks
}) => {
  const navigate = useNavigate();

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'TODO':
        return { label: 'Chờ thực hiện', color: 'default', icon: '⏳' };
      case 'IN_PROGRESS':
        return { label: 'Đang thực hiện', color: 'processing', icon: '🔄' };
      case 'REVIEW':
        return { label: 'Đang xem xét', color: 'warning', icon: '👁️' };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: 'success', icon: '✅' };
      default:
        return { label: 'Không xác định', color: 'default', icon: '❓' };
    }
  };

  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return { label: 'Thấp', color: 'blue', icon: '🔵' };
      case 'MEDIUM':
        return { label: 'Trung bình', color: 'orange', icon: '🟡' };
      case 'HIGH':
        return { label: 'Cao', color: 'red', icon: '🔴' };
      case 'URGENT':
        return { label: 'Khẩn cấp', color: 'red', icon: '🚨' };
      default:
        return { label: 'Không xác định', color: 'default', icon: '❓' };
    }
  };

  const isTaskOverdue = (task: any) => {
    return task.dueDate && moment(task.dueDate).isBefore(moment(), 'day') && task.status !== 'COMPLETED';
  };

  const isTaskWarning = (task: any) => {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    const dueDate = moment(task.dueDate);
    const now = moment();
    const daysUntilDue = dueDate.diff(now, 'days');
    return daysUntilDue <= 3 && daysUntilDue >= 0;
  };

  const getDaysOverdue = (task: any) => {
    if (!isTaskOverdue(task)) return 0;
    return moment().diff(moment(task.dueDate), 'days');
  };

  const getDaysUntilDue = (task: any) => {
    if (!task.dueDate || task.status === 'COMPLETED') return null;
    const dueDate = moment(task.dueDate);
    const now = moment();
    const daysUntilDue = dueDate.diff(now, 'days');
    return daysUntilDue > 0 ? daysUntilDue : null;
  };

  const getTaskProgress = (status: string) => {
    switch (status) {
      case 'TODO': return 0;
      case 'IN_PROGRESS': return 50;
      case 'REVIEW': return 75;
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  const statusInfo = getStatusDisplay(task.status);
  const priorityInfo = getPriorityDisplay(task.priority);
  const assignee = task.assignee?.name || 'Chưa phân công';
  const isOverdue = isTaskOverdue(task);
  const isWarning = isTaskWarning(task);

  const actionMenu = (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => navigate(`/tasks/${task.id}`)}>
        Xem chi tiết
      </Menu.Item>
      {canEditTasks && (
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(task)}>
          Chỉnh sửa
        </Menu.Item>
      )}
      <Menu.Item key="comments" icon={<MessageOutlined />} onClick={() => onComment(task)}>
        Bình luận
      </Menu.Item>
      {canDeleteTasks && (
        <>
          <Menu.Divider />
          <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => onDelete(task)}>
            Xóa
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Card 
      className="mobile-task-card-optimized"
      style={{ 
        marginBottom: 8,
        background: isDarkMode ? '#1f1f1f' : '#fff',
        borderColor: isDarkMode ? '#303030' : '#f0f0f0',
        borderRadius: 8,
        boxShadow: isDarkMode ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${
          isOverdue ? '#ff4d4f' : 
          isWarning ? '#faad14' : 
          task.status === 'COMPLETED' ? '#52c41a' : '#1890ff'
        }`
      }}
      bodyStyle={{ padding: 12 }}
    >
      {/* Task Header with Tags */}
      <div className="mobile-task-header">
        <div className="mobile-task-tags">
          <Tag color="blue" style={{ fontSize: '9px', fontWeight: 'bold' }}>
            {task.project?.code || 'N/A'}
          </Tag>
          <Tag color={statusInfo.color} style={{ fontSize: '9px' }}>
            {statusInfo.icon} {statusInfo.label}
          </Tag>
          {isOverdue && (
            <Tag color="red" style={{ fontSize: '9px' }}>
              ⚠️ Quá hạn {getDaysOverdue(task)} ngày
            </Tag>
          )}
          {isWarning && !isOverdue && (
            <Tag color="orange" style={{ fontSize: '9px' }}>
              ⏰ Còn {getDaysUntilDue(task)} ngày
            </Tag>
          )}
        </div>
        <Dropdown overlay={actionMenu} trigger={['click']}>
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      </div>
      
      {/* Task Title */}
      <div className="mobile-task-title">
        {task.title}
      </div>
      
      {/* Task Description */}
      {task.description && (
        <div className="mobile-task-description">
          {task.description}
        </div>
      )}
      
      {/* Task Assignee */}
      <div className="mobile-task-assignee">
        <Avatar size={20} style={{ backgroundColor: '#1890ff' }}>
          {(assignee || 'U').charAt(0)}
        </Avatar>
        <span style={{ fontSize: 10, color: isDarkMode ? '#bbb' : '#666' }}>
          {assignee}
        </span>
      </div>
      
      {/* Task Meta - Dates and Priority */}
      <div className="mobile-task-meta">
        <div className="mobile-task-dates">
          <CalendarOutlined style={{ marginRight: 2 }} />
          <span style={{ fontSize: '10px', color: isDarkMode ? '#bbb' : '#666' }}>
            {task.startDate ? moment(task.startDate).format('DD/MM/YYYY') : 'N/A'} - {task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : 'N/A'}
          </span>
        </div>
        <div className="mobile-task-tags-meta">
          {task.category && (
            <Tag color="cyan" style={{ fontSize: '8px', marginRight: 4 }}>
              {task.category}
            </Tag>
          )}
          <Tag color={priorityInfo.color} style={{ fontSize: '8px' }}>
            {priorityInfo.icon} {priorityInfo.label}
          </Tag>
        </div>
      </div>
      
      {/* Task Progress */}
      <div className="mobile-task-progress">
        <Progress 
          percent={getTaskProgress(task.status)} 
          size="small" 
          strokeColor={isDarkMode ? '#1890ff' : '#1890ff'}
          trailColor={isDarkMode ? '#333' : '#f0f0f0'}
        />
      </div>
      
      {/* Task Actions - Compact for Mobile */}
      <div className="mobile-task-actions">
        <Button 
          size="small" 
          icon={<EyeOutlined style={{ color: isDarkMode ? '#40a9ff' : '#1890ff' }} />}
          type="text"
          onClick={() => navigate(`/tasks/${task.id}`)}
          className="mobile-icon-standard"
          style={{ 
            width: '28px',
            height: '24px',
            padding: '3px',
            border: `1px solid ${isDarkMode ? '#40a9ff' : '#1890ff'}`,
            backgroundColor: isDarkMode ? 'rgba(64, 169, 255, 0.1)' : 'rgba(24, 144, 255, 0.1)'
          }}
        />
        {canEditTasks && (
          <Button 
            size="small"
            icon={<EditOutlined style={{ color: isDarkMode ? '#52c41a' : '#389e0d' }} />}
            type="text"
            onClick={() => onEdit(task)}
            className="mobile-icon-standard"
            style={{ 
              width: '28px',
              height: '24px',
              padding: '3px',
              border: `1px solid ${isDarkMode ? '#52c41a' : '#389e0d'}`,
              backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(56, 158, 13, 0.1)'
            }}
          />
        )}
        <Button 
          size="small" 
          icon={<MessageOutlined style={{ color: isDarkMode ? '#faad14' : '#fa8c16' }} />} 
          type="text"
          onClick={() => onComment(task)}
          className="mobile-icon-standard"
          style={{ 
            width: '28px',
            height: '24px',
            padding: '3px',
            border: `1px solid ${isDarkMode ? '#faad14' : '#fa8c16'}`,
            backgroundColor: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 140, 22, 0.1)'
          }}
        />
        {canDeleteTasks && (
          <Button 
            size="small" 
            icon={<DeleteOutlined style={{ color: isDarkMode ? '#ff7875' : '#ff4d4f' }} />} 
            type="text"
            className="mobile-icon-standard"
            onClick={() => onDelete(task)}
            style={{ 
              width: '28px',
              height: '24px',
              padding: '3px',
              border: `1px solid ${isDarkMode ? '#ff7875' : '#ff4d4f'}`,
              borderRadius: '6px',
              backgroundColor: isDarkMode ? 'rgba(255, 120, 117, 0.1)' : 'rgba(255, 77, 79, 0.1)'
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default MobileTaskCardOptimized;
