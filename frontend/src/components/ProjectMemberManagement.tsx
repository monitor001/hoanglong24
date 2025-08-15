import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
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
  Input,
  Form,
  Popconfirm,
  Badge,
  Alert
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  LockOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ProjectMemberPermissions from './ProjectMemberPermissions';
import '../styles/project-member-management.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface ProjectMemberManagementProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onMembersUpdated: () => void;
}

const ProjectMemberManagement: React.FC<ProjectMemberManagementProps> = ({
  visible,
  onClose,
  projectId,
  projectName,
  onMembersUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [form] = Form.useForm();
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);

  const roleColors: { [key: string]: string } = {
    ADMIN: 'red',
    PROJECT_MANAGER: 'blue',
    BIM_MANAGER: 'green',
    CONTRIBUTOR: 'orange',
    VIEWER: 'purple',
    USER: 'default'
  };

  const roleLabels: { [key: string]: string } = {
    ADMIN: 'Quản trị viên',
    PROJECT_MANAGER: 'Quản lý dự án',
    BIM_MANAGER: 'Quản lý BIM',
    CONTRIBUTOR: 'Thành viên',
    VIEWER: 'Người xem',
    USER: 'Người dùng'
  };

  useEffect(() => {
    if (visible) {
      loadMembers();
      loadUsers();
    }
  }, [visible]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/members`);
      setMembers(response.data.data.members || []);
    } catch (error) {
      console.error('Error loading project members:', error);
      message.error('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/all');
      setUsers(response.data.users || response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Không thể tải danh sách người dùng');
    }
  };

  const handleAddMember = async (values: any) => {
    try {
      await axiosInstance.post(`/api/projects/${projectId}/members`, {
        userId: values.userId,
        role: values.role
      });
      
      message.success('Thêm thành viên thành công');
      setAddMemberModalVisible(false);
      form.resetFields();
      loadMembers();
      onMembersUpdated();
    } catch (error) {
      console.error('Error adding member:', error);
      message.error('Không thể thêm thành viên');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await axiosInstance.put(`/api/projects/${projectId}/members/${memberId}`, {
        role: newRole
      });
      
      message.success('Cập nhật vai trò thành công');
      loadMembers();
      onMembersUpdated();
    } catch (error) {
      console.error('Error updating member role:', error);
      message.error('Không thể cập nhật vai trò');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await axiosInstance.delete(`/api/projects/${projectId}/members/${memberId}`);
      
      message.success('Xóa thành viên thành công');
      loadMembers();
      onMembersUpdated();
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('Không thể xóa thành viên');
    }
  };

  const handleManagePermissions = (member: ProjectMember) => {
    setSelectedMember(member);
    setPermissionsModalVisible(true);
  };

  const handlePermissionsUpdated = () => {
    loadMembers();
    onMembersUpdated();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.userName.toLowerCase().includes(searchText.toLowerCase()) ||
                         member.userEmail.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      title: 'Thành viên',
      key: 'member',
      width: 200,
      render: (member: ProjectMember) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{member.userName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{member.userEmail}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>
          {roleLabels[role] || role}
        </Tag>
      ),
      filters: Object.keys(roleLabels).map(role => ({
        text: roleLabels[role],
        value: role
      })),
      onFilter: (value: string, record: ProjectMember) => record.role === value
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Quyền',
      key: 'permissions',
      width: 100,
      render: (member: ProjectMember) => (
        <Badge 
          count={member.permissions?.filter(p => p.granted).length || 0} 
          showZero 
          style={{ backgroundColor: '#52c41a' }}
        >
          <Button 
            type="text" 
            size="small" 
            icon={<SettingOutlined />}
            onClick={() => handleManagePermissions(member)}
          >
            Quyền
          </Button>
        </Badge>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (member: ProjectMember) => (
        <Space>
          <Select
            value={member.role}
            onChange={(value) => handleUpdateMemberRole(member.id, value)}
            size="small"
            style={{ width: 120 }}
          >
            {Object.keys(roleLabels).map(role => (
              <Option key={role} value={role}>
                {roleLabels[role]}
              </Option>
            ))}
          </Select>
          <Popconfirm
            title="Xóa thành viên"
            description="Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?"
            onConfirm={() => handleRemoveMember(member.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="text" 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Quản lý thành viên dự án: {projectName}</span>
          </Space>
        }
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button key="close" onClick={onClose}>
            Đóng
          </Button>
        ]}
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col flex="auto">
              <Search
                placeholder="Tìm kiếm thành viên..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Lọc theo vai trò"
                value={roleFilter}
                onChange={setRoleFilter}
                allowClear
                style={{ width: 150 }}
              >
                {Object.keys(roleLabels).map(role => (
                  <Option key={role} value={role}>
                    {roleLabels[role]}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadMembers}
                loading={loading}
              >
                Tải lại
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddMemberModalVisible(true)}
              >
                Thêm thành viên
              </Button>
            </Col>
          </Row>

          <Alert
            message="Thông tin thành viên"
            description={`Dự án hiện có ${members.length} thành viên. Bạn có thể quản lý vai trò và quyền chi tiết cho từng thành viên.`}
            type="info"
            showIcon
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thành viên`
          }}
          scroll={{ x: 800 }}
        />
      </Modal>

      {/* Add Member Modal */}
      <Modal
        title="Thêm thành viên mới"
        open={addMemberModalVisible}
        onCancel={() => setAddMemberModalVisible(false)}
        footer={null}
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMember}
        >
          <Form.Item
            name="userId"
            label="Chọn người dùng"
            rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
          >
            <Select
              placeholder="Chọn người dùng"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users
                .filter(user => !members.find(member => member.userId === user.id))
                .map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              {Object.keys(roleLabels).map(role => (
                <Option key={role} value={role}>
                  {roleLabels[role]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm thành viên
              </Button>
              <Button onClick={() => setAddMemberModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Permissions Modal */}
      <ProjectMemberPermissions
        visible={permissionsModalVisible}
        onClose={() => setPermissionsModalVisible(false)}
        projectId={projectId}
        member={selectedMember}
        onPermissionsUpdated={handlePermissionsUpdated}
      />
    </>
  );
};

export default ProjectMemberManagement;
