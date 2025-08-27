/**
 * Issues Management Page
 * 
 * Tính năng sắp xếp ưu tiên cho tablet landscape:
 * 1. Quá hạn (ưu tiên cao nhất)
 * 2. Mức độ ưu tiên (HIGH → MEDIUM → LOW)
 * 3. Trạng thái (NEW → IN_PROGRESS → RESOLVED → CLOSED)
 * 
 * Logic sắp xếp được áp dụng cho:
 * - Mobile view (card layout)
 * - Tablet landscape view (table layout)
 * - Desktop view (grouped table layout)
 */
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Popconfirm, 
  message, 
  Tooltip, 
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Avatar,
  Typography,
  Divider,
  Popover,
  Alert,
  Dropdown,
  Menu,
  DatePicker
} from 'antd';
import axiosInstance from '../axiosConfig';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined,
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BugOutlined,
  PlusCircleOutlined,
  SyncOutlined,
  HistoryOutlined,
  ExportOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ViewMode, Gantt, Task as GanttTask } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import MobileFilters from '../components/MobileFilters';
import FloatingActionButton from '../components/FloatingActionButton';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useResponsiveWithOrientation } from '../hooks/useResponsive';
import '../styles/mobile-improvements.css';
import '../styles/dashboard-card-spacing-fix.css';
import '../styles/dark-modal.css';
import '../styles/desktop-icon-standardization.css';
import '../styles/issues-responsive.css';


import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/tablet-landscape-statistics-colors.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import '../styles/tablet-landscape-issues-sorting.css';
import '../styles/statistics-height-optimization.css';
import '../styles/tablet-icon-standardization.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/mobile-icon-standardization.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/modal-button-fix.css';

const { Option } = Select;
const { Text, Title } = Typography;

const statusColors: any = {
  'NEW': 'blue',
  'IN_PROGRESS': 'orange',
  'RESOLVED': 'green',
  'CLOSED': 'default',
  'OVERDUE': 'red'
};

const priorityColors: any = {
  'LOW': 'blue',
  'MEDIUM': 'orange',
  'HIGH': 'red'
};

