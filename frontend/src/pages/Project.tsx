import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  message, 
  Card, 
  List, 
  Upload, 
  Space, 
  Popconfirm, 
  Drawer, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Radio, 
  Tabs, 
  Badge, 
  Avatar, 
  Tooltip, 
  Mentions,
  Statistic,
  Divider
} from 'antd';
import ProjectCard from '../components/ProjectCard';
import UnifiedCommentSection from '../components/UnifiedCommentSection';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import FloatingActionButton from '../components/FloatingActionButton';
import axiosInstance from '../axiosConfig';
import moment from 'moment';
import { 
  PlusOutlined, 
  UploadOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  FileOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined, 
  MessageOutlined, 
  UserOutlined,
  FolderOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  InboxOutlined,
  HistoryOutlined,
  ShareAltOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
// Removed permission system
import { showPermissionDeniedMessage } from '../utils/permissionUtils';
import io from 'socket.io-client';
// @ts-ignore
import { debounce } from 'lodash';
import '../styles/project-dark-theme-fixes.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/modal-button-fix.css';

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Định nghĩa các mức độ ưu tiên
const priorityLevels = [
  { value: 'HIGH', label: 'Cao', color: 'red' },
  { value: 'MEDIUM', label: 'Trung bình', color: 'orange' },
  { value: 'LOW', label: 'Thấp', color: 'green' },
  { value: 'NONE', label: 'Không', color: 'default' }
];

const Project: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [noteForm] = Form.useForm();
  const [imgLoading, setImgLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<[moment.Moment | null, moment.Moment | null]>([null, null]);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const isDarkMode = useSelector((state: any) => state.ui.theme === 'dark' || (state.ui.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const { token } = useSelector((state: any) => state.auth);

  // Removed permission system - always allow all actions
  const canViewProjects = true;
  const canCreateProjects = true;
  const canEditProjects = true;
  const canDeleteProjects = true;
  const canViewProjectDetails = true;
  const canExportProjectData = true;
  const canManageProjectMembers = true;
  const canImportProjectData = true;
  const canArchiveProjects = true;
  const canRestoreProjects = true;
  const canAssignProjectRoles = true;
  const canViewProjectHistory = true;
  const canViewProjectStatistics = true;
  const permissionsLoading = false;
  const canViewTasks = true;
  const canCreateTasks = true;
  const canEditTasks = true;
  const canDeleteTasks = true;
  const canViewIssues = true;
  const canCreateIssues = true;
  const canEditIssues = true;
  const canDeleteIssues = true;
  const canViewDocuments = true;
  const canCreateDocuments = true;
  const canEditDocuments = true;
  const canDeleteDocuments = true;
  const canViewUsers = true;
  const canEditUsers = true;
  const canDeleteUsers = true;
  const canViewNotes = true;
  const canCreateNotes = true;
  const canEditNotes = true;
  const canDeleteNotes = true;
  
  // Mock data for demonstration
  const mockProjects = [
    {
      id: '1',
      name: 'Dự án Cầu Vượt',
      description: 'Xây dựng cầu vượt tại ngã tư sầm uất',
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      progress: 65,
      manager: 'Trần Thị B',
      teamSize: 12,
      documents: 45,
      tasks: 28,
      issues: 5,
      members: [
        { id: '1', userId: '1', userName: 'Trần Thị B', userEmail: 'tranthib@company.com', role: 'OWNER', joinedAt: '2024-01-15', status: 'ACTIVE' },
        { id: '2', userId: '2', userName: 'Nguyễn Văn A', userEmail: 'nguyenvana@company.com', role: 'MANAGER', joinedAt: '2024-01-16', status: 'ACTIVE' }
      ]
    },
    {
      id: '2',
      name: 'Dự án Hạ Tầng ABC',
      description: 'Nâng cấp hạ tầng giao thông khu vực ABC',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: '2024-03-01',
      endDate: '2025-06-30',
      progress: 25,
      manager: 'Lê Văn C',
      teamSize: 8,
      documents: 23,
      tasks: 15,
      issues: 2,
      members: [
        { id: '3', userId: '3', userName: 'Lê Văn C', userEmail: 'levanc@company.com', role: 'OWNER', joinedAt: '2024-03-01', status: 'ACTIVE' }
      ]
    },
    {
      id: '3',
      name: 'Dự án Tòa Nhà Văn Phòng',
      description: 'Thiết kế và xây dựng tòa nhà văn phòng cao tầng',
      status: 'ON_HOLD',
      priority: 'LOW',
      startDate: '2024-02-01',
      endDate: '2025-03-31',
      progress: 40,
      manager: 'Nguyễn Văn A',
      teamSize: 15,
      documents: 67,
      tasks: 42,
      issues: 8,
      members: [
        { id: '4', userId: '1', userName: 'Nguyễn Văn A', userEmail: 'nguyenvana@company.com', role: 'OWNER', joinedAt: '2024-02-01', status: 'ACTIVE' }
      ]
    },
    {
      id: '4',
      name: 'Dự án Cải Tạo Đường',
      description: 'Cải tạo và mở rộng đường giao thông chính',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      startDate: '2023-06-01',
      endDate: '2024-01-31',
      progress: 100,
      manager: 'Phạm Thị D',
      teamSize: 10,
      documents: 34,
      tasks: 20,
      issues: 3,
      members: [
        { id: '5', userId: '4', userName: 'Phạm Thị D', userEmail: 'phamthid@company.com', role: 'OWNER', joinedAt: '2023-06-01', status: 'ACTIVE' }
      ]
    },
    {
      id: '5',
      name: 'Dự án Công Viên',
      description: 'Thiết kế và xây dựng công viên giải trí',
      status: 'ACTIVE',
      priority: 'LOW',
      startDate: '2024-04-01',
      endDate: '2024-10-31',
      progress: 30,
      manager: 'Hoàng Văn E',
      teamSize: 6,
      documents: 18,
      tasks: 12,
      issues: 1,
      members: [
        { id: '6', userId: '5', userName: 'Hoàng Văn E', userEmail: 'hoangvane@company.com', role: 'OWNER', joinedAt: '2024-04-01', status: 'ACTIVE' }
      ]
    }
  ];
  
  // Kiểm tra authentication khi component mount
  useEffect(() => {
    console.log('Project component mount - Auth check:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });
    
    if (!token) {
      console.error('Authentication missing in Project component');
      return;
    }
    
    // Fetch data
    fetchProjects();
    fetchUsers();
    
    // Socket.IO setup for project comments
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'https://qlda.hoanglong24.com';
    console.log('Connecting to Socket.IO at:', socketUrl);
    
    try {
      const socket = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      

      
      socket.on('connect', () => {
        console.log('Socket.IO connected successfully:', socket.id);
      });
      
      socket.on('connect_error', (error: Error) => {
        console.error('Socket.IO connection error:', error);
      });
      

      
      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('Socket.IO setup error:', error);
    }
  }, []);
  
  // Hàm định nghĩa giá trị sắp xếp cho các trạng thái
  const getStatusSortValue = (status: string): number => {
    switch (status) {
      case 'ACTIVE': return 1;
      case 'ON_HOLD': return 2;
      case 'COMPLETED': return 3;
      case 'CANCELLED': return 4;
      default: return 5;
    }
  };
  
  // Hàm định nghĩa giá trị sắp xếp cho các mức độ ưu tiên (giảm dần)
  const getPrioritySortValue = (priority: string): number => {
    switch (priority) {
      case 'URGENT': return 1;
      case 'HIGH': return 2;
      case 'MEDIUM': return 3;
      case 'LOW': return 4;
      default: return 5;
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      console.log('Fetching projects...');
      
      // Kiểm tra token trước khi gọi API
      if (!token) {
        console.error('No token available for API call');
        message.error('Authentication required. Please log in again.');
        return;
      }
      
      const res = await axiosInstance.get('/projects');
      console.log('Projects data response:', res.data);
      
      // Kiểm tra dữ liệu trả về
      let projectsData = [];
      if (res.data && Array.isArray(res.data)) {
        projectsData = res.data;
      } else if (res.data && res.data.projects && Array.isArray(res.data.projects)) {
        projectsData = res.data.projects;
      } else {
        console.warn('Unexpected projects data format:', res.data);
      }
      
      // Xử lý dữ liệu để đảm bảo các trường hiển thị đúng
      if (!Array.isArray(projectsData)) {
        console.error('projectsData is not an array:', projectsData);
        setProjects([]);
        setLoading(false);
        return;
      }
      
      const processedProjects = projectsData.map((project: any) => {
        console.log('Raw project data:', project);
        
        // Kiểm tra chi tiết và log các trường quan trọng
        console.log('Project fields check:', {
          id: project.id,
          name: project.name,
          description: project.description !== undefined ? `has value: ${project.description?.substring(0, 20)}` : 'undefined',
          startDate: project.startDate || 'not set',
          endDate: project.endDate || 'not set',
          priority: project.priority || 'not set',
          status: project.status,
          members: Array.isArray(project.members) ? `${project.members.length} members` : 'no members array'
        });
        
        // Xử lý các trường ngày tháng cẩn thận hơn
        let startDate = null;
        if (project.startDate) {
          try {
            // Kiểm tra kỹ kiểu dữ liệu
            if (typeof project.startDate === 'string') {
              // Kiểm tra chuỗi rỗng
              if (project.startDate.trim()) {
                const momentDate = moment(project.startDate);
                if (momentDate.isValid()) {
                  startDate = project.startDate;
                  console.log('Valid startDate:', startDate);
                } else {
                  console.warn('Invalid startDate string:', project.startDate);
                }
              } else {
                console.warn('Empty startDate string');
              }
            } else if (project.startDate instanceof Date) {
              startDate = project.startDate;
              console.log('Valid startDate Date object:', startDate);
            } else {
              console.warn('Unknown startDate format:', project.startDate);
            }
          } catch (error) {
            console.error('Error processing startDate:', error, project.startDate);
          }
        } else {
          console.log('No startDate provided');
        }
        
        let endDate = null;
        if (project.endDate) {
          try {
            // Kiểm tra kỹ kiểu dữ liệu
            if (typeof project.endDate === 'string') {
              // Kiểm tra chuỗi rỗng
              if (project.endDate.trim()) {
                const momentDate = moment(project.endDate);
                if (momentDate.isValid()) {
                  endDate = project.endDate;
                  console.log('Valid endDate:', endDate);
                } else {
                  console.warn('Invalid endDate string:', project.endDate);
                }
              } else {
                console.warn('Empty endDate string');
              }
            } else if (project.endDate instanceof Date) {
              endDate = project.endDate;
              console.log('Valid endDate Date object:', endDate);
            } else {
              console.warn('Unknown endDate format:', project.endDate);
            }
          } catch (error) {
            console.error('Error processing endDate:', error, project.endDate);
          }
        } else {
          console.log('No endDate provided');
        }
        
        // Xử lý priority
        let priority = project.priority || 'MEDIUM';
        
        // Nếu chưa có priority nhưng có deadline, tính toán mức độ ưu tiên dựa trên thời gian còn lại
        if (!project.priority && project.status === 'ACTIVE' && endDate) {
          const daysToEnd = moment(endDate).diff(moment(), 'days');
          
          // Nếu còn ít hơn 30 ngày đến deadline
          if (daysToEnd <= 30) {
            priority = 'HIGH';
          } 
          // Nếu còn ít hơn 90 ngày đến deadline
          else if (daysToEnd <= 90) {
            priority = 'MEDIUM';
          } 
          // Nếu còn nhiều hơn 90 ngày
          else {
            priority = 'LOW';
          }
        }
        
        // Đảm bảo các trường quan trọng luôn có giá trị
        const processedProject = {
          ...project,
          // Không ép kiểu hoặc ghi đè description, chỉ lấy nguyên giá trị từ backend
          startDate: startDate,
          endDate: endDate,
          priority: priority,
          members: Array.isArray(project.members) ? project.members : []
        };
        
        console.log('Processed project:', processedProject);
        return processedProject;
      });
      
      // Sắp xếp dự án theo trạng thái và mức độ ưu tiên
      processedProjects.sort((a: { status: string; priority: string }, b: { status: string; priority: string }) => {
        // Sắp xếp trước tiên theo trạng thái
        const statusComparison = getStatusSortValue(a.status) - getStatusSortValue(b.status);
        if (statusComparison !== 0) return statusComparison;
        
        // Nếu cùng trạng thái, sắp xếp theo mức độ ưu tiên (giảm dần)
        return getPrioritySortValue(a.priority) - getPrioritySortValue(b.priority);
      });
      
      console.log('Processed and sorted projects:', processedProjects);
      setProjects(processedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      
      if (error.response?.status === 401) {
        console.log('401 error - redirecting to login');
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      message.error(error.response?.data?.error || 'Không thể tải danh sách dự án!');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users/all');
      console.log('Users data response:', res.data);
      
      // Kiểm tra dữ liệu trả về
      if (res.data && Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (res.data && res.data.users && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        console.warn('Unexpected users data format:', res.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng!');
      setUsers([]);
    }
  };


  
  const handleAdd = () => {
    if (!canCreateProjects) {
      showPermissionDeniedMessage();
      return;
    }
    
    console.log('Adding new project...');
    setEditingProject(null);
    form.setFieldsValue({
      name: '',
      description: '',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      startDate: null,
      endDate: null,
      memberIds: []
    });
    setModalOpen(true);
  };
  const handleEdit = (record: any) => {
    if (!canEditProjects) {
      showPermissionDeniedMessage();
      return;
    }
    
    console.log('Editing project:', record);
    setEditingProject(record);
    
    // Xử lý ngày tháng
    const startDate = record.startDate ? moment(record.startDate) : null;
    const endDate = record.endDate ? moment(record.endDate) : null;
    
    // Xử lý danh sách thành viên
    let memberIds = [];
    if (record.members && Array.isArray(record.members)) {
      memberIds = record.members.map((member: any) => {
        if (member.userId) return member.userId;
        if (member.id) return member.id;
        return member;
      }).filter(Boolean);
    }
    
    console.log('Setting form values:', {
      ...record,
      startDate,
      endDate,
      memberIds
    });
    
    form.setFieldsValue({
      name: record.name || '',
      description: record.description || '',
      status: record.status || 'ACTIVE',
      startDate,
      endDate,
      memberIds
    });
    
    setModalOpen(true);
  };
  const handleOk = async () => {
    try {
      // Kiểm tra authentication trước khi submit
      if (!token) {
        console.error('No token available for form submission');
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
        return;
      }
      
      // Thêm giá trị mặc định cho form trước khi validate
      const currentValues = form.getFieldsValue();
      console.log('Current form values:', currentValues);
      
      // Validate form với error handling chi tiết hơn
      let values;
      try {
        values = await form.validateFields();
        console.log('DEBUG FORM VALUES:', values);
      } catch (validationError: any) {
        console.error('Form validation failed:', validationError);
        
        // Log chi tiết các lỗi validation
        if (validationError.errorFields && Array.isArray(validationError.errorFields)) {
          console.log('Validation error details:');
          validationError.errorFields.forEach((field: any, index: number) => {
            console.log(`Field ${index + 1}:`, {
              name: field.name,
              errors: field.errors,
              value: field.value
            });
          });
          
          // Hiển thị lỗi validation đầu tiên
          const firstError = validationError.errorFields[0];
          if (firstError && firstError.errors && firstError.errors.length > 0) {
            message.error(firstError.errors[0]);
          } else {
            message.error('Vui lòng kiểm tra lại thông tin trong form!');
          }
        } else {
          message.error('Có lỗi xảy ra khi kiểm tra thông tin!');
        }
        return;
      }
      
      // Kiểm tra và xử lý các trường bắt buộc
      if (!values.name || typeof values.name !== 'string' || values.name.trim().length < 3) {
        message.error('Tên dự án phải có ít nhất 3 ký tự và không được để trống!');
        return;
      }
      
      // Kiểm tra trạng thái
      if (!values.status) {
        message.error('Vui lòng chọn trạng thái dự án!');
        return;
      }
      
      // Định dạng ngày tháng
      const formattedValues = {
        ...values,
        name: values.name?.trim(),
        description: values.description && typeof values.description === 'string' && values.description.trim() !== '' ? values.description.trim() : null,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        priority: values.priority || 'MEDIUM',
        // Gửi đúng định dạng members cho backend: [{ userId, role }]
        members: (values.memberIds || []).map((userId: string) => {
          // Nếu đang sửa, lấy role cũ nếu có, mặc định là 'USER'
          let role = 'USER';
          if (editingProject && editingProject.members && Array.isArray(editingProject.members)) {
            const found = editingProject.members.find((m: any) => m.userId === userId || m.user?.id === userId);
            if (found && found.role) role = found.role;
          }
          return { userId, role };
        })
      };
      
      console.log('Sending project data:', formattedValues);
      
      if (editingProject) {
        const response = await axiosInstance.put(`/projects/${editingProject.id}`, formattedValues);
        console.log('Project update response:', response.data);
        message.success('Đã cập nhật dự án');
      } else {
        // Khi tạo mới, gửi members đúng định dạng
        const createValues = {
          ...formattedValues,
          members: (values.memberIds || []).map((userId: string) => ({ userId, role: 'USER' }))
        };
        const response = await axiosInstance.post('/projects', createValues);
        console.log('Project create response:', response.data);
        message.success('Đã tạo dự án');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingProject(null);
      fetchProjects();
    } catch (e: any) {
      console.error('LỖI SUBMIT FORM:', e);
      console.error('Error details:', e.response?.data || e);
      
      // Kiểm tra lỗi authentication
      if (e.response?.status === 401) {
        console.log('401 error in form submission - redirecting to login');
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
        return;
      }
      
      // Log chi tiết hơn về lỗi
      if (e.errorFields) {
        console.log('Form validation errors:', e.errorFields);
        e.errorFields.forEach((field: any, index: number) => {
          console.log(`Field ${index + 1}:`, field.name, 'Errors:', field.errors);
        });
      }
      
      if (e.response) {
        console.log('Server response status:', e.response.status);
        console.log('Server response data:', e.response.data);
      }
      
      // Nếu là lỗi validate của antd form
      if (e && e.errorFields && Array.isArray(e.errorFields) && e.errorFields.length > 0) {
        message.error(e.errorFields[0].errors[0] || 'Vui lòng kiểm tra lại thông tin!');
      } else {
        message.error(e?.response?.data?.error || e?.message || 'Đã xảy ra lỗi!');
      }
    }
  };
  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting project with ID:', id);
      const response = await axiosInstance.delete(`/projects/${id}`);
      console.log('Delete response:', response.data);
      message.success('Đã xóa dự án');
      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      console.error('Error response:', error.response?.data);
      message.error('Không thể xóa dự án. ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteClick = (project: any) => {
    if (!canDeleteProjects) {
      showPermissionDeniedMessage();
      return;
    }
    
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
  const showDetail = async (record: any) => {
    if (!canViewProjectDetails) {
      showPermissionDeniedMessage();
      return;
    }
    
    setDrawerOpen(true);
    setDetail(null);
    
    try {
      console.log('Fetching project details for ID:', record.id);
      const res = await axiosInstance.get(`/projects/${record.id}`);
      console.log('Project detail response:', res.data);
      console.log('Notes from API:', res.data.notes);
      
      const projectData = res.data;
      
      // Process the data
      const processedData = {
        ...projectData,
        startDate: projectData.startDate ? moment(projectData.startDate).format('DD/MM/YYYY') : null,
        endDate: projectData.endDate ? moment(projectData.endDate).format('DD/MM/YYYY') : null,
        members: Array.isArray(projectData.members) ? projectData.members : [],
        documents: Array.isArray(projectData.documents) ? projectData.documents : [],
        tasks: Array.isArray(projectData.tasks) ? projectData.tasks : [],
        images: Array.isArray(projectData.images) ? projectData.images : [],
        notes: Array.isArray(projectData.notes) ? projectData.notes : []
      };
      
      setDetail(processedData);
      

      
    } catch (error) {
      console.error('Error fetching project details:', error);
      message.error('Không thể tải chi tiết dự án!');
    }
  };
  const handleAddNote = async (values: any) => {
    if (!canViewProjectDetails) {
      showPermissionDeniedMessage();
      return;
    }
    
    await axiosInstance.post(`/projects/${detail.id}/note`, { ...values, authorId: users[0]?.id });
    message.success('Đã thêm ghi chú');
    noteForm.resetFields();
    showDetail(detail);
  };
  const handleUpload = async (info: any) => {
    if (!canViewProjectDetails) {
      showPermissionDeniedMessage();
      return;
    }
    
    if (info.file.status === 'uploading') { setImgLoading(true); return; }
    if (info.file.status === 'done') {
      setImgLoading(false);
      message.success('Đã upload ảnh');
      showDetail(detail);
    }
  };

  const handleExportProject = async (projectId: string) => {
    if (!canExportProjectData) {
      showPermissionDeniedMessage();
      return;
    }
    
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-${projectId}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Đã xuất báo cáo dự án');
    } catch (error) {
      console.error('Error exporting project:', error);
      message.error('Không thể xuất báo cáo dự án');
    }
  };

  const handleExportAllProjects = async () => {
    if (!canExportProjectData) {
      showPermissionDeniedMessage();
      return;
    }
    
    try {
      const response = await axiosInstance.get('/projects/export-all', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all-projects-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Đã xuất tất cả dự án');
    } catch (error) {
      console.error('Error exporting all projects:', error);
      message.error('Không thể xuất dữ liệu dự án');
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    if (!canArchiveProjects) {
      showPermissionDeniedMessage();
      return;
    }
    
    try {
      await axiosInstance.put(`/projects/${projectId}/archive`);
      message.success('Đã lưu trữ dự án');
      fetchProjects();
    } catch (error) {
      console.error('Error archiving project:', error);
      message.error('Không thể lưu trữ dự án');
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    if (!canCreateProjects) {
      showPermissionDeniedMessage();
      return;
    }
    
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/duplicate`);
      message.success('Đã sao chép dự án');
      fetchProjects();
    } catch (error) {
      console.error('Error duplicating project:', error);
      message.error('Không thể sao chép dự án');
    }
  };

  const handleViewProjectHistory = async (projectId: string) => {
    if (!canViewProjectHistory) {
      showPermissionDeniedMessage();
      return;
    }
    
    // Implement project history view
    message.info('Tính năng xem lịch sử dự án đang được phát triển');
  };

  const handleShareProject = async (projectId: string) => {
    if (!canViewProjectDetails) {
      showPermissionDeniedMessage();
      return;
    }
    
    // Implement project sharing
    message.info('Tính năng chia sẻ dự án đang được phát triển');
  };

  // Hàm lấy màu ưu tiên
  const getPriorityColor = (priority: string) => {
    const priorityItem = priorityLevels.find(p => p.value === priority);
    return priorityItem ? priorityItem.color : 'default';
  };

  // Hàm lấy tên ưu tiên
  const getPriorityLabel = (priority: string) => {
    const priorityItem = priorityLevels.find(p => p.value === priority);
    return priorityItem ? priorityItem.label : 'Không';
  };

  // Hàm lấy icon trạng thái
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'COMPLETED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'ON_HOLD':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'CANCELLED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  // Hàm lấy tên trạng thái
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'ON_HOLD':
        return 'Tạm dừng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Hàm lọc dự án theo mức độ ưu tiên
  const filterProjectsByPriority = (projects: any[]) => {
    if (!priorityFilter) return projects;
    return projects.filter(project => project.priority === priorityFilter);
  };

  // Hàm lọc dự án dựa trên các bộ lọc
  const getFilteredProjects = () => {
    if (!projects || !Array.isArray(projects)) return [];
    
    return projects.filter(project => {
      // Lọc theo ưu tiên
      if (priorityFilter && project.priority !== priorityFilter) {
        return false;
      }
      
      // Lọc theo trạng thái
      if (statusFilter && project.status !== statusFilter) {
        return false;
      }
      
      // Lọc theo từ khóa tìm kiếm (tên dự án hoặc mô tả)
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const nameMatch = project.name && project.name.toLowerCase().includes(searchLower);
        const descMatch = project.description && project.description.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !descMatch) {
          return false;
        }
      }
      
      // Lọc theo khoảng thời gian
      if (dateRangeFilter[0] || dateRangeFilter[1]) {
        const startDate = dateRangeFilter[0];
        const endDate = dateRangeFilter[1];
        
        // Nếu có ngày bắt đầu lọc và dự án có ngày bắt đầu
        if (startDate && project.startDate) {
          const projectStartDate = moment(project.startDate);
          if (projectStartDate.isBefore(startDate)) {
            return false;
          }
        }
        
        // Nếu có ngày kết thúc lọc và dự án có ngày bắt đầu
        if (endDate && project.startDate) {
          const projectStartDate = moment(project.startDate);
          if (projectStartDate.isAfter(endDate)) {
            return false;
          }
        }
      }
      
      return true;
    });
  };

  // Hàm render cho trường Ngày bắt đầu 
  const renderDate = (date: any) => {
    // In giá trị date để debug
    console.log('renderDate input:', date, typeof date);
    
    // Nếu không có giá trị hoặc giá trị là null hoặc undefined
    if (date === null || date === undefined) {
      console.log('Date is null or undefined');
      return '-';
    }
    
    try {
      // Kiểm tra kỹ kiểu dữ liệu
      if (typeof date === 'string') {
        // Nếu là chuỗi rỗng
        if (!date.trim()) {
          console.log('Date is empty string');
          return '-';
        }
        
        const momentDate = moment(date);
        if (!momentDate.isValid()) {
          console.warn('Invalid date string:', date);
          return '-';
        }
        console.log('Valid string date, formatted as:', momentDate.format('DD/MM/YYYY'));
        return momentDate.format('DD/MM/YYYY');
      }
      
      // Nếu đã là đối tượng Date
      if (date instanceof Date) {
        const momentDate = moment(date);
        console.log('Date object, formatted as:', momentDate.format('DD/MM/YYYY'));
        return momentDate.format('DD/MM/YYYY');
      }
      
      // Các trường hợp khác
      console.warn('Unknown date format:', date);
      return '-';
    } catch (err) {
      console.error('Error formatting date:', err, date);
      return '-';
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Tên dự án',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text: string, record: any) => (
        <Tooltip title={text} placement="topLeft">
          <span style={{
            display: 'inline-block',
            maxWidth: 200,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            verticalAlign: 'middle',
            fontWeight: 600,
            fontSize: 15
          }}>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 320,
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span style={{
            display: 'inline-block',
            maxWidth: 300,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            verticalAlign: 'middle',
            color: '#888',
            fontSize: 13
          }}>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={
          status === 'ACTIVE' ? 'blue' :
          status === 'COMPLETED' ? 'green' :
          status === 'ON_HOLD' ? 'gold' :
          status === 'CANCELLED' ? 'red' : 'default'
        }>
          {getStatusLabel(status)}
        </Tag>
      )
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: renderDate
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: renderDate
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityLabel(priority)}
        </Tag>
      )
    },
    {
      title: 'Thành viên',
      dataIndex: 'members',
      key: 'members',
      render: (ms: any[]) => {
        if (!ms || !Array.isArray(ms) || ms.length === 0) return '-';
        return ms.map(m => m.user?.name || m.name || '').filter(Boolean).join(', ') || '-';
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {canViewProjectDetails && (
            <Button type="link" onClick={() => showDetail(record)}>Chi tiết</Button>
          )}
          {canEditProjects && (
            <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          )}
          {canDeleteProjects && (
            <Button type="link" danger onClick={() => handleDeleteClick(record)}>Xóa</Button>
          )}
          {canExportProjectData && (
            <Button 
              type="link" 
              icon={<ExportOutlined />}
              onClick={() => handleExportProject(record.id)}
            >
              Xuất
            </Button>
          )}
          {canCreateProjects && (
            <Button 
              type="link" 
              icon={<CopyOutlined />}
              onClick={() => handleDuplicateProject(record.id)}
            >
              Sao chép
            </Button>
          )}
          {canArchiveProjects && (
            <Button 
              type="link" 
              icon={<InboxOutlined />}
              onClick={() => handleArchiveProject(record.id)}
            >
              Lưu trữ
            </Button>
          )}
          {canViewProjectHistory && (
            <Button 
              type="link" 
              icon={<HistoryOutlined />}
              onClick={() => handleViewProjectHistory(record.id)}
            >
              Lịch sử
            </Button>
          )}
          {canViewProjectDetails && (
            <Button 
              type="link" 
              icon={<ShareAltOutlined />}
              onClick={() => handleShareProject(record.id)}
            >
              Chia sẻ
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Hàm render dự án dạng card
  const renderProjectCard = (project: any) => {
    // Xác định màu sắc cho card dựa vào priority
    const getPriorityColor = (priority: string) => {
      const priorityInfo = priorityLevels.find(p => p.value === priority);
      return priorityInfo ? priorityInfo.color : 'default';
    };
    
    // Xác định icon cho trạng thái
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'ACTIVE':
          return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
        case 'COMPLETED':
          return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        case 'ON_HOLD':
          return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
        case 'CANCELLED':
          return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
        default:
          return null;
      }
    };
    
    // Xác định text cho trạng thái
    const getStatusText = (status: string) => {
      switch (status) {
        case 'ACTIVE':
          return 'Đang hoạt động';
        case 'COMPLETED':
          return 'Hoàn thành';
        case 'ON_HOLD':
          return 'Tạm dừng';
        case 'CANCELLED':
          return 'Đã hủy';
        default:
          return status;
      }
    };
    
    return (
      <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Tag
            style={{
              position: 'absolute',
              top: '-10px',
              left: '16px',
              zIndex: 1
            }}
            icon={getStatusIcon(project.status)}
            color={
              project.status === 'ACTIVE' ? 'blue' :
              project.status === 'COMPLETED' ? 'green' :
              project.status === 'ON_HOLD' ? 'gold' :
              project.status === 'CANCELLED' ? 'red' : 'default'
            }
          >
            {getStatusLabel(project.status)}
          </Tag>
          <Card
            hoverable
            title={project.name}
            extra={
              <Tag color={getPriorityColor(project.priority)}>
                {priorityLevels.find(p => p.value === project.priority)?.label || 'Không'}
              </Tag>
            }
            actions={[
              canViewProjectDetails && <Button type="link" onClick={() => showDetail(project)} key="detail">Chi tiết</Button>,
              canEditProjects && <Button type="link" onClick={() => handleEdit(project)} key="edit">Sửa</Button>,
              canDeleteProjects && <Button type="link" danger onClick={() => handleDeleteClick(project)} key="delete">Xóa</Button>,
              canExportProjectData && <Button type="link" icon={<ExportOutlined />} onClick={() => handleExportProject(project.id)} key="export">Xuất</Button>,
              canCreateProjects && <Button type="link" icon={<CopyOutlined />} onClick={() => handleDuplicateProject(project.id)} key="duplicate">Sao chép</Button>,
              canArchiveProjects && <Button type="link" icon={<InboxOutlined />} onClick={() => handleArchiveProject(project.id)} key="archive">Lưu trữ</Button>,
              canViewProjectHistory && <Button type="link" icon={<HistoryOutlined />} onClick={() => handleViewProjectHistory(project.id)} key="history">Lịch sử</Button>,
              canViewProjectDetails && <Button type="link" icon={<ShareAltOutlined />} onClick={() => handleShareProject(project.id)} key="share">Chia sẻ</Button>
            ].filter(Boolean)}
            style={{
              borderRadius: 16,
              boxShadow: isDarkMode
                ? '0 4px 24px 0 rgba(0,0,0,0.35), 0 1.5px 6px 0 rgba(0,0,0,0.18)'
                : '0 4px 24px 0 rgba(24, 144, 255, 0.10), 0 1.5px 6px 0 rgba(0,0,0,0.06)',
              border: `2px solid ${
                project.status === 'ACTIVE' ? (isDarkMode ? '#177ddc' : '#1890ff') :
                project.status === 'COMPLETED' ? (isDarkMode ? '#49aa19' : '#52c41a') :
                project.status === 'ON_HOLD' ? (isDarkMode ? '#d89614' : '#faad14') :
                project.status === 'CANCELLED' ? (isDarkMode ? '#a61d24' : '#ff4d4f') :
                (isDarkMode ? '#434343' : '#e4e4e4')
              }`,
              transition: 'transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s',
              padding: 16,
              background: isDarkMode ? '#1f1f1f' : undefined
            }}
            bodyStyle={{
              borderRadius: 16,
              minHeight: 120,
              background: isDarkMode ? '#141414' : '#fafdff',
              transition: 'background 0.2s'
            }}
            className="project-card-highlight"
          >
            <div style={{ marginBottom: 8 }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <span>
                {project.startDate && moment(project.startDate).isValid()
                  ? moment(project.startDate).format('DD/MM/YYYY')
                  : '-'
                }
                {' → '}
                {project.endDate && moment(project.endDate).isValid()
                  ? moment(project.endDate).format('DD/MM/YYYY')
                  : '-'
                }
              </span>
            </div>
            
            <div style={{ marginBottom: 8 }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              <span>
                {project.members && Array.isArray(project.members) && project.members.length > 0
                  ? `${project.members.length} thành viên`
                  : 'Chưa có thành viên'
                }
              </span>
            </div>
            
            {project._count && (
              <div>
                <FileOutlined style={{ marginRight: 8 }} />
                <span>
                  {project._count.documents || 0} tài liệu, {project._count.tasks || 0} công việc
                </span>
              </div>
            )}
          </Card>
        </div>
      </Col>
    );
  };

  const renderProjectContent = (project: any) => {
    return (
      <div style={{ marginTop: '10px' }}>
        <div><strong>Mô tả:</strong> {project.description || '-'}</div>
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>Bắt đầu:</strong> {renderDate(project.startDate)}
          </div>
          <div>
            <strong>Kết thúc:</strong> {renderDate(project.endDate)}
          </div>
        </div>
      </div>
    );
  };
  
  // Hiển thị Card dự án cho chế độ Card
  const renderProjectCards = () => {
    return getFilteredProjects().map(project => (
      <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
        <ProjectCard
          project={project}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={showDetail}
          onRefresh={fetchProjects}
          isDarkMode={isDarkMode}
        />
      </Col>
    ));
  };

  // Component hiển thị bộ lọc
  const renderFilters = () => {
    return (
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Radio.Group
              value={viewMode}
              onChange={e => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="table">Bảng</Radio.Button>
              <Radio.Button value="card">Thẻ</Radio.Button>
            </Radio.Group>
          </Col>
          {canViewProjects && (
            <Col>
              <Input.Search
                placeholder="Tìm kiếm dự án"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </Col>
          )}
          {canViewProjects && (
            <Col>
              <Button onClick={() => setFilterDrawerVisible(true)}>
                Bộ lọc nâng cao
              </Button>
            </Col>
          )}
          {(canViewProjects || canViewProjects) && (
            <Col>
              <Button
                type="link"
                onClick={() => {
                  setPriorityFilter(null);
                  setStatusFilter(null);
                  setSearchText('');
                  setDateRangeFilter([null, null]);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  // Component Drawer hiển thị bộ lọc nâng cao
  const renderFilterDrawer = () => {
    return (
      <Drawer
        title="Bộ lọc nâng cao"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={300}
      >
        <Form layout="vertical">
          <Form.Item label="Mức độ ưu tiên">
            <Select
              value={priorityFilter}
              onChange={value => setPriorityFilter(value)}
              placeholder="Chọn mức độ ưu tiên"
              allowClear
              style={{ width: '100%' }}
            >
              {priorityLevels.map(priority => (
                <Option key={priority.value} value={priority.value}>
                  <Tag color={priority.color}>{priority.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái">
            <Select
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
              placeholder="Chọn trạng thái"
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="ACTIVE">Đang hoạt động</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="ON_HOLD">Tạm dừng</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Khoảng thời gian">
            <DatePicker.RangePicker
              value={dateRangeFilter as any}
              onChange={dates => setDateRangeFilter(dates as [moment.Moment | null, moment.Moment | null])}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              onClick={() => setFilterDrawerVisible(false)}
            >
              Áp dụng
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  };

  // Debug function to check form state
  const debugFormState = () => {
    const values = form.getFieldsValue();
    const errors = form.getFieldsError();
    console.log('=== FORM DEBUG INFO ===');
    console.log('Form values:', values);
    console.log('Form errors:', errors);
    console.log('Form is valid:', form.isFieldsValidating());
    console.log('=======================');
  };

  // Add debug button for development
  const addDebugButton = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <Button 
          type="dashed" 
          onClick={debugFormState}
          style={{ marginBottom: 16 }}
        >
          Debug Form State
        </Button>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {canCreateProjects && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm dự án
            </Button>
          )}
          {canExportProjectData && (
            <Button icon={<ExportOutlined />} onClick={handleExportAllProjects}>
              Xuất tất cả
            </Button>
          )}
          {canImportProjectData && (
            <Button icon={<ImportOutlined />}>
              Nhập dữ liệu
            </Button>
          )}
          {addDebugButton()}
        </div>
        {renderFilters()}
      </div>
      
      {renderFilterDrawer()}
      
      {viewMode === 'table' ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={getFilteredProjects()}
          loading={loading || permissionsLoading}
          bordered
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} dự án`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10
          }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {renderProjectCards()}
        </Row>
      )}
      
      <Modal 
        open={modalOpen} 
        title={editingProject ? 'Sửa dự án' : 'Thêm dự án'} 
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingProject(null);
        }} 
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setModalOpen(false);
              form.resetFields();
              setEditingProject(null);
            }}
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
        destroyOnClose
        width={800}
        className="tablet-landscape-edit-modal"
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'ACTIVE',
            description: '',
            memberIds: [],
            priority: undefined,
            startDate: undefined,
            endDate: undefined
          }}
          className="tablet-landscape-edit-form project-form"
          validateTrigger={['onBlur', 'onChange']}
        >
          {/* Tên dự án - Full width */}
          <Form.Item
            name="name"
            label="Tên dự án"
            rules={[
              { required: true, message: 'Nhập tên dự án!' },
              { 
                validator: (_, value) => {
                  if (!value || typeof value !== 'string') {
                    return Promise.reject(new Error('Tên dự án không được để trống!'));
                  }
                  if (value.trim().length < 3) {
                    return Promise.reject(new Error('Tên dự án phải có ít nhất 3 ký tự!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            className="span-full"
          >
            <Input 
              placeholder="Nhập tên dự án (tối thiểu 3 ký tự)"
              maxLength={100}
            />
          </Form.Item>

          {/* Mô tả - Full width */}
          <Form.Item name="description" label="Mô tả" className="span-full">
            <Input.TextArea onChange={e => { console.log('Mô tả nhập:', e.target.value); }} />
          </Form.Item>

          {/* Trạng thái và Mức độ ưu tiên - 2 cột */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label="Trạng thái" 
                rules={[
                  { required: true, message: 'Vui lòng chọn trạng thái!' }
                ]}
              >
                <Select placeholder="Chọn trạng thái dự án">
                  <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                  <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                  <Select.Option value="ON_HOLD">Tạm dừng</Select.Option>
                  <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Mức độ ưu tiên">
                <Select placeholder="Chọn mức độ ưu tiên">
                  {priorityLevels.map(priority => (
                    <Option key={priority.value} value={priority.value}>
                      <Tag color={priority.color}>{priority.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Ngày bắt đầu và Ngày kết thúc - 2 cột */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày bắt đầu"
                  popupStyle={{ zIndex: 1060 }}
                  getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày kết thúc"
                  popupStyle={{ zIndex: 1060 }}
                  getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Thành viên - Full width */}
          <Form.Item 
            name="memberIds" 
            label="Thành viên" 
            className="span-full"
            initialValue={[]}
          >
            <Select
              mode="multiple"
              options={users.map((u: any) => ({ value: u.id, label: u.name }))}
              placeholder="Chọn thành viên (không bắt buộc)"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              showSearch
              style={{ width: '100%' }}
              getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
              allowClear
              maxTagCount={3}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} width={700} title={detail?.name || 'Chi tiết dự án'}>
        {detail && (
          <div>
            <Title level={4}>Thông tin dự án</Title>
            <p><b>Tên dự án:</b> {detail.name || '-'}</p>
            <p><b>Mô tả:</b> {detail.description || '-'}</p>
            <p><b>Trạng thái:</b> {detail.status ? (
              detail.status === 'ACTIVE' ? 'Đang hoạt động' :
              detail.status === 'COMPLETED' ? 'Hoàn thành' :
              detail.status === 'ON_HOLD' ? 'Tạm dừng' :
              detail.status === 'CANCELLED' ? 'Đã hủy' : detail.status
            ) : '-'}</p>
            <p><b>Mức độ ưu tiên:</b> {detail.priority ? (
              <Tag color={priorityLevels.find(p => p.value === detail.priority)?.color || 'default'}>
                {priorityLevels.find(p => p.value === detail.priority)?.label || 'Không'}
              </Tag>
            ) : '-'}</p>
            <p><b>Ngày bắt đầu:</b> {detail.startDate && moment(detail.startDate).isValid() ? moment(detail.startDate).format('DD/MM/YYYY') : '-'}</p>
            <p><b>Ngày kết thúc:</b> {detail.endDate && moment(detail.endDate).isValid() ? moment(detail.endDate).format('DD/MM/YYYY') : '-'}</p>
            <p><b>Thành viên:</b> {detail.members && Array.isArray(detail.members) && detail.members.length > 0 ?
              detail.members.map((m: any) => m.user?.name || m.name || '').filter(Boolean).join(', ') : '-'}</p>
            
            <Tabs defaultActiveKey="documents">
              <TabPane tab="Tài liệu" key="documents">
                {detail.documents && Array.isArray(detail.documents) && detail.documents.length > 0 ? (
                  <List
                    dataSource={detail.documents}
                    renderItem={(doc: any) => (
                      <List.Item>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name || 'Tài liệu'}</a>
                      </List.Item>
                    )}
                  />
                ) : <p>Chưa có tài liệu</p>}
              </TabPane>
              
              <TabPane tab="Công việc" key="tasks">
                {detail.tasks && Array.isArray(detail.tasks) && detail.tasks.length > 0 ? (
                  <List
                    dataSource={detail.tasks}
                    renderItem={(task: any) => (
                      <List.Item>{task.title || 'Công việc'}</List.Item>
                    )}
                  />
                ) : <p>Chưa có công việc</p>}
              </TabPane>
              
              <TabPane tab="Ảnh dự án" key="images">
                <Upload
                  action={`${axiosInstance.defaults.baseURL}/projects/${detail.id}/image`}
                  headers={{ Authorization: `Bearer ${token}` }}
                  showUploadList={true}
                  onChange={handleUpload}
                  multiple={false}
                  withCredentials={true}
                  data={{ projectId: detail.id, uploadedById: users[0]?.id }}
                >
                  <Button icon={<UploadOutlined />} loading={imgLoading}>Upload ảnh</Button>
                </Upload>
                {detail.images && Array.isArray(detail.images) && detail.images.length > 0 ? (
                  <List
                    grid={{ gutter: 8, column: 4 }}
                    dataSource={detail.images}
                    renderItem={(img: any) => (
                      <List.Item>
                        <img src={img.url} alt="project" style={{ width: '100%', borderRadius: 8 }} />
                      </List.Item>
                    )}
                  />
                ) : <p style={{ marginTop: 8 }}>Chưa có ảnh</p>}
              </TabPane>
              
              <TabPane tab="Ghi chú" key="notes">
                <UnifiedCommentSection
                  entityType="project"
                  entityId={detail.id}
                  users={users}
                  isDarkMode={isDarkMode}
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa dự án"
        content="Bạn có chắc chắn muốn xóa dự án"
        itemName={projectToDelete?.name}
        size="medium"
      />

      {/* Floating Action Button for Mobile and Tablet */}
      {canCreateProjects && (
        <FloatingActionButton 
          onClick={handleAdd}
          tooltip="Thêm dự án mới"
          color={`linear-gradient(135deg, #52c41a 0%, #389e0d 100%)`}
        />
      )}
    </div>
  );
};

export default Project; 