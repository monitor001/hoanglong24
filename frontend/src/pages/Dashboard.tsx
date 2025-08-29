/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Select,
  Spin,
  Alert,
  Empty,
  Tabs,
  Progress,
  Timeline,
  Table,
  Tag,
  Space,
  Tooltip,
  Badge,
  Segmented,
  message,
  Button
} from 'antd';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveChart';
// Removed permission system
import MobileFilters from '../components/MobileFilters';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import SwipeableTabs from '../components/SwipeableTabs';
import ResponsiveFilters from '../components/ResponsiveFilters';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
// Removed permission components
// import PermissionDebug from '../components/PermissionDebug';
import { getResponsiveChartOptions, getResponsiveBarChartOptions, getResponsiveChartHeight } from '../utils/responsiveChartOptions';
import '../styles/responsive.css';
import '../styles/chart.css';
import '../styles/mobile-improvements.css';
import '../styles/mobile-scroll-fix.css';
import '../styles/dashboard-card-spacing-fix.css';
import '../styles/dashboard-text-consistency.css';
import '../styles/mobile-filter-optimization.css';
import '../styles/dashboard-mobile-optimization.css';
import '../styles/tablet-landscape-optimizations.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/unified-statistics-cards.css';
import '../styles/swipeable-tabs.css';
import '../styles/project-mobile-icon-optimized.css';
import '../styles/dashboard-action-buttons.css';
import { 
  ProjectOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  UserOutlined,
  BugOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  DashboardOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  AreaChartOutlined,
  FundOutlined,
  TeamOutlined,
  ClusterOutlined,
  AlertOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  HistoryOutlined,
  FieldTimeOutlined,
  SolutionOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  ArcElement, 
  BarElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, Bar, Doughnut, Pie, Radar, PolarArea } from 'react-chartjs-2';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import moment from 'moment';
