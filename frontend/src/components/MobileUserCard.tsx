import React from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Tag, 
  Space, 
  Button,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import '../styles/mobile-icon-standardization.css';

const { Text, Title } = Typography;

interface MobileUserCardProps {
  user: any;
  onView: (user: any) => void;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
}

const MobileUserCard: React.FC<MobileUserCardProps> = ({
  user,
  onView,
  onEdit,
  onDelete
}) => {
  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: { name: string; color: string } } = {
      'ADMIN': { name: 'Quản trị viên', color: 'red' },
      'PROJECT_MANAGER': { name: 'Quản lý dự án', color: 'blue' },
      'BIM_MANAGER': { name: 'Quản lý BIM', color: 'purple' },
      'CONTRIBUTOR': { name: 'Biên tập viên', color: 'green' },
      'VIEWER': { name: 'Người xem', color: 'grey' },
      'USER': { name: 'Người dùng', color: 'default' }
    };
    return roleMap[role] || { name: role, color: 'default' };
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? 
      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  };

  const roleInfo = getRoleDisplayName(user.role || 'USER');

  return (
    <Card
      className="mobile-user-card"
      style={{ 
        marginBottom: 12,
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{ padding: 16 }}
    >
      {/* Header với Avatar và thông tin cơ bản */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        marginBottom: 12 
      }}>
        <Avatar 
          size={48} 
          style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
          icon={<UserOutlined />}
        >
          {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'U'}
        </Avatar>
        
        <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
          <Title 
            level={5} 
            style={{ 
              margin: 0, 
              marginBottom: 4,
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.2
            }}
            ellipsis
          >
            {user.name || 'Không có tên'}
          </Title>
          
          <Text 
            type="secondary" 
            style={{ 
              fontSize: 12,
              display: 'block',
              marginBottom: 2
            }}
            ellipsis
          >
            {user.email || 'Không có email'}
          </Text>
          
          <Text 
            type="secondary" 
            style={{ 
              fontSize: 12,
              display: 'block',
              marginBottom: 4
            }}
          >
            {user.phone || 'Không có số điện thoại'}
          </Text>

          {/* Activity Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div 
              style={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                backgroundColor: user.isOnline ? '#52c41a' : '#d9d9d9',
                flexShrink: 0
              }} 
            />
            <Text style={{ 
              fontSize: 11, 
              color: user.isOnline ? '#52c41a' : '#666',
              fontWeight: 500
            }}>
              {user.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </Text>
          </div>

          {/* Role and Status Tags */}
          <div style={{ marginBottom: 6 }}>
            <Tag color={roleInfo.color} style={{ fontSize: 11, padding: '2px 6px' }}>
              {roleInfo.name}
            </Tag>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
              {getStatusIcon(user.status || 'active')}
              <span style={{ marginLeft: 4 }}>
                {getStatusText(user.status || 'active')}
              </span>
            </span>
          </div>

          {/* IP Address and Device Info */}
          {user.currentIp && (
            <Text style={{ 
              fontSize: 11, 
              color: '#666',
              display: 'block',
              marginBottom: 2
            }}>
              IP: {user.currentIp}
            </Text>
          )}
          {user.deviceInfo && (
            <Text style={{ 
              fontSize: 11, 
              color: '#666',
              display: 'block',
              marginBottom: 2
            }}>
              Thiết bị: {user.deviceInfo}
            </Text>
          )}
          {user.lastActivity && (
            <Text style={{ 
              fontSize: 11, 
              color: '#999',
              display: 'block'
            }}>
              Cuối: {moment(user.lastActivity).format('HH:mm DD/MM')}
            </Text>
          )}
        </div>
      </div>

      {/* Thông tin liên hệ */}
      <div style={{ marginBottom: 12 }}>
        {user.email && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 4,
            fontSize: 13
          }}>
            <MailOutlined style={{ color: '#666', marginRight: 6, fontSize: 12 }} />
            <Text 
              style={{ fontSize: 13, color: '#666' }}
              ellipsis
            >
              {user.email}
            </Text>
          </div>
        )}
        
        {user.phone && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 4,
            fontSize: 13
          }}>
            <PhoneOutlined style={{ color: '#666', marginRight: 6, fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: '#666' }}>
              {user.phone}
            </Text>
          </div>
        )}
        
        {user.department && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 4,
            fontSize: 13
          }}>
            <TeamOutlined style={{ color: '#666', marginRight: 6, fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: '#666' }}>
              {user.department}
            </Text>
          </div>
        )}
      </div>

      {/* Dự án tham gia */}
      {user.projects && user.projects.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: '#999', marginBottom: 4, display: 'block' }}>
            Dự án:
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {user.projects.slice(0, 3).map((project: string, index: number) => (
              <Tag 
                key={index} 
                color="blue" 
                style={{ 
                  fontSize: 11, 
                  padding: '1px 4px',
                  margin: 0
                }}
              >
                {project}
              </Tag>
            ))}
            {user.projects.length > 3 && (
              <Tag style={{ fontSize: 11, padding: '1px 4px', margin: 0 }}>
                +{user.projects.length - 3}
              </Tag>
            )}
          </div>
        </div>
      )}

      {/* Thông tin thời gian */}
      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 11, color: '#999' }}>
          Đăng nhập cuối: {user.lastLogin ? moment(user.lastLogin).format('DD/MM/YYYY HH:mm') : 'Chưa đăng nhập'}
        </Text>
      </div>

      {/* Action buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        borderTop: '1px solid #f0f0f0',
        paddingTop: 8,
        marginTop: 12
      }}>
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => onView(user)}
              className="mobile-icon-standard"
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => onEdit(user)}
              className="mobile-icon-standard"
            />
          </Tooltip>
          
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined />}
              danger
              className="mobile-icon-standard"
              onClick={() => onDelete(user.id)}
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
};

export default MobileUserCard;
