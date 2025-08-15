import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Select, Spin, Modal, List, Button, Tag, Table, Drawer, Form, Input, DatePicker, Switch, message, Popconfirm, Tabs, Row, Col, Card, Avatar, Typography, Space, Tooltip, Statistic, Empty, Alert, theme } from 'antd';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import axiosInstance from '../axiosConfig';
import dayjs, { Dayjs } from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers as fetchUsersThunk } from '../store/slices/userSlice';
import { RootState } from '../store';
import io from 'socket.io-client';
import { message as antdMessage } from 'antd';
import { useResponsive } from '../hooks/useResponsive';
import MobileFilters from '../components/MobileFilters';
import FloatingActionButton from '../components/FloatingActionButton';
import '../styles/calendar-responsive.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-fab.css';


import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/tablet-landscape-statistics-colors.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  ProjectOutlined,
  BellOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  UpOutlined,
  ClearOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const eventTypeColors: Record<string, string> = {
  MEETING: '#1890ff',
  DEADLINE: '#ff4d4f',
  MILESTONE: '#faad14',
  EVENT: '#52c41a',
};

const eventTypeIcons: Record<string, any> = {
  MEETING: TeamOutlined,
  DEADLINE: ExclamationCircleOutlined,
  MILESTONE: CheckCircleOutlined,
  EVENT: BellOutlined,
};

const eventTypeLabels: Record<string, string> = {
  MEETING: 'Họp',
  DEADLINE: 'Deadline',
  MILESTONE: 'Milestone',
  EVENT: 'Sự kiện',
};

