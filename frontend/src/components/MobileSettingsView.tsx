import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Typography, 
  Space, 
  Tabs, 
  theme,
  Spin,
  Select,
  Collapse,
  ColorPicker,
  Tag,
  Divider,
  Row,
  Col,
  Checkbox
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  SettingOutlined, 
  ForkOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  BgColorsOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useResponsive } from '../hooks/useResponsive';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface MobileSettingsViewProps {
  // Profile props
  form: any;
  pwdForm: any;
  loading: boolean;
  user: any;
  handleProfile: (values: any) => Promise<void>;
  handlePassword: (values: any) => Promise<void>;
  
  // ISO props
  projects: any[];
  selectedProjectId: string | null;
  handleProjectChange: (value: string | null) => void;
  documentStatuses: any[];
  metadataFields: any[];
  approvalSteps: any[];
  fileNamingRule: any;
  updateDocumentStatus: (id: string, field: string, value: any) => void;
  updateMetadataField: (id: string, field: string, value: any) => void;
  updateApprovalStep: (id: string, field: string, value: any) => void;
  setFileNamingRule: (rule: any) => void;
  addMetadataField: () => void;
  removeMetadataField: (id: string) => void;
  handleISOSave: () => Promise<void>;
  
  // Permission props
  permissions: any[];
  roles: any[];
  positions: any[];
  permissionMatrix: any;
  positionPermissionMatrix: any;
  updatePermissionMatrix: (permissionId: string, roleId: string, value: boolean) => void;
  updatePositionPermissionMatrix: (permissionId: string, positionId: string, value: boolean) => void;
  handlePermissionMatrixSave: () => Promise<void>;
  loadingPermissions: boolean;
  fetchPermissionMatrix: () => Promise<void>;
  
  // Tab control
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileSettingsView: React.FC<MobileSettingsViewProps> = ({
  // Profile props
  form,
  pwdForm,
  loading,
  user,
  handleProfile,
  handlePassword,
  
  // ISO props
  projects,
  selectedProjectId,
  handleProjectChange,
  documentStatuses,
  metadataFields,
  approvalSteps,
  fileNamingRule,
  updateDocumentStatus,
  updateMetadataField,
  updateApprovalStep,
  setFileNamingRule,
  addMetadataField,
  removeMetadataField,
  handleISOSave,
  
  // Permission props
  permissions,
  roles,
  positions,
  permissionMatrix,
  positionPermissionMatrix,
  updatePermissionMatrix,
  updatePositionPermissionMatrix,
  handlePermissionMatrixSave,
  loadingPermissions,
  fetchPermissionMatrix,
  
  // Tab control
  activeTab,
  setActiveTab
}) => {
  const [activePermissionTab, setActivePermissionTab] = useState('roles');
  const { isMobile } = useResponsive();
  const { token } = theme.useToken();
  
  // Detect dark mode từ Ant Design theme
  const isDarkMode = token.colorBgContainer === '#1f1f1f' || 
                     document.documentElement.getAttribute('data-theme') === 'dark';

  // Chỉ hiển thị trên mobile
  if (!isMobile) {
    return null;
  }

  const renderMobileProfileTab = () => (
    <div style={{ padding: '0 16px' }}>
      {/* Personal Info Section */}
      <Card 
        className="mobile-settings-card"
        title={
          <Space>
            <UserOutlined />
            <span>Thông tin cá nhân</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px 12px' }}
      >
        <Form form={form} layout="vertical" onFinish={handleProfile}>
          <Form.Item 
            name="name" 
            label="Tên cá nhân" 
            rules={[{ required: true, message: 'Nhập tên!' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[{ required: true, message: 'Nhập email!' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {/* Password Section */}
      <Card 
        className="mobile-settings-card"
        title={
          <Space>
            <LockOutlined />
            <span>Đổi mật khẩu</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px 12px' }}
      >
        <Form form={pwdForm} layout="vertical" onFinish={handlePassword}>
          <Form.Item 
            name="oldPassword" 
            label="Mật khẩu cũ" 
            rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}
          >
            <Input.Password size="large" autoComplete="current-password" />
          </Form.Item>
          <Form.Item 
            name="newPassword" 
            label="Mật khẩu mới" 
            rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {/* Theme Section */}
      <Card 
        className="mobile-settings-card"
        title={
          <Space>
            <BgColorsOutlined />
            <span>Giao diện</span>
          </Space>
        }
        bodyStyle={{ padding: '16px 12px' }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0'
        }}>
          <Text>Chế độ giao diện</Text>
          <Switch 
            checkedChildren="Tối" 
            unCheckedChildren="Sáng" 
            size="default"
          />
        </div>
      </Card>
    </div>
  );

  const renderMobileISOTab = () => (
    <div style={{ padding: '0 16px' }}>
      {/* Header with Save Button */}
      <Card className="mobile-settings-card" style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
            Quy Trình ISO 19650
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Cấu hình workflow tự động và quy trình phê duyệt
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleISOSave}
          loading={loading}
          size="large"
          block
        >
          Lưu Thay Đổi
        </Button>
      </Card>

      {/* Project Selector */}
      <Card 
        title="Chọn dự án"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px 12px' }}
      >
        <Select
          style={{ width: '100%', marginBottom: 12 }}
          placeholder="Chọn dự án để cấu hình riêng"
          allowClear
          value={selectedProjectId}
          onChange={handleProjectChange}
          size="large"
        >
          <Option value={null}>Toàn hệ thống (Global)</Option>
          {projects.map(project => (
            <Option key={project.id} value={project.id}>
              {project.name}
            </Option>
          ))}
        </Select>
        {selectedProjectId && (
          <Tag color="blue">
            Cấu hình riêng: {projects.find(p => p.id === selectedProjectId)?.name}
          </Tag>
        )}
      </Card>

      {/* Document Status Configuration */}
      <Card 
        title="Trạng Thái Tài Liệu"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px 12px' }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Cấu hình các trạng thái tài liệu theo ISO 19650
        </Text>
        
        {documentStatuses.map((status) => (
          <Card 
            key={status.id} 
            size="small" 
            style={{ marginBottom: 8 }}
            bodyStyle={{ padding: '8px' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Input
                value={status.name}
                onChange={(e) => updateDocumentStatus(status.id, 'name', e.target.value)}
                placeholder="Tên tiếng Anh"
                style={{ marginBottom: 8 }}
              />
              <Input
                value={status.nameVi}
                onChange={(e) => updateDocumentStatus(status.id, 'nameVi', e.target.value)}
                placeholder="Tên tiếng Việt"
                style={{ marginBottom: 8 }}
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ColorPicker
                  value={status.color}
                  onChange={(color) => updateDocumentStatus(status.id, 'color', color.toHexString())}
                  size="small"
                />
                <Tag color={status.color} style={{ margin: 0 }}>
                  {status.nameVi}
                </Tag>
              </div>
              <Switch
                size="small"
                checked={status.isActive}
                onChange={(checked) => updateDocumentStatus(status.id, 'isActive', checked)}
              />
            </div>
          </Card>
        ))}
      </Card>

      {/* Metadata Fields Configuration */}
      <Card 
        title="Metadata Fields"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px 12px' }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Cấu hình các trường metadata bắt buộc theo ISO 19650
        </Text>
        
        {metadataFields.map((field) => (
          <Card 
            key={field.id} 
            size="small" 
            style={{ marginBottom: 8 }}
            bodyStyle={{ padding: '8px' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Input
                value={field.name}
                onChange={(e) => updateMetadataField(field.id, 'name', e.target.value)}
                placeholder="Tên tiếng Anh"
                style={{ marginBottom: 8 }}
              />
              <Input
                value={field.nameVi}
                onChange={(e) => updateMetadataField(field.id, 'nameVi', e.target.value)}
                placeholder="Tên tiếng Việt"
                style={{ marginBottom: 8 }}
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Checkbox
                checked={field.isRequired}
                onChange={(e) => updateMetadataField(field.id, 'isRequired', e.target.checked)}
              >
                Bắt buộc
              </Checkbox>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch
                  size="small"
                  checked={field.isActive}
                  onChange={(checked) => updateMetadataField(field.id, 'isActive', checked)}
                />
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeMetadataField(field.id)}
                />
              </div>
            </div>
          </Card>
        ))}
        
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addMetadataField}
          block
          style={{ marginTop: 8 }}
        >
          Thêm Field Mới
        </Button>
      </Card>

      {/* Approval Process Configuration */}
      <Card 
        title="Quy Trình Phê Duyệt"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px 12px' }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Cấu hình quy trình phê duyệt tự động theo ISO 19650
        </Text>
        
        {approvalSteps.map((step) => (
          <Card 
            key={step.id} 
            size="small" 
            style={{ marginBottom: 8 }}
            bodyStyle={{ padding: '8px' }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              marginBottom: 8
            }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                backgroundColor: '#1890ff', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                marginRight: 8,
                flexShrink: 0
              }}>
                {step.order}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 14 }}>{step.nameVi}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {step.description}
                </Text>
              </div>
            </div>
            
            <div style={{ marginLeft: 32 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Switch
                    size="small"
                    checked={step.isAutomatic}
                    onChange={(checked) => updateApprovalStep(step.id, 'isAutomatic', checked)}
                  />
                  <Text style={{ marginLeft: 8, fontSize: 12 }}>
                    {step.isAutomatic ? 'Tự động' : 'Thủ công'}
                  </Text>
                </div>
                <Checkbox
                  checked={step.isRequired}
                  onChange={(e) => updateApprovalStep(step.id, 'isRequired', e.target.checked)}
                >
                  <Text style={{ fontSize: 12 }}>Bắt buộc</Text>
                </Checkbox>
              </div>
              
              {step.id === 'final-approval' && (
                <Select
                  value={step.approverRole}
                  onChange={(value) => updateApprovalStep(step.id, 'approverRole', value)}
                  placeholder="Chọn vai trò"
                  style={{ width: '100%' }}
                  size="small"
                >
                  <Option value="Project Manager">Project Manager</Option>
                  <Option value="Technical Lead">Technical Lead</Option>
                  <Option value="Quality Manager">Quality Manager</Option>
                </Select>
              )}
            </div>
          </Card>
        ))}
      </Card>

      {/* File Naming Rules */}
      <Card 
        title="Quy Tắc Đặt Tên File"
        style={{ marginBottom: 80 }}
        bodyStyle={{ padding: '16px 12px' }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Cấu hình quy tắc đặt tên file theo ISO 19650
        </Text>
        
        <div style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Template:</Text>
          <Input
            value={fileNamingRule.template}
            onChange={(e) => setFileNamingRule(prev => ({ ...prev, template: e.target.value }))}
            placeholder="{Project}-{Originator}-{Zone}-{Level}-{Type}-{Role}-{Number}"
            style={{ marginBottom: 8 }}
          />
          
          <Text style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Ví dụ:</Text>
          <Input
            value={fileNamingRule.example}
            onChange={(e) => setFileNamingRule(prev => ({ ...prev, example: e.target.value }))}
            placeholder="ABC-XYZ-00-00-DR-A-001.pdf"
            style={{ marginBottom: 8 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={fileNamingRule.isActive}
            onChange={(checked) => setFileNamingRule(prev => ({ ...prev, isActive: checked }))}
          />
          <Text style={{ marginLeft: 8, fontSize: 12 }}>Kích hoạt quy tắc đặt tên</Text>
        </div>
      </Card>
    </div>
  );

  const renderMobilePermissionMatrixTab = () => {
    // Show loading state
    if (loadingPermissions) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải ma trận phân quyền...</Text>
          </div>
        </div>
      );
    }

    // Show error state if no data
    if (!permissions.length || !roles.length) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Không thể tải dữ liệu phân quyền</Text>
          </div>
          <Button type="primary" onClick={fetchPermissionMatrix}>
            Thử lại
          </Button>
        </div>
      );
    }

    // Định nghĩa các chức năng hệ thống (giống như trong Settings.tsx)
    const systemFeatures = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        nameVi: 'Tổng quan',
        description: 'Xem tổng quan hệ thống, thống kê và biểu đồ'
      },
      {
        id: 'projects',
        name: 'Projects',
        nameVi: 'Dự án',
        description: 'Quản lý dự án, thông tin và tiến độ'
      },
      {
        id: 'tasks',
        name: 'Tasks',
        nameVi: 'Nhiệm vụ',
        description: 'Quản lý nhiệm vụ và công việc'
      },
      {
        id: 'issues',
        name: 'Issues',
        nameVi: 'Vấn đề',
        description: 'Quản lý vấn đề và yêu cầu thông tin'
      },
      {
        id: 'documents',
        name: 'Documents ISO',
        nameVi: 'Tài liệu ISO',
        description: 'Quản lý tài liệu theo chuẩn ISO 19650'
      },
      {
        id: 'calendar',
        name: 'Calendar',
        nameVi: 'Lịch',
        description: 'Quản lý lịch họp, deadline và sự kiện'
      },
      {
        id: 'notes',
        name: 'Notes',
        nameVi: 'Ghi chú',
        description: 'Quản lý ghi chú và bình luận'
      },
      {
        id: 'checklist',
        name: 'Design Checklist',
        nameVi: 'Hồ sơ thiết kế',
        description: 'Quản lý checklist hồ sơ thiết kế'
      },
      {
        id: 'approvals',
        name: 'Approval Kanban',
        nameVi: 'Phê duyệt hồ sơ',
        description: 'Quản lý quy trình phê duyệt theo Kanban'
      },
      {
        id: 'todo',
        name: 'Todo List',
        nameVi: 'Danh sách nhiệm vụ',
        description: 'Quản lý nhiệm vụ theo ngày'
      },
      {
        id: 'reports',
        name: 'Reports',
        nameVi: 'Báo cáo',
        description: 'Quản lý báo cáo và thống kê hệ thống'
      },
      {
        id: 'users',
        name: 'Users Management',
        nameVi: 'Quản lý người dùng',
        description: 'Quản lý thành viên, vai trò và phân quyền'
      },
      {
        id: 'settings',
        name: 'System Settings',
        nameVi: 'Cài đặt hệ thống',
        description: 'Cấu hình hệ thống và quy trình ISO'
      }
    ];

    const renderRolesSection = () => (
      <div>
        {systemFeatures
          .map(feature => {
            // Get permissions for this feature from backend data
            const featurePermissions = permissions.filter(p => p.category === feature.id);
            return { feature, featurePermissions };
          })
          .filter(({ featurePermissions }) => featurePermissions.length > 0)
          .map(({ feature, featurePermissions }) => (
            <div key={feature.id} style={{ marginBottom: 16 }}>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '8px 12px', 
                borderRadius: '6px',
                marginBottom: 8,
                fontWeight: 600,
                fontSize: '14px'
              }}>
                {feature.nameVi}
              </div>
              {featurePermissions.map(permission => (
                <div key={permission.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                      {permission.nameVi}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                      {permission.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {roles.map(role => (
                      <Checkbox
                        key={role.id}
                        checked={permissionMatrix[permission.id]?.[role.id] || false}
                        onChange={(e) => updatePermissionMatrix(permission.id, role.id, e.target.checked)}
                        style={{ fontSize: '10px' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    );

    const renderPositionsSection = () => (
      <div>
        {systemFeatures.map(feature => {
          // Get permissions for this feature from backend data
          const featurePermissions = permissions.filter(p => p.category === feature.id);
          
          if (featurePermissions.length === 0) return null;
          
          return (
            <div key={feature.id} style={{ marginBottom: 16 }}>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '8px 12px', 
                borderRadius: '6px',
                marginBottom: 8,
                fontWeight: 600,
                fontSize: '14px'
              }}>
                {feature.nameVi}
              </div>
              {featurePermissions.map(permission => (
                <div key={permission.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                      {permission.nameVi}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                      {permission.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {positions.map(position => (
                      <Checkbox
                        key={position.id}
                        checked={positionPermissionMatrix[permission.id]?.[position.id] || false}
                        onChange={(e) => updatePositionPermissionMatrix(permission.id, position.id, e.target.checked)}
                        style={{ fontSize: '10px' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );

    return (
      <div style={{ padding: '0 16px' }}>
        {/* Save Button */}
        <Card 
          className="mobile-settings-card"
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '12px' }}
        >
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handlePermissionMatrixSave} 
            loading={loading}
            size="large"
            block
          >
            Lưu Thay Đổi
          </Button>
        </Card>

        {/* Permission Tabs */}
        <Card 
          className="mobile-settings-card"
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '12px' }}
        >
          <Tabs 
            activeKey={activePermissionTab} 
            onChange={setActivePermissionTab}
            centered
            size="small"
            items={[
              {
                key: 'roles',
                label: (
                  <div style={{ padding: '4px 8px' }}>
                    <TeamOutlined style={{ marginBottom: 2 }} />
                    <div style={{ fontSize: 10 }}>Theo Vai Trò</div>
                  </div>
                ),
                children: renderRolesSection()
              },
              {
                key: 'positions',
                label: (
                  <div style={{ padding: '4px 8px' }}>
                    <UserOutlined style={{ marginBottom: 2 }} />
                    <div style={{ fontSize: 10 }}>Theo Vị Trí</div>
                  </div>
                ),
                children: renderPositionsSection()
              }
            ]}
          />
        </Card>
        
        <div style={{ height: 80 }} /> {/* Space for navigation */}
      </div>
    );
  };

  return (
    <div 
      className="mobile-settings-container mobile-settings"
      style={{ 
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
        paddingTop: 16,
        paddingBottom: 80
      }}
    >
      {/* Header */}
      <div 
        className="mobile-settings-header"
        style={{ 
          padding: '0 16px 16px 16px',
          textAlign: 'center',
          backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
          borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
        }}
      >
        <SettingOutlined style={{ fontSize: 20, color: '#1890ff', marginBottom: 8 }} />
        <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
          Cài Đặt
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Quản lý thông tin cá nhân và cấu hình hệ thống
        </Text>
      </div>

      {/* Mobile Tabs */}
      <div 
        className="mobile-settings-tabs"
        style={{ 
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
          borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
          marginBottom: 16
        }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          size="small"
          items={[
            {
              key: 'profile',
              label: (
                <div style={{ padding: '4px 8px' }}>
                  <FileTextOutlined style={{ marginBottom: 2 }} />
                  <div style={{ fontSize: 10 }}>Hồ sơ</div>
                </div>
              ),
              children: renderMobileProfileTab()
            },
            {
              key: 'iso',
              label: (
                <div style={{ padding: '4px 8px' }}>
                  <ForkOutlined style={{ marginBottom: 2 }} />
                  <div style={{ fontSize: 10 }}>ISO</div>
                </div>
              ),
              children: renderMobileISOTab()
            },
            {
              key: 'permissions',
              label: (
                <div style={{ padding: '4px 8px' }}>
                  <TeamOutlined style={{ marginBottom: 2 }} />
                  <div style={{ fontSize: 10 }}>Phân quyền</div>
                </div>
              ),
              children: renderMobilePermissionMatrixTab()
            }
          ]}
        />
      </div>
    </div>
  );
};

export default MobileSettingsView;
