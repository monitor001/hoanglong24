import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Switch,
  Button,
  message,
  Card,
  Typography,
  Space,
  Tag,
  Avatar,
  Divider,
  Row,
  Col,
  Tooltip,
  Select,
  Alert
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import '../styles/project-member-management.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProjectMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
  permissions: ProjectPermission[];
}

interface ProjectPermission {
  id: string;
  resource: string;
  action: string;
  granted: boolean;
  grantedAt?: string;
  grantedBy?: string;
}

interface ProjectMemberPermissionsProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  member: ProjectMember | null;
  onPermissionsUpdated: () => void;
}

const ProjectMemberPermissions: React.FC<ProjectMemberPermissionsProps> = ({
  visible,
  onClose,
  projectId,
  member,
  onPermissionsUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<ProjectPermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);

  const resourceLabels: { [key: string]: string } = {
    PROJECT: 'Dự án',
    DOCUMENTS: 'Tài liệu',
    TASKS: 'Nhiệm vụ',
    ISSUES: 'Vấn đề',
    CALENDAR: 'Lịch',
    COMMENTS: 'Bình luận',
    APPROVALS: 'Phê duyệt'
  };

  const actionLabels: { [key: string]: string } = {
    VIEW: 'Xem',
    CREATE: 'Tạo',
    EDIT: 'Chỉnh sửa',
    DELETE: 'Xóa',
    APPROVE: 'Phê duyệt',
    SHARE: 'Chia sẻ',
    EXPORT: 'Xuất'
  };

  const actionIcons: { [key: string]: React.ReactNode } = {
    VIEW: <EyeOutlined />,
    CREATE: <PlusOutlined />,
    EDIT: <EditOutlined />,
    DELETE: <DeleteOutlined />,
    APPROVE: <CheckCircleOutlined />,
    SHARE: <UnlockOutlined />,
    EXPORT: <DownloadOutlined />
  };

  const roleColors: { [key: string]: string } = {
    ADMIN: 'red',
    PROJECT_MANAGER: 'blue',
    BIM_MANAGER: 'green',
    CONTRIBUTOR: 'orange',
    VIEWER: 'purple',
    USER: 'default'
  };

  useEffect(() => {
    if (visible && member) {
      loadMemberPermissions();
      setSelectedRole(member.role);
    }
  }, [visible, member]);

  const loadMemberPermissions = async () => {
    if (!member) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/members/${member.id}/permissions`);
      setPermissions(response.data.data.member.permissions || []);
    } catch (error) {
      console.error('Error loading member permissions:', error);
      message.error('Không thể tải quyền thành viên');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultRolePermissions = async (role: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/projects/roles/${role}/permissions`);
      setPermissions(response.data.data.permissions);
      setSelectedRole(role);
    } catch (error) {
      console.error('Error loading default role permissions:', error);
      message.error('Không thể tải quyền mặc định cho vai trò');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (resource: string, action: string, granted: boolean) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.resource === resource && p.action === action);
      if (existing) {
        return prev.map(p => 
          p.resource === resource && p.action === action 
            ? { ...p, granted } 
            : p
        );
      } else {
        return [...prev, { id: '', resource, action, granted }];
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!member) return;
    
    setSaving(true);
    try {
      await axiosInstance.put(`/api/projects/${projectId}/members/${member.id}/permissions`, {
        permissions: permissions.map(p => ({
          resource: p.resource,
          action: p.action,
          granted: p.granted
        }))
      });
      
      message.success('Cập nhật quyền thành công');
      onPermissionsUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      message.error('Không thể cập nhật quyền');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (role: string) => {
    loadDefaultRolePermissions(role);
  };

  const getPermissionStatus = (resource: string, action: string) => {
    const permission = permissions.find(p => p.resource === resource && p.action === action);
    return permission?.granted || false;
  };

  const columns = [
    {
      title: 'Tài nguyên',
      dataIndex: 'resource',
      key: 'resource',
      width: 120,
      render: (resource: string) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {resourceLabels[resource] || resource}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => (
        <Space>
          {actionIcons[action]}
          <span>{actionLabels[action] || action}</span>
        </Space>
      )
    },
    {
      title: 'Quyền',
      key: 'permission',
      width: 80,
      render: (_: any, record: any) => {
        const granted = getPermissionStatus(record.resource, record.action);
        return (
          <Switch
            checked={granted}
            onChange={(checked) => handlePermissionChange(record.resource, record.action, checked)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
            size="small"
          />
        );
      }
    }
  ];

  const allResources = Object.keys(resourceLabels);
  const allActions = Object.keys(actionLabels);

  const permissionData = allResources.flatMap(resource =>
    allActions.map(action => ({
      key: `${resource}-${action}`,
      resource,
      action
    }))
  );

  if (!member) return null;

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>Quản lý quyền thành viên</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSavePermissions}
        >
          Lưu quyền
        </Button>
      ]}
      className={isDarkMode ? 'dark-modal' : ''}
    >
      <div style={{ marginBottom: 16 }}>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col>
              <Avatar size={48} icon={<UserOutlined />} />
            </Col>
            <Col flex="auto">
              <Title level={5} style={{ margin: 0 }}>
                {member.userName}
              </Title>
              <Text type="secondary">{member.userEmail}</Text>
              <br />
              <Tag color={roleColors[member.role] || 'default'}>
                {member.role}
              </Tag>
            </Col>
          </Row>
        </Card>

        <Alert
          message="Thông tin quyền"
          description="Bạn có thể tùy chỉnh quyền chi tiết cho từng thành viên hoặc áp dụng quyền mặc định theo vai trò."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Space style={{ marginBottom: 16 }}>
          <Text strong>Áp dụng quyền mặc định cho vai trò:</Text>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            style={{ width: 200 }}
            placeholder="Chọn vai trò"
          >
            <Option value="ADMIN">Quản trị viên</Option>
            <Option value="PROJECT_MANAGER">Quản lý dự án</Option>
            <Option value="BIM_MANAGER">Quản lý BIM</Option>
            <Option value="CONTRIBUTOR">Thành viên</Option>
            <Option value="VIEWER">Người xem</Option>
            <Option value="USER">Người dùng</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadMemberPermissions}
            loading={loading}
          >
            Tải lại
          </Button>
        </Space>
      </div>

      <Divider />

      <Table
        columns={columns}
        dataSource={permissionData}
        pagination={false}
        size="small"
        loading={loading}
        scroll={{ y: 400 }}
        rowKey="key"
      />
    </Modal>
  );
};

export default ProjectMemberPermissions;
