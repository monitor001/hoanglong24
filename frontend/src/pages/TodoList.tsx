import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Popconfirm,
  Empty,
  Spin,
  Progress,
  Checkbox,
  List,
  Drawer,
  Statistic,
  Carousel,
  Dropdown,
  Menu
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined,
  BarChartOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  FireOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import axiosInstance from '../axiosConfig';
import '../styles/todo-list.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-improvements.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/todo-list-fullscreen.css';
import '../styles/tablet-landscape-swipe.css';

import '../styles/tablet-landscape-unified-forms.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  LeadingActions,
  Type as ListType
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import TabletLandscapeCollapsibleFilters from '../components/TabletLandscapeCollapsibleFilters';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import FloatingActionButton from '../components/FloatingActionButton';
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
import { Doughnut, Bar } from 'react-chartjs-2';
import { getResponsiveChartOptions, getResponsiveChartHeight } from '../utils/responsiveChartOptions';

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

// Types
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
}

interface DayCard {
  date: string;
  dayName: string;
  todos: Todo[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
}

const TodoList: React.FC = () => {
  const { t } = useTranslation();
  
  // ✅ Improved theme detection using Redux store
  const theme = useSelector((state: any) => state.ui?.theme);
  const isDarkMode = useSelector((state: any) => state.ui?.isDarkMode);
  
  // ✅ Enhanced responsive detection with breakpoints  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const swiperRef = useRef<any>(null);
  
  // Tablet touch handling states
  const [tabletTouchStartX, setTabletTouchStartX] = useState(0);
  const [tabletTouchStartY, setTabletTouchStartY] = useState(0);

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Better mobile detection
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const isMobileCheck = width <= 768 || isMobileDevice;
      setIsMobile(isMobileCheck);
      setIsTablet(width > 768 && width <= 1024);
      setIsDesktop(width > 1024);
      
      // Enhanced tablet landscape detection for fullscreen layout
      const isTabletLandscapeCheck = (width >= 769 && width <= 1366) || (width > 768 && height < width);
      setIsTabletLandscape(isTabletLandscapeCheck);
      
      // Adjust for landscape mode on mobile
      if (isMobileDevice && width > height) {
        setIsLandscape(true);
      } else {
        setIsLandscape(false);
      }
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    window.addEventListener('orientationchange', checkResponsive);
    
    return () => {
      window.removeEventListener('resize', checkResponsive);
      window.removeEventListener('orientationchange', checkResponsive);
    };
  }, []);
  
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [dayCards, setDayCards] = useState<DayCard[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [carouselKey, setCarouselKey] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Loading states for individual actions
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // Tablet landscape swipe states
  const [tabletSwiperRef, setTabletSwiperRef] = useState<any>(null);
  const [tabletCurrentGroup, setTabletCurrentGroup] = useState(0);
  const [tabletDayGroups, setTabletDayGroups] = useState<DayCard[][]>([]);

  // Generate day cards for the carousel (3 days: yesterday, today, tomorrow)
  const generateDayCards = (centerDate: dayjs.Dayjs) => {
    const cards: DayCard[] = [];
    
    // Show 3 days: yesterday, today, tomorrow for full screen layout
    for (let i = -1; i <= 1; i++) {
      const date = centerDate.add(i, 'day');
      const dayName = date.format('dddd');
      const dateStr = date.format('YYYY-MM-DD');
      
      cards.push({
        date: dateStr,
        dayName: dayName,
        todos: [],
        stats: {
          total: 0,
          completed: 0,
          pending: 0,
          completionRate: 0
        }
      });
    }
    
    return cards;
  };

  // Generate day groups for tablet landscape swipe (3 groups of 3 days each)
  const generateTabletDayGroups = (centerDate: dayjs.Dayjs) => {
    const groups: DayCard[][] = [];
    
    // Generate 3 groups: previous week, current week, next week
    for (let groupIndex = -1; groupIndex <= 1; groupIndex++) {
      const groupCenterDate = centerDate.add(groupIndex * 3, 'day');
      const group: DayCard[] = [];
      
      // Each group contains 3 days
      for (let dayIndex = -1; dayIndex <= 1; dayIndex++) {
        const date = groupCenterDate.add(dayIndex, 'day');
        const dayName = date.format('dddd');
        const dateStr = date.format('YYYY-MM-DD');
        
        group.push({
          date: dateStr,
          dayName: dayName,
          todos: [],
          stats: {
            total: 0,
            completed: 0,
            pending: 0,
            completionRate: 0
          }
        });
      }
      
      groups.push(group);
    }
    
    return groups;
  };

  // Fetch todos for a specific date
  const fetchTodosForDate = async (date: string) => {
    try {
      const response = await axiosInstance.get(`/todos/date?date=${date}`);
      return response.data?.todos || [];
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  };

  // Fetch all todos for the day cards - OPTIMIZED VERSION
  const fetchAllTodos = async () => {
    setLoading(true);
    try {
      const newDayCards = generateDayCards(currentDate);
      
      // Calculate date range for 3 days
      const startDate = currentDate.subtract(1, 'day').format('YYYY-MM-DD');
      const endDate = currentDate.add(1, 'day').format('YYYY-MM-DD');
      
      // Single API call for all 3 days
      const response = await axiosInstance.get(`/todos/range?start=${startDate}&end=${endDate}`);
      const allTodos = response.data?.todos || [];
      
      // Group todos by date
      const todosByDate = allTodos.reduce((acc: any, todo: Todo) => {
        const date = todo.dueDate.split('T')[0]; // Extract date part
        if (!acc[date]) acc[date] = [];
        acc[date].push(todo);
        return acc;
      }, {});
      
      // Assign todos to day cards and calculate stats
      for (let i = 0; i < newDayCards.length; i++) {
        const dateStr = newDayCards[i].date;
        const todos = todosByDate[dateStr] || [];
        newDayCards[i].todos = todos;
        
        // Calculate stats
        const total = todos.length;
        const completed = todos.filter((todo: Todo) => todo.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        newDayCards[i].stats = {
          total,
          completed,
          pending,
          completionRate
        };
      }
      
      setDayCards(newDayCards);
      
      // For tablet landscape, also generate day groups
      if (isTabletLandscape) {
        const newTabletDayGroups = generateTabletDayGroups(currentDate);
        
        // Calculate date range for all groups (9 days total)
        const tabletStartDate = currentDate.subtract(4, 'day').format('YYYY-MM-DD');
        const tabletEndDate = currentDate.add(4, 'day').format('YYYY-MM-DD');
        
        // Fetch todos for all groups
        const tabletResponse = await axiosInstance.get(`/todos/range?start=${tabletStartDate}&end=${tabletEndDate}`);
        const tabletAllTodos = tabletResponse.data?.todos || [];
        
        // Group todos by date for tablet
        const tabletTodosByDate = tabletAllTodos.reduce((acc: any, todo: Todo) => {
          const date = todo.dueDate.split('T')[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(todo);
          return acc;
        }, {});
        
        // Assign todos to tablet day groups
        for (let groupIndex = 0; groupIndex < newTabletDayGroups.length; groupIndex++) {
          for (let dayIndex = 0; dayIndex < newTabletDayGroups[groupIndex].length; dayIndex++) {
            const dateStr = newTabletDayGroups[groupIndex][dayIndex].date;
            const todos = tabletTodosByDate[dateStr] || [];
            newTabletDayGroups[groupIndex][dayIndex].todos = todos;
            
            // Calculate stats
            const total = todos.length;
            const completed = todos.filter((todo: Todo) => todo.completed).length;
            const pending = total - completed;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            newTabletDayGroups[groupIndex][dayIndex].stats = {
              total,
              completed,
              pending,
              completionRate
            };
          }
        }
        
        setTabletDayGroups(newTabletDayGroups);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      message.error('Không thể tải danh sách nhiệm vụ!');
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchAllTodos();
  }, [currentDate]);

  // Initialize tablet day groups on mount
  useEffect(() => {
    if (isTabletLandscape) {
      const groups = generateTabletDayGroups(dayjs());
      setTabletDayGroups(groups);
      setTabletCurrentGroup(1);
    }
  }, []);

  // Initialize tablet day groups when component mounts or when tablet landscape changes
  useEffect(() => {
    if (isTabletLandscape) {
      const groups = generateTabletDayGroups(currentDate);
      setTabletDayGroups(groups);
      setTabletCurrentGroup(1); // Start with center group
    } else {
      // Clear tablet day groups when not in tablet landscape
      setTabletDayGroups([]);
      setTabletCurrentGroup(0);
    }
  }, [isTabletLandscape, currentDate]);

  // Fetch todos when tablet landscape changes
  useEffect(() => {
    if (isTabletLandscape) {
      fetchAllTodos();
    }
  }, [isTabletLandscape]);



  // Offline support - Cache todos in localStorage
  useEffect(() => {
    if (dayCards.length > 0) {
      localStorage.setItem('todos_cache', JSON.stringify(dayCards));
    }
  }, [dayCards]);

  // Load from cache when offline
  const loadFromCache = () => {
    const cached = localStorage.getItem('todos_cache');
    if (cached && !navigator.onLine) {
      try {
        setDayCards(JSON.parse(cached));
        message.info('Đang sử dụng dữ liệu offline');
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    }
  };

  // Check online status and load cache if needed
  useEffect(() => {
    if (!navigator.onLine) {
      loadFromCache();
    }
    
    const handleOnline = () => {
      message.success('Đã kết nối lại internet');
      fetchAllTodos(); // Refresh data when back online
    };
    
    const handleOffline = () => {
      message.warning('Mất kết nối internet - Chế độ offline');
      loadFromCache();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Force center on today when component mounts
  useEffect(() => {
    const today = dayjs();
    setCurrentDate(today);
    // Force re-render to ensure today card is centered
    setTimeout(() => {
      setCurrentDate(today);
      setCarouselKey(prev => prev + 1);
    }, 100);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+N: Open create modal
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setSelectedDate(dayjs().format('YYYY-MM-DD'));
        setIsModalVisible(true);
      }
      
      // Arrow keys: Navigate days
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePreviousDay();
      }
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateNextDay();
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsModalVisible(false);
        setIsEditModalVisible(false);
      }
      
      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Ctrl+A: Select all todos
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      
      // Delete: Delete selected todos
      if (e.key === 'Delete' && selectedIds.length > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIds]); // Only depend on selectedIds, not currentDate

  // Enhanced responsive height calculation
  const getMobileCardHeight = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const headerHeight = (document.querySelector('.header') as HTMLElement)?.offsetHeight || 60;
    const navHeight = (document.querySelector('.navigation') as HTMLElement)?.offsetHeight || 50;
    const searchFilterHeight = (document.querySelector('.search-filter-section') as HTMLElement)?.offsetHeight || 60;
    const padding = 16;
    
    return `${viewportHeight - headerHeight - navHeight - searchFilterHeight - padding}px`;
  }, []);

  // Enhanced touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        navigateNextDay();
      } else {
        navigatePreviousDay();
      }
    }
  };

  // Tablet landscape touch gesture handlers
  const handleTabletTouchStart = (e: React.TouchEvent) => {
    setTabletTouchStartX(e.touches[0].clientX);
    setTabletTouchStartY(e.touches[0].clientY);
  };

  const handleTabletTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = tabletTouchStartX - touchEndX;
    const diffY = tabletTouchStartY - touchEndY;
    
    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        navigateTabletNextGroup();
      } else {
        navigateTabletPreviousGroup();
      }
    }
  };

  // Swiper handlers
  const handleSwiperSlideChange = (swiper: any) => {
    const newIndex = swiper.activeIndex;
    const newDate = currentDate.add(newIndex - 2, 'day');
    setCurrentDate(newDate);
  };

  // Navigation functions
  const navigatePreviousDay = () => {
    const newDate = currentDate.subtract(1, 'day');
    setCurrentDate(newDate);
    if (isMobile && swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const navigateNextDay = () => {
    const newDate = currentDate.add(1, 'day');
    setCurrentDate(newDate);
    if (isMobile && swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const navigateToToday = () => {
    const today = dayjs();
    setCurrentDate(today);
    if (isMobile && swiperRef.current) {
      swiperRef.current.swiper.slideTo(2); // Center on today
    }
  };

  // Tablet landscape navigation functions
  const navigateTabletPreviousGroup = () => {
    if (tabletSwiperRef && tabletCurrentGroup > 0) {
      const newGroup = tabletCurrentGroup - 1;
      setTabletCurrentGroup(newGroup);
      tabletSwiperRef.slidePrev();
      
      // Update current date to center of the new group
      const newCenterDate = currentDate.subtract(3, 'day');
      setCurrentDate(newCenterDate);
    }
  };

  const navigateTabletNextGroup = () => {
    if (tabletSwiperRef && tabletCurrentGroup < 2) { // 3 groups: 0, 1, 2
      const newGroup = tabletCurrentGroup + 1;
      setTabletCurrentGroup(newGroup);
      tabletSwiperRef.slideNext();
      
      // Update current date to center of the new group
      const newCenterDate = currentDate.add(3, 'day');
      setCurrentDate(newCenterDate);
    }
  };

  const navigateTabletToToday = () => {
    const today = dayjs();
    setCurrentDate(today);
    setTabletCurrentGroup(1); // Center group (index 1)
    if (tabletSwiperRef) {
      tabletSwiperRef.slideTo(1);
    }
  };

  // Tablet landscape swiper handlers
  const handleTabletSwiperSlideChange = (swiper: any) => {
    const newGroupIndex = swiper.activeIndex;
    setTabletCurrentGroup(newGroupIndex);
    
    // Update current date based on the new group
    const groupOffset = newGroupIndex - 1; // -1, 0, 1
    const newCenterDate = dayjs().add(groupOffset * 3, 'day');
    setCurrentDate(newCenterDate);
    
    // Refetch todos for the new date range
    setTimeout(() => {
      fetchAllTodos();
    }, 100);
  };

  // Create new todo
  const handleCreateTodo = async (values: any) => {
    try {
      setLoading(true);
      await axiosInstance.post('/todos', {
        title: values.title,
        description: values.description,
        priority: values.priority || 'MEDIUM',
        dueDate: selectedDate || dayjs().format('YYYY-MM-DD')
      });
      
      setIsModalVisible(false);
      form.resetFields();
      message.success('Đã tạo nhiệm vụ mới!');
      fetchAllTodos();
    } catch (error) {
      console.error('Error creating todo:', error);
      message.error('Không thể tạo nhiệm vụ!');
    } finally {
      setLoading(false);
    }
  };

  // Update todo
  const handleUpdateTodo = async (values: any) => {
    if (!selectedTodo) return;
    
    try {
      setLoading(true);
      await axiosInstance.put(`/todos/${selectedTodo.id}`, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate
      });
      
      setIsEditModalVisible(false);
      editForm.resetFields();
      message.success('Đã cập nhật nhiệm vụ!');
      fetchAllTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      message.error('Không thể cập nhật nhiệm vụ!');
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo completion with optimistic update
  const handleToggleTodo = async (todo: Todo) => {
    setTogglingId(todo.id);
    try {
      // Optimistic update
      setDayCards(prev => prev.map(dayCard => ({
        ...dayCard,
        todos: dayCard.todos.map(t => 
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        ),
        stats: {
          ...dayCard.stats,
          completed: dayCard.todos.filter(t => 
            t.id === todo.id ? !t.completed : t.completed
          ).length,
          pending: dayCard.todos.filter(t => 
            t.id === todo.id ? t.completed : !t.completed
          ).length
        }
      })));
      
      await axiosInstance.patch(`/todos/${todo.id}/toggle`);
      message.success(todo.completed ? 'Đã bỏ hoàn thành nhiệm vụ!' : 'Đã hoàn thành nhiệm vụ!');
    } catch (error) {
      console.error('Error toggling todo:', error);
      message.error('Không thể cập nhật trạng thái nhiệm vụ!');
      // Revert optimistic update on error
      fetchAllTodos();
    } finally {
      setTogglingId(null);
    }
  };

  // Delete todo with optimistic update
  const handleDeleteTodo = async (todo: Todo) => {
    setDeletingId(todo.id);
    try {
      // Optimistic update
      setDayCards(prev => prev.map(dayCard => ({
        ...dayCard,
        todos: dayCard.todos.filter(t => t.id !== todo.id),
        stats: {
          ...dayCard.stats,
          total: dayCard.stats.total - 1,
          completed: dayCard.todos.filter(t => t.id !== todo.id && t.completed).length,
          pending: dayCard.todos.filter(t => t.id !== todo.id && !t.completed).length
        }
      })));
      
      await axiosInstance.delete(`/todos/${todo.id}`);
      message.success('Đã xóa nhiệm vụ!');
      setIsDeleteModalVisible(false);
      setTodoToDelete(null);
    } catch (error) {
      console.error('Error deleting todo:', error);
      message.error('Không thể xóa nhiệm vụ!');
      // Revert optimistic update on error
      fetchAllTodos();
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteConfirm = (todo: Todo) => {
    setTodoToDelete(todo);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setTodoToDelete(null);
  };

  // Edit todo
  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    editForm.setFieldsValue({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: dayjs(todo.dueDate)
    });
    setIsEditModalVisible(true);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <FireOutlined style={{ color: '#ff4d4f' }} />;
      case 'high':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'medium':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'low':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  // Debounced search implementation
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Memoized filter function
  const filterTodos = useCallback((todos: Todo[]) => {
    return todos.filter(todo => {
      // Search filter using debounced term
      const matchesSearch = !debouncedSearchTerm || 
        todo.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      // Priority filter
      const matchesPriority = !priorityFilter || 
        todo.priority.toLowerCase() === priorityFilter.toLowerCase();
      
      // Status filter
      const matchesStatus = !statusFilter || 
        (statusFilter === 'completed' && todo.completed) ||
        (statusFilter === 'pending' && !todo.completed);
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [debouncedSearchTerm, priorityFilter, statusFilter]);

  // Helper functions for mobile
  const getPriorityBgColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return '#ff4d4f';
      case 'high': return '#faad14';
      case 'medium': return '#1890ff';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  // Render mobile day card
  const renderMobileDayCard = (dayCard: DayCard, index: number) => {
    const isToday = dayjs(dayCard.date).isSame(dayjs(), 'day');
    
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '4px',
        overflow: 'hidden'
      }}>
        {/* Compact Header - 40px */}
        <div style={{
          height: '40px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          backgroundColor: isToday ? 'rgba(24, 144, 255, 0.1)' : (isDarkMode ? '#1a1a1a' : '#fafafa'),
          borderRadius: '6px',
          marginBottom: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text strong style={{ fontSize: '16px', color: isDarkMode ? '#fff' : '#000' }}>
              {dayjs(dayCard.date).format('DD/MM')}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {dayCard.dayName}
            </Text>
            {isToday && (
              <Badge 
                count="Hôm nay" 
                style={{ 
                  backgroundColor: '#1890ff',
                  fontSize: '10px',
                  height: '18px',
                  lineHeight: '18px',
                  padding: '0 6px'
                }} 
              />
            )}
          </div>
        </div>

        {/* Horizontal Progress Bar - 24px */}
        <div style={{
          height: '24px',
          flexShrink: 0,
          marginBottom: '8px',
          padding: '0 4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Text style={{ fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#fff' : '#000' }}>
              {dayCard.stats.completed}/{dayCard.stats.total}
            </Text>
            <Text style={{ fontSize: '10px', fontWeight: '600', color: dayCard.stats.completionRate === 100 ? '#52c41a' : '#1890ff' }}>
              {dayCard.stats.completionRate === 100 ? '✓' : `${dayCard.stats.completionRate}%`}
            </Text>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: isDarkMode ? '#303030' : '#f0f0f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${dayCard.stats.completionRate}%`,
              height: '100%',
              background: dayCard.stats.completionRate === 100 
                ? 'linear-gradient(90deg, #52c41a, #95de64)' 
                : 'linear-gradient(90deg, #1890ff, #40a9ff)',
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* Todo List - Flexible height */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '0 4px',
          minHeight: 0 // Important for flex child
        }}>
          {dayCard.todos.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có nhiệm vụ"
              style={{ marginTop: '40px' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedDate(dayCard.date);
                  setIsModalVisible(true);
                }}
              >
                Thêm nhiệm vụ
              </Button>
            </Empty>
          ) : (
            <div style={{ paddingBottom: '8px' }}>
              <SwipeableList type={ListType.IOS}>
                {filterTodos(dayCard.todos)
                  .sort((a, b) => {
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    const aPriority = priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] || 0;
                    const bPriority = priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder] || 0;
                    return bPriority - aPriority;
                  })
                  .map(todo => renderCompactTodoItem(todo))}
              </SwipeableList>
              
              {/* Add task button for mobile - Always visible */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  marginTop: '8px',
                  backgroundColor: 'transparent',
                  border: `2px dashed ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'sticky',
                  bottom: '8px',
                  zIndex: 10
                }}
                onClick={() => {
                  setSelectedDate(dayCard.date);
                  setIsModalVisible(true);
                }}
              >
                <PlusOutlined style={{ fontSize: '16px', color: isDarkMode ? '#ffffff' : '#999999', marginRight: '8px' }} />
                <span style={{ color: isDarkMode ? '#ffffff' : '#999999', fontSize: '14px' }}>
                  Thêm nhiệm vụ
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render compact todo item for mobile with swipe gestures
  const renderCompactTodoItem = (todo: Todo) => {
    const isSelected = selectedIds.includes(todo.id);
    const isDeleting = deletingId === todo.id;
    const isToggling = togglingId === todo.id;

    // Leading actions (swipe right) - Complete action
    const leadingActions = () => (
      <LeadingActions>
        <SwipeAction
          onClick={() => handleToggleTodo(todo)}
        >
          <div style={{
            backgroundColor: todo.completed ? '#faad14' : '#52c41a',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',
            height: '100%',
            minWidth: '100px',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '20px' }}>{todo.completed ? '↺' : '✓'}</span>
            <span style={{ fontSize: '12px' }}>{todo.completed ? 'Hoàn tác' : 'Hoàn thành'}</span>
          </div>
        </SwipeAction>
      </LeadingActions>
    );

    // Trailing actions (swipe left) - Edit and Delete actions
    const trailingActions = () => (
      <TrailingActions>
        <SwipeAction
          onClick={() => handleEditTodo(todo)}
        >
          <div style={{
            backgroundColor: '#1890ff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',
            height: '100%',
            minWidth: '100px',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <EditOutlined style={{ fontSize: '18px' }} />
            <span style={{ fontSize: '12px' }}>Sửa</span>
          </div>
        </SwipeAction>
        <SwipeAction
          onClick={() => handleDeleteConfirm(todo)}
        >
          <div style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',
            height: '100%',
            minWidth: '100px',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <DeleteOutlined style={{ fontSize: '18px' }} />
            <span style={{ fontSize: '12px' }}>Xóa</span>
          </div>
        </SwipeAction>
      </TrailingActions>
    );

    return (
      <SwipeableListItem
        key={todo.id}
        leadingActions={leadingActions()}
        trailingActions={trailingActions()}
        threshold={0.25}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 12px',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
            borderRadius: '8px',
            border: `1px solid ${isSelected ? '#1890ff' : isDarkMode ? '#303030' : '#f0f0f0'}`,
            boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
            opacity: todo.completed ? 0.7 : 1,
            pointerEvents: isDeleting || isToggling ? 'none' : 'auto',
            cursor: 'pointer',
            gap: '12px',
            width: '100%',
            boxSizing: 'border-box',
            minHeight: '60px',
            marginBottom: '8px'
          }}
          onClick={() => {
            if (isSelected) {
              setSelectedIds(prev => prev.filter(id => id !== todo.id));
            } else {
              setSelectedIds(prev => [...prev, todo.id]);
            }
          }}
        >
          <Checkbox
            checked={todo.completed}
            onChange={(e) => {
              e.stopPropagation();
              handleToggleTodo(todo);
            }}
            style={{ flexShrink: 0 }}
          />
          
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: todo.completed ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: isDarkMode ? '#fff' : '#000',
              lineHeight: '1.4',
              marginBottom: '4px'
            }}>
              {todo.title}
            </div>
            {todo.description && (
              <div style={{
                fontSize: '12px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: '1.3'
              }}>
                {todo.description}
              </div>
            )}
          </div>
          
          {/* Priority badge - compact */}
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: getPriorityBgColor(todo.priority),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>
              {todo.priority[0].toUpperCase()}
            </span>
          </div>
        </div>
      </SwipeableListItem>
    );
  };
  
  // Memoize filtered day cards
  const filteredDayCards = useMemo(() => {
    return dayCards.map(card => ({
      ...card,
      filteredTodos: filterTodos(card.todos)
    }));
  }, [dayCards, filterTodos]);

            // Enhanced render todo item with swipe actions on mobile
    const renderTodoItem = (todo: Todo) => {
      const menu = (
        <Menu>
          <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEditTodo(todo)}>
            Chỉnh sửa
          </Menu.Item>
          <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteConfirm(todo)}>
            Xóa
          </Menu.Item>
        </Menu>
      );

      const isDeleting = deletingId === todo.id;
      const isToggling = togglingId === todo.id;
      const isSelected = selectedIds.includes(todo.id);

      const todoContent = (
        <Tooltip
          title={
            todo.description ? (
              <div style={{ maxWidth: '300px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>
                  {todo.title}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.4', 
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                  {todo.description}
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  paddingTop: '8px', 
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '11px',
                  opacity: 0.8,
                  color: '#ffffff'
                }}>
                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ color: '#1890ff' }}>Độ ưu tiên:</span> {todo.priority}
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ color: '#1890ff' }}>Hạn:</span> {dayjs(todo.dueDate).format('DD/MM/YYYY')}
                  </div>
                  <div>
                    <span style={{ color: '#1890ff' }}>Trạng thái:</span> {todo.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '200px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>
                  {todo.title}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, color: '#ffffff' }}>
                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ color: '#1890ff' }}>Độ ưu tiên:</span> {todo.priority}
                  </div>
                  <div>
                    <span style={{ color: '#1890ff' }}>Hạn:</span> {dayjs(todo.dueDate).format('DD/MM/YYYY')}
                  </div>
                </div>
              </div>
            )
          }
          placement="right"
          mouseEnterDelay={0.3}
          overlayStyle={{ maxWidth: '350px' }}
          color="rgba(0, 0, 0, 0.9)"
        >
          <div
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
              padding: isMobile ? '8px 10px' : '4px 6px',
              marginBottom: isMobile ? '4px' : '3px',
              backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
              border: `1px solid ${isSelected ? '#1890ff' : isDarkMode ? '#434343' : '#f0f0f0'}`,
              borderRadius: isMobile ? '6px' : '4px',
              textDecoration: todo.completed ? 'line-through' : 'none',
              transition: 'all 0.3s ease',
              fontSize: isMobile ? '13px' : '11px',
              position: 'relative',
              // Disable interaction when loading
              pointerEvents: isDeleting || isToggling ? 'none' : 'auto',
              opacity: isDeleting || isToggling ? 0.5 : (todo.completed ? 0.7 : 1),
              cursor: 'pointer',
              boxShadow: 'none'
            }}
            onClick={() => {
              if (isSelected) {
                setSelectedIds(prev => prev.filter(id => id !== todo.id));
              } else {
                setSelectedIds(prev => [...prev, todo.id]);
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '6px' }}>
              <Checkbox
                checked={todo.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleTodo(todo);
                }}
                disabled={isToggling || isDeleting}
                style={{ marginRight: '4px' }}
              />
              
              {/* Selection indicator */}
              {isSelected && (
                <div style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: '#1890ff',
                  marginLeft: '-2px'
                }} />
              )}
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text
                    strong
                    style={{
                      color: isDarkMode ? '#ffffff' : '#000000',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      fontSize: isMobile ? '13px' : '11px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      lineHeight: '1.2'
                    }}
                  >
                    {todo.title}
                  </Text>
                  {/* Show description indicator if exists */}
                  {todo.description && (
                    <Tooltip title="Có mô tả chi tiết">
                      <InfoCircleOutlined 
                        className="info-icon"
                        style={{ 
                          fontSize: isMobile ? '10px' : '8px', 
                          color: '#1890ff',
                          opacity: 0.7,
                          flexShrink: 0
                        }} 
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
              
              {/* Enhanced Priority indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '3px' }}>
                <Tooltip title={`Độ ưu tiên: ${todo.priority}`}>
                  <div className={`priority-indicator priority-${todo.priority.toLowerCase()}`}>
                    {getPriorityIcon(todo.priority)}
                    <span style={{ fontSize: isMobile ? '8px' : '7px' }}>
                      {todo.priority.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Tooltip>
                
                {/* Loading indicator */}
                {(isDeleting || isToggling) && (
                  <Spin size="small" />
                )}
                
                {/* Dropdown menu - larger touch target for mobile */}
                <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                  <Button
                    type="text"
                    size={isMobile ? "small" : "small"}
                    icon={<MoreOutlined />}
                                  style={{ 
                padding: isMobile ? '4px 6px' : '2px 3px', 
                      color: isDarkMode ? '#d9d9d9' : '#666666',
                                        minWidth: isMobile ? '32px' : 'auto',
                  minHeight: isMobile ? '32px' : 'auto'
                    }}
                    disabled={isDeleting || isToggling}
                  />
                </Dropdown>
              </div>
            </div>
          </div>
        </Tooltip>
      );

      if (isMobile) {
        return (
          <SwipeableList threshold={0.2} type={ListType.IOS} key={todo.id}>
            <SwipeableListItem
              leadingActions={
                <LeadingActions>
                  <SwipeAction onClick={() => handleToggleTodo(todo)}>
                    <CheckOutlined /> Hoàn thành
                  </SwipeAction>
                </LeadingActions>
              }
              trailingActions={
                <TrailingActions>
                  <SwipeAction onClick={() => handleEditTodo(todo)}>
                    <EditOutlined /> Sửa
                  </SwipeAction>
                  <SwipeAction destructive onClick={() => handleDeleteTodo(todo)}>
                    <DeleteOutlined /> Xóa
                  </SwipeAction>
                </TrailingActions>
              }
            >
              {todoContent}
            </SwipeableListItem>
          </SwipeableList>
        );
      }

      return todoContent;
    };

  // Enhanced render day card with mobile optimizations
  const renderDayCard = (dayCard: DayCard, index: number) => {
    const isToday = dayjs(dayCard.date).isSame(dayjs(), 'day');
    const isPast = dayjs(dayCard.date).isBefore(dayjs(), 'day');
    const isFuture = dayjs(dayCard.date).isAfter(dayjs(), 'day');
    
    // Enhanced responsive height calculation for fullscreen layout
    const cardHeight = isMobile 
      ? 'calc(100vh - 120px)'
      : isTabletLandscape ? 'calc(100vh - 200px)'
      : isTablet ? '520px' 
      : '600px';
    
    return (
      <div key={dayCard.date} style={{ 
        padding: isMobile ? '0 8px' : '0 8px', 
        width: isMobile ? '100vw' : '100%',
        height: isMobile ? '100%' : 'auto'
      }}>
        <Card
          className={`day-card ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''}`}
          style={{
            height: cardHeight,
            border: isToday ? '2px solid #1890ff' : '1px solid #d9d9d9',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            width: '100%',
            minWidth: '100%',
            maxWidth: '100%',
            padding: isMobile ? '2px' : '8px'
          }}
          title={
            isMobile ? (
              // Mobile: Minimalist header
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text strong style={{ 
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '16px'
                  }}>
                    {dayjs(dayCard.date).format('DD/MM')}
                  </Text>
                  {isToday && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1890ff'
                    }} />
                  )}
                </div>
                <Text type="secondary" style={{ 
                  fontSize: '12px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
                }}>
                  {dayCard.dayName}
                </Text>
              </div>
            ) : (
              // Desktop: Original detailed header
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text strong style={{ 
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '16px'
                  }}>
                    {dayCard.dayName}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ 
                    fontSize: '11px', 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : undefined 
                  }}>
                    {dayjs(dayCard.date).format('DD/MM/YYYY')}
                  </Text>
                </div>
                {isToday && (
                  <Badge count="HÔM NAY" style={{ 
                    backgroundColor: '#1890ff',
                    fontSize: '10px'
                  }} />
                )}
              </div>
            )
          }
          extra={
            !isMobile && (
              <Tooltip title="Thêm nhiệm vụ">
                <Button
                  type="primary"
                  shape="circle"
                  size="middle"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedDate(dayCard.date);
                    setIsModalVisible(true);
                  }}
                  style={{
                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                    border: 'none',
                    width: '32px',
                    height: '32px'
                  }}
                />
              </Tooltip>
            )
          }
        >
          {/* Compact Chart Stats */}
          {isMobile ? (
            // Mobile: Compact chart visualization
            <div style={{ 
              marginBottom: '8px',
              padding: '8px 12px',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Chart visualization */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Mini donut chart */}
                  <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                    <svg width="32" height="32" style={{ transform: 'rotate(-90deg)' }}>
                      {/* Background circle */}
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke={isDarkMode ? '#303030' : '#f0f0f0'}
                        strokeWidth="3"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke={dayCard.stats.completionRate === 100 ? '#52c41a' : '#1890ff'}
                        strokeWidth="3"
                        strokeDasharray={`${(dayCard.stats.completionRate / 100) * 87.96} 87.96`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                      />
                    </svg>
                    {/* Center percentage */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: dayCard.stats.completionRate === 100 ? '#52c41a' : '#1890ff'
                    }}>
                      {dayCard.stats.completionRate}%
                    </div>
                  </div>
                  
                  {/* Stats summary */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}>
                      {dayCard.stats.completed}/{dayCard.stats.total}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#52c41a'
                      }} />
                      <span style={{ fontSize: '11px', color: '#52c41a' }}>
                        {dayCard.stats.completed}
                      </span>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#faad14',
                        marginLeft: '4px'
                      }} />
                      <span style={{ fontSize: '11px', color: '#faad14' }}>
                        {dayCard.stats.pending}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: dayCard.stats.completionRate === 100 
                    ? 'rgba(82, 196, 26, 0.1)' 
                    : 'rgba(24, 144, 255, 0.1)',
                  border: `1px solid ${dayCard.stats.completionRate === 100 ? '#52c41a' : '#1890ff'}`
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: dayCard.stats.completionRate === 100 ? '#52c41a' : '#1890ff'
                  }}>
                    {dayCard.stats.completionRate === 100 ? '✓ Hoàn thành' : 'Đang làm'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Desktop: Progress bar visualization (unified with mobile)
            <div style={{
              marginBottom: '16px',
              padding: '16px 20px',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                {/* Simplified progress info */}
                <span style={{ fontSize: '16px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#000000' }}>
                  {dayCard.stats.completed}/{dayCard.stats.total}
                </span>
                
                {/* Completion percentage */}
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: dayCard.stats.completionRate === 100 ? '#52c41a' : '#1890ff' 
                }}>
                  {dayCard.stats.completionRate === 100 ? '✓ Hoàn thành' : `${dayCard.stats.completionRate}%`}
                </span>
              </div>
              
              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: isDarkMode ? '#303030' : '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${dayCard.stats.completionRate}%`,
                  height: '100%',
                  background: dayCard.stats.completionRate === 100 
                    ? 'linear-gradient(90deg, #52c41a, #95de64)' 
                    : 'linear-gradient(90deg, #1890ff, #40a9ff)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          )}

          {/* Enhanced Todo List */}
          <div className="todo-list-container" style={{ 
            height: isMobile 
              ? (isLandscape ? 'calc(100% - 120px)' : 'calc(100% - 180px)')
              : isTabletLandscape ? 'calc(100% - 200px)'
              : '380px',
            overflowY: 'auto',
            overflowX: 'hidden', // Prevent horizontal scroll
            paddingRight: '4px',
            WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
          }}>
            {dayCard.todos.length === 0 ? (
              <Empty
                description="Không có nhiệm vụ nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: '40px' }}
              />
            ) : filteredDayCards.find(card => card.date === dayCard.date)?.filteredTodos.length === 0 ? (
              <Empty
                image={<CalendarOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
                description={
                  <Space direction="vertical" align="center">
                    <Text type="secondary">Không tìm thấy nhiệm vụ phù hợp</Text>
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedDate(dayCard.date);
                        setIsModalVisible(true);
                      }}
                    >
                      Thêm nhiệm vụ
                    </Button>
                  </Space>
                }
                style={{ marginTop: '40px' }}
              />
            ) : (
              <div style={{
                maxHeight: isMobile ? 'auto' : '420px',
                overflowY: isMobile ? 'visible' : 'auto',
                paddingRight: isMobile ? '0' : '4px',
                paddingBottom: isMobile ? '0' : '8px'
              }}>
                {(filteredDayCards.find(card => card.date === dayCard.date)?.filteredTodos || [])
                  .sort((a: Todo, b: Todo) => {
                    // Sort by completion status first (completed tasks go to bottom)
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1;
                    }
                    
                    // Then sort by priority (high to low)
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    const aPriority = priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] || 0;
                    const bPriority = priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder] || 0;
                    
                    return bPriority - aPriority;
                  })
                  .map(renderTodoItem)}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Batch operations
  const handleSelectAll = () => {
    const allIds = dayCards.flatMap(card => card.todos.map(todo => todo.id));
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setLoading(true);
      // Delete all selected todos
      await Promise.all(selectedIds.map(id => axiosInstance.delete(`/todos/${id}`)));
      
      message.success(`Đã xóa ${selectedIds.length} nhiệm vụ!`);
      setSelectedIds([]);
      fetchAllTodos();
    } catch (error) {
      console.error('Error bulk deleting todos:', error);
      message.error('Không thể xóa nhiệm vụ!');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkComplete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setLoading(true);
      // Toggle all selected todos to completed
      await Promise.all(selectedIds.map(id => axiosInstance.patch(`/todos/${id}/toggle`)));
      
      message.success(`Đã hoàn thành ${selectedIds.length} nhiệm vụ!`);
      setSelectedIds([]);
      fetchAllTodos();
    } catch (error) {
      console.error('Error bulk completing todos:', error);
      message.error('Không thể cập nhật nhiệm vụ!');
    } finally {
      setLoading(false);
    }
  };

  // Mobile fixed layout structure
  if (isMobile) {

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: isDarkMode ? '#000000' : '#f0f2f5'
      }}>
        {/* Fixed Header - 50px */}
        <div style={{
          height: '50px',
          flexShrink: 0,
          backgroundColor: isDarkMode ? '#141414' : '#ffffff',
          borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <Text strong style={{ fontSize: '16px', color: isDarkMode ? '#fff' : '#000' }}>
              Nhiệm vụ
            </Text>
          </div>
          <Space size="small">
            <Button
              type="text"
              icon={<FilterOutlined />}
              onClick={() => setFilterVisible(!filterVisible)}
              style={{ padding: '4px 8px' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedDate(dayjs().format('YYYY-MM-DD'));
                setIsModalVisible(true);
              }}
              style={{ padding: '4px 12px' }}
            />
          </Space>
        </div>

        {/* Collapsible Filter Bar - 40px when visible */}
        {filterVisible && (
          <div style={{
            height: '40px',
            flexShrink: 0,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fafafa',
            borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
            padding: '4px 8px',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            overflowX: 'auto'
          }}>
            <Input
              placeholder="Tìm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              style={{ flex: 1, maxWidth: '120px', height: '32px' }}
            />
            <Select
              placeholder="Ưu tiên"
              value={priorityFilter}
              onChange={setPriorityFilter}
              size="small"
              style={{ width: '80px', height: '32px' }}
              allowClear
            >
              <Option value="urgent">🔥</Option>
              <Option value="high">⚠️</Option>
              <Option value="medium">🔵</Option>
              <Option value="low">🟢</Option>
            </Select>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              size="small"
              style={{ width: '80px', height: '32px' }}
              allowClear
            >
              <Option value="completed">✅</Option>
              <Option value="pending">⏳</Option>
            </Select>
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                setSearchTerm('');
                setPriorityFilter('');
                setStatusFilter('');
              }}
              style={{ height: '32px', padding: '0 8px' }}
            />
          </div>
        )}

        {/* Main Content Area - Flexible */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Swiper
            ref={swiperRef}
            spaceBetween={0}
            slidesPerView={1}
            centeredSlides={true}
            initialSlide={2}
            onSlideChange={handleSwiperSlideChange}
            modules={[Pagination]}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            {dayCards.map((dayCard, index) => (
              <SwiperSlide key={dayCard.date} style={{ height: '100%' }}>
                {renderMobileDayCard(dayCard, index)}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Fixed Bottom Navigation - 56px */}
        <div style={{
          height: '56px',
          flexShrink: 0,
          backgroundColor: isDarkMode ? '#141414' : '#ffffff',
          borderTop: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
        }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={navigatePreviousDay}
            style={{ 
              flex: 1, 
              height: '40px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
          >
            Trước
          </Button>
          
          <Button
            type="primary"
            onClick={navigateToToday}
            style={{ 
              flex: 0,
              padding: '0 20px',
              height: '40px',
              fontWeight: 'bold'
            }}
          >
            Hôm nay
          </Button>
          
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={navigateNextDay}
            style={{ 
              flex: 1, 
              height: '40px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
          >
            Sau
          </Button>
        </div>

        {/* Mobile Modals and Drawers */}
        <Drawer
          title="Thêm nhiệm vụ mới"
          placement="bottom"
          height="90vh"
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          className="mobile-bottom-sheet"
          styles={{
            body: {
              paddingBottom: '20px',
              maxHeight: 'calc(90vh - 60px)',
              overflowY: 'auto'
            },
            wrapper: {
              height: '100%'
            }
          }}
          maskStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.45)'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTodo}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            >
              <Input placeholder="Nhập tiêu đề nhiệm vụ..." />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết (tùy chọn)..." />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              initialValue="medium"
            >
              <Select>
                <Option value="urgent">🔥 Khẩn cấp</Option>
                <Option value="high">⚠️ Cao</Option>
                <Option value="medium">🔵 Trung bình</Option>
                <Option value="low">🟢 Thấp</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Ngày hết hạn"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm
              </Button>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title="Chỉnh sửa nhiệm vụ"
          placement="bottom"
          height="90vh"
          open={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          className="mobile-bottom-sheet"
          styles={{
            body: {
              paddingBottom: '20px',
              maxHeight: 'calc(90vh - 60px)',
              overflowY: 'auto'
            },
            wrapper: {
              height: '100%'
            }
          }}
          maskStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.45)'
          }}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdateTodo}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            >
              <Input placeholder="Nhập tiêu đề nhiệm vụ..." />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết (tùy chọn)..." />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Độ ưu tiên"
            >
              <Select>
                <Option value="urgent">🔥 Khẩn cấp</Option>
                <Option value="high">⚠️ Cao</Option>
                <Option value="medium">🔵 Trung bình</Option>
                <Option value="low">🟢 Thấp</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Ngày hết hạn"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
              <Button 
                danger 
                onClick={() => {
                  if (selectedTodo) {
                    handleDeleteTodo(selectedTodo);
                    setIsEditModalVisible(false);
                  }
                }}
              >
                Xóa
              </Button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={() => setIsEditModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật
                </Button>
              </div>
            </div>
          </Form>
        </Drawer>
      </div>
    );
  }

  // Desktop layout

  return (
    <div className="todo-list" style={{ 
      padding: isMobile ? '0' : '20px',
      width: '100%',
      minHeight: '100vh',
      maxWidth: '100%'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: isMobile ? '8px' : '20px',
        padding: isMobile ? '12px' : '0'
      }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarOutlined style={{ fontSize: isMobile ? '20px' : '22px', color: '#1890ff' }} />
              <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
                Danh sách nhiệm vụ
              </Title>
            </div>
            <Text type="secondary" style={{ 
              fontSize: isMobile ? '12px' : '13px', 
              color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : undefined 
            }}>
              Quản lý nhiệm vụ theo ngày với giao diện album
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size={isMobile ? "middle" : "large"}
                onClick={() => {
                  setSelectedDate(dayjs().format('YYYY-MM-DD'));
                  setIsModalVisible(true);
                }}
                style={{ 
                  height: isMobile ? '36px' : '40px',
                  padding: isMobile ? '0 12px' : '0 20px',
                  borderRadius: '6px'
                }}
              >
                {isMobile ? null : '+ Thêm nhiệm vụ hôm nay'}
              </Button>
              <Tooltip title="Phím tắt: Ctrl+N để tạo nhiệm vụ, Ctrl+F để tìm kiếm, ← → để di chuyển ngày, Ctrl+A để chọn tất cả, Delete để xóa đã chọn">
                <Button 
                  type="text" 
                  icon={<InfoCircleOutlined />}
                  size="large"
                  style={{ 
                    height: '40px',
                    width: '40px',
                    borderRadius: '6px'
                  }}
                />
              </Tooltip>
            </div>
          </Col>
        </Row>

        {/* Responsive Filters for Tablet Landscape - REMOVED for tablet landscape */}
        {/* Tablet landscape will use mobile-style filters instead */}
        
        {/* Enhanced Batch Operations */}
        {selectedIds.length > 0 && (
          <div className="batch-operations" style={{ 
            marginTop: '16px'
          }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong style={{ color: '#1890ff' }}>
                  Đã chọn {selectedIds.length} nhiệm vụ
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    size="small"
                    icon={isMobile ? <CheckOutlined /> : undefined}
                    onClick={handleSelectAll}
                  >
                    {isMobile ? null : 'Chọn tất cả'}
                  </Button>
                  <Button 
                    size="small"
                    icon={isMobile ? <CloseOutlined /> : undefined}
                    onClick={handleDeselectAll}
                  >
                    {isMobile ? null : 'Bỏ chọn'}
                  </Button>
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={handleBulkComplete}
                    loading={loading}
                  >
                    {isMobile ? `${selectedIds.length}` : `Hoàn thành (${selectedIds.length})`}
                  </Button>
                  <Button 
                    danger 
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDelete}
                    loading={loading}
                  >
                    {isMobile ? `${selectedIds.length}` : `Xóa (${selectedIds.length})`}
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </div>

                    {/* Enhanced Search and Filter Controls */}
       {isMobile ? (
         // Mobile: Compact vertical layout
         <div className="search-filter-section" style={{ 
           marginBottom: '6px', 
           padding: '8px 12px',
           width: '100%'
         }}>
           <div style={{ marginBottom: '8px' }}>
             <Input.Search
               placeholder="Tìm kiếm..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               allowClear
               size="small"
               style={{ width: '100%', height: '32px' }}
             />
           </div>
           <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
             <Select
               placeholder="Ưu tiên"
               value={priorityFilter}
               onChange={setPriorityFilter}
               allowClear
               size="small"
               style={{ flex: 1, height: '28px' }}
             >
               <Option value="urgent">🔥 Khẩn</Option>
               <Option value="high">⚠️ Cao</Option>
               <Option value="medium">🟦 TB</Option>
               <Option value="low">🟢 Thấp</Option>
             </Select>
             <Select
               placeholder="Trạng thái"
               value={statusFilter}
               onChange={setStatusFilter}
               allowClear
               size="small"
               style={{ flex: 1, height: '28px' }}
             >
               <Option value="completed">✅ Hoàn thành</Option>
               <Option value="pending">⏳ Chờ</Option>
             </Select>
             <Button
               size="small"
               icon={<CloseOutlined />}
               onClick={() => {
                 setSearchTerm('');
                 setPriorityFilter('');
                 setStatusFilter('');
               }}
               style={{ height: '28px', width: '28px', padding: 0 }}
             />
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '4px',
               padding: '4px 8px',
               backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
               borderRadius: '4px',
               fontSize: '10px',
               color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.65)',
               whiteSpace: 'nowrap'
             }}>
               <FilterOutlined style={{ fontSize: '10px' }} />
               {dayCards.reduce((total, card) => total + card.todos.length, 0)}
             </div>
           </div>
         </div>
       ) : isTabletLandscape ? (
         // Tablet Landscape: Collapsible filters
         <TabletLandscapeCollapsibleFilters
           searchValue={searchTerm}
           searchPlaceholder="Tìm kiếm nhiệm vụ..."
           onSearchChange={setSearchTerm}
           filters={[
             {
               key: 'priority',
               label: 'Độ ưu tiên',
               type: 'select',
               value: priorityFilter,
               options: [
                 { value: 'urgent', label: '🔥 Khẩn cấp' },
                 { value: 'high', label: '⚠️ Cao' },
                 { value: 'medium', label: '🟦 Trung bình' },
                 { value: 'low', label: '🟢 Thấp' }
               ],
               placeholder: 'Chọn độ ưu tiên',
               onChange: setPriorityFilter
             },
             {
               key: 'status',
               label: 'Trạng thái',
               type: 'select',
               value: statusFilter,
               options: [
                 { value: 'completed', label: '✅ Hoàn thành' },
                 { value: 'pending', label: '⏳ Chờ xử lý' }
               ],
               placeholder: 'Chọn trạng thái',
               onChange: setStatusFilter
             }
           ]}
           onReset={() => {
             setSearchTerm('');
             setPriorityFilter('');
             setStatusFilter('');
           }}
           title="Tìm kiếm và Bộ lọc"
           isDarkMode={isDarkMode}
         />
       ) : (
         // Desktop: Simple horizontal filter layout similar to other pages
         <Card style={{ marginBottom: '16px' }}>
           <Row gutter={[16, 16]} align="middle">
             <Col xs={24} sm={8} md={6}>
               <Input.Search
                 placeholder="Tìm kiếm nhiệm vụ..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 allowClear
                 size="middle"
               />
             </Col>
             <Col xs={24} sm={8} md={4}>
               <Select
                 placeholder="Độ ưu tiên"
                 value={priorityFilter}
                 onChange={setPriorityFilter}
                 allowClear
                 size="middle"
                 style={{ width: '100%' }}
               >
                 <Option value="urgent">🔥 Khẩn cấp</Option>
                 <Option value="high">⚠️ Cao</Option>
                 <Option value="medium">🟦 Trung bình</Option>
                 <Option value="low">🟢 Thấp</Option>
               </Select>
             </Col>
             <Col xs={24} sm={8} md={4}>
               <Select
                 placeholder="Trạng thái"
                 value={statusFilter}
                 onChange={setStatusFilter}
                 allowClear
                 size="middle"
                 style={{ width: '100%' }}
               >
                 <Option value="completed">✅ Hoàn thành</Option>
                 <Option value="pending">⏳ Chờ xử lý</Option>
               </Select>
             </Col>
             <Col xs={24} sm={8} md={4}>
               <Space>
                 <Button
                   icon={<FilterOutlined />}
                   onClick={() => {
                     setSearchTerm('');
                     setPriorityFilter('');
                     setStatusFilter('');
                   }}
                   size="middle"
                 >
                   Reset
                 </Button>
                 <Badge count={dayCards.reduce((total, card) => total + card.todos.length, 0)}>
                   <Button size="middle">
                     Tổng: {dayCards.reduce((total, card) => total + card.todos.length, 0)}
                   </Button>
                 </Badge>
               </Space>
             </Col>
           </Row>
         </Card>
       )}

             {/* Enhanced Navigation Controls */}
       {!isMobile && (
         <div className="navigation-controls" style={{ 
           marginBottom: '16px', 
           textAlign: 'center',
           padding: '0 12px'
         }}>
         <Space size={isMobile ? "small" : "middle"}>
                     <Button
            size={isMobile ? "small" : "middle"}
            icon={<LeftOutlined />}
            onClick={isTabletLandscape ? navigateTabletPreviousGroup : navigatePreviousDay}
          >
            {isMobile ? null : (isTabletLandscape ? "Tuần trước" : "Ngày trước")}
          </Button>
                     <Button
            type="primary"
            size={isMobile ? "small" : "middle"}
            icon={isMobile ? <CalendarOutlined /> : undefined}
            onClick={isTabletLandscape ? navigateTabletToToday : navigateToToday}
            style={{ 
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              fontWeight: 'bold'
            }}
          >
            {isMobile ? null : 'Hôm nay'}
          </Button>
           <Text strong style={{ 
             color: isDarkMode ? '#ffffff' : '#000000',
             fontSize: isMobile ? '12px' : '14px'
           }}>
             {isTabletLandscape 
               ? `${currentDate.subtract(3, 'day').format('DD/MM')} - ${currentDate.add(3, 'day').format('DD/MM/YYYY')}`
               : currentDate.format('DD/MM/YYYY')
             }
           </Text>
                     <Button
            size={isMobile ? "small" : "middle"}
            icon={<RightOutlined />}
            onClick={isTabletLandscape ? navigateTabletNextGroup : navigateNextDay}
          >
            {isMobile ? null : (isTabletLandscape ? "Tuần sau" : "Ngày sau")}
          </Button>
         </Space>
       </div>
       )}

              {/* Enhanced Day Cards Layout with Swiper for Mobile */}
        <div className="day-cards-container" style={{ 
          position: 'relative',
          width: '100%',
          maxWidth: '100%'
        }}>
          {isMobile ? (
            // Mobile: Swiper with fullscreen card view
            <div 
              style={{ 
                padding: '0',
                touchAction: 'pan-y',
                height: 'calc(100vh - 60px)',
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
                marginRight: 'calc(-50vw + 50%)'
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Swiper
                ref={swiperRef}
                spaceBetween={0} // No spacing for fullscreen
                slidesPerView={1} // Exactly one card
                centeredSlides={true}
                initialSlide={2} // Center on today
                onSlideChange={handleSwiperSlideChange}
                modules={[Pagination]}
                navigation={false}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                resistanceRatio={0.85} // Smooth resistance
                speed={300} // Animation speed
                threshold={5} // Swipe threshold
                style={{
                  paddingBottom: '60px',
                  width: '100vw',
                  height: 'calc(100vh - 60px)'
                }}
              >
                {dayCards.map((dayCard, index) => (
                  <SwiperSlide key={dayCard.date}>
                    {renderDayCard(dayCard, index)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : isTabletLandscape ? (
            // Tablet Landscape: Swiper with 3 cards per slide
            <div 
              className="tablet-landscape-swiper-container"
              style={{ width: '100%', height: 'calc(100vh - 200px)' }}
              onTouchStart={handleTabletTouchStart}
              onTouchEnd={handleTabletTouchEnd}
            >
              <Swiper
                className="tablet-landscape-swiper"
                onSwiper={setTabletSwiperRef}
                spaceBetween={16}
                slidesPerView={1}
                centeredSlides={true}
                initialSlide={1} // Start with center group
                onSlideChange={handleTabletSwiperSlideChange}
                modules={[Pagination]}
                navigation={false}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                resistanceRatio={0.85}
                speed={300}
                threshold={5}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              >
                {tabletDayGroups.length > 0 ? tabletDayGroups.map((group, groupIndex) => (
                  <SwiperSlide key={`group-${groupIndex}`}>
                    <Row gutter={[16, 16]} justify="space-between" style={{ width: '100%', height: '100%' }}>
                      {group.map((dayCard, dayIndex) => (
                        <Col 
                          xs={24} 
                          sm={24} 
                          md={8} 
                          lg={8} 
                          xl={8} 
                          key={dayCard.date}
                          style={{ 
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '0 8px',
                            flex: '0 0 33.333333%',
                            maxWidth: '33.333333%'
                          }}
                        >
                          {renderDayCard(dayCard, dayIndex)}
                        </Col>
                      ))}
                    </Row>
                  </SwiperSlide>
                )) : (
                  // Fallback to regular day cards if tablet groups not ready
                  <SwiperSlide>
                    <Row gutter={[16, 16]} justify="space-between" style={{ width: '100%', height: '100%' }}>
                      {dayCards.map((dayCard, dayIndex) => (
                        <Col 
                          xs={24} 
                          sm={24} 
                          md={8} 
                          lg={8} 
                          xl={8} 
                          key={dayCard.date}
                          style={{ 
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '0 8px',
                            flex: '0 0 33.333333%',
                            maxWidth: '33.333333%'
                          }}
                        >
                          {renderDayCard(dayCard, dayIndex)}
                        </Col>
                      ))}
                    </Row>
                  </SwiperSlide>
                )}
              </Swiper>
            </div>
          ) : (
            // Desktop: Grid layout with 3 cards for full screen
            <Row gutter={[16, 16]} justify="space-between" style={{ width: '100%' }}>
              {dayCards.map((dayCard, index) => (
                <Col 
                  xs={24} 
                  sm={24} 
                  md={8} 
                  lg={8} 
                  xl={8} 
                  key={dayCard.date}
                  style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '0 8px',
                    flex: '1 1 0%',
                    maxWidth: '100%'
                  }}
                >
                  {renderDayCard(dayCard, index)}
                </Col>
              ))}
            </Row>
          )}
        </div>
        
        {/* Mobile sticky bottom navigation */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDarkMode ? '#141414' : '#ffffff',
            borderTop: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
            padding: '8px 16px',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            height: '60px'
          }}>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={navigatePreviousDay}
              style={{ 
                flex: 1,
                height: '44px',
                fontSize: '12px',
                color: isDarkMode ? '#ffffff' : '#000000'
              }}
            >
              Trước
            </Button>
            
            <Button
              type="primary"
              onClick={navigateToToday}
              style={{ 
                flex: 1,
                margin: '0 8px',
                fontWeight: 'bold',
                height: '44px',
                fontSize: '12px'
              }}
            >
              Hôm nay
            </Button>
            
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={navigateNextDay}
              style={{ 
                flex: 1,
                height: '44px',
                fontSize: '12px',
                color: isDarkMode ? '#ffffff' : '#000000'
              }}
            >
              Sau
            </Button>
          </div>
        )}
        
        {/* Floating Action Button for Mobile and Tablet */}
        <FloatingActionButton 
          onClick={() => {
            setSelectedDate(dayjs().format('YYYY-MM-DD'));
            setIsModalVisible(true);
          }}
          tooltip="Thêm nhiệm vụ mới"
          color={`linear-gradient(135deg, #52c41a 0%, #389e0d 100%)`}
        />

      {/* Enhanced Create Todo Modal/Drawer */}
      {isMobile ? (
        <Drawer
          title="Thêm nhiệm vụ mới"
          placement="bottom"
          height="90vh" // Fixed height instead of auto
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          className="mobile-bottom-sheet"
          styles={{
            body: {
              paddingBottom: '20px',
              maxHeight: 'calc(90vh - 60px)',
              overflowY: 'auto'
            },
            wrapper: {
              height: '100%'
            }
          }}
          maskStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.45)'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTodo}
          >
            <Form.Item
              name="title"
              label="Tên nhiệm vụ"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
            >
              <Input placeholder="Nhập tên nhiệm vụ..." size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={4} placeholder="Nhập mô tả nhiệm vụ..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Độ ưu tiên"
                  initialValue="MEDIUM"
                >
                  <Select size="large">
                    <Option value="LOW">Thấp</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="HIGH">Cao</Option>
                    <Option value="URGENT">Khẩn cấp</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="Ngày hạn"
                  initialValue={dayjs(selectedDate)}
                >
                  <DatePicker style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <Space size="middle">
                <Button 
                  size="large" 
                  onClick={() => setIsModalVisible(false)}
                  style={{ minWidth: '80px' }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  style={{ minWidth: '120px' }}
                >
                  Tạo nhiệm vụ
                </Button>
              </Space>
            </div>
          </Form>
        </Drawer>
      ) : (
        <Modal
          title="Thêm nhiệm vụ mới"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTodo}
          >
            <Form.Item
              name="title"
              label="Tên nhiệm vụ"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
            >
              <Input placeholder="Nhập tên nhiệm vụ..." />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={3} placeholder="Nhập mô tả nhiệm vụ..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Độ ưu tiên"
                  initialValue="MEDIUM"
                >
                  <Select size="large">
                    <Option value="LOW">Thấp</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="HIGH">Cao</Option>
                    <Option value="URGENT">Khẩn cấp</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="Ngày hạn"
                  initialValue={dayjs(selectedDate)}
                >
                  <DatePicker style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <Space size="middle">
                <Button 
                  size="large" 
                  onClick={() => setIsModalVisible(false)}
                  style={{ minWidth: '80px' }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  style={{ minWidth: '120px' }}
                >
                  Tạo nhiệm vụ
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      )}

      {/* Edit Todo - Modal (desktop) / Drawer (mobile) */}
      {isMobile ? (
        <Drawer
          title="Chỉnh sửa nhiệm vụ"
          placement="bottom"
          height="90vh" // Fixed height instead of auto
          open={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          className="mobile-bottom-sheet tablet-landscape-edit-form todo-form"
          styles={{
            body: {
              paddingBottom: '20px',
              maxHeight: 'calc(90vh - 60px)',
              overflowY: 'auto'
            },
            wrapper: {
              height: '100%'
            }
          }}
          maskStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.45)'
          }}
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdateTodo}>
            <Form.Item
              name="title"
              label="Tên nhiệm vụ"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
            >
              <Input placeholder="Nhập tên nhiệm vụ..." size="large" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={4} placeholder="Nhập mô tả nhiệm vụ..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="priority" label="Độ ưu tiên">
                  <Select size="large">
                    <Option value="LOW">Thấp</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="HIGH">Cao</Option>
                    <Option value="URGENT">Khẩn cấp</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dueDate" label="Ngày hạn">
                  <DatePicker style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space size="middle">
                <Button size="large" onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading} size="large">Cập nhật</Button>
              </Space>
            </div>
          </Form>
        </Drawer>
      ) : (
        <Modal
          title="Chỉnh sửa nhiệm vụ"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdateTodo}>
            <Form.Item
              name="title"
              label="Tên nhiệm vụ"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
            >
              <Input placeholder="Nhập tên nhiệm vụ..." />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Nhập mô tả nhiệm vụ..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="priority" label="Độ ưu tiên">
                  <Select>
                    <Option value="LOW">Thấp</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="HIGH">Cao</Option>
                    <Option value="URGENT">Khẩn cấp</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dueDate" label="Ngày hạn">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Cập nhật nhiệm vụ</Button>
              </Space>
            </div>
          </Form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={() => todoToDelete && handleDeleteTodo(todoToDelete)}
        title="Xác nhận xóa nhiệm vụ"
        content="Bạn có chắc chắn muốn xóa nhiệm vụ"
        itemName={todoToDelete?.title}
        loading={deletingId === todoToDelete?.id}
        size="medium"
      />
    </div>
  );
};

export default TodoList; 