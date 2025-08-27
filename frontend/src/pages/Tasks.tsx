// Updated with authentication fixes - v3 - Build timestamp: 2024-12-19 15:30:00
// Enhanced with overdue task filtering and visual indicators - v4 - Build timestamp: 2024-12-19 16:00:00
// Mobile and Tablet Optimization - v5 - Build timestamp: 2024-12-19 17:00:00
// Features added:
// - Overdue task filter with switch control
// - Visual indicators for overdue tasks with color-coded severity levels
// - Overdue warning alert when tasks are past due
// - Enhanced statistics with overdue count
// - Days overdue display in task table
// - Color-coded project rows when containing overdue tasks
// - Mobile and tablet landscape optimizations
// - Compact action buttons for mobile
// - Enhanced filter layout for tablet landscape
// - Optimized form layout for mobile and tablet
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Removed permission system
// Removed permission components
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Tag, 
  Space, 
  Popover, 
  Tooltip, 
  Badge, 
  Switch, 
  Drawer, 
  List, 
  Avatar, 
  Typography, 
  Divider,
  message,
  Spin,
  Empty,
  Tabs,
  Segmented,
  Dropdown,
  Menu,
  Popconfirm,
  Radio,
  Slider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined, 
  FilterOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  MoreOutlined,
  CommentOutlined,
  HistoryOutlined,
  ExportOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SettingOutlined,
  BarChartOutlined,
  LineOutlined,
  TableOutlined,
  AppstoreOutlined,
  DownOutlined,
  UpOutlined,
  RightOutlined,
  LeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  CopyOutlined,
  ScissorOutlined,
  LinkOutlined,
  DisconnectOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  GlobalOutlined,
  HomeOutlined,
  TeamOutlined,
  ProjectOutlined,
  FolderOutlined,
  FileOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileMarkdownOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  FileSyncOutlined,
  FileExclamationOutlined,
  FileDoneOutlined,
  FileGifOutlined,
  FileJpgOutlined,
  MessageOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import MobileFilters from '../components/MobileFilters';
import FloatingActionButton from '../components/FloatingActionButton';
import CommentDrawer from '../components/CommentDrawer';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import MobileTaskCardOptimized from '../components/MobileTaskCardOptimized';
import { useComments } from '../hooks/useComments';
import '../styles/mobile-improvements.css';
import '../styles/tasks-responsive.css';
import '../styles/dark-modal.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tasks-mobile-height-optimization.css';
import '../styles/tasks-container-height-fix.css';
import '../styles/tasks-mobile-final-fix.css';
import '../styles/tasks-margin-override.css';
import '../styles/tasks-mobile-tablet-optimization.css';
import axiosInstance from '../axiosConfig';
import moment from 'moment';
import 'moment/locale/vi';
import io from 'socket.io-client';
// @ts-ignore
import { debounce } from 'lodash';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import '../styles/mobile-scroll-fix.css';
import '../styles/dashboard-card-spacing-fix.css';
import '../styles/mobile-icon-standardization.css';
import '../styles/desktop-icon-standardization.css';


import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/tablet-landscape-statistics-colors.css';
import '../styles/tablet-icon-standardization.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-filter-improvements.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import '../styles/task-form-mobile-optimization.css';
import '../styles/task-form-specific-optimization.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/modal-button-fix.css';


