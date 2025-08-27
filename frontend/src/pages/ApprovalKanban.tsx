import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Badge,
  Divider,
  Row,
  Col,
  Avatar,
  Dropdown,
  Menu,
  Popconfirm,
  Empty,
  Spin,
  Alert,
  Drawer,
  List,
  Tabs,
  Table,
  Statistic,
  Progress,
  Popover,
  Switch
} from 'antd';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import MobileApprovalCard from '../components/MobileApprovalCard';
import MobileFilters from '../components/MobileFilters';
import CommentDrawer from '../components/CommentDrawer';
import { useComments } from '../hooks/useComments';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import FloatingActionButton from '../components/FloatingActionButton';
import '../styles/approval-responsive.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-fab.css';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  PaperClipOutlined,
  MoreOutlined,
  DownOutlined,
  UpOutlined,
  BarChartOutlined,
  TableOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
  TeamOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import axiosInstance from '../axiosConfig';
import '../styles/approval-kanban.css';
import '../styles/desktop-icon-standardization.css';


import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/tablet-landscape-statistics-colors.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import '../styles/tablet-landscape-unified-forms.css';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title as ChartTitle, 
  Tooltip as ChartTooltip, 
  Legend as ChartLegend, 
  ArcElement, 
  BarElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getResponsiveChartOptions, getResponsiveChartHeight } from '../utils/responsiveChartOptions';

// Lazy load chart component for better performance
const LazyDoughnut = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })));

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Filler,
  ChartDataLabels
);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Types
interface DocumentCard {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  category: string;
  sendDate: string;
  signDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  currentStage: 'design' | 'kcs' | 'verification' | 'appraisal';
  currentVersion?: number;
  stageDisplay?: string;
  assignedTo?: string;
  assignedToId?: string;
  priority: 'low' | 'medium' | 'high';
  rejectionReason?: string;
  history: DocumentHistory[];
  attachments?: string[];
  lastModified: string;
  comments: DocumentComment[];
}

interface DocumentComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  stage: string;
}

interface DocumentHistory {
  id: string;
  action: string;
  fromStage: string;
  toStage: string;
  timestamp: string;
  userId: string;
  userName: string;
  comment?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  cardBgColor?: string;
  items: DocumentCard[];
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const ApprovalKanban: React.FC = () => {
  const { t } = useTranslation();
  
  // Theme detection
  const theme = useSelector((state: any) => state.ui?.theme);
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Mobile and tablet landscape detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  
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
  const [columns, setColumns] = useState<KanbanColumn[]>([
      {
        id: 'design',
        title: 'Thiết kế',
        color: '#1890ff',
        bgColor: 'rgba(24, 144, 255, 0.08)',
        cardBgColor: 'rgba(24, 144, 255, 0.05)',
        items: []
      },
      {
        id: 'kcs',
        title: 'KCS Nội Bộ',
        color: '#722ed1',
        bgColor: 'rgba(114, 46, 209, 0.08)',
        cardBgColor: 'rgba(114, 46, 209, 0.05)',
        items: []
      },
      {
        id: 'verification',
        title: 'Thẩm tra',
        color: '#13c2c2',
        bgColor: 'rgba(19, 194, 194, 0.08)',
        cardBgColor: 'rgba(19, 194, 194, 0.05)',
        items: []
      },
      {
        id: 'appraisal',
        title: 'Thẩm định',
        color: '#52c41a',
        bgColor: 'rgba(82, 196, 26, 0.08)',
        cardBgColor: 'rgba(82, 196, 26, 0.05)',
        items: []
      }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DocumentCard | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('kanban');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  
  // Filter states for statistics
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allDocuments, setAllDocuments] = useState<DocumentCard[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    statusStats: { pending: 0, approved: 0, rejected: 0, completed: 0 },
    stageStats: { design: 0, kcs: 0, verification: 0, appraisal: 0 },
    categoryStats: {},
    projectStats: []
  });

  // Mobile filter states
  const [mobileSearchValue, setMobileSearchValue] = useState('');
  const [mobileStatusValue, setMobileStatusValue] = useState('');
  const [mobilePriorityValue, setMobilePriorityValue] = useState('');
  const [mobileStageValue, setMobileStageValue] = useState('');
  const [mobileProjectValue, setMobileProjectValue] = useState('');
  const [mobileAssigneeValue, setMobileAssigneeValue] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentCard | null>(null);

  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Comment drawer state
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  
  // Comment system integration
  const {
    comments,
    loading: commentsLoading,
    fetchComments,
    addComment,
    deleteComment
  } = useComments({ entityType: 'documents' });

  const openCommentDrawer = () => {
    setCommentDrawerOpen(true);
    if (selectedCard?.id) {
      fetchComments(selectedCard.id);
    }
  };

  const closeCommentDrawer = () => {
    setCommentDrawerOpen(false);
  };

  const handleAddComment = async (content: string) => {
    if (!selectedCard?.id) return;
    try {
      await addComment(selectedCard.id, content);
      message.success('Đã thêm bình luận thành công!');
    } catch (error) {
      message.error('Không thể thêm bình luận!');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchApprovalDocuments();
    fetchProjects();
    fetchUsers();
    fetchStats();
  }, []);

  const fetchApprovalDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/approvals');
      const documents = Array.isArray(response.data?.documents) ? response.data.documents : [];
      
      // Lưu tất cả documents
      setAllDocuments(documents);
      
      // Group documents by stage
      const newColumns = columns.map(col => ({
        ...col,
        items: documents.filter((doc: DocumentCard) => doc.currentStage === col.id)
      }));
      
      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching approval documents:', error);
      message.error('Không thể tải danh sách hồ sơ!');
      // Set empty arrays to prevent errors
      setAllDocuments([]);
      const newColumns = columns.map(col => ({
        ...col,
        items: []
      }));
      setColumns(newColumns);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/projects?limit=100');
      console.log('Projects response:', response.data);
      setProjects(Array.isArray(response.data?.projects) ? response.data.projects : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/all?limit=100');
      console.log('Users response:', response.data);
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/approvals/stats');
      setStats(response.data || {
        total: 0,
        statusStats: { pending: 0, approved: 0, rejected: 0, completed: 0 },
        stageStats: { design: 0, kcs: 0, verification: 0, appraisal: 0 },
        categoryStats: {},
        projectStats: []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        total: 0,
        statusStats: { pending: 0, approved: 0, rejected: 0, completed: 0 },
        stageStats: { design: 0, kcs: 0, verification: 0, appraisal: 0 },
        categoryStats: {},
        projectStats: []
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const destColumn = columns.find(col => col.id === destination.droppableId);
      
      if (!sourceColumn || !destColumn) return;

    const sourceItems = [...sourceColumn.items];
    const destItems = source.droppableId === destination.droppableId 
      ? sourceItems 
      : [...destColumn.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    const newColumns = columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, items: sourceItems };
        }
        if (col.id === destination.droppableId) {
          return { ...col, items: destItems };
        }
        return col;
    });

    setColumns(newColumns);

    // Update document stage in backend
    updateDocumentStage(removed.id, destination.droppableId);
  };

