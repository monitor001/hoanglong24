import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Badge, Tag } from 'antd';
import { LogoutOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { sessionManager } from '../utils/sessionManager';
import { sessionCleanup } from '../utils/sessionCleanup';

const { Text, Title } = Typography;

interface SessionInfoProps {
  showDetails?: boolean;
}

const SessionInfo: React.FC<SessionInfoProps> = ({ showDetails = false }) => {
  const { t } = useTranslation();
  const [sessionInfo, setSessionInfo] = useState(sessionManager.getSessionInfo());
  const [cleanupStatus, setCleanupStatus] = useState(sessionCleanup.getStatus());
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const updateInfo = () => {
    setSessionInfo(sessionManager.getSessionInfo());
    setCleanupStatus(sessionCleanup.getStatus());
  };

  const handleForceLogout = async () => {
    try {
      await sessionManager.forceLogout();
    } catch (error) {
      console.error('Force logout failed:', error);
    }
  };

  const handleCheckSession = async () => {
    setIsChecking(true);
    try {
      const isValid = await sessionManager.checkSessionStatus();
      setLastCheck(new Date());
      if (!isValid) {
        // Session đã bị invalid, sẽ tự động logout
        console.log('Session invalid, will logout automatically');
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  const formatDuration = (milliseconds?: number) => {
    if (!milliseconds) return 'N/A';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ngày ${hours % 24} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes % 60} phút`;
    if (minutes > 0) return `${minutes} phút ${seconds % 60} giây`;
    return `${seconds} giây`;
  };

  const getSessionStatus = () => {
    if (!sessionInfo.hasToken || !sessionInfo.hasUser) {
      return { status: 'invalid', text: 'Không có session', color: 'red' };
    }
    
    if (sessionInfo.tokenExpiry && sessionInfo.tokenExpiry < Date.now() / 1000) {
      return { status: 'expired', text: 'Token đã hết hạn', color: 'red' };
    }
    
    return { status: 'valid', text: 'Session hợp lệ', color: 'green' };
  };

  const sessionStatus = getSessionStatus();

  return (
    <Card title="Thông tin phiên đăng nhập" style={{ margin: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Session Status */}
        <div>
          <Text strong>Trạng thái: </Text>
          <Badge 
            status={sessionStatus.status === 'valid' ? 'success' : 'error'} 
            text={sessionStatus.text}
          />
        </div>

        {/* User Email */}
        {sessionInfo.userEmail && (
          <div>
            <Text strong>Email: </Text>
            <Text>{sessionInfo.userEmail}</Text>
          </div>
        )}

        {/* Token Expiry */}
        {sessionInfo.tokenExpiry && (
          <div>
            <Text strong>Token hết hạn: </Text>
            <Text>{formatTime(sessionInfo.tokenExpiry)}</Text>
          </div>
        )}

        {/* Session Age */}
        {sessionInfo.sessionAge && (
          <div>
            <Text strong>Thời gian phiên: </Text>
            <Text>{formatDuration(sessionInfo.sessionAge)}</Text>
          </div>
        )}

        {/* Last Check */}
        {lastCheck && (
          <div>
            <Text strong>Kiểm tra cuối: </Text>
            <Text>{lastCheck.toLocaleString('vi-VN')}</Text>
          </div>
        )}

        {/* Cleanup Status */}
        <div>
          <Text strong>Dọn dẹp session: </Text>
          <Tag color={cleanupStatus.isRunning ? 'green' : 'red'}>
            {cleanupStatus.isRunning ? 'Đang chạy' : 'Đã dừng'}
          </Tag>
        </div>

        {/* Actions */}
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={isChecking}
            onClick={handleCheckSession}
          >
            Kiểm tra session
          </Button>
          
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleForceLogout}
          >
            Force Logout
          </Button>
          
          <Button onClick={updateInfo}>
            Làm mới
          </Button>
        </Space>

        {/* Auto Logout Alert */}
        <Alert
          message="Tự động đăng xuất"
          description="Hệ thống sẽ tự động đăng xuất khi phát hiện bạn đã đăng nhập từ thiết bị khác hoặc session hết hạn."
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
        />

        {/* Session Check Info */}
        <Alert
          message="Kiểm tra session định kỳ"
          description="Hệ thống kiểm tra trạng thái session mỗi 5 phút và khi tab được focus để tối ưu hiệu suất."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />

        {showDetails && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>Chi tiết kỹ thuật:</Title>
            <pre style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: 8 }}>
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default SessionInfo;
