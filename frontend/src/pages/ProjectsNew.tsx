import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Table, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  Modal, 
  Form, 
  message,
  Tooltip,
  Avatar,
  Typography,
  Progress,
  Badge,
  Divider,
  Drawer,
  Popconfirm,
  Popover,
  Collapse,
  List,
  Dropdown,
  Menu,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  ClearOutlined,
  FolderOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SettingOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  MessageOutlined,
  SendOutlined,
  CommentOutlined,
  MoreOutlined,
  MobileOutlined,
  DesktopOutlined,
  InfoCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import moment from 'moment';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import '../styles/projects-responsive.css';
import '../styles/dark-modal.css';
import '../styles/mobile-improvements.css';
import '../styles/tablet-icon-standardization.css';
import '../styles/mobile-scroll-fix.css';
import '../styles/mobile-filter-optimization.css';
import '../styles/project-mobile-icon-optimized.css';
import '../styles/tablet-landscape-issues-sorting.css';
import '../styles/projects-mobile-action-optimization.css';
import '../styles/mobile-edit-form-optimization.css';
// Removed old mobile project icon CSS import - now using inline styles for consistency with issues
// Removed old mobile project icon CSS imports - now using inline styles for consistency with issues
import '../styles/mobile-form-margin-optimization.css';
import '../styles/project-dark-theme-fixes.css';

import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/tablet-landscape-statistics-colors.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-filter-improvements.css';
import '../styles/mobile-icon-standardization.css';
import '../styles/tablet-landscape-fab.css';
import ResponsiveTable from '../components/ResponsiveTable';
import FloatingActionButton from '../components/FloatingActionButton';
import CommentDrawer from '../components/CommentDrawer';
import MobileFilters from '../components/MobileFilters';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useComments } from '../hooks/useComments';
// Removed permission system
import { isProjectManagerRole, isProjectOwnerRole } from '../constants/permissions';
import { findProjectManager, getProjectManagerName } from '../utils/projectUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  progress: number;
  manager: string;
  managerId?: string;
  teamSize: number;
  documents: number;
  tasks: number;
  issues: number;
  code?: string;
  members: ProjectMember[];
  permissions: ProjectPermission[];
  comments?: ProjectComment[];
}

interface ProjectMember {
  id?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER' | 'PROJECT_MANAGER' | 'BIM_MANAGER' | 'CONTRIBUTOR';
  joinedAt?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  // Backend trả về user object
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ProjectPermission {
  id: string;
  userId: string;
  permission: 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';
  resource: 'PROJECT' | 'DOCUMENTS' | 'TASKS' | 'ISSUES' | 'CALENDAR';
  grantedAt: string;
}

interface ProjectComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  user?: { // Added user property for consistency with member
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const ProjectsNew: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState('all');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [memberForm] = Form.useForm();
  const [permissionForm] = Form.useForm();
  const [commentForm] = Form.useForm();
  
  // Use comment hook
  const {
    comments,
    loading: commentLoading,
    fetchComments,
    addComment
  } = useComments({ entityType: 'projects' });
  const [users, setUsers] = useState<any[]>([]);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelType, setRightPanelType] = useState<'members' | 'permissions' | 'comments' | null>(null);
  const [projectInfoModalOpen, setProjectInfoModalOpen] = useState(false);
  const [selectedProjectInfo, setSelectedProjectInfo] = useState<Project | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  const theme = useSelector((state: any) => state.ui.theme);
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const currentUser = useSelector((state: any) => state.auth.user);
  // Removed permission system - always allow all actions
  const canViewUsers = true;
  const canEditUsers = true;
  const canDeleteUsers = true;
  const canManageUserRoles = true;