  const updateDocumentStage = async (documentId: string, newStage: string) => {
    try {
      await axiosInstance.put(`/approvals/${documentId}/status`, {
        status: 'pending',
        stage: newStage
      });
      message.success('Đã cập nhật trạng thái hồ sơ!');
    } catch (error) {
      console.error('Error updating document stage:', error);
      message.error('Không thể cập nhật trạng thái hồ sơ!');
      // Revert changes if update fails
      fetchApprovalDocuments();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'rejected':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getColumnColor = (stage: string) => {
    switch (stage) {
      case 'design':
        return '#1890ff';
      case 'kcs':
        return '#722ed1';
      case 'verification':
        return '#13c2c2';
      case 'appraisal':
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'approved':
        return 'Đã phê duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  // Column collapse/expand handlers
  const toggleColumnCollapse = (columnId: string) => {
    const newCollapsed = new Set(collapsedColumns);
    if (newCollapsed.has(columnId)) {
      newCollapsed.delete(columnId);
    } else {
      newCollapsed.add(columnId);
    }
    setCollapsedColumns(newCollapsed);
  };

  // Touch/swipe handlers for tab navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const tabs = ['kanban', 'list', 'stats'];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (diffX > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        setActiveTab(tabs[currentIndex + 1]);
      } else if (diffX < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
  };

  const handleAddDocument = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmitDocument = async (values: any) => {
    setLoading(true);
    try {
      await axiosInstance.post('/approvals', {
        title: values.title,
        description: values.description,
        projectId: values.projectId,
        assignedToId: values.assignedToId,
        category: values.category || 'Giao Thông',
        priority: values.priority || 'medium'
      });

      setIsModalVisible(false);
      message.success('Đã tạo hồ sơ mới thành công!');
      fetchApprovalDocuments();
      fetchStats();
    } catch (error) {
      console.error('Error creating approval document:', error);
      message.error('Có lỗi xảy ra khi tạo hồ sơ!');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (card: DocumentCard) => {
    try {
    const nextStage = getNextStage(card.currentStage);
    if (nextStage) {
        await axiosInstance.put(`/approvals/${card.id}/status`, {
          status: 'approved',
          stage: nextStage
        });
      message.success(`Đã phê duyệt "${card.title}"`);
        fetchApprovalDocuments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving document:', error);
      message.error('Không thể phê duyệt hồ sơ!');
    }
  };

  const handleReject = (card: DocumentCard) => {
    setSelectedCard(card);
    rejectForm.resetFields();
    setIsRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values: any) => {
    if (!selectedCard) return;

    try {
      await axiosInstance.put(`/approvals/${selectedCard.id}/status`, {
        status: 'rejected',
        stage: 'design', // Trở về trạng thái thiết kế
        rejectionReason: values.rejectionReason
      });
      
      setIsRejectModalVisible(false);
      message.success('Đã từ chối hồ sơ và trở về trạng thái thiết kế!');
      fetchApprovalDocuments();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting document:', error);
      message.error('Không thể từ chối hồ sơ!');
    }
  };

  const handleSendToKCS = async (card: DocumentCard) => {
    try {
      await axiosInstance.put(`/approvals/${card.id}/status`, {
        status: 'pending',
        stage: 'kcs'
      });
    message.success(`Đã gửi "${card.title}" đến KCS Nội Bộ`);
      fetchApprovalDocuments();
      fetchStats();
    } catch (error) {
      console.error('Error sending to KCS:', error);
      message.error('Không thể gửi hồ sơ đến KCS!');
    }
  };

  const getNextStage = (currentStage: string): string | null => {
    switch (currentStage) {
      case 'design':
        return 'kcs';
      case 'kcs':
        return 'verification';
      case 'verification':
        return 'appraisal';
      case 'appraisal':
        return 'completed';
      default:
        return null;
    }
  };

  const handleViewHistory = (card: DocumentCard) => {
    setSelectedCard(card);
    setIsHistoryModalVisible(true);
  };



  const handleDeleteDocument = async (card: DocumentCard) => {
    try {
      await axiosInstance.delete(`/approvals/${card.id}`);
      message.success('Đã xóa hồ sơ thành công!');
      fetchApprovalDocuments();
      fetchStats();
    } catch (error) {
      console.error('Error deleting document:', error);
      message.error('Không thể xóa hồ sơ!');
    }
  };

  const handleDeleteClick = (card: DocumentCard) => {
    setDocumentToDelete(card);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDocumentToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      handleDeleteDocument(documentToDelete);
      setDeleteModalVisible(false);
      setDocumentToDelete(null);
    }
  };

  const handleEditDocument = (card: DocumentCard) => {
    setSelectedCard(card);
    editForm.setFieldsValue({
      title: card.title,
      description: card.description,
      projectId: card.projectId,
      assignedToId: card.assignedToId,
      category: card.category,
      priority: card.priority
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedCard) return;
    
    setLoading(true);
    try {
      await axiosInstance.put(`/approvals/${selectedCard.id}`, {
        title: values.title,
        description: values.description,
        projectId: values.projectId,
        assignedToId: values.assignedToId,
        category: values.category,
        priority: values.priority
      });
      message.success('Đã cập nhật hồ sơ!');
      setIsEditModalVisible(false);
      fetchApprovalDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      message.error('Không thể cập nhật hồ sơ!');
    } finally {
      setLoading(false);
    }
  };

  // Mobile filter handlers
  const handleMobileSearchChange = (value: string) => {
    setMobileSearchValue(value);
  };

  const handleMobileStatusChange = (value: string) => {
    setMobileStatusValue(value);
  };

  const handleMobilePriorityChange = (value: string) => {
    setMobilePriorityValue(value);
  };

  const handleMobileStageChange = (value: string) => {
    setMobileStageValue(value);
  };

  const handleMobileProjectChange = (value: string) => {
    setMobileProjectValue(value);
  };

  const handleMobileAssigneeChange = (value: string) => {
    setMobileAssigneeValue(value);
  };

  const handleMobileReset = () => {
    setMobileSearchValue('');
    setMobileStatusValue('');
    setMobilePriorityValue('');
    setMobileStageValue('');
    setMobileProjectValue('');
    setMobileAssigneeValue('');
  };

  // Filter options for mobile filters
  const mobileStatusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'approved', label: 'Đã phê duyệt' },
    { value: 'rejected', label: 'Từ chối' },
    { value: 'completed', label: 'Hoàn thành' }
  ];

  const mobilePriorityOptions = [
    { value: '', label: 'Tất cả mức độ' },
    { value: 'low', label: 'Thấp' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'high', label: 'Cao' }
  ];

  const mobileStageOptions = [
    { value: '', label: 'Tất cả giai đoạn' },
    { value: 'design', label: 'Thiết kế' },
    { value: 'kcs', label: 'KCS Nội Bộ' },
    { value: 'verification', label: 'Thẩm tra' },
    { value: 'appraisal', label: 'Thẩm định' }
  ];

  const mobileProjectOptions = [
    { value: '', label: 'Tất cả dự án' },
    ...(Array.isArray(projects) ? projects.map(project => ({
      value: project.id,
      label: project.name
    })) : [])
  ];

  const mobileAssigneeOptions = [
    { value: '', label: 'Tất cả người phụ trách' },
    ...(Array.isArray(users) ? users.map(user => ({
      value: user.id,
      label: user.name
    })) : [])
  ];

  // Hàm lọc dữ liệu theo filter
  const getFilteredDocuments = () => {
    let filtered = allDocuments;
    
    if (selectedProject !== 'all') {
      filtered = filtered.filter((doc: DocumentCard) => doc.projectId === selectedProject);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((doc: DocumentCard) => doc.category === selectedCategory);
    }
    
    if (selectedStage !== 'all') {
      filtered = filtered.filter((doc: DocumentCard) => doc.currentStage === selectedStage);
    }
    
    return filtered;
  };

  // Mobile filtering function
  const getMobileFilteredDocuments = () => {
    let filtered = allDocuments;

    // Search filter
    if (mobileSearchValue) {
      filtered = filtered.filter((doc: DocumentCard) => 
        doc.title.toLowerCase().includes(mobileSearchValue.toLowerCase()) ||
        doc.description?.toLowerCase().includes(mobileSearchValue.toLowerCase()) ||
        doc.projectName.toLowerCase().includes(mobileSearchValue.toLowerCase())
      );
    }

    // Status filter
    if (mobileStatusValue) {
      filtered = filtered.filter((doc: DocumentCard) => doc.status === mobileStatusValue);
    }

    // Priority filter
    if (mobilePriorityValue) {
      filtered = filtered.filter((doc: DocumentCard) => doc.priority === mobilePriorityValue);
    }

    // Stage filter
    if (mobileStageValue) {
      filtered = filtered.filter((doc: DocumentCard) => doc.currentStage === mobileStageValue);
    }

    // Project filter
    if (mobileProjectValue) {
      filtered = filtered.filter((doc: DocumentCard) => doc.projectId === mobileProjectValue);
    }

    // Assignee filter
    if (mobileAssigneeValue) {
      filtered = filtered.filter((doc: DocumentCard) => doc.assignedToId === mobileAssigneeValue);
    }

    return filtered;
  };

  // Hàm tính thống kê theo trạng thái (chỉ 2 trạng thái: phê duyệt và chưa phê duyệt)
  const getStatusStatistics = () => {
    const filteredDocs = getFilteredDocuments();
    const total = filteredDocs.length;
    
    const approved = filteredDocs.filter(doc => doc.status === 'approved' || doc.status === 'completed').length;
    const notApproved = total - approved;
    
    return {
      total,
      approved,
      notApproved,
      approvedPercentage: total > 0 ? Math.round((approved / total) * 100) : 0,
      notApprovedPercentage: total > 0 ? Math.round((notApproved / total) * 100) : 0
    };
  };

  // Hàm tính thống kê theo hạng mục (% hoàn thành)
  const getCategoryStatistics = () => {
    const filteredDocs = getFilteredDocuments();
    const categoryStats: { [key: string]: { total: number; completed: number; percentage: number } } = {};
    
    filteredDocs.forEach(doc => {
      if (!categoryStats[doc.category]) {
        categoryStats[doc.category] = { total: 0, completed: 0, percentage: 0 };
      }
      categoryStats[doc.category].total++;
      if (doc.status === 'approved' || doc.status === 'completed') {
        categoryStats[doc.category].completed++;
      }
    });
    
    // Tính phần trăm hoàn thành
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    });
    
    return categoryStats;
  };

  // Hàm tính thống kê theo giai đoạn (số đầu mục tại từng giai đoạn)
  const getStageStatistics = () => {
    const filteredDocs = getFilteredDocuments();
    const stageStats: { [key: string]: number } = {
      design: 0,
      kcs: 0,
      verification: 0,
      appraisal: 0
    };
    
    filteredDocs.forEach(doc => {
      stageStats[doc.currentStage]++;
    });
    
    return stageStats;
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
          Các mục khác:
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

  const renderCard = (card: DocumentCard, index: number) => {
    const isExpanded = expandedCards.has(card.id);
    
    // Use mobile component for mobile view
    if (isMobile) {
      return (
        <MobileApprovalCard
          card={card}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendToKCS={handleSendToKCS}
          onViewHistory={handleViewHistory}
          onAddComment={(card) => {
            setSelectedCard(card);
            openCommentDrawer();
          }}
          onEdit={handleEditDocument}
          onDelete={handleDeleteClick}
          onExpand={(cardId) => {
            const newExpanded = new Set(expandedCards);
            if (isExpanded) {
              newExpanded.delete(cardId);
            } else {
              newExpanded.add(cardId);
            }
            setExpandedCards(newExpanded);
          }}
          isExpanded={isExpanded}
        />
      );
    }
    
    return (
      <Draggable key={card.id} draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.8 : 1
            }}
          >
            <Card
              size="small"
              className={`kanban-card ${card.status === 'rejected' ? 'rejected' : ''}`}
              bodyStyle={{ padding: 8 }}
              style={{
                border: `2px solid ${getPriorityColor(card.priority)}`,
                backgroundColor: card.status === 'rejected' 
                  ? (isDarkMode ? '#2a1f1f' : '#fff2f0') 
                  : (isDarkMode 
                      ? `rgba(${getColumnColor(card.currentStage).replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.15)` 
                      : `rgba(${getColumnColor(card.currentStage).replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.08)`),
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Color indicator bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${getColumnColor(card.currentStage)} 0%, ${getPriorityColor(card.priority)} 100%)`,
                zIndex: 1
              }} />
              {/* Compact Header with Date */}
              <div className="card-header-compact">
                <div className="card-header-left">
                  <Tag color={getPriorityColor(card.priority)} className="priority-tag">
                    {card.priority.toUpperCase()}
                  </Tag>
                  <span className="status-icon">{getStatusIcon(card.status)}</span>
                  <Text style={{ fontSize: 11, color: isDarkMode ? '#d9d9d9' : '#666666', marginLeft: 8 }}>
                    <CalendarOutlined style={{ marginRight: 2 }} />
                    {dayjs(card.sendDate).format('DD/MM/YYYY')}
                  </Text>
                </div>
                <div className="card-header-right">
                  <Space size="small">
                    {card.comments.length > 0 && (
                      <Tooltip title={`${card.comments.length} bình luận`}>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<MessageOutlined />} 
                          onClick={() => {
                            setSelectedCard(card);
                            openCommentDrawer();
                          }}
                        />
                      </Tooltip>
                    )}
                    {card.attachments && card.attachments.length > 0 && (
                      <Tooltip title={`${card.attachments.length} tệp đính kèm`}>
                        <Button type="text" size="small" icon={<PaperClipOutlined />} />
                      </Tooltip>
                    )}
                    <Button 
                      type="text" 
                      size="small" 
                      icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => {
                        const newExpanded = new Set(expandedCards);
                        if (isExpanded) {
                          newExpanded.delete(card.id);
                        } else {
                          newExpanded.add(card.id);
                        }
                        setExpandedCards(newExpanded);
                      }}
                    />
                  </Space>
                </div>
              </div>

              {/* Title and Project Info - Compact */}
              <div style={{ marginBottom: 8 }}>
                <Title level={5} className="card-title-compact" style={{ 
                  color: isDarkMode ? '#ffffff' : '#000000',
                  marginBottom: 4
                }}>
                  {card.title}
                </Title>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <Text style={{ fontSize: 11, color: isDarkMode ? '#d9d9d9' : '#666666' }}>
                    <ProjectOutlined style={{ marginRight: 2 }} />
                    {card.projectName}
                  </Text>
                  
                  {card.assignedTo && (
                    <Text style={{ fontSize: 11, color: isDarkMode ? '#d9d9d9' : '#666666' }}>
                      <UserOutlined style={{ marginRight: 2 }} />
                      {card.assignedTo}
                    </Text>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="card-expanded-content">
                  {card.signDate && (
                    <div className="card-meta">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Ký: {dayjs(card.signDate).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  )}

                  {card.description && (
                    <Paragraph 
                      ellipsis={{ rows: 2, tooltip: card.description }}
                      className="card-description"
                      style={{ fontSize: 12, marginTop: 8 }}
                    >
                      {card.description}
                    </Paragraph>
                  )}

                  {card.rejectionReason && (
                    <Alert
                      message="Lý do từ chối"
                      description={card.rejectionReason}
                      type="error"
                      style={{ marginTop: 8, fontSize: 12 }}
                      showIcon
                    />
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="card-actions-compact">
                <Space size="small" wrap>
                  {/* Action Buttons - Icon only with colors */}
                  {card.currentStage === 'design' && (
                    <Tooltip title="Gửi đến KCS">
                      <Button
                        type="primary"
                        size="small"
                        icon={<SendOutlined />}
                        onClick={() => handleSendToKCS(card)}
                        style={{ 
                          width: 32, 
                          height: 32, 
                          padding: 0,
                          backgroundColor: '#1890ff',
                          borderColor: '#1890ff'
                        }}
                      />
                    </Tooltip>
                  )}

                  {(card.currentStage === 'kcs' || card.currentStage === 'verification' || card.currentStage === 'appraisal') && (
                    <>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(card)}
                        className="desktop-icon-standard desktop-icon-approve"
                        title="Phê duyệt"
                      />
                      <Button
                        size="small"
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleReject(card)}
                        className="desktop-icon-standard desktop-icon-reject"
                        title="Từ chối"
                      />
                    </>
                  )}

                  {/* External Action Icons */}
                  <Tooltip title="Xem lịch sử">
                    <Button
                      type="text"
                      size="small"
                      icon={<HistoryOutlined />}
                      onClick={() => handleViewHistory(card)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        padding: 0,
                        color: '#1890ff'
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="Thêm bình luận">
                    <Button
                      type="text"
                      size="small"
                      icon={<MessageOutlined />}
                      onClick={() => {
                        setSelectedCard(card);
                        openCommentDrawer();
                      }}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        padding: 0,
                        color: '#52c41a'
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="Chỉnh sửa hồ sơ">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditDocument(card)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        padding: 0,
                        color: '#1890ff'
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="Xóa hồ sơ">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteClick(card)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        padding: 0,
                        color: '#ff4d4f'
                      }}
                    />
                  </Tooltip>
                </Space>
              </div>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  // Table columns for list view
  const getTableColumns = () => [
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text: string, record: DocumentCard) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.title}</Text>
        </div>
      )
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (text: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'rejected' ? 'red' : 'blue'}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Hạng mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">
          {category}
        </Tag>
      )
    },
    {
      title: 'Giai đoạn',
      dataIndex: 'currentStage',
      key: 'currentStage',
      render: (stage: string, record: DocumentCard) => {
        const stageMap: { [key: string]: string } = {
          design: 'Thiết kế',
          kcs: 'KCS Nội Bộ',
          verification: 'Thẩm tra',
          appraisal: 'Thẩm định'
        };
        const stageName = stageMap[stage] || stage;
        const version = record.currentVersion || 1;
        return <Text>{stageName} lần {version}</Text>;
      }
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'sendDate',
      key: 'sendDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: DocumentCard) => (
        <div className="desktop-button-group">
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewHistory(record)}
            className="desktop-icon-standard desktop-icon-view"
            title="Xem lịch sử"
          />
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEditDocument(record)}
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
      )
    }
  ];

  // Get all documents for table view
  const getAllDocuments = () => {
    return columns.flatMap(col => col.items);
  };

  return (
    <div className="approval-kanban">
      {/* Mobile Simple Header */}
      {isMobile && (
        <div style={{ 
          padding: '8px 0 8px 0',
          background: isDarkMode ? '#000' : '#fff'
        }}>
          <div style={{
            padding: '8px 16px 4px',
            textAlign: 'center'
          }}>
            <Title level={4} style={{ 
              margin: 0, 
              color: isDarkMode ? 'rgba(255,255,255,0.85)' : '#000',
              fontSize: 16
            }}>
              Phê duyệt hồ sơ
            </Title>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={16}>
              <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Hệ thống phê duyệt hồ sơ
              </Title>
              {!isMobile && (
                <Text type="secondary">
                  Quản lý quy trình phê duyệt hồ sơ theo dạng Kanban
                </Text>
              )}
            </Col>
            <Col xs={24} sm={8} style={{ textAlign: isMobile ? 'center' : 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size={isMobile ? 'middle' : 'large'}
                onClick={handleAddDocument}
                block={isMobile}
              >
                + Thêm hồ sơ mới
              </Button>
            </Col>
          </Row>

          {/* Responsive Filters for Tablet Landscape */}
          {isTabletLandscape && (
            <ResponsiveCollapsibleFilters
              searchValue={mobileSearchValue}
              searchPlaceholder="Tìm kiếm hồ sơ..."
              onSearchChange={setMobileSearchValue}
              statusValue={mobileStatusValue}
              statusOptions={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'pending', label: 'Chờ phê duyệt' },
                { value: 'approved', label: 'Đã phê duyệt' },
                { value: 'rejected', label: 'Từ chối' },
                { value: 'completed', label: 'Hoàn thành' }
              ]}
              onStatusChange={setMobileStatusValue}
              priorityValue={mobilePriorityValue}
              priorityOptions={[
                { value: '', label: 'Tất cả độ ưu tiên' },
                { value: 'low', label: 'Thấp' },
                { value: 'medium', label: 'Trung bình' },
                { value: 'high', label: 'Cao' }
              ]}
              onPriorityChange={setMobilePriorityValue}
              projectValue={mobileProjectValue}
              projectOptions={Array.isArray(projects) ? projects.map(project => ({ value: project.id, label: project.name })) : []}
              onProjectChange={setMobileProjectValue}
              assigneeValue={mobileAssigneeValue}
              assigneeOptions={Array.isArray(users) ? users.map(user => ({ value: user.id, label: user.name })) : []}
              onAssigneeChange={setMobileAssigneeValue}
              onReset={() => {
                setMobileSearchValue('');
                setMobileStatusValue('');
                setMobilePriorityValue('');
                setMobileProjectValue('');
                setMobileAssigneeValue('');
              }}
              title="Bộ lọc hồ sơ"
              isMobile={isMobile}
              isTabletLandscape={isTabletLandscape}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      )}

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className={isMobile ? 'mobile-tabs' : ''}
      >
        {/* Mobile Swipe Indicator */}
        {isMobile && (
          <div className="mobile-swipe-indicator">
            {['kanban', 'list', 'stats'].map((tab, index) => (
              <div 
                key={tab}
                className={`mobile-swipe-dot ${activeTab === tab ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
        <TabPane 
          tab={isMobile ? <AppstoreOutlined style={{ fontSize: 20 }} /> : (
            <span>
              <BarChartOutlined />
              Kanban
            </span>
          )} 
          key="kanban"
        >
          {isMobile ? (
            // Mobile View - Vertical columns with collapse/expand
            <div 
              style={{ padding: '0 2px' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Mobile Filters */}
              <MobileFilters
                searchValue={mobileSearchValue}
                statusValue={mobileStatusValue}
                priorityValue={mobilePriorityValue}
                typeValue={mobileStageValue}
                assigneeValue={mobileAssigneeValue}
                projectValue={mobileProjectValue}
                statusOptions={mobileStatusOptions}
                priorityOptions={mobilePriorityOptions}
                typeOptions={mobileStageOptions}
                assigneeOptions={mobileAssigneeOptions}
                projectOptions={mobileProjectOptions}
                onSearchChange={handleMobileSearchChange}
                onStatusChange={handleMobileStatusChange}
                onPriorityChange={handleMobilePriorityChange}
                onTypeChange={handleMobileStageChange}
                onAssigneeChange={handleMobileAssigneeChange}
                onProjectChange={handleMobileProjectChange}
                onReset={handleMobileReset}
                title="Bộ lọc hồ sơ"
                isDarkMode={isDarkMode}
              />

              {/* Mobile Kanban Columns - Vertical Layout */}
              <div style={{ marginTop: '6px' }}>
                {columns.map((column, columnIndex) => (
                  <Card
                    key={column.id}
                    className={`mobile-kanban-column column-${column.id}`}
                    style={{
                      marginBottom: 4,
                      borderRadius: 8,
                      background: isDarkMode ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                      border: `1px solid ${column.color}`,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    title={
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleColumnCollapse(column.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ 
                            color: '#fff', 
                            fontWeight: 600, 
                            fontSize: 16 
                          }}>
                            {column.title}
                          </span>
                          <Badge 
                            count={column.items.length} 
                            style={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: column.color,
                              fontWeight: 600,
                              minWidth: 20,
                              height: 20,
                              lineHeight: '20px',
                              fontSize: 12
                            }} 
                          />
                        </div>
                        <Button
                          type="text"
                          size="small"
                          icon={collapsedColumns.has(column.id) ? <DownOutlined /> : <UpOutlined />}
                          style={{ 
                            color: '#fff', 
                            fontSize: 16,
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        />
                      </div>
                    }
                    headStyle={{
                      backgroundColor: column.color,
                      borderRadius: '8px 8px 0 0',
                      minHeight: 50,
                      padding: '8px 16px'
                    }}
                    bodyStyle={{
                      padding: collapsedColumns.has(column.id) ? 0 : 4,
                      maxHeight: collapsedColumns.has(column.id) ? 0 : '400px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {!collapsedColumns.has(column.id) && (
                      <div style={{ 
                        maxHeight: '350px', 
                        overflowY: 'auto',
                        overflowX: 'hidden'
                      }}>
                        {column.items.length === 0 ? (
                          <Empty
                            description="Không có hồ sơ"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ 
                              margin: '20px 0',
                              color: isDarkMode ? '#8c8c8c' : '#999'
                            }}
                          />
                        ) : (
                          column.items.map((card, index) => (
                            <div key={card.id} style={{ marginBottom: 8 }}>
                              <MobileApprovalCard
                                card={card}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onSendToKCS={handleSendToKCS}
                                onViewHistory={handleViewHistory}
                                onAddComment={(card) => {
                                  setSelectedCard(card);
                                  openCommentDrawer();
                                }}
                                onEdit={handleEditDocument}
                                onDelete={handleDeleteClick}
                                onExpand={(cardId) => {
                                  const newExpanded = new Set(expandedCards);
                                  if (newExpanded.has(cardId)) {
                                    newExpanded.delete(cardId);
                                  } else {
                                    newExpanded.add(cardId);
                                  }
                                  setExpandedCards(newExpanded);
                                }}
                                isExpanded={expandedCards.has(card.id)}
                                compactMode={true}
                                showQuickActions={true}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </Card>
                ))}

                {/* Empty state when no documents */}
                {columns.every(col => col.items.length === 0) && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: isDarkMode ? '#8c8c8c' : '#999'
                  }}>
                    <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                      Không tìm thấy hồ sơ
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      Thử điều chỉnh bộ lọc để xem thêm kết quả
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Desktop/Tablet Landscape View - Kanban board
            <DragDropContext onDragEnd={handleDragEnd}>
              <Row gutter={16} style={{ height: 'calc(100vh - 300px)', overflow: 'hidden' }}>
                {columns.map((column, index) => (
                  <Col 
                    key={column.id} 
                    span={isTabletLandscape ? 12 : 6} 
                    style={{ 
                      height: '100%',
                      marginBottom: isTabletLandscape ? 16 : 0
                    }}
                  >
                    <Card
                      className={`kanban-column column-${column.id}`}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{column.title}</span>
                          <Badge count={column.items.length} style={{ backgroundColor: column.color }} />
                        </div>
                      }
                      headStyle={{
                        backgroundColor: column.color,
                        color: '#fff',
                        borderBottom: `2px solid ${column.color}`
                      }}
                    >
                     <Droppable droppableId={column.id}>
                       {(provided, snapshot) => (
                         <div
                           ref={provided.innerRef}
                           {...provided.droppableProps}
                           className={`droppable-area ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                           style={{ 
                             backgroundColor: column.bgColor,
                             height: isTabletLandscape ? 'calc(100vh - 400px)' : 'auto',
                             overflowY: 'auto'
                           }}
                         >
                           {column.items.length === 0 ? (
                             <Empty
                               description="Không có hồ sơ"
                               image={Empty.PRESENTED_IMAGE_SIMPLE}
                               style={{ marginTop: 40 }}
                             />
                           ) : (
                             column.items.map((card, index) => renderCard(card, index))
                           )}
                           {provided.placeholder}
                         </div>
                       )}
                     </Droppable>
                   </Card>
                 </Col>
               ))}
             </Row>
           </DragDropContext>
          )}
        </TabPane>

        <TabPane 
          tab={isMobile ? <BarsOutlined style={{ fontSize: 20 }} /> : (
            <span>
              <TableOutlined />
              Danh sách
            </span>
          )} 
          key="list"
        >
          {!isMobile && (
            <div className="approval-container">
              <Row gutter={[16, 16]} className="dashboard-stats-row">
                <Col xs={12} sm={6}>
                  <ResponsiveStatCard
                    title="Tổng số hồ sơ"
                    value={stats?.total || 0}
                    icon={<FileTextOutlined />}
                    function="document-approval"
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <ResponsiveStatCard
                    title="Chờ xử lý"
                    value={stats?.statusStats?.pending || 0}
                    icon={<ClockCircleOutlined />}
                    function="document-approval"
                    color="#faad14"
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <ResponsiveStatCard
                    title="Đã phê duyệt"
                    value={stats?.statusStats?.approved || 0}
                    icon={<CheckCircleOutlined />}
                    function="document-approval"
                    color="#52c41a"
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <ResponsiveStatCard
                    title="Từ chối"
                    value={stats?.statusStats?.rejected || 0}
                    icon={<CloseCircleOutlined />}
                    function="document-approval"
                    color="#ff4d4f"
                  />
                </Col>
              </Row>
            </div>
          )}

          {/* Mobile List View */}
          {isMobile ? (
            <div 
              style={{ padding: '0 2px' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Mobile Stats Cards */}
              <div style={{ marginBottom: 16 }}>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Card size="small" style={{ 
                      borderRadius: 8,
                      background: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)',
                      border: `1px solid ${isDarkMode ? 'rgba(24, 144, 255, 0.3)' : 'rgba(24, 144, 255, 0.2)'}`
                    }}>
                      <Statistic
                        title="Tổng số"
                        value={stats?.total || 0}
                        prefix={<FileTextOutlined />}
                        valueStyle={{ fontSize: 16, color: '#1890ff' }}
                        style={{ textAlign: 'center' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ 
                      borderRadius: 8,
                      background: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 173, 20, 0.05)',
                      border: `1px solid ${isDarkMode ? 'rgba(250, 173, 20, 0.3)' : 'rgba(250, 173, 20, 0.2)'}`
                    }}>
                      <Statistic
                        title="Chờ xử lý"
                        value={stats?.statusStats?.pending || 0}
                        valueStyle={{ color: '#faad14', fontSize: 16 }}
                        prefix={<ClockCircleOutlined />}
                        style={{ textAlign: 'center' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ 
                      borderRadius: 8,
                      background: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.05)',
                      border: `1px solid ${isDarkMode ? 'rgba(82, 196, 26, 0.3)' : 'rgba(82, 196, 26, 0.2)'}`
                    }}>
                      <Statistic
                        title="Đã duyệt"
                        value={stats?.statusStats?.approved || 0}
                        valueStyle={{ color: '#52c41a', fontSize: 16 }}
                        prefix={<CheckCircleOutlined />}
                        style={{ textAlign: 'center' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ 
                      borderRadius: 8,
                      background: isDarkMode ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.05)',
                      border: `1px solid ${isDarkMode ? 'rgba(255, 77, 79, 0.3)' : 'rgba(255, 77, 79, 0.2)'}`
                    }}>
                      <Statistic
                        title="Từ chối"
                        value={stats?.statusStats?.rejected || 0}
                        valueStyle={{ color: '#ff4d4f', fontSize: 16 }}
                        prefix={<CloseCircleOutlined />}
                        style={{ textAlign: 'center' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              {/* Mobile Filters for List View */}
              <MobileFilters
                searchValue={mobileSearchValue}
                statusValue={mobileStatusValue}
                priorityValue={mobilePriorityValue}
                typeValue={mobileStageValue}
                assigneeValue={mobileAssigneeValue}
                projectValue={mobileProjectValue}
                statusOptions={mobileStatusOptions}
                priorityOptions={mobilePriorityOptions}
                typeOptions={mobileStageOptions}
                assigneeOptions={mobileAssigneeOptions}
                projectOptions={mobileProjectOptions}
                onSearchChange={handleMobileSearchChange}
                onStatusChange={handleMobileStatusChange}
                onPriorityChange={handleMobilePriorityChange}
                onTypeChange={handleMobileStageChange}
                onAssigneeChange={handleMobileAssigneeChange}
                onProjectChange={handleMobileProjectChange}
                onReset={handleMobileReset}
                title="Bộ lọc danh sách"
                isDarkMode={isDarkMode}
              />

              {/* Mobile Document Cards - List Style */}
              <div style={{ marginTop: '12px' }}>
                {getMobileFilteredDocuments().map((card, index) => (
                  <Card
                    key={card.id}
                    size="small"
                    className="mobile-list-card"
                    style={{
                      marginBottom: 8,
                      borderRadius: 8,
                      border: `2px solid ${getPriorityColor(card.priority) === 'red' ? '#ff4d4f' : getPriorityColor(card.priority) === 'orange' ? '#faad14' : '#52c41a'}`,
                      background: card.status === 'rejected' 
                        ? (isDarkMode ? '#2a1f1f' : '#fff2f0') 
                        : (isDarkMode 
                            ? `rgba(${getColumnColor(card.currentStage).replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.12)` 
                            : `rgba(${getColumnColor(card.currentStage).replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.06)`),
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: 12 }}
                  >
                    {/* Color indicator bar for mobile */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, ${getColumnColor(card.currentStage)} 0%, ${getPriorityColor(card.priority) === 'red' ? '#ff4d4f' : getPriorityColor(card.priority) === 'orange' ? '#faad14' : '#52c41a'} 100%)`,
                      zIndex: 1
                    }} />
                    {/* Card Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8
                    }}>
                      <div style={{ flex: 1, paddingRight: 8 }}>
                        <Title 
                          level={5} 
                          style={{ 
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 600,
                            color: isDarkMode ? '#ffffff' : '#000000',
                            lineHeight: 1.4
                          }}
                        >
                          {card.title}
                        </Title>
                        
                        {/* Key Info Row */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8, 
                          marginTop: 4,
                          flexWrap: 'wrap'
                        }}>
                          <Tag 
                            color={getPriorityColor(card.priority)} 
                            style={{ 
                              fontSize: 9, 
                              margin: 0,
                              padding: '1px 4px'
                            }}
                          >
                            {card.priority.toUpperCase()}
                          </Tag>
                          
                          <Tag 
                            color={card.status === 'approved' || card.status === 'completed' ? 'green' : 'orange'}
                            style={{ 
                              fontSize: 9, 
                              margin: 0,
                              padding: '1px 4px'
                            }}
                          >
                            {getStatusText(card.status)}
                          </Tag>
                          
                          <div style={{
                            fontSize: 10,
                            color: isDarkMode ? '#999' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            {getStatusIcon(card.status)}
                            <span>{card.currentStage.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        type="text" 
                        size="small" 
                        icon={expandedCards.has(card.id) ? <UpOutlined /> : <DownOutlined />}
                        onClick={() => {
                          const newExpanded = new Set(expandedCards);
                          if (expandedCards.has(card.id)) {
                            newExpanded.delete(card.id);
                          } else {
                            newExpanded.add(card.id);
                          }
                          setExpandedCards(newExpanded);
                        }}
                        style={{ 
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isDarkMode ? '#d9d9d9' : '#666666'
                        }}
                      />
                    </div>

                    {/* Expanded Details */}
                    {expandedCards.has(card.id) && (
                      <div style={{
                        paddingTop: 8,
                        borderTop: `1px solid ${isDarkMode ? '#2f2f2f' : '#f0f0f0'}`,
                        marginTop: 8
                      }}>
                        {/* Additional Info Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: 8,
                          marginBottom: 8
                        }}>
                          <div style={{
                            padding: 8,
                            backgroundColor: isDarkMode ? '#1f1f1f' : '#f8f9fa',
                            borderRadius: 4,
                            border: `1px solid ${isDarkMode ? '#303030' : '#e9ecef'}`
                          }}>
                            <Text style={{ 
                              fontSize: 10, 
                              color: isDarkMode ? '#999' : '#666',
                              display: 'block'
                            }}>
                              Hạng mục
                            </Text>
                            <Text style={{ 
                              fontSize: 12, 
                              fontWeight: 500,
                              color: isDarkMode ? '#fff' : '#000'
                            }}>
                              {card.category}
                            </Text>
                          </div>
                          
                          <div style={{
                            padding: 8,
                            backgroundColor: isDarkMode ? '#1f1f1f' : '#f8f9fa',
                            borderRadius: 4,
                            border: `1px solid ${isDarkMode ? '#303030' : '#e9ecef'}`
                          }}>
                            <Text style={{ 
                              fontSize: 10, 
                              color: isDarkMode ? '#999' : '#666',
                              display: 'block'
                            }}>
                              Ngày gửi
                            </Text>
                            <Text style={{ 
                              fontSize: 12, 
                              fontWeight: 500,
                              color: isDarkMode ? '#fff' : '#000'
                            }}>
                              {dayjs(card.sendDate).format('DD/MM/YYYY')}
                            </Text>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 8
                        }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {/* Stage-specific actions */}
                            {card.currentStage === 'design' && (
                              <Button
                                type="primary"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => handleSendToKCS(card)}
                                style={{ 
                                  height: 32,
                                  fontSize: 11,
                                  backgroundColor: '#1890ff'
                                }}
                              >
                                Gửi KCS
                              </Button>
                            )}

                            {(card.currentStage === 'kcs' || card.currentStage === 'verification' || card.currentStage === 'appraisal') && (
                              <>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<CheckCircleOutlined />}
                                  onClick={() => handleApprove(card)}
                                  style={{ 
                                    height: 32,
                                    fontSize: 11,
                                    backgroundColor: '#52c41a'
                                  }}
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  danger
                                  size="small"
                                  icon={<CloseCircleOutlined />}
                                  onClick={() => handleReject(card)}
                                  style={{ 
                                    height: 32,
                                    fontSize: 11
                                  }}
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                          </div>

                          {/* Secondary actions - Icon only */}
                          <div style={{ display: 'flex', gap: 4 }}>
                              <Tooltip title="Lịch sử">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<HistoryOutlined />}
                                  onClick={() => handleViewHistory(card)}
                                  style={{ 
                                    width: 36,
                                    height: 36,
                                    padding: 0,
                                    color: '#1890ff',
                                    backgroundColor: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditDocument(card)}
                                  style={{ 
                                    width: 36,
                                    height: 36,
                                    padding: 0,
                                    color: '#faad14',
                                    backgroundColor: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 173, 20, 0.05)',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Chi tiết">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => handleViewHistory(card)}
                                  style={{ 
                                    width: 36,
                                    height: 36,
                                    padding: 0,
                                    color: '#722ed1',
                                    backgroundColor: isDarkMode ? 'rgba(114, 46, 209, 0.1)' : 'rgba(114, 46, 209, 0.05)',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Bình luận">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<MessageOutlined />}
                                  onClick={() => {
                                    setSelectedCard(card);
                                    openCommentDrawer();
                                  }}
                                  style={{ 
                                    width: 36,
                                    height: 36,
                                    padding: 0,
                                    color: '#52c41a',
                                    backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.05)',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteClick(card)}
                                  style={{ 
                                    width: 36,
                                    height: 36,
                                    padding: 0,
                                    color: '#ff4d4f',
                                    backgroundColor: isDarkMode ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.05)',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                />
                              </Tooltip>
                            </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}

                {/* Empty state */}
                {getMobileFilteredDocuments().length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: isDarkMode ? '#8c8c8c' : '#999'
                  }}>
                    <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                      Không tìm thấy hồ sơ
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      Thử điều chỉnh bộ lọc để xem thêm kết quả
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Desktop Table View */
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>Danh sách hồ sơ</Title>
              {(() => {
              // Nhóm documents theo project
              const projectGroups: { [key: string]: { project: Project; documents: DocumentCard[] } } = {};
              
              getAllDocuments().forEach(doc => {
                const project = Array.isArray(projects) ? projects.find(p => p.id === doc.projectId) : undefined;
                if (project) {
                  if (!projectGroups[project.id]) {
                    projectGroups[project.id] = { project, documents: [] };
                  }
                  projectGroups[project.id].documents.push(doc);
                }
              });

              return Object.values(projectGroups).map(({ project, documents }) => (
                <div key={project.id} style={{ marginBottom: 16 }}>
                  {/* Project Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#f0f0f0',
                    borderRadius: '6px 6px 0 0',
                    border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                    borderBottom: 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Button
                        type="text"
                        size="small"
                        icon={collapsedProjects.has(project.id) ? <DownOutlined /> : <UpOutlined />}
                        onClick={() => toggleProjectCollapse(project.id)}
                        style={{ color: '#1890ff' }}
                      />
                      <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{project.name}</Text>
                      <Tag color="blue">{documents.length} hồ sơ</Tag>
                    </div>
                  </div>
                  
                  {/* Documents Table */}
                  {!collapsedProjects.has(project.id) && (
                    <div style={{ 
                      border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px'
                    }}>
                      <Table
                        dataSource={documents}
                        columns={[
                          {
                            title: 'Tên hồ sơ',
                            dataIndex: 'title',
                            key: 'title',
                            render: (text: string) => (
                              <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }} strong>{text}</Text>
                            )
                          },
                          {
                            title: 'Hạng mục',
                            dataIndex: 'category',
                            key: 'category',
                            render: (text: string) => (
                              <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{text}</Text>
                            )
                          },
                          {
                            title: 'Độ ưu tiên',
                            dataIndex: 'priority',
                            key: 'priority',
                            render: (priority: string) => (
                              <Tag color={getPriorityColor(priority)}>
                                {priority.toUpperCase()}
                              </Tag>
                            )
                          },
                          {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status: string) => (
                              <Tag color={status === 'approved' || status === 'completed' ? 'green' : 'orange'}>
                                {getStatusText(status)}
                              </Tag>
                            )
                          },
                          {
                            title: 'Giai đoạn',
                            dataIndex: 'currentStage',
                            key: 'currentStage',
                            render: (stage: string, record: DocumentCard) => (
                              <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                                {record.stageDisplay || `${stage} lần ${record.currentVersion || 1}`}
                              </Text>
                            )
                          },
                          {
                            title: 'Ngày gửi',
                            dataIndex: 'sendDate',
                            key: 'sendDate',
                            render: (date: string) => (
                              <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                                {dayjs(date).format('DD/MM/YYYY')}
                              </Text>
                            )
                          },
                          {
                            title: 'Thao tác',
                            key: 'actions',
                            render: (_, record: DocumentCard) => (
                              <Space>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<HistoryOutlined />}
                                  onClick={() => handleViewHistory(record)}
                                  title="Xem lịch sử"
                                />
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<MessageOutlined />}
                                  onClick={() => {
                                    setSelectedCard(record);
                                    openCommentDrawer();
                                  }}
                                  title="Bình luận"
                                />
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditDocument(record)}
                                  title="Chỉnh sửa"
                                />
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  title="Xóa"
                                  onClick={() => handleDeleteClick(record)}
                                />
                              </Space>
                            )
                          }
                        ]}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        style={{ 
                          backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                      />
                    </div>
                  )}
                </div>
              ));
            })()}
            </div>
          )}

        </TabPane>

        <TabPane 
          tab={isMobile ? <PieChartOutlined style={{ fontSize: 20 }} /> : (
            <span>
              <PieChartOutlined />
              Thống kê
            </span>
          )} 
          key="stats"
        >
          {isMobile ? (
            // Mobile Statistics View
            <div 
              style={{ padding: '0 2px' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >


              {/* Mobile Statistics Filters */}
              <MobileFilters
                searchValue=""
                statusValue=""
                priorityValue=""
                typeValue={selectedStage}
                assigneeValue=""
                projectValue={selectedProject}
                statusOptions={[]}
                priorityOptions={[]}
                typeOptions={[
                  { value: 'all', label: 'Tất cả giai đoạn' },
                  { value: 'design', label: 'Thiết kế' },
                  { value: 'kcs', label: 'KCS Nội Bộ' },
                  { value: 'verification', label: 'Thẩm tra' },
                  { value: 'appraisal', label: 'Thẩm định' }
                ]}
                assigneeOptions={[]}
                projectOptions={Array.isArray(projects) ? projects.map(p => ({ value: p.id, label: p.name })) : []}
                onSearchChange={() => {}}
                onStatusChange={() => {}}
                onPriorityChange={() => {}}
                onTypeChange={setSelectedStage}
                onAssigneeChange={() => {}}
                onProjectChange={setSelectedProject}
                onReset={() => {
                  setSelectedProject('all');
                  setSelectedStage('all');
                }}
                title="Bộ lọc thống kê"
                isDarkMode={isDarkMode}
              />

              {/* Mobile Statistics Charts - Only 3 Main Charts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Status Chart */}
                <Card 
                  title="Thống kê theo trạng thái" 
                  size="small"
                  style={{ borderRadius: 8 }}
                  headStyle={{ fontSize: 13, fontWeight: 600 }}
                >
                  <div style={{ height: 200 }}>
                    {(() => {
                      const statusStats = getStatusStatistics();
                      return (
                        <>
                          <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>}>
                            <LazyDoughnut
                            data={{
                              labels: ['Đã phê duyệt', 'Chưa phê duyệt'],
                              datasets: [{
                                data: [statusStats.approved, statusStats.notApproved],
                                backgroundColor: ['#52c41a', '#faad14'],
                                borderWidth: 2,
                                borderColor: '#ffffff',
                              }]
                            }}
                            options={getResponsiveChartOptions(true, false)}
                          />
                        </Suspense>
                          <div style={{ 
                            textAlign: 'center', 
                            marginTop: 12,
                            padding: '8px 0',
                            borderTop: `1px solid ${isDarkMode ? '#2f2f2f' : '#f0f0f0'}`
                          }}>
                            <div style={{ marginBottom: 4 }}>
                              <Text strong style={{ fontSize: 14 }}>
                                Tổng số: {statusStats.total}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                              <div style={{ textAlign: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#52c41a', fontWeight: 500 }}>
                                  Đã duyệt
                                </Text>
                                <div style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
                                  {statusStats.approvedPercentage}%
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#faad14', fontWeight: 500 }}>
                                  Chưa duyệt
                                </Text>
                                <div style={{ fontSize: 16, fontWeight: 600, color: '#faad14' }}>
                                  {statusStats.notApprovedPercentage}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card>

                {/* Category Chart */}
                <Card 
                  title="Thống kê theo hạng mục" 
                  size="small"
                  style={{ borderRadius: 8 }}
                  headStyle={{ fontSize: 13, fontWeight: 600 }}
                >
                  <div style={{ height: 200 }}>
                    {(() => {
                      const categoryStats = getCategoryStatistics();
                      const labels = Object.keys(categoryStats);
                      const data = Object.values(categoryStats).map((stat: any) => stat.percentage);
                      const colors = ['#1890ff', '#52c41a', '#722ed1', '#13c2c2', '#faad14', '#ff4d4f'];
                      
                      return (
                        <>
                          <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>}>
                            <LazyDoughnut
                              data={{
                                labels: labels,
                                datasets: [{
                                  data: data,
                                  backgroundColor: colors.slice(0, labels.length),
                                  borderWidth: 2,
                                  borderColor: '#ffffff',
                                }]
                              }}
                              options={getResponsiveChartOptions(true, false)}
                            />
                          </Suspense>
                          <div style={{ 
                            marginTop: 12,
                            padding: '8px 0',
                            borderTop: `1px solid ${isDarkMode ? '#2f2f2f' : '#f0f0f0'}`
                          }}>
                            {labels.map((category, index) => {
                              const stat = categoryStats[category];
                              return (
                                <div key={category} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: 6,
                                  padding: '4px 8px',
                                  backgroundColor: isDarkMode ? '#1f1f1f' : '#f8f9fa',
                                  borderRadius: 4,
                                  border: `1px solid ${isDarkMode ? '#303030' : '#e9ecef'}`
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      backgroundColor: colors[index]
                                    }} />
                                    <Text strong style={{ fontSize: 12 }}>{category}</Text>
                                  </div>
                                  <Text style={{ fontSize: 12, color: isDarkMode ? '#999' : '#666' }}>
                                    {stat.completed}/{stat.total} ({stat.percentage}%)
                                  </Text>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card>

                {/* Stage Chart */}
                <Card 
                  title="Thống kê theo giai đoạn" 
                  size="small"
                  style={{ borderRadius: 8 }}
                  headStyle={{ fontSize: 13, fontWeight: 600 }}
                >
                  <div style={{ height: 200 }}>
                    {(() => {
                      const stageStats = getStageStatistics();
                      const stageLabels = ['Thiết kế', 'KCS Nội Bộ', 'Thẩm tra', 'Thẩm định'];
                      const stageData = [stageStats.design, stageStats.kcs, stageStats.verification, stageStats.appraisal];
                      const stageColors = ['#1890ff', '#722ed1', '#13c2c2', '#52c41a'];
                      
                      return (
                        <>
                          <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>}>
                            <LazyDoughnut
                              data={{
                                labels: stageLabels,
                                datasets: [{
                                  data: stageData,
                                  backgroundColor: stageColors,
                                  borderWidth: 2,
                                  borderColor: '#ffffff',
                                }]
                              }}
                              options={getResponsiveChartOptions(true, false)}
                            />
                          </Suspense>
                          <div style={{ 
                            marginTop: 12,
                            padding: '8px 0',
                            borderTop: `1px solid ${isDarkMode ? '#2f2f2f' : '#f0f0f0'}`
                          }}>
                            {stageLabels.map((stage, index) => (
                              <div key={stage} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 6,
                                padding: '4px 8px',
                                backgroundColor: isDarkMode ? '#1f1f1f' : '#f8f9fa',
                                borderRadius: 4,
                                border: `1px solid ${isDarkMode ? '#303030' : '#e9ecef'}`
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: stageColors[index]
                                  }} />
                                  <Text strong style={{ fontSize: 12 }}>{stage}</Text>
                                </div>
                                <Text style={{ fontSize: 12, color: isDarkMode ? '#999' : '#666' }}>
                                  {stageData[index]} đầu mục
                                </Text>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            // Desktop Statistics View
            <>
              {/* Filter Controls */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card title="Lọc theo dự án" size="small">
                    <Select
                      placeholder="Chọn dự án"
                      value={selectedProject}
                      onChange={setSelectedProject}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      <Select.Option value="all">Tất cả dự án</Select.Option>
                      {Array.isArray(projects) && projects.map(project => (
                        <Select.Option key={project.id} value={project.id}>
                          {project.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card title="Lọc theo hạng mục" size="small">
                    <Select
                      placeholder="Chọn hạng mục"
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      <Select.Option value="all">Tất cả hạng mục</Select.Option>
                      <Select.Option value="Giao Thông">Giao Thông</Select.Option>
                      <Select.Option value="San Nền">San Nền</Select.Option>
                      <Select.Option value="Kè hồ">Kè hồ</Select.Option>
                    </Select>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card title="Lọc theo giai đoạn" size="small">
                    <Select
                      placeholder="Chọn giai đoạn"
                      value={selectedStage}
                      onChange={setSelectedStage}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      <Select.Option value="all">Tất cả giai đoạn</Select.Option>
                      <Select.Option value="design">Thiết kế</Select.Option>
                      <Select.Option value="kcs">KCS Nội Bộ</Select.Option>
                      <Select.Option value="verification">Thẩm tra</Select.Option>
                      <Select.Option value="appraisal">Thẩm định</Select.Option>
                    </Select>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card title="Tổng số hồ sơ" size="small">
                    <Statistic
                      title="Tổng số"
                      value={getFilteredDocuments().length}
                      prefix={<FileTextOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Statistics Charts */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <Card title="Thống kê theo trạng thái">
                    <div style={{ height: 400 }}>
                      {(() => {
                        const statusStats = getStatusStatistics();
                        return (
                          <>
                            <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>}>
                              <LazyDoughnut
                                data={{
                                  labels: ['Đã phê duyệt', 'Chưa phê duyệt'],
                                  datasets: [{
                                    data: [statusStats.approved, statusStats.notApproved],
                                    backgroundColor: ['#52c41a', '#faad14'],
                                    borderWidth: 2,
                                    borderColor: '#ffffff',
                                  }]
                                }}
                                options={getResponsiveChartOptions(false, false)}
                              />
                            </Suspense>
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                              <Text strong>Tổng số: {statusStats.total}</Text>
                              <br />
                              <Text type="secondary">
                                Đã phê duyệt: {statusStats.approvedPercentage}% | 
                                Chưa phê duyệt: {statusStats.notApprovedPercentage}%
                              </Text>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Thống kê theo hạng mục (% hoàn thành)">
                    <div style={{ height: 400 }}>
                      {(() => {
                        const categoryStats = getCategoryStatistics();
                        const labels = Object.keys(categoryStats);
                        const data = Object.values(categoryStats).map((stat: any) => stat.percentage);
                        const colors = ['#1890ff', '#52c41a', '#722ed1', '#13c2c2', '#faad14', '#ff4d4f'];
                        
                        return (
                          <>
                            <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>}>
                              <LazyDoughnut
                                data={{
                                  labels: labels,
                                  datasets: [{
                                    data: data,
                                    backgroundColor: colors.slice(0, labels.length),
                                    borderWidth: 2,
                                    borderColor: '#ffffff',
                                  }]
                                }}
                                options={getResponsiveChartOptions(false, false)}
                              />
                            </Suspense>
                            <div style={{ marginTop: 16 }}>
                              {labels.map((category, index) => {
                                const stat = categoryStats[category];
                                return (
                                  <div key={category} style={{ marginBottom: 8 }}>
                                    <Text strong>{category}:</Text>
                                    <br />
                                    <Text type="secondary">
                                      {stat.completed}/{stat.total} ({stat.percentage}% hoàn thành)
                                    </Text>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Thống kê theo giai đoạn (số đầu mục)">
                    <div style={{ height: 400 }}>
                      {(() => {
                        const stageStats = getStageStatistics();
                        return (
                          <>
                            <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>}>
                              <LazyDoughnut
                                data={{
                                  labels: ['Thiết kế', 'KCS Nội Bộ', 'Thẩm tra', 'Thẩm định'],
                                  datasets: [{
                                    data: [
                                      stageStats.design,
                                      stageStats.kcs,
                                      stageStats.verification,
                                      stageStats.appraisal
                                    ],
                                    backgroundColor: ['#1890ff', '#722ed1', '#13c2c2', '#52c41a'],
                                    borderWidth: 2,
                                    borderColor: '#ffffff',
                                  }]
                                }}
                                options={getResponsiveChartOptions(false, false)}
                              />
                            </Suspense>
                            <div style={{ marginTop: 16 }}>
                              <Text strong>Thiết kế: {stageStats.design} đầu mục</Text>
                              <br />
                              <Text strong>KCS Nội Bộ: {stageStats.kcs} đầu mục</Text>
                              <br />
                              <Text strong>Thẩm tra: {stageStats.verification} đầu mục</Text>
                              <br />
                              <Text strong>Thẩm định: {stageStats.appraisal} đầu mục</Text>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>
      </Tabs>

      {/* Add Document Modal - Responsive cho 3 thiết bị */}
      <Modal
        title="Thêm hồ sơ mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
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
          onFinish={handleSubmitDocument}
          className={
            isMobile ? "" : 
            isTabletLandscape ? "approval-form" : 
            ""
          }
        >
          <Form.Item
            name="title"
            label="Tên hồ sơ"
            rules={[{ required: true, message: 'Vui lòng nhập tên hồ sơ!' }]}
          >
            <Input placeholder="Nhập tên hồ sơ..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả hồ sơ..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Dự án"
                rules={[{ required: true, message: 'Vui lòng chọn dự án!' }]}
              >
                <Select placeholder="Chọn dự án...">
                  {Array.isArray(projects) && projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignedToId"
                label="Người phụ trách"
                rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
              >
                <Select placeholder="Chọn người phụ trách...">
                  {Array.isArray(users) && users.map(user => (
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
                name="category"
                label="Hạng mục"
                initialValue="Giao Thông"
                rules={[{ required: true, message: 'Vui lòng chọn hạng mục!' }]}
              >
                <Select>
                  <Option value="Giao Thông">Giao Thông</Option>
                  <Option value="San Nền">San Nền</Option>
                  <Option value="Kè hồ">Kè hồ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                initialValue="medium"
              >
                <Select>
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo hồ sơ
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title={`Lịch sử hồ sơ: ${selectedCard?.title}`}
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCard && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Tên hồ sơ:</Text>
                  <br />
                  <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{selectedCard.title}</Text>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Trạng thái hiện tại:</Text>
                  <br />
                  <Tag color={selectedCard.status === 'rejected' ? 'red' : 'blue'}>
                    {getStatusText(selectedCard.status)}
                  </Tag>
                </Col>
              </Row>
            </Card>

            <Divider orientation="left">Lịch sử hoạt động</Divider>

            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {selectedCard.history.map((item, index) => (
                <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{item.userName}</Text>
                        <Text style={{ fontSize: 12, color: isDarkMode ? '#ffffff' : '#000000' }}>
                          {dayjs(item.timestamp).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </div>
                      <Text style={{ fontSize: 12, color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {item.action === 'created' && 'Tạo hồ sơ'}
                        {item.action === 'approved' && 'Phê duyệt'}
                        {item.action === 'rejected' && 'Từ chối'}
                        {item.fromStage && item.toStage && `: ${item.fromStage} → ${item.toStage}`}
                      </Text>
                      {item.comment && (
                        <Paragraph style={{ marginTop: 4, fontSize: 12, color: isDarkMode ? '#ffffff' : '#000000' }}>
                          {item.comment}
                        </Paragraph>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối hồ sơ"
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
        >
          <Form.Item
            name="rejectionReason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối..." />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsRejectModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Từ chối
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Comment Drawer */}
      <CommentDrawer
        open={commentDrawerOpen}
        onClose={closeCommentDrawer}
        title={`Bình luận cho: ${selectedCard?.title || ''}`}
        entityType="documents"
        entityId={selectedCard?.id || null}
        comments={comments}
        loading={commentsLoading}
        onAddComment={handleAddComment}
        onFetchComments={fetchComments}
      />

      {/* Edit Document Modal */}
      <Modal
        title="Chỉnh sửa hồ sơ"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="Tên hồ sơ"
            rules={[{ required: true, message: 'Vui lòng nhập tên hồ sơ!' }]}
          >
            <Input placeholder="Nhập tên hồ sơ..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả hồ sơ..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Dự án"
                rules={[{ required: true, message: 'Vui lòng chọn dự án!' }]}
              >
                <Select placeholder="Chọn dự án...">
                  {Array.isArray(projects) && projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignedToId"
                label="Người phụ trách"
                rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
              >
                <Select placeholder="Chọn người phụ trách...">
                  {Array.isArray(users) && users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
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
                label="Hạng mục"
                rules={[{ required: true, message: 'Vui lòng chọn hạng mục!' }]}
              >
                <Select>
                  <Option value="Giao Thông">Giao Thông</Option>
                  <Option value="San Nền">San Nền</Option>
                  <Option value="Kè hồ">Kè hồ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
              >
                <Select>
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật hồ sơ
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Floating Action Button for Mobile and Tablet */}
      <FloatingActionButton 
        onClick={handleAddDocument}
        tooltip="Thêm hồ sơ mới"
        color={`linear-gradient(135deg, #13c2c2 0%, #08979c 100%)`}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa hồ sơ"
        content="Bạn có chắc chắn muốn xóa hồ sơ"
        itemName={documentToDelete?.title}
        size="medium"
      />
    </div>
  );
};

export default ApprovalKanban;
