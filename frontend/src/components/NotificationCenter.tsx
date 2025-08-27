import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  List,
  Badge,
  Button,
  Typography,
  Space,
  Tag,
  Empty,
  Spin,
  message,
  Popconfirm,
  Divider,
  Tooltip,
  Avatar
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axiosInstance from '../axiosConfig';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  read: boolean;
  relatedId?: string;
  relatedType?: string;
  data?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose,
  onNotificationClick
}) => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '50');
      if (filter === 'unread') {
        params.append('read', 'false');
      }

      const response = await axiosInstance.get(`/notifications?${params}`);
      setNotifications(response.data.notifications || response.data);
      
      // Update unread count
      const unread = (response.data.notifications || response.data).filter(
        (n: Notification) => !n.read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Không thể đánh dấu tất cả là đã đọc');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      message.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Không thể xóa thông báo');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const iconStyle = {
      fontSize: '16px',
      color: priority === 'CRITICAL' ? '#f5222d' :
             priority === 'HIGH' ? '#fa8c16' :
             priority === 'MEDIUM' ? '#faad14' : '#52c41a'
    };

    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_OVERDUE':
      case 'TASK_UPCOMING':
      case 'TASK_COMPLETED':
        return <CheckCircleOutlined style={iconStyle} />;
      case 'ISSUE_ASSIGNED':
      case 'ISSUE_OVERDUE':
      case 'ISSUE_UPDATED':
        return <ExclamationCircleOutlined style={iconStyle} />;
      case 'CALENDAR_REMINDER':
        return <ClockCircleOutlined style={iconStyle} />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <InfoCircleOutlined style={iconStyle} />;
      default:
        return <BellOutlined style={iconStyle} />;
    }
  };

  // Get priority tag color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'gold';
      case 'LOW':
        return 'green';
      default:
        return 'default';
    }
  };

  // Get priority text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'Quan trọng';
      case 'HIGH':
        return 'Cao';
      case 'MEDIUM':
        return 'Trung bình';
      case 'LOW':
        return 'Thấp';
      default:
        return priority;
    }
  };

  // Fetch notifications on mount and filter change
  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Listen for new notifications
    if ((window as any).socket) {
      (window as any).socket.on('notification:new', handleNewNotification);
    }

    return () => {
      if ((window as any).socket) {
        (window as any).socket.off('notification:new', handleNewNotification);
      }
    };
  }, []);

  return (
    <Drawer
      title={
        <Space>
          <BellOutlined />
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" />
          )}
        </Space>
      }
      placement="right"
      width={400}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button
            size="small"
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </Button>
          <Button
            size="small"
            type={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc
          </Button>
          {unreadCount > 0 && (
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả
            </Button>
          )}
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          description="Không có thông báo nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              style={{
                padding: '12px 0',
                cursor: 'pointer',
                backgroundColor: notification.read ? 'transparent' : '#f0f9ff',
                borderRadius: '8px',
                marginBottom: '8px',
                border: notification.read ? 'none' : '1px solid #91d5ff'
              }}
              onClick={() => handleNotificationClick(notification)}
              actions={[
                <Tooltip title="Đánh dấu đã đọc">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    disabled={notification.read}
                  />
                </Tooltip>,
                <Popconfirm
                  title="Xóa thông báo này?"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={getNotificationIcon(notification.type, notification.priority)}
                    style={{
                      backgroundColor: notification.read ? '#f5f5f5' : '#1890ff'
                    }}
                  />
                }
                title={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong={!notification.read} style={{ fontSize: '14px' }}>
                        {notification.title}
                      </Text>
                      <Tag color={getPriorityColor(notification.priority)}>
                        {getPriorityText(notification.priority)}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {dayjs(notification.createdAt).fromNow()}
                    </Text>
                  </Space>
                }
                description={
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.4',
                      display: 'block',
                      marginTop: '4px'
                    }}
                  >
                    {notification.message}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

export default NotificationCenter;
