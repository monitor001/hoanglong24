import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Switch,
  message,
  Modal,
  Form,
  Select,
  Input,
  Tabs,
  Tag,
  Tooltip,
  Popconfirm,
  Alert,
  Spin,
  Empty,
  Typography,
  Divider,
  Row,
  Col,
  Badge,
  Statistic
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  RestOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  SafetyOutlined,
  DashboardOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Permission {
  id: string;
  name: string;
  nameVi: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  nameVi: string;
}

interface PermissionMatrix {
  [permission: string]: {
    [role: string]: boolean;
  };
}

interface PermissionMatrixManagerProps {
  onPermissionsUpdated?: () => void;
}

const PermissionMatrixManager: React.FC<PermissionMatrixManagerProps> = ({
  onPermissionsUpdated
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalMatrix, setOriginalMatrix] = useState<PermissionMatrix>({});

  // Category icons mapping
  const categoryIcons: { [key: string]: React.ReactNode } = {
    dashboard: <DashboardOutlined />,
    projects: <ProjectOutlined />,
    documents: <FileTextOutlined />,
    tasks: <CheckCircleOutlined />,
    issues: <ExclamationCircleOutlined />,
    calendar: <CalendarOutlined />,
    approvals: <SafetyOutlined />,
    users: <UserOutlined />,
    settings: <SettingOutlined />,
    reports: <BarChartOutlined />
  };

  // Category colors mapping
  const categoryColors: { [key: string]: string } = {
    dashboard: 'blue',
    projects: 'green',
    documents: 'orange',
    tasks: 'cyan',
    issues: 'red',
    calendar: 'purple',
    approvals: 'gold',
    users: 'magenta',
    settings: 'geekblue',
    reports: 'volcano'
  };

  // Fetch permission matrix
  const fetchPermissionMatrix = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/settings/permissions-config');
      const { permissions: perms, roles: rolesData, rolePermissionMatrix } = response.data;
      
      setPermissions(perms);
      setRoles(rolesData);
      setPermissionMatrix(rolePermissionMatrix);
      setOriginalMatrix(rolePermissionMatrix);
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching permission matrix:', error);
      message.error('Không thể tải ma trận phân quyền');
    } finally {
      setLoading(false);
    }
  };

  // Save permission matrix
  const savePermissionMatrix = async () => {
    try {
      setSaving(true);
      await axiosInstance.put('/settings/permissions-config', {
        rolePermissionMatrix: permissionMatrix
      });
      
      setOriginalMatrix(permissionMatrix);
      setHasChanges(false);
      message.success('Đã lưu ma trận phân quyền thành công');
      
      if (onPermissionsUpdated) {
        onPermissionsUpdated();
      }
    } catch (error) {
      console.error('Error saving permission matrix:', error);
      message.error('Không thể lưu ma trận phân quyền');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original
  const resetToOriginal = () => {
    setPermissionMatrix(originalMatrix);
    setHasChanges(false);
    message.info('Đã khôi phục ma trận phân quyền ban đầu');
  };

  // Handle permission change
  const handlePermissionChange = (permissionId: string, roleId: string, value: boolean) => {
    const newMatrix = {
      ...permissionMatrix,
      [permissionId]: {
        ...permissionMatrix[permissionId],
        [roleId]: value
      }
    };
    
    setPermissionMatrix(newMatrix);
    setHasChanges(true);
  };

  // Handle role permission change (toggle all permissions for a role)
  const handleRolePermissionChange = (roleId: string, value: boolean) => {
    const newMatrix = { ...permissionMatrix };
    
    Object.keys(newMatrix).forEach(permissionId => {
      newMatrix[permissionId] = {
        ...newMatrix[permissionId],
        [roleId]: value
      };
    });
    
    setPermissionMatrix(newMatrix);
    setHasChanges(true);
  };

  // Handle category permission change (toggle all permissions in a category for a role)
  const handleCategoryPermissionChange = (category: string, roleId: string, value: boolean) => {
    const newMatrix = { ...permissionMatrix };
    const categoryPermissions = permissions.filter(p => p.category === category);
    
    categoryPermissions.forEach(permission => {
      if (newMatrix[permission.id]) {
        newMatrix[permission.id] = {
          ...newMatrix[permission.id],
          [roleId]: value
        };
      }
    });
    
    setPermissionMatrix(newMatrix);
    setHasChanges(true);
  };

  // Get permissions by category
  const getPermissionsByCategory = (category: string) => {
    return permissions.filter(permission => permission.category === category);
  };

  // Get unique categories
  const categories = Array.from(new Set(permissions.map(p => p.category)));

  // Table columns for permission matrix
  const getTableColumns = () => {
    const baseColumns = [
      {
        title: 'Quyền',
        dataIndex: 'permission',
        key: 'permission',
        width: 300,
        fixed: 'left' as const,
        render: (permission: Permission) => (
          <div>
            <div style={{ fontWeight: 500 }}>
              {permission.name}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {permission.nameVi}
            </div>
            <Tag color={categoryColors[permission.category] || 'default'}>
              {categoryIcons[permission.category]}
              {permission.category.toUpperCase()}
            </Tag>
          </div>
        )
      }
    ];

    const roleColumns = roles.map(role => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 500 }}>{role.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{role.nameVi}</div>
        </div>
      ),
      dataIndex: role.id,
      key: role.id,
      width: 120,
      align: 'center' as const,
      render: (value: boolean, record: any) => (
        <Switch
          checked={value}
          onChange={(checked) => handlePermissionChange(record.permission.id, role.id, checked)}
          size="small"
        />
      )
    }));

    return [...baseColumns, ...roleColumns];
  };

  // Table data
  const getTableData = () => {
    return permissions.map(permission => {
      const row: any = {
        key: permission.id,
        permission
      };
      
      roles.forEach(role => {
        row[role.id] = permissionMatrix[permission.id]?.[role.id] || false;
      });
      
      return row;
    });
  };

  useEffect(() => {
    fetchPermissionMatrix();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải ma trận phân quyền...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>
              <SecurityScanOutlined /> Quản lý Ma trận Phân quyền
            </Title>
            <Text type="secondary">
              Cấu hình quyền truy cập cho từng vai trò trong hệ thống
            </Text>
          </Col>
          <Col>
            <Space>
              {hasChanges && (
                <Alert
                  message="Có thay đổi chưa lưu"
                  type="warning"
                  showIcon
                  style={{ marginRight: 16 }}
                />
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchPermissionMatrix}
                disabled={saving}
              >
                Làm mới
              </Button>
              <Button
                icon={<RestOutlined />}
                onClick={resetToOriginal}
                disabled={!hasChanges || saving}
              >
                Khôi phục
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={savePermissionMatrix}
                loading={saving}
                disabled={!hasChanges}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Quick Actions */}
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>Thao tác nhanh</Title>
        <Row gutter={16}>
          {roles.map(role => (
            <Col key={role.id} xs={24} sm={12} md={8} lg={6}>
              <Card size="small" style={{ marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>{role.name}</div>
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleRolePermissionChange(role.id, true)}
                    >
                      Tất cả
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleRolePermissionChange(role.id, false)}
                    >
                      Không có
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Permission Matrix by Category */}
      <Card style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="all" type="card">
          <TabPane tab="Tất cả quyền" key="all">
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={getTableColumns()}
                dataSource={getTableData()}
                pagination={false}
                scroll={{ x: 1200 }}
                size="small"
                bordered
              />
            </div>
          </TabPane>
          
          {categories.map(category => (
            <TabPane
              tab={
                <span>
                  {categoryIcons[category]}
                  {category.toUpperCase()}
                  <Badge
                    count={getPermissionsByCategory(category).length}
                    style={{ marginLeft: 8 }}
                  />
                </span>
              }
              key={category}
            >
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={getTableColumns()}
                  dataSource={getTableData().filter(row => 
                    row.permission.category === category
                  )}
                  pagination={false}
                  scroll={{ x: 1200 }}
                  size="small"
                  bordered
                />
              </div>
            </TabPane>
          ))}
        </Tabs>
      </Card>

      {/* Statistics */}
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>Thống kê</Title>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Tổng số quyền"
                value={permissions.length}
                prefix={<SecurityScanOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Tổng số vai trò"
                value={roles.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Số danh mục"
                value={categories.length}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Quyền đã cấp"
                value={
                  Object.values(permissionMatrix).reduce((total, rolePerms) => 
                    total + Object.values(rolePerms).filter(Boolean).length, 0
                  )
                }
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PermissionMatrixManager;
