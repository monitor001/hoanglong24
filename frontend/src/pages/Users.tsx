import React, { useEffect, useState } from 'react';
import { getRoleDisplayName, getRoleColor, getRoleInfo } from '../constants/roles';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Popconfirm, 
  message, 
  DatePicker,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Tag,
  Tooltip,
  Divider,
  Tabs,
  Descriptions
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  CrownOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import MobileUsersView from '../components/MobileUsersView';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import FloatingActionButton from '../components/FloatingActionButton';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/mobile-users.css';
import '../styles/desktop-icon-standardization.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/modal-button-fix.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const outletContext = useOutletContext<{ role?: string }>() || {};
  const role = outletContext.role || '';
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [activeTab, setActiveTab] = useState('members');
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const { isMobile } = useResponsive();
  
  // Dark mode detection
  const theme = useSelector((state: any) => state.ui.theme);
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Tablet landscape detection
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  
  useEffect(() => {
    const checkTabletLandscape = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsTabletLandscape(width >= 769 && width <= 1366 && height < width);
    };
    
    checkTabletLandscape();
    window.addEventListener('resize', checkTabletLandscape);
    window.addEventListener('orientationchange', checkTabletLandscape);
    
    return () => {
      window.removeEventListener('resize', checkTabletLandscape);
      window.removeEventListener('orientationchange', checkTabletLandscape);
    };
  }, []);

  // Users data will be fetched from API

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users/all');
      console.log('User data response:', res.data);
      if (res.data && Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (res.data && res.data.users && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        console.error('Invalid users data format:', res.data);
        message.error('Dữ liệu người dùng không đúng định dạng!');
        setUsers([]); // Don't fallback to mock data
      }
    } catch (e) {
      console.error('Lỗi fetchUsers:', e);
      message.error('Không thể tải danh sách người dùng!');
      setUsers([]); // Don't fallback to mock data
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await axiosInstance.get('/projects');
      console.log('Projects data response:', res.data);
      if (res.data && Array.isArray(res.data)) {
        setProjects(res.data);
      } else if (res.data && res.data.projects && Array.isArray(res.data.projects)) {
        setProjects(res.data.projects);
      } else {
        console.error('Invalid projects data format:', res.data);
        setProjects([]);
      }
    } catch (e) {
      console.error('Lỗi fetchProjects:', e);
      setProjects([]);
    }
    setProjectsLoading(false);
  };

  useEffect(() => { 
    fetchUsers(); 
    fetchProjects();
  }, []);


  const getRoleDisplayInfo = (role: string) => {
    const roleMap: { [key: string]: { name: string; color: string } } = {
      'ADMIN': { name: 'Quản trị viên', color: 'red' },
      'PROJECT_MANAGER': { name: 'Quản lý dự án', color: 'blue' },
      'BIM_MANAGER': { name: 'Quản lý BIM', color: 'purple' },
      'CONTRIBUTOR': { name: 'Cộng tác viên', color: 'green' },
      'VIEWER': { name: 'Người xem', color: 'orange' },
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

  const getFilteredUsers = () => {
    // Ensure users is an array before filtering
    if (!Array.isArray(users)) {
      console.warn('Users is not an array:', users);
      return [];
    }
    
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      const matchesOrganization = selectedOrganization === 'all' || user.organization === selectedOrganization;
      
      // Filter by project
      let matchesProject = true;
      if (selectedProject !== 'all') {
        if (user.projects && Array.isArray(user.projects)) {
          // Check if user has the selected project
          matchesProject = user.projects.some((project: any) => {
            if (typeof project === 'string') {
              // If project is string (project name), compare with project name
              const foundProject = projects.find(p => p.id === selectedProject);
              return foundProject && foundProject.name === project;
            } else {
              // If project is object, compare with project id
              return project.id === selectedProject || project === selectedProject;
            }
          });
        } else {
          matchesProject = false;
        }
      }
      
      return matchesSearch && matchesRole && matchesStatus && matchesOrganization && matchesProject;
    });
  };

  const handleView = async (record: any) => {
    try {
      // Get detailed user information with associated data counts
      const response = await axiosInstance.get(`/users/${record.id}/details`);
      const userDetails = response.data;
      setViewingUser(userDetails);
      setViewModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      // Fallback to basic user data
      setViewingUser(record);
      setViewModalOpen(true);
    }
  };

  const handleEdit = (record: any) => {
    setEditingUser(record);
    // Convert projects array to project IDs for form
    const formData = {
      ...record,
      projects: record.projects ? record.projects.map((project: any) => {
        // If project is string (project name), we need to find the project ID
        if (typeof project === 'string') {
          const foundProject = projects.find(p => p.name === project);
          return foundProject ? foundProject.id : project;
        }
        // If project is object with id, use the id
        return project.id || project;
      }) : [],
      // Ensure all form fields are populated
      status: record.status || 'active',
      organization: record.organization || ''
    };
    form.setFieldsValue(formData);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/users/${id}`);
      message.success('Đã xóa người dùng thành công');
      fetchUsers();
    } catch (error: any) {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi xóa người dùng';
      
      // Check if it's a constraint error (user has associated data)
      if (error.response?.status === 400 && errorMessage.includes('associated data')) {
        Modal.error({
          title: 'Không thể xóa người dùng',
          content: (
            <div>
              <p style={{ marginBottom: 16 }}>
                <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                {errorMessage}
              </p>
              <Divider />
              <p style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: 12 }}>
                Hướng dẫn xóa người dùng:
              </p>
              <ol style={{ paddingLeft: 20, lineHeight: 1.6 }}>
                <li><strong>Dự án:</strong> Chuyển giao hoặc xóa tất cả dự án do người dùng quản lý</li>
                <li><strong>Tài liệu:</strong> Xóa hoặc chuyển quyền sở hữu tài liệu</li>
                <li><strong>Công việc:</strong> Chuyển giao hoặc xóa các công việc được gán</li>
                <li><strong>Bình luận & Ghi chú:</strong> Xóa các bình luận và ghi chú</li>
                <li><strong>Vấn đề:</strong> Chuyển giao hoặc xóa các vấn đề đã tạo</li>
                <li><strong>Lịch & Báo cáo:</strong> Xóa các sự kiện lịch và báo cáo</li>
                <li><strong>Danh sách kiểm tra:</strong> Xóa các danh sách kiểm tra đã tạo</li>
                <li><strong>Phê duyệt:</strong> Xóa các tài liệu phê duyệt được gán</li>
                <li><strong>Hoạt động:</strong> Xóa các log hoạt động (nếu cần)</li>
              </ol>
              <Divider />
              <p style={{ color: '#ff4d4f', fontSize: '12px', fontStyle: 'italic' }}>
                💡 <strong>Lưu ý:</strong> Sau khi xóa tất cả dữ liệu liên quan, hãy thử xóa người dùng lại.
              </p>
            </div>
          ),
          okText: 'Đã hiểu',
          width: 600,
          style: { top: 20 }
        });
      } else if (error.response?.status === 403) {
        Modal.error({
          title: 'Không có quyền',
          content: 'Bạn không có quyền xóa người dùng. Chỉ Admin mới có thể thực hiện thao tác này.',
          okText: 'Đã hiểu'
        });
      } else if (error.response?.status === 400 && errorMessage.includes('own account')) {
        Modal.error({
          title: 'Không thể xóa tài khoản',
          content: 'Bạn không thể xóa tài khoản của chính mình.',
          okText: 'Đã hiểu'
        });
      } else {
        message.error(errorMessage);
      }
    }
  };

  const handleDeleteClick = async (user: any) => {
    try {
      // First, get detailed user information to check for associated data
      const response = await axiosInstance.get(`/users/${user.id}/details`);
      const userDetails = response.data;
      
      // Check if user has associated data
      const associatedData = [];
      if (userDetails._count.projects > 0) associatedData.push(`${userDetails._count.projects} dự án`);
      if (userDetails._count.documents > 0) associatedData.push(`${userDetails._count.documents} tài liệu`);
      if (userDetails._count.tasks > 0) associatedData.push(`${userDetails._count.tasks} công việc`);
      if (userDetails._count.comments > 0) associatedData.push(`${userDetails._count.comments} bình luận`);
      if (userDetails._count.projectNotes > 0) associatedData.push(`${userDetails._count.projectNotes} ghi chú dự án`);
      if (userDetails._count.activityLogs > 0) associatedData.push(`${userDetails._count.activityLogs} log hoạt động`);
      if (userDetails._count.issuesCreated > 0) associatedData.push(`${userDetails._count.issuesCreated} vấn đề đã tạo`);
      if (userDetails._count.issuesAssigned > 0) associatedData.push(`${userDetails._count.issuesAssigned} vấn đề được gán`);
      if (userDetails._count.calendarEvents > 0) associatedData.push(`${userDetails._count.calendarEvents} sự kiện lịch`);
      if (userDetails._count.reports > 0) associatedData.push(`${userDetails._count.reports} báo cáo`);
      if (userDetails._count.todos > 0) associatedData.push(`${userDetails._count.todos} công việc cá nhân`);
      if (userDetails._count.designChecklists > 0) associatedData.push(`${userDetails._count.designChecklists} danh sách kiểm tra`);
      if (userDetails._count.approvalDocuments > 0) associatedData.push(`${userDetails._count.approvalDocuments} tài liệu phê duyệt`);
      if (userDetails._count.notes > 0) associatedData.push(`${userDetails._count.notes} ghi chú`);
      if (userDetails._count.folders > 0) associatedData.push(`${userDetails._count.folders} thư mục`);
      
      if (associatedData.length > 0) {
        // Show warning modal with associated data and force delete option
        Modal.confirm({
          title: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
              Không thể xóa người dùng
            </div>
          ),
          content: (
            <div>
              <p style={{ marginBottom: 16 }}>
                Người dùng <strong style={{ color: '#1890ff' }}>{user.name}</strong> có dữ liệu liên quan:
              </p>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: 12, 
                borderRadius: 6, 
                marginBottom: 16,
                maxHeight: 200,
                overflowY: 'auto'
              }}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {associatedData.map((item, index) => (
                    <li key={index} style={{ marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
              <Divider />
              <p style={{ color: '#ff4d4f', fontWeight: 'bold', marginBottom: 8 }}>
                ⚠️ Hành động cần thiết:
              </p>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#666', marginBottom: 16 }}>
                Vui lòng xóa hoặc chuyển giao tất cả dữ liệu liên quan trước khi xóa người dùng. 
                Bạn có thể sử dụng các chức năng quản lý dự án, tài liệu, công việc để thực hiện việc này.
              </p>
              <div style={{ 
                backgroundColor: '#fff2e8', 
                border: '1px solid #ffbb96', 
                borderRadius: 6, 
                padding: 12,
                marginTop: 16
              }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#d46b08' }}>
                  <strong>💡 Lưu ý:</strong> Nếu bạn chắc chắn muốn xóa người dùng và tất cả dữ liệu liên quan, 
                  hãy sử dụng tùy chọn "Xóa cưỡng bức" bên dưới. Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>
          ),
          okText: 'Đã hiểu',
          cancelText: 'Hủy',
          width: 550,
          style: { top: 20 },
          footer: (_, { OkBtn, CancelBtn }) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                danger 
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    title: 'Xác nhận xóa cưỡng bức',
                    content: (
                      <div>
                        <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                          ⚠️ CẢNH BÁO: Hành động này sẽ xóa người dùng <strong>{user.name}</strong> và TẤT CẢ dữ liệu liên quan!
                        </p>
                        <p style={{ marginTop: 12 }}>
                          Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục:
                        </p>
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                          {associatedData.map((item, index) => (
                            <li key={index} style={{ color: '#ff4d4f' }}>{item}</li>
                          ))}
                        </ul>
                        <p style={{ marginTop: 16, fontSize: '13px', color: '#666' }}>
                          Bạn có chắc chắn muốn tiếp tục?
                        </p>
                      </div>
                    ),
                    okText: 'Xóa cưỡng bức',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: () => handleForceDelete(user.id)
                  });
                }}
              >
                Xóa cưỡng bức
              </Button>
              <div>
                <CancelBtn />
                <OkBtn />
              </div>
            </div>
          )
        });
      } else {
        // No associated data, proceed with normal deletion
        setUserToDelete(user);
        setDeleteModalVisible(true);
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      // Fallback to normal deletion flow
      setUserToDelete(user);
      setDeleteModalVisible(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      handleDelete(userToDelete.id);
      setDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const handleForceDelete = async (id: string) => {
    try {
      // Force delete with cascade option
      await axiosInstance.delete(`/users/${id}?force=true`);
      message.success('Đã xóa người dùng và tất cả dữ liệu liên quan thành công');
      fetchUsers();
    } catch (error: any) {
      console.error('Force delete user error:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi xóa cưỡng bức người dùng';
      message.error(errorMessage);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Submit user values:', values);
      
      const requestData: any = {
        name: values.name?.trim(),
        email: values.email?.trim().toLowerCase(),
        role: values.role,
        department: values.department,
        phone: values.phone,
        organization: values.organization?.trim(),
        status: values.status || 'active'
      };
      
      if (!editingUser || values.password) {
        requestData.password = values.password;
      }
      
      // Add projects data if provided
      if (values.projects && values.projects.length > 0) {
        requestData.projects = values.projects;
      }
      
      console.log('Sending user data to server:', requestData);
      
      if (editingUser) {
        const response = await axiosInstance.put(`/users/${editingUser.id}`, requestData);
        console.log('User update response:', response.data);
        message.success('Đã cập nhật người dùng');
      } else {
        const response = await axiosInstance.post('/users', requestData);
        console.log('User create response:', response.data);
        message.success('Đã thêm người dùng');
      }
      
      setModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Form submission error:', error);
      message.error(error.response?.data?.error || 'Lỗi khi lưu người dùng!');
    }
  };

  const handleExportExcel = () => {
    try {
      const filteredUsers = getFilteredUsers();
      
      // Prepare data for Excel
      const excelData = filteredUsers.map(user => ({
        'Họ và tên': user.name || '',
        'Email': user.email || '',
        'Số điện thoại': user.phone || '',
        'Vai trò': getRoleDisplayName(user.role),
        'Phòng ban': user.department || '',
        'Tổ chức': user.organization || '',
        'Trạng thái': getStatusText(user.status),
        'Dự án tham gia': Array.isArray(user.projects) ? user.projects.join(', ') : '',
        'Đăng nhập cuối': user.lastLogin ? moment(user.lastLogin).format('DD/MM/YYYY HH:mm') : 'Chưa đăng nhập',
        'Ngày tạo': moment(user.createdAt).format('DD/MM/YYYY')
      }));

      // Create CSV content
      const headers = Object.keys(excelData[0] || {});
      const csvContent = [
        headers.join(','),
        ...excelData.map(row => 
          headers.map(header => {
            const value = (row as any)[header] || '';
            // Escape commas and quotes in CSV
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_nguoi_dung_${moment().format('YYYY-MM-DD_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success(`Đã xuất ${filteredUsers.length} người dùng ra file Excel`);
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất file Excel');
    }
  };

  const handleFiltersReset = () => {
    setSearchText('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setSelectedProject('all');
    setSelectedOrganization('all');
  };

  const columns = [
    {
      title: 'THÀNH VIÊN',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} style={{ backgroundColor: '#1890ff' }}>
            {record.name ? record.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{text || 'Không có tên'}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.email || 'Không có email'}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.phone || 'Không có số điện thoại'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'VAI TRÒ',
      dataIndex: 'role',
      key: 'role',
      render: (role: string | undefined) => {
        const roleInfo = getRoleInfo(role || 'MEMBER');
        return <Tag color={roleInfo.color}>{roleInfo.nameVi}</Tag>;
      },
    },
    {
      title: 'PHÒNG BAN',
      dataIndex: 'department',
      key: 'department',
      render: (department: string | undefined) => (
        <span>{department || 'Chưa phân công'}</span>
      ),
    },
    {
      title: 'TỔ CHỨC',
      dataIndex: 'organization',
      key: 'organization',
      render: (organization: string | undefined) => (
        <span>{organization || 'Chưa có'}</span>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status: string | undefined) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getStatusIcon(status || 'active')}
          <span>{getStatusText(status || 'active')}</span>
        </div>
      ),
    },
    {
      title: 'HOẠT ĐỘNG',
      key: 'activity',
      render: (record: any) => {
        const isOnline = record.isOnline;
        const currentIp = record.currentIp;
        const deviceInfo = record.deviceInfo;
        const lastActivity = record.lastActivity;
        
        return (
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div 
                style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: isOnline ? '#52c41a' : '#d9d9d9',
                  flexShrink: 0
                }} 
              />
              <span style={{ color: isOnline ? '#52c41a' : '#666' }}>
                {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            {currentIp && (
              <div style={{ color: '#666', marginBottom: 2 }}>
                IP: {currentIp}
              </div>
            )}
            {deviceInfo && (
              <div style={{ color: '#666', marginBottom: 2 }}>
                Thiết bị: {deviceInfo}
              </div>
            )}
            {lastActivity && (
              <div style={{ color: '#999' }}>
                Cuối: {moment(lastActivity).format('HH:mm DD/MM')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'DỰ ÁN',
      dataIndex: 'projects',
      key: 'projects',
      render: (projects: string[] | undefined) => (
        <div>
          {projects && projects.length > 0 ? (
            projects.map((project, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                {project}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Chưa có dự án</Text>
          )}
        </div>
      ),
    },
    {
      title: 'ĐĂNG NHẬP CUỐI',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string | undefined) => (
        <div style={{ fontSize: 12 }}>
          {date ? moment(date).format('YYYY-MM-DD HH:mm') : 'Chưa đăng nhập'}
        </div>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      render: (record: any) => (
        <div className="desktop-button-group">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            className="desktop-icon-standard desktop-icon-view"
            title="Xem chi tiết"
          />
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="desktop-icon-standard desktop-icon-edit"
            title="Chỉnh sửa"
          />
          <Button 
            size="small" 
            icon={<DeleteOutlined />}
            className="desktop-icon-standard desktop-icon-delete"
            title="Xóa"
            onClick={() => handleDeleteClick(record)}
          />
        </div>
      ),
    },
  ];

  const renderMembersTab = () => {
    // Mobile view
    if (isMobile) {
      return (
        <MobileUsersView
          users={getFilteredUsers()}
          loading={loading}
          searchText={searchText}
          selectedRole={selectedRole}
          selectedStatus={selectedStatus}
          selectedProject={selectedProject}
          projects={projects}
          projectsLoading={projectsLoading}
          onSearchChange={setSearchText}
          onRoleChange={setSelectedRole}
          onStatusChange={setSelectedStatus}
          onProjectChange={setSelectedProject}
          onFiltersReset={handleFiltersReset}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onExport={handleExportExcel}
          onRefresh={fetchUsers}
        />
      );
    }

    // Desktop view
    return (
      <div>
        {/* Header with title and action buttons for tablet landscape */}
        {isTabletLandscape && (
          <Row style={{ marginBottom: 16 }} align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ margin: 0 }}>Quản lý thành viên</Title>
            </Col>
            <Col>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
                  Xuất Excel
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  Thêm Thành Viên
                </Button>
              </Space>
            </Col>
          </Row>
        )}

        {/* Filter and Search Bar */}
        <ResponsiveCollapsibleFilters
          searchValue={searchText}
          searchPlaceholder="Tìm kiếm thành viên..."
          onSearchChange={setSearchText}
          statusValue={selectedStatus}
          statusOptions={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Không hoạt động' }
          ]}
          onStatusChange={setSelectedStatus}
          priorityValue={selectedRole}
          priorityOptions={[
            { value: 'all', label: 'Tất cả vai trò' },
            { value: 'ADMIN', label: 'Quản trị viên' },
            { value: 'PROJECT_MANAGER', label: 'Quản lý dự án' },
            { value: 'BIM_MANAGER', label: 'Quản lý BIM' },
            { value: 'CONTRIBUTOR', label: 'Biên tập viên' },
            { value: 'VIEWER', label: 'Người xem' },
            { value: 'USER', label: 'Người dùng' }
          ]}
          onPriorityChange={setSelectedRole}
          projectValue={selectedProject}
          projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
          onProjectChange={setSelectedProject}
          assigneeValue=""
          assigneeOptions={[]}
          onAssigneeChange={() => {}}
          onReset={handleFiltersReset}
          title="Bộ lọc thành viên"
          isMobile={isMobile}
          isTabletLandscape={isTabletLandscape}
          isDarkMode={isDarkMode}
          additionalFilters={
            <Col span={24}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={isMobile ? 24 : isTabletLandscape ? 12 : 6}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Tổ chức:</Text>
                  </div>
                  <Select
                    value={selectedOrganization}
                    onChange={setSelectedOrganization}
                    placeholder="Chọn tổ chức"
                    style={{ width: '100%' }}
                    size={isMobile ? 'large' : 'middle'}
                  >
                    <Option value="all">Tất cả tổ chức</Option>
                    {Array.from(new Set(users.filter(u => u.organization).map(u => u.organization))).map(org => (
                      <Option key={org} value={org}>{org}</Option>
                    ))}
                  </Select>
                </Col>
                {!isTabletLandscape && (
                  <Col span={18}>
                    <Space>
                      <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
                        Xuất Excel
                      </Button>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm Thành Viên
                      </Button>
                    </Space>
                  </Col>
                )}
              </Row>
              {isTabletLandscape && (
                <Row>
                  <Col span={24}>
                    <Space>
                      <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
                        Xuất Excel
                      </Button>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm Thành Viên
                      </Button>
                    </Space>
                  </Col>
                </Row>
              )}
            </Col>
          }
        />

        {/* Users Table */}
        <Table
          columns={columns}
          dataSource={getFilteredUsers()}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thành viên`,
          }}
        />
      </div>
    );
  };

  const renderRolesTab = () => (
    <div>
      <Text>Quản lý vai trò và quyền hạn</Text>
    </div>
  );

  const renderGroupsTab = () => (
    <div>
      <Text>Quản lý nhóm và tổ chức</Text>
    </div>
  );

  const renderPermissionsTab = () => (
    <div>
      <Text>Ma trận phân quyền</Text>
    </div>
  );

  return (
    <div style={{ padding: isMobile ? '16px 0' : 24 }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24, padding: isMobile ? '0 16px' : 0 }}>
        <Title level={isMobile ? 3 : 2} style={{ margin: 0, fontSize: isMobile ? 18 : undefined }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          {isMobile ? 'Thành Viên' : 'Thành Viên / Phân Quyền'}
        </Title>
        {!isMobile && (
          <Text type="secondary">
            Quản lý thành viên, vai trò và phân quyền truy cập hệ thống
          </Text>
        )}
      </div>

      {/* Tabs */}
      {isMobile ? (
        // Chỉ hiển thị tab Members trên mobile
        <div>
          {renderMembersTab()}
        </div>
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Thành Viên ({users.length})
              </span>
            } 
            key="members"
          >
            {renderMembersTab()}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CrownOutlined />
                Vai Trò (5)
              </span>
            } 
            key="roles"
          >
            {renderRolesTab()}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Nhóm (3)
              </span>
            } 
            key="groups"
          >
            {renderGroupsTab()}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Phân Quyền
              </span>
            } 
            key="permissions"
          >
            {renderPermissionsTab()}
          </TabPane>
        </Tabs>
      )}

      {/* Add/Edit User Modal - Responsive cho 3 thiết bị */}
      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleOk}
            loading={loading}
          >
            OK
          </Button>
        ]}
        width={
          isMobile ? '95%' : 
          isTabletLandscape ? '85%' : 
          600
        }
        style={
          isMobile ? { top: 20 } : 
          isTabletLandscape ? { top: 10 } : 
          {}
        }
        bodyStyle={
          isMobile ? { padding: '16px 12px' } : 
          isTabletLandscape ? { padding: '20px 24px' } : 
          {}
        }
        className={
          isMobile ? "" : 
          isTabletLandscape ? "tablet-landscape-edit-modal" : 
          ""
        }
      >
        <Form
          form={form}
          layout="vertical"
          className={
            isMobile ? "" : 
            isTabletLandscape ? "user-form" : 
            ""
          }
        >
          <Row gutter={isMobile ? 8 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input size={isMobile ? 'large' : 'middle'} />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input size={isMobile ? 'large' : 'middle'} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={isMobile ? 8 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input size={isMobile ? 'large' : 'middle'} />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="department"
                label="Phòng ban"
                rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
              >
                <Select placeholder="Chọn phòng ban" size={isMobile ? 'large' : 'middle'}>
                  <Option value="Kỹ thuật">Kỹ thuật</Option>
                  <Option value="Quản lý dự án">Quản lý dự án</Option>
                  <Option value="Thiết kế">Thiết kế</Option>
                  <Option value="Giám sát">Giám sát</Option>
                  <Option value="Kinh doanh">Kinh doanh</Option>
                  <Option value="Hành chính">Hành chính</Option>
                  <Option value="Tài chính">Tài chính</Option>
                  <Option value="Nhân sự">Nhân sự</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={isMobile ? 8 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="organization"
                label="Tổ chức"
              >
                <Input size={isMobile ? 'large' : 'middle'} placeholder="Tên tổ chức (tùy chọn)" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="active"
              >
                <Select placeholder="Chọn trạng thái" size={isMobile ? 'large' : 'middle'}>
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={isMobile ? 8 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
              >
                <Select placeholder="Chọn vai trò" size={isMobile ? 'large' : 'middle'}>
                  <Option value="ADMIN">Quản trị viên</Option>
                  <Option value="PROJECT_MANAGER">Quản lý dự án</Option>
                  <Option value="BIM_MANAGER">Quản lý BIM</Option>
                  <Option value="CONTRIBUTOR">Biên tập viên</Option>
                  <Option value="VIEWER">Người xem</Option>
                  <Option value="USER">Người dùng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="password"
                label={editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                rules={editingUser ? [] : [{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password size={isMobile ? 'large' : 'middle'} autoComplete="new-password" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="projects"
            label="Dự án tham gia"
          >
            <Select
              mode="multiple"
              placeholder="Chọn dự án"
              loading={projectsLoading}
              showSearch
              size={isMobile ? 'large' : 'middle'}
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View User Modal */}
      <Modal
        title="Chi tiết người dùng"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)} size={isMobile ? 'large' : 'middle'}>
            Đóng
          </Button>
        ]}
        width={isMobile ? '95%' : 600}
        style={isMobile ? { top: 20 } : {}}
        bodyStyle={isMobile ? { padding: '16px 12px' } : {}}
      >
        {viewingUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={80} style={{ backgroundColor: '#1890ff' }}>
                {viewingUser.name ? viewingUser.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
              </Avatar>
              <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
                {viewingUser.name}
              </Title>
              <Text type="secondary">{viewingUser.email}</Text>
            </div>
            
            <Descriptions column={isMobile ? 1 : 2} bordered size={isMobile ? 'small' : 'default'}>
              <Descriptions.Item label="Số điện thoại">
                {viewingUser.phone || 'Chưa có'}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                {viewingUser.department || 'Chưa phân công'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổ chức">
                {viewingUser.organization || 'Chưa có'}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={getRoleInfo(viewingUser.role).color}>
                  {getRoleInfo(viewingUser.role).nameVi}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getStatusIcon(viewingUser.status)}
                  <span>{getStatusText(viewingUser.status)}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Đăng nhập cuối">
                {viewingUser.lastLogin ? moment(viewingUser.lastLogin).format('YYYY-MM-DD HH:mm') : 'Chưa đăng nhập'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(viewingUser.createdAt).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="Dự án tham gia" span={2}>
                {viewingUser.projects && viewingUser.projects.length > 0 ? (
                  <div>
                    {viewingUser.projects.map((project: string, index: number) => (
                      <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                        {project}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">Chưa có dự án</Text>
                )}
              </Descriptions.Item>
              
              {/* Associated Data Information */}
              {viewingUser._count && (
                <Descriptions.Item label="Dữ liệu liên quan" span={2}>
                  <div style={{ marginTop: 8 }}>
                    <Row gutter={[8, 8]}>
                      {viewingUser._count.projects > 0 && (
                        <Col span={12}>
                          <Tag color="blue">{viewingUser._count.projects} dự án</Tag>
                        </Col>
                      )}
                      {viewingUser._count.documents > 0 && (
                        <Col span={12}>
                          <Tag color="green">{viewingUser._count.documents} tài liệu</Tag>
                        </Col>
                      )}
                      {viewingUser._count.tasks > 0 && (
                        <Col span={12}>
                          <Tag color="orange">{viewingUser._count.tasks} công việc</Tag>
                        </Col>
                      )}
                      {viewingUser._count.comments > 0 && (
                        <Col span={12}>
                          <Tag color="purple">{viewingUser._count.comments} bình luận</Tag>
                        </Col>
                      )}
                      {viewingUser._count.issuesCreated > 0 && (
                        <Col span={12}>
                          <Tag color="red">{viewingUser._count.issuesCreated} vấn đề đã tạo</Tag>
                        </Col>
                      )}
                      {viewingUser._count.issuesAssigned > 0 && (
                        <Col span={12}>
                          <Tag color="volcano">{viewingUser._count.issuesAssigned} vấn đề được gán</Tag>
                        </Col>
                      )}
                      {viewingUser._count.todos > 0 && (
                        <Col span={12}>
                          <Tag color="cyan">{viewingUser._count.todos} công việc cá nhân</Tag>
                        </Col>
                      )}
                      {viewingUser._count.designChecklists > 0 && (
                        <Col span={12}>
                          <Tag color="magenta">{viewingUser._count.designChecklists} danh sách kiểm tra</Tag>
                        </Col>
                      )}
                      {viewingUser._count.approvalDocuments > 0 && (
                        <Col span={12}>
                          <Tag color="gold">{viewingUser._count.approvalDocuments} tài liệu phê duyệt</Tag>
                        </Col>
                      )}
                    </Row>
                    {(viewingUser._count.projects > 0 || viewingUser._count.documents > 0 || viewingUser._count.tasks > 0 || 
                      viewingUser._count.comments > 0 || viewingUser._count.issuesCreated > 0 || viewingUser._count.issuesAssigned > 0 ||
                      viewingUser._count.todos > 0 || viewingUser._count.designChecklists > 0 || viewingUser._count.approvalDocuments > 0) && (
                      <div style={{ marginTop: 12, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
                        <Text type="warning" style={{ fontSize: '12px' }}>
                          <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                          Người dùng này có dữ liệu liên quan. Cần xóa hoặc chuyển giao dữ liệu trước khi xóa người dùng.
                        </Text>
                      </div>
                    )}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa người dùng"
        content="Bạn có chắc chắn muốn xóa người dùng"
        itemName={userToDelete?.name}
        size="medium"
      />

      {/* Floating Action Button for Mobile and Tablet */}
      <FloatingActionButton 
        onClick={handleAdd}
        tooltip="Thêm thành viên mới"
        color={`linear-gradient(135deg, #722ed1 0%, #531dab 100%)`}
      />
    </div>
  );
};

export default Users; 