const statusList = [
  { value: 'NEW', label: 'Mới' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã xử lý' },
  { value: 'CLOSED', label: 'Đã đóng' },
  { value: 'OVERDUE', label: 'Quá hạn' },
  { value: 'WARNING', label: 'Cảnh báo (3 ngày)' }
];

const priorityList = [
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' }
];

const typeList = [
  { value: 'ISSUE', label: 'Vấn đề' },
  { value: 'RFI', label: 'RFI' }
];

const Issues = () => {
  const theme = useSelector((state: any) => state.ui.theme);
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any>(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<{
    search: string;
    status: string;
    priority: string;
    type: string;
    assigneeId: string;
    projectId: string;
  }>({ 
    search: '', 
    status: '', 
    priority: '', 
    type: '', 
    assigneeId: '', 
    projectId: '' 
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [viewMode, setViewMode] = useState<'table' | 'gantt'>('table');
  const user = useSelector((state:any) => state.auth.user);
  const navigate = useNavigate();

  // ✅ Sử dụng hook responsive với orientation
  const { isMobile, isTabletLandscape } = useResponsiveWithOrientation();
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<any>(null);

  // ✅ Mobile refresh mechanism
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isMobile) {
        // Refresh data when page becomes visible on mobile
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.getTime();
        if (timeSinceLastRefresh > 30000) { // 30 seconds
          console.log('🔄 Mobile: Refreshing issues due to visibility change');
          fetchIssues();
          setLastRefreshTime(new Date());
        }
      }
    };

    const handleFocus = () => {
      if (isMobile) {
        // Refresh data when window gains focus on mobile
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.getTime();
        if (timeSinceLastRefresh > 60000) { // 1 minute
          console.log('🔄 Mobile: Refreshing issues due to focus');
          fetchIssues();
          setLastRefreshTime(new Date());
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
    fetchIssues();
    fetchUsers();
    fetchProjects();
  }, [pagination.current, pagination.pageSize, filter]);

  const fetchIssues = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filter
      };
      
      // Clean up empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const res = await axiosInstance.get('/issues', { params });
      setIssues(res.data.issues || res.data);
      setPagination(p => ({ ...p, total: res.data.total || res.data.length }));
      
      // ✅ Cập nhật thời gian refresh cuối cùng
      setLastRefreshTime(new Date());
      
      if (isRefresh && isMobile) {
        message.success('Đã cập nhật dữ liệu vấn đề');
      }
    } catch (e) {
      message.error('Không thể tải danh sách vấn đề!');
    }
    
    if (isRefresh) {
      setIsRefreshing(false);
    } else {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users/all');
      setUsers(res.data.users || res.data);
    } catch {}
  };

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get('/projects');
      setProjects(res.data.projects || res.data);
    } catch {}
  };

  const handleAdd = () => {
    setEditingIssue(null);
    form.resetFields();
    // Đảm bảo DatePicker được reset
    form.setFieldsValue({
      dueDate: undefined
    });
    setModalOpen(true);
  };

  // ✅ Mobile refresh handler
  const handleMobileRefresh = () => {
    if (isMobile) {
      fetchIssues(true);
    }
  };

  const handleEdit = (record:any) => {
    setEditingIssue(record);
    form.setFieldsValue({
      ...record,
      projectId: record.project?.id,
      assigneeId: record.assignee?.id,
      dueDate: record.dueDate ? dayjs(record.dueDate) : undefined
    });
    setModalOpen(true);
  };

  const handleDelete = async (id:string) => {
    try {
      await axiosInstance.delete(`/issues/${id}`);
      message.success('Đã xoá vấn đề');
      fetchIssues();
    } catch {
      message.error('Không thể xoá vấn đề!');
    }
  };

  const handleDeleteClick = (issue: any) => {
    setIssueToDelete(issue);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setIssueToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (issueToDelete) {
      handleDelete(issueToDelete.id);
      setDeleteModalVisible(false);
      setIssueToDelete(null);
    }
  };

  const openCommentDrawer = (issue: any) => {
    // Navigate to issue detail page for comments
    navigate(`/issues/${issue.id}`);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Format date values for API
      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined
      };
      
      if (editingIssue) {
        await axiosInstance.put(`/issues/${editingIssue.id}`, formattedValues);
        message.success('Đã cập nhật vấn đề');
      } else {
        await axiosInstance.post('/issues', formattedValues);
        message.success('Đã tạo vấn đề mới');
      }
      setModalOpen(false);
      form.resetFields();
      // Đảm bảo DatePicker được reset
      form.setFieldsValue({
        dueDate: undefined
      });
      fetchIssues();
    } catch (e) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({ ...prev, current: pagination.current, pageSize: pagination.pageSize }));
  };





  // Columns cho parent table (projects)
  const parentColumns = [
    {
      title: 'Dự án',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {project.name?.[0] || 'P'}
          </Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong>{project.name}</Text>
              {project.code && (
                <Tag color="blue" style={{ fontSize: '10px' }}>
                  {project.code}
                </Tag>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái dự án',
      dataIndex: 'project',
      key: 'projectStatus',
      render: (project: any) => {
        const statusMap = {
          'ACTIVE': { label: 'Đang triển khai', color: 'green' },
          'PLANNING': { label: 'Lập kế hoạch', color: 'blue' },
          'ON_HOLD': { label: 'Tạm dừng', color: 'orange' },
          'COMPLETED': { label: 'Hoàn thành', color: 'purple' },
          'ARCHIVED': { label: 'Lưu trữ', color: 'grey' },
          'CANCELLED': { label: 'Đã hủy', color: 'red' }
        };
        const statusInfo = statusMap[project.status as keyof typeof statusMap] || { label: project.status || 'Không xác định', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: 'Số lượng vấn đề',
      dataIndex: 'issues',
      key: 'issueCount',
      width: 150,
      render: (issues: any[]) => (
        <div style={{ textAlign: 'center' }}>
          <Badge 
            count={issues?.length || 0} 
            style={{ 
              backgroundColor: '#1890ff',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          />
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
            vấn đề
          </div>
        </div>
      )
    }
  ];

  // Columns cho child table (issues)
  const childColumns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <div>
          <div 
            style={{ 
              cursor: 'pointer', 
              color: isIssueOverdue(record) ? '#ff4d4f' : isIssueWarning(record) ? '#faad14' : '#1890ff',
              fontWeight: (isIssueOverdue(record) || isIssueWarning(record)) ? 'bold' : 'normal'
            }} 
            onClick={() => navigate(`/issues/${record.id}`)}
          >
            {isIssueOverdue(record) && (
              <ExclamationCircleOutlined className="overdue-warning-icon" />
            )}
            {!isIssueOverdue(record) && isIssueWarning(record) && (
              <ExclamationCircleOutlined 
                style={{ 
                  color: '#faad14',
                  animation: 'blink-warning 2s infinite'
                }} 
              />
            )}
            {title}
          </div>
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <span>{dayjs(date).format('DD/MM/YYYY')}</span>
        </Space>
      )
    },
    {
      title: 'Hạn xử lý',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string, record: any) => {
        if (!date) return <Text type="secondary">Chưa có</Text>;
        const isOverdue = isIssueOverdue(record);
        const isWarning = isIssueWarning(record);
        const daysOverdue = getDaysOverdue(record);
        const daysUntilDue = getDaysUntilDue(record);
        const severity = getOverdueSeverity(record);
        const warningSeverity = getWarningSeverity(record);
        
        return (
          <Space>
            <CalendarOutlined style={{ color: isOverdue ? '#ff4d4f' : undefined }} />
            <span style={{ color: isOverdue ? '#ff4d4f' : undefined, fontWeight: isOverdue ? 'bold' : 'normal' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
            {isOverdue && (
              <Tag 
                color="red" 
                style={{ 
                  fontSize: '10px',
                  boxShadow: severity === 'high' ? '0 2px 4px rgba(255, 23, 68, 0.3)' :
                              severity === 'medium' ? '0 2px 4px rgba(255, 152, 0, 0.3)' :
                              '0 2px 4px rgba(255, 193, 7, 0.3)'
                }}
              >
                <ExclamationCircleOutlined style={{ marginRight: 2 }} />
                Quá hạn {daysOverdue} ngày
              </Tag>
            )}
            {isWarning && (
              <Tag 
                color="orange" 
                style={{ 
                  fontSize: '10px',
                  boxShadow: warningSeverity === 'high' ? '0 2px 4px rgba(255, 152, 0, 0.3)' :
                              warningSeverity === 'medium' ? '0 2px 4px rgba(250, 140, 22, 0.3)' :
                              '0 2px 4px rgba(250, 140, 22, 0.3)'
                }}
              >
                <ExclamationCircleOutlined style={{ marginRight: 2 }} />
                Hạn gần {daysUntilDue} ngày
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'ISSUE' ? 'purple' : 'cyan'}>
          {typeList.find(t => t.value === type)?.label || type}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
      width: 120,
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>
          {priorityList.find(p => p.value === priority)?.label || priority}
        </Tag>
      )
    },
    {
      title: 'Người được giao',
      dataIndex: ['assignee', 'name'],
      key: 'assignee',
      width: 150,
      render: (text: string, record: any) => (
        text ? (
          <Space>
            <Avatar size="small" style={{ backgroundColor: stringToColor(text) }}>
              {text[0]}
            </Avatar>
            <span>{text}</span>
          </Space>
        ) : (
          <Text type="secondary">Chưa gán</Text>
        )
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: any, record: any) => (
        <div className="desktop-button-group">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/issues/${record.id}`)}
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
      )
    },
    {
      title: 'Bình luận',
      key: 'comments',
      width: 100,
      render: (_: any, record: any) => (
        record && record.id ? (
          <Tooltip title="Xem bình luận">
            <Badge count={record._count?.comments || 0} size="small">
              <Button
                shape="circle"
                icon={<MessageOutlined />}
                onClick={() => navigate(`/issues/${record.id}`)}
                size="small"
              />
            </Badge>
          </Tooltip>
        ) : (
          <Button shape="circle" icon={<MessageOutlined />} size="small" disabled />
        )
      )
    }
  ];

  // Helper functions for overdue issues
  const isIssueOverdue = (issue: any) => {
    if (!issue.dueDate) return false;
    return dayjs(issue.dueDate).isBefore(dayjs(), 'day') && !['RESOLVED', 'CLOSED'].includes(issue.status);
  };

  const isIssueWarning = (issue: any) => {
    if (!issue.dueDate || ['RESOLVED', 'CLOSED'].includes(issue.status)) return false;
    const dueDate = dayjs(issue.dueDate);
    const now = dayjs();
    const daysUntilDue = dueDate.diff(now, 'day');
    return daysUntilDue <= 3 && daysUntilDue >= 0; // Include issues due today (0 days)
  };

  const getDaysOverdue = (issue: any) => {
    if (!issue.dueDate) return 0;
    return dayjs().diff(dayjs(issue.dueDate), 'day');
  };

  const getDaysUntilDue = (issue: any) => {
    if (!issue.dueDate || ['RESOLVED', 'CLOSED'].includes(issue.status)) return null;
    const dueDate = dayjs(issue.dueDate);
    const now = dayjs();
    const daysUntilDue = dueDate.diff(now, 'day');
    return daysUntilDue > 0 ? daysUntilDue : null;
  };

  const getOverdueSeverity = (issue: any) => {
    const daysOverdue = getDaysOverdue(issue);
    if (daysOverdue <= 3) return 'low';
    if (daysOverdue <= 7) return 'medium';
    return 'high';
  };

  const getWarningSeverity = (issue: any) => {
    const daysUntilDue = getDaysUntilDue(issue);
    if (daysUntilDue === 1) return 'high';
    if (daysUntilDue === 2) return 'medium';
    return 'low';
  };

  // Helper function to get issues by status
  const getIssuesByStatus = (status: string) => {
    if (status === '') return issues;
    if (status === 'OVERDUE') {
      // Filter by actual overdue condition (due date < today)
      return issues.filter(issue => isIssueOverdue(issue));
    }
    if (status === 'WARNING') {
      // Filter by warning condition (due within 3 days)
      return issues.filter(issue => isIssueWarning(issue));
    }
    return issues.filter(issue => issue.status === status);
  };

  // Sắp xếp issues theo mức độ ưu tiên: 
  // 1. Quá hạn (ưu tiên cao nhất)
  // 2. Mức độ ưu tiên (HIGH → MEDIUM → LOW)
  // 3. Trạng thái (NEW → IN_PROGRESS → RESOLVED → CLOSED)
  const sortIssuesByPriority = (issues: any[]) => {
    return issues.sort((a, b) => {
      const aOverdue = isIssueOverdue(a);
      const bOverdue = isIssueOverdue(b);
      
      // 1. Quá hạn lên đầu (ưu tiên cao nhất)
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // 2. Nếu cả hai đều quá hạn hoặc không quá hạn, sắp xếp theo mức độ ưu tiên
      if (aOverdue === bOverdue) {
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // 3. Nếu cùng mức độ ưu tiên, sắp xếp theo trạng thái
        const statusOrder = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        const aIndex = statusOrder.indexOf(a.status);
        const bIndex = statusOrder.indexOf(b.status);
        return aIndex - bIndex;
      }
      
      return 0;
    });
  };

  // Nhóm issues theo projectId và áp dụng logic sắp xếp ưu tiên
  const groupedIssues = projects.map(project => ({
    key: project.id,
    project,
    issues: issues ? sortIssuesByPriority(issues.filter(i => i.projectId === project.id)) : [], // Áp dụng logic sắp xếp ưu tiên cho desktop view
  })).filter(g => g.issues.length > 0);

  // Function to get row className for overdue styling
  const getRowClassName = (record: any) => {
    if (isIssueOverdue(record)) {
      const severity = getOverdueSeverity(record);
      const className = `overdue-issue-row overdue-severity-${severity}`;
      console.log('Applying overdue styling to:', record.title, 'with class:', className);
      return className;
    } else if (isIssueWarning(record)) {
      const severity = getWarningSeverity(record);
      const className = `warning-issue-row warning-severity-${severity}`;
      console.log('Applying warning styling to:', record.title, 'with class:', className);
      return className;
    }
    return '';
  };

  const issueStats = {
    total: issues.length,
    new: issues.filter(i => i.status === 'NEW').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length,
    closed: issues.filter(i => i.status === 'CLOSED').length,
    overdue: issues.filter(i => isIssueOverdue(i)).length,
    dueSoon: issues.filter(i => isIssueWarning(i)).length
  };

  // Tạo issueStats cố định dựa trên tổng số lượng issues (không bị ảnh hưởng bởi filter)
  const fixedIssueStats = {
    total: issues.length,
    new: issues.filter(i => i.status === 'NEW').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length,
    closed: issues.filter(i => i.status === 'CLOSED').length,
    overdue: issues.filter(i => isIssueOverdue(i)).length,
    dueSoon: issues.filter(i => isIssueWarning(i)).length
  };

  // Helper function to render issue list for popover
  const renderIssueList = (issues: any[], maxItems: number = 5) => {
    const displayIssues = issues.slice(0, maxItems);
    const hasMore = issues.length > maxItems;

    return (
      <div style={{ maxWidth: 300 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
          Danh sách vấn đề ({issues.length})
        </div>
        {displayIssues.map(issue => (
          <div key={issue.id} style={{ 
            padding: '4px 0', 
            borderBottom: '1px solid #f0f0f0',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold' }}>{issue.title}</div>
            <div style={{ color: '#666' }}>
              Dự án: {issue.project?.name || 'N/A'} | 
              Người xử lý: {issue.assignee?.name || 'Chưa phân công'}
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
            Và {issues.length - maxItems} vấn đề khác...
          </div>
        )}
      </div>
    );
  };

  function stringToColor(str: string) {
    let hash = 0;
    for (let j = 0; j < str.length; j++) {
      hash = str.charCodeAt(j) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let k = 0; k < 3; k++) {
      const value = (hash >> (k * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  // Chuyển đổi dữ liệu issues sang định dạng Gantt
  const getGanttIssues = (): GanttTask[] => {
    return issues.map((issue) => ({
      id: issue.id,
      name: issue.title,
      start: issue.createdAt ? new Date(issue.createdAt) : new Date(),
      end: issue.dueDate ? new Date(issue.dueDate) : new Date(),
      type: 'task',
      progress: issue.status === 'RESOLVED' || issue.status === 'CLOSED' ? 100 : 0,
      isDisabled: false,
      styles: { progressColor: '#faad14', progressSelectedColor: '#52c41a' },
      project: issue.project?.name || '',
    }));
  };
  // Xuất PDF cho bảng
  const handleExportTable = () => {
    const doc = new jsPDF();
    const tableData = issues.map((issue, idx) => [
      idx + 1,
      issue.title,
      issue.project?.name || '',
      issue.assignee?.name || '',
      issue.status,
      issue.priority,
      issue.createdAt ? dayjs(issue.createdAt).format('DD/MM/YYYY') : '',
      issue.dueDate ? dayjs(issue.dueDate).format('DD/MM/YYYY') : ''
    ]);
    autoTable(doc, {
      head: [['#', 'Tiêu đề', 'Dự án', 'Người được giao', 'Trạng thái', 'Ưu tiên', 'Ngày tạo', 'Hạn xử lý']],
      body: tableData,
    });
    doc.save('issues-report.pdf');
  };
  // Xuất hình ảnh cho Gantt
  const handleExportGantt = async () => {
    const ganttEl = document.querySelector('.gantt-issues-container');
    if (ganttEl) {
      const canvas = await html2canvas(ganttEl as HTMLElement);
      const link = document.createElement('a');
      link.download = 'issues-gantt.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      message.error('Không tìm thấy biểu đồ Gantt để xuất!');
    }
  };

  // Mobile Issue Card Component
  const MobileIssueCard = ({ issue }: { issue: any }) => {
    const statusInfo = getStatusDisplay(issue.status);
    const priorityInfo = getPriorityDisplay(issue.priority);
    const assignee = issue.assignee?.name || 'Chưa phân công';
    const isOverdue = isIssueOverdue(issue);
    const isWarning = isIssueWarning(issue);

    const actionMenu = (
      <Menu>
        <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => navigate(`/issues/${issue.id}`)}>
          Xem chi tiết
        </Menu.Item>
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(issue)}>
          Chỉnh sửa
        </Menu.Item>
        <Menu.Item key="comments" icon={<MessageOutlined />} onClick={() => navigate(`/issues/${issue.id}`)}>
          Bình luận
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(issue)}>
          Xóa
        </Menu.Item>
      </Menu>
    );

    return (
      <Card 
        className="mobile-issue-card"
        style={{ 
          marginBottom: 8,
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderColor: isDarkMode ? '#303030' : '#f0f0f0',
          borderRadius: 8,
          boxShadow: isDarkMode ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${
            isOverdue ? '#ff4d4f' : 
            isWarning ? '#faad14' : 
            issue.status === 'RESOLVED' ? '#52c41a' : '#1890ff'
          }`
        }}
        bodyStyle={{ padding: 12 }}
      >
        {/* Issue Header with Tags */}
        <div className="issue-header">
          <div className="issue-tags">
            <Tag color="blue" style={{ fontSize: '9px', fontWeight: 'bold' }}>
              {issue.code || 'N/A'}
            </Tag>
            <Tag color={statusInfo.color} icon={statusInfo.icon} style={{ fontSize: '9px' }}>
              {statusInfo.label}
            </Tag>
            <Tag color="purple" style={{ fontSize: '9px' }}>
              {issue.type || 'ISSUE'}
            </Tag>
            {isOverdue && (
              <Tag color="red" style={{ fontSize: '9px' }}>
                Quá hạn {getDaysOverdue(issue)} ngày
              </Tag>
            )}
            {isWarning && !isOverdue && (
              <Tag color="orange" style={{ fontSize: '9px' }}>
                Cảnh báo {getDaysUntilDue(issue)} ngày
              </Tag>
            )}
          </div>
          <Dropdown overlay={actionMenu} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
        
        {/* Issue Title */}
        <div className="issue-title">
          {issue.title}
        </div>
        
        {/* Issue Description */}
        <div className="issue-description">
          {issue.description}
        </div>
        
        {/* Issue Assignee */}
        <div className="issue-assignee">
          <Avatar size={20} style={{ backgroundColor: '#1890ff' }}>
            {(assignee || 'U').charAt(0)}
          </Avatar>
          <Text style={{ fontSize: 10, color: isDarkMode ? '#bbb' : '#666' }}>
            {assignee}
          </Text>
        </div>
        
        {/* Issue Meta - Dates and Priority */}
        <div className="issue-meta">
          <div className="issue-dates">
            <CalendarOutlined style={{ marginRight: 2 }} />
            <span style={{ fontSize: '10px', color: isDarkMode ? '#bbb' : '#666' }}>
              {issue.createdAt ? dayjs(issue.createdAt).format('DD/MM/YYYY') : 'N/A'} - {issue.dueDate ? dayjs(issue.dueDate).format('DD/MM/YYYY') : 'N/A'}
            </span>
          </div>
          <Tag color={priorityInfo.color} style={{ fontSize: '8px' }}>
            {priorityInfo.label}
          </Tag>
        </div>
        
        {/* Issue Actions */}
        <div className="issue-actions">
          <div className="action-buttons" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            {/* Left side - View and Edit */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                size="middle" 
                icon={<EyeOutlined style={{ fontSize: '16px', color: isDarkMode ? '#40a9ff' : '#1890ff' }} />}
                type="text"
                onClick={() => navigate(`/issues/${issue.id}`)}
                style={{ 
                  padding: '6px',
                  border: `1px solid ${isDarkMode ? '#40a9ff' : '#1890ff'}`,
                  borderRadius: '6px',
                  backgroundColor: isDarkMode ? 'rgba(64, 169, 255, 0.1)' : 'rgba(24, 144, 255, 0.1)'
                }}
              />
              <Button 
                size="middle"
                icon={<EditOutlined style={{ fontSize: '16px', color: isDarkMode ? '#52c41a' : '#389e0d' }} />}
                type="text"
                onClick={() => handleEdit(issue)}
                style={{ 
                  padding: '6px',
                  border: `1px solid ${isDarkMode ? '#52c41a' : '#389e0d'}`,
                  borderRadius: '6px',
                  backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(56, 158, 13, 0.1)'
                }}
              />
            </div>
            
            {/* Right side - Comment and Delete */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                size="middle" 
                icon={<MessageOutlined style={{ fontSize: '16px', color: isDarkMode ? '#faad14' : '#fa8c16' }} />} 
                type="text"
                onClick={() => navigate(`/issues/${issue.id}`)}
                style={{ 
                  padding: '6px',
                  border: `1px solid ${isDarkMode ? '#faad14' : '#fa8c16'}`,
                  borderRadius: '6px',
                  backgroundColor: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 140, 22, 0.1)'
                }}
              />
              <Button 
                size="middle" 
                icon={<DeleteOutlined style={{ fontSize: '16px', color: isDarkMode ? '#ff7875' : '#ff4d4f' }} />} 
                type="text"
                onClick={() => handleDeleteClick(issue)}
                style={{ 
                  padding: '6px',
                  border: `1px solid ${isDarkMode ? '#ff7875' : '#ff4d4f'}`,
                  borderRadius: '6px',
                  backgroundColor: isDarkMode ? 'rgba(255, 120, 117, 0.1)' : 'rgba(255, 77, 79, 0.1)'
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Helper functions for mobile issue card
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'NEW':
        return { label: 'Mới', color: 'blue', icon: <ExclamationCircleOutlined /> };
      case 'IN_PROGRESS':
        return { label: 'Đang xử lý', color: 'orange', icon: <ExclamationCircleOutlined /> };
      case 'RESOLVED':
        return { label: 'Đã xử lý', color: 'green', icon: <CheckCircleOutlined /> };
      case 'CLOSED':
        return { label: 'Đã đóng', color: 'default', icon: <CloseCircleOutlined /> };
      case 'OVERDUE':
        return { label: 'Quá hạn', color: 'red', icon: <ExclamationCircleOutlined /> };
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

  // Tablet Landscape Columns for Issues
  const getTabletLandscapeColumns = () => [
    {
      title: 'Vấn đề',
      dataIndex: 'title',
      key: 'title',
      width: '70%',
      render: (text: string, record: any) => {
        const isOverdue = isIssueOverdue(record);
        const isWarning = isIssueWarning(record);
        const project = record.project;
        const assignee = record.assignee;
        
        return (
          <div className="tablet-issue-info">
            {/* Dòng 1: Mã vấn đề, trạng thái, mức độ, loại, cảnh báo trễ hạn */}
            <div className="tablet-issue-row-1">
              <Tag color="blue" style={{ fontSize: '10px' }}>
                {record.code || 'N/A'}
              </Tag>
              <Tag color={getStatusDisplay(record.status).color}>
                {getStatusDisplay(record.status).label}
              </Tag>
              <Tag color={getPriorityDisplay(record.priority).color}>
                {getPriorityDisplay(record.priority).label}
              </Tag>
              <Tag color={record.type === 'ISSUE' ? 'blue' : 'purple'}>
                {record.type === 'ISSUE' ? 'Vấn đề' : 'RFI'}
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
            
            {/* Dòng 2: Tên vấn đề/RFI */}
            <div className="tablet-issue-row-2">
              <strong>{record.title || 'Không có tên'}</strong>
              {isOverdue && (
                <ExclamationCircleOutlined className="tablet-issues-project-warning" />
              )}
            </div>
            
            {/* Dòng 3: Mô tả */}
            <div className="tablet-issue-row-3">
              {record.description || 'Không có mô tả'}
            </div>
            
            {/* Dòng 4: Tên dự án */}
            <div className="tablet-issue-row-4">
              {project && (
                <>
                  <FileTextOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                  {project.name}
                </>
              )}
            </div>
            
            {/* Dòng 5: Ngày tạo - hạn hoàn thành - người thực hiện */}
            <div className="tablet-issue-row-5">
              <span>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY') : 'Chưa có'}
              </span>
              <span>-</span>
              <span>
                {record.dueDate ? dayjs(record.dueDate).format('DD/MM/YYYY') : 'Chưa có'}
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
        <div className="tablet-issues-actions-container">
          {/* Hàng 1: 2 nút */}
          <div className="tablet-issues-actions-row">
            <Tooltip title="Xem chi tiết" placement="top">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/issues/${record.id}`)}
                className="tablet-issues-icon-standard tablet-issues-icon-view"
              />
            </Tooltip>
            
            <Tooltip title="Chỉnh sửa" placement="top">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                className="tablet-issues-icon-standard tablet-issues-icon-edit"
              />
            </Tooltip>
          </div>
          
          {/* Hàng 2: 2 nút */}
          <div className="tablet-issues-actions-row">
            <Tooltip title="Bình luận" placement="top">
              <Button
                type="text"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => openCommentDrawer(record)}
                className="tablet-issues-icon-standard tablet-issues-icon-comment"
              />
            </Tooltip>
            
            <Tooltip title="Xóa" placement="top">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                className="tablet-issues-icon-standard tablet-issues-icon-delete"
                onClick={() => handleDeleteClick(record)}
              />
            </Tooltip>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="issues-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Title level={3} style={{ margin: 0 }}>Quản lý vấn đề</Title>
              {/* Warning Icons in Title Line */}
              {fixedIssueStats.overdue > 0 && (
                <Tooltip title={`${fixedIssueStats.overdue} vấn đề quá hạn cần xử lý ngay`}>
                  <Badge count={fixedIssueStats.overdue} size="small">
                    <ExclamationCircleOutlined 
                      style={{ 
                        color: '#ff4d4f', 
                        fontSize: '20px',
                        animation: 'blink 1.5s infinite',
                        cursor: 'pointer'
                      }} 
                      onClick={() => {
                        const overdueIssues = issues.filter(isIssueOverdue);
                        if (overdueIssues.length > 0) {
                          setFilter(prev => ({ 
                            ...prev, 
                            status: 'OVERDUE',
                            search: '',
                            priority: '',
                            type: '',
                            assigneeId: '',
                            projectId: ''
                          }));
                          setPagination(prev => ({ ...prev, current: 1 }));
                        }
                      }}
                    />
                  </Badge>
                </Tooltip>
              )}
              {fixedIssueStats.dueSoon > 0 && (
                <Tooltip title={`${fixedIssueStats.dueSoon} vấn đề sắp đến hạn (trong vòng 3 ngày)`}>
                  <Badge count={fixedIssueStats.dueSoon} size="small">
                    <ExclamationCircleOutlined 
                      style={{ 
                        color: '#faad14', 
                        fontSize: '20px',
                        animation: 'blink-warning 2s infinite',
                        cursor: 'pointer'
                      }} 
                      onClick={() => {
                        const warningIssues = issues.filter(isIssueWarning);
                        if (warningIssues.length > 0) {
                          setFilter(prev => ({ 
                            ...prev, 
                            status: 'WARNING',
                            search: '',
                            priority: '',
                            type: '',
                            assigneeId: '',
                            projectId: ''
                          }));
                          setPagination(prev => ({ ...prev, current: 1 }));
                        }
                      }}
                    />
                  </Badge>
                </Tooltip>
              )}
            </div>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm vấn đề
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards - Responsive */}
        <div className="dashboard-stats-row">
          <Row gutter={[8, 8]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={8} md={6} lg={4} xl={3}>
            <Popover 
              content={renderIssueList(getIssuesByStatus(''), 10)}
              title="Tất cả vấn đề"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setFilter(prev => ({ ...prev, status: '' }));
                }}
              >
                <ResponsiveStatCard
                  title="Tổng cộng"
                  value={fixedIssueStats.total}
                  icon={<BugOutlined />}
                  function="issues"
                />
              </div>
            </Popover>
          </Col>
          <Col span={3}>
            <Popover 
              content={renderIssueList(getIssuesByStatus('NEW'), 5)}
              title="Vấn đề mới"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setFilter(prev => ({ ...prev, status: 'NEW' }));
                }}
              >
                <ResponsiveStatCard
                  title="Mới"
                  value={fixedIssueStats.new}
                  icon={<PlusCircleOutlined />}
                  function="issues"
                />
              </div>
            </Popover>
          </Col>
          <Col span={3}>
            <Popover 
              content={renderIssueList(getIssuesByStatus('IN_PROGRESS'), 5)}
              title="Vấn đề đang xử lý"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setFilter(prev => ({ ...prev, status: 'IN_PROGRESS' }));
                }}
              >
                <ResponsiveStatCard
                  title="Đang xử lý"
                  value={fixedIssueStats.inProgress}
                  icon={<SyncOutlined spin />}
                  function="issues"
                />
              </div>
            </Popover>
          </Col>
          <Col span={3}>
            <Popover 
              content={renderIssueList(getIssuesByStatus('RESOLVED'), 5)}
              title="Vấn đề đã xử lý"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setFilter(prev => ({ ...prev, status: 'RESOLVED' }));
                }}
              >
                <ResponsiveStatCard
                  title="Đã xử lý"
                  value={fixedIssueStats.resolved}
                  icon={<CheckCircleOutlined />}
                  function="issues"
                />
              </div>
            </Popover>
          </Col>
          <Col span={3}>
            <Popover 
              content={renderIssueList(getIssuesByStatus('CLOSED'), 5)}
              title="Vấn đề đã đóng"
              trigger="hover"
              placement="bottom"
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setFilter(prev => ({ ...prev, status: 'CLOSED' }));
                }}
              >
                <ResponsiveStatCard
                  title="Đã đóng"
                  value={fixedIssueStats.closed}
                  icon={<CloseCircleOutlined />}
                  function="issues"
                />
              </div>
            </Popover>
          </Col>
          <Col span={3}>
            <Popover 
              content={renderIssueList(issues.filter(isIssueOverdue), 5)}
              title="Vấn đề quá hạn"
              trigger="hover"
              placement="bottom"
            >
              <div 
                className={fixedIssueStats.overdue > 0 ? 'overdue-stats-card' : ''}
                style={{ 
                  cursor: 'pointer',
                  ...(fixedIssueStats.overdue > 0 && {
                    border: '2px solid #ff4d4f',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)'
                  })
                }}
                onClick={() => {
                  const overdueIssues = issues.filter(isIssueOverdue);
                  if (overdueIssues.length > 0) {
                    setFilter(prev => ({ 
                      ...prev, 
                      status: 'OVERDUE',
                      search: '',
                      priority: '',
                      type: '',
                      assigneeId: '',
                      projectId: ''
                    }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                    setTimeout(() => {
                      const firstOverdueId = overdueIssues[0].id;
                      const element = document.querySelector(`[data-row-key="${firstOverdueId}"]`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }
                }}
              >
                <ResponsiveStatCard
                  title={
                    <Space>
                      {fixedIssueStats.overdue > 0 && (
                        <ExclamationCircleOutlined className="overdue-warning-icon" />
                      )}
                      Quá hạn
                    </Space>
                  }
                  value={fixedIssueStats.overdue}
                  function="issues"
                  valueStyle={{ 
                    fontWeight: fixedIssueStats.overdue > 0 ? 'bold' : 'normal',
                    fontSize: fixedIssueStats.overdue > 0 ? '24px' : '20px'
                  }}
                />
              </div>
            </Popover>
          </Col>
          <Col span={3}>
            <Popover 
              content={renderIssueList(issues.filter(isIssueWarning), 5)}
              title="Vấn đề sắp đến hạn"
              trigger="hover"
              placement="bottom"
            >
              <div 
                className={fixedIssueStats.dueSoon > 0 ? 'warning-stats-card' : ''}
                style={{ 
                  cursor: 'pointer',
                  ...(fixedIssueStats.dueSoon > 0 && {
                    border: '2px solid #faad14',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)'
                  })
                }}
                onClick={() => {
                  const warningIssues = issues.filter(isIssueWarning);
                  if (warningIssues.length > 0) {
                    setFilter(prev => ({ 
                      ...prev, 
                      status: 'WARNING',
                      search: '',
                      priority: '',
                      type: '',
                      assigneeId: '',
                      projectId: ''
                    }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                    setTimeout(() => {
                      const firstWarningId = warningIssues[0].id;
                      const element = document.querySelector(`[data-row-key="${firstWarningId}"]`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }
                }}
              >
                <ResponsiveStatCard
                  title={
                    <Space>
                      {fixedIssueStats.dueSoon > 0 && (
                        <ExclamationCircleOutlined 
                          style={{ 
                            color: '#faad14',
                            animation: 'blink-warning 2s infinite'
                          }} 
                        />
                      )}
                      Sắp đến hạn
                    </Space>
                  }
                  value={fixedIssueStats.dueSoon}
                  function="issues"
                  valueStyle={{ 
                    fontWeight: fixedIssueStats.dueSoon > 0 ? 'bold' : 'normal',
                    fontSize: fixedIssueStats.dueSoon > 0 ? '24px' : '20px'
                  }}
                />
              </div>
            </Popover>
          </Col>
          </Row>
        </div>

        {/* Filter Card - Responsive */}
        {isMobile ? (
          <MobileFilters
            searchValue={filter.search}
            statusValue={filter.status}
            priorityValue={filter.priority}
            typeValue={filter.type}
            assigneeValue={filter.assigneeId}
            projectValue={filter.projectId}
            statusOptions={statusList}
            priorityOptions={priorityList}
            typeOptions={typeList}
            assigneeOptions={users.map(user => ({ value: user.id, label: user.name }))}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onSearchChange={(value) => handleFilterChange('search', value)}
            onStatusChange={(value) => handleFilterChange('status', value)}
            onPriorityChange={(value) => handleFilterChange('priority', value)}
            onTypeChange={(value) => handleFilterChange('type', value)}
            onAssigneeChange={(value) => handleFilterChange('assigneeId', value)}
            onProjectChange={(value) => handleFilterChange('projectId', value)}
            onReset={() => {
              setFilter({ search: '', status: '', priority: '', type: '', assigneeId: '', projectId: '' });
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            title="Bộ lọc vấn đề"
            isDarkMode={isDarkMode}
            pageType="issues"
          />
        ) : (
          <ResponsiveCollapsibleFilters
            searchValue={filter.search}
            searchPlaceholder="Tìm kiếm vấn đề..."
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
            assigneeValue={filter.assigneeId}
            assigneeOptions={users.map(user => ({ value: user.id, label: user.name }))}
            onAssigneeChange={(value) => handleFilterChange('assigneeId', value)}
            onReset={() => {
              setFilter({ search: '', status: '', priority: '', type: '', assigneeId: '', projectId: '' });
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            title="Bộ lọc vấn đề"
            isMobile={isMobile}
            isTabletLandscape={isTabletLandscape}
            isDarkMode={isDarkMode}
            additionalFilters={
              <Col span={12}>
                <div className="tablet-filter-item">
                  <div className="tablet-filter-label">Loại</div>
                  <Select
                    placeholder="Chọn loại"
                    value={filter.type}
                    onChange={(value) => handleFilterChange('type', value)}
                    allowClear
                    style={{ width: '100%' }}
                    size="middle"
                  >
                    {typeList.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            }
          />
        )}

        {/* Issue Table */}
        {isMobile ? (
          // Mobile Card View
          <div className="mobile-issues-container" style={{
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            padding: '8px 0'
          }}>
            {issues && issues.length > 0 ? sortIssuesByPriority([...issues]).map(issue => ( // Áp dụng logic sắp xếp ưu tiên cho mobile view
              <MobileIssueCard key={issue.id} issue={issue} />
            )) : null}
            {issues.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: isDarkMode ? '#bbb' : '#8c8c8c' 
              }}>
                <ExclamationCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Không tìm thấy vấn đề nào</div>
              </div>
            )}
          </div>
        ) : !isTabletLandscape ? ( // Desktop Table View
          <Table
          columns={parentColumns}
          dataSource={groupedIssues}
          rowKey={record => (record && typeof record === 'object' && 'key' in record ? (record as any).key : undefined)}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={childColumns}
                dataSource={record.issues}
                rowKey={issue => (issue && typeof issue === 'object' && 'id' in issue ? (issue as any).id : undefined)}
                rowClassName={getRowClassName}
                pagination={false}
                showHeader={true}
                bordered={false}
              />
            ),
            rowExpandable: record => record.issues.length > 0,
          }}
          pagination={false}
          showHeader={false}
          bordered
          style={{ marginTop: 24 }}
          locale={{ emptyText: 'Không có vấn đề nào' }}
        />
        ) : ( // Tablet Landscape Table View - Sắp xếp theo: Quá hạn → Mức độ ưu tiên → Trạng thái
          <Table
          columns={getTabletLandscapeColumns()}
          dataSource={sortIssuesByPriority([...issues])} // Áp dụng logic sắp xếp ưu tiên cho tablet landscape
          rowKey="id"
          rowClassName={getRowClassName}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handleTableChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} vấn đề`,
          }}
          bordered
          className="tablet-landscape-issues-table"
          style={{ marginTop: 24 }}
          locale={{ emptyText: 'Không có vấn đề nào' }}
        />
        )}
      </div>

      {/* Issue Modal - Responsive cho 3 thiết bị */}
      <Modal
        title={editingIssue ? 'Sửa vấn đề' : 'Thêm vấn đề'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          // Đảm bảo DatePicker được reset
          form.setFieldsValue({
            dueDate: undefined
          });
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setModalOpen(false);
              form.resetFields();
              form.setFieldsValue({
                dueDate: undefined
              });
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
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical"
          className={
            isMobile ? "" : 
            isTabletLandscape ? "tablet-landscape-edit-form issue-form" : 
            ""
          }
        >
          {/* Tiêu đề - Full width */}
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            className="span-full"
          >
            <Input placeholder="Nhập tiêu đề vấn đề" />
          </Form.Item>

          {/* Mô tả - Full width */}
          <Form.Item name="description" label="Mô tả" className="span-full">
            <Input.TextArea rows={3} placeholder="Nhập mô tả vấn đề" />
          </Form.Item>

          {/* Dự án và Loại - 2 cột */}
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
              <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}>
                <Select placeholder="Chọn loại">
                  {typeList.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Trạng thái và Độ ưu tiên - 2 cột */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                <Select placeholder="Chọn trạng thái">
                  {statusList.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Độ ưu tiên" rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}>
                <Select placeholder="Chọn độ ưu tiên">
                  {priorityList.map(priority => (
                    <Option key={priority.value} value={priority.value}>
                      {priority.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Hạn xử lý và Người được giao - 2 cột */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dueDate" label="Hạn xử lý">
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn hạn xử lý"
                  popupStyle={{ zIndex: 1060 }}
                  getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assigneeId" label="Người được giao">
                <Select placeholder="Chọn người được giao" allowClear>
                  {users.map(user => (
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa vấn đề"
        content="Bạn có chắc chắn muốn xóa vấn đề"
        itemName={issueToDelete?.title}
        size="medium"
      />

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton 
        onClick={handleAdd}
        tooltip="Thêm vấn đề mới"
        color={`linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)`}
      />
    </div>
  );
};

export default Issues;

// CSS styles for overdue issues - Enhanced based on task card styling
const overdueStyles = `
  /* Enhanced Overdue Issue Styling - Based on Task Card Patterns */
  /* More specific selectors to override Ant Design styles */
  .ant-table-tbody > tr.overdue-issue-row,
  .ant-table-tbody > tr.overdue-issue-row:hover {
    border: 3px solid #ff4d4f !important;
    border-radius: 8px !important;
    background: linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 77, 79, 0.1) 100%) !important;
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2) !important;
    margin: 4px 0 !important;
    transition: all 0.3s ease !important;
    position: relative !important;
  }
  
  .ant-table-tbody > tr.overdue-issue-row:hover {
    border-color: #ff7875 !important;
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3) !important;
    transform: translateY(-1px) !important;
  }
  
  /* Warning Issue Styling */
  .ant-table-tbody > tr.warning-issue-row,
  .ant-table-tbody > tr.warning-issue-row:hover {
    border: 2px solid #fa8c16 !important;
    border-radius: 6px !important;
    background: linear-gradient(135deg, rgba(250, 140, 22, 0.05) 0%, rgba(250, 140, 22, 0.1) 100%) !important;
    box-shadow: 0 2px 6px rgba(250, 140, 22, 0.15) !important;
    margin: 4px 0 !important;
    transition: all 0.3s ease !important;
    position: relative !important;
  }
  
  .ant-table-tbody > tr.warning-issue-row:hover {
    border-color: #ffa940 !important;
    box-shadow: 0 3px 10px rgba(250, 140, 22, 0.25) !important;
    transform: translateY(-1px) !important;
  }
  
  /* Table cell styling for overdue rows - more specific */
  .ant-table-tbody > tr.overdue-issue-row > td {
    border-bottom: 1px solid #f0f0f0 !important;
    background: transparent !important;
    position: relative !important;
  }
  
  /* Table cell styling for warning rows */
  .ant-table-tbody > tr.warning-issue-row > td {
    border-bottom: 1px solid #f0f0f0 !important;
    background: transparent !important;
    position: relative !important;
  }
  
  /* Severity-based styling with enhanced gradients and animations */
  .ant-table-tbody > tr.overdue-severity-high {
    border: 3px solid #ff4d4f !important;
    border-radius: 8px !important;
    background: linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.15) 100%) !important;
    box-shadow: 0 3px 10px rgba(255, 77, 79, 0.25) !important;
    animation: pulse-high 2s infinite !important;
  }
  
  .ant-table-tbody > tr.overdue-severity-medium {
    border: 2px solid #fa8c16 !important;
    border-radius: 6px !important;
    background: linear-gradient(135deg, rgba(250, 140, 22, 0.06) 0%, rgba(250, 140, 22, 0.12) 100%) !important;
    box-shadow: 0 2px 8px rgba(250, 140, 22, 0.2) !important;
    animation: pulse-medium 3s infinite !important;
  }
  
  .ant-table-tbody > tr.overdue-severity-low {
    border: 2px solid #faad14 !important;
    border-radius: 6px !important;
    background: linear-gradient(135deg, rgba(250, 173, 20, 0.05) 0%, rgba(250, 173, 20, 0.1) 100%) !important;
    box-shadow: 0 2px 6px rgba(250, 173, 20, 0.15) !important;
  }
  
  /* Warning severity-based styling */
  .ant-table-tbody > tr.warning-severity-high {
    border: 2px solid #fa8c16 !important;
    border-radius: 6px !important;
    background: linear-gradient(135deg, rgba(250, 140, 22, 0.08) 0%, rgba(250, 140, 22, 0.15) 100%) !important;
    box-shadow: 0 3px 10px rgba(250, 140, 22, 0.25) !important;
    animation: pulse-warning-high 2s infinite !important;
  }
  
  .ant-table-tbody > tr.warning-severity-medium {
    border: 2px solid #faad14 !important;
    border-radius: 6px !important;
    background: linear-gradient(135deg, rgba(250, 173, 20, 0.06) 0%, rgba(250, 173, 20, 0.12) 100%) !important;
    box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2) !important;
    animation: pulse-warning-medium 3s infinite !important;
  }
  
  .ant-table-tbody > tr.warning-severity-low {
    border: 2px solid #1890ff !important;
    border-radius: 6px !important;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(24, 144, 255, 0.1) 100%) !important;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15) !important;
  }
  
  /* Enhanced pulse animations for different severity levels */
  @keyframes pulse-high {
    0%, 100% { 
      box-shadow: 0 3px 10px rgba(255, 77, 79, 0.25);
      border-color: #ff4d4f;
    }
    50% { 
      box-shadow: 0 5px 15px rgba(255, 77, 79, 0.4);
      border-color: #ff7875;
    }
  }
  
  @keyframes pulse-medium {
    0%, 100% { 
      box-shadow: 0 2px 8px rgba(250, 140, 22, 0.2);
      border-color: #fa8c16;
    }
    50% { 
      box-shadow: 0 4px 12px rgba(250, 140, 22, 0.3);
      border-color: #ffa940;
    }
  }
  
  @keyframes pulse-overdue {
    0%, 100% { 
      box-shadow: 0 2px 6px rgba(250, 173, 20, 0.15);
      border-color: #faad14;
    }
    50% { 
      box-shadow: 0 4px 10px rgba(250, 173, 20, 0.25);
      border-color: #ffc53d;
    }
  }
  
  /* Warning pulse animations */
  @keyframes pulse-warning-high {
    0%, 100% { 
      box-shadow: 0 3px 10px rgba(250, 140, 22, 0.25);
      border-color: #fa8c16;
    }
    50% { 
      box-shadow: 0 5px 15px rgba(250, 140, 22, 0.4);
      border-color: #ffa940;
    }
  }
  
  @keyframes pulse-warning-medium {
    0%, 100% { 
      box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2);
      border-color: #faad14;
    }
    50% { 
      box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
      border-color: #ffc53d;
    }
  }
  
  /* Enhanced hover effects with more specificity */
  .ant-table-tbody > tr.overdue-issue-row:hover.overdue-severity-high {
    animation: none !important;
    box-shadow: 0 6px 20px rgba(255, 77, 79, 0.4) !important;
    border-color: #ff7875 !important;
  }
  
  .ant-table-tbody > tr.overdue-issue-row:hover.overdue-severity-medium {
    animation: none !important;
    box-shadow: 0 5px 15px rgba(250, 140, 22, 0.35) !important;
    border-color: #ffa940 !important;
  }
  
  .ant-table-tbody > tr.overdue-issue-row:hover.overdue-severity-low {
    animation: none !important;
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3) !important;
    border-color: #ffc53d !important;
  }
  
  /* Warning hover effects */
  .ant-table-tbody > tr.warning-issue-row:hover.warning-severity-high {
    animation: none !important;
    box-shadow: 0 5px 15px rgba(250, 140, 22, 0.35) !important;
    border-color: #ffa940 !important;
  }
  
  .ant-table-tbody > tr.warning-issue-row:hover.warning-severity-medium {
    animation: none !important;
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3) !important;
    border-color: #ffc53d !important;
  }
  
  .ant-table-tbody > tr.warning-issue-row:hover.warning-severity-low {
    animation: none !important;
    box-shadow: 0 3px 10px rgba(24, 144, 255, 0.3) !important;
    border-color: #40a9ff !important;
  }
  
  /* Warning icon for overdue issues */
  .overdue-warning-icon {
    color: #ff4d4f !important;
    margin-right: 8px !important;
    animation: blink 1.5s infinite !important;
  }
  
  /* Warning icon for warning issues */
  .warning-icon {
    color: #fa8c16 !important;
    margin-right: 8px !important;
    animation: blink-warning 2s infinite !important;
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.5; }
  }
  
  @keyframes blink-warning {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.7; }
  }
  
  /* Overdue stats card styling */
  .overdue-stats-card {
    animation: pulse-overdue-stats 2s infinite !important;
  }
  
  .overdue-stats-card:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(255, 77, 79, 0.4) !important;
    animation: none !important;
  }
  
  @keyframes pulse-overdue-stats {
    0%, 100% { 
      box-shadow: 0 3px 10px rgba(255, 77, 79, 0.25);
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 5px 15px rgba(255, 77, 79, 0.4);
      transform: scale(1.02);
    }
  }
  
  /* Additional specificity for nested tables */
  .ant-table-nested .ant-table-tbody > tr.overdue-issue-row,
  .ant-table-expanded-row .ant-table-tbody > tr.overdue-issue-row {
    border: 3px solid #ff4d4f !important;
    border-radius: 8px !important;
    background: linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 77, 79, 0.1) 100%) !important;
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2) !important;
    margin: 4px 0 !important;
    transition: all 0.3s ease !important;
  }
  
  /* Additional specificity for nested tables - warning */
  .ant-table-nested .ant-table-tbody > tr.warning-issue-row,
  .ant-table-expanded-row .ant-table-tbody > tr.warning-issue-row {
    border: 2px solid #fa8c16 !important;
    border-radius: 6px !important;
    background: linear-gradient(135deg, rgba(250, 140, 22, 0.05) 0%, rgba(250, 140, 22, 0.1) 100%) !important;
    box-shadow: 0 2px 6px rgba(250, 140, 22, 0.15) !important;
    margin: 4px 0 !important;
    transition: all 0.3s ease !important;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = overdueStyles;
  document.head.appendChild(styleElement);
} 