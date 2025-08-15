import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Switch,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Tag,
  Tooltip,
  Row,
  Col,
  Alert,
  Tabs,
  Select,
  Input,
  Divider,
  Badge,
  Statistic
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  UndoOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

interface Permission {
  id: string;
  name: string;
  nameVi: string;
  description?: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  nameVi: string;
  color: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  nameVi: string;
  color: string;
  description?: string;
}

interface PermissionMatrix {
  [permissionId: string]: {
    [roleId: string]: boolean;
  };
}

interface FlexiblePermissionManagerProps {
  onPermissionsUpdated?: () => void;
}

const FlexiblePermissionManager: React.FC<FlexiblePermissionManagerProps> = ({
  onPermissionsUpdated
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [originalMatrix, setOriginalMatrix] = useState<PermissionMatrix>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [statistics, setStatistics] = useState<any>(null);

  // Fetch permission data
  const fetchPermissionData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/settings/permissions-config');
      const { 
        permissions: perms, 
        roles: rolesData, 
        categories: cats,
        rolePermissionMatrix,
        permissionsByCategory 
      } = response.data;
      
      setPermissions(perms);
      setRoles(rolesData);
      setCategories(cats);
      setPermissionMatrix(rolePermissionMatrix);
      setOriginalMatrix(rolePermissionMatrix);
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching permission data:', error);
      message.error('Không thể tải dữ liệu phân quyền');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/settings/permissions/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchPermissionData();
    fetchStatistics();
  }, []);

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
      if (!newMatrix[permissionId]) {
        newMatrix[permissionId] = {};
      }
      newMatrix[permissionId][roleId] = value;
    });
    
    setPermissionMatrix(newMatrix);
    setHasChanges(true);
  };

  // Handle category permission change (toggle all permissions for a category)
  const handleCategoryPermissionChange = (categoryId: string, roleId: string, value: boolean) => {
    const newMatrix = { ...permissionMatrix };
    const categoryPermissions = permissions.filter(p => p.category === categoryId);
    
    categoryPermissions.forEach(permission => {
      if (!newMatrix[permission.id]) {
        newMatrix[permission.id] = {};
      }
      newMatrix[permission.id][roleId] = value;
    });
    
    setPermissionMatrix(newMatrix);
    setHasChanges(true);
  };

  // Save permission matrix
  const savePermissionMatrix = async () => {
    try {
      setSaving(true);
      await axiosInstance.put('/settings/permissions', {
        rolePermissionMatrix: permissionMatrix
      });
      
      setOriginalMatrix(permissionMatrix);
      setHasChanges(false);
      message.success('Đã lưu ma trận phân quyền thành công');
      
      if (onPermissionsUpdated) {
        onPermissionsUpdated();
      }
      
      // Refresh statistics
      fetchStatistics();
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

  // Reset to default
  const resetToDefault = async () => {
    try {
      setSaving(true);
      await axiosInstance.post('/settings/permissions/reset');
      await fetchPermissionData();
      await fetchStatistics();
      message.success('Đã khôi phục phân quyền mặc định');
    } catch (error) {
      console.error('Error resetting permissions:', error);
      message.error('Không thể khôi phục phân quyền mặc định');
    } finally {
      setSaving(false);
    }
  };

  // Filter permissions
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         permission.nameVi.toLowerCase().includes(searchText.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter roles
  const filteredRoles = selectedRole === 'all' ? roles : roles.filter(role => role.id === selectedRole);

  // Get category color
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#8c8c8c';
  };

  // Get role color
  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || '#8c8c8c';
  };

  // Table columns
  const columns = [
    {
      title: 'Quyền hạn',
      dataIndex: 'permission',
      key: 'permission',
      width: 300,
      render: (permission: Permission) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {permission.nameVi}
            <Tag 
              color={getCategoryColor(permission.category)} 
              style={{ marginLeft: 8, fontSize: '10px' }}
            >
              {categories.find(c => c.id === permission.category)?.nameVi}
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {permission.name}
          </Text>
          {permission.description && (
            <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 2 }}>
              {permission.description}
            </div>
          )}
        </div>
      ),
      fixed: 'left' as const
    },
    ...filteredRoles.map(role => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 500, color: getRoleColor(role.id) }}>
            {role.nameVi}
          </div>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {role.name}
          </Text>
        </div>
      ),
      dataIndex: role.id,
      key: role.id,
      width: 120,
      align: 'center' as const,
      render: (value: boolean, record: any) => (
        <Switch
          checked={permissionMatrix[record.permission.id]?.[role.id] || false}
          onChange={(checked) => handlePermissionChange(record.permission.id, role.id, checked)}
          size="small"
        />
      )
    }))
  ];

  // Statistics cards
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng quyền hạn"
              value={statistics.totalPermissions}
              prefix={<SecurityScanOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng vai trò"
              value={statistics.totalRoles}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng danh mục"
              value={statistics.totalCategories}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quyền được bật"
              value={statistics.matrixStats?.enabledPermissions || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Category tabs
  const renderCategoryTabs = () => {
    const categoryTabs = categories.map(category => ({
      key: category.id,
      label: (
        <span>
          <Tag color={category.color}>{category.nameVi}</Tag>
          <Badge 
            count={permissions.filter(p => p.category === category.id).length} 
            size="small"
          />
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>{category.description}</Text>
            <div style={{ marginTop: 8 }}>
              {roles.map(role => (
                <Button
                  key={role.id}
                  size="small"
                  style={{ marginRight: 8, marginBottom: 4 }}
                  onClick={() => handleCategoryPermissionChange(category.id, role.id, true)}
                >
                  Bật tất cả cho {role.nameVi}
                </Button>
              ))}
              {roles.map(role => (
                <Button
                  key={`off-${role.id}`}
                  size="small"
                  style={{ marginRight: 8, marginBottom: 4 }}
                  onClick={() => handleCategoryPermissionChange(category.id, role.id, false)}
                >
                  Tắt tất cả cho {role.nameVi}
                </Button>
              ))}
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={permissions
              .filter(p => p.category === category.id)
              .map(p => ({ key: p.id, permission: p }))}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )
    }));

    return (
      <Tabs
        type="card"
        items={[
          {
            key: 'all',
            label: (
              <span>
                <Tag color="blue">Tất cả</Tag>
                <Badge count={permissions.length} size="small" />
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Quản lý phân quyền cho tất cả các danh mục</Text>
                  <div style={{ marginTop: 8 }}>
                    {roles.map(role => (
                      <Button
                        key={role.id}
                        size="small"
                        style={{ marginRight: 8, marginBottom: 4 }}
                        onClick={() => handleRolePermissionChange(role.id, true)}
                      >
                        Bật tất cả cho {role.nameVi}
                      </Button>
                    ))}
                    {roles.map(role => (
                      <Button
                        key={`off-${role.id}`}
                        size="small"
                        style={{ marginRight: 8, marginBottom: 4 }}
                        onClick={() => handleRolePermissionChange(role.id, false)}
                      >
                        Tắt tất cả cho {role.nameVi}
                      </Button>
                    ))}
                  </div>
                </div>
                <Table
                  columns={columns}
                  dataSource={filteredPermissions.map(p => ({ key: p.id, permission: p }))}
                  pagination={{ pageSize: 20 }}
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </div>
            )
          },
          ...categoryTabs
        ]}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu phân quyền...</div>
      </div>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <SecurityScanOutlined />
            <span>Quản lý phân quyền linh hoạt</span>
            {hasChanges && (
              <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                Có thay đổi chưa lưu
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPermissionData}
              disabled={saving}
            >
              Làm mới
            </Button>
            <Button
              icon={<UndoOutlined />}
              onClick={resetToOriginal}
              disabled={!hasChanges || saving}
            >
              Khôi phục
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={resetToDefault}
              disabled={saving}
            >
              Mặc định
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
        }
      >
        {renderStatistics()}
        
        <Alert
          message="Hệ thống phân quyền linh hoạt"
          description="Quản lý phân quyền cho tất cả các thẻ: Tài liệu, Lịch, Ghi chú, Hồ sơ thiết kế, Phê duyệt hồ sơ. Hệ thống được cài đặt qua database, không hardcode."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="Tìm kiếm quyền hạn..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={8}>
              <Select
                placeholder="Lọc theo danh mục"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.nameVi}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <Select
                placeholder="Lọc theo vai trò"
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả vai trò</Option>
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.nameVi}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {renderCategoryTabs()}
      </Card>
    </div>
  );
};

export default FlexiblePermissionManager;