// Error Boundary Component for Gantt
class GanttErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Gantt Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Empty 
            description={
              <div>
                <p>Có lỗi xảy ra khi hiển thị biểu đồ Gantt</p>
                <p style={{ fontSize: 12, color: '#999' }}>
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Extend GanttTask interface to support additional properties
interface ExtendedGanttTask extends Task {
  parent?: string;
  assignee?: string;
  priority?: string;
  status?: string;
}

const { Option } = Select;
const { Text, Title } = Typography;

const statusColors: any = {
  'TODO': 'default',
  'IN_PROGRESS': 'processing',
  'REVIEW': 'warning',
  'COMPLETED': 'success',
};

const priorityColors: any = {
  'LOW': 'blue',
  'MEDIUM': 'orange',
  'HIGH': 'red',
  'URGENT': 'red',
};

const statusList = [
  { value: 'TODO', label: 'Chờ thực hiện' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'REVIEW', label: 'Đang xem xét' },
  { value: 'COMPLETED', label: 'Hoàn thành' }
];

const priorityList = [
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' },
  { value: 'URGENT', label: 'Khẩn cấp' }
];

const categoryList = [
  { value: 'DESIGN', label: 'Thiết kế' },
  { value: 'SURVEY', label: 'Khảo sát' },
  { value: 'BVTKTC', label: 'BVTKTC' },
  { value: 'DEVELOPMENT', label: 'Phát triển' },
  { value: 'TESTING', label: 'Kiểm thử' },
  { value: 'DOCUMENTATION', label: 'Tài liệu' },
  { value: 'MEETING', label: 'Họp' },
  { value: 'OTHER', label: 'Khác' }
];

// Updated with authentication fixes - v2
const Tasks: React.FC = () => {
  const navigate = useNavigate();
  
  // Removed permission system - always allow all actions
  const canViewTasks = true;
  const canCreateTasks = true;
  const canEditTasks = true;
  const canDeleteTasks = true;
  const canViewProjects = true;
  const canViewUsers = true;
  const canViewDocuments = true;
  const canViewReports = true;
  const permissionsLoading = false;
  
  // Cấu hình moment locale cho tiếng Việt
  useEffect(() => {
    moment.locale('vi');
  }, []);

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [form] = Form.useForm();
  const outletContext = useOutletContext<{ role?: string }>() || {};
  const role = outletContext.role || '';
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'timeline'>('table');
  const [filter, setFilter] = useState<{
    search: string;
    status: string;
    priority: string;
    projectId: string;
    assignee: string;
    overdue: boolean;
  }>({ 
    search: '', 
    status: 'all',
    priority: 'all',
    projectId: 'all',
    assignee: 'all',
    overdue: false
  });
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Use comment hook
  const {
    comments,
    loading: commentLoading,
    fetchComments,
    addComment
  } = useComments({ entityType: 'tasks' });
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);
  const [projectComments, setProjectComments] = useState<{ [key: string]: any[] }>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [kanbanTasks, setKanbanTasks] = useState<{ [key: string]: any[] }>({});
  
  // State cho timeline view mode
  const [timelineViewMode, setTimelineViewMode] = useState<'day' | 'week' | 'month'>('week');
  
  // ✅ Thêm state cho mobile refresh
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTabletLandscape, setIsTabletLandscape] = useState(
    window.innerWidth >= 769 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth
  );
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State cho timeline navigation
  const [timelineStartDate, setTimelineStartDate] = useState(() => {
    // On mobile, center timeline around today
    if (window.innerWidth <= 768) {
      return moment().subtract(15, 'days');
    }
    return moment().subtract(30, 'days');
  });
  const [timelineEndDate, setTimelineEndDate] = useState(() => {
    // On mobile, show shorter range centered on today
    if (window.innerWidth <= 768) {
      return moment().add(15, 'days');
    }
    return moment().add(90, 'days');
  });
  
  // State cho zoom
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // State cho việc thu/phóng dự án
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  
  // State cho việc quản lý expanded rows trong table view
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  
  const theme = useSelector((state: any) => state.ui.theme);
  const { token } = useSelector((state: any) => state.auth);
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Keyboard shortcuts cho timeline
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + P: Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && viewMode === 'timeline') {
        e.preventDefault();
        handleExportGanttPDF();
      }
      
      // Ctrl/Cmd + S: Save as image
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && viewMode === 'timeline') {
        e.preventDefault();
        handleExportGanttImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode]);

  // Auto-scroll to today when timeline view is opened on mobile
  useEffect(() => {
    if (viewMode === 'timeline' && isMobile) {
      setTimeout(() => {
        const timelineContainer = document.querySelector('#gantt-timeline-container .gantt-timeline');
        if (timelineContainer) {
          const columns = getTimelineColumns();
          const todayColumn = columns.find(col => col.isToday);
          
          if (todayColumn) {
            const todayIndex = columns.indexOf(todayColumn);
            const scrollPosition = todayIndex * (todayColumn.width || 40) - (timelineContainer.clientWidth / 2);
            timelineContainer.scrollLeft = Math.max(0, scrollPosition);
          }
        }
      }, 100);
    }
  }, [viewMode, isMobile, timelineViewMode]);

  const fetchTasks = async (page = 1, pageSize = 10, isRefresh = false) => {
    // Check permission to view tasks
    if (!canViewTasks) {
      message.error('Bạn không có quyền xem danh sách nhiệm vụ');
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      
      if (filter.search) params.append('search', filter.search);
      if (filter.status && filter.status !== 'all') params.append('status', filter.status);
      if (filter.priority && filter.priority !== 'all') params.append('priority', filter.priority);
      if (filter.assignee && filter.assignee !== 'all') params.append('assignee', filter.assignee);
      if (filter.projectId && filter.projectId !== 'all') params.append('projectId', filter.projectId);
      if (filter.overdue) params.append('overdue', 'true');

      const res = await axiosInstance.get(`/tasks?${params}`);
      
      if (res.data.tasks) {
        setTasks(res.data.tasks);
        setPagination({
          current: res.data.pagination.page,
          pageSize: res.data.pagination.limit,
          total: res.data.pagination.total
        });
      } else {
        setTasks(res.data);
      }
      
      // ✅ Cập nhật thời gian refresh cuối cùng chỉ khi cần thiết
      if (isRefresh) {
        setLastRefreshTime(new Date());
        if (isMobile) {
          message.success('Đã cập nhật dữ liệu');
        }
      }
    } catch (e) {
      console.error('Lỗi fetchTasks:', e);
      message.error('Không thể tải danh sách công việc!');
      setTasks([]);
    }
    
    if (isRefresh) {
      setIsRefreshing(false);
    } else {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users from database...');
      const response = await axiosInstance.get('/users/all');
      console.log('📊 Users API response:', response.data);
      
      // Kiểm tra dữ liệu trả về
      let usersData = [];
      if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
        } else {
        console.warn('⚠️ Unexpected users data format:', response.data);
        usersData = [];
      }
      
      console.log('✅ Processed users data:', usersData);
      console.log('👥 Number of users loaded:', usersData.length);
      setUsers(usersData);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
        message.error('Không thể tải danh sách người dùng!');
        setUsers([]);
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('🔍 Fetching projects from database...');
      const response = await axiosInstance.get('/projects');
      console.log('📊 Projects API response:', response.data);
      
      // Kiểm tra dữ liệu trả về
      let projectsData = [];
      if (response.data && Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data && response.data.projects && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      } else {
        console.warn('⚠️ Unexpected projects data format:', response.data);
        projectsData = [];
      }
      
      console.log('✅ Processed projects data:', projectsData);
      console.log('🏗️ Number of projects loaded:', projectsData.length);
      setProjects(projectsData);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      message.error('Không thể tải danh sách dự án!');
      setProjects([]);
    }
  };

  const openCommentDrawer = (task: any) => {
    setSelectedTask(task);
    setCommentDrawerOpen(true);
  };

  const handleAddComment = async (content: string) => {
    if (!selectedTask) return;
    await addComment(selectedTask.id, content);
  };

  // ✅ Mobile responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const wasMobile = isMobile;
      const wasTabletLandscape = isTabletLandscape;
      
      const nowMobile = width <= 768 || (width <= 1024 && height <= 500);
      const nowTabletLandscape = width >= 769 && width <= 1366 && height < width;
      
      setIsMobile(nowMobile);
      setIsTabletLandscape(nowTabletLandscape);
      
      // If switching to mobile, adjust timeline to center on today
      if (!wasMobile && nowMobile) {
        setTimelineStartDate(moment().subtract(15, 'days'));
        setTimelineEndDate(moment().add(15, 'days'));
      }
      // If switching from mobile to desktop, expand timeline range
      else if (wasMobile && !nowMobile) {
        setTimelineStartDate(moment().subtract(30, 'days'));
        setTimelineEndDate(moment().add(90, 'days'));
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, isTabletLandscape]);

  // ✅ Mobile refresh mechanism
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isMobile) {
        // Refresh data when page becomes visible on mobile
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.getTime();
        if (timeSinceLastRefresh > 30000) { // 30 seconds
          console.log('🔄 Mobile: Refreshing data due to visibility change');
          fetchTasks();
        }
      }
    };

    const handleFocus = () => {
      if (isMobile) {
        // Refresh data when window gains focus on mobile
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.getTime();
        if (timeSinceLastRefresh > 60000) { // 1 minute
          console.log('🔄 Mobile: Refreshing data due to focus');
          fetchTasks();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isMobile, lastRefreshTime]);

  useEffect(() => {
    console.log('🚀 Tasks component mounted, loading data...');
    
    // Check permission to view tasks
    if (!canViewTasks) {
      message.error('Bạn không có quyền xem danh sách nhiệm vụ');
      return;
    }
    
    fetchTasks();
    fetchProjects();
    fetchUsers();
    
    // Cấu hình Socket.IO với URL chính xác
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'https://qlda.hoanglong24.com';
    console.log('Connecting to Socket.IO at:', socketUrl);
    
    try {
      const socket = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      

      const showRealtimeToast = debounce((msg: string) => message.info(msg), 1000, { leading: true, trailing: false });
      const showCommentToast = debounce((msg: string) => message.info(msg), 1000, { leading: true, trailing: false });
      const showReminderToast = debounce((msg: string) => message.warning(msg), 1000, { leading: true, trailing: false });
      
      socket.on('connect', () => {
        console.log('Socket.IO connected successfully:', socket.id);
        });
      
      socket.on('connect_error', (error: Error) => {
        console.error('Socket.IO connection error:', error);
      });
      
      socket.on('task:created', (data: any) => {
        showRealtimeToast('Có công việc mới: ' + data.task.title);
        fetchTasks();
      });

      socket.on('task:updated', (data: any) => {
        showRealtimeToast('Công việc đã được cập nhật: ' + data.task.title);
        fetchTasks();
      });

      socket.on('task:deleted', (data: any) => {
        showRealtimeToast('Công việc đã được xóa');
        fetchTasks();
      });
      
      socket.on('task:comment:added', (data: any) => {
        showCommentToast('Có bình luận mới cho công việc!');
        fetchTasks();
      });
      
      socket.on('task:reminder', (data: any) => {
        showReminderToast(data.message);
      });
      
      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('Socket.IO setup error:', error);
    }
  }, []);

  // Debug effect for form data
  useEffect(() => {
    console.log('🏗️ Projects data updated:', projects);
    console.log('👥 Users data updated:', users);
    }, [projects, users]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchUsers();
    }
  }, [projects]);

  useEffect(() => {
    fetchTasks(pagination.current, pagination.pageSize);
  }, [filter]);

  const handleEdit = (record: any) => {
    console.log('🔍 Editing task record:', record);
    console.log('👤 Assignee info:', record.assignee);
    console.log('🆔 Assignee ID:', record.assigneeId);
    
    setEditingTask(record);
    const formValues = {
      ...record,
      startDate: record.startDate ? moment(record.startDate) : null,
      dueDate: record.dueDate ? moment(record.dueDate) : null,
      assignee: record.assignee?.id || record.assigneeId || undefined,
      projectId: record.projectId,
      category: record.category || 'OTHER'
    };
    
    console.log('📝 Setting form values:', formValues);
    form.setFieldsValue(formValues);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      message.success('Đã xóa công việc');
      fetchTasks();
    } catch (e) {
      message.error('Không thể xóa công việc');
    }
  };

  const handleDeleteClick = (task: any) => {
    setTaskToDelete(task);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setTaskToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      handleDelete(taskToDelete.id);
      setDeleteModalVisible(false);
      setTaskToDelete(null);
    }
  };

  const handleAdd = () => {
    // Check if user is authenticated
    if (!token) {
      message.error('Vui lòng đăng nhập để tạo nhiệm vụ!');
      return;
    }
    
    console.log('Opening task creation modal - authentication check passed');
    setEditingTask(null);
    form.resetFields();
    setModalOpen(true);
  };

  // ✅ Mobile refresh handler
  const handleMobileRefresh = () => {
    if (isMobile) {
      fetchTasks(pagination.current, pagination.pageSize, true);
    }
  };

  const handleOk = async () => {
    try {
      // Check if user is authenticated
      if (!token) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        return;
      }
      
      console.log('🔍 Starting task submission...');
      const values = await form.validateFields();
      console.log('📊 Form values:', values);
      
      if (!values.title) {
        message.error('Vui lòng nhập tên công việc!');
        return;
      }
      
      if (!values.status) {
        message.error('Vui lòng chọn trạng thái!');
        return;
      }

      if (!values.projectId) {
        message.error('Vui lòng chọn dự án!');
        return;
      }
      
      const submitData = {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority || 'MEDIUM',
        startDate: values.startDate ? values.startDate.format() : undefined,
        dueDate: values.dueDate ? values.dueDate.format() : undefined,
        assigneeId: values.assignee || undefined,
        projectId: values.projectId,
        category: values.category || 'OTHER'
      };

      console.log('📤 Submit data:', submitData);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      if (editingTask) {
        console.log('🔄 Updating task:', editingTask.id);
        await axiosInstance.put(`/tasks/${editingTask.id}`, submitData);
        message.success('Đã cập nhật công việc');
      } else {
        console.log('➕ Creating new task');
        const response = await axiosInstance.post('/tasks', submitData);
        console.log('✅ Task creation response:', response.data);
        message.success('Đã thêm công việc');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (e: any) {
      console.error('❌ Error in handleOk:', e);
      console.error('❌ Error response:', e?.response?.data);
      
      // Handle specific authentication errors
      if (e?.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        return;
      }
      
      // Handle validation errors
      if (e?.response?.status === 400) {
        const errorMessage = e?.response?.data?.error || 'Dữ liệu không hợp lệ';
        console.error('❌ Validation error:', errorMessage);
        message.error(errorMessage);
        return;
      }
      
      message.error(e?.response?.data?.error || e?.message || 'Có lỗi xảy ra khi tạo nhiệm vụ');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    
    const task = kanbanTasks[source.droppableId].find(t => t.id === draggableId);
    if (task) {
      try {
        await axiosInstance.put(`/tasks/${task.id}`, { ...task, status: destination.droppableId });
        message.success('Cập nhật trạng thái thành công!');
        fetchTasks();
      } catch (e) {
        message.error('Không thể cập nhật trạng thái');
      }
    }
  };

  const fetchHistory = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/tasks/${id}/history`);
      setHistoryList(res.data);
    } catch (e) {
      console.error('Lỗi fetchHistory:', e);
      message.error('Không thể tải lịch sử!');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  // Nâng cấp icon trạng thái
  const getStatusIcon = (status: string) => {
    let color = '#bfbfbf', icon = <ClockCircleOutlined style={{ fontSize: 20 }} />;
    switch (status) {
      case 'TODO': color = '#bfbfbf'; icon = <ClockCircleOutlined style={{ fontSize: 20, color: color }} />; break;
      case 'IN_PROGRESS': color = '#faad14'; icon = <ExclamationCircleOutlined style={{ fontSize: 20, color: color }} />; break;
      case 'REVIEW': color = '#1890ff'; icon = <ExclamationCircleOutlined style={{ fontSize: 20, color: color }} />; break;
      case 'COMPLETED': color = '#52c41a'; icon = <CheckCircleOutlined style={{ fontSize: 20, color: color }} />; break;
      default: break;
    }
    return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: color + '22', marginRight: 4 }}>{icon}</span>;
  };

  // Sắp xếp dự án theo mức độ triển khai
  const getSortedProjects = () => {
    if (!Array.isArray(projects)) {
      console.warn('Projects is not an array:', projects);
      return [];
    }
    
    const statusOrder = {
      'ACTIVE': 1,      // Đang triển khai
      'PLANNING': 2,    // Đang lên kế hoạch
      'ON_HOLD': 3,     // Đang tạm dừng
      'COMPLETED': 4,   // Hoàn thành
      'ARCHIVED': 5     // Lưu trữ
    };

    return projects
      .filter(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        return projectTasks.length > 0; // Chỉ hiển thị dự án có nhiệm vụ
      })
      .sort((a, b) => {
      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 999;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 999;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
        // Nếu cùng trạng thái, sắp xếp theo tên dự án
      return a.name.localeCompare(b.name);
    });
  };

  // Sắp xếp nhiệm vụ theo thứ tự ưu tiên giảm dần
  const getSortedTasksForProject = (projectId: string) => {
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return [];
    }
    
    const priorityOrder = {
      'URGENT': 1,
      'HIGH': 2,
      'MEDIUM': 3,
      'LOW': 4
    };

    return tasks
      .filter(task => task.projectId === projectId)
      .sort((a, b) => {
        // Sắp xếp theo priority trước
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 999;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 999;
        
        if (priorityA !== priorityB) {
      return priorityA - priorityB;
        }
        
        // Nếu cùng priority, sắp xếp theo dueDate
        if (a.dueDate && b.dueDate) {
          return moment(a.dueDate).diff(moment(b.dueDate));
        }
        
        // Nếu không có dueDate, sắp xếp theo tên
        return a.title.localeCompare(b.title);
    });
  };

  // Sửa getGanttTasks để tách thông tin xuống dòng và loại bỏ khỏi timeline
  const getGanttTasks = (): ExtendedGanttTask[] => {
    try {
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return [];
      }
      
    const ganttTasks: ExtendedGanttTask[] = [];
      const projectMap = new Map();
      
      // Group tasks by project
      tasks.forEach(task => {
        if (!task || !task.projectId) return;
        
        if (!projectMap.has(task.projectId)) {
          projectMap.set(task.projectId, {
          project: task.project,
          tasks: []
          });
        }
        
        projectMap.get(task.projectId).tasks.push(task);
      });
      
      // Create Gantt tasks
      projectMap.forEach((group, projectId) => {
        const { project, tasks: projectTasks } = group;
        
        if (!project || projectTasks.length === 0) return;
        
        // Calculate project dates
        let projectStart = new Date();
        let projectEnd = new Date();
        let hasValidDates = false;
        
        projectTasks.forEach((task: any) => {
          if (task.startDate) {
            const startDate = new Date(task.startDate);
            if (!hasValidDates || startDate < projectStart) {
              projectStart = startDate;
              hasValidDates = true;
            }
          }
          if (task.dueDate) {
            const endDate = new Date(task.dueDate);
            if (!hasValidDates || endDate > projectEnd) {
              projectEnd = endDate;
              hasValidDates = true;
            }
          }
        });
        
        if (!hasValidDates) {
          projectStart = new Date();
          projectEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        
        // Add project task
        ganttTasks.push({
          id: `project-${projectId}`,
          name: project.name || 'Unnamed Project',
          start: projectStart,
          end: projectEnd,
          type: 'project',
          progress: calculateProjectProgress(projectTasks),
          isDisabled: false,
          styles: {}
        });
        
        // Add child tasks
      projectTasks.forEach((task: any) => {
          if (!task.id || !task.title) return;
          
        ganttTasks.push({
            id: String(task.id),
            name: task.title,
            start: task.startDate ? new Date(task.startDate) : new Date(),
            end: task.dueDate ? new Date(task.dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
          type: 'task',
            progress: getTaskProgress(task.status),
          isDisabled: false,
            project: project.name,
            parent: `project-${projectId}`,
            styles: {}
        });
      });
    });

      return ganttTasks;
    } catch (error) {
      console.error('Error creating Gantt tasks:', error);
      return [];
    }
  };

  const columns = [
    {
      title: 'Mã nhiệm vụ',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Mã dự án',
      dataIndex: 'project',
      key: 'projectCode',
      width: 120,
      render: (_: any, record: any) => (
        <Tag color="green" style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {record.project?.code || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => (
        date ? (
          <Space>
            <CalendarOutlined />
            <span>{moment(date).format('DD/MM/YYYY')}</span>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        )
      )
    },
    {
      title: 'Phân loại',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">
          {categoryList.find(c => c.value === category)?.label || category || 'Khác'}
        </Tag>
      )
    },
    {
      title: 'Người thực hiện',
      dataIndex: ['assignee', 'name'],
      key: 'assignee',
      render: (text: string, record: any) => (
        text ? (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{text}</span>
          </Space>
        ) : (
          <Text type="secondary">Chưa phân công</Text>
        )
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={statusColors[status] as any} 
          text={statusList.find(s => s.value === status)?.label || status}
        />
      )
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>
          {priorityList.find(p => p.value === priority)?.label || priority}
        </Tag>
      )
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (
        date ? (
          <Space>
            <CalendarOutlined />
            <span>{moment(date).format('DD/MM/YYYY')}</span>
          </Space>
        ) : (
          <Text type="secondary">Không có hạn</Text>
        )
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="desktop-button-group">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tasks/${record.id}`)}
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
            icon={<HistoryOutlined />}
            onClick={() => fetchHistory(record.id)}
            className="desktop-icon-standard desktop-icon-history"
            title="Lịch sử"
          />
          <Button 
            size="small" 
            icon={<DeleteOutlined />}
            className="desktop-icon-standard desktop-icon-delete"
            title="Xóa"
            onClick={() => handleDeleteClick(record)}
          />
        </div>
      )
    },
    {
      title: 'Ghi chú',
      key: 'comments',
      render: (_: any, record: any) => (
        <Tooltip title="Trao đổi/ghi chú">
          <Badge count={record._count?.comments || 0} size="small">
            <Button
              shape="circle"
              icon={<MessageOutlined />}
              onClick={() => openCommentDrawer(record)}
              size="small"
            />
          </Badge>
        </Tooltip>
      )
    }
  ];

  // 1. Table cha chỉ hiển thị tên dự án
  const parentColumns = [
    {
      title: 'MÃ DỰ ÁN',
      dataIndex: 'project',
      key: 'projectCode',
      width: 120,
      render: (_: any, record: any) => (
        <Tag color="blue" style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {record.project.code || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'DỰ ÁN',
      dataIndex: 'project',
      key: 'project',
      render: (_: any, record: any) => (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          <Tag color="blue" style={{ fontSize: 15 }}>{record.project.name}</Tag>
        </span>
      )
    }
  ];

  // 2. Table con: không có cột dự án, cột tên công việc rộng hơn
  const childColumns = [
    {
      title: 'MÃ DỰ ÁN',
      dataIndex: 'project',
      key: 'projectCode',
      width: 120,
      render: (_: any, record: any) => (
        <Tag color="blue" style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {record.project.code || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      width: '28%',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 15 }}>{text}</div>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description.length > 80 
                ? `${record.description.substring(0, 80)}...` 
                : record.description}
            </Text>
          )}
        </div>
      )
    },
    ...columns.filter(col => col.key !== 'project' && col.key !== 'title' && col.key !== 'projectCode').map(col =>
      col.key === 'comments' ? {
        ...col,
        render: (_: any, record: any) => (
          <Tooltip title="Trao đổi/ghi chú">
            <Badge count={record._count?.comments || 0} size="small" style={record._count?.comments > 0 ? { backgroundColor: '#ff4d4f' } : {}}>
              <Button
                shape="circle"
                icon={<MessageOutlined />}
                onClick={() => openCommentDrawer(record)}
                size="small"
              />
            </Badge>
          </Tooltip>
        )
      } : col
    )
  ];

  // Helper functions for task status checking
  const isTaskOverdue = (task: any) => {
    return task.dueDate && moment(task.dueDate).isBefore(moment(), 'day') && task.status !== 'COMPLETED';
  };
  
  const isTaskWarning = (task: any) => {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    const dueDate = moment(task.dueDate);
    const now = moment();
    const daysUntilDue = dueDate.diff(now, 'days');
    return daysUntilDue <= 3 && daysUntilDue >= 0; // Include tasks due today (0 days)
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    review: tasks.filter(t => t.status === 'REVIEW').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => isTaskOverdue(t)).length,
    dueSoon: tasks.filter(t => isTaskWarning(t)).length
  };

  // Tạo taskStats cố định dựa trên tổng số lượng tasks (không bị ảnh hưởng bởi filter)
  const fixedTaskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    review: tasks.filter(t => t.status === 'REVIEW').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => isTaskOverdue(t)).length,
    dueSoon: tasks.filter(t => isTaskWarning(t)).length
  };

  // Nhóm tasks theo projectId với sắp xếp
  const groupedTasks = getSortedProjects().map(project => ({
    key: project.id,
    project,
    tasks: getSortedTasksForProject(project.id),
  })).filter(g => g.tasks.length > 0);

  // Hàm xuất PDF cho chế độ bảng
  const handleExportTable = () => {
    const doc = new jsPDF();
    const tableData = tasks.map((task, idx) => [
      idx + 1,
      task.title,
      task.project?.name || '',
      task.assignee?.name || '',
      task.status,
      task.priority,
      task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : ''
    ]);
    autoTable(doc, {
      head: [['#', 'Tên nhiệm vụ', 'Dự án', 'Người thực hiện', 'Trạng thái', 'Ưu tiên', 'Hạn hoàn thành']],
      body: tableData,
    });
    doc.save('tasks-report.pdf');
  };
  // Hàm xuất hình ảnh cho chế độ Gantt
  const handleExportGantt = async () => {
    const ganttEl = document.querySelector('.gantt-container');
    if (ganttEl) {
      const canvas = await html2canvas(ganttEl as HTMLElement);
      const link = document.createElement('a');
      link.download = 'tasks-gantt.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      message.error('Không tìm thấy biểu đồ Gantt để xuất!');
    }
  };

  const getStatusCount = (status: string) => {
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return 0;
    }
    if (status === 'all') return tasks.length;
    return tasks.filter(task => task.status === status).length;
  };

  const getFilteredTasks = () => {
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return [];
    }
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
                           task.description.toLowerCase().includes(filter.search.toLowerCase());
      const matchesStatus = filter.status === 'all' || task.status === filter.status;
      const matchesPriority = filter.priority === 'all' || task.priority === filter.priority;
      const matchesProject = filter.projectId === 'all' || task.projectId === filter.projectId;
      
      // Filter for overdue tasks
      const matchesOverdue = !filter.overdue || isTaskOverdue(task);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesOverdue;
    });
  };



  // Helper functions cho timeline
  const getTimelineColumns = () => {
    const columns = [];
    
    if (timelineViewMode === 'day') {
      let current = timelineStartDate.clone();
      while (current.isSameOrBefore(timelineEndDate)) {
        columns.push({
          date: current.clone(),
          label: current.format('DD'),
          subLabel: current.format('ddd'),
          width: 40,
          isWeekend: current.day() === 0 || current.day() === 6,
          isToday: current.isSame(moment(), 'day'),
          type: 'day'
        });
        current.add(1, 'day');
      }
    } else if (timelineViewMode === 'week') {
      let current = timelineStartDate.clone().startOf('isoWeek');
      while (current.isSameOrBefore(timelineEndDate)) {
        const weekEnd = current.clone().endOf('isoWeek');
        columns.push({
          date: current.clone(),
          label: `Tuần ${current.format('WW')}`,
          subLabel: `${current.format('DD/MM')} - ${weekEnd.format('DD/MM')}`,
          width: 140,
          isToday: moment().isBetween(current, weekEnd, 'day', '[]'),
          type: 'week'
        });
        current.add(1, 'week');
      }
    } else if (timelineViewMode === 'month') {
      let current = timelineStartDate.clone().startOf('month');
      while (current.isSameOrBefore(timelineEndDate)) {
        columns.push({
          date: current.clone(),
          label: current.format('MMMM'),
          subLabel: current.format('YYYY'),
          width: 200,
          isToday: current.isSame(moment(), 'month'),
          type: 'month'
        });
        current.add(1, 'month');
      }
    }
    
    return columns;
  };

  const calculateTaskPosition = (taskStart: Date, taskEnd: Date) => {
    const columns = getTimelineColumns();
    const start = moment(taskStart);
    const end = moment(taskEnd);
    
    let left = 0;
    let width = 0;
    let found = false;
    
    columns.forEach((col, index) => {
      const colStart = col.date;
      const colEnd = timelineViewMode === 'day' 
        ? col.date.clone().endOf('day')
        : timelineViewMode === 'week'
        ? col.date.clone().endOf('isoWeek')
        : col.date.clone().endOf('month');
      
      // Tính vị trí bắt đầu
      if (!found && start.isSameOrBefore(colEnd) && end.isSameOrAfter(colStart)) {
        if (timelineViewMode === 'day') {
          left = index * col.width;
        } else if (timelineViewMode === 'week') {
          const dayInWeek = start.diff(colStart, 'days');
          left = index * col.width + (dayInWeek / 7) * col.width;
        } else if (timelineViewMode === 'month') {
          const dayInMonth = start.date() - 1;
          const daysInMonth = colStart.daysInMonth();
          left = index * col.width + (dayInMonth / daysInMonth) * col.width;
        }
        found = true;
      }
      
      // Tính chiều rộng
      if (start.isSameOrBefore(colEnd) && end.isSameOrAfter(colStart)) {
        const overlapStart = moment.max(start, colStart);
        const overlapEnd = moment.min(end, colEnd);
        const overlapDays = overlapEnd.diff(overlapStart, 'days') + 1;
        
        if (timelineViewMode === 'day') {
          width += col.width;
        } else if (timelineViewMode === 'week') {
          width += (overlapDays / 7) * col.width;
        } else if (timelineViewMode === 'month') {
          const daysInMonth = colStart.daysInMonth();
          width += (overlapDays / daysInMonth) * col.width;
        }
      }
    });
    
    return { left, width: Math.max(width, 20) };
  };

  // Helper functions cho Gantt
  const generateDateColumns = () => {
    const dates = [];
    const startDate = moment().subtract(30, 'days');
    const endDate = moment().add(90, 'days');
    
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.clone());
      currentDate.add(1, 'day');
    }
    
    return dates;
  };

  const calculatePosition = (date: Date) => {
    const startDate = moment().subtract(30, 'days');
    const targetDate = moment(date);
    const daysDiff = targetDate.diff(startDate, 'days');
    return daysDiff * 30; // 30px per day
  };

  const calculateWidth = (startDate: Date, endDate: Date) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const daysDiff = end.diff(start, 'days') + 1;
    return daysDiff * 30; // 30px per day
  };

  const calculateProjectProgress = (tasks: any[]) => {
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    return tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  };

  const getTaskProgress = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 100;
      case 'IN_PROGRESS': return 50;
      case 'REVIEW': return 75;
      default: return 0;
    }
  };

  // New function for timeline table progress calculation
  const getTimelineTaskProgress = (task: any) => {
    const today = moment();
    const taskStart = moment(task.start);
    const taskEnd = moment(task.end);
    
    // If task end date is before today, consider it 100% completed
    if (taskEnd.isBefore(today, 'day')) {
      return 100;
    }
    
    // If task start date is after today, it hasn't started yet
    if (taskStart.isAfter(today, 'day')) {
      return 0;
    }
    
    // Calculate progress from start date to today
    const totalDuration = taskEnd.diff(taskStart, 'days');
    const elapsedDuration = today.diff(taskStart, 'days');
    
    if (totalDuration <= 0) {
      return task.status === 'COMPLETED' ? 100 : 0;
    }
    
    const calculatedProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
    
    // For completed tasks, return 100%
    if (task.status === 'COMPLETED') {
      return 100;
    }
    
    return Math.round(calculatedProgress);
  };

  // Hàm toggle thu/phóng dự án
  const toggleProjectCollapse = (projectId: string) => {
    const newCollapsed = new Set(collapsedProjects);
    if (newCollapsed.has(projectId)) {
      newCollapsed.delete(projectId);
    } else {
      newCollapsed.add(projectId);
    }
    setCollapsedProjects(newCollapsed);
  };

  // Hàm toggle thu/phóng dự án trong table view
  const toggleTableProjectExpand = (projectId: string) => {
    setExpandedRowKeys(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(key => key !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  // Hàm xuất hình ảnh Gantt Timeline
  const handleExportGanttImage = async () => {
    try {
      message.loading('Đang chuẩn bị xuất hình ảnh...', 0);
      
      const ganttElement = document.querySelector('.gantt-container');
      if (!ganttElement) {
        message.error('Không tìm thấy biểu đồ Gantt!');
        return;
      }
      
      const canvas = await html2canvas(ganttElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isDarkMode ? '#141414' : '#ffffff',
        width: ganttElement.scrollWidth,
        height: ganttElement.scrollHeight
      });
      
      // Tạo link download
      const link = document.createElement('a');
      link.download = `Gantt_Timeline_${moment().format('YYYYMMDD_HHmmss')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      message.destroy();
      message.success('Đã xuất hình ảnh thành công!');
    } catch (error) {
      console.error('Error exporting image:', error);
      message.destroy();
      message.error('Có lỗi xảy ra khi xuất hình ảnh!');
    }
  };

  // Hàm xuất Excel
  const handleExportExcel = () => {
    message.info('Tính năng xuất Excel đang được phát triển');
  };

  // Hàm xuất PDF Gantt Timeline
  const handleExportGanttPDF = async () => {
    try {
      message.loading('Đang chuẩn bị xuất PDF...', 0);
      
      // Lấy element của Gantt container
      const ganttElement = document.querySelector('.gantt-container');
      if (!ganttElement) {
        message.error('Không tìm thấy biểu đồ Gantt!');
        return;
      }
      
      // Tạo canvas từ HTML element
      const canvas = await html2canvas(ganttElement as HTMLElement, {
        scale: 2, // Tăng độ phân giải
        useCORS: true,
        logging: false,
        backgroundColor: isDarkMode ? '#141414' : '#ffffff'
      });
      
      // Tính toán kích thước cho PDF
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Tạo PDF
      const pdf = new jsPDF({
        orientation: imgHeight > 210 ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Thêm tiêu đề
      pdf.setFontSize(16);
      pdf.text('BIỂU ĐỒ GANTT - TIMELINE DỰ ÁN', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Ngày xuất: ${moment().format('DD/MM/YYYY HH:mm')}`, pdf.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
      // Thêm image của Gantt chart
      const imgData = canvas.toDataURL('image/png');
      
      // Nếu chiều cao lớn hơn 1 trang, chia thành nhiều trang
      if (imgHeight > 210) {
        let position = 0;
        let pageHeight = 210;
        let heightLeft = imgHeight;
        
        // Trang đầu tiên
        pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= (pageHeight - 30);
        position -= (pageHeight - 30);
        
        // Các trang tiếp theo
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
          heightLeft -= pageHeight;
          position -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight, '', 'FAST');
      }
      
      // Lưu file
      pdf.save(`Gantt_Timeline_${moment().format('YYYYMMDD_HHmmss')}.pdf`);
      message.destroy();
      message.success('Đã xuất PDF thành công!');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.destroy();
      message.error('Có lỗi xảy ra khi xuất PDF!');
    }
  };

  // Hàm xuất PDF với bảng dữ liệu chi tiết
  const handleExportDetailedPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Header
    doc.setFontSize(16);
    doc.text('BÁO CÁO CHI TIẾT NHIỆM VỤ DỰ ÁN', 148, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${moment().format('DD/MM/YYYY HH:mm')}`, 148, 22, { align: 'center' });
    
    // Thống kê tổng quan
    const ganttTasks = getGanttTasks();
    const stats = {
      totalProjects: ganttTasks.filter(t => t.type === 'project').length,
      totalTasks: ganttTasks.filter(t => t.type === 'task').length,
      completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
      inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      overdueTasks: tasks.filter(t => t.dueDate && moment(t.dueDate).isBefore(moment())).length
    };
    
    doc.setFontSize(12);
    doc.text('THỐNG KÊ TỔNG QUAN:', 14, 35);
    doc.setFontSize(10);
    doc.text(`• Tổng số dự án: ${stats.totalProjects}`, 20, 42);
    doc.text(`• Tổng số nhiệm vụ: ${stats.totalTasks}`, 20, 48);
    doc.text(`• Hoàn thành: ${stats.completedTasks}`, 80, 42);
    doc.text(`• Đang thực hiện: ${stats.inProgressTasks}`, 80, 48);
    doc.text(`• Quá hạn: ${stats.overdueTasks}`, 140, 42);
    
    // Chuẩn bị dữ liệu cho bảng
    const tableData: any[] = [];
    
    ganttTasks.forEach((task) => {
      if (task.type === 'project') {
        // Dòng dự án
        tableData.push([
          {
            content: task.name,
            styles: { 
              fontStyle: 'bold', 
              fillColor: [24, 144, 255],
              textColor: 255
            }
          },
          { content: '', styles: { fillColor: [24, 144, 255] } },
          { content: '', styles: { fillColor: [24, 144, 255] } },
          {
            content: moment(task.start).format('DD/MM/YYYY'),
            styles: { fillColor: [24, 144, 255], textColor: 255 }
          },
          {
            content: moment(task.end).format('DD/MM/YYYY'),
            styles: { fillColor: [24, 144, 255], textColor: 255 }
          },
          {
            content: `${task.progress}%`,
            styles: { fillColor: [24, 144, 255], textColor: 255 }
          },
          { content: '', styles: { fillColor: [24, 144, 255] } }
        ]);
        
        // Các task con
        const childTasks = ganttTasks.filter(t => t.parent === task.id);
        childTasks.forEach(childTask => {
          const originalTask = tasks.find(t => t.id === childTask.id);
          const daysLeft = moment(childTask.end).diff(moment(), 'days');
          const isOverdue = daysLeft < 0;
          
          tableData.push([
            `  → ${childTask.name}`,
            originalTask?.assignee?.name || 'Chưa phân công',
            getPriorityLabel(originalTask?.priority),
            moment(childTask.start).format('DD/MM/YYYY'),
            moment(childTask.end).format('DD/MM/YYYY'),
            `${childTask.progress}%`,
            {
              content: getStatusLabel(originalTask?.status),
              styles: {
                textColor: isOverdue ? [255, 0, 0] : [0, 0, 0]
              }
            }
          ]);
        });
      }
    });
    
    // Tạo bảng
    autoTable(doc, {
      head: [['Nhiệm vụ', 'Người thực hiện', 'Ưu tiên', 'Bắt đầu', 'Kết thúc', 'Tiến độ', 'Trạng thái']],
      body: tableData,
      startY: 55,
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [64, 64, 64],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 30 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 55 }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Trang ${i} / ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
    
    // Lưu file
    doc.save(`Chi_tiet_nhiem_vu_${moment().format('YYYYMMDD_HHmmss')}.pdf`);
    message.success('Đã xuất báo cáo chi tiết!');
  };

  // Helper function
  const getPriorityLabel = (priority: string) => {
    const item = priorityList.find(p => p.value === priority);
    return item ? item.label : priority;
  };

  // Hàm xuất PDF
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Tiêu đề
    doc.setFontSize(16);
    doc.text('BÁO CÁO DANH SÁCH NHIỆM VỤ', 148, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${moment().format('DD/MM/YYYY HH:mm')}`, 148, 22, { align: 'center' });
    
    // Chuẩn bị dữ liệu cho bảng
    const tableData: any[] = [];
    const ganttTasks = getGanttTasks();
    
    ganttTasks.forEach((task: ExtendedGanttTask) => {
      if (task.type === 'project') {
        // Thêm dòng dự án
        tableData.push([
          {
            content: task.name,
            styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
          },
          {
            content: '',
            styles: { fillColor: [240, 240, 240] }
          },
          {
            content: moment(task.start).format('DD/MM/YYYY'),
            styles: { fillColor: [240, 240, 240] }
          },
          {
            content: moment(task.end).format('DD/MM/YYYY'),
            styles: { fillColor: [240, 240, 240] }
          },
          {
            content: `${task.progress}%`,
            styles: { fillColor: [240, 240, 240] }
          },
          {
            content: '',
            styles: { fillColor: [240, 240, 240] }
          }
        ]);
        
        // Thêm các task con
        const childTasks = ganttTasks.filter((t: ExtendedGanttTask) => t.parent === task.id);
        childTasks.forEach((childTask: ExtendedGanttTask) => {
          const originalTask = tasks.find(t => t.id === childTask.id);
          tableData.push([
            `  ${childTask.name}`, // Thụt đầu dòng cho task con
            originalTask?.assignee?.name || 'Chưa phân công',
            moment(childTask.start).format('DD/MM/YYYY'),
            moment(childTask.end).format('DD/MM/YYYY'),
            `${childTask.progress}%`,
            getStatusLabel(originalTask?.status)
          ]);
        });
      }
    });
    
    // Tạo bảng
    autoTable(doc, {
      head: [['Tên nhiệm vụ', 'Người thực hiện', 'Ngày bắt đầu', 'Ngày kết thúc', 'Tiến độ', 'Trạng thái']],
      body: tableData,
      startY: 30,
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [24, 144, 255],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      margin: { top: 30 }
    });
    
    // Lưu file
    doc.save(`Bao_cao_nhiem_vu_${moment().format('YYYYMMDD_HHmmss')}.pdf`);
    message.success('Đã xuất báo cáo PDF thành công!');
  };

  // Helper function để lấy label trạng thái
  const getStatusLabel = (status: string) => {
    const statusItem = statusList.find(s => s.value === status);
    return statusItem ? statusItem.label : status;
  };

  // Helper function để generate month headers
  const generateMonthHeaders = () => {
    const months = [];
    const startDate = moment().subtract(30, 'days').startOf('month');
    const endDate = moment().add(90, 'days').endOf('month');
    
    let currentMonth = startDate.clone();
    while (currentMonth.isSameOrBefore(endDate)) {
      const daysInMonth = currentMonth.daysInMonth();
      const monthStart = currentMonth.clone().startOf('month');
      const monthEnd = currentMonth.clone().endOf('month');
      
      // Calculate visible days in this month
      let visibleDays = daysInMonth;
      if (monthStart.isBefore(moment().subtract(30, 'days'))) {
        visibleDays -= moment().subtract(30, 'days').diff(monthStart, 'days');
      }
      if (monthEnd.isAfter(moment().add(90, 'days'))) {
        visibleDays -= monthEnd.diff(moment().add(90, 'days'), 'days');
      }
      
      months.push({
        label: currentMonth.format('MMMM YYYY'),
        days: visibleDays
      });
      
      currentMonth.add(1, 'month');
    }
    
    return months;
  };

  // Helper functions cho popover content
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const renderTaskList = (tasks: any[], maxItems: number = 5) => {
    const displayTasks = tasks.slice(0, maxItems);
    const hasMore = tasks.length > maxItems;

    return (
      <div style={{ maxWidth: 300 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
          Danh sách nhiệm vụ ({tasks.length})
        </div>
        {displayTasks.map(task => (
          <div key={task.id} style={{ 
            padding: '4px 0', 
            borderBottom: '1px solid #f0f0f0',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold' }}>{task.title}</div>
            <div style={{ color: '#666' }}>
              Dự án: {task.project?.name || 'N/A'} | 
              Người thực hiện: {task.assignee?.name || 'Chưa phân công'}
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
            Và {tasks.length - maxItems} nhiệm vụ khác...
          </div>
        )}
      </div>
    );
  };

  const renderProjectList = (projects: any[], maxItems: number = 5) => {
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

  // Helper functions
  
  // Get days overdue
  const getDaysOverdue = (task: any) => {
    if (!isTaskOverdue(task)) return 0;
    return moment().diff(moment(task.dueDate), 'days');
  };
  
  // Get days until due for warning
  const getDaysUntilDue = (task: any) => {
    if (!task.dueDate || task.status === 'COMPLETED') return null;
    const dueDate = moment(task.dueDate);
    const now = moment();
    const daysUntilDue = dueDate.diff(now, 'days');
    return daysUntilDue > 0 ? daysUntilDue : null;
  };
  
  // Get overdue severity level
  const getOverdueSeverity = (task: any) => {
    const days = getDaysOverdue(task);
    if (days <= 3) return 'low';
    if (days <= 7) return 'medium';
    return 'high';
  };
  
  // Get warning severity level
  const getWarningSeverity = (task: any) => {
    const daysUntilDue = getDaysUntilDue(task);
    if (daysUntilDue === 1) return 'high';
    if (daysUntilDue === 2) return 'medium';
    return 'low';
  };
  
  // Get row style for overdue and warning tasks
  const getRowStyle = (task: any) => {
    if (isTaskOverdue(task)) {
      return {
        border: '2px solid #ff4d4f',
        borderRadius: '4px'
      };
    } else if (isTaskWarning(task)) {
      return {
        border: '2px solid #fa8c16',
        borderRadius: '4px'
      };
    }
    return {};
  };

  // Mobile Task Card Component
  const MobileTaskCard = ({ task }: { task: any }) => {
    const statusInfo = getStatusDisplay(task.status);
    const priorityInfo = getPriorityDisplay(task.priority);
    const assignee = task.assignee?.name || 'Chưa phân công';
    const isOverdue = isTaskOverdue(task);
    const isWarning = isTaskWarning(task);

    const actionMenu = (
      <Menu>
        <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => navigate(`/tasks/${task.id}`)}>
          Xem chi tiết
        </Menu.Item>
        {canEditTasks && (
          <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(task)}>
            Chỉnh sửa
          </Menu.Item>
        )}
        <Menu.Item key="comments" icon={<MessageOutlined />} onClick={() => openCommentDrawer(task)}>
          Bình luận
        </Menu.Item>
        <Menu.Item key="history" icon={<HistoryOutlined />} onClick={() => {
          setSelectedTaskForHistory(task);
          setHistoryDrawerOpen(true);
        }}>
          Lịch sử
        </Menu.Item>
        {(canEditTasks || canDeleteTasks) && <Menu.Divider />}
        {canDeleteTasks && (
          <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(task)}>
            Xóa
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <Card 
        className="mobile-task-card"
        style={{ 
          marginBottom: 8,
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderColor: isDarkMode ? '#303030' : '#f0f0f0',
          borderRadius: 8,
          boxShadow: isDarkMode ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${
            isOverdue ? '#ff4d4f' : 
            isWarning ? '#faad14' : 
            task.status === 'COMPLETED' ? '#52c41a' : '#1890ff'
          }`
        }}
        bodyStyle={{ padding: 12 }}
      >
        {/* Task Header with Tags */}
        <div className="task-header">
          <div className="task-tags">
            <Tag color="blue" style={{ fontSize: '9px', fontWeight: 'bold' }}>
              {task.project?.code || 'N/A'}
            </Tag>
            <Tag color={statusInfo.color} icon={statusInfo.icon} style={{ fontSize: '9px' }}>
              {statusInfo.label}
            </Tag>
            {isOverdue && (
              <Tag color="red" style={{ fontSize: '9px' }}>
                Quá hạn {getDaysOverdue(task)} ngày
              </Tag>
            )}
            {isWarning && !isOverdue && (
              <Tag color="orange" style={{ fontSize: '9px' }}>
                Cảnh báo {getDaysUntilDue(task)} ngày
              </Tag>
            )}
          </div>
          <Dropdown overlay={actionMenu} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
        
        {/* Task Title */}
        <div className="task-title">
          {task.title}
        </div>
        
        {/* Task Description */}
        <div className="task-description">
          {task.description}
        </div>
        
        {/* Task Assignee */}
        <div className="task-assignee">
          <Avatar size={20} style={{ backgroundColor: '#1890ff' }}>
            {(assignee || 'U').charAt(0)}
          </Avatar>
          <Text style={{ fontSize: 10, color: isDarkMode ? '#bbb' : '#666' }}>
            {assignee}
          </Text>
        </div>
        
        {/* Task Meta - Dates and Priority */}
        <div className="task-meta">
          <div className="task-dates">
            <CalendarOutlined style={{ marginRight: 2 }} />
            <span style={{ fontSize: '10px', color: isDarkMode ? '#bbb' : '#666' }}>
              {task.startDate ? moment(task.startDate).format('DD/MM/YYYY') : 'N/A'} - {task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : 'N/A'}
            </span>
          </div>
          <div className="task-tags-meta">
            {task.category && (
              <Tag color="cyan" style={{ fontSize: '8px', marginRight: 4 }}>
                {task.category}
              </Tag>
            )}
            <Tag color={priorityInfo.color} style={{ fontSize: '8px' }}>
              {priorityInfo.label}
            </Tag>
          </div>
        </div>
        
        {/* Task Progress */}
        <div className="task-progress">
          <Progress 
            percent={getTaskProgress(task.status)} 
            size="small" 
            strokeColor={isDarkMode ? '#1890ff' : '#1890ff'}
            trailColor={isDarkMode ? '#333' : '#f0f0f0'}
          />
        </div>
        
        {/* Task Actions - Optimized for mobile and tablet landscape */}
        <div className="task-actions">
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
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="mobile-icon-standard"
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#40a9ff' : '#1890ff'}`,
                backgroundColor: isDarkMode ? 'rgba(64, 169, 255, 0.1)' : 'rgba(24, 144, 255, 0.1)'
              }}
            />
            <Button 
              size="middle"
              icon={<EditOutlined style={{ color: isDarkMode ? '#52c41a' : '#389e0d' }} />}
              type="text"
              onClick={() => handleEdit(task)}
              className="mobile-icon-standard"
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#52c41a' : '#389e0d'}`,
                backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(56, 158, 13, 0.1)'
              }}
            />
            <Button 
              size="middle" 
              icon={<MessageOutlined style={{ color: isDarkMode ? '#faad14' : '#fa8c16' }} />} 
              type="text"
              onClick={() => openCommentDrawer(task)}
              className="mobile-icon-standard"
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#faad14' : '#fa8c16'}`,
                backgroundColor: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 140, 22, 0.1)'
              }}
            />
            <Button 
              size="middle" 
              icon={<DeleteOutlined style={{ color: isDarkMode ? '#ff7875' : '#ff4d4f' }} />} 
              type="text"
              className="mobile-icon-standard"
              onClick={() => handleDeleteClick(task)}
              style={{ 
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '24px' : '28px',
                padding: isMobile ? '3px' : '4px',
                border: `1px solid ${isDarkMode ? '#ff7875' : '#ff4d4f'}`,
                borderRadius: '6px',
                backgroundColor: isDarkMode ? 'rgba(255, 120, 117, 0.1)' : 'rgba(255, 77, 79, 0.1)'
              }}
            />
          </div>
        </div>
      </Card>
    );
  };

  // Helper functions for mobile task card
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xử lý', color: 'blue', icon: <ClockCircleOutlined /> };
      case 'IN_PROGRESS':
        return { label: 'Đang thực hiện', color: 'orange', icon: <ExclamationCircleOutlined /> };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: 'green', icon: <CheckCircleOutlined /> };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> };
      default:
        return { label: 'Không xác định', color: 'default', icon: <ExclamationCircleOutlined /> };
    }
  };

  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return { label: 'Thấp', color: 'blue' };
      case 'MEDIUM':
        return { label: 'Trung bình', color: 'orange' };
      case 'HIGH':
        return { label: 'Cao', color: 'red' };
      default:
        return { label: 'Không xác định', color: 'default' };
    }
  };

  // Hàm tạo cột cho tablet landscape
  const getTabletLandscapeColumns = () => {
    return [
      {
        title: 'Nhiệm vụ',
        dataIndex: 'title',
        key: 'title',
        width: '70%',
        render: (text: string, record: any) => {
          const isOverdue = isTaskOverdue(record);
          const isWarning = isTaskWarning(record);
          const project = projects.find(p => p.id === record.projectId);
          const assignee = users.find(u => u.id === record.assigneeId);
          
          return (
            <div className="tablet-task-info">
              {/* Dòng 1: Mã nhiệm vụ, trạng thái, mức độ ưu tiên, cảnh báo quá hạn */}
              <div className="tablet-task-row-1">
                <Tag color="blue" style={{ fontSize: '10px' }}>
                  {record.code || 'N/A'}
                </Tag>
                <Tag color={getStatusDisplay(record.status).color}>
                  {getStatusDisplay(record.status).label}
                </Tag>
                <Tag color={getPriorityDisplay(record.priority).color}>
                  {getPriorityDisplay(record.priority).label}
                </Tag>
                {isOverdue && (
                  <Tag 
                    color="red" 
                    style={{ 
                      fontWeight: 'bold',
                      animation: 'blink 1.5s infinite'
                    }}
                  >
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    Quá hạn {getDaysOverdue(record)} ngày
                  </Tag>
                )}
                {!isOverdue && isWarning && (
                  <Tag 
                    color="orange" 
                    style={{ 
                      fontWeight: 'bold',
                      animation: 'blink-warning 2s infinite'
                    }}
                  >
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    Còn {getDaysUntilDue(record)} ngày
                  </Tag>
                )}
              </div>
              
              {/* Dòng 2: Tên nhiệm vụ (có icon cảnh báo khi quá hạn) */}
              <div className="tablet-task-row-2">
                <strong>{record.title || 'Không có tên'}</strong>
                {isOverdue && (
                  <ExclamationCircleOutlined className="tablet-project-warning" />
                )}
              </div>
              
              {/* Dòng 3: Tên dự án */}
              <div className="tablet-task-row-3">
                {project && (
                  <>
                    <FolderOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                    {project.name}
                  </>
                )}
              </div>
              
              {/* Dòng 4: Mô tả */}
              <div className="tablet-task-row-4">
                {record.description || 'Không có mô tả'}
              </div>
              
              {/* Dòng 5: Ngày bắt đầu - ngày kết thúc - người thực hiện */}
              <div className="tablet-task-row-5">
                <span>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {record.startDate ? moment(record.startDate).format('DD/MM/YYYY') : 'Chưa có'}
                </span>
                <span>-</span>
                <span>
                  {record.dueDate ? moment(record.dueDate).format('DD/MM/YYYY') : 'Chưa có'}
                </span>
                <span>-</span>
                <span>
                  <UserOutlined style={{ marginRight: 4 }} />
                  {assignee ? assignee.name : 'Chưa phân công'}
                </span>
              </div>
            </div>
          );
        }
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: '30%',
        render: (_: any, record: any) => (
          <div className="tablet-actions-container">
            {/* Cột 1: 3 nút chính */}
            <div className="tablet-actions-column">
              <Tooltip title="Xem chi tiết" placement="top">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/tasks/${record.id}`)}
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
              
              <Tooltip title="Ghi chú" placement="top">
                <Button
                  type="text"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => openCommentDrawer(record)}
                  className="tablet-icon-standard tablet-icon-comment"
                />
              </Tooltip>
            </div>
            
            {/* Cột 2: 3 nút phụ */}
            <div className="tablet-actions-column">
              <Tooltip title="Lịch sử" placement="top">
                <Button
                  type="text"
                  size="small"
                  icon={<HistoryOutlined />}
                  onClick={() => {
                    setSelectedTaskForHistory(record);
                    fetchHistory(record.id);
                    setHistoryDrawerOpen(true);
                  }}
                  className="tablet-icon-standard tablet-icon-history"
                />
              </Tooltip>
              
              <Tooltip title="Xuất báo cáo" placement="top">
                <Button
                  type="text"
                  size="small"
                  icon={<ExportOutlined />}
                  onClick={() => handleExportTable()}
                  className="tablet-icon-standard tablet-icon-export"
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
        )
      }
    ];
  };

  return (
    <div className="tasks-container" style={{ padding: '24px' }}>
      {/* Permission check for viewing tasks */}
      {!canViewTasks ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px 20px',
          background: isDarkMode ? '#1f1f1f' : '#f5f5f5',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <Title level={4} style={{ color: isDarkMode ? '#fff' : '#333' }}>
            Không có quyền truy cập
          </Title>
          <Text style={{ color: isDarkMode ? '#bbb' : '#666' }}>
            Bạn không có quyền xem danh sách nhiệm vụ. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </Text>
        </div>
      ) : (
      <style>{`
        /* Enhanced Overdue Task Styling */
        .overdue-task-row {
          border: 3px solid #ff4d4f !important;
          border-radius: 8px !important;
          background: linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 77, 79, 0.1) 100%) !important;
          box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2) !important;
          margin: 4px 0 !important;
          transition: all 0.3s ease !important;
        }
        
        .overdue-task-row:hover {
          border-color: #ff7875 !important;
          box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3) !important;
          transform: translateY(-1px) !important;
        }
        
        .overdue-project-row {
          border: 2px solid #fa8c16 !important;
          border-radius: 6px !important;
          background: linear-gradient(135deg, rgba(250, 140, 22, 0.05) 0%, rgba(250, 140, 22, 0.1) 100%) !important;
          box-shadow: 0 2px 6px rgba(250, 140, 22, 0.15) !important;
        }
        
        .overdue-project-row:hover {
          border-color: #ffa940 !important;
          box-shadow: 0 3px 10px rgba(250, 140, 22, 0.25) !important;
        }
        
        /* Table cell styling for overdue rows */
        .ant-table-tbody > tr.overdue-task-row > td {
          border-bottom: 1px solid #f0f0f0 !important;
          background: transparent !important;
        }
        
        .ant-table-tbody > tr.overdue-project-row > td {
          border-bottom: 1px solid #f0f0f0 !important;
          background: transparent !important;
        }
        
        /* Severity-based styling */
        .overdue-severity-high {
          border: 3px solid #ff4d4f !important;
          border-radius: 8px !important;
          background: linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.15) 100%) !important;
          box-shadow: 0 3px 10px rgba(255, 77, 79, 0.25) !important;
          animation: pulse-high 2s infinite !important;
        }
        
        .overdue-severity-medium {
          border: 2px solid #fa8c16 !important;
          border-radius: 6px !important;
          background: linear-gradient(135deg, rgba(250, 140, 22, 0.06) 0%, rgba(250, 140, 22, 0.12) 100%) !important;
          box-shadow: 0 2px 8px rgba(250, 140, 22, 0.2) !important;
          animation: pulse-medium 3s infinite !important;
        }
        
        .overdue-severity-low {
          border: 2px solid #faad14 !important;
          border-radius: 6px !important;
          background: linear-gradient(135deg, rgba(250, 173, 20, 0.05) 0%, rgba(250, 173, 20, 0.1) 100%) !important;
          box-shadow: 0 2px 6px rgba(250, 173, 20, 0.15) !important;
        }
        
        /* Pulse animations for different severity levels */
        @keyframes pulse-high {
          0%, 100% { box-shadow: 0 3px 10px rgba(255, 77, 79, 0.25); }
          50% { box-shadow: 0 5px 15px rgba(255, 77, 79, 0.4); }
        }
        
        @keyframes pulse-medium {
          0%, 100% { box-shadow: 0 2px 8px rgba(250, 140, 22, 0.2); }
          50% { box-shadow: 0 4px 12px rgba(250, 140, 22, 0.3); }
        }
        
        /* Enhanced hover effects */
        .overdue-task-row:hover .overdue-severity-high {
          animation: none !important;
          box-shadow: 0 6px 20px rgba(255, 77, 79, 0.4) !important;
        }
        
        .overdue-task-row:hover .overdue-severity-medium {
          animation: none !important;
          box-shadow: 0 5px 15px rgba(250, 140, 22, 0.35) !important;
        }
        
        /* Warning icon for overdue tasks */
        .overdue-warning-icon {
          color: #ff4d4f;
          margin-right: 8px;
          animation: blink 1.5s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
        
        /* Overdue stats card styling */
        .overdue-stats-card {
          animation: pulse-overdue 2s infinite !important;
        }
        
        .overdue-stats-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(255, 77, 79, 0.4) !important;
          animation: none !important;
        }
        
        @keyframes pulse-overdue {
          0%, 100% { 
            box-shadow: 0 3px 10px rgba(255, 77, 79, 0.25);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 5px 15px rgba(255, 77, 79, 0.4);
            transform: scale(1.02);
          }
        }

        /* Warning Task Styling (due within 3 days) */
        .warning-task-row {
          border: 3px solid #faad14 !important;
          border-radius: 8px !important;
          background: linear-gradient(135deg, rgba(250, 173, 20, 0.05) 0%, rgba(250, 173, 20, 0.1) 100%) !important;
          box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2) !important;
          margin: 4px 0 !important;
          transition: all 0.3s ease !important;
        }
        
        .warning-task-row:hover {
          border-color: #ffc53d !important;
          box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3) !important;
          transform: translateY(-1px) !important;
        }
        
        /* Warning severity-based styling */
        .warning-severity-high {
          border: 3px solid #fa8c16 !important;
          border-radius: 8px !important;
          background: linear-gradient(135deg, rgba(250, 140, 22, 0.08) 0%, rgba(250, 140, 22, 0.15) 100%) !important;
          box-shadow: 0 3px 10px rgba(250, 140, 22, 0.25) !important;
          animation: pulse-warning-high 2s infinite !important;
        }
        
        .warning-severity-medium {
          border: 2px solid #faad14 !important;
          border-radius: 6px !important;
          background: linear-gradient(135deg, rgba(250, 173, 20, 0.06) 0%, rgba(250, 173, 20, 0.12) 100%) !important;
          box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2) !important;
          animation: pulse-warning-medium 3s infinite !important;
        }
        
        .warning-severity-low {
          border: 2px solid #bae637 !important;
          border-radius: 6px !important;
          background: linear-gradient(135deg, rgba(186, 230, 55, 0.05) 0%, rgba(186, 230, 55, 0.1) 100%) !important;
          box-shadow: 0 2px 6px rgba(186, 230, 55, 0.15) !important;
        }
        
        /* Warning pulse animations */
        @keyframes pulse-warning-high {
          0%, 100% { box-shadow: 0 3px 10px rgba(250, 140, 22, 0.25); }
          50% { box-shadow: 0 5px 15px rgba(250, 140, 22, 0.4); }
        }
        
        @keyframes pulse-warning-medium {
          0%, 100% { box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2); }
          50% { box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3); }
        }
        
        /* Warning icon styling */
        .warning-icon {
          color: #faad14;
          margin-right: 8px;
          animation: blink-warning 2s infinite;
        }
        
        @keyframes blink-warning {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.6; }
        }
        
        /* Warning stats card styling */
        .warning-stats-card {
          animation: pulse-warning 2s infinite !important;
        }
        
        .warning-stats-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(250, 173, 20, 0.4) !important;
          animation: none !important;
        }
        
        @keyframes pulse-warning {
          0%, 100% { 
            box-shadow: 0 3px 10px rgba(250, 173, 20, 0.25);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 5px 15px rgba(250, 173, 20, 0.4);
            transform: scale(1.02);
          }
        }
            `}</style>
      )}
      {!canViewTasks ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px 20px',
          background: isDarkMode ? '#1f1f1f' : '#f5f5f5',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <Title level={4} style={{ color: isDarkMode ? '#fff' : '#333' }}>
            Không có quyền truy cập
          </Title>
          <Text style={{ color: isDarkMode ? '#bbb' : '#666' }}>
            Bạn không có quyền xem danh sách nhiệm vụ. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </Text>
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          <Row gutter={16} align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý công việc</Title>
              {/* Warning Icons in Title Line */}
              {fixedTaskStats.overdue > 0 && (
                <Tooltip title={`${fixedTaskStats.overdue} nhiệm vụ quá hạn cần xử lý ngay`}>
                  <Badge count={fixedTaskStats.overdue} size="small">
                    <ExclamationCircleOutlined 
                      style={{ 
                        color: '#ff4d4f', 
                        fontSize: '20px',
                        animation: 'blink 1.5s infinite',
                        cursor: 'pointer'
                      }} 
                      onClick={() => {
                        setFilter(prev => ({ ...prev, overdue: true }));
                        setPagination(prev => ({ ...prev, current: 1 }));
                      }}
                    />
                  </Badge>
                </Tooltip>
              )}
              {fixedTaskStats.dueSoon > 0 && (
                <Tooltip title={`${fixedTaskStats.dueSoon} nhiệm vụ sắp đến hạn (trong vòng 3 ngày)`}>
                  <Badge count={fixedTaskStats.dueSoon} size="small">
                    <ExclamationCircleOutlined 
                      style={{ 
                        color: '#faad14', 
                        fontSize: '20px',
                        animation: 'blink-warning 2s infinite',
                        cursor: 'pointer'
                      }} 
                      onClick={() => {
                        setFilter(prev => ({ ...prev, overdue: false }));
                        setPagination(prev => ({ ...prev, current: 1 }));
                      }}
                    />
                  </Badge>
                </Tooltip>
              )}
            </div>
          </Col>
          {/* Compact action buttons for mobile and tablet */}
          {canCreateTasks && (
            <Col>
              {isMobile ? (
                <Button type="primary" icon={<PlusOutlined />} size="small" onClick={handleAdd}>
                  +
                </Button>
              ) : isTabletLandscape ? (
                <Button type="primary" icon={<PlusOutlined />} size="middle" onClick={handleAdd}>
                  Thêm
                </Button>
              ) : (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  Thêm công việc
                </Button>
              )}
            </Col>
          )}
        </Row>

        {/* Statistics Cards - Optimized for Mobile and Tablet */}
        <div className="tasks-container">
          <div className="dashboard-stats-row">
            <Row gutter={[8, 8]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Popover 
                content={renderTaskList(tasks, 10)}
                title="Tất cả nhiệm vụ"
                trigger="hover"
                placement="bottom"
              >
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setFilter(prev => ({ ...prev, status: 'all' }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                >
                  <ResponsiveStatCard
                    title="Tổng cộng" 
                    value={fixedTaskStats.total} 
                    icon={<FileTextOutlined />}
                    function="tasks"
                  />
                </div>
              </Popover>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Popover 
                content={renderTaskList(getTasksByStatus('TODO'), 5)}
                title="Nhiệm vụ chờ thực hiện"
                trigger="hover"
                placement="bottom"
              >
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setFilter(prev => ({ ...prev, status: 'TODO' }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                >
                  <ResponsiveStatCard
                    title="Chờ thực hiện" 
                    value={fixedTaskStats.todo} 
                    icon={<ClockCircleOutlined />}
                    function="tasks"
                  />
                </div>
              </Popover>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Popover 
                content={renderTaskList(getTasksByStatus('IN_PROGRESS'), 5)}
                title="Nhiệm vụ đang thực hiện"
                trigger="hover"
                placement="bottom"
              >
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setFilter(prev => ({ ...prev, status: 'IN_PROGRESS' }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                >
                  <ResponsiveStatCard
                    title="Đang thực hiện" 
                    value={fixedTaskStats.inProgress} 
                    icon={<SyncOutlined spin />}
                    function="tasks"
                  />
                </div>
              </Popover>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Popover 
                content={renderTaskList(getTasksByStatus('REVIEW'), 5)}
                title="Nhiệm vụ đang xem xét"
                trigger="hover"
                placement="bottom"
              >
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setFilter(prev => ({ ...prev, status: 'REVIEW' }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                >
                  <ResponsiveStatCard
                    title="Đang xem xét" 
                    value={fixedTaskStats.review} 
                    icon={<EyeOutlined />}
                    function="tasks"
                  />
                </div>
              </Popover>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Popover 
                content={renderTaskList(getTasksByStatus('COMPLETED'), 5)}
                title="Nhiệm vụ hoàn thành"
                trigger="hover"
                placement="bottom"
              >
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setFilter(prev => ({ ...prev, status: 'COMPLETED' }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                >
                  <ResponsiveStatCard
                    title="Hoàn thành" 
                    value={fixedTaskStats.completed} 
                    icon={<CheckCircleOutlined />}
                    function="tasks"
                  />
                </div>
              </Popover>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Popover 
                content={renderTaskList(tasks.filter(t => isTaskOverdue(t)), 5)}
                title="Nhiệm vụ quá hạn"
                trigger="hover"
                placement="bottom"
              >
                <div 
                  className={fixedTaskStats.overdue > 0 ? 'overdue-stats-card' : ''}
                  style={{ 
                    cursor: 'pointer',
                    border: fixedTaskStats.overdue > 0 ? '3px solid #ff4d4f' : undefined,
                    borderRadius: fixedTaskStats.overdue > 0 ? '8px' : undefined,
                    boxShadow: fixedTaskStats.overdue > 0 ? '0 3px 10px rgba(255, 77, 79, 0.25)' : undefined,
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setFilter(prev => ({ ...prev, overdue: true }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                >
                  <ResponsiveStatCard
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>Quá hạn</span>
                        {fixedTaskStats.overdue > 0 && (
                          <ExclamationCircleOutlined 
                            style={{ 
                              color: '#ff4d4f',
                              animation: 'blink 1.5s infinite'
                            }} 
                          />
                        )}
                      </div>
                    }
                    value={fixedTaskStats.overdue} 
                    icon={fixedTaskStats.overdue > 0 ? <ExclamationCircleOutlined /> : undefined}
                    function="tasks"
                    valueStyle={{ 
                      fontWeight: 'bold',
                      fontSize: fixedTaskStats.overdue > 0 ? '24px' : '20px'
                    }}
                  />
                </div>
              </Popover>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Popover 
                content={renderTaskList(tasks.filter(t => isTaskWarning(t)), 5)}
                title="Nhiệm vụ sắp đến hạn"
                trigger="hover"
                placement="bottom"
              >
                <div 
                  className={fixedTaskStats.dueSoon > 0 ? 'warning-stats-card' : ''}
                  style={{ 
                    cursor: 'pointer',
                    border: fixedTaskStats.dueSoon > 0 ? '3px solid #faad14' : undefined,
                  borderRadius: fixedTaskStats.dueSoon > 0 ? '8px' : undefined,
                  boxShadow: fixedTaskStats.dueSoon > 0 ? '0 3px 10px rgba(250, 173, 20, 0.25)' : undefined,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  // Filter to show tasks due soon
                  setFilter(prev => ({ ...prev, overdue: false }));
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
              >
                <ResponsiveStatCard
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Sắp đến hạn</span>
                      {fixedTaskStats.dueSoon > 0 && (
                        <ExclamationCircleOutlined 
                          style={{ 
                            color: '#faad14',
                            animation: 'blink-warning 2s infinite'
                          }} 
                        />
                      )}
                    </div>
                  }
                  value={fixedTaskStats.dueSoon} 
                  icon={fixedTaskStats.dueSoon > 0 ? <ExclamationCircleOutlined /> : undefined}
                  function="tasks"
                  valueStyle={{ 
                    fontWeight: 'bold',
                    fontSize: fixedTaskStats.dueSoon > 0 ? '24px' : '20px'
                  }}
                />
              </div>
            </Popover>
          </Col>
          </Row>
        </div>
      </div>

        {/* Enhanced Filters - Optimized for Mobile and Tablet */}
        {isMobile ? (
          <MobileFilters
            searchValue={filter.search}
            statusValue={filter.status}
            priorityValue={filter.priority}
            assigneeValue={filter.assignee}
            projectValue={filter.projectId}
            statusOptions={statusList}
            priorityOptions={priorityList}
            assigneeOptions={users.map(user => ({ value: user.id, label: `${user.name} (${user.email})` }))}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onSearchChange={(value) => handleFilterChange('search', value)}
            onStatusChange={(value) => handleFilterChange('status', value)}
            onPriorityChange={(value) => handleFilterChange('priority', value)}
            onAssigneeChange={(value) => handleFilterChange('assignee', value)}
            onProjectChange={(value) => handleFilterChange('projectId', value)}
            onReset={() => {
              setFilter({ search: '', status: 'all', priority: 'all', assignee: 'all', projectId: 'all', overdue: false });
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            title="Bộ lọc nhiệm vụ"
            isDarkMode={isDarkMode}
            pageType="tasks"
          />
        ) : (
          <ResponsiveCollapsibleFilters
            searchValue={filter.search}
            searchPlaceholder="Tìm kiếm nhiệm vụ..."
            onSearchChange={(value) => handleFilterChange('search', value)}
            statusValue={filter.status}
            statusOptions={statusList}
            onStatusChange={(value) => handleFilterChange('status', value)}
            priorityValue={filter.priority}
            priorityOptions={priorityList}
            onPriorityChange={(value) => handleFilterChange('priority', value)}
            projectValue={filter.projectId}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onProjectChange={(value) => handleFilterChange('projectId', value)}
            assigneeValue={filter.assignee}
            assigneeOptions={users.map(user => ({ value: user.id, label: `${user.name} (${user.email})` }))}
            onAssigneeChange={(value) => handleFilterChange('assignee', value)}
            overdueValue={filter.overdue}
            onOverdueChange={(checked) => handleFilterChange('overdue', checked)}
            onReset={() => {
              setFilter({ search: '', status: 'all', priority: 'all', assignee: 'all', projectId: 'all', overdue: false });
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            title="Bộ lọc nhiệm vụ"
            isMobile={isMobile}
            isTabletLandscape={isTabletLandscape}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Task Table */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} className={isMobile ? "mobile-view-selector-row" : ""}>
          <Col span={isMobile ? 24 : isTabletLandscape ? 24 : 12} className={isMobile ? "mobile-view-selector-col" : ""}>
            <Card className={isMobile ? "mobile-view-selector-card" : ""}>
              <Row gutter={16} align="middle" justify={isMobile ? "end" : "start"}>
                {!isMobile && (
                  <Col>
                    <Text strong>Chế độ xem:</Text>
                  </Col>
                )}
                <Col>
                  <Radio.Group 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)}
                    buttonStyle="solid"
                    size={isMobile ? "small" : "middle"}
                  >
                    <Radio.Button value="table">
                      <TableOutlined /> {!isMobile && 'Bảng'}
                    </Radio.Button>
                    <Radio.Button value="timeline">
                      <BarChartOutlined /> {!isMobile && 'Gantt Timeline'}
                    </Radio.Button>
                  </Radio.Group>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Timeline Controls */}
        {viewMode === 'timeline' && (
          <Card className="timeline-controls-card" style={{ marginBottom: 16 }}>
            {isMobile ? (
              // Mobile Timeline Controls - Optimized layout
              <div style={{ padding: '8px 0' }}>
                {/* Single row with view mode on left and actions on right */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'nowrap'
                }}>
                  {/* Left side - View mode selector */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Radio.Group 
                      value={timelineViewMode} 
                      onChange={(e) => setTimelineViewMode(e.target.value)}
                      buttonStyle="solid"
                      size="small"
                    >
                      <Radio.Button value="day">Ngày</Radio.Button>
                      <Radio.Button value="week">Tuần</Radio.Button>
                      <Radio.Button value="month">Tháng</Radio.Button>
                    </Radio.Group>
                  </div>
                  
                  {/* Right side - Icons only */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Button 
                      size="small"
                      icon={<FullscreenOutlined />}
                      type="text"
                      style={{ padding: '4px' }}
                      onClick={() => {
                        const element = document.querySelector('.gantt-container');
                        if (element?.requestFullscreen) {
                          element.requestFullscreen();
                        }
                      }}
                    />
                    
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'export-image',
                            label: 'Xuất hình ảnh (PNG)',
                            icon: <FileImageOutlined />,
                            onClick: handleExportGanttImage
                          },
                          {
                            key: 'export-pdf',
                            label: 'Xuất PDF Timeline',
                            icon: <FilePdfOutlined />,
                            onClick: handleExportGanttPDF
                          },
                          {
                            key: 'export-detailed',
                            label: 'Xuất PDF chi tiết',
                            icon: <FilePdfOutlined />,
                            onClick: handleExportDetailedPDF
                          },
                          {
                            key: 'export-excel',
                            label: 'Xuất Excel',
                            icon: <FileExcelOutlined />,
                            onClick: handleExportExcel
                          }
                        ]
                      }}
                    >
                      <Button 
                        size="small" 
                        icon={<DownloadOutlined />} 
                        type="text"
                        style={{ padding: '4px' }}
                      />
                    </Dropdown>
                  </div>
                </div>
              </div>
            ) : !isTabletLandscape ? (
              // Desktop Timeline Controls
              <Row gutter={16} align="middle" justify="space-between">
                <Col span={8}>
                  <Space>
                    <Button 
                      icon={<LeftOutlined />} 
                      onClick={() => {
                        setTimelineStartDate(prev => prev.clone().subtract(30, 'days'));
                        setTimelineEndDate(prev => prev.clone().subtract(30, 'days'));
                      }}
                    >
                      Trước
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        setTimelineStartDate(moment().subtract(30, 'days'));
                        setTimelineEndDate(moment().add(90, 'days'));
                      }}
                    >
                      Hôm nay
                    </Button>
                    
                    <Button 
                      icon={<RightOutlined />} 
                      onClick={() => {
                        setTimelineStartDate(prev => prev.clone().add(30, 'days'));
                        setTimelineEndDate(prev => prev.clone().add(30, 'days'));
                      }}
                    >
                      Sau
                    </Button>
                  </Space>
                </Col>
                
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Space>
                    <Text strong>Chế độ xem:</Text>
                    <Radio.Group 
                      value={timelineViewMode} 
                      onChange={(e) => setTimelineViewMode(e.target.value)}
                      buttonStyle="solid"
                      size="small"
                    >
                      <Radio.Button value="day">Ngày</Radio.Button>
                      <Radio.Button value="week">Tuần</Radio.Button>
                      <Radio.Button value="month">Tháng</Radio.Button>
                    </Radio.Group>
                  </Space>
                </Col>
                
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Space>
                    <Text>Zoom:</Text>
                    <Slider
                      min={50}
                      max={200}
                      value={zoomLevel}
                      onChange={setZoomLevel}
                      style={{ width: 100 }}
                    />
                    <Text>{zoomLevel}%</Text>
                    
                    <Button 
                      icon={<FullscreenOutlined />}
                      onClick={() => {
                        const element = document.querySelector('.gantt-container');
                        if (element?.requestFullscreen) {
                          element.requestFullscreen();
                        }
                      }}
                    >
                      Toàn màn hình
                    </Button>
                    
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'export-image',
                            label: 'Xuất hình ảnh (PNG)',
                            icon: <FileImageOutlined />,
                            onClick: handleExportGanttImage
                          },
                          {
                            key: 'export-pdf',
                            label: 'Xuất PDF Timeline',
                            icon: <FilePdfOutlined />,
                            onClick: handleExportGanttPDF
                          },
                          {
                            key: 'export-detailed',
                            label: 'Xuất PDF chi tiết',
                            icon: <FilePdfOutlined />,
                            onClick: handleExportDetailedPDF
                          },
                          {
                            key: 'export-excel',
                            label: 'Xuất Excel',
                            icon: <FileExcelOutlined />,
                            onClick: handleExportExcel
                          }
                        ]
                      }}
                    >
                      <Button icon={<DownloadOutlined />}>
                        Xuất báo cáo <DownOutlined />
                      </Button>
                    </Dropdown>
                  </Space>
                </Col>
              </Row>
            ) : (
              // Tablet Landscape Timeline Controls
              <Row gutter={16} align="middle" justify="space-between" className="tablet-landscape-timeline-controls">
                <Col span={12}>
                  <Space>
                    <Text strong>Chế độ xem:</Text>
                    <Radio.Group 
                      value={timelineViewMode} 
                      onChange={(e) => setTimelineViewMode(e.target.value)}
                      buttonStyle="solid"
                      size="small"
                    >
                      <Radio.Button value="day">Ngày</Radio.Button>
                      <Radio.Button value="week">Tuần</Radio.Button>
                      <Radio.Button value="month">Tháng</Radio.Button>
                    </Radio.Group>
                  </Space>
                </Col>
                
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Space>
                    <Button 
                      icon={<FullscreenOutlined />}
                      onClick={() => {
                        const element = document.querySelector('.gantt-container');
                        if (element?.requestFullscreen) {
                          element.requestFullscreen();
                        }
                      }}
                    >
                      Toàn màn hình
                    </Button>
                    
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'export-image',
                            label: 'Xuất hình ảnh (PNG)',
                            icon: <FileImageOutlined />,
                            onClick: handleExportGanttImage
                          },
                          {
                            key: 'export-pdf',
                            label: 'Xuất PDF Timeline',
                            icon: <FilePdfOutlined />,
                            onClick: handleExportGanttPDF
                          },
                          {
                            key: 'export-detailed',
                            label: 'Xuất PDF chi tiết',
                            icon: <FilePdfOutlined />,
                            onClick: handleExportDetailedPDF
                          },
                          {
                            key: 'export-excel',
                            label: 'Xuất Excel',
                            icon: <FileExcelOutlined />,
                            onClick: handleExportExcel
                          }
                        ]
                      }}
                    >
                      <Button icon={<DownloadOutlined />}>
                        Xuất báo cáo <DownOutlined />
                      </Button>
                    </Dropdown>
                  </Space>
                </Col>
              </Row>
            )}
          </Card>
        )}

        {viewMode === 'table' ? (
          <Card>
            {isMobile ? (
              // Mobile Card View - Optimized
              <div className="mobile-tasks-container" style={{
                maxHeight: 'calc(100vh - 300px)',
                overflowY: 'auto',
                padding: '8px 0'
              }}>
                {getFilteredTasks().map(task => (
                  <MobileTaskCardOptimized 
                    key={task.id} 
                    task={task}
                    isDarkMode={isDarkMode}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onComment={openCommentDrawer}
                    canEditTasks={canEditTasks}
                    canDeleteTasks={canDeleteTasks}
                  />
                ))}
                {getFilteredTasks().length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 40, 
                    color: isDarkMode ? '#bbb' : '#8c8c8c' 
                  }}>
                    <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>Không tìm thấy nhiệm vụ nào</div>
                  </div>
                )}
              </div>
            ) : isTabletLandscape ? (
              // Tablet Landscape Table View - Layout 2 cột
              <div className="tablet-landscape-table" style={{ overflowX: 'auto' }}>
                <Table
                  dataSource={getFilteredTasks()}
                  loading={loading}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: handleTableChange,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhiệm vụ`
                  }}
                  rowKey="id"
                  size="middle"
                  className="tablet-landscape-table"
                  rowClassName={(task) => {
                    if (isTaskOverdue(task)) {
                      const severity = getOverdueSeverity(task);
                      return `overdue-task-row overdue-severity-${severity}`;
                    }
                    if (isTaskWarning(task)) {
                      const severity = getWarningSeverity(task);
                      return `warning-task-row warning-severity-${severity}`;
                    }
                    return '';
                  }}
                  columns={getTabletLandscapeColumns()}
                />
              </div>
            ) : (
              // Desktop Table View
              <div style={{ overflowX: 'auto' }}>
                <Table
              dataSource={getSortedProjects()}
              loading={loading}
              pagination={false}
              rowKey="id"
              rowClassName={(record) => {
                // Apply overdue styling to project rows if any child task is overdue
                const projectTasks = getSortedTasksForProject(record.id);
                const hasOverdueTasks = projectTasks.some(task => isTaskOverdue(task));
                return hasOverdueTasks ? 'overdue-project-row' : '';
              }}
              expandable={{
                expandedRowKeys: expandedRowKeys,
                onExpand: (expanded, record) => {
                  toggleTableProjectExpand(record.id);
                },
                expandedRowRender: (project) => {
                  const projectTasks = getSortedTasksForProject(project.id);
                  return (
              <Table
                      dataSource={projectTasks}
                pagination={false}
                      size="small"
                      rowClassName={(task) => {
                        if (isTaskOverdue(task)) {
                          const severity = getOverdueSeverity(task);
                          return `overdue-task-row overdue-severity-${severity}`;
                        }
                        if (isTaskWarning(task)) {
                          const severity = getWarningSeverity(task);
                          return `warning-task-row warning-severity-${severity}`;
                        }
                        return '';
                      }}
                      columns={[
                        {
                          title: 'Nhiệm vụ',
                          dataIndex: 'title',
                          key: 'title',
                          render: (text, record) => {
                            const isOverdue = isTaskOverdue(record);
                            const isWarning = isTaskWarning(record);
                            return (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                {isOverdue && (
                                  <ExclamationCircleOutlined 
                                    className="overdue-warning-icon"
                                    style={{ marginTop: 2 }}
                                  />
                                )}
                                {!isOverdue && isWarning && (
                                  <ExclamationCircleOutlined 
                                    className="warning-icon"
                                    style={{ marginTop: 2 }}
                                  />
                                )}
                                <div>
                                  <div style={{ 
                                    fontWeight: 'bold',
                                    color: isOverdue ? '#ff4d4f' : isWarning ? '#faad14' : 'inherit'
                                  }}>
                                    {text}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    {record.description}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        },
                        {
                          title: 'Ngày bắt đầu',
                          dataIndex: 'startDate',
                          key: 'startDate',
                          render: (date) => date ? moment(date).format('DD/MM/YYYY') : '-'
                        },
                        {
                          title: 'Hạn hoàn thành',
                          dataIndex: 'dueDate',
                          key: 'dueDate',
                          render: (dueDate, record) => {
                            if (!dueDate) return 'Chưa có';
                            const isOverdue = isTaskOverdue(record);
                            const isWarning = isTaskWarning(record);
                            const daysOverdue = isOverdue ? moment().diff(moment(dueDate), 'days') : 0;
                            const daysUntilDue = isWarning ? moment(dueDate).diff(moment(), 'days') : null;
                            const overdueSeverity = getOverdueSeverity(record);
                            const warningSeverity = getWarningSeverity(record);
                            
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ 
                                  color: isOverdue ? '#ff4d4f' : isWarning ? '#faad14' : 'inherit',
                                  fontWeight: (isOverdue || isWarning) ? 'bold' : 'normal'
                                }}>
                                  {moment(dueDate).format('DD/MM/YYYY')}
                                </span>
                                {isOverdue && (
                                  <Tag 
                                    color={overdueSeverity === 'high' ? 'red' : 
                                           overdueSeverity === 'medium' ? 'orange' : 'gold'} 
                                    style={{ 
                                      margin: 0,
                                      fontWeight: 'bold',
                                      boxShadow: overdueSeverity === 'high' ? '0 2px 4px rgba(255, 77, 79, 0.3)' : 
                                                 overdueSeverity === 'medium' ? '0 2px 4px rgba(250, 140, 22, 0.3)' : 
                                                 '0 2px 4px rgba(250, 173, 20, 0.3)'
                                    }}
                                  >
                                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                                    Quá hạn {daysOverdue} ngày
                                  </Tag>
                                )}
                                {!isOverdue && isWarning && (
                                  <Tag 
                                    color={warningSeverity === 'high' ? 'orange' : 
                                           warningSeverity === 'medium' ? 'gold' : 'lime'} 
                                    style={{ 
                                      margin: 0,
                                      fontWeight: 'bold',
                                      boxShadow: warningSeverity === 'high' ? '0 2px 4px rgba(250, 140, 22, 0.3)' : 
                                                 warningSeverity === 'medium' ? '0 2px 4px rgba(250, 173, 20, 0.3)' : 
                                                 '0 2px 4px rgba(186, 230, 55, 0.3)'
                                    }}
                                  >
                                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                                    Còn {daysUntilDue} ngày
                                  </Tag>
                                )}
                              </div>
                            );
                          }
                        },
                        {
                          title: 'Phân loại',
                          dataIndex: 'category',
                          key: 'category',
                          render: (category) => (
                            <Tag color="blue">
                              {categoryList.find(c => c.value === category)?.label || category || 'Khác'}
                            </Tag>
                          )
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status) => (
                            <Tag color={statusColors[status]}>
                              {statusList.find(s => s.value === status)?.label || status}
                            </Tag>
                          )
                        },
                        {
                          title: 'Ưu tiên',
                          dataIndex: 'priority',
                          key: 'priority',
                          render: (priority) => (
                            <Tag color={priorityColors[priority]}>
                              {priorityList.find(p => p.value === priority)?.label || priority}
                            </Tag>
                          )
                        },
                        {
                          title: 'Người thực hiện',
                          dataIndex: 'assignee',
                          key: 'assignee',
                          render: (assignee) => {
                            if (assignee && assignee.name) {
                              return assignee.name;
                            }
                            if (assignee && assignee.id) {
                              const user = users.find(u => u.id === assignee.id);
                              return user ? user.name : 'Chưa phân công';
                            }
                            return 'Chưa phân công';
                          }
                        },
                        {
                          title: 'Thao tác',
                          key: 'actions',
                          render: (_, record) => (
                            <div className="desktop-button-group">
                              <Button
                                size="small"
                                onClick={() => navigate(`/tasks/${record.id}`)}
                                icon={<EyeOutlined />}
                                className="desktop-icon-standard desktop-icon-view"
                                title="Xem chi tiết"
                              />
                              <Button
                                size="small"
                                onClick={() => handleEdit(record)}
                                icon={<EditOutlined />}
                                className="desktop-icon-standard desktop-icon-edit"
                                title="Chỉnh sửa"
                              />
                              <Button
                                size="small"
                                onClick={() => openCommentDrawer(record)}
                                icon={<MessageOutlined />}
                                className="desktop-icon-standard desktop-icon-comment"
                                title="Ghi chú"
                              />
                              <Button
                                size="small"
                                onClick={() => handleDeleteClick(record)}
                                icon={<DeleteOutlined />}
                                className="desktop-icon-standard desktop-icon-delete"
                                title="Xóa"
                              />
                            </div>
                          )
                        }
                      ]}
                    />
                  );
                }
              }}
              columns={[
                {
                  title: 'Dự án',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        {record.code && (
                          <Tag color="blue" style={{ fontSize: '10px' }}>
                            {record.code}
                          </Tag>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.description}
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Trạng thái dự án',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const statusMap = {
                      'ACTIVE': { label: 'Đang triển khai', color: 'green' },
                      'PLANNING': { label: 'Lập kế hoạch', color: 'blue' },
                      'ON_HOLD': { label: 'Tạm dừng', color: 'orange' },
                      'COMPLETED': { label: 'Hoàn thành', color: 'purple' },
                      'ARCHIVED': { label: 'Lưu trữ', color: 'grey' },
                      'CANCELLED': { label: 'Đã hủy', color: 'red' }
                    };
                    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'default' };
                    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
                  }
                },
                {
                  title: 'Số nhiệm vụ',
                  key: 'taskCount',
                  render: (_, record) => getSortedTasksForProject(record.id).length
                }
              ]}
            />
              </div>
            )}
          </Card>
        ) : (
          <Card style={{ 
            background: isDarkMode ? '#141414' : '#fff',
            border: isDarkMode ? '1px solid #303030' : '1px solid #d9d9d9'
          }}>

            
            <div className="gantt-wrapper">
              {(() => {
                try {
                  // Kiểm tra dữ liệu
                  if (!Array.isArray(tasks) || tasks.length === 0) {
                    return <Empty description="Không có dữ liệu để hiển thị timeline" />;
                  }
                  
                  const ganttTasks = getGanttTasks();
                  
                  if (!ganttTasks || ganttTasks.length === 0) {
                    return <Empty description="Không có nhiệm vụ nào để hiển thị" />;
                  }
                  
                  // Filter tasks based on collapsed state
                  const visibleTasks = ganttTasks.filter(task => {
                    if (task.type === 'project') return true;
                    // Hide child tasks if parent is collapsed
                    const parentId = task.parent?.replace('project-', '');
                    return parentId ? !collapsedProjects.has(parentId) : true;
                  });
                  
                  // Custom table component cho Gantt
                  return (
                    <div 
                      id="gantt-timeline-container"
                      className={`gantt-container ${isMobile ? 'gantt-timeline-container' : ''}`}
                      style={{ 
                        background: isDarkMode ? '#141414' : '#fff', 
                        borderRadius: 8,
                        overflow: isTabletLandscape ? 'auto' : 'hidden',
                        overflowX: isTabletLandscape ? 'auto' : 'hidden',
                        overflowY: isTabletLandscape ? 'hidden' : 'auto',
                        border: isDarkMode ? '1px solid #303030' : '1px solid #e8e8e8',
                        transform: isMobile ? 'none' : `scale(${zoomLevel / 100})`,
                        transformOrigin: 'left top',
                        width: '100%',
                        boxSizing: 'border-box',
                        maxHeight: isTabletLandscape ? 'calc(100vh - 400px)' : 'auto'
                      }}
                    >
            <style>{`
                        /* Reset Gantt styles */
                        .gantt-container .gantt {
                          background: ${isDarkMode ? '#141414' : '#fff'} !important;
                          color: ${isDarkMode ? '#fff' : '#000'} !important;
                        }
                        
                        /* Header styles */
              .gantt-container .gantt-table-header {
                          background: ${isDarkMode ? '#1f1f1f' : '#fafafa'} !important;
                          border-bottom: 1px solid ${isDarkMode ? '#303030' : '#e8e8e8'} !important;
                        }
                        
                        .gantt-container .gantt-table-header-cell {
                          background: ${isDarkMode ? '#1f1f1f' : '#fafafa'} !important;
                          color: ${isDarkMode ? '#fff' : '#000'} !important;
                          font-weight: 500;
                          font-size: 13px;
                          padding: 12px 8px;
                          border-right: 1px solid ${isDarkMode ? '#303030' : '#e8e8e8'} !important;
                          user-select: none;
                          position: relative;
                        }
                        
                        /* Resizable column handle */
                        .gantt-container .resize-handle {
                          position: absolute;
                          right: 0;
                          top: 0;
                          width: 4px;
                          height: 100%;
                          cursor: col-resize;
                          background: transparent;
                          z-index: 10;
                        }
                        
                        .gantt-container .resize-handle:hover {
                          background: #1890ff;
                        }
                        
                        /* Table rows */
                        .gantt-container .gantt-table-row {
                          background: ${isDarkMode ? '#141414' : '#fff'} !important;
                          border-bottom: 1px solid ${isDarkMode ? '#303030' : '#f0f0f0'} !important;
                        }
                        
                        .gantt-container .gantt-table-row:hover {
                          background: ${isDarkMode ? '#262626' : '#fafafa'} !important;
                        }
                        
                        .gantt-container .gantt-table-cell {
                          padding: 8px;
                          border-right: 1px solid ${isDarkMode ? '#303030' : '#f0f0f0'} !important;
                          color: ${isDarkMode ? '#fff' : '#000'} !important;
                          font-size: 13px;
                        }
                        
                        /* Project rows */
                        .gantt-container .gantt-project-row {
                          background: ${isDarkMode ? '#1f1f1f' : '#f5f5f5'} !important;
                          font-weight: 600;
                        }
                        
                        .gantt-container .gantt-project-row .gantt-table-cell {
                          font-weight: 600;
                          color: ${isDarkMode ? '#40a9ff' : '#1890ff'} !important;
                        }
                        
                        /* Task rows */
                        .gantt-container .gantt-task-row {
                          background: ${isDarkMode ? '#141414' : '#fff'} !important;
                        }
                        
                        .gantt-container .gantt-task-row .gantt-table-cell:first-child {
                          padding-left: 24px;
                        }
                        
                        /* Timeline area */
                        .gantt-container .gantt-timeline {
                          background: ${isDarkMode ? '#141414' : '#fff'} !important;
                          overflow-x: auto;
                        }
                        
                        /* Timeline header */
                        .gantt-container .gantt-timeline-header {
                          background: ${isDarkMode ? '#1f1f1f' : '#fafafa'} !important;
                          border-bottom: 1px solid ${isDarkMode ? '#303030' : '#e8e8e8'} !important;
                          position: sticky;
                          top: 0;
                          z-index: 5;
                        }
                        
                        .gantt-container .gantt-timeline-header-cell {
                          padding: 8px 4px;
                          text-align: center;
                          font-size: 12px;
                          font-weight: 500;
                          color: ${isDarkMode ? '#fff' : '#000'} !important;
                          border-right: 1px solid ${isDarkMode ? '#303030' : '#e8e8e8'} !important;
                          min-width: 30px;
                        }
                        
                        /* Task bars */
                        .gantt-container .gantt-bar {
                          height: 24px;
                          border-radius: 4px;
                          position: absolute;
                          top: 50%;
                          transform: translateY(-50%);
                display: flex;
                          align-items: center;
                          padding: 0 8px;
                font-size: 11px;
                          color: #fff;
                          cursor: pointer;
                          transition: all 0.2s;
                        }
                        
                        .gantt-container .gantt-bar:hover {
                          transform: translateY(-50%) scale(1.05);
                          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                          z-index: 10;
                        }
                        
                        .gantt-container .gantt-bar-project {
                          background: #1890ff !important;
                          height: 28px;
                font-weight: 600;
                        }
                        
                        .gantt-container .gantt-bar-task {
                          background: #40a9ff !important;
                        }
                        
                        /* Progress indicator */
                        .gantt-container .gantt-bar-progress {
                          position: absolute;
                          left: 0;
                          top: 0;
                          height: 100%;
                          background: rgba(0,0,0,0.2);
                          border-radius: 4px;
                        }
                        
                        /* Grid lines */
                        .gantt-container .gantt-grid-line {
                          position: absolute;
                          top: 0;
                          bottom: 0;
                          width: 1px;
                          background: ${isDarkMode ? '#303030' : '#f0f0f0'} !important;
                        }
                        
                        /* Weekend columns */
                        .gantt-container .gantt-weekend {
                          background: ${isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} !important;
                        }
                        
                        /* Today marker */
                        .gantt-container .gantt-timeline-header-cell.today {
                          background: rgba(255, 77, 79, 0.1) !important;
                          font-weight: 600;
                        }
                        
                        .gantt-container .gantt-timeline-header-cell.weekend {
                          background: ${isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} !important;
                        }
                        
                        /* Today marker */
                        .gantt-container .gantt-today-marker {
                          position: absolute;
                          top: 0;
                          bottom: 0;
                          width: 2px;
                          background: #ff4d4f;
                          z-index: 20;
                          pointer-events: none;
                        }
                        
                        /* Scrollbar */
                        .gantt-container ::-webkit-scrollbar {
                          width: 8px;
                          height: 8px;
                        }
                        
                        .gantt-container ::-webkit-scrollbar-track {
                          background: ${isDarkMode ? '#1f1f1f' : '#f0f0f0'};
                        }
                        
                        .gantt-container ::-webkit-scrollbar-thumb {
                          background: ${isDarkMode ? '#434343' : '#bfbfbf'};
                          border-radius: 4px;
                        }
                        
                        .gantt-container ::-webkit-scrollbar-thumb:hover {
                          background: ${isDarkMode ? '#595959' : '#8c8c8c'};
                        }
                        
                        /* Collapse/Expand icon */
                        .gantt-container .collapse-icon {
                          cursor: pointer;
                          margin-right: 8px;
                          transition: transform 0.2s;
                          display: inline-block;
                          user-select: none;
                        }
                        
                        .gantt-container .collapse-icon.collapsed {
                          transform: rotate(-90deg);
                        }
                        
                        .gantt-container .collapse-icon:hover {
                          color: #1890ff;
                        }
                        
                        /* Print styles */
                        @media print {
                          .gantt-container {
                            width: 100% !important;
                            transform: none !important;
                            box-shadow: none !important;
                            border: none !important;
                          }
                          
                          .gantt-container .resize-handle,
                          .gantt-container .collapse-icon {
                            display: none !important;
                          }
                          
                          .gantt-container * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                          }
                        }
            `}</style>
                      
                      {/* Custom Gantt Table */}
                      <div style={{ display: 'flex', height: '600px', position: 'relative' }}>
                        {/* Left side - Task list - Hidden on mobile */}
                        {!isMobile && (
                          <div style={{ 
                            width: '40%', 
                            minWidth: '300px',
                            borderRight: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            {/* Header */}
                            <div className="gantt-table-header" style={{ display: 'flex' }}>
                              <div 
                                className="gantt-table-header-cell" 
                                style={{ flex: 2, position: 'relative' }}
                  >
                    Tên nhiệm vụ
                                <div className="resize-handle" />
                  </div>
                              <div 
                                className="gantt-table-header-cell" 
                                style={{ width: '100px', position: 'relative' }}
                              >
                                From
                                <div className="resize-handle" />
                </div>
                              <div 
                                className="gantt-table-header-cell" 
                                style={{ width: '100px', position: 'relative' }}
                              >
                                To
                                <div className="resize-handle" />
              </div>
                            </div>
                            
                            {/* Task rows */}
                            <div style={{ flex: 1, overflow: 'auto' }}>
                              {visibleTasks.map((task, index) => {
                                const isProject = task.type === 'project';
                                const projectId = task.id.replace('project-', '');
                                const isCollapsed = collapsedProjects.has(projectId);
                                const hasChildren = ganttTasks.some(t => t.parent === task.id);
                                
                                return (
                                  <div 
                                    key={task.id}
                                    className={`gantt-table-row ${isProject ? 'gantt-project-row' : 'gantt-task-row'}`}
                                    style={{ display: 'flex', height: '40px', alignItems: 'center' }}
                                  >
                                    <div className="gantt-table-cell" style={{ flex: 2 }}>
                                      {isProject && hasChildren && (
                                        <span 
                                          className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}
                                          onClick={() => toggleProjectCollapse(projectId)}
                                        >
                                          ▼
                                        </span>
                                      )}
                                      {isProject ? (
                                        <strong>{task.name}</strong>
                                      ) : (
                                        <span style={{ marginLeft: hasChildren ? 0 : 24 }}>{task.name}</span>
                                      )}
                                    </div>
                                    <div className="gantt-table-cell" style={{ width: '100px' }}>
                                      {moment(task.start).format('DD/MM/YYYY')}
                                    </div>
                                    <div className="gantt-table-cell" style={{ width: '100px' }}>
                                      {moment(task.end).format('DD/MM/YYYY')}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Right side - Timeline */}
                        <div className="gantt-timeline" style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                          {/* Timeline implementation */}
                          <div style={{ minWidth: '2000px', position: 'relative' }}>
                                                      {/* Timeline header */}
                          <div className="gantt-timeline-header" style={{ height: '40px', display: 'flex' }}>
                            {getTimelineColumns().map((col, index) => (
                              <div 
                                key={index}
                                className={`gantt-timeline-header-cell ${col.isWeekend ? 'weekend' : ''} ${col.isToday ? 'today' : ''}`}
                                style={{ 
                                  width: col.width,
                                  borderRight: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`,
                                  fontWeight: 'bold'
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>{col.label}</div>
                                {col.subLabel && (
                                  <div style={{ fontSize: 10, opacity: 0.7 }}>{col.subLabel}</div>
                                )}
                              </div>
                            ))}
                          </div>
                            
                            {/* Task bars */}
                            <div style={{ position: 'relative' }}>
                              {visibleTasks.map((task, index) => {
                                const position = calculateTaskPosition(task.start, task.end);
                                
                                return (
                                  <div 
                                    key={task.id}
                                    style={{ 
                                      height: '40px', 
                                      position: 'relative',
                                      borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
                                    }}
                                  >
                                    <Tooltip title={
                                      <div>
                                        <div><strong>{task.name}</strong></div>
                                        <div>Tiến độ: {isTabletLandscape ? getTimelineTaskProgress(task) : task.progress}%</div>
                                        <div>Từ: {moment(task.start).format('DD/MM/YYYY')}</div>
                                        <div>Đến: {moment(task.end).format('DD/MM/YYYY')}</div>
                                      </div>
                                    }>
                                      <div 
                                        className={`gantt-bar ${task.type === 'project' ? 'gantt-bar-project' : 'gantt-bar-task'}`}
                                        style={{
                                          left: `${position.left}px`,
                                          width: `${position.width}px`
                                        }}
                                      >
                                        <div 
                                          className="gantt-bar-progress" 
                                          style={{ width: `${isTabletLandscape ? getTimelineTaskProgress(task) : task.progress}%` }} 
                                        />
                                        <span style={{ position: 'relative', zIndex: 1 }}>
                                          {task.name}
                                        </span>
                                      </div>
                                    </Tooltip>
                                  </div>
                                );
                              })}
                            </div>
                            
                                                        {/* Grid lines */}
                            {getTimelineColumns().map((col, index) => (
                              <div 
                                key={`grid-${index}`}
                                className={`gantt-grid-line ${col.isWeekend ? 'weekend' : ''}`}
                                style={{ left: `${index * col.width}px` }}
                              />
                            ))}
                            
                            {/* Today marker */}
                            {(() => {
                              const todayPosition = calculateTaskPosition(moment().toDate(), moment().toDate());
                              return (
                                <div 
                                  className="gantt-today-marker" 
                                  style={{ left: `${todayPosition.left}px` }} 
                                />
                              );
                            })()}
          </div>
                        </div>
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error('Error rendering timeline:', error);
                  return (
                    <Empty 
                      description="Có lỗi xảy ra khi hiển thị timeline" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  );
                }
              })()}
            </div>
          </Card>
        )}
      </div>



      )}
      {/* Task Modal - Optimized for Mobile and Tablet */}
      <Modal
        title={editingTask ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ mới'}
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
          isTabletLandscape ? '90%' : 
          800
        }
        style={
          isMobile ? { top: 20 } : 
          isTabletLandscape ? { top: 10 } : 
          {}
        }
        bodyStyle={
          isMobile ? { padding: '12px 8px' } : 
          isTabletLandscape ? { padding: '16px 20px' } : 
          {}
        }
        className={
          isMobile ? "mobile-task-modal" : 
          isTabletLandscape ? "tablet-landscape-edit-modal" : 
          ""
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'TODO',
            priority: 'MEDIUM',
            category: 'OTHER'
          }}
          className={
            isMobile ? "mobile-task-form" : 
            isTabletLandscape ? "tablet-landscape-edit-form task-form" : 
            "task-detail-form"
          }
        >
          {/* Tên nhiệm vụ - Full width */}
          <Form.Item
            name="title"
            label="Tên nhiệm vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
            className="span-full"
          >
            <Input placeholder="Nhập tên nhiệm vụ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Dự án"
                rules={[{ required: true, message: 'Vui lòng chọn dự án!' }]}
              >
                <Select placeholder="Chọn dự án">
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="Người thực hiện"
                rules={[{ required: true, message: 'Vui lòng chọn người thực hiện!' }]}
              >
                <Select placeholder="Chọn người thực hiện">
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
              >
                <Select placeholder="Chọn mức độ ưu tiên">
                  {priorityList.map(priority => (
                    <Option key={priority.value} value={priority.value}>
                      {priority.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  {statusList.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Phân loại thẻ"
                rules={[{ required: true, message: 'Vui lòng chọn phân loại!' }]}
              >
                <Select placeholder="Chọn phân loại">
                  {categoryList.map(category => (
                    <Option key={category.value} value={category.value}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* Placeholder for second column */}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="startDate" 
                label="Ngày bắt đầu"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày bắt đầu"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="dueDate" 
                label="Hạn hoàn thành"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn hạn hoàn thành"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            className="span-full"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập mô tả nhiệm vụ..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* History Drawer */}
      <Drawer
        title="Lịch sử công việc"
        placement="right"
        width={400}
        onClose={() => setHistoryDrawerOpen(false)}
        open={historyDrawerOpen}
      >
        <List
          dataSource={historyList}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                title={item.action}
                description={
                  <div>
                    <div>{item.details}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {moment(item.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa nhiệm vụ"
        content="Bạn có chắc chắn muốn xóa nhiệm vụ"
        itemName={taskToDelete?.title}
        size="medium"
      />

      {/* Comment Drawer */}
      <CommentDrawer
        open={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        title={`Ghi chú cho: ${selectedTask?.title || ''}`}
        entityType="tasks"
        entityId={selectedTask?.id || null}
        comments={comments}
        loading={commentLoading}
        onAddComment={handleAddComment}
        onFetchComments={fetchComments}
      />

      {/* Floating Action Button for Mobile */}
      {canCreateTasks && (
        <FloatingActionButton 
          onClick={handleAdd}
          tooltip="Thêm nhiệm vụ mới"
          color={`linear-gradient(135deg, #1890ff 0%, #096dd9 100%)`}
        />
      )}

      {/* Debug Panel - Only in development */}
      {/* Tạm thời tắt debug panel để giảm thiểu re-render */}
      {/* <PermissionDebugPanel visible={process.env.NODE_ENV === 'development'} /> */}
      
      {/* Debug Info - Temporary for troubleshooting */}
              {/* Removed UserDebugInfo component */}
    </div>
  );
};

export default Tasks;