import 'moment/locale/vi';
import 'moment/locale/en-gb';
import axiosInstance from '../axiosConfig';
import { AppDispatch, RootState } from '../store';
import { fetchProjects } from '../store/slices/projectSlice';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Filler,
  ChartDataLabels // Đăng ký plugin datalabels
);

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface DashboardData {
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalActiveTasks: number;
    completionRate: number;
    totalIssues: number;
    resolvedIssues: number;
    totalDocuments: number;
    approvedDocuments: number;
    totalUsers: number;
    activeUsers: number;
    upcomingEvents: number;
    overdueItems: number;
  };
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  tasksByUser: Array<{ userId: string; userName: string; count: number }>;
  issuesBySeverity: Record<string, number>;
  issuesByStatus: Record<string, number>;
  issuesByUser: Array<{ userId: string; userName: string; count: number }>;
  issueResolutionTime: Array<{ severity: string; avgDays: number }>;
  documentsByType: Record<string, number>;
  documentsByStatus: Record<string, number>;
  documentsByMonth: Array<{ month: string; count: number }>;
  eventsByType: Record<string, number>;
  eventsByMonth: Array<{ month: string; count: number }>;
  projectProgress: Array<{ projectId: string; projectName: string; progress: number }>;
  activityTimeline: Array<{ date: string; type: string; description: string }>;
  taskStatistics?: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    overdueBreakdown: Record<string, number>;
  };
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoint();
  const chartHeight = getResponsiveChartHeight(isMobile, isTablet);
  
  // ✅ Use custom theme hook for better theme management
  const { actualIsDarkMode: isDarkMode, theme } = useTheme();
  
  // Removed permission system - always allow all actions
  const canViewDashboard = true;
  const canExportDashboard = true;
  const permissionsLoading = false;
  
  // Đảm bảo projects luôn là array
  const projectsFromStore = useSelector((state: RootState) => state.projects.projects);
  const projects = Array.isArray(projectsFromStore) ? projectsFromStore : [];
  
  // Validate projects data structure
  useEffect(() => {
    // Only log issues in development
    if (process.env.NODE_ENV === 'development' && !Array.isArray(projectsFromStore)) {
      console.warn('⚠️ Projects from store is not an array:', typeof projectsFromStore);
    }
  }, [projectsFromStore]);

  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartView, setChartView] = useState<'overview' | 'tasks' | 'issues' | 'documents' | 'calendar'>('overview');

  const [taskFilter, setTaskFilter] = useState<'all' | 'status' | 'priority' | 'projectType'>('all');
  const [taskFilterValue, setTaskFilterValue] = useState<string>('all');
  
  // Thêm state cho filter theo phân loại nhiệm vụ
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');
  
  // Thêm state cho filter theo phân loại vấn đề
  const [issueCategoryFilter, setIssueCategoryFilter] = useState<string>('all');
  const [issueStatusFilter, setIssueStatusFilter] = useState<string>('all');
  const [issuePriorityFilter, setIssuePriorityFilter] = useState<string>('all');
  
  const [hasTimeout, setHasTimeout] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  // ✅ Ref cho charts để force update khi theme change
  const taskChartRef = useRef<any>(null);
  const issueChartRef = useRef<any>(null);

  // ✅ Kiểm tra quyền xem dashboard từ permission store (đã được xử lý trong hook)

  // ✅ Theme debugging and monitoring
  useEffect(() => {
    const checkTheme = () => {
      // Check if body has dark theme class (for Ant Design theme)
      const hasDarkClass = document.body.classList.contains('ant-theme-dark');
      
      // Only log theme issues in development
      if (process.env.NODE_ENV === 'development') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' && !hasDarkClass) {
          console.warn('⚠️ Dark theme selected but body missing dark class');
        }
      }
    };

    checkTheme();
    
    // Observe body class changes for Ant Design theme
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, [theme, isDarkMode]);

  // Set moment locale
  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  // Mapping logic giữa phân loại, trạng thái và ưu tiên
  const taskCategoryMapping = useMemo(() => ({
    DESIGN: {
      status: ['IN_PROGRESS', 'REVIEW', 'COMPLETED'],
      priority: ['MEDIUM', 'HIGH']
    },
    SURVEY: {
      status: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
      priority: ['LOW', 'MEDIUM']
    },
    CONSTRUCTION: {
      status: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
      priority: ['HIGH', 'URGENT']
    },
    MANAGEMENT: {
      status: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'],
      priority: ['MEDIUM', 'HIGH']
    },
    CONSULTING: {
      status: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'],
      priority: ['LOW', 'MEDIUM', 'HIGH']
    },
    OTHER: {
      status: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
      priority: ['LOW', 'MEDIUM']
    }
  }), []);

  // Logic liên kết: khi phân loại thay đổi thì trạng thái và ưu tiên thay đổi theo
  useEffect(() => {
    if (taskCategoryFilter !== 'all') {
      const mapping = taskCategoryMapping[taskCategoryFilter as keyof typeof taskCategoryMapping];
      if (mapping) {
        // Reset status và priority về 'all' khi category thay đổi
        setTaskStatusFilter('all');
        setTaskPriorityFilter('all');
      }
    }
  }, [taskCategoryFilter, taskCategoryMapping]);

  // Mapping logic cho phân loại vấn đề
  const issueCategoryMapping = useMemo(() => ({
    ISSUE: {
      status: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'NEW', 'OVERDUE'],
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    RFI: {
      status: ['PENDING', 'IN_REVIEW', 'RESPONDED', 'CLOSED', 'NEW', 'OVERDUE'],
      priority: ['MEDIUM', 'HIGH', 'URGENT']
    }
  }), []);

  // Logic liên kết cho vấn đề: khi phân loại thay đổi thì trạng thái và ưu tiên thay đổi theo
  useEffect(() => {
    if (issueCategoryFilter !== 'all') {
      const mapping = issueCategoryMapping[issueCategoryFilter as keyof typeof issueCategoryMapping];
      if (mapping) {
        // Reset status và priority về 'all' khi category thay đổi
        setIssueStatusFilter('all');
        setIssuePriorityFilter('all');
      }
    }
  }, [issueCategoryFilter, issueCategoryMapping]);

  // Helper functions for resetting filters
  const handleResetTaskFilters = useCallback(() => {
    setTaskCategoryFilter('all');
    setTaskStatusFilter('all');
    setTaskPriorityFilter('all');
  }, []);

  const handleResetIssueFilters = useCallback(() => {
    setIssueCategoryFilter('all');
    setIssueStatusFilter('all');
    setIssuePriorityFilter('all');
  }, []);

  // Fetch projects on component mount
  useEffect(() => {
    dispatch(fetchProjects()).catch(error => {
      console.error('Failed to fetch projects:', error);
      message.error(t('dashboard.failedToLoadProjects'));
    });
  }, [dispatch]);

  // Validate user and projects data
  useEffect(() => {
    // Only log issues in development
    if (process.env.NODE_ENV === 'development') {
      if (!currentUser) {
        console.warn('⚠️ No current user found');
      }
      if (!Array.isArray(projects)) {
        console.warn('⚠️ Projects is not an array:', typeof projects);
      }
    }
  }, [currentUser, projects]);

  // Set default project when projects are loaded
  useEffect(() => {
    // Mặc định không chọn project nào để hiển thị thống kê toàn bộ
    if (projects.length > 0 && !selectedProjectId) {
      // Không set selectedProjectId để hiển thị thống kê toàn bộ
    }
  }, [projects, selectedProjectId]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    // Fallback data prepared upfront (accessible in catch as well)
    const fallbackData: DashboardData = {
        stats: {
          totalProjects: 5,
          activeProjects: 3,
          totalTasks: 25,
          completedTasks: 15,
          totalActiveTasks: 10,
          completionRate: 60,
          totalIssues: 8,
          resolvedIssues: 6,
          totalDocuments: 12,
          approvedDocuments: 8,
          totalUsers: 15,
          activeUsers: 12,
          upcomingEvents: 3,
          overdueItems: 2
        },
        tasksByStatus: {
          'TODO': 5,
          'IN_PROGRESS': 8,
          'REVIEW': 3,
          'COMPLETED': 15
        },
        tasksByPriority: {
          'LOW': 8,
          'MEDIUM': 12,
          'HIGH': 4,
          'URGENT': 1
        },
        tasksByUser: [
          { userId: '1', userName: 'Nguyễn Văn A', count: 8 },
          { userId: '2', userName: 'Trần Thị B', count: 6 },
          { userId: '3', userName: 'Lê Văn C', count: 4 }
        ],
        issuesBySeverity: {
          'LOW': 3,
          'MEDIUM': 4,
          'HIGH': 1
        },
        issuesByStatus: {
          'OPEN': 2,
          'IN_PROGRESS': 3,
          'RESOLVED': 6,
          'CLOSED': 2
        },
        issuesByUser: [
          { userId: '1', userName: 'Nguyễn Văn A', count: 3 },
          { userId: '2', userName: 'Trần Thị B', count: 2 }
        ],
        issueResolutionTime: [
          { severity: 'LOW', avgDays: 2 },
          { severity: 'MEDIUM', avgDays: 5 },
          { severity: 'HIGH', avgDays: 1 }
        ],
        documentsByType: {
          'DESIGN': 5,
          'CONSTRUCTION': 4,
          'MANAGEMENT': 3
        },
        documentsByStatus: {
          'DRAFT': 3,
          'REVIEW': 2,
          'APPROVED': 8
        },
        documentsByMonth: [
          { month: 'T1', count: 2 },
          { month: 'T2', count: 3 },
          { month: 'T3', count: 4 }
        ],
        eventsByType: {
          'MEETING': 2,
          'REVIEW': 1
        },
        eventsByMonth: [
          { month: 'T1', count: 1 },
          { month: 'T2', count: 2 }
        ],
        projectProgress: [
          { projectId: '1', projectName: 'Dự án A', progress: 75 },
          { projectId: '2', projectName: 'Dự án B', progress: 45 },
          { projectId: '3', projectName: 'Dự án C', progress: 90 }
        ],
        activityTimeline: [
          { date: '2024-01-15', type: 'task', description: 'Hoàn thành nhiệm vụ thiết kế' },
          { date: '2024-01-14', type: 'issue', description: 'Giải quyết vấn đề kỹ thuật' },
          { date: '2024-01-13', type: 'document', description: 'Phê duyệt tài liệu' }
        ]
      };
    try {
      setLoading(true);
      setHasTimeout(false);
      
      // Timeout: after 12s, show fallback instead of empty screen
      const timeoutId = setTimeout(() => {
        setHasTimeout(true);
        setIsUsingFallbackData(true);
        setDashboardData(fallbackData);
        setLoading(false);
      }, 12000);
      
      const params = selectedProjectId ? { projectId: selectedProjectId } : {};
      const response = await axiosInstance.get('/dashboard/comprehensive', { params });
      
      clearTimeout(timeoutId);
      setDashboardData(response.data);
      setIsUsingFallbackData(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      setDashboardData(fallbackData);
      setIsUsingFallbackData(true);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    // Fetch dashboard data ngay cả khi không có projects (để lấy overall stats)
    fetchDashboardData();
  }, [fetchDashboardData]); // Include fetchDashboardData dependency to ensure proper updates

  // Chart color schemes - cập nhật để tránh trùng màu
  const colors = useMemo(() => ({
    primary: ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'],
    status: {
      TODO: '#1890ff',           // Xanh dương - Cần làm
      IN_PROGRESS: '#faad14',    // Vàng - Đang thực hiện
      REVIEW: '#722ed1',         // Tím - Đang xem xét
      COMPLETED: '#52c41a',      // Xanh lá - Hoàn thành
      CANCELLED: '#f5222d',      // Đỏ - Đã hủy
      DONE: '#52c41a',           // Xanh lá - Hoàn thành (giống COMPLETED)
      APPROVED: '#13c2c2',       // Xanh ngọc - Đã phê duyệt
      DRAFT: '#8c8c8c',          // Xám - Bản nháp
      // Overdue status colors - màu đỏ nhạt hơn để phân biệt
      TODO_OVERDUE: '#ff7875',   // Đỏ nhạt - Cần làm (quá hạn)
      IN_PROGRESS_OVERDUE: '#ff7875', // Đỏ nhạt - Đang thực hiện (quá hạn)
      REVIEW_OVERDUE: '#ff7875', // Đỏ nhạt - Đang xem xét (quá hạn)
      // Issue status colors
      OPEN: '#1890ff',           // Xanh dương - Mở
      RESOLVED: '#52c41a',       // Xanh lá - Đã giải quyết
      CLOSED: '#13c2c2',         // Xanh ngọc - Đã đóng
      NEW: '#722ed1',            // Tím - Mới
      OVERDUE: '#f5222d',        // Đỏ - Quá hạn
      PENDING: '#faad14',        // Vàng - Chờ xử lý
      IN_REVIEW: '#722ed1',      // Tím - Đang xem xét
      RESPONDED: '#13c2c2'       // Xanh ngọc - Đã phản hồi
    },
    priority: {
      LOW: '#52c41a',            // Xanh lá
      MEDIUM: '#faad14',         // Vàng
      HIGH: '#f5222d',           // Đỏ
      URGENT: '#722ed1',         // Tím
      CRITICAL: '#eb2f96'        // Hồng
    },
    severity: {
      LOW: '#52c41a',            // Xanh lá
      MEDIUM: '#faad14',         // Vàng
      HIGH: '#fa8c16',           // Cam
      CRITICAL: '#f5222d',       // Đỏ
      URGENT: '#f5222d'          // Đỏ (giống CRITICAL)
    },
    projectType: {
      DESIGN: '#1890ff',         // Xanh dương - Thiết kế
      SURVEY: '#13c2c2',         // Xanh ngọc - Khảo sát
      CONSTRUCTION: '#52c41a',   // Xanh lá - Thi công
      MANAGEMENT: '#faad14',     // Vàng - Quản lý
      CONSULTING: '#722ed1',     // Tím - Tư vấn
      OTHER: '#8c8c8c'           // Xám - Khác
    }
  }), []);

  // Chart options with responsive handling
  const chartOptions = useMemo(() => {
    return getResponsiveChartOptions(isMobile, isDarkMode);
  }, [isMobile, isDarkMode]);

  // Chart options for bar charts (with bottom legend)
  const barChartOptions = useMemo(() => {
    return getResponsiveBarChartOptions(isMobile, isDarkMode);
  }, [isMobile, isDarkMode]);

  // Task filter options - chỉ lọc theo loại dự án
  const taskFilterOptions = useMemo(() => [
    { label: t('common.all'), value: 'all' },
    { label: t('dashboard.tasksByProjectType'), value: 'projectType' }
  ], [t]);

  const taskStatusOptions = useMemo(() => [
    { label: t('tasks.status.todo'), value: 'TODO' },
    { label: t('tasks.status.inProgress'), value: 'IN_PROGRESS' },
    { label: t('tasks.status.review'), value: 'REVIEW' },
    { label: t('tasks.status.completed'), value: 'COMPLETED' }
  ], [t]);

  const taskPriorityOptions = useMemo(() => [
    { label: t('tasks.priority.low'), value: 'LOW' },
    { label: t('tasks.priority.medium'), value: 'MEDIUM' },
    { label: t('tasks.priority.high'), value: 'HIGH' },
    { label: t('tasks.priority.urgent'), value: 'URGENT' }
  ], [t]);

  const projectTypeOptions = useMemo(() => [
    { label: t('projectType.design'), value: 'DESIGN' },
    { label: t('projectType.survey'), value: 'SURVEY' },
    { label: t('projectType.construction'), value: 'CONSTRUCTION' },
    { label: t('projectType.management'), value: 'MANAGEMENT' },
    { label: t('projectType.consulting'), value: 'CONSULTING' },
    { label: t('projectType.other'), value: 'OTHER' }
  ], [t]);

  // Task category options (phân loại nhiệm vụ)
  const taskCategoryOptions = useMemo(() => [
    { label: t('common.all'), value: 'all' },
    { label: t('projectType.design'), value: 'DESIGN' },
    { label: t('projectType.survey'), value: 'SURVEY' },
    { label: t('projectType.construction'), value: 'CONSTRUCTION' },
    { label: t('projectType.management'), value: 'MANAGEMENT' },
    { label: t('projectType.consulting'), value: 'CONSULTING' },
    { label: t('projectType.other'), value: 'OTHER' }
  ], [t]);

  // Dynamic status options based on selected category
  const dynamicStatusOptions = useMemo(() => {
    if (taskCategoryFilter === 'all') {
      return taskStatusOptions;
    }
    
    const mapping = taskCategoryMapping[taskCategoryFilter as keyof typeof taskCategoryMapping];
    if (mapping) {
      return [
        { label: t('common.all'), value: 'all' },
        ...taskStatusOptions.filter(option => 
          mapping.status.includes(option.value as any)
        )
      ];
    }
    
    return taskStatusOptions;
  }, [taskCategoryFilter, taskCategoryMapping, taskStatusOptions, t]);

  // Dynamic priority options based on selected category
  const dynamicPriorityOptions = useMemo(() => {
    if (taskCategoryFilter === 'all') {
      return taskPriorityOptions;
    }
    
    const mapping = taskCategoryMapping[taskCategoryFilter as keyof typeof taskCategoryMapping];
    if (mapping) {
      return [
        { label: t('common.all'), value: 'all' },
        ...taskPriorityOptions.filter(option => 
          mapping.priority.includes(option.value as any)
        )
      ];
    }
    
    return taskPriorityOptions;
  }, [taskCategoryFilter, taskCategoryMapping, taskPriorityOptions, t]);

  // ✅ Permission check is now handled by DashboardPermissionGuard component
  // This component will only render if user has permission to view dashboard

  // Issue category options (phân loại vấn đề)
  const issueCategoryOptions = useMemo(() => [
    { label: t('common.all'), value: 'all' },
    { label: t('issues.category.issue'), value: 'ISSUE' },
    { label: t('issues.category.rfi'), value: 'RFI' }
  ], [t]);

  // Issue status options
  const issueStatusOptions = useMemo(() => [
    { label: t('issues.status.open'), value: 'OPEN' },
    { label: t('issues.status.inProgress'), value: 'IN_PROGRESS' },
    { label: t('issues.status.resolved'), value: 'RESOLVED' },
    { label: t('issues.status.closed'), value: 'CLOSED' },
    { label: t('issues.status.pending'), value: 'PENDING' },
    { label: t('issues.status.inReview'), value: 'IN_REVIEW' },
    { label: t('issues.status.responded'), value: 'RESPONDED' },
    { label: t('issues.status.new'), value: 'NEW' },
    { label: t('issues.status.overdue'), value: 'OVERDUE' }
  ], [t]);

  // Issue priority options
  const issuePriorityOptions = useMemo(() => [
    { label: t('issues.priority.low'), value: 'LOW' },
    { label: t('issues.priority.medium'), value: 'MEDIUM' },
    { label: t('issues.priority.high'), value: 'HIGH' },
    { label: t('issues.priority.critical'), value: 'CRITICAL' },
    { label: t('issues.priority.urgent'), value: 'URGENT' }
  ], [t]);

  // Handler functions for dashboard actions
  const handleExportReport = useCallback(async () => {
    try {
      setIsExporting(true);
      const response = await axiosInstance.post('/dashboard/export-report', {
        projectId: selectedProjectId || 'all',
        reportType: 'comprehensive'
      });
      
      if (response.data.success) {
        message.success(response.data.message);
        // Có thể mở download link hoặc hiển thị modal
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Không thể xuất báo cáo');
    } finally {
      setIsExporting(false);
    }
  }, [selectedProjectId]);





  // Helper functions to translate status and priority keys to Vietnamese
  const translateTaskStatus = useCallback((status: string) => {
    const statusMap: Record<string, string> = {
      'TODO': t('tasks.status.todo'),
      'IN_PROGRESS': t('tasks.status.inProgress'),
      'REVIEW': t('tasks.status.review'),
      'COMPLETED': t('tasks.status.completed'),
      'CANCELLED': t('tasks.status.cancelled'),
      // Overdue status mappings
      'TODO_OVERDUE': `${t('tasks.status.todo')} (${t('common.overdue')})`,
      'IN_PROGRESS_OVERDUE': `${t('tasks.status.inProgress')} (${t('common.overdue')})`,
      'REVIEW_OVERDUE': `${t('tasks.status.review')} (${t('common.overdue')})`
    };
    return statusMap[status] || status;
  }, [t]);

  const translateTaskPriority = useCallback((priority: string) => {
    const priorityMap: Record<string, string> = {
      'LOW': t('tasks.priority.low'),
      'MEDIUM': t('tasks.priority.medium'),
      'HIGH': t('tasks.priority.high'),
      'URGENT': t('tasks.priority.urgent')
    };
    return priorityMap[priority] || priority;
  }, [t]);

  const translateIssueStatus = useCallback((status: string) => {
    const statusMap: Record<string, string> = {
      'OPEN': t('issues.status.open'),
      'IN_PROGRESS': t('issues.status.inProgress'),
      'RESOLVED': t('issues.status.resolved'),
      'CLOSED': t('issues.status.closed'),
      'PENDING': t('issues.status.pending'),
      'IN_REVIEW': t('issues.status.inReview'),
      'RESPONDED': t('issues.status.responded'),
      'NEW': t('issues.status.new'),
      'OVERDUE': t('issues.status.overdue')
    };
    return statusMap[status] || status;
  }, [t]);

  const translateIssuePriority = useCallback((priority: string) => {
    const priorityMap: Record<string, string> = {
      'LOW': t('issues.priority.low'),
      'MEDIUM': t('issues.priority.medium'),
      'HIGH': t('issues.priority.high'),
      'CRITICAL': t('issues.priority.critical'),
      'URGENT': t('issues.priority.urgent')
    };
    return priorityMap[priority] || priority;
  }, [t]);

  // Dynamic issue status options based on selected category
  const dynamicIssueStatusOptions = useMemo(() => {
    if (issueCategoryFilter === 'all') {
      return issueStatusOptions;
    }
    
    const mapping = issueCategoryMapping[issueCategoryFilter as keyof typeof issueCategoryMapping];
    if (mapping) {
      return [
        { label: t('common.all'), value: 'all' },
        ...issueStatusOptions.filter(option => 
          mapping.status.includes(option.value as any)
        )
      ];
    }
    
    return issueStatusOptions;
  }, [issueCategoryFilter, issueCategoryMapping, issueStatusOptions, t]);

  // Dynamic issue priority options based on selected category
  const dynamicIssuePriorityOptions = useMemo(() => {
    if (issueCategoryFilter === 'all') {
      return issuePriorityOptions;
    }
    
    const mapping = issueCategoryMapping[issueCategoryFilter as keyof typeof issueCategoryMapping];
    if (mapping) {
      return [
        { label: t('common.all'), value: 'all' },
        ...issuePriorityOptions.filter(option => 
          mapping.priority.includes(option.value as any)
        )
      ];
    }
    
    return issuePriorityOptions;
  }, [issueCategoryFilter, issueCategoryMapping, issuePriorityOptions, t]);

  // Filtered task data - cập nhật để sử dụng filter theo phân loại nhiệm vụ
  const filteredTaskData = useMemo(() => {
    if (!dashboardData) return null;

    let filteredStatus = dashboardData.tasksByStatus || {};
    let filteredPriority = dashboardData.tasksByPriority || {};
    let filteredUser = dashboardData.tasksByUser || [];

    // Filter theo loại dự án (giữ nguyên logic cũ)
    if (taskFilter === 'projectType' && taskFilterValue !== 'all') {
      // Filter logic here
    }

    // Filter theo phân loại nhiệm vụ
    if (taskCategoryFilter !== 'all') {
      const mapping = taskCategoryMapping[taskCategoryFilter as keyof typeof taskCategoryMapping];
      if (mapping) {
        // Filter status data theo mapping
        const allowedStatuses = mapping.status;
        filteredStatus = Object.fromEntries(
          Object.entries(filteredStatus).filter(([status]) => 
            allowedStatuses.includes(status as any)
          )
        );

        // Filter priority data theo mapping
        const allowedPriorities = mapping.priority;
        filteredPriority = Object.fromEntries(
          Object.entries(filteredPriority).filter(([priority]) => 
            allowedPriorities.includes(priority as any)
          )
        );
      }
    }

    // Filter theo trạng thái cụ thể
    if (taskStatusFilter !== 'all') {
      filteredStatus = Object.fromEntries(
        Object.entries(filteredStatus).filter(([status]) => 
          status === taskStatusFilter
        )
      );
    }

    // Filter theo ưu tiên cụ thể
    if (taskPriorityFilter !== 'all') {
      filteredPriority = Object.fromEntries(
        Object.entries(filteredPriority).filter(([priority]) => 
          priority === taskPriorityFilter
        )
      );
    }

    return {
      statusData: filteredStatus,
      priorityData: filteredPriority,
      userData: filteredUser
    };
  }, [dashboardData, taskFilter, taskFilterValue, taskCategoryFilter, taskStatusFilter, taskPriorityFilter, taskCategoryMapping]);

  // Tính toán thống kê nhiệm vụ chi tiết
  const calculateDetailedTaskStats = useCallback(() => {
    if (!dashboardData?.tasksByStatus) return null;

    const taskStatusData = dashboardData.tasksByStatus;
    const totalTasks = dashboardData.stats.totalTasks || 0;
    
    // Tính toán các loại nhiệm vụ
    const completedTasks = taskStatusData['COMPLETED'] || 0;
    const cancelledTasks = taskStatusData['CANCELLED'] || 0;
    const activeTasks = totalTasks - completedTasks - cancelledTasks;
    
    // Tính toán nhiệm vụ quá hạn (nếu có dữ liệu từ backend)
    const overdueTasks = dashboardData.stats.overdueItems || 0;
    
    // Calculate remaining tasks (not completed, not overdue)
    // This includes: TODO, IN_PROGRESS, REVIEW, and any other non-completed, non-overdue statuses
    const remainingTasks = Object.entries(taskStatusData)
      .filter(([status]) => status !== 'COMPLETED' && !status.includes('OVERDUE'))
      .reduce((sum, [, count]) => sum + (count || 0), 0);

    // Debug logging - only log issues in development
    if (process.env.NODE_ENV === 'development') {
      const manualTotal = Object.values(taskStatusData).reduce((sum, count) => sum + (count || 0), 0);
      if (manualTotal !== totalTasks) {
        console.warn('⚠️ Task count mismatch:', { manualTotal, totalTasks });
      }
    }
    
    // Calculate percentages
    const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overduePercentage = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;
    const remainingPercentage = totalTasks > 0 ? Math.round((remainingTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      completedPercentage,
      overdueTasks,
      overduePercentage,
      remainingTasks,
      remainingPercentage,
      activeTasks
    };
  }, [dashboardData]);

  // Filtered issue data - cập nhật để sử dụng filter theo phân loại vấn đề
  const filteredIssueData = useMemo(() => {
    if (!dashboardData) return null;

    let filteredSeverity = dashboardData.issuesBySeverity || {};
    let filteredStatus = dashboardData.issuesByStatus || {};
    let filteredUser = dashboardData.issuesByUser || [];

    // Filter theo phân loại vấn đề
    if (issueCategoryFilter !== 'all') {
      const mapping = issueCategoryMapping[issueCategoryFilter as keyof typeof issueCategoryMapping];
      if (mapping) {
        // Filter severity data theo mapping
        const allowedPriorities = mapping.priority;
        filteredSeverity = Object.fromEntries(
          Object.entries(filteredSeverity).filter(([severity]) => 
            allowedPriorities.includes(severity as any)
          )
        );

        // Filter status data theo mapping
        const allowedStatuses = mapping.status;
        filteredStatus = Object.fromEntries(
          Object.entries(filteredStatus).filter(([status]) => 
            allowedStatuses.includes(status as any)
          )
        );
      }
    }

    // Filter theo trạng thái cụ thể
    if (issueStatusFilter !== 'all') {
      filteredStatus = Object.fromEntries(
        Object.entries(filteredStatus).filter(([status]) => 
          status === issueStatusFilter
        )
      );
    }

    // Filter theo ưu tiên cụ thể
    if (issuePriorityFilter !== 'all') {
      filteredSeverity = Object.fromEntries(
        Object.entries(filteredSeverity).filter(([severity]) => 
          severity === issuePriorityFilter
        )
      );
    }

    return {
      severityData: filteredSeverity,
      statusData: filteredStatus,
      userData: filteredUser
    };
  }, [dashboardData, issueCategoryFilter, issueStatusFilter, issuePriorityFilter, issueCategoryMapping]);

  // Render overview statistics
  const renderOverviewStats = useCallback(() => {
    const detailedStats = calculateDetailedTaskStats();
    
    return (
      <div className="dashboard-stats-row" style={{ width: '100%' }}>
        <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col xs={12} sm={8} md={6} lg={4} style={{ width: '100%' }}>
          <ResponsiveStatCard
            title={t('dashboard.totalTasks')}
            value={detailedStats?.totalTasks || dashboardData?.stats.totalTasks || 0}
            icon={<CheckCircleOutlined />}
            function="tasks"
            suffix={
              <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                ({detailedStats?.completedPercentage || 0}% {t('completed')})
              </Text>
            }
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} style={{ width: '100%' }}>
          <ResponsiveStatCard
            title={t('dashboard.totalIssues')}
            value={dashboardData?.stats.totalIssues || 0}
            icon={<BugOutlined />}
            function="issues"
            color={(dashboardData?.stats.totalIssues || 0) - (dashboardData?.stats.resolvedIssues || 0) > 0 ? '#faad14' : '#52c41a'}
            suffix={
              <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                ({Math.round(((dashboardData?.stats.resolvedIssues || 0) / (dashboardData?.stats.totalIssues || 1)) * 100)}% {t('resolved')})
              </Text>
            }
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} style={{ width: '100%' }}>
          <ResponsiveStatCard
            title={t('dashboard.totalDocuments')}
            value={dashboardData?.stats.totalDocuments || 0}
            icon={<FileTextOutlined />}
            function="documents"
            suffix={
              <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                ({Math.round(((dashboardData?.stats.approvedDocuments || 0) / (dashboardData?.stats.totalDocuments || 1)) * 100)}% {t('approved')})
              </Text>
            }
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} style={{ width: '100%' }}>
          <ResponsiveStatCard
            title={t('dashboard.overdueItems')}
            value={dashboardData?.stats.overdueItems || 0}
            icon={<ClockCircleOutlined />}
            function="overdue"
            color={(dashboardData?.stats.overdueItems || 0) > 0 ? '#f5222d' : '#52c41a'}
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} style={{ width: '100%' }}>
          <ResponsiveStatCard
            title={t('dashboard.upcomingEvents')}
            value={dashboardData?.stats.upcomingEvents || 0}
            icon={<CalendarOutlined />}
            function="calendar"
            color={(dashboardData?.stats.upcomingEvents || 0) > 0 ? '#1890ff' : '#d9d9d9'}
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} style={{ width: '100%' }}>
          <ResponsiveStatCard
            title={t('dashboard.projectProgress')}
            value={dashboardData?.projectProgress[0]?.progress || 0}
            suffix="%"
            icon={<ProjectOutlined />}
            function="projects"
            color="#1890ff"
          />
        </Col>
        </Row>
      </div>
    );
  }, [dashboardData, t, calculateDetailedTaskStats, isMobile]);

  // Helper function to check if data is empty
  const hasData = (data: any): boolean => {
    if (Array.isArray(data)) {
      return data.length > 0 && data.some(item => item && (item.count > 0 || item.value > 0));
    }
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).some(value => Number(value) > 0);
    }
    return false;
  };

  // Component để hiển thị hướng dẫn biểu đồ
  const ChartInstructions = () => (
    <Alert
      message={t('dashboard.chartInstructions')}
      description={t('dashboard.chartInstructionsDescription')}
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );

  // Component để hiển thị chú thích cho các phần nhỏ
  const ChartLegendNote: React.FC<{ data: any; isDarkTheme: boolean }> = ({ data, isDarkTheme }) => {
  if (!data || !data.labels || !data.datasets || !data.datasets[0]) {
    return null;
  }
  
  const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
  const smallItems = data.labels
    .map((label: string, index: number) => {
      const value = data.datasets[0].data[index];
      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
      return { label, value, percentage, color: data.datasets[0].backgroundColor[index] };
    })
    .filter((item: any) => item.percentage < 5 && item.percentage > 0);

  if (smallItems.length === 0) {
    return null;
  }

  // White color for better visibility in dark theme
  const textColor = '#ffffff';

  return (
    <div style={{ 
      marginTop: 8, 
      padding: '8px 12px', 
      backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 4,
      fontSize: 11
    }}>
      <span 
        style={{ 
          fontSize: 11, 
          fontWeight: 'bold',
          color: textColor,
          display: 'block',
          marginBottom: 4
        }}
      >
        {t('dashboard.otherItems')}:
      </span>
      <div style={{ marginTop: 4 }}>
        {smallItems.map((item: any, index: number) => (
          <Tag 
            key={index} 
            color={item.color}
            style={{ 
              margin: '2px 4px 2px 0',
              fontSize: 10,
              lineHeight: '16px',
              border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
              color: textColor,
              fontWeight: 'bold'
            }}
          >
            {item.label}: {item.percentage}%
          </Tag>
        ))}
      </div>
    </div>
  );
};

  // Render task charts
  const renderTaskCharts = useCallback(() => {
    // Use filtered data if available, otherwise use original data
    const taskData = filteredTaskData?.statusData || dashboardData?.tasksByStatus || {};
    const priorityData = filteredTaskData?.priorityData || dashboardData?.tasksByPriority || {};
    const userData = filteredTaskData?.userData || dashboardData?.tasksByUser || [];
    
    // Check if any data exists for the current filter
    const hasAnyData = hasData(taskData) || hasData(priorityData) || hasData(userData);

    return (
      <>
        {isMobile ? (
          <MobileFilters
            searchValue=""
            statusValue={taskStatusFilter}
            priorityValue={taskPriorityFilter}
            typeValue={taskCategoryFilter}
            assigneeValue=""
            projectValue={selectedProjectId}
            statusOptions={dynamicStatusOptions}
            priorityOptions={dynamicPriorityOptions}
            typeOptions={taskCategoryOptions}
            assigneeOptions={[]}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onSearchChange={() => {}}
            onStatusChange={setTaskStatusFilter}
            onPriorityChange={setTaskPriorityFilter}
            onTypeChange={setTaskCategoryFilter}
            onAssigneeChange={() => {}}
            onProjectChange={setSelectedProjectId}
            onReset={handleResetTaskFilters}
            title="Bộ lọc nhiệm vụ"
            isDarkMode={isDarkMode}
          />
        ) : (
          <ResponsiveCollapsibleFilters
            searchValue=""
            searchPlaceholder="Tìm kiếm nhiệm vụ..."
            onSearchChange={() => {}}
            statusValue={taskStatusFilter}
            statusOptions={dynamicStatusOptions}
            onStatusChange={setTaskStatusFilter}
            priorityValue={taskPriorityFilter}
            priorityOptions={dynamicPriorityOptions}
            onPriorityChange={setTaskPriorityFilter}
            projectValue={selectedProjectId}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onProjectChange={setSelectedProjectId}
            assigneeValue=""
            assigneeOptions={[]}
            onAssigneeChange={() => {}}
            onReset={handleResetTaskFilters}
            title="Bộ lọc nhiệm vụ"
            isMobile={isMobile}
            isTabletLandscape={window.innerWidth >= 769 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth}
            isDarkMode={isDarkMode}
            additionalFilters={
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div className="tablet-filter-item">
                    <div className="tablet-filter-label">Phân loại</div>
                    <Select
                      placeholder="Tất cả phân loại"
                      value={taskCategoryFilter}
                      onChange={setTaskCategoryFilter}
                      allowClear
                      style={{ width: '100%' }}
                      size="middle"
                    >
                      <Option value="all">Tất cả</Option>
                      {taskCategoryOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            }
          />
        )}
        {taskFilter === 'projectType' && taskFilterValue !== 'all' ? (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Alert
                  message={t('dashboard.projectTypeFilterNotAvailable')}
                  description={t('dashboard.projectTypeFilterDescription')}
                  type="info"
                  showIcon
                />
              </Card>
            </Col>
          </Row>
        ) : !hasAnyData ? (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Empty 
                  description={t('common.noStatisticsAvailable')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            </Col>
          </Row>
        ) : (
          <div className="dashboard-task-charts">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('dashboard.tasksByStatus')} size="small" className="dashboard-chart-card">
                  <div style={{ 
                    height: chartHeight,
                    overflow: isMobile ? 'auto' : 'visible',
                    padding: isMobile ? '8px' : '0'
                  }}>
                    {hasData(taskData) ? (
                      <>
                        <Doughnut
                          ref={taskChartRef}
                          key={`task-chart-${isDarkMode ? 'dark' : 'light'}`}
                          data={{
                            labels: Object.keys(taskData).map(status => translateTaskStatus(status)),
                            datasets: [{
                              data: Object.values(taskData),
                              backgroundColor: Object.keys(taskData).map(status => (colors.status as any)[status] || '#d9d9d9'),
                              borderWidth: 2,
                              borderColor: isDarkMode ? '#ffffff' : '#000000',
                            }]
                          }}
                          options={chartOptions}
                        />
                        <ChartLegendNote 
                          data={{
                            labels: Object.keys(taskData).map(status => translateTaskStatus(status)),
                            datasets: [{
                              data: Object.values(taskData),
                              backgroundColor: Object.keys(taskData).map(status => (colors.status as any)[status] || '#d9d9d9')
                            }]
                          }}
                          isDarkTheme={isDarkMode}
                        />
                      </>
                    ) : (
                      <Empty 
                        description={t('common.noStatisticsAvailable')}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('dashboard.tasksByPriority')} size="small" className="dashboard-chart-card">
                  <div style={{ 
                    height: chartHeight,
                    overflow: isMobile ? 'auto' : 'visible',
                    padding: isMobile ? '8px' : '0'
                  }}>
                    {hasData(priorityData) ? (
                      <>
                        <Doughnut
                          ref={issueChartRef}
                          key={`issue-chart-${isDarkMode ? 'dark' : 'light'}`}
                          data={{
                            labels: Object.keys(priorityData).map(priority => translateTaskPriority(priority)),
                            datasets: [{
                              data: Object.values(priorityData),
                              backgroundColor: Object.keys(priorityData).map(priority => (colors.priority as any)[priority] || '#d9d9d9'),
                              borderWidth: 2,
                              borderColor: isDarkMode ? '#ffffff' : '#000000',
                            }]
                          }}
                          options={chartOptions}
                        />
                        <ChartLegendNote 
                          data={{
                            labels: Object.keys(priorityData).map(priority => translateTaskPriority(priority)),
                            datasets: [{
                              data: Object.values(priorityData),
                              backgroundColor: Object.keys(priorityData).map(priority => (colors.priority as any)[priority] || '#d9d9d9')
                            }]
                          }}
                          isDarkTheme={isDarkMode}
                        />
                      </>
                    ) : (
                      <Empty 
                        description={t('common.noStatisticsAvailable')}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Card title={t('dashboard.tasksByUser')} size="small" className="dashboard-chart-card">
                  <div style={{ 
                    height: chartHeight,
                    overflow: isMobile ? 'auto' : 'visible',
                    padding: isMobile ? '8px' : '0'
                  }}>
                    {hasData(userData) ? (
                      <Bar
                        data={{
                          labels: Array.isArray(userData) ? userData.map(u => u.userName) : [],
                          datasets: [{
                            label: t('common.tasks'),
                            data: Array.isArray(userData) ? userData.map(u => u.count) : [],
                            backgroundColor: Array.isArray(userData) ? userData.map((_, index) => colors.primary[index % colors.primary.length]) : [],
                          }]
                        }}
                        options={{
                          ...barChartOptions,
                          indexAxis: 'y' as const,
                        }}
                      />
                    ) : (
                      <Empty 
                        description={t('common.noStatisticsAvailable')}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </>
    );
  }, [dashboardData, filteredTaskData, colors, chartOptions, barChartOptions, t, isDarkMode, dynamicStatusOptions, dynamicPriorityOptions, taskCategoryFilter, taskStatusFilter, taskPriorityFilter, translateTaskStatus, translateTaskPriority, isMobile]);

  // Render issue charts
  const renderIssueCharts = useCallback(() => {
    // Use filtered data if available, otherwise use original data
    const severityData = filteredIssueData?.severityData || dashboardData?.issuesBySeverity || {};
    const statusData = filteredIssueData?.statusData || dashboardData?.issuesByStatus || {};
    const userData = filteredIssueData?.userData || dashboardData?.issuesByUser || [];
    
    // Check if any data exists for the current filter
    const hasAnyData = hasData(severityData) || hasData(statusData) || hasData(userData);

    return (
      <>
        {isMobile ? (
          <MobileFilters
            searchValue=""
            statusValue={issueStatusFilter}
            priorityValue={issuePriorityFilter}
            typeValue={issueCategoryFilter}
            assigneeValue=""
            projectValue={selectedProjectId}
            statusOptions={dynamicIssueStatusOptions}
            priorityOptions={dynamicIssuePriorityOptions}
            typeOptions={issueCategoryOptions}
            assigneeOptions={[]}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onSearchChange={() => {}}
            onStatusChange={setIssueStatusFilter}
            onPriorityChange={setIssuePriorityFilter}
            onTypeChange={setIssueCategoryFilter}
            onAssigneeChange={() => {}}
            onProjectChange={setSelectedProjectId}
            onReset={handleResetIssueFilters}
            title="Bộ lọc vấn đề"
            isDarkMode={isDarkMode}
          />
        ) : (
          <ResponsiveCollapsibleFilters
            searchValue=""
            searchPlaceholder="Tìm kiếm vấn đề..."
            onSearchChange={() => {}}
            statusValue={issueStatusFilter}
            statusOptions={dynamicIssueStatusOptions}
            onStatusChange={setIssueStatusFilter}
            priorityValue={issuePriorityFilter}
            priorityOptions={dynamicIssuePriorityOptions}
            onPriorityChange={setIssuePriorityFilter}
            projectValue={selectedProjectId}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onProjectChange={setSelectedProjectId}
            assigneeValue=""
            assigneeOptions={[]}
            onAssigneeChange={() => {}}
            onReset={handleResetIssueFilters}
            title="Bộ lọc vấn đề"
            isMobile={isMobile}
            isTabletLandscape={window.innerWidth >= 769 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth}
            isDarkMode={isDarkMode}
            additionalFilters={
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div className="tablet-filter-item">
                    <div className="tablet-filter-label">Phân loại</div>
                    <Select
                      placeholder="Tất cả phân loại"
                      value={issueCategoryFilter}
                      onChange={setIssueCategoryFilter}
                      allowClear
                      style={{ width: '100%' }}
                      size="middle"
                    >
                      <Option value="all">Tất cả</Option>
                      {issueCategoryOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            }
          />
        )}
        {!hasAnyData ? (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Empty 
                  description={t('common.noStatisticsAvailable')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            </Col>
          </Row>
        ) : (
          <div className="dashboard-issue-charts">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('dashboard.issuesByStatus')} size="small" className="dashboard-chart-card">
                  <div style={{ 
                    height: chartHeight,
                    overflow: isMobile ? 'auto' : 'visible',
                    padding: isMobile ? '8px' : '0'
                  }}>
                    {hasData(statusData) ? (
                      <>
                        <Doughnut
                          data={{
                            labels: Object.keys(statusData).map(status => translateIssueStatus(status)),
                            datasets: [{
                              data: Object.values(statusData),
                              backgroundColor: Object.keys(statusData).map(status => (colors.status as any)[status] || '#d9d9d9'),
                              borderWidth: 2,
                              borderColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                            }]
                          }}
                          options={chartOptions}
                        />
                        <ChartLegendNote 
                          data={{
                            labels: Object.keys(statusData).map(status => translateIssueStatus(status)),
                            datasets: [{
                              data: Object.values(statusData),
                              backgroundColor: Object.keys(statusData).map(status => (colors.status as any)[status] || '#d9d9d9')
                            }]
                          }}
                          isDarkTheme={isDarkMode}
                        />
                      </>
                    ) : (
                      <Empty 
                        description={t('common.noStatisticsAvailable')}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title={t('dashboard.issuesBySeverity')} size="small" className="dashboard-chart-card">
                  <div style={{ 
                    height: chartHeight,
                    overflow: isMobile ? 'auto' : 'visible',
                    padding: isMobile ? '8px' : '0'
                  }}>
                    {hasData(severityData) ? (
                      <>
                        <Doughnut
                          data={{
                            labels: Object.keys(severityData).map(severity => translateIssuePriority(severity)),
                            datasets: [{
                              data: Object.values(severityData),
                              backgroundColor: Object.keys(severityData).map(severity => (colors.severity as any)[severity] || '#d9d9d9'),
                              borderWidth: 2,
                              borderColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                            }]
                          }}
                          options={chartOptions}
                        />
                        <ChartLegendNote 
                          data={{
                            labels: Object.keys(severityData).map(severity => translateIssuePriority(severity)),
                            datasets: [{
                              data: Object.values(severityData),
                              backgroundColor: Object.keys(severityData).map(severity => (colors.severity as any)[severity] || '#d9d9d9')
                            }]
                          }}
                          isDarkTheme={isDarkMode}
                        />
                      </>
                    ) : (
                      <Empty 
                        description={t('common.noStatisticsAvailable')}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Card title={t('dashboard.issuesByUser')} size="small" className="dashboard-chart-card">
                  <div style={{ 
                    height: chartHeight,
                    overflow: isMobile ? 'auto' : 'visible',
                    padding: isMobile ? '8px' : '0'
                  }}>
                    {hasData(userData) ? (
                      <Bar
                        data={{
                          labels: Array.isArray(userData) ? userData.map(u => u.userName) : [],
                          datasets: [{
                            label: t('common.issues'),
                            data: Array.isArray(userData) ? userData.map(u => u.count) : [],
                            backgroundColor: Array.isArray(userData) ? userData.map((_, index) => colors.primary[index % colors.primary.length]) : [],
                          }]
                        }}
                        options={{ 
                          ...barChartOptions,
                          indexAxis: 'y' as const,
                        }}
                      />
                    ) : (
                      <Empty 
                        description={t('common.noStatisticsAvailable')}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </>
    );
  }, [dashboardData, filteredIssueData, colors, chartOptions, barChartOptions, t, isDarkMode, dynamicIssueStatusOptions, dynamicIssuePriorityOptions, issueCategoryFilter, issueStatusFilter, issuePriorityFilter, issueCategoryOptions, translateIssueStatus, translateIssuePriority]);

  // Render document charts
  const renderDocumentCharts = useCallback(() => {
    // Ensure we have valid data with fallbacks
    const typeData = dashboardData?.documentsByType || {};
    const statusData = dashboardData?.documentsByStatus || {};
    const monthData = dashboardData?.documentsByMonth || [];
    
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title={t('dashboard.documentsByType')} size="small" className="dashboard-chart-card">
            <div style={{ 
              height: chartHeight,
              overflow: isMobile ? 'auto' : 'visible',
              padding: isMobile ? '8px' : '0'
            }}>
              <Pie
                data={{
                  labels: Object.keys(typeData),
                  datasets: [{
                    data: Object.values(typeData),
                    backgroundColor: colors.primary,
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title={t('dashboard.documentsByStatus')} size="small" className="dashboard-chart-card">
            <div style={{ 
              height: chartHeight,
              overflow: isMobile ? 'auto' : 'visible',
              padding: isMobile ? '8px' : '0'
            }}>
              <Doughnut
                data={{
                  labels: Object.keys(statusData),
                  datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: Object.keys(statusData).map(status => (colors.status as any)[status] || '#d9d9d9'),
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={24} lg={8}>
          <Card title={t('dashboard.documentsTimeline')} size="small" className="dashboard-chart-card">
            <div style={{ 
              height: chartHeight,
              overflow: isMobile ? 'auto' : 'visible',
              padding: isMobile ? '8px' : '0'
            }}>
              <Line
                data={{
                  labels: Array.isArray(monthData) ? monthData.map(item => item.month) : [],
                  datasets: [{
                    label: t('documents'),
                    data: Array.isArray(monthData) ? monthData.map(item => item.count) : [],
                    borderColor: '#1890ff',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    fill: true,
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </Card>
        </Col>
      </Row>
    );
  }, [dashboardData, colors, chartOptions, t, isMobile]);

  // Render calendar/event charts
  const renderCalendarCharts = useCallback(() => {
    // Ensure we have valid data with fallbacks
    const typeData = dashboardData?.eventsByType || {};
    const monthData = dashboardData?.eventsByMonth || [];
    const progressData = dashboardData?.projectProgress || [];
    
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title={t('dashboard.eventsByType')} size="small" className="dashboard-chart-card">
            <div style={{ 
              height: chartHeight,
              overflow: isMobile ? 'auto' : 'visible',
              padding: isMobile ? '8px' : '0'
            }}>
              <Pie
                data={{
                  labels: Object.keys(typeData),
                  datasets: [{
                    data: Object.values(typeData),
                    backgroundColor: colors.primary,
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={t('dashboard.eventsTimeline')} size="small" className="dashboard-chart-card">
            <div style={{ 
              height: chartHeight,
              overflow: isMobile ? 'auto' : 'visible',
              padding: isMobile ? '8px' : '0'
            }}>
              <Line
                data={{
                  labels: Array.isArray(monthData) ? monthData.map(item => item.month) : [],
                  datasets: [{
                    label: t('events'),
                    data: Array.isArray(monthData) ? monthData.map(item => item.count) : [],
                    borderColor: '#52c41a',
                    backgroundColor: 'rgba(82, 196, 26, 0.1)',
                    fill: true,
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24}>
          <Card title={t('dashboard.projectProgress')} size="small">
            <div style={{ 
              height: chartHeight,
              overflow: isMobile ? 'auto' : 'visible',
              padding: isMobile ? '8px' : '0'
            }}>
              <Bar
                data={{
                  labels: Array.isArray(progressData) ? progressData.map(item => item.projectName) : [],
                  datasets: [{
                    label: t('dashboard.projectProgress'),
                    data: Array.isArray(progressData) ? progressData.map(item => item.progress) : [],
                    backgroundColor: Array.isArray(progressData) ? progressData.map(item => {
                      if (item.progress >= 80) return '#52c41a';
                      if (item.progress >= 50) return '#faad14';
                      return '#f5222d';
                    }) : [],
                  }]
                }}
                options={{ 
                  ...barChartOptions,
                  scales: {
                    y: { 
                      beginAtZero: true,
                      max: 100,
                    }
                  }
                }} 
              />
              </div>
          </Card>
        </Col>
      </Row>
    );
  }, [dashboardData, colors, chartOptions, barChartOptions, t, isMobile]);

  // Render comprehensive overview
  const renderComprehensiveOverview = useCallback(() => {
    // Calculate task statistics with correct categorization
    const taskStatusData = dashboardData?.tasksByStatus || {};
    const completedTasks = taskStatusData['COMPLETED'] || 0;
    
    // Calculate overdue tasks from taskStatusData instead of stats to avoid double counting
    const overdueTasks = Object.entries(taskStatusData)
      .filter(([status]) => status.includes('OVERDUE'))
      .reduce((sum, [, count]) => sum + (count || 0), 0);
    
    // Calculate remaining tasks (not completed, not overdue)
    // This includes: TODO, IN_PROGRESS, REVIEW, and any other non-completed, non-overdue statuses
    const remainingTasks = Object.entries(taskStatusData)
      .filter(([status]) => status !== 'COMPLETED' && !status.includes('OVERDUE'))
      .reduce((sum, [, count]) => sum + (count || 0), 0);

    // Debug logging - only log issues in development
    if (process.env.NODE_ENV === 'development') {
      const manualTotal = Object.values(taskStatusData).reduce((sum, count) => sum + (count || 0), 0);
      const expectedTotal = dashboardData.stats.totalTasks || 0;
      if (manualTotal !== expectedTotal) {
        console.warn('⚠️ Task count mismatch:', { manualTotal, expectedTotal });
      }
    }

    // Calculate issue statistics with correct categorization
    const issueStatusData = dashboardData?.issuesByStatus || {};
    const resolvedIssues = dashboardData?.stats.resolvedIssues || 0;
    const overdueIssues = issueStatusData['OVERDUE'] || 0;
    
    // Calculate remaining issues (not resolved, not overdue)
    // This includes: NEW, IN_PROGRESS, CLOSED, and any other non-resolved statuses
    const remainingIssues = Object.entries(issueStatusData)
      .filter(([status]) => status !== 'RESOLVED' && status !== 'OVERDUE')
      .reduce((sum, [, count]) => sum + (count || 0), 0);

    // Task chart data
    const taskChartData = {
      completed: completedTasks,
      overdue: overdueTasks,
      remaining: Math.max(0, remainingTasks) // Ensure non-negative
    };

    // Calculate percentages for task chart
    const totalTasks = completedTasks + overdueTasks + Math.max(0, remainingTasks);
    const taskPercentages = {
      completed: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      overdue: totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0,
      remaining: totalTasks > 0 ? Math.round((Math.max(0, remainingTasks) / totalTasks) * 100) : 0
    };

    // Debug logging removed for production

    // Issue chart data
    const issueChartData = {
      resolved: resolvedIssues,
      overdue: overdueIssues,
      remaining: remainingIssues
    };

    // Calculate percentages for issue chart
    const totalIssues = resolvedIssues + overdueIssues + remainingIssues;
    const issuePercentages = {
      resolved: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
      overdue: totalIssues > 0 ? Math.round((overdueIssues / totalIssues) * 100) : 0,
      remaining: totalIssues > 0 ? Math.round((remainingIssues / totalIssues) * 100) : 0
    };

    // Colors for the charts
    const taskChartColors = {
      completed: '#52c41a',    // Green
      overdue: '#f5222d',      // Red
      remaining: '#1890ff'     // Blue
    };

    const issueChartColors = {
      resolved: '#52c41a',     // Green
      overdue: '#f5222d',      // Red
      remaining: '#faad14'     // Orange
    };

    return (
      <>
        <div className="dashboard-overview-charts">
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title={t('dashboard.taskStatistics')} size="small">
                <div style={{ height: chartHeight }}>
                  {hasData(taskChartData) ? (
                    <>
                      <Doughnut
                        data={{
                          labels: [
                            `Hoàn thành (${taskPercentages.completed}%)`, 
                            `Quá hạn (${taskPercentages.overdue}%)`, 
                            `Còn lại (${taskPercentages.remaining}%)`
                          ],
                          datasets: [{
                            data: [taskChartData.completed, taskChartData.overdue, taskChartData.remaining],
                            backgroundColor: [taskChartColors.completed, taskChartColors.overdue, taskChartColors.remaining],
                            borderWidth: 2,
                            borderColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                          }]
                        }}
                        options={chartOptions}
                      />
                      <ChartLegendNote 
                        data={{
                          labels: [
                            `Hoàn thành (${taskPercentages.completed}%)`, 
                            `Quá hạn (${taskPercentages.overdue}%)`, 
                            `Còn lại (${taskPercentages.remaining}%)`
                          ],
                          datasets: [{
                            data: [taskChartData.completed, taskChartData.overdue, taskChartData.remaining],
                            backgroundColor: [taskChartColors.completed, taskChartColors.overdue, taskChartColors.remaining]
                          }]
                        }}
                        isDarkTheme={isDarkMode}
                      />
                    </>
                  ) : (
                    <Empty 
                      description={t('common.noStatisticsAvailable')}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={t('dashboard.issueStatistics')} size="small">
                <div style={{ height: chartHeight }}>
                  {hasData(issueChartData) ? (
                    <>
                      <Doughnut
                        data={{
                          labels: [
                            `Đã giải quyết (${issuePercentages.resolved}%)`, 
                            `Quá hạn (${issuePercentages.overdue}%)`, 
                            `Còn lại (${issuePercentages.remaining}%)`
                          ],
                          datasets: [{
                            data: [issueChartData.resolved, issueChartData.overdue, issueChartData.remaining],
                            backgroundColor: [issueChartColors.resolved, issueChartColors.overdue, issueChartColors.remaining],
                            borderWidth: 2,
                            borderColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                          }]
                        }}
                        options={chartOptions}
                      />
                      <ChartLegendNote 
                        data={{
                          labels: [
                            `Đã giải quyết (${issuePercentages.resolved}%)`, 
                            `Quá hạn (${issuePercentages.overdue}%)`, 
                            `Còn lại (${issuePercentages.remaining}%)`
                          ],
                          datasets: [{
                            data: [issueChartData.resolved, issueChartData.overdue, issueChartData.remaining],
                            backgroundColor: [issueChartColors.resolved, issueChartColors.overdue, issueChartColors.remaining]
                          }]
                        }}
                        isDarkTheme={isDarkMode}
                      />
                    </>
                  ) : (
                    <Empty 
                      description={t('common.noStatisticsAvailable')}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }, [dashboardData, colors, chartOptions, t, isDarkMode]);

  // Thêm CSS styles cho legend (có thể thêm vào global styles hoặc styled-components)
  useEffect(() => {
    const legendStyles = `
      /* Dark theme styles */
      .ant-theme-dark .chartjs-legend-item {
        transition: all 0.3s ease;
        padding: 4px 8px;
        border-radius: 4px;
        color: #ffffff !important;
        background-color: #000000 !important;
      }
      
      .ant-theme-dark .chartjs-legend-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
        transform: translateX(2px);
      }
      
      .ant-theme-dark .chartjs-legend-text {
        color: #ffffff !important;
        background-color: #000000 !important;
        padding: 2px 6px;
        border-radius: 3px;
      }
      
      /* Light theme styles */
      body:not(.ant-theme-dark) .chartjs-legend-item {
        transition: all 0.3s ease;
        padding: 4px 8px;
        border-radius: 4px;
        color: #ffffff !important;
        background-color: #000000 !important;
      }
      
      body:not(.ant-theme-dark) .chartjs-legend-item:hover {
        background-color: rgba(0, 0, 0, 0.8);
        transform: translateX(2px);
      }
      
      body:not(.ant-theme-dark) .chartjs-legend-text {
        color: #ffffff !important;
        background-color: #000000 !important;
        padding: 2px 6px;
        border-radius: 3px;
      }
    `;

    const antDarkThemeOverrides = `
      /* Override Ant Design text colors in dark theme */
      .ant-theme-dark .ant-typography {
        color: #e8e8e8;
      }
      
      .ant-theme-dark .ant-typography.ant-typography-secondary {
        color: #bfbfbf;
      }
      
      .ant-theme-dark .ant-tag {
        color: #ffffff;
        font-weight: 500;
      }
      
      .ant-theme-dark .ant-empty-description {
        color: #bfbfbf;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.innerHTML = legendStyles + antDarkThemeOverrides;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isDarkMode]);

  // Render loading state
  if (loading && !hasTimeout) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip={t('loading')} />
      </div>
    );
  }

  // Render empty state
  if (!dashboardData || hasTimeout) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={hasTimeout ? t('dashboard.timeout') : (selectedProjectId ? t('dashboard.noData') : t('dashboard.loadingOverallStats'))}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Debug component for permissions - REMOVED */}
      {/* <PermissionDebug /> */}
      
      {/* Thông báo khi sử dụng fallback data */}
      {isUsingFallbackData && (
        <Alert
          message="Thông báo"
          description="Đang hiển thị dữ liệu mẫu do không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Row 
        justify="space-between" 
        align="middle" 
        style={{ 
          marginBottom: 24,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 0
        }}
      >
        <Col>
          <AntTitle level={isMobile ? 3 : 2}>
            <DashboardOutlined /> {t('dashboard.title')}
          </AntTitle>
        </Col>
        <Col>
          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }}>
            <Select
              style={{ width: isMobile ? '100%' : 250 }}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              placeholder={t('dashboard.selectProject')}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option key="all" value="">
                {t('dashboard.allProjects')}
              </Option>
              {Array.isArray(projects) && projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
            {/* Dashboard Action Buttons */}
            <div className="dashboard-action-buttons">
              {canExportDashboard && (
                <Tooltip title="Xuất báo cáo Dashboard">
                  <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    loading={isExporting}
                    onClick={handleExportReport}
                    size={isMobile ? 'small' : 'middle'}
                  >
                    {isMobile ? '' : 'Xuất báo cáo'}
                  </Button>
                </Tooltip>
              )}
            </div>
          </Space>
        </Col>
      </Row>

      {renderOverviewStats()}

      <SwipeableTabs 
        activeKey={chartView} 
        onChange={(key) => setChartView(key as any)}
        isDarkMode={isDarkMode}
      >
        <TabPane tab={<span><RadarChartOutlined /> {t('dashboard.overview')}</span>} key="overview">
          {renderComprehensiveOverview()}
        </TabPane>
        <TabPane tab={<span><CheckCircleOutlined /> {t('dashboard.tasks')}</span>} key="tasks">
          {renderTaskCharts()}
        </TabPane>
        <TabPane tab={<span><BugOutlined /> {t('dashboard.issues')}</span>} key="issues">
          {renderIssueCharts()}
        </TabPane>
        <TabPane tab={<span><FileTextOutlined /> {t('dashboard.documents')}</span>} key="documents">
          {renderDocumentCharts()}
        </TabPane>
        <TabPane tab={<span><CalendarOutlined /> {t('dashboard.calendar')}</span>} key="calendar">
          {renderCalendarCharts()}
        </TabPane>
      </SwipeableTabs>
    </div>
  );
};

export default Dashboard; 