const CalendarPage: React.FC = () => {
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  
  // Detect tablet landscape specifically
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  
  useEffect(() => {
    const checkTabletLandscape = () => {
      const isTabletLandscapeCheck = window.innerWidth >= 769 && window.innerWidth <= 1366 && 
                                    window.innerHeight < window.innerWidth;
      setIsTabletLandscape(isTabletLandscapeCheck);
    };
    
    checkTabletLandscape();
    window.addEventListener('resize', checkTabletLandscape);
    window.addEventListener('orientationchange', checkTabletLandscape);
    
    return () => {
      window.removeEventListener('resize', checkTabletLandscape);
      window.removeEventListener('orientationchange', checkTabletLandscape);
    };
  }, []);
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterProject, setFilterProject] = useState<string | undefined>();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [tab, setTab] = useState<'calendar' | 'list'>('calendar');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const allUsers = useSelector((state: RootState) => state.users.users);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isDarkMode = useSelector((state: RootState) => state.ui.theme === 'dark');
  const [search, setSearch] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentDate(currentDate.clone().add(1, 'day'));
    }
    if (isRightSwipe) {
      setCurrentDate(currentDate.clone().subtract(1, 'day'));
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setSearch('');
    setFilterType(undefined);
    setFilterProject(undefined);
    setFiltersExpanded(false);
    message.success('Đã reset bộ lọc');
  };



  // CSS styles for table rows and animations
  const tableRowStyles = `
    .calendar-table-row-even {
      background-color: ${token.colorBgContainer} !important;
    }
    .calendar-table-row-odd {
      background-color: ${token.colorBgLayout} !important;
    }
    .calendar-table-row-even:hover,
    .calendar-table-row-odd:hover {
      background-color: ${token.colorBgTextHover} !important;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes swipeLeft {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes swipeRight {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;

  useEffect(() => {
    fetchEvents();
    fetchProjects();
    if (!allUsers.length) dispatch(fetchUsersThunk() as any);
  }, [filterType, filterProject]);

  useEffect(() => {
    // Inject CSS styles for table rows
    const styleElement = document.createElement('style');
    styleElement.textContent = tableRowStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [tableRowStyles]);

  useEffect(() => {
    // Error boundary effect
    const handleError = (error: ErrorEvent) => {
      console.error('CalendarPage error:', error);
      setRenderError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  React.useEffect(() => {
    // Kết nối socket
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://qlda.hoanglong24.com');
    const reload = () => {
      fetchEvents();
      antdMessage.info('Lịch sự kiện đã được cập nhật realtime!');
    };
    socket.on('calendar:event:created', reload);
    socket.on('calendar:event:updated', reload);
    socket.on('calendar:event:deleted', reload);
    socket.on('calendar:attendee:status', reload);
    return () => { socket.disconnect(); };
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterProject) params.projectId = filterProject;
      console.log('Fetching calendar events with params:', params);
      
      const res = await axiosInstance.get('/calendar', { params });
      console.log('Calendar API response:', res.data);
      
      // Đảm bảo luôn là array
      let eventsData = [];
      if (Array.isArray(res.data)) {
        eventsData = res.data;
      } else if (Array.isArray(res.data?.events)) {
        eventsData = res.data.events;
      } else {
        console.warn('Unexpected events data format:', res.data);
        eventsData = [];
      }
      
      console.log('Fetched events:', eventsData.length, eventsData);
      setEvents(eventsData);
    } catch (e: any) {
      console.error('Error fetching events:', e);
      const errorMessage = e.response?.data?.error || 'Không thể tải dữ liệu lịch';
      setError(errorMessage);
      setEvents([]);
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects for calendar...');
      const res = await axiosInstance.get('/projects');
      console.log('Projects API response:', res.data);
      
      let projectsData = [];
      if (Array.isArray(res.data)) {
        projectsData = res.data;
      } else if (Array.isArray(res.data?.projects)) {
        projectsData = res.data.projects;
      } else {
        console.warn('Unexpected projects data format:', res.data);
        projectsData = [];
      }
      
      console.log('Fetched projects:', projectsData.length, projectsData);
      setProjects(projectsData);
    } catch (e: any) {
      console.error('Error fetching projects:', e);
      const errorMessage = e.response?.data?.error || 'Không thể tải danh sách dự án';
      message.error(errorMessage);
      setProjects([]);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    // Hiển thị sự kiện nếu ngày chọn nằm trong khoảng startDate - endDate (bao gồm allDay và không allDay)
    const dayEvents = events.filter(ev => {
      const start = dayjs(ev.startDate);
      const end = ev.endDate ? dayjs(ev.endDate) : start;
      const valueDate = value.format('YYYY-MM-DD');
      const startDate = start.format('YYYY-MM-DD');
      const endDate = end.format('YYYY-MM-DD');
      
      // Debug only for today
      if (valueDate === dayjs().format('YYYY-MM-DD')) {
        console.log('Checking event:', ev.title, 'valueDate:', valueDate, 'startDate:', startDate, 'endDate:', endDate);
      }
      
      return valueDate === startDate || valueDate === endDate || 
             (valueDate > startDate && valueDate < endDate);
    });

    // Debug only for today
    if (value.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) {
      console.log('Events for today:', dayEvents.length);
    }

    return (
      <div style={{ 
        minHeight: 80, 
        padding: '4px',
        display: isTabletLandscape ? 'flex' : 'block',
        flexWrap: isTabletLandscape ? 'wrap' : 'nowrap',
        gap: isTabletLandscape ? '2px' : '0'
      }}>
        {Array.isArray(dayEvents) && dayEvents.map(ev => {
          const IconComponent = eventTypeIcons[ev.type] || BellOutlined;
          const isToday = value.isSame(dayjs(), 'day');
          const isSelected = selectedDate && value.isSame(selectedDate, 'day');
          
          // For tablet landscape mode, show only icons (32x24, colored)
          if (isTabletLandscape) {
            return (
              <div
                key={ev.id}
                style={{
                  width: '32px',
                  height: '24px',
                  background: eventTypeColors[ev.type] || token.colorBgTextHover,
                  color: token.colorBgContainer,
                  margin: '2px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isToday ? `0 2px 4px ${token.colorBgTextHover}` : 'none',
                  border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = `0 4px 8px ${token.colorBgTextHover}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = isToday ? `0 2px 4px ${token.colorBgTextHover}` : 'none';
                }}
                onClick={() => openDrawer(ev)}
                title={`${ev.title} - ${eventTypeLabels[ev.type] || ev.type}`}
              >
                <IconComponent style={{ fontSize: '16px' }} />
              </div>
            );
          }
          
          // Default display for other modes
          return (
            <div
              key={ev.id}
              style={{
                background: eventTypeColors[ev.type] || token.colorBgTextHover,
                color: token.colorBgContainer,
                padding: '4px 8px',
                margin: '2px 0',
                borderRadius: token.borderRadius,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: isToday ? `0 2px 4px ${token.colorBgTextHover}` : 'none',
                border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = `0 4px 8px ${token.colorBgTextHover}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isToday ? `0 2px 4px ${token.colorBgTextHover}` : 'none';
              }}
              onClick={() => openDrawer(ev)}
              title={`${ev.title} - ${eventTypeLabels[ev.type] || ev.type}`}
            >
              <IconComponent style={{ fontSize: '10px', flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ev.title}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const onSelect = (date: Dayjs) => {
    setSelectedDate(date);
    const dayEvents = Array.isArray(events) ? events.filter(ev => {
      const start = dayjs(ev.startDate);
      const end = ev.endDate ? dayjs(ev.endDate) : start;
      const dateStr = date.format('YYYY-MM-DD');
      const startDate = start.format('YYYY-MM-DD');
      const endDate = end.format('YYYY-MM-DD');
      
      return dateStr === startDate || dateStr === endDate || 
             (dateStr > startDate && dateStr < endDate);
    }) : [];
    setSelectedEvents(dayEvents);
    if (dayEvents.length > 0) {
      setModalOpen(true);
    }
  };

  const openDrawer = (event?: any) => {
    console.log('Opening drawer for event:', event);
    setEditingEvent(event);
    
    if (event) {
      // Edit mode - populate form with event data
      const formData = {
        title: event.title,
        description: event.description,
        type: event.type,
        projectId: event.projectId,
        location: event.location,
        range: [dayjs(event.startDate), dayjs(event.endDate || event.startDate)],
        isAllDay: event.isAllDay,
        color: event.color,
        reminder: event.reminder,
        attendees: event.attendees?.map((a: any) => a.userId || a.user?.id) || []
      };
      console.log('Setting form data for edit:', formData);
      form.setFieldsValue(formData);
    } else {
      // Create mode - reset form and set default values
      form.resetFields();
      form.setFieldsValue({
        type: 'MEETING',
        isAllDay: false,
        color: '#1890ff',
        reminder: 15
      });
    }
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting event:', id);
      const response = await axiosInstance.delete(`/calendar/${id}`);
      console.log('Delete response:', response.data);
      message.success('Đã xóa sự kiện thành công');
      fetchEvents();
      setModalOpen(false);
    } catch (e: any) {
      console.error('Error deleting event:', e);
      const errorMessage = e.response?.data?.error || 'Không thể xóa sự kiện';
      message.error(errorMessage);
    }
  };

  const handleDeleteClick = (event: any) => {
    setEventToDelete(event);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setEventToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      handleDelete(eventToDelete.id);
      setDeleteModalVisible(false);
      setEventToDelete(null);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      console.log('Submitting event data:', values);
      
      const [startDate, endDate] = values.range;
      const data = {
        title: values.title?.trim(),
        description: values.description?.trim(),
        type: values.type,
        projectId: values.projectId,
        location: values.location?.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isAllDay: values.isAllDay || false,
        color: values.color,
        reminder: values.reminder,
        attendees: values.attendees || []
      };

      console.log('Processed event data:', data);

      if (editingEvent) {
        const response = await axiosInstance.put(`/calendar/${editingEvent.id}`, data);
        console.log('Update response:', response.data);
        message.success('Đã cập nhật sự kiện thành công');
      } else {
        const response = await axiosInstance.post('/calendar', data);
        console.log('Create response:', response.data);
        message.success('Đã tạo sự kiện mới thành công');
      }
      
      setDrawerOpen(false);
      setEditingEvent(null);
      form.resetFields();
      fetchEvents();
    } catch (e: any) {
      console.error('Error saving event:', e);
      const errorMessage = e.response?.data?.error || 'Có lỗi xảy ra khi lưu sự kiện';
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: 'Sự kiện',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: eventTypeColors[record.type] || '#d9d9d9',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ fontWeight: 500, color: token.colorText }}>{title}</div>
            {record.description && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const IconComponent = eventTypeIcons[type] || BellOutlined;
        return (
          <Tag color={eventTypeColors[type]} icon={<IconComponent />}>
            {eventTypeLabels[type] || type}
          </Tag>
        );
      }
    },
    {
      title: 'Dự án',
      dataIndex: ['project', 'name'],
      key: 'project',
      width: 150,
      render: (name: string) => name ? <Tag color="blue" icon={<ProjectOutlined />}>{name}</Tag> : '-'
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 200,
      render: (record: any) => (
                  <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClockCircleOutlined style={{ color: token.colorPrimary }} />
              <span>{dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</span>
            </div>
            {record.endDate && record.endDate !== record.startDate && (
              <div style={{ fontSize: '12px', color: token.colorTextSecondary, marginTop: 2 }}>
                Đến: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}
              </div>
            )}
          </div>
      )
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string) => location ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <EnvironmentOutlined style={{ color: token.colorSuccess }} />
          <span>{location}</span>
        </div>
      ) : '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (record: any) => (
        <Space>
          <Button size="small" onClick={() => openDrawer(record)}>
            Sửa
          </Button>
          <Button size="small" danger onClick={() => handleDeleteClick(record)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  // Thống kê sự kiện
  const eventStats = {
    total: events.length,
    meeting: events.filter(e => e.type === 'MEETING').length,
    deadline: events.filter(e => e.type === 'DEADLINE').length,
    milestone: events.filter(e => e.type === 'MILESTONE').length,
    event: events.filter(e => e.type === 'EVENT').length,
  };

  console.log('CalendarPage rendering, events:', events.length);

  // Fallback nếu có lỗi
  if (!events) {
    console.log('Events is null/undefined, setting to empty array');
    setEvents([]);
  }

  // Error fallback
  if (renderError) {
    return (
      <div style={{ padding: 24, background: token.colorBgContainer, minHeight: '100vh' }}>
        <Alert
          message="Lỗi hiển thị"
          description={renderError}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          }
        />
      </div>
    );
  }

  // Simple fallback render
  if (loading) {
    return (
      <div style={{ padding: 24, background: token.colorBgContainer, minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: token.colorText }}>Đang tải lịch...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? 0 : 24, 
      background: isMobile ? token.colorBgLayout : token.colorBgContainer, 
      height: isMobile ? '100vh' : 'auto',
      minHeight: isMobile ? '100vh' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Mobile Header */}
      {isMobile ? (
        <div style={{ 
          background: token.colorBgContainer,
          padding: '8px 16px 6px',
          borderRadius: '0 0 12px 12px',
          marginBottom: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8 
          }}>
            <CalendarOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, color: token.colorText }}>Lịch Dự Án</Title>
          </div>
          <Text type="secondary" style={{ 
            fontSize: 11, 
            display: 'block', 
            textAlign: 'center',
            marginTop: 2
          }}>
            Quản lý sự kiện dự án
          </Text>
        </div>
      ) : (
        // Desktop Full Header
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: 8 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CalendarOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
              <div>
                <Title level={2} style={{ margin: 0, color: token.colorText }}>Lịch Dự Án</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>Quản lý lịch họp, deadline, milestone và các sự kiện dự án</Text>
              </div>
            </div>
            {/* Move Create Event button to header for tablet landscape */}
            {isTabletLandscape && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                style={{ 
                  background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                  border: 'none',
                  borderRadius: token.borderRadius
                }}
                onClick={() => openDrawer()}
              >
                Tạo Sự Kiện
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: token.colorErrorBg, 
          border: `1px solid ${token.colorErrorBorder}`, 
          borderRadius: token.borderRadius
        }}>
          <Text type="danger" strong>Lỗi: {error}</Text>
          <Button 
            type="link" 
            onClick={() => fetchEvents()}
            style={{ padding: 0, marginLeft: 8 }}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{ 
        marginBottom: isMobile ? 8 : 24,
        margin: isMobile ? '0 -12px 8px' : '0 0 24px'
      }}>
        {isMobile ? (
          // Mobile Layout: Full width with padding
          <div style={{ 
            background: token.colorBgContainer,
            padding: '12px 16px',
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
              <Col span={12}>
                <Card size="small" style={{ 
                  textAlign: 'center',
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: 8
                }}>
                  <Statistic 
                    title="Tổng cộng" 
                    value={eventStats.total} 
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: token.colorPrimary, fontSize: '16px' }}
                    style={{ margin: 0 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ 
                  textAlign: 'center',
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: 8
                }}>
                  <Statistic 
                    title="Họp" 
                    value={eventStats.meeting} 
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: token.colorPrimary, fontSize: '16px' }}
                    style={{ margin: 0 }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
              <Col span={12}>
                <Card size="small" style={{ 
                  textAlign: 'center',
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: 8
                }}>
                  <Statistic 
                    title="Deadline" 
                    value={eventStats.deadline} 
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: token.colorError, fontSize: '16px' }}
                    style={{ margin: 0 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ 
                  textAlign: 'center',
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: 8
                }}>
                  <Statistic 
                    title="Milestone" 
                    value={eventStats.milestone} 
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: token.colorWarning, fontSize: '16px' }}
                    style={{ margin: 0 }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Card size="small" style={{ 
                  textAlign: 'center',
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: 8
                }}>
                  <Statistic 
                    title="Sự kiện" 
                    value={eventStats.event} 
                    prefix={<BellOutlined />}
                    valueStyle={{ color: token.colorSuccess, fontSize: '16px' }}
                    style={{ margin: 0 }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          // Desktop Layout: 1 row x 5 columns (or 4 columns for tablet landscape)
          <div className="calendar-container">
            <Row gutter={16} className="dashboard-stats-row">
              <Col span={isTabletLandscape ? 6 : 4}>
                <ResponsiveStatCard
                  title="Tổng cộng" 
                  value={eventStats.total} 
                  icon={<CalendarOutlined />}
                  function="project-calendar"
                  color={token.colorPrimary}
                />
              </Col>
              <Col span={isTabletLandscape ? 6 : 4}>
                <ResponsiveStatCard
                  title="Họp" 
                  value={eventStats.meeting} 
                  icon={<TeamOutlined />}
                  function="project-calendar"
                  color={token.colorPrimary}
                />
              </Col>
              <Col span={isTabletLandscape ? 6 : 4}>
                <ResponsiveStatCard
                  title="Deadline" 
                  value={eventStats.deadline} 
                  icon={<ExclamationCircleOutlined />}
                  function="project-calendar"
                  color={token.colorError}
                />
              </Col>
              <Col span={isTabletLandscape ? 6 : 4}>
                <ResponsiveStatCard
                  title="Milestone" 
                  value={eventStats.milestone} 
                  icon={<CheckCircleOutlined />}
                  function="project-calendar"
                  color={token.colorWarning}
                />
              </Col>
            {/* Only show Create Event button for desktop (not tablet landscape) */}
            {!isTabletLandscape && (
              <Col span={4}>
                <Card>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                      border: 'none',
                      borderRadius: token.borderRadius
                    }}
                    onClick={() => openDrawer()}
                  >
                    Tạo Sự Kiện
                  </Button>
                </Card>
              </Col>
            )}
            </Row>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton 
        onClick={() => openDrawer()}
        tooltip="Tạo sự kiện mới"
        icon={<CalendarOutlined />}
      />

      {/* Mobile Filters - Above tabs */}
      {isMobile && (
        <MobileFilters
          searchValue={search}
          statusValue={filterType || ""}
          priorityValue=""
          assigneeValue=""
          projectValue={filterProject || ""}
          statusOptions={[
            { value: '', label: 'Tất cả loại' },
            { value: 'TASK', label: 'Nhiệm vụ' },
            { value: 'DEADLINE', label: 'Deadline' },
            { value: 'MILESTONE', label: 'Milestone' },
            { value: 'EVENT', label: 'Sự kiện' }
          ]}
          priorityOptions={[]}
          assigneeOptions={[]}
          projectOptions={[
            { value: '', label: 'Tất cả dự án' },
            ...projects.map(project => ({ value: project.id, label: project.name }))
          ]}
          onSearchChange={setSearch}
          onStatusChange={setFilterType}
          onPriorityChange={() => {}}
          onAssigneeChange={() => {}}
          onProjectChange={setFilterProject}
          onReset={resetFilters}
          title="Bộ lọc lịch"
          isDarkMode={isDarkMode}
        />
      )}

      {/* Tablet Landscape Filters - Enhanced with Collapsible */}
      {isTabletLandscape && (
        <Card 
          style={{ marginBottom: 16 }} 
          className="tablet-landscape-calendar-filter-card"
          bodyStyle={{ padding: '12px 16px' }}
        >
          {/* Header with collapse toggle */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: filtersExpanded ? 12 : 0,
              cursor: 'pointer'
            }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 500, fontSize: '14px' }}>Tìm kiếm và Bộ lọc</span>
            </div>
            <Button 
              type="text" 
              size="small"
              icon={filtersExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setFiltersExpanded(!filtersExpanded);
              }}
            />
          </div>

          {/* Collapsible content */}
          {filtersExpanded && (
            <Row gutter={[16, 12]}>
              {/* Row 1: Search */}
              <Col span={24}>
                <div className="tablet-calendar-filter-item">
                  <div className="tablet-calendar-filter-label">Tìm kiếm</div>
                  <Input
                    placeholder="Tìm kiếm sự kiện..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    prefix={<SearchOutlined />}
                    size="middle"
                  />
                </div>
              </Col>
              {/* Row 2: Type and Project filters */}
              <Col span={12}>
                <div className="tablet-calendar-filter-item">
                  <div className="tablet-calendar-filter-label">Loại sự kiện</div>
                  <Select
                    placeholder="Tất cả loại"
                    value={filterType}
                    onChange={setFilterType}
                    allowClear
                    size="middle"
                    style={{ width: '100%' }}
                  >
                    <Option value="TASK">Nhiệm vụ</Option>
                    <Option value="DEADLINE">Deadline</Option>
                    <Option value="MILESTONE">Milestone</Option>
                    <Option value="EVENT">Sự kiện</Option>
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div className="tablet-calendar-filter-item">
                  <div className="tablet-calendar-filter-label">Dự án</div>
                  <Select
                    placeholder="Tất cả dự án"
                    value={filterProject}
                    onChange={setFilterProject}
                    allowClear
                    size="middle"
                    style={{ width: '100%' }}
                  >
                    {projects.map(project => (
                      <Option key={project.id} value={project.id}>{project.name}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              {/* Row 3: Clear filters */}
              <Col span={24}>
                <div className="tablet-calendar-filter-item">
                  <Button 
                    icon={<ClearOutlined />}
                    onClick={resetFilters}
                    style={{ width: '100%' }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Card>
      )}

      {/* Tabs - Removed container wrapper */}
      {isMobile ? (
        // Mobile Tab Buttons - No tabpane container
        <div style={{ 
          background: token.colorBgContainer,
          padding: '8px 12px',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          margin: '0 -12px 4px',
          flexShrink: 0,
          display: 'flex',
          gap: 8
        }}>
          <Button
            type={tab === 'calendar' ? 'primary' : 'text'}
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => setTab('calendar')}
            style={{ 
              flex: 1,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            Lịch
          </Button>
          <Button
            type={tab === 'list' ? 'primary' : 'text'}
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => setTab('list')}
            style={{ 
              flex: 1,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            Danh sách
          </Button>
        </div>
      ) : (
          <Card style={{ marginBottom: 8, padding: '12px 16px' }}>
            {/* Desktop Layout */}
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button
                  type={tab === 'calendar' ? 'primary' : 'text'}
                  size="middle"
                  icon={<CalendarOutlined />}
                  onClick={() => setTab('calendar')}
                  style={{ 
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Lịch Tháng
                </Button>
                <Button
                  type={tab === 'list' ? 'primary' : 'text'}
                  size="middle"
                  icon={<FileTextOutlined />}
                  onClick={() => setTab('list')}
                  style={{ 
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Danh Sách
                </Button>
              </div>
            </Col>
            {/* Hide desktop filters in tablet landscape mode */}
            {!isTabletLandscape && (
              <Col>
                <Space size="small">
                  <Input.Search
                    placeholder="Tìm kiếm sự kiện..."
                    allowClear
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 220 }}
                    size="small"
                    prefix={<SearchOutlined />}
                  />
                  <Select
                    placeholder="Tất cả loại"
                    allowClear
                    style={{ width: 120 }}
                    size="small"
                    value={filterType}
                    onChange={setFilterType}
                    prefix={<FilterOutlined />}
                  >
                    <Option value="MEETING">Họp</Option>
                    <Option value="DEADLINE">Deadline</Option>
                    <Option value="MILESTONE">Milestone</Option>
                    <Option value="EVENT">Sự kiện khác</Option>
                  </Select>
                  <Select
                    placeholder="Tất cả dự án"
                    allowClear
                    style={{ width: 160 }}
                    size="small"
                    value={filterProject}
                    onChange={setFilterProject}
                    showSearch
                    optionFilterProp="children"
                    prefix={<ProjectOutlined />}
                  >
                    {Array.isArray(projects) && projects.map((p: any) => (
                      <Option key={p.id} value={p.id}>{p.name}</Option>
                    ))}
                  </Select>
                </Space>
              </Col>
            )}
          </Row>
      </Card>
        )}

      {/* Calendar/List Content - Full screen height for mobile */}
      <div style={{
        flex: isMobile ? 1 : 1,
        height: isMobile ? 'calc(100vh - 160px)' : 'auto',
        minHeight: isMobile ? 'calc(100vh - 160px)' : 'auto',
        maxHeight: isMobile ? 'calc(100vh - 160px)' : 'none',
        margin: isMobile ? '0 -12px' : '0',
        background: isMobile ? token.colorBgContainer : 'transparent',
        borderRadius: isMobile ? '16px 16px 0 0' : 0,
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: isMobile ? '8px 12px' : '24px',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {tab === 'calendar' && (
          <Spin spinning={loading}>
            {isMobile ? (
              // Mobile Day View with Swipe
              <div 
                style={{ 
                  padding: '2px 0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Date Navigation */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 6,
                  padding: '0 2px',
                  flexShrink: 0
                }}>
                  <Button 
                    size="small"
                    shape="circle"
                    onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'day'))}
                    icon={<LeftOutlined />}
                    style={{ 
                      border: 'none',
                      background: token.colorBgTextHover,
                      color: token.colorPrimary
                    }}
                  />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold',
                      color: token.colorText,
                      lineHeight: 1
                    }}>
                      {currentDate.format('DD')}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: token.colorTextSecondary,
                      lineHeight: 1.2,
                      marginTop: 2
                    }}>
                      {currentDate.format('dddd, MMM YYYY')}
                    </div>
                  </div>
                  <Button 
                    size="small"
                    shape="circle"
                    onClick={() => setCurrentDate(currentDate.clone().add(1, 'day'))}
                    icon={<RightOutlined />}
                    style={{ 
                      border: 'none',
                      background: token.colorBgTextHover,
                      color: token.colorPrimary
                    }}
                  />
                </div>

                {/* Quick Date Jump */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  marginBottom: 4,
                  flexShrink: 0
                }}>
                  <Button 
                    size="small"
                    type={currentDate.isSame(dayjs(), 'day') ? 'primary' : 'default'}
                    onClick={() => setCurrentDate(dayjs())}
                    style={{ 
                      fontSize: '10px',
                      height: 20,
                      borderRadius: 10,
                      padding: '0 8px'
                    }}
                  >
                    Hôm nay
                  </Button>
                </div>

                {/* Day Events */}
                <div style={{ 
                  flex: 1,
                  overflow: 'auto',
                  padding: '0 2px',
                  minHeight: 0,
                  height: '100%'
                }}>
                  {(() => {
                    const dayEvents = events.filter(ev => {
                      const start = dayjs(ev.startDate);
                      const end = ev.endDate ? dayjs(ev.endDate) : start;
                      const currentDateStr = currentDate.format('YYYY-MM-DD');
                      const startDate = start.format('YYYY-MM-DD');
                      const endDate = end.format('YYYY-MM-DD');
                      
                      return currentDateStr === startDate || currentDateStr === endDate || 
                             (currentDateStr > startDate && currentDateStr < endDate);
                    });

                    if (dayEvents.length === 0) {
                      return (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '20px 16px',
                          color: token.colorTextSecondary,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          minHeight: '200px'
                        }}>
                          <CalendarOutlined style={{ fontSize: 36, marginBottom: 12 }} />
                          <div style={{ fontSize: '13px' }}>Không có sự kiện nào trong ngày này</div>
                        </div>
                      );
                    }

                    return (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {dayEvents.map((event, index) => {
                          const IconComponent = eventTypeIcons[event.type] || BellOutlined;
                          const startTime = dayjs(event.startDate);
                          const endTime = event.endDate ? dayjs(event.endDate) : startTime;
                          
                          return (
                            <Card 
                              key={event.id}
                              size="small"
                              style={{ 
                                marginBottom: 8,
                                border: `1px solid ${eventTypeColors[event.type] || token.colorBorder}`,
                                borderLeft: `4px solid ${eventTypeColors[event.type] || token.colorBorder}`,
                                borderRadius: 8,
                                padding: 0,
                                background: `linear-gradient(135deg, ${eventTypeColors[event.type]}10, ${eventTypeColors[event.type]}05)`,
                                boxShadow: `0 2px 8px ${eventTypeColors[event.type]}20`,
                                transition: 'all 0.2s ease'
                              }}
                              bodyStyle={{ padding: '10px 12px' }}
                              hoverable
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <div style={{ 
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: `linear-gradient(135deg, ${eventTypeColors[event.type]}, ${eventTypeColors[event.type]}CC)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: `0 2px 6px ${eventTypeColors[event.type]}40`
                                }}>
                                  <IconComponent style={{ 
                                    color: '#fff',
                                    fontSize: '14px'
                                  }} />
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ 
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    marginBottom: 4,
                                    color: token.colorText,
                                    lineHeight: 1.3
                                  }}>
                                    {event.title}
                                  </div>
                                  
                                  <div style={{ 
                                    fontSize: '11px',
                                    color: eventTypeColors[event.type] || token.colorTextSecondary,
                                    marginBottom: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontWeight: '500'
                                  }}>
                                    <ClockCircleOutlined style={{ fontSize: '10px' }} />
                                    {event.isAllDay ? 'Cả ngày' : `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`}
                                  </div>
                                  
                                  {event.location && (
                                    <div style={{ 
                                      fontSize: '11px',
                                      color: token.colorTextSecondary,
                                      marginBottom: 4,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      fontWeight: '500'
                                    }}>
                                      <EnvironmentOutlined style={{ fontSize: '10px' }} />
                                      {event.location}
                                    </div>
                                  )}
                                  
                                  {event.description && (
                                    <div style={{ 
                                      fontSize: '11px',
                                      color: token.colorTextSecondary,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      marginBottom: 4,
                                      fontStyle: 'italic'
                                    }}>
                                      {event.description}
                                    </div>
                                  )}
                                  
                                  {/* Action Buttons */}
                                  <div style={{ 
                                    display: 'flex',
                                    gap: 3,
                                    marginTop: 2
                                  }}>
                                    <Button
                                      size="small"
                                      shape="circle"
                                      icon={<EditOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDrawer(event);
                                      }}
                                      style={{ 
                                        width: 20,
                                        height: 20,
                                        border: 'none',
                                        background: token.colorPrimary,
                                        color: '#fff',
                                        fontSize: '9px'
                                      }}
                                    />
                                    <Button
                                      size="small"
                                      shape="circle"
                                      icon={<DeleteOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(event);
                                      }}
                                      style={{ 
                                        width: 20,
                                        height: 20,
                                        border: 'none',
                                        background: token.colorError,
                                        color: '#fff',
                                        fontSize: '9px'
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <Tag 
                                  color={eventTypeColors[event.type]}
                                  style={{ 
                                    margin: 0,
                                    fontSize: '9px',
                                    padding: '2px 6px',
                                    lineHeight: 1.2
                                  }}
                                >
                                  {eventTypeLabels[event.type] || event.type}
                                </Tag>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              // Desktop Month View
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={onSelect}
              value={selectedDate || dayjs()}
              style={{ 
                background: token.colorBgContainer, 
                borderRadius: token.borderRadius, 
                  padding: 16,
                  fontSize: 14
              }}
              headerRender={({ value, onChange }) => (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Button 
                      onClick={() => onChange(value.clone().subtract(1, 'month'))}
                      icon={<CalendarOutlined />}
                    >
                      Tháng trước
                    </Button>
                    <Title level={4} style={{ margin: 0 }}>
                      {value.format('MMMM YYYY')}
                    </Title>
                    <Button 
                      onClick={() => onChange(value.clone().add(1, 'month'))}
                      icon={<CalendarOutlined />}
                    >
                      Tháng sau
                    </Button>
                  </div>
                  <Button 
                    type="primary" 
                    onClick={() => onChange(dayjs())}
                    icon={<CalendarOutlined />}
                  >
                    Hôm nay
                  </Button>
                </div>
              )}
            />
            )}
          </Spin>
        )}
        {tab === 'list' && (
          <Spin spinning={loading}>
            {events.length === 0 ? (
              <Empty
                description="Không có sự kiện nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '60px 0' }}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
                  Tạo sự kiện đầu tiên
                </Button>
              </Empty>
            ) : isMobile ? (
              // Mobile Card Layout
              <div style={{ 
                padding: '0 4px',
                height: 'calc(100vh - 280px)',
                overflow: 'auto'
              }}>
                {Array.isArray(events) ? events
                  .filter(ev => 
                    !search || 
                    ev.title?.toLowerCase().includes(search.toLowerCase()) || 
                    ev.description?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((event, index) => {
                    const IconComponent = eventTypeIcons[event.type] || BellOutlined;
                    const startTime = dayjs(event.startDate);
                    const endTime = event.endDate ? dayjs(event.endDate) : startTime;
                    
                    return (
                      <Card 
                        key={event.id}
                        size="small"
                        style={{ 
                          marginBottom: 6,
                          border: `1px solid ${eventTypeColors[event.type] || token.colorBorder}`,
                          borderLeft: `4px solid ${eventTypeColors[event.type] || token.colorBorder}`,
                          borderRadius: 8,
                          padding: 0
                        }}
                        bodyStyle={{ padding: '8px 12px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ 
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: eventTypeColors[event.type] || token.colorBgTextHover,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <IconComponent style={{ 
                              color: '#fff',
                              fontSize: '14px'
                            }} />
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: 4
                            }}>
                              <div style={{ 
                                fontWeight: 'bold',
                                fontSize: '13px',
                                color: token.colorText,
                                flex: 1,
                                marginRight: 8,
                                lineHeight: 1.3
                              }}>
                                {event.title}
                              </div>
                              <Tag 
                                color={eventTypeColors[event.type]}
                                style={{ 
                                  margin: 0,
                                  fontSize: '9px',
                                  flexShrink: 0,
                                  padding: '2px 6px',
                                  lineHeight: 1.2
                                }}
                              >
                                {eventTypeLabels[event.type] || event.type}
                              </Tag>
                            </div>
                            
                            <Space direction="vertical" size={2} style={{ width: '100%' }}>
                              <div style={{ 
                                fontSize: '11px',
                                color: token.colorTextSecondary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <ClockCircleOutlined />
                                {startTime.format('DD/MM/YYYY HH:mm')}
                                {event.endDate && event.endDate !== event.startDate && 
                                  ` - ${endTime.format('DD/MM/YYYY HH:mm')}`
                                }
                              </div>
                              
                              {event.project && (
                                <div style={{ 
                                  fontSize: '11px',
                                  color: token.colorTextSecondary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  <ProjectOutlined />
                                  {event.project.name}
                                </div>
                              )}
                              
                              {event.location && (
                                <div style={{ 
                                  fontSize: '11px',
                                  color: token.colorTextSecondary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  <EnvironmentOutlined />
                                  {event.location}
                                </div>
                              )}
                              
                              {event.description && (
                                <div style={{ 
                                  fontSize: '11px',
                                  color: token.colorTextSecondary,
                                  marginTop: 2,
                                  lineHeight: '1.3',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {event.description}
                                </div>
                              )}
                            </Space>
                            
                            <div style={{ 
                              marginTop: 6,
                              display: 'flex',
                              gap: 4
                            }}>
                              <Button
                                size="small"
                                shape="circle"
                                icon={<EditOutlined />}
                                onClick={() => openDrawer(event)}
                                style={{ 
                                  width: 24,
                                  height: 24,
                                  border: 'none',
                                  background: token.colorPrimary,
                                  color: '#fff',
                                  fontSize: '10px'
                                }}
                              />
                              <Button
                                size="small"
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteClick(event)}
                                style={{ 
                                  width: 24,
                                  height: 24,
                                  border: 'none',
                                  background: token.colorError,
                                  color: '#fff',
                                  fontSize: '10px'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  }) : []}
              </div>
            ) : (
              // Desktop Table Layout
              <Table 
                rowKey="id" 
                columns={columns} 
                dataSource={Array.isArray(events) ? events.filter(ev => 
                  !search || 
                  ev.title?.toLowerCase().includes(search.toLowerCase()) || 
                  ev.description?.toLowerCase().includes(search.toLowerCase())
                ) : []} 
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  size: 'default'
                }} 
                locale={{ emptyText: 'Không có sự kiện nào.' }}
                style={{ 
                  background: token.colorBgContainer,
                  borderRadius: token.borderRadius,
                  border: `1px solid ${token.colorBorder}`
                }}
                size="middle"
                rowClassName={(record, index) => {
                  return index % 2 === 0 ? 'calendar-table-row-even' : 'calendar-table-row-odd';
                }}
              />
            )}
          </Spin>
                )}
        </div>
      </div>

      {/* Selected Date Modal */}
      {isMobile ? (
        <Drawer
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          placement="bottom"
          height="80vh"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarOutlined style={{ color: token.colorPrimary }} />
              <span style={{ fontSize: '16px' }}>Sự kiện ngày {selectedDate?.format('DD/MM/YYYY')}</span>
            </div>
          }
          styles={{
            body: { padding: '16px' },
            header: { padding: '16px' }
          }}
        >
          {selectedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <CalendarOutlined style={{ fontSize: 48, color: token.colorTextSecondary, marginBottom: 16 }} />
              <div style={{ color: token.colorTextSecondary }}>Không có sự kiện nào trong ngày này</div>
            </div>
          ) : (
            <List
              dataSource={Array.isArray(selectedEvents) ? selectedEvents : []}
              renderItem={(event) => {
                const IconComponent = eventTypeIcons[event.type] || BellOutlined;
                return (
                  <List.Item
                    actions={[
                      <Button size="small" onClick={() => openDrawer(event)}>
                        Sửa
                      </Button>,
                      <Button size="small" danger onClick={() => handleDeleteClick(event)}>
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: eventTypeColors[event.type] || token.colorPrimary,
                            color: 'white'
                          }}
                          icon={<IconComponent />}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{event.title}</span>
                          <Tag color={eventTypeColors[event.type]}>
                            {eventTypeLabels[event.type]}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            <ClockCircleOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                            {event.isAllDay ? 'Cả ngày' : `${dayjs(event.startTime).format('HH:mm')} - ${dayjs(event.endTime).format('HH:mm')}`}
                          </div>
                          {event.description && (
                            <div style={{ marginTop: 4, color: token.colorTextSecondary }}>
                              {event.description}
                            </div>
                          )}
                          {event.location && (
                            <div style={{ marginTop: 4 }}>
                              <EnvironmentOutlined style={{ marginRight: 8, color: token.colorSuccess }} />
                              {event.location}
                            </div>
                          )}
                          {event.project && (
                            <div style={{ marginTop: 4 }}>
                              <ProjectOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                              {event.project.name}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Drawer>
      ) : (
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarOutlined style={{ color: token.colorPrimary }} />
              <span>Sự kiện ngày {selectedDate?.format('DD/MM/YYYY')}</span>
            </div>
          }
          width={600}
        >
          {selectedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <CalendarOutlined style={{ fontSize: 48, color: token.colorTextSecondary, marginBottom: 16 }} />
              <div style={{ color: token.colorTextSecondary }}>Không có sự kiện nào trong ngày này</div>
            </div>
          ) : (
            <List
            dataSource={Array.isArray(selectedEvents) ? selectedEvents : []}
            renderItem={(event) => {
              const IconComponent = eventTypeIcons[event.type] || BellOutlined;
              return (
                <List.Item
                  actions={[
                    <Button size="small" onClick={() => openDrawer(event)}>
                      Sửa
                    </Button>,
                    <Button size="small" danger onClick={() => handleDeleteClick(event)}>
                      Xóa
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: eventTypeColors[event.type] || '#d9d9d9',
                          color: '#fff'
                        }}
                        icon={<IconComponent />}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 500 }}>{event.title}</span>
                        <Tag color={eventTypeColors[event.type]} icon={<IconComponent />}>
                          {eventTypeLabels[event.type] || event.type}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <ClockCircleOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                          {dayjs(event.startDate).format('HH:mm')} - {dayjs(event.endDate || event.startDate).format('HH:mm')}
                        </div>
                        {event.description && (
                          <div style={{ color: token.colorTextSecondary }}>
                            <FileTextOutlined style={{ marginRight: 8 }} />
                            {event.description}
                          </div>
                        )}
                        {event.location && (
                          <div style={{ marginTop: 4 }}>
                            <EnvironmentOutlined style={{ marginRight: 8, color: token.colorSuccess }} />
                            {event.location}
                          </div>
                        )}
                        {event.project && (
                          <div style={{ marginTop: 4 }}>
                            <ProjectOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                            {event.project.name}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
            />
          )}
        </Modal>
      )}

      {/* Event Form Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: token.colorPrimary }} />
            <span style={{ fontSize: isMobile ? '16px' : '18px' }}>
              {editingEvent ? 'Sửa sự kiện' : 'Tạo sự kiện'}
            </span>
          </div>
        }
        width={isMobile ? '100vw' : 520}
        height={isMobile ? '90vh' : undefined}
        placement={isMobile ? 'bottom' : 'right'}
        destroyOnClose
        styles={{
          body: { padding: isMobile ? '16px' : '24px' },
          header: { padding: isMobile ? '16px' : '24px 24px 16px' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ isAllDay: false }}
          className="calendar-event-form"
        >
          <Form.Item 
            name="title" 
            label="Tên sự kiện" 
            rules={[{ required: true, message: 'Nhập tên sự kiện!' }]}
          >
            <Input placeholder="Nhập tên sự kiện" />
          </Form.Item>
          
          <Form.Item 
            name="type" 
            label="Loại sự kiện" 
            rules={[{ required: true, message: 'Chọn loại sự kiện!' }]}
          >
            <Select placeholder="Chọn loại sự kiện">
              <Option value="MEETING">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamOutlined style={{ color: token.colorPrimary }} />
                  Họp
                </div>
              </Option>
              <Option value="DEADLINE">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ExclamationCircleOutlined style={{ color: token.colorError }} />
                  Deadline
                </div>
              </Option>
              <Option value="MILESTONE">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: token.colorWarning }} />
                  Milestone
                </div>
              </Option>
              <Option value="EVENT">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BellOutlined style={{ color: token.colorSuccess }} />
                  Sự kiện khác
                </div>
              </Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="projectId" label="Dự án">
            <Select 
              allowClear 
              showSearch 
              optionFilterProp="children"
              placeholder="Chọn dự án (tùy chọn)"
            >
              {projects.map((p: any) => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="location" label="Địa điểm">
            <Input placeholder="Nhập địa điểm (tùy chọn)" />
          </Form.Item>
          
          <Form.Item 
            name="range" 
            label="Thời gian" 
            rules={[{ required: true, message: 'Chọn thời gian!' }]}
          >
            <RangePicker 
              showTime 
              format="DD/MM/YYYY HH:mm" 
              style={{ width: '100%' }}
              placeholder={['Bắt đầu', 'Kết thúc']}
            />
          </Form.Item>
          
          <Form.Item name="isAllDay" label="Cả ngày" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập mô tả sự kiện (tùy chọn)"
            />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerOpen(false)} style={{ marginRight: 8 }}>
              Huỷ
            </Button>
            <Button type="primary" htmlType="submit">
              {editingEvent ? 'Cập nhật' : 'Tạo sự kiện'}
            </Button>
          </div>
        </Form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa sự kiện"
        content="Bạn có chắc chắn muốn xóa sự kiện"
        itemName={eventToDelete?.title}
        size="medium"
      />
    </div>
  );
};

export default CalendarPage; 