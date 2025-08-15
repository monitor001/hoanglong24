import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, message, Tag, Space, Typography } from 'antd';
import { LogoutOutlined, DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

interface Session {
  id: string;
  sessionId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

interface SessionResponse {
  sessions: Session[];
  totalActive: number;
}

const SessionManager: React.FC = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/auth/my-sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      message.error('Không thể tải danh sách phiên đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const logoutSession = async (sessionId: string) => {
    setLogoutLoading(sessionId);
    try {
      await axiosInstance.post('/auth/logout-current');
      message.success('Đã đăng xuất phiên hiện tại');
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Failed to logout session:', error);
      message.error('Không thể đăng xuất phiên');
    } finally {
      setLogoutLoading(null);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    switch (deviceInfo.toLowerCase()) {
      case 'mobile':
        return <MobileOutlined style={{ color: '#1890ff' }} />;
      case 'tablet':
        return <TabletOutlined style={{ color: '#52c41a' }} />;
      default:
        return <DesktopOutlined style={{ color: '#722ed1' }} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusTag = (session: Session) => {
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const isExpired = expiresAt < now;

    if (isExpired) {
      return <Tag color="red">Hết hạn</Tag>;
    }

    // Check if this is the current session (most recent activity)
    const isCurrentSession = sessions.length > 0 && 
      sessions[0].id === session.id && 
      new Date(session.lastActivity) > new Date(Date.now() - 5 * 60 * 1000); // Within 5 minutes

    return isCurrentSession ? 
      <Tag color="green">Phiên hiện tại</Tag> : 
      <Tag color="blue">Hoạt động</Tag>;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const columns = [
    {
      title: 'Thiết bị',
      key: 'device',
      render: (session: Session) => (
        <Space>
          {getDeviceIcon(session.deviceInfo)}
          <Text>{session.deviceInfo}</Text>
        </Space>
      ),
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip: string) => <Text code>{ip}</Text>,
    },
    {
      title: 'Hoạt động cuối',
      key: 'lastActivity',
      render: (session: Session) => (
        <Text>{formatDate(session.lastActivity)}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (session: Session) => getStatusTag(session),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (session: Session) => {
        const isCurrentSession = sessions.length > 0 && 
          sessions[0].id === session.id && 
          new Date(session.lastActivity) > new Date(Date.now() - 5 * 60 * 1000);

        return (
          <Space>
            {isCurrentSession && (
              <Button
                type="primary"
                danger
                size="small"
                icon={<LogoutOutlined />}
                loading={logoutLoading === session.id}
                onClick={() => logoutSession(session.id)}
              >
                Đăng xuất
              </Button>
            )}
            {!isCurrentSession && (
              <Text type="secondary">Không thể đăng xuất từ xa</Text>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card title="Quản lý phiên đăng nhập" style={{ margin: '16px' }}>
      <div style={{ marginBottom: 16 }}>
        <Text>
          Bạn có <strong>{sessions.length}</strong> phiên đăng nhập đang hoạt động.
          {sessions.length > 1 && (
            <Text type="warning">
              {' '}Lưu ý: Khi đăng nhập từ thiết bị mới, các phiên cũ sẽ bị đăng xuất tự động.
            </Text>
          )}
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={sessions}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
      />

      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          💡 Mẹo: Để bảo mật tài khoản, hãy đăng xuất khỏi các thiết bị không sử dụng.
        </Text>
      </div>
    </Card>
  );
};

export default SessionManager;