  // Responsive detection
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width <= 768);
      setIsTabletLandscape(width >= 769 && width <= 1366 && height < width);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    window.addEventListener('orientationchange', checkResponsive);
    return () => {
      window.removeEventListener('resize', checkResponsive);
      window.removeEventListener('orientationchange', checkResponsive);
    };
  }, []);

  // Projects data will be fetched from API

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/projects');
      console.log('Projects API response:', response.data);
      
      // Kiểm tra dữ liệu trả về
      let projectsData = [];
      if (response.data && Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data && response.data.projects && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      } else {
        console.warn('Unexpected projects data format:', response.data);
        projectsData = [];
      }
      
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      message.error('Không thể tải danh sách dự án!');
      setProjects([]); // Don't fallback to mock data
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/all');
      console.log('Users API response:', response.data);
      
      // Kiểm tra dữ liệu trả về
      let usersData = [];
      if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        console.warn('Unexpected users data format:', response.data);
        usersData = [];
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng!');
      setUsers([]); // Ensure users is always an array
    }
  };



  const getStatusCount = (status: string) => {
    if (!Array.isArray(projects)) {
      console.warn('Projects is not an array:', projects);
      return 0;
    }
    if (status === 'all') return projects.length;
    return projects.filter(project => project.status === status).length;
  };

  // Helper functions cho popover content
  const getProjectsByStatus = (status: string) => {
    if (!Array.isArray(projects)) return [];
    if (status === 'all') return projects;
    return projects.filter(project => project.status === status);
  };

  const renderProjectList = (projects: Project[], maxItems: number = 5) => {
    const displayProjects = projects.slice(0, maxItems);
    const hasMore = projects.length > maxItems;

    return (
      <div style={{ maxWidth: 300 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
          Danh sách dự án ({projects.length})
        </div>
        {displayProjects.map(project => (
          <div key={project.id} style={{ 
            padding: '4px 0', 
            borderBottom: '1px solid #f0f0f0',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold' }}>{project.name}</div>
            <div style={{ color: '#666' }}>
              Mã: {project.code || 'N/A'} | 
              Tiến độ: {project.progress || 0}%
            </div>
            <div style={{ color: '#999', fontSize: '11px' }}>
              {moment(project.startDate).format('DD/MM/YYYY')} - {moment(project.endDate).format('DD/MM/YYYY')}
            </div>
          </div>
        ))}
        {hasMore && (
          <div style={{ 
            textAlign: 'center', 
            color: '#1890ff', 
            fontSize: '12px',
            marginTop: 8 
          }}>
            Và {projects.length - maxItems} dự án khác...
          </div>
        )}
      </div>
    );
  };

  const getFilteredProjects = () => {
    if (!Array.isArray(projects)) {
      console.warn('Projects is not an array:', projects);
      return [];
    }
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
      const matchesProject = selectedProjectFilter === 'all' || project.id === selectedProjectFilter;
      const matchesAssignee = selectedAssigneeFilter === 'all' || 
        (project.members && project.members.some(member => 
          (member.userId || member.user?.id) === selectedAssigneeFilter
        ));
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
    });

    // Sắp xếp theo trạng thái và mức độ ưu tiên
    const statusOrder = {
      'ACTIVE': 1,      // Đang thực hiện
      'PLANNING': 2,    // Đang lên kế hoạch
      'ON_HOLD': 3,     // Đang tạm dừng
      'COMPLETED': 4,   // Hoàn thành
      'ARCHIVED': 5     // Lưu trữ
    };

    const priorityOrder = {
      'HIGH': 1,        // Cao
      'MEDIUM': 2,      // Trung bình
      'LOW': 3          // Thấp
    };

    filtered.sort((a, b) => {
      // Sắp xếp theo trạng thái trước
      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 999;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 999;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // Nếu cùng trạng thái, sắp xếp theo mức độ ưu tiên (chỉ áp dụng cho ACTIVE)
      if (a.status === 'ACTIVE' && b.status === 'ACTIVE') {
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 999;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 999;
        return priorityA - priorityB;
      }
      
      // Các trạng thái khác sắp xếp theo tên dự án
      return a.name.localeCompare(b.name);
    });

    return filtered;
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; icon: React.ReactNode } } = {
      'ACTIVE': { label: 'Đang thực hiện', color: 'green', icon: <CheckCircleOutlined style={{ color: isDarkMode ? '#52c41a' : '#52c41a' }} /> },
      'PLANNING': { label: 'Lập kế hoạch', color: 'blue', icon: <ClockCircleOutlined style={{ color: isDarkMode ? '#1890ff' : '#1890ff' }} /> },
      'ON_HOLD': { label: 'Tạm dừng', color: 'orange', icon: <ExclamationCircleOutlined style={{ color: isDarkMode ? '#faad14' : '#faad14' }} /> },
      'COMPLETED': { label: 'Hoàn thành', color: 'purple', icon: <CheckCircleOutlined style={{ color: isDarkMode ? '#722ed1' : '#722ed1' }} /> },
      'ARCHIVED': { label: 'Lưu trữ', color: 'grey', icon: <CloseCircleOutlined style={{ color: isDarkMode ? '#8c8c8c' : '#8c8c8c' }} /> }
    };
    return statusMap[status] || { label: status, color: 'default', icon: null };
  };

  const getPriorityDisplay = (priority: string) => {
    const priorityMap: { [key: string]: { label: string; color: string } } = {
      'HIGH': { label: 'Cao', color: 'red' },
      'MEDIUM': { label: 'Trung bình', color: 'orange' },
      'LOW': { label: 'Thấp', color: 'green' },
      'NONE': { label: 'Không', color: 'default' }
    };
    return priorityMap[priority] || { label: priority, color: 'default' };
  };



  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    // Đảm bảo DatePicker được reset
    form.setFieldsValue({
      startDate: undefined,
      endDate: undefined
    });
    setModalOpen(true);
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    // Tìm người quản lý dự án từ danh sách members
    const manager = findProjectManager(record.members);
    // Chuyển đổi ngày về dayjs object cho DatePicker
    const startDate = record.startDate ? dayjs(record.startDate) : undefined;
    const endDate = record.endDate ? dayjs(record.endDate) : undefined;
    form.setFieldsValue({ 
      ...record, 
      startDate,
      endDate,
      managerId: manager?.userId || manager?.user?.id || undefined 
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      message.success('Đã xóa dự án!');
      
      // Cập nhật dữ liệu trong state ngay lập tức
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      
      // Đóng panel nếu đang mở dự án bị xóa
      if (selectedProject && selectedProject.id === id) {
        setRightPanelOpen(false);
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      message.error('Lỗi khi xóa dự án!');
    }
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setProjectToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      handleDelete(projectToDelete.id);
      setDeleteModalVisible(false);
      setProjectToDelete(null);
    }
  };

  const handleManageMembers = (project: Project) => {
    setSelectedProject(project);
    setRightPanelType('members');
    setRightPanelOpen(true);
  };

  const handleViewDetails = (project: Project) => {
    // Navigate to project detail page
    window.location.href = `/projects/${project.id}`;
  };

  const handleManagePermissions = (project: Project) => {
    setSelectedProject(project);
    setRightPanelType('permissions');
    setRightPanelOpen(true);
  };

  const handleComments = (project: Project) => {
    setSelectedProject(project);
    setRightPanelType('comments');
    setRightPanelOpen(true);
  };

  const handleProjectInfo = (project: Project) => {
    setSelectedProjectInfo(project);
    setProjectInfoModalOpen(true);
  };



  const handleAddComment = async (content: string) => {
    if (!selectedProject) return;
    await addComment(selectedProject.id, content);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedProject) return;
    try {
      await axiosInstance.delete(`/projects/${selectedProject.id}/comments/${commentId}`);
      message.success('Đã xoá bình luận!');
      fetchComments(selectedProject.id);
    } catch (err) {
      message.error('Xoá bình luận thất bại');
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/all');
      console.log('Available users API response:', response.data);
      
      // Kiểm tra dữ liệu trả về
      let usersData = [];
      if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        console.warn('Unexpected available users data format:', response.data);
        usersData = [];
      }
      
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAvailableUsers([]); // Ensure availableUsers is always an array
    }
  };

  const handleAddMember = async (values: any) => {
    if (!selectedProject) return;
    
    try {
              const response = await axiosInstance.post(`/projects/${selectedProject.id}/members`, values);
      message.success('Đã thêm thành viên!');
      
      // Cập nhật dữ liệu trong state ngay lập tức
      if (response.data) {
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === selectedProject.id 
              ? { ...project, members: [...(project.members || []), response.data] }
              : project
          )
        );
        
        // Cập nhật selectedProject
        setSelectedProject(prev => 
          prev ? { ...prev, members: [...(prev.members || []), response.data] } : null
        );
      }
    } catch (error) {
      console.error('Error adding member:', error);
      message.error('Lỗi khi thêm thành viên!');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedProject) return;
    
    try {
              await axiosInstance.delete(`/projects/${selectedProject.id}/members/${memberId}`);
      message.success('Đã xóa thành viên!');
      
      // Cập nhật dữ liệu trong state ngay lập tức
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === selectedProject.id 
            ? { ...project, members: (project.members || []).filter(m => m.id !== memberId) }
            : project
        )
      );
      
      // Cập nhật selectedProject
      setSelectedProject(prev => 
        prev ? { ...prev, members: (prev.members || []).filter(m => m.id !== memberId) } : null
      );
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('Lỗi khi xóa thành viên!');
    }
  };

  const handleUpdatePermission = async (values: any) => {
    if (!selectedProject) return;
    
    try {
              await axiosInstance.put(`/projects/${selectedProject.id}/permissions`, values);
      message.success('Đã cập nhật phân quyền!');
      setRightPanelOpen(false);
      fetchProjects();
    } catch (error) {
      message.error('Lỗi khi cập nhật phân quyền!');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Chuẩn bị dữ liệu gửi lên backend
      const projectData = {
        name: values.name,
        description: values.description,
        status: values.status,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        priority: values.priority,
        // Nếu có managerId, thêm vào memberIds để backend xử lý
        memberIds: values.managerId ? [values.managerId] : []
      };
      
      if (editingProject) {
        await axiosInstance.put(`/projects/${editingProject.id}`, projectData);
        message.success('Đã cập nhật dự án!');
        
        // Cập nhật dữ liệu trong state ngay lập tức
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === editingProject.id 
              ? { ...project, ...projectData }
              : project
          )
        );
        
        // Cập nhật selectedProject nếu đang mở panel
        if (selectedProject && selectedProject.id === editingProject.id) {
          setSelectedProject(prev => prev ? { ...prev, ...projectData } : null);
        }
      } else {
        const response = await axiosInstance.post('/projects', projectData);
        message.success('Đã thêm dự án!');
        
        // Thêm dự án mới vào state
        if (response.data) {
          setProjects(prevProjects => [response.data, ...prevProjects]);
        }
      }
      
      setModalOpen(false);
      form.resetFields();
      // Đảm bảo DatePicker được reset
      form.setFieldsValue({
        startDate: undefined,
        endDate: undefined
      });
      setEditingProject(null);
    } catch (error: any) {
      console.error('Error saving project:', error);
      message.error(error.response?.data?.error || 'Lỗi khi lưu dự án!');
    }
  };

  // Memoized filtered projects for performance
  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) {
      console.warn('Projects is not an array:', projects);
      return [];
    }
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sắp xếp theo trạng thái và mức độ ưu tiên
    const statusOrder = {
      'ACTIVE': 1,      // Đang thực hiện
      'PLANNING': 2,    // Đang lên kế hoạch
      'ON_HOLD': 3,     // Đang tạm dừng
      'COMPLETED': 4,   // Hoàn thành
      'ARCHIVED': 5     // Lưu trữ
    };

    const priorityOrder = {
      'HIGH': 1,        // Cao
      'MEDIUM': 2,      // Trung bình
      'LOW': 3          // Thấp
    };

    filtered.sort((a, b) => {
      // Sắp xếp theo trạng thái trước
      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 999;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 999;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // Nếu cùng trạng thái, sắp xếp theo mức độ ưu tiên (chỉ áp dụng cho ACTIVE)
      if (a.status === 'ACTIVE' && b.status === 'ACTIVE') {
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 999;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 999;
        return priorityA - priorityB;
      }
      
      // Các trạng thái khác sắp xếp theo tên dự án
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [projects, searchText, selectedStatus, selectedPriority]);

  // Use the isTabletLandscape state from above

  // Responsive columns for table
  const getResponsiveColumns = () => {
    
    // For tablet landscape: minimal columns (only project name + actions)
    if (isTabletLandscape) {
      return [
        {
          title: 'DỰ ÁN',
          dataIndex: 'name',
          key: 'name',
          width: 'auto', // Take remaining space
          render: (text: string, record: Project) => (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => handleViewDetails(record)}
            >
              <Avatar size={36} style={{ backgroundColor: '#1890ff', flexShrink: 0 }}>
                <FolderOutlined />
              </Avatar>
              <div style={{ minWidth: 0, flex: 1 }}>
                                {/* Project code row with progress, priority, and status - all in one row */}
                {record.code && (
                  <div style={{
                    fontSize: '10px',
                    color: isDarkMode ? '#999' : '#999',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4
                  }}>
                    <Tag
                      color="blue"
                      style={{ fontSize: '9px', margin: 0, padding: '1px 4px' }}
                      className="project-code-tag"
                    >
                      {record.code}
                    </Tag>
                    <Tag 
                      color="green" 
                      style={{ fontSize: '9px', margin: 0, padding: '1px 4px' }}
                      className="project-progress-tag"
                    >
                      {record.progress || 0}%
                    </Tag>
                    <Tag 
                      color={getPriorityDisplay(record.priority).color} 
                      style={{ fontSize: '9px', margin: 0, padding: '1px 4px' }}
                      className={`project-priority-tag priority-${record.priority?.toLowerCase() || 'none'}`}
                    >
                      {getPriorityDisplay(record.priority).label}
                    </Tag>
                    <Tag 
                      color={getStatusDisplay(record.status).color} 
                      style={{ fontSize: '9px', margin: 0, padding: '1px 4px' }}
                    >
                      {getStatusDisplay(record.status).label}
                    </Tag>
                  </div>
                )}
                <div style={{ 
                  fontWeight: 500, 
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: '13px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 2
                }}>
                  {text}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: isDarkMode ? '#bbb' : '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 2
                }}>
                  {record.description || 'Không có mô tả'}
                </div>
                {/* Second row with dates */}
                <div style={{ 
                  fontSize: '10px', 
                  color: isDarkMode ? '#999' : '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>{moment(record.startDate).format('DD/MM/YY')} - {moment(record.endDate).format('DD/MM/YY')}</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'THAO TÁC',
          key: 'actions',
          width: 50,
          fixed: false,
          render: (record: Project) => (
            <div className="tablet-table-actions">
              {/* Tablet landscape action buttons in 2 rows - no dropdown needed */}
              <div className="tablet-actions-container">
                {/* First row: 3 buttons */}
                <div className="tablet-actions-row">
                  <Tooltip title="Chi tiết" placement="top">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(record)}
                      className="tablet-icon-standard tablet-icon-view"
                    />
                  </Tooltip>

                  <Tooltip title="Chỉnh sửa" placement="top">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}
                      className="tablet-icon-standard tablet-icon-edit"
                    />
                  </Tooltip>

                  <Tooltip title="Thành viên" placement="top">
                    <Button
                      type="text"
                      size="small"
                      icon={<TeamOutlined />}
                      onClick={() => handleManageMembers(record)}
                      className="tablet-icon-standard tablet-icon-team"
                    />
                  </Tooltip>
                </div>

                {/* Second row: 3 buttons */}
                <div className="tablet-actions-row">
                  <Tooltip title="Phân quyền" placement="top">
                    <Button
                      type="text"
                      size="small"
                      icon={<LockOutlined />}
                      onClick={() => handleManagePermissions(record)}
                      className="tablet-icon-standard tablet-icon-permission"
                    />
                  </Tooltip>

                  <Tooltip title="Bình luận" placement="top">
                    <Button
                      type="text"
                      size="small"
                      icon={<MessageOutlined />}
                      onClick={() => handleComments(record)}
                      className="tablet-icon-standard tablet-icon-comment"
                    />
                  </Tooltip>

                  <Tooltip title="Xóa" placement="top">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteClick(record)}
                      className="tablet-icon-standard tablet-icon-delete"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          ),
        },
      ];
    }
    
    // For desktop and mobile: full columns
    const baseColumns = [
      {
        title: 'MÃ DỰ ÁN',
        dataIndex: 'code',
        key: 'code',
        width: 100,
        responsive: ['lg' as const],
        render: (code: string) => (
          <Tag color="blue" style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {code || 'N/A'}
          </Tag>
        ),
      },
      {
        title: 'DỰ ÁN',
        dataIndex: 'name',
        key: 'name',
        width: isMobile ? 200 : 300,
        render: (text: string, record: Project) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={40} style={{ backgroundColor: '#1890ff' }}>
              <FolderOutlined />
            </Avatar>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ 
                fontWeight: 500, 
                color: isDarkMode ? '#fff' : '#000',
                fontSize: isMobile ? '13px' : '14px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {text}
              </div>
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: isDarkMode ? '#bbb' : '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {record.description}
              </div>
              <div style={{ 
                fontSize: isMobile ? '10px' : '12px', 
                color: isDarkMode ? '#999' : '#999' 
              }}>
                {moment(record.startDate).format('DD/MM/YY')} - {moment(record.endDate).format('DD/MM/YY')}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'TRẠNG THÁI',
        dataIndex: 'status',
        key: 'status',
        width: isMobile ? 100 : 120,
        responsive: ['xs' as const],
        render: (status: string) => {
          const statusInfo = getStatusDisplay(status);
          return (
            <Tag 
              color={statusInfo.color} 
              icon={statusInfo.icon} 
              style={{ 
                fontSize: isMobile ? '11px' : '12px',
                padding: '2px 6px'
              }}
            >
              {statusInfo.label}
            </Tag>
          );
        },
      },
      {
        title: 'ƯU TIÊN',
        dataIndex: 'priority',
        key: 'priority',
        width: isMobile ? 80 : 100,
        responsive: ['lg' as const],
        render: (priority: string) => {
          const priorityInfo = getPriorityDisplay(priority);
          return (
            <Tag 
              color={priorityInfo.color} 
              style={{ 
                fontSize: isMobile ? '11px' : '12px',
                padding: '2px 6px'
              }}
            >
              {priorityInfo.label}
            </Tag>
          );
        },
      },
      {
        title: 'PHỤ TRÁCH',
        key: 'manager',
        width: isMobile ? 120 : 150,
        responsive: ['md' as const],
        render: (record: Project) => {
          const managerName = getProjectManagerName(record.members);
          
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar size={24} style={{ backgroundColor: '#1890ff' }}>
                {(managerName || 'U').charAt(0)}
              </Avatar>
              <span style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                color: isDarkMode ? '#fff' : '#000',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? 80 : 100
              }}>
                {managerName}
              </span>
            </div>
          );
        },
      },
      {
        title: 'THAO TÁC',
        key: 'actions',
        width: isMobile ? 80 : 120,
        responsive: [],
        fixed: 'right' as const,
        render: (record: Project) => (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button 
                type="text" 
                size="small" 
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                style={{ 
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ 
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Tooltip>
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="members" icon={<TeamOutlined />} onClick={() => handleManageMembers(record)}>
                  Quản lý thành viên
                </Menu.Item>
                <Menu.Item key="permissions" icon={<SettingOutlined />} onClick={() => handleManagePermissions(record)}>
                  Phân quyền
                </Menu.Item>
                <Menu.Item key="comments" icon={<MessageOutlined />} onClick={() => handleComments(record)}>
                  Bình luận
                </Menu.Item>
                <Menu.Divider />
                                  <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(record)}>
                    Xóa
                  </Menu.Item>
              </Menu>
            }>
              <Button 
                type="text" 
                size="small" 
                icon={<MoreOutlined />}
                style={{ 
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Dropdown>
          </Space>
        ),
      },
      {
        title: 'TIẾN ĐỘ',
          dataIndex: 'progress',
          key: 'progress',
          width: isMobile ? 80 : 120,
          responsive: ['lg' as const],
          render: (progress: number) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Progress 
                percent={progress || 0} 
                size="small" 
                strokeColor={isDarkMode ? '#1890ff' : '#1890ff'}
                trailColor={isDarkMode ? '#333' : '#f0f0f0'}
                style={{ flex: 1, minWidth: 60 }}
              />
              <span style={{ 
                fontSize: '12px', 
                color: isDarkMode ? '#bbb' : '#666',
                minWidth: 30,
                textAlign: 'right'
              }}>
                {progress || 0}%
              </span>
            </div>
          ),
        },
        {
          title: 'THAO TÁC',
          key: 'actions',
          width: isMobile ? 80 : 100,
          responsive: ['md' as const],
          render: (record: Project) => (
            <Space size="small">
              <Tooltip title="Xem chi tiết">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  style={{ 
                    color: isDarkMode ? '#fff' : undefined
                  }}
                />
              </Tooltip>
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  style={{ 
                    color: isDarkMode ? '#fff' : undefined
                  }}
                />
              </Tooltip>
              <Dropdown overlay={
                <Menu>
                  <Menu.Item key="members" icon={<TeamOutlined />} onClick={() => handleManageMembers(record)}>
                    Quản lý thành viên
                  </Menu.Item>
                  <Menu.Item key="permissions" icon={<SettingOutlined />} onClick={() => handleManagePermissions(record)}>
                    Phân quyền
                  </Menu.Item>
                  <Menu.Item key="comments" icon={<MessageOutlined />} onClick={() => handleComments(record)}>
                    Bình luận
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(record)}>
                    Xóa
                  </Menu.Item>
                </Menu>
              }>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<MoreOutlined />}
                  style={{ 
                    color: isDarkMode ? '#fff' : undefined
                  }}
                />
              </Dropdown>
            </Space>
          ),
        }
      ];

    return baseColumns;
  };

  // Mobile Project Card Component
  const MobileProjectCard = ({ project }: { project: Project }) => {
    const statusInfo = getStatusDisplay(project.status);
    const priorityInfo = getPriorityDisplay(project.priority);
    const managerName = getProjectManagerName(project.members);

    const actionMenu = (
      <Menu>
        <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleViewDetails(project)}>
          Xem chi tiết
        </Menu.Item>
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(project)}>
          Chỉnh sửa
        </Menu.Item>
        <Menu.Item key="members" icon={<TeamOutlined />} onClick={() => handleManageMembers(project)}>
          Quản lý thành viên
        </Menu.Item>
        <Menu.Item key="permissions" icon={<SettingOutlined />} onClick={() => handleManagePermissions(project)}>
          Phân quyền
        </Menu.Item>
        <Menu.Item key="comments" icon={<MessageOutlined />} onClick={() => handleComments(project)}>
          Bình luận
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(project)}>
          Xóa
        </Menu.Item>
      </Menu>
    );

    return (
      <Card 
        className={isTabletLandscape ? "tablet-landscape-project-card" : "mobile-project-card"}
        style={{ 
          marginBottom: 8,
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderColor: isDarkMode ? '#303030' : '#f0f0f0',
          borderRadius: isTabletLandscape ? 8 : 12,
          boxShadow: isDarkMode ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)'
        }}
        bodyStyle={{ padding: isTabletLandscape ? 16 : 12 }}
      >
        {/* Project Header with Tags */}
        <div className="project-header">
          <div className="project-tags">
            <Tag color="blue" style={{ fontSize: isTabletLandscape ? '10px' : '9px', fontWeight: 'bold' }}>
              {project.code || 'N/A'}
            </Tag>
            <Tag color={statusInfo.color} icon={statusInfo.icon} style={{ fontSize: isTabletLandscape ? '10px' : '9px' }}>
              {statusInfo.label}
            </Tag>
            <Tag color={priorityInfo.color} style={{ fontSize: isTabletLandscape ? '10px' : '9px' }}>
              {priorityInfo.label}
            </Tag>
          </div>
          <Dropdown overlay={actionMenu} trigger={['click']}>
            <Button 
              type="text" 
              size="small" 
              icon={<MoreOutlined />} 
              className="mobile-project-header-dropdown"
              style={{
                color: isDarkMode ? '#bbb' : '#666',
                border: 'none',
                background: 'transparent'
              }}
            />
          </Dropdown>
        </div>
        
        {/* Project Title */}
        <div className="project-title">
          {project.name}
        </div>
        
        {/* Project Description */}
        <div className="project-description">
          {project.description}
        </div>
        
        {/* Project Manager */}
        <div className="project-manager">
          <Avatar size={isTabletLandscape ? 24 : 20} style={{ backgroundColor: '#1890ff' }}>
            {(managerName || 'U').charAt(0)}
          </Avatar>
          <Text style={{ fontSize: isTabletLandscape ? 12 : 10, color: isDarkMode ? '#bbb' : '#666' }}>
            {managerName}
          </Text>
        </div>
        
        {/* Project Meta - Dates and Priority */}
        <div className="project-meta">
          <div className="project-dates">
            <CalendarOutlined style={{ marginRight: 2, color: isDarkMode ? '#bbb' : '#666' }} />
            {moment(project.startDate).format('DD/MM/YYYY')} - {moment(project.endDate).format('DD/MM/YYYY')}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="project-progress">
          <Progress 
            percent={project.progress || 0} 
            size="small" 
            strokeColor={isDarkMode ? '#1890ff' : '#1890ff'}
            trailColor={isDarkMode ? '#333' : '#f0f0f0'}
          />
        </div>
        
        {/* Project Actions - Optimized for mobile and tablet landscape */}
        <div className="project-actions" style={{ marginTop: isTabletLandscape ? 16 : 12 }}>
          <div className="action-buttons" style={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            alignItems: 'center',
            gap: isMobile ? '6px' : '8px',
            flexWrap: 'wrap'
          }}>
            <Button 
              size="middle" 
              icon={<EyeOutlined style={{ color: isDarkMode ? '#40a9ff' : '#1890ff' }} />}
              type="text"
              onClick={() => handleViewDetails(project)}
              className="mobile-icon-standard"
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#40a9ff' : '#1890ff'}`,
                backgroundColor: isDarkMode ? 'rgba(64, 169, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)'
              }}
            />
            <Button 
              size="middle"
              icon={<EditOutlined style={{ color: isDarkMode ? '#52c41a' : '#389e0d' }} />}
              type="text"
              onClick={() => handleEdit(project)}
              className="mobile-icon-standard"
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#52c41a' : '#389e0d'}`,
                backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(56, 158, 13, 0.05)'
              }}
            />
            <Button 
              size="middle" 
              icon={<MessageOutlined style={{ color: isDarkMode ? '#faad14' : '#fa8c16' }} />} 
              type="text"
              onClick={() => handleComments(project)}
              className="mobile-icon-standard"
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#faad14' : '#fa8c16'}`,
                backgroundColor: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 140, 22, 0.05)'
              }}
            />
            <Button 
              size="middle" 
              icon={<DeleteOutlined style={{ color: isDarkMode ? '#ff7875' : '#ff4d4f' }} />} 
              type="text"
              className="mobile-icon-standard"
              onClick={() => handleDeleteClick(project)}
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#ff7875' : '#ff4d4f'}`,
                borderRadius: '6px',
                backgroundColor: isDarkMode ? 'rgba(255, 120, 117, 0.1)' : 'rgba(255, 77, 79, 0.05)'
              }}
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="projects-container" style={{ 
      padding: isMobile ? 16 : 24,
      background: isDarkMode ? '#141414' : '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        flexDirection: isMobile ? 'row' : 'row',
        gap: isMobile ? 16 : 0
      }}>
        <div>
          <Title level={isMobile ? 3 : 2} style={{ 
            margin: 0,
            color: isDarkMode ? '#fff' : '#000'
          }}>
            Quản Lý Dự Án
          </Title>
          <Text type="secondary" style={{ color: isDarkMode ? '#bbb' : undefined }}>
            Quản lý và theo dõi các dự án xây dựng
          </Text>
        </div>
        <Space direction="horizontal" style={{ width: 'auto' }}>
          <Button 
            icon={<DownloadOutlined />}
            style={{ 
              width: isMobile ? 36 : 'auto',
              height: isMobile ? 36 : 'auto',
              borderRadius: isMobile ? '50%' : '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? 0 : undefined
            }}
            title="Xuất Báo Cáo"
            className={isMobile ? 'mobile-action-btn' : (isTabletLandscape ? 'tablet-action-btn' : '')}
          >
            {!isMobile && !isTabletLandscape && 'Xuất Báo Cáo'}
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            style={{ 
              width: isMobile ? 36 : 'auto',
              height: isMobile ? 36 : 'auto',
              borderRadius: isMobile ? '50%' : '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? 0 : undefined
            }}
            title="Thêm Dự Án"
            className={isMobile ? 'mobile-action-btn' : (isTabletLandscape ? 'tablet-action-btn' : '')}
          >
            {!isMobile && !isTabletLandscape && 'Thêm Dự Án'}
          </Button>
        </Space>
      </div>

      {/* Summary Cards - Responsive Grid */}
      <div className="projects-summary-grid" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : (isTabletLandscape ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)'),
        gap: isMobile ? 8 : (isTabletLandscape ? 12 : 16),
        marginBottom: isMobile ? 16 : (isTabletLandscape ? 20 : 24),
        width: '100%'
      }}>
        <div className="dashboard-stats-row" style={{ width: '100%' }}>
          <Row gutter={isMobile ? 8 : (isTabletLandscape ? 12 : 16)} style={{ width: '100%' }}>
          <Col xs={12} sm={6} md={6} lg={6} style={{ width: '100%' }}>
            <Popover 
              content={renderProjectList(projects, 10)}
              title="Tất cả dự án"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedStatus('all')}
              >
                <ResponsiveStatCard
                  title="Tổng Dự Án"
                  value={projects.length}
                  icon={<FolderOutlined />}
                  function="projects"
                />
              </div>
            </Popover>
          </Col>
          
          <Col xs={12} sm={6} md={6} lg={6}>
            <Popover 
              content={renderProjectList(getProjectsByStatus('ACTIVE'), 5)}
              title="Dự án đang thực hiện"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedStatus('ACTIVE')}
              >
                <ResponsiveStatCard
                  title="Đang Thực Hiện"
                  value={getStatusCount('ACTIVE')}
                  icon={<CheckCircleOutlined />}
                  function="projects"
                />
              </div>
            </Popover>
          </Col>
          
          <Col xs={12} sm={6} md={6} lg={6}>
            <Popover 
              content={renderProjectList(getProjectsByStatus('PLANNING'), 5)}
              title="Dự án lập kế hoạch"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedStatus('PLANNING')}
              >
                <ResponsiveStatCard
                  title="Lập Kế Hoạch"
                  value={getStatusCount('PLANNING')}
                  icon={<ClockCircleOutlined />}
                  function="projects"
                />
              </div>
            </Popover>
          </Col>
          
          <Col xs={12} sm={6} md={6} lg={6}>
            <Popover 
              content={renderProjectList(getProjectsByStatus('COMPLETED'), 5)}
              title="Dự án hoàn thành"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedStatus('COMPLETED')}
              >
                <ResponsiveStatCard
                  title="Hoàn Thành"
                  value={getStatusCount('COMPLETED')}
                  icon={<CheckCircleOutlined />}
                  function="projects"
                />
              </div>
            </Popover>
          </Col>
          </Row>
        </div>
      </div>

      {/* Filter and Search - Responsive with Collapsible */}
      {isMobile ? (
        <MobileFilters
          searchValue={searchText}
          statusValue={selectedStatus}
          priorityValue={selectedPriority}
          assigneeValue={selectedAssigneeFilter}
          projectValue={selectedProjectFilter}
          statusOptions={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: 'Đang thực hiện' },
            { value: 'PLANNING', label: 'Lập kế hoạch' },
            { value: 'ON_HOLD', label: 'Tạm dừng' },
            { value: 'COMPLETED', label: 'Hoàn thành' },
            { value: 'ARCHIVED', label: 'Lưu trữ' }
          ]}
          priorityOptions={[
            { value: 'all', label: 'Tất cả ưu tiên' },
            { value: 'HIGH', label: 'Cao' },
            { value: 'MEDIUM', label: 'Trung bình' },
            { value: 'LOW', label: 'Thấp' }
          ]}
          assigneeOptions={[
            { value: 'all', label: 'Tất cả người dùng' },
            ...users.map(user => ({ value: user.id, label: user.name }))
          ]}
          projectOptions={[
            { value: 'all', label: 'Tất cả dự án' },
            ...projects.map(project => ({ value: project.id, label: project.name }))
          ]}
          onSearchChange={setSearchText}
          onStatusChange={setSelectedStatus}
          onPriorityChange={setSelectedPriority}
          onAssigneeChange={setSelectedAssigneeFilter}
          onProjectChange={setSelectedProjectFilter}
          onReset={() => {
            setSearchText('');
            setSelectedStatus('all');
            setSelectedPriority('all');
            setSelectedProjectFilter('all');
            setSelectedAssigneeFilter('all');
          }}
          title={`Bộ lọc dự án (${filteredProjects.length})`}
          isDarkMode={isDarkMode}
          pageType="projects"
        />
      ) : (
        <ResponsiveCollapsibleFilters
          searchValue={searchText}
          searchPlaceholder="Tìm kiếm dự án..."
          onSearchChange={setSearchText}
          statusValue={selectedStatus}
          statusOptions={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: 'Đang thực hiện' },
            { value: 'PLANNING', label: 'Lập kế hoạch' },
            { value: 'ON_HOLD', label: 'Tạm dừng' },
            { value: 'COMPLETED', label: 'Hoàn thành' },
            { value: 'ARCHIVED', label: 'Lưu trữ' }
          ]}
          onStatusChange={setSelectedStatus}
          priorityValue={selectedPriority}
          priorityOptions={[
            { value: 'all', label: 'Tất cả ưu tiên' },
            { value: 'HIGH', label: 'Cao' },
            { value: 'MEDIUM', label: 'Trung bình' },
            { value: 'LOW', label: 'Thấp' }
          ]}
          onPriorityChange={setSelectedPriority}
          projectValue={selectedProjectFilter}
          projectOptions={[
            { value: 'all', label: 'Tất cả dự án' },
            ...projects.map(project => ({ value: project.id, label: project.name }))
          ]}
          onProjectChange={setSelectedProjectFilter}
          assigneeValue={selectedAssigneeFilter}
          assigneeOptions={[
            { value: 'all', label: 'Tất cả người dùng' },
            ...users.map(user => ({ value: user.id, label: user.name }))
          ]}
          onAssigneeChange={setSelectedAssigneeFilter}
          onReset={() => {
            setSearchText('');
            setSelectedStatus('all');
            setSelectedPriority('all');
            setSelectedProjectFilter('all');
            setSelectedAssigneeFilter('all');
          }}
          title={`Bộ lọc dự án (${filteredProjects.length})`}
          isMobile={isMobile}
          isTabletLandscape={isTabletLandscape}
          isDarkMode={isDarkMode}
          additionalFilters={
            isTabletLandscape ? (
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div className="tablet-filter-item">
                    <div className="tablet-filter-label">Dự án</div>
                    <Select
                      placeholder="Tất cả dự án"
                      value=""
                      onChange={() => {}}
                      allowClear
                      style={{ width: '100%' }}
                      size="middle"
                      className="tablet-landscape-filter-project-select"
                    >
                      <Option value="">Tất cả</Option>
                      {projects.map(project => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="tablet-filter-item">
                    <div className="tablet-filter-label">Người phụ trách</div>
                    <Select
                      placeholder="Tất cả người phụ trách"
                      value={selectedAssigneeFilter}
                      onChange={() => {}}
                      allowClear
                      style={{ width: '100%' }}
                      size="middle"
                      className="tablet-landscape-filter-assignee-select"
                    >
                      <Option value="">Tất cả</Option>
                      {users.map(user => (
                        <Option key={user.id} value={user.id}>
                          {user.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            ) : null
          }
        />
      )}

      {/* Projects Display - Mobile Cards vs Desktop Table */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: isDarkMode ? '#fff' : undefined }}>
              Danh sách dự án ({filteredProjects.length})
            </span>
            {isMobile && (
              <Tag icon={<MobileOutlined />} color="blue">Mobile View</Tag>
            )}
          </div>
        }
        style={{
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderColor: isDarkMode ? '#303030' : '#f0f0f0'
        }}
      >
        {isMobile ? (
          <div className="mobile-projects-container" style={{
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            padding: '8px 0'
          }}>
            {filteredProjects.map(project => (
              <MobileProjectCard key={project.id} project={project} />
            ))}
            {filteredProjects.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: isDarkMode ? '#bbb' : '#8c8c8c' 
              }}>
                <FolderOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Không tìm thấy dự án nào</div>
              </div>
            )}
          </div>
        ) : (
          <div className="projects-table-container">
            <ResponsiveTable
              columns={getResponsiveColumns()}
              dataSource={filteredProjects}
              rowKey="id"
              loading={loading}
              pagination={{
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} dự án`,
              }}
              onRow={(record) => ({
                tabIndex: 0,
                onKeyPress: (e) => {
                  if (e.key === 'Enter') handleViewDetails(record);
                }
              })}
              scroll={{ x: 'max-content' }}
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Project Modal - Responsive cho 3 thiết bị */}
      <Modal
        title={editingProject ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          // Đảm bảo DatePicker được reset
          form.setFieldsValue({
            startDate: undefined,
            endDate: undefined
          });
        }}
        width={
          isMobile ? '100%' : 
          isTabletLandscape ? '85%' : 
          600
        }
        style={{ maxWidth: '100vw' }}
        bodyStyle={{ 
          maxHeight: isMobile ? 'calc(100vh - 120px)' : '70vh', 
          overflowY: 'auto',
          padding: isMobile ? '12px 16px' : isTabletLandscape ? '20px 24px' : undefined
        }}
        className={
          isMobile ? "ant-modal-mobile" : 
          isTabletLandscape ? "tablet-landscape-edit-modal" : 
          ""
        }
      >
        <Form
          form={form}
          layout="vertical"
          className={
            isMobile ? "mobile-edit-form project-form" : 
            isTabletLandscape ? "tablet-landscape-edit-form project-form" : 
            ""
          }
        >
          <Row gutter={isMobile ? [4, 4] : [16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên dự án"
                rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
              >
                <Input 
                  placeholder="Nhập tên dự án"
                  style={{
                    height: isMobile ? 36 : 32,
                    fontSize: isMobile ? 14 : 14,
                    borderRadius: isMobile ? 6 : 6,
                    padding: isMobile ? '6px 8px' : undefined
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select 
                  placeholder="Chọn trạng thái"
                  style={{
                    height: isMobile ? 36 : 32,
                    fontSize: isMobile ? 14 : 14
                  }}
                >
                  <Option value="ACTIVE">Đang thực hiện</Option>
                  <Option value="PLANNING">Lập kế hoạch</Option>
                  <Option value="ON_HOLD">Tạm dừng</Option>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="ARCHIVED">Lưu trữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea 
              rows={isMobile ? 3 : 3} 
              placeholder="Nhập mô tả dự án"
              style={{
                fontSize: isMobile ? 14 : 14,
                borderRadius: isMobile ? 6 : 6,
                minHeight: isMobile ? 60 : 80,
                padding: isMobile ? '8px' : undefined
              }}
            />
          </Form.Item>
          
          <Row gutter={isMobile ? [4, 4] : [16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày bắt đầu"
                  popupStyle={{ zIndex: 1060 }}
                  getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                  size={isMobile ? 'large' : 'middle'}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày kết thúc"
                  popupStyle={{ zIndex: 1060 }}
                  getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                  size={isMobile ? 'large' : 'middle'}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={isMobile ? [4, 4] : [16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
              >
                <Select 
                  placeholder="Chọn mức độ ưu tiên"
                  style={{
                    height: isMobile ? 36 : 32,
                    fontSize: isMobile ? 14 : 14
                  }}
                >
                  <Option value="HIGH">Cao</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="LOW">Thấp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="managerId"
                label="Người phụ trách"
                rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
              >
                <Select
                  placeholder="Chọn người phụ trách"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{
                    height: isMobile ? 36 : 32,
                    fontSize: isMobile ? 14 : 14
                  }}
                >
                  {(users || []).map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Right Panel Drawer - Responsive */}
      <Drawer
        title={
          rightPanelType === 'members' ? `Thành viên - ${selectedProject?.name}` :
          rightPanelType === 'permissions' ? `Phân quyền - ${selectedProject?.name}` :
          'Chi tiết dự án'
        }
        placement={isMobile ? 'bottom' : 'right'}
        width={isMobile ? '100%' : 320}
        height={isMobile ? '80vh' : undefined}
        onClose={() => setRightPanelOpen(false)}
        open={rightPanelOpen && rightPanelType !== 'comments'}
        bodyStyle={{ paddingBottom: 80 }}
        mask={false}
        maskClosable={false}
        closable={true}
        style={{ zIndex: 1000 }}
      >
        {rightPanelType === 'members' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  memberForm.resetFields();
                  fetchAvailableUsers();
                }}
              >
                Thêm thành viên
              </Button>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {(selectedProject?.members || []).map((member) => (
                <Card 
                  key={member.id} 
                  size="small" 
                  style={{ marginBottom: 8 }}
                  bodyStyle={{ padding: 12 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Avatar size={32}>
                      {(member.user?.name || member.userName || 'U').charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{member.user?.name || member.userName || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{member.user?.email || member.userEmail || 'No email'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={
                      member.role === 'OWNER' ? 'red' : 
                      member.role === 'MANAGER' ? 'orange' : 
                      member.role === 'MEMBER' ? 'blue' : 'green'
                    }>
                      {member.role}
                    </Tag>
                    <Button 
                      size="small" 
                      danger
                      onClick={() => handleRemoveMember(member.id || '')}
                    >
                      Xóa
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {rightPanelType === 'permissions' && (
          <div style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
            {(selectedProject?.permissions || []).map((permission) => {
              const member = (selectedProject?.members || []).find(m => m.userId === permission.userId);
              return (
                <Card 
                  key={permission.id} 
                  size="small" 
                  style={{ marginBottom: 8 }}
                  bodyStyle={{ padding: 12 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Avatar size={24}>
                      {(member?.user?.name || member?.userName || 'U').charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{member?.user?.name || member?.userName || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{member?.user?.email || member?.userEmail || 'No email'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <Tag color={
                      permission.permission === 'ADMIN' ? 'red' : 
                      permission.permission === 'WRITE' ? 'orange' : 
                      permission.permission === 'READ' ? 'blue' : 'purple'
                    }>
                      {permission.permission}
                    </Tag>
                    <Tag color="blue">
                      {permission.resource === 'PROJECT' ? 'Dự án' :
                       permission.resource === 'DOCUMENTS' ? 'Tài liệu' :
                       permission.resource === 'TASKS' ? 'Nhiệm vụ' :
                       permission.resource === 'ISSUES' ? 'Vấn đề' : 'Lịch'}
                    </Tag>
                    <Button 
                      size="small"
                      onClick={() => {
                        permissionForm.setFieldsValue(permission);
                      }}
                    >
                      Sửa
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {rightPanelType === 'comments' && (
          <>
            <div style={{ 
              maxHeight: 'calc(100vh - 250px)', 
              overflowY: 'auto', 
              marginBottom: 16,
              padding: '0 8px',
              background: isDarkMode ? '#18191a' : '#fff',
              border: isDarkMode ? '1.5px solid #333' : '1.5px solid #e6f7ff',
              borderRadius: 8
            }}>
              {comments.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40, 
                  color: isDarkMode ? '#bbb' : '#8c8c8c',
                  background: isDarkMode ? '#232324' : 'rgba(255,255,255,0.7)',
                  borderRadius: 8,
                  border: isDarkMode ? '1px dashed #444' : '1px dashed #b7e0fa'
                }}>
                  <CommentOutlined style={{ fontSize: 24, marginBottom: 8, color: isDarkMode ? '#70c1ff' : '#91caff' }} />
                  <div>Chưa có bình luận nào</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Hãy là người đầu tiên bình luận!</div>
                </div>
              ) : (
                <div>
                  {(comments || []).map((comment, index) => (
                    <Card 
                      key={comment.id} 
                      size="small" 
                      style={{ 
                        marginBottom: 12,
                        borderRadius: 8,
                        boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.16)' : '0 1px 3px rgba(0,0,0,0.06)',
                        border: isDarkMode ? '1px solid #333' : '1px solid #e6f7ff',
                        background: isDarkMode ? '#232324' : 'rgba(255,255,255,0.95)'
                      }}
                      bodyStyle={{ padding: 16 }}
                      extra={canDeleteUsers && (
                        <Popconfirm
                          title="Xoá bình luận này?"
                          onConfirm={() => handleDeleteComment(comment.id)}
                          okText="Xoá"
                          cancelText="Huỷ"
                        >
                          <Button type="link" danger size="small">Xoá</Button>
                        </Popconfirm>
                      )}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        <Avatar 
                          size={32}
                          style={{ 
                            background: isDarkMode ? 'linear-gradient(135deg, #1890ff 0%, #70c1ff 100%)' : 'linear-gradient(135deg, #1890ff 0%, #70c1ff 100%)',
                            color: '#fff', fontWeight: 'bold',
                            boxShadow: '0 2px 8px #bae7ff'
                          }}
                        >
                          {(comment.user?.name || comment.authorName || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: 600, 
                            fontSize: 14, 
                            color: isDarkMode ? '#fff' : '#262626',
                            marginBottom: 4
                          }}>
                            {comment.user?.name || comment.authorName || 'Unknown'}
                          </div>
                          <div style={{ 
                            fontSize: 12, 
                            color: isDarkMode ? '#bbb' : '#8c8c8c',
                            marginBottom: 8
                          }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {moment(comment.createdAt).format('DD/MM/YYYY HH:mm')}
                          </div>
                          <div style={{ 
                            fontSize: 13, 
                            lineHeight: 1.6,
                            color: isDarkMode ? '#fff' : '#595959',
                            background: isDarkMode ? '#232324' : '#f4faff',
                            padding: 12,
                            borderRadius: 6,
                            border: isDarkMode ? '1px solid #333' : '1px solid #e6f7ff'
                          }}>
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              padding: '16px 24px', 
              background: isDarkMode ? '#18191a' : '#fff',
              borderTop: isDarkMode ? '1.5px solid #333' : '1.5px solid #b7e0fa',
              boxShadow: isDarkMode ? '0 -2px 8px rgba(24,144,255,0.16)' : '0 -2px 8px rgba(24,144,255,0.06)'
            }}>
              <Form form={commentForm} onFinish={handleAddComment}>
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung bình luận!' }]}
                >
                  <Input.TextArea 
                    placeholder="Nhập bình luận của bạn..." 
                    rows={3}
                    showCount
                    style={{
                      borderRadius: 8,
                      border: isDarkMode ? '1.5px solid #333' : '1.5px solid #b7e0fa',
                      resize: 'none',
                      background: isDarkMode ? '#232324' : '#f4faff',
                      color: isDarkMode ? '#fff' : '#222'
                    }}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="middle" 
                    block
                    style={{
                      borderRadius: 8,
                      height: 40,
                      background: isDarkMode ? 'linear-gradient(90deg, #1890ff 0%, #70c1ff 100%)' : 'linear-gradient(90deg, #1890ff 0%, #70c1ff 100%)',
                      border: 'none',
                      fontWeight: 600,
                      boxShadow: isDarkMode ? '0 2px 8px #222' : '0 2px 8px #bae7ff',
                      color: '#fff',
                      letterSpacing: 1
                    }}
                    icon={<SendOutlined style={{ fontSize: '16px', color: 'inherit' }} />}
                  >
                    Gửi bình luận
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </>
        )}
      </Drawer>

      {/* Comment Drawer */}
      <CommentDrawer
        open={rightPanelOpen && rightPanelType === 'comments'}
        onClose={() => setRightPanelOpen(false)}
        title={`Bình luận - ${selectedProject?.name || ''}`}
        entityType="projects"
        entityId={selectedProject?.id || null}
        comments={comments}
        loading={commentLoading}
        onAddComment={handleAddComment}
        onFetchComments={fetchComments}
      />

      {/* Project Info Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={40} style={{ backgroundColor: '#1890ff' }}>
              <FolderOutlined />
            </Avatar>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: isDarkMode ? '#fff' : '#000' }}>
                {selectedProjectInfo?.name}
              </div>
              <div style={{ fontSize: 12, color: isDarkMode ? '#bbb' : '#666' }}>
                Mã dự án: {selectedProjectInfo?.code || 'N/A'}
              </div>
            </div>
          </div>
        }
        open={projectInfoModalOpen}
        onCancel={() => setProjectInfoModalOpen(false)}
        width={isMobile ? '100%' : 800}
        style={{ maxWidth: '100vw' }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        footer={[
          <Button key="close" onClick={() => setProjectInfoModalOpen(false)}>
            Đóng
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            if (selectedProjectInfo) {
              handleEdit(selectedProjectInfo);
              setProjectInfoModalOpen(false);
            }
          }}>
            Chỉnh sửa
          </Button>
        ]}
      >
        {selectedProjectInfo && (
          <div style={{ padding: '16px 0' }}>
            {/* Project Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} md={12}>
                <Card size="small" title="Thông tin cơ bản">
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Mô tả:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {selectedProjectInfo.description}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Trạng thái:</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag 
                        color={getStatusDisplay(selectedProjectInfo.status).color} 
                        icon={getStatusDisplay(selectedProjectInfo.status).icon}
                      >
                        {getStatusDisplay(selectedProjectInfo.status).label}
                      </Tag>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Mức độ ưu tiên:</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={getPriorityDisplay(selectedProjectInfo.priority).color}>
                        {getPriorityDisplay(selectedProjectInfo.priority).label}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Tiến độ & Thời gian">
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Tiến độ:</Text>
                    <Progress 
                      percent={selectedProjectInfo.progress || 0} 
                      size="small" 
                      style={{ marginTop: 4 }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Ngày bắt đầu:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {moment(selectedProjectInfo.startDate).format('DD/MM/YYYY')}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Ngày kết thúc:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {moment(selectedProjectInfo.endDate).format('DD/MM/YYYY')}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Thời gian còn lại:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {moment(selectedProjectInfo.endDate).diff(moment(), 'days')} ngày
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Team & Resources */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} md={12}>
                <Card size="small" title="Đội ngũ">
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Người phụ trách:</Text>
                    <div style={{ marginTop: 4 }}>
                      {(() => {
                        const managerName = getProjectManagerName(selectedProjectInfo.members);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar size={24} style={{ backgroundColor: '#1890ff' }}>
                              {managerName.charAt(0)}
                            </Avatar>
                            <span>{managerName}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Số lượng thành viên:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {selectedProjectInfo.members?.length || 0} thành viên
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Tài nguyên">
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Tài liệu:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {selectedProjectInfo.documents || 0} tài liệu
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Nhiệm vụ:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {selectedProjectInfo.tasks || 0} nhiệm vụ
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Vấn đề:</Text>
                    <div style={{ marginTop: 4, color: isDarkMode ? '#bbb' : '#666' }}>
                      {selectedProjectInfo.issues || 0} vấn đề
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Team Members */}
            {selectedProjectInfo.members && selectedProjectInfo.members.length > 0 && (
              <Card size="small" title="Danh sách thành viên" style={{ marginBottom: 16 }}>
                <Row gutter={[8, 8]}>
                  {selectedProjectInfo.members.map((member, index) => (
                    <Col xs={12} sm={8} md={6} key={member.id || index}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        padding: 8,
                        borderRadius: 6,
                        background: isDarkMode ? '#262626' : '#f5f5f5'
                      }}>
                        <Avatar size={24} style={{ backgroundColor: '#1890ff' }}>
                          {(member.user?.name || member.userName || 'U').charAt(0)}
                        </Avatar>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ 
                            fontSize: 12, 
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {member.user?.name || member.userName || 'Unknown'}
                          </div>
                          <Tag 
                            color={
                              member.role === 'OWNER' ? 'red' : 
                              member.role === 'MANAGER' ? 'orange' : 
                              member.role === 'MEMBER' ? 'blue' : 'green'
                            }
                            style={{ fontSize: '10px', padding: '1px 4px' }}
                          >
                            {member.role}
                          </Tag>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa dự án"
        content="Bạn có chắc chắn muốn xóa dự án"
        itemName={projectToDelete?.name}
        size={isMobile ? "small" : "medium"}
      />

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton
        onClick={handleAdd}
        tooltip="Thêm dự án mới"
        color={`linear-gradient(135deg, #52c41a 0%, #389e0d 100%)`}
      />
    </div>
  );
};

export default ProjectsNew; 