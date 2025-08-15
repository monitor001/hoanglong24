import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Switch, 
  Typography, 
  message, 
  Divider, 
  Tabs, 
  Select, 
  Space, 
  Row, 
  Col,
  Checkbox,
  ColorPicker,
  InputNumber,
  Tag,
  Tooltip,
  Collapse,
  Alert,
  Spin,
  Result
} from 'antd';
import { 
  SaveOutlined, 
  SettingOutlined, 
  FileTextOutlined, 
  ForkOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import MobileSettingsView from '../components/MobileSettingsView';
import SessionManager from '../components/SessionManager';
import SessionInfo from '../components/SessionInfo';
import CollapsiblePermissionMatrix from '../components/CollapsiblePermissionMatrix';
import { useResponsive, useResponsiveWithOrientation } from '../hooks/useResponsive';

import { useNavigate } from 'react-router-dom';
import '../styles/mobile-settings.css';
import '../styles/permission-matrix-responsive.css';
import '../styles/collapsible-permission-matrix.css';

const { Title, Text } = Typography;
// Remove TabPane import as it's deprecated
const { Option } = Select;
const { Panel } = Collapse;

interface DocumentStatus {
  id: string;
  name: string;
  nameVi: string;
  color: string;
  isActive: boolean;
}

interface MetadataField {
  id: string;
  name: string;
  nameVi: string;
  isRequired: boolean;
  isActive: boolean;
}

interface ApprovalStep {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  isAutomatic: boolean;
  isRequired: boolean;
  approverRole?: string;
  order: number;
}

interface FileNamingRule {
  template: string;
  example: string;
  isActive: boolean;
}

interface Permission {
  id: string;
  name: string;
  nameVi: string;
  description?: string;
  category?: string;
}

interface Role {
  id: string;
  name: string;
  nameVi: string;
  color: string;
}

interface Position {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  description: string;
  level: number;
}

interface PermissionMatrix {
  [permissionId: string]: {
    [roleId: string]: boolean;
  };
}

interface PositionPermissionMatrix {
  [permissionId: string]: {
    [positionId: string]: boolean;
  };
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [isoForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { isMobile, isTablet } = useResponsive();
  const { isTabletLandscape } = useResponsiveWithOrientation();
  
  const navigate = useNavigate();

  // Permission Matrix State
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Position Permission Matrix State
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionPermissionMatrix, setPositionPermissionMatrix] = useState<PositionPermissionMatrix>({});
  const [activePermissionTab, setActivePermissionTab] = useState('roles');
  const [hasUnsavedPermissions, setHasUnsavedPermissions] = useState(false);

  // ISO 19650 Configuration State
  const [documentStatuses, setDocumentStatuses] = useState<DocumentStatus[]>([
    { id: 'wip', name: 'WIP', nameVi: 'Đang thực hiện', color: '#faad14', isActive: true },
    { id: 'shared', name: 'Shared', nameVi: 'Đã chia sẻ', color: '#1890ff', isActive: true },
    { id: 'published', name: 'Published', nameVi: 'Đã xuất bản', color: '#52c41a', isActive: true },
    { id: 'archived', name: 'Archived', nameVi: 'Đã lưu trữ', color: '#8c8c8c', isActive: true }
  ]);

  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([
    { id: 'discipline', name: 'Discipline', nameVi: 'Chuyên ngành kỹ thuật', isRequired: true, isActive: true },
    { id: 'originator', name: 'Originator', nameVi: 'Tổ chức tạo tài liệu', isRequired: true, isActive: true },
    { id: 'zone', name: 'Zone/System', nameVi: 'Khu vực hoặc hệ thống', isRequired: false, isActive: true }
  ]);

  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([
    {
      id: 'create',
      name: 'Create Document',
      nameVi: 'Tạo tài liệu',
      description: 'Tài liệu được tạo với trạng thái WIP',
      isAutomatic: true,
      isRequired: true,
      order: 1
    },
    {
      id: 'internal-review',
      name: 'Internal Review',
      nameVi: 'Kiểm tra nội bộ',
      description: 'Kiểm tra chất lượng nội bộ trước khi chia sẻ',
      isAutomatic: false,
      isRequired: true,
      order: 2
    },
    {
      id: 'team-share',
      name: 'Share with Team',
      nameVi: 'Chia sẻ với team',
      description: 'Chuyển sang trạng thái Shared để team review',
      isAutomatic: false,
      isRequired: true,
      order: 3
    },
    {
      id: 'final-approval',
      name: 'Final Approval',
      nameVi: 'Phê duyệt cuối',
      description: 'Phê duyệt chính thức để Published',
      isAutomatic: false,
      isRequired: true,
      approverRole: 'Project Manager',
      order: 4
    }
  ]);

  const [fileNamingRule, setFileNamingRule] = useState<FileNamingRule>({
    template: '{Project}-{Originator}-{Zone}-{Level}-{Type}-{Role}-{Number}',
    example: 'ABC-XYZ-00-00-DR-A-001.pdf',
    isActive: true
  });

  // Định nghĩa các chức năng hệ thống với thứ tự
  const systemFeatures = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      nameVi: 'Tổng quan',
      description: 'Xem tổng quan hệ thống, thống kê và biểu đồ',
      order: 1,
      permissions: [
        { id: 'dashboard_view', name: 'View Dashboard', nameVi: 'Xem tổng quan' },
        { id: 'dashboard_export', name: 'Export Dashboard', nameVi: 'Xuất báo cáo' },
        { id: 'dashboard_print', name: 'Print Dashboard', nameVi: 'In báo cáo' },
        { id: 'dashboard_download', name: 'Download Dashboard', nameVi: 'Tải xuống dữ liệu' }
      ]
    },
    {
      id: 'tasks',
      name: 'Tasks',
      nameVi: 'Nhiệm vụ',
      description: 'Quản lý nhiệm vụ và công việc',
      order: 2,
      permissions: [
        { id: 'view_tasks', name: 'View Tasks', nameVi: 'Xem nhiệm vụ' },
        { id: 'create_tasks', name: 'Create Tasks', nameVi: 'Tạo nhiệm vụ' },
        { id: 'edit_tasks', name: 'Edit Tasks', nameVi: 'Chỉnh sửa nhiệm vụ' },
        { id: 'delete_tasks', name: 'Delete Tasks', nameVi: 'Xóa nhiệm vụ' },
        { id: 'assign_tasks', name: 'Assign Tasks', nameVi: 'Phân công nhiệm vụ' },
        { id: 'view_task_statistics', name: 'View Task Statistics', nameVi: 'Xem thống kê nhiệm vụ' }
      ]
    },
    {
      id: 'issues',
      name: 'Issues',
      nameVi: 'Vấn đề',
      description: 'Quản lý vấn đề và sự cố',
      order: 3,
      permissions: [
        { id: 'view_issues', name: 'View Issues', nameVi: 'Xem vấn đề' },
        { id: 'create_issues', name: 'Create Issues', nameVi: 'Tạo vấn đề' },
        { id: 'edit_issues', name: 'Edit Issues', nameVi: 'Chỉnh sửa vấn đề' },
        { id: 'delete_issues', name: 'Delete Issues', nameVi: 'Xóa vấn đề' },
        { id: 'assign_issues', name: 'Assign Issues', nameVi: 'Phân công vấn đề' },
        { id: 'view_issue_statistics', name: 'View Issue Statistics', nameVi: 'Xem thống kê vấn đề' }
      ]
    },
    {
      id: 'projects',
      name: 'Projects',
      nameVi: 'Dự án',
      description: 'Quản lý dự án, thông tin và tiến độ',
      order: 4,
      permissions: [
        { id: 'view_projects', name: 'View Projects', nameVi: 'Xem dự án' },
        { id: 'view_project_details', name: 'View Project Details', nameVi: 'Xem chi tiết dự án' },
        { id: 'create_projects', name: 'Create Projects', nameVi: 'Tạo dự án' },
        { id: 'edit_projects', name: 'Edit Projects', nameVi: 'Chỉnh sửa dự án' },
        { id: 'delete_projects', name: 'Delete Projects', nameVi: 'Xóa dự án' },
        { id: 'export_projects', name: 'Export Projects', nameVi: 'Xuất báo cáo dự án' },
        { id: 'manage_project_members', name: 'Manage Project Members', nameVi: 'Quản lý thành viên dự án' },
        { id: 'upload_project_images', name: 'Upload Project Images', nameVi: 'Tải ảnh dự án' },
        { id: 'add_project_notes', name: 'Add Project Notes', nameVi: 'Thêm ghi chú dự án' },
        { id: 'view_project_notes', name: 'View Project Notes', nameVi: 'Xem ghi chú dự án' },
        { id: 'edit_project_notes', name: 'Edit Project Notes', nameVi: 'Chỉnh sửa ghi chú dự án' },
        { id: 'delete_project_notes', name: 'Delete Project Notes', nameVi: 'Xóa ghi chú dự án' },
        { id: 'share_project_notes', name: 'Share Project Notes', nameVi: 'Chia sẻ ghi chú dự án' },
        { id: 'filter_projects', name: 'Filter Projects', nameVi: 'Lọc dự án' },
        { id: 'search_projects', name: 'Search Projects', nameVi: 'Tìm kiếm dự án' },
        { id: 'view_project_statistics', name: 'View Project Statistics', nameVi: 'Xem thống kê dự án' },
        { id: 'export_project_data', name: 'Export Project Data', nameVi: 'Xuất dữ liệu dự án' },
        { id: 'import_project_data', name: 'Import Project Data', nameVi: 'Nhập dữ liệu dự án' },
        { id: 'archive_projects', name: 'Archive Projects', nameVi: 'Lưu trữ dự án' },
        { id: 'restore_projects', name: 'Restore Projects', nameVi: 'Khôi phục dự án' },
        { id: 'duplicate_projects', name: 'Duplicate Projects', nameVi: 'Sao chép dự án' },
        { id: 'assign_project_roles', name: 'Assign Project Roles', nameVi: 'Phân quyền dự án' },
        { id: 'view_project_history', name: 'View Project History', nameVi: 'Xem lịch sử dự án' },
        { id: 'approve_project_changes', name: 'Approve Project Changes', nameVi: 'Phê duyệt thay đổi dự án' }
      ]
    },
    {
      id: 'documents',
      name: 'Documents ISO',
      nameVi: 'Tài liệu ISO',
      description: 'Quản lý tài liệu theo chuẩn ISO 19650',
      order: 5,
      permissions: [
        { id: 'view_documents', name: 'View Documents', nameVi: 'Xem tài liệu' },
        { id: 'create_documents', name: 'Create Documents', nameVi: 'Tạo tài liệu' },
        { id: 'edit_documents', name: 'Edit Documents', nameVi: 'Chỉnh sửa tài liệu' },
        { id: 'delete_documents', name: 'Delete Documents', nameVi: 'Xóa tài liệu' },
        { id: 'upload_documents', name: 'Upload Documents', nameVi: 'Tải tài liệu' },
        { id: 'download_documents', name: 'Download Documents', nameVi: 'Tải xuống tài liệu' },
        { id: 'share_documents', name: 'Share Documents', nameVi: 'Chia sẻ tài liệu' },
        { id: 'approve_documents', name: 'Approve Documents', nameVi: 'Phê duyệt tài liệu' },
        { id: 'version_documents', name: 'Version Documents', nameVi: 'Quản lý phiên bản tài liệu' }
      ]
    },

    {
      id: 'calendar',
      name: 'Calendar',
      nameVi: 'Lịch',
      description: 'Quản lý lịch họp, deadline và sự kiện',
      order: 6,
      permissions: [
        { id: 'view_calendar', name: 'View Calendar', nameVi: 'Xem lịch' },
        { id: 'create_calendar', name: 'Create Calendar Events', nameVi: 'Tạo sự kiện lịch' },
        { id: 'edit_calendar', name: 'Edit Calendar Events', nameVi: 'Chỉnh sửa sự kiện lịch' },
        { id: 'delete_calendar', name: 'Delete Calendar Events', nameVi: 'Xóa sự kiện lịch' },
        { id: 'share_calendar', name: 'Share Calendar', nameVi: 'Chia sẻ lịch' },
        { id: 'export_calendar', name: 'Export Calendar', nameVi: 'Xuất lịch' }
      ]
    },
    {
      id: 'approvals',
      name: 'Approval Kanban',
      nameVi: 'Phê duyệt hồ sơ',
      description: 'Quản lý quy trình phê duyệt theo Kanban',
      order: 7,
      permissions: [
        { id: 'view_approvals', name: 'View Approvals', nameVi: 'Xem phê duyệt' },
        { id: 'create_approvals', name: 'Create Approvals', nameVi: 'Tạo phê duyệt' },
        { id: 'edit_approvals', name: 'Edit Approvals', nameVi: 'Chỉnh sửa phê duyệt' },
        { id: 'approve_approvals', name: 'Approve Documents', nameVi: 'Phê duyệt tài liệu' },
        { id: 'reject_approvals', name: 'Reject Approvals', nameVi: 'Từ chối phê duyệt' },
        { id: 'delegate_approvals', name: 'Delegate Approvals', nameVi: 'Ủy quyền phê duyệt' }
      ]
    },
    {
      id: 'notes',
      name: 'Notes',
      nameVi: 'Ghi chú',
      description: 'Quản lý ghi chú và bình luận',
      order: 8,
      permissions: [
        { id: 'view_notes', name: 'View Notes', nameVi: 'Xem ghi chú' },
        { id: 'create_notes', name: 'Create Notes', nameVi: 'Tạo ghi chú' },
        { id: 'edit_notes', name: 'Edit Notes', nameVi: 'Chỉnh sửa ghi chú' },
        { id: 'delete_notes', name: 'Delete Notes', nameVi: 'Xóa ghi chú' },
        { id: 'share_notes', name: 'Share Notes', nameVi: 'Chia sẻ ghi chú' },
        { id: 'export_notes', name: 'Export Notes', nameVi: 'Xuất ghi chú' }
      ]
    },
    {
      id: 'checklist',
      name: 'Design Checklist',
      nameVi: 'Hồ sơ thiết kế',
      description: 'Quản lý checklist hồ sơ thiết kế',
      order: 9,
      permissions: [
        { id: 'view_checklists', name: 'View Checklists', nameVi: 'Xem danh sách kiểm tra' },
        { id: 'create_checklists', name: 'Create Checklists', nameVi: 'Tạo danh sách kiểm tra' },
        { id: 'edit_checklists', name: 'Edit Checklists', nameVi: 'Chỉnh sửa danh sách kiểm tra' },
        { id: 'delete_checklists', name: 'Delete Checklists', nameVi: 'Xóa danh sách kiểm tra' },
        { id: 'approve_checklists', name: 'Approve Checklists', nameVi: 'Phê duyệt danh sách kiểm tra' },
        { id: 'complete_checklists', name: 'Complete Checklists', nameVi: 'Hoàn thành danh sách kiểm tra' },
        { id: 'export_checklists', name: 'Export Checklists', nameVi: 'Xuất danh sách kiểm tra' }
      ]
    },
    {
      id: 'todo',
      name: 'Todo List',
      nameVi: 'Danh sách nhiệm vụ',
      description: 'Quản lý nhiệm vụ theo ngày',
      order: 10,
      permissions: [
        { id: 'view_todo', name: 'View Todo List', nameVi: 'Xem danh sách' },
        { id: 'create_todo', name: 'Create Todo Items', nameVi: 'Tạo nhiệm vụ' },
        { id: 'edit_todo', name: 'Edit Todo Items', nameVi: 'Chỉnh sửa nhiệm vụ' },
        { id: 'delete_todo', name: 'Delete Todo Items', nameVi: 'Xóa nhiệm vụ' },
        { id: 'complete_todo', name: 'Complete Todo Items', nameVi: 'Hoàn thành nhiệm vụ' }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      nameVi: 'Báo cáo',
      description: 'Quản lý báo cáo và thống kê hệ thống',
      order: 11,
      permissions: [
        { id: 'view_reports', name: 'View Reports', nameVi: 'Xem báo cáo' },
        { id: 'create_reports', name: 'Create Reports', nameVi: 'Tạo báo cáo' },
        { id: 'export_reports', name: 'Export Reports', nameVi: 'Xuất báo cáo' },
        { id: 'schedule_reports', name: 'Schedule Reports', nameVi: 'Lên lịch báo cáo' },
        { id: 'share_reports', name: 'Share Reports', nameVi: 'Chia sẻ báo cáo' },
        { id: 'delete_reports', name: 'Delete Reports', nameVi: 'Xóa báo cáo' }
      ]
    },
    {
      id: 'users',
      name: 'Users Management',
      nameVi: 'Quản lý người dùng',
      description: 'Quản lý thành viên, vai trò và phân quyền',
      order: 12,
      permissions: [
        { id: 'view_users', name: 'View Users', nameVi: 'Xem người dùng' },
        { id: 'create_users', name: 'Create Users', nameVi: 'Tạo người dùng' },
        { id: 'edit_users', name: 'Edit Users', nameVi: 'Chỉnh sửa người dùng' },
        { id: 'delete_users', name: 'Delete Users', nameVi: 'Xóa người dùng' },
        { id: 'manage_user_roles', name: 'Manage User Roles', nameVi: 'Quản lý vai trò người dùng' },
        { id: 'view_user_activity', name: 'View User Activity', nameVi: 'Xem hoạt động người dùng' },
        { id: 'manage_user_sessions', name: 'Manage User Sessions', nameVi: 'Quản lý phiên đăng nhập' },
        { id: 'export_user_data', name: 'Export User Data', nameVi: 'Xuất dữ liệu người dùng' },
        { id: 'view_user_statistics', name: 'View User Statistics', nameVi: 'Xem thống kê người dùng' }
      ]
    },
    {
      id: 'settings',
      name: 'System Settings',
      nameVi: 'Cài đặt hệ thống',
      description: 'Cấu hình hệ thống và quy trình ISO',
      order: 13,
      permissions: [
        { id: 'view_settings', name: 'View Settings', nameVi: 'Xem cài đặt' },
        { id: 'edit_settings', name: 'Edit Settings', nameVi: 'Chỉnh sửa cài đặt' },
        { id: 'manage_permissions', name: 'Manage Permissions', nameVi: 'Quản lý phân quyền' },
        { id: 'manage_sessions', name: 'Manage Sessions', nameVi: 'Quản lý phiên đăng nhập' },
        { id: 'view_system_logs', name: 'View System Logs', nameVi: 'Xem nhật ký hệ thống' },
        { id: 'view_audit_logs', name: 'View Audit Logs', nameVi: 'Xem nhật ký kiểm toán' },
        { id: 'manage_iso_config', name: 'Manage ISO Config', nameVi: 'Quản lý cấu hình ISO' },
        { id: 'manage_email_settings', name: 'Manage Email Settings', nameVi: 'Quản lý cài đặt email' },
        { id: 'view_system_statistics', name: 'View System Statistics', nameVi: 'Xem thống kê hệ thống' },
        { id: 'reset_settings', name: 'Reset Settings', nameVi: 'Đặt lại cài đặt' }
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await axiosInstance.get('/auth/me');
        const userData = userRes.data as any;
        if (userData && typeof userData === 'object') {
          setUser(userData);
          form.setFieldsValue({ name: userData.name, email: userData.email });
        }

        // Fetch projects
        const projectsRes = await axiosInstance.get('/projects');
        setProjects(projectsRes.data.projects || projectsRes.data || []);

        // Fetch permission matrix from backend
        await fetchPermissionMatrix();
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    };

    fetchData();
  }, []);

  // Fetch permission matrix from backend
  const fetchPermissionMatrix = async () => {
    try {
      setLoadingPermissions(true);
      const response = await axiosInstance.get('/settings/permissions-config');
      const { permissions: backendPermissions, roles: backendRoles, rolePermissionMatrix } = response.data;
      
      // Update state with backend data
      setPermissions(backendPermissions);
      setRoles(backendRoles);
      setPermissionMatrix(rolePermissionMatrix);
    } catch (error) {
      console.error('Error fetching permission matrix:', error);
      message.error('Không thể tải ma trận phân quyền. Vui lòng thử lại.');
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Update permission matrix
  const updatePermissionMatrix = (permissionId: string, roleId: string, value: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [roleId]: value
      }
    }));
    setHasUnsavedPermissions(true);
  };

  // Save permission matrix
  const handlePermissionMatrixSave = async () => {
    try {
      setLoading(true);
      await axiosInstance.put('/settings/permissions', {
        rolePermissionMatrix: permissionMatrix
      });
      
      setHasUnsavedPermissions(false);
      message.success('Đã lưu ma trận phân quyền thành công!');
    } catch (error) {
      console.error('Error saving permission matrix:', error);
      message.error('Không thể lưu ma trận phân quyền. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfile = async (values: any) => {
    setLoading(true);
    try {
      await axiosInstance.put('/auth/me', values);
      message.success('Đã cập nhật thông tin cá nhân!');
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Lỗi cập nhật!');
    }
    setLoading(false);
  };

  const handlePassword = async (values: any) => {
    setLoading(true);
    try {
      await axiosInstance.post('/settings/change-password', values);
      message.success('Đổi mật khẩu thành công!');
      pwdForm.resetFields();
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Lỗi đổi mật khẩu!');
    }
    setLoading(false);
  };

  const loadISOConfigForProject = async (projectId: string | null) => {
    try {
      const url = projectId 
        ? `/settings/iso/config?projectId=${projectId}`
        : '/settings/iso/config';
      
      const isoRes = await axiosInstance.get(url);
      const isoConfig = isoRes.data;
      
      if (isoConfig.documentStatuses) {
        setDocumentStatuses(isoConfig.documentStatuses);
      }
      if (isoConfig.metadataFields) {
        setMetadataFields(isoConfig.metadataFields);
      }
      if (isoConfig.approvalSteps) {
        setApprovalSteps(isoConfig.approvalSteps);
      }
      if (isoConfig.fileNamingRule) {
        setFileNamingRule(isoConfig.fileNamingRule);
      }
    } catch (error) {
      console.error('Error loading ISO config for project:', error);
    }
  };

  const handleProjectChange = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    loadISOConfigForProject(projectId);
  };

  const handleISOSave = async () => {
    setLoading(true);
    try {
      // Save ISO 19650 configuration
      const isoConfig = {
        documentStatuses,
        metadataFields,
        approvalSteps,
        fileNamingRule,
        projectId: selectedProjectId
      };
      
      await axiosInstance.put('/settings/iso/config', isoConfig);
      
      const projectName = selectedProjectId 
        ? projects.find(p => p.id === selectedProjectId)?.name || 'Dự án'
        : 'Toàn hệ thống';
      
      message.success(`Đã lưu cấu hình ISO 19650 cho ${projectName}!`);
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Lỗi lưu cấu hình!');
    }
    setLoading(false);
  };

  const handlePositionPermissionMatrixSave = async () => {
    setLoading(true);
    try {
      // Validate permission matrices before saving
      const roleMatrixToSave = { ...permissionMatrix };
      const positionMatrixToSave = { ...positionPermissionMatrix };

      // Ensure all permissions have values for all roles
      systemFeatures.forEach(feature => {
        feature.permissions.forEach(permission => {
          if (!roleMatrixToSave[permission.id]) {
            roleMatrixToSave[permission.id] = {};
          }
                      roles.forEach(role => {
              if (roleMatrixToSave[permission.id][role.id] === undefined) {
                // Use database-driven permission matrix instead of hardcoded logic
                roleMatrixToSave[permission.id][role.id] = permissionMatrix[permission.id]?.[role.id] || false;
              }
            });
        });
      });

      // Ensure all permissions have values for all positions
      if (positions.length > 0) {
        systemFeatures.forEach(feature => {
          feature.permissions.forEach(permission => {
            if (!positionMatrixToSave[permission.id]) {
              positionMatrixToSave[permission.id] = {};
            }
            positions.forEach(position => {
              if (positionMatrixToSave[permission.id][position.id] === undefined) {
                // Set default values based on position level
                if (position.level <= 2) {
                  positionMatrixToSave[permission.id][position.id] = true; // Director and Manager get all permissions
                } else if (permission.id.includes('_view')) {
                  positionMatrixToSave[permission.id][position.id] = true; // View permissions for all positions
                } else if (permission.id.includes('_create') || permission.id.includes('_edit')) {
                  positionMatrixToSave[permission.id][position.id] = position.level <= 3; // Senior and above
                } else if (permission.id.includes('_delete')) {
                  positionMatrixToSave[permission.id][position.id] = position.level <= 2; // Manager and above
                } else if (permission.id.includes('_approve')) {
                  positionMatrixToSave[permission.id][position.id] = position.level <= 2; // Manager and above
                } else {
                  positionMatrixToSave[permission.id][position.id] = false; // Default to false
                }
              }
            });
          });
        });
      }

      await axiosInstance.put('/settings/permissions', {
        rolePermissionMatrix: roleMatrixToSave,
        positionPermissionMatrix: positionMatrixToSave
      });
      
      // Update local state with the saved matrices
      setPermissionMatrix(roleMatrixToSave);
      setPositionPermissionMatrix(positionMatrixToSave);
      
      // Clear unsaved changes flag
      setHasUnsavedPermissions(false);
      
      message.success('Đã lưu ma trận phân quyền thành công!');
    } catch (e: any) {
      console.error('Error saving permission matrices:', e);
      message.error(e.response?.data?.error || 'Lỗi lưu ma trận phân quyền!');
    }
    setLoading(false);
  };

  // Initialize permission matrix with all system features
  const initializePermissionMatrix = () => {
    const newMatrix: PermissionMatrix = { ...permissionMatrix };
    
    systemFeatures.forEach(feature => {
      feature.permissions.forEach(permission => {
        if (!newMatrix[permission.id]) {
          newMatrix[permission.id] = {};
          roles.forEach(role => {
            // Use database-driven permission matrix instead of hardcoded logic
            newMatrix[permission.id][role.id] = permissionMatrix[permission.id]?.[role.id] || false;
          });
        }
      });
    });
    
    setPermissionMatrix(newMatrix);
  };

  const updatePositionPermissionMatrix = (permissionId: string, positionId: string, value: boolean) => {
    setPositionPermissionMatrix(prev => {
      // Ensure the permission exists in the matrix
      const currentPermission = prev[permissionId] || {};
      
      // Ensure all positions exist for this permission
      const updatedPermission = { ...currentPermission };
      positions.forEach(position => {
        if (!(position.id in updatedPermission)) {
          // Set default values for new permissions based on position level
          if (position.level <= 2) {
            updatedPermission[position.id] = true; // Director and Manager get all permissions
          } else if (permissionId.includes('_view')) {
            updatedPermission[position.id] = true; // View permissions for all positions
          } else if (permissionId.includes('_create') || permissionId.includes('_edit')) {
            updatedPermission[position.id] = position.level <= 3; // Senior and above
          } else if (permissionId.includes('_delete')) {
            updatedPermission[position.id] = position.level <= 2; // Manager and above
          } else if (permissionId.includes('_approve')) {
            updatedPermission[position.id] = position.level <= 2; // Manager and above
          } else {
            updatedPermission[position.id] = false; // Default to false for other permissions
          }
        }
      });
      
      // Update the specific permission value
      updatedPermission[positionId] = value;
      
      // Mark as having unsaved changes
      setHasUnsavedPermissions(true);
      
      return {
        ...prev,
        [permissionId]: updatedPermission
      };
    });
  };

  const updateDocumentStatus = (id: string, field: keyof DocumentStatus, value: any) => {
    setDocumentStatuses(prev => 
      prev.map(status => 
        status.id === id ? { ...status, [field]: value } : status
      )
    );
  };

  const updateMetadataField = (id: string, field: keyof MetadataField, value: any) => {
    setMetadataFields(prev => 
      prev.map(field_item => 
        field_item.id === id ? { ...field_item, [field]: value } : field_item
      )
    );
  };

  const updateApprovalStep = (id: string, field: keyof ApprovalStep, value: any) => {
    setApprovalSteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  const addMetadataField = () => {
    const newField: MetadataField = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      nameVi: 'Trường mới',
      isRequired: false,
      isActive: true
    };
    setMetadataFields(prev => [...prev, newField]);
  };

  const removeMetadataField = (id: string) => {
    setMetadataFields(prev => prev.filter(field => field.id !== id));
  };

  const renderProfileTab = () => (
    <div>
      <Title level={4}>Thông tin cá nhân</Title>
      <Form form={form} layout="vertical" onFinish={handleProfile} style={{ marginBottom: 24 }} className="settings-form">
        <Form.Item name="name" label="Tên cá nhân" rules={[{ required: true, message: 'Nhập tên!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email!' }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
      
      <Divider />
      
      <Title level={4}>Đổi mật khẩu</Title>
      <Form form={pwdForm} layout="vertical" onFinish={handlePassword} className="settings-form">
        <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}>
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
      
      <Divider />
      
      <Title level={4}>Giao diện</Title>
      <Form.Item name="theme" label="Chế độ giao diện" valuePropName="checked">
        <Switch checkedChildren="Tối" unCheckedChildren="Sáng" />
      </Form.Item>
    </div>
  );

  const renderISOTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4}>Quy Trình ISO 19650</Title>
          <Text type="secondary">
            Cấu hình workflow tự động và quy trình phê duyệt theo tiêu chuẩn ISO 19650
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleISOSave}
          loading={loading}
        >
          Lưu Thay Đổi
        </Button>
      </div>

      {/* Project Selector */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text strong>Chọn dự án:</Text>
          <Select
            style={{ width: 300 }}
            placeholder="Chọn dự án để cấu hình riêng (hoặc để trống cho cấu hình toàn hệ thống)"
            allowClear
            value={selectedProjectId}
            onChange={handleProjectChange}
          >
            <Option value={null}>Toàn hệ thống (Global)</Option>
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
          {selectedProjectId && (
            <Tag color="blue">
              Cấu hình riêng cho: {projects.find(p => p.id === selectedProjectId)?.name}
            </Tag>
          )}
        </div>
      </Card>

      <Collapse defaultActiveKey={['document-status', 'metadata-fields', 'approval-process', 'file-naming']}>
        
        {/* Document Status Configuration */}
        <Panel header="Trạng Thái Tài Liệu" key="document-status">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Cấu hình các trạng thái tài liệu theo ISO 19650
          </Text>
          
          {documentStatuses.map((status, index) => (
            <Card key={status.id} size="small" style={{ marginBottom: 12 }}>
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <Input
                    value={status.name}
                    onChange={(e) => updateDocumentStatus(status.id, 'name', e.target.value)}
                    placeholder="Tên tiếng Anh"
                  />
                </Col>
                <Col span={6}>
                  <Input
                    value={status.nameVi}
                    onChange={(e) => updateDocumentStatus(status.id, 'nameVi', e.target.value)}
                    placeholder="Tên tiếng Việt"
                  />
                </Col>
                <Col span={4}>
                  <ColorPicker
                    value={status.color}
                    onChange={(color) => updateDocumentStatus(status.id, 'color', color.toHexString())}
                  />
                </Col>
                <Col span={4}>
                  <Tag color={status.color}>{status.nameVi}</Tag>
                </Col>
                <Col span={4}>
                  <Switch
                    checked={status.isActive}
                    onChange={(checked) => updateDocumentStatus(status.id, 'isActive', checked)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </Panel>

        {/* Metadata Fields Configuration */}
        <Panel header="Metadata Fields" key="metadata-fields">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Cấu hình các trường metadata bắt buộc theo ISO 19650
          </Text>
          
          {metadataFields.map((field) => (
            <Card key={field.id} size="small" style={{ marginBottom: 12 }}>
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <Input
                    value={field.name}
                    onChange={(e) => updateMetadataField(field.id, 'name', e.target.value)}
                    placeholder="Tên tiếng Anh"
                  />
                </Col>
                <Col span={6}>
                  <Input
                    value={field.nameVi}
                    onChange={(e) => updateMetadataField(field.id, 'nameVi', e.target.value)}
                    placeholder="Tên tiếng Việt"
                  />
                </Col>
                <Col span={4}>
                  <Checkbox
                    checked={field.isRequired}
                    onChange={(e) => updateMetadataField(field.id, 'isRequired', e.target.checked)}
                  >
                    Bắt buộc
                  </Checkbox>
                </Col>
                <Col span={4}>
                  <Switch
                    checked={field.isActive}
                    onChange={(checked) => updateMetadataField(field.id, 'isActive', checked)}
                  />
                </Col>
                <Col span={4}>
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => removeMetadataField(field.id)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
          
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={addMetadataField}
            style={{ marginTop: 12 }}
          >
            Thêm Field Mới
          </Button>
        </Panel>

        {/* Approval Process Configuration */}
        <Panel header="Quy Trình Phê Duyệt" key="approval-process">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Cấu hình quy trình phê duyệt tự động theo ISO 19650
          </Text>
          
          {approvalSteps.map((step) => (
            <Card key={step.id} size="small" style={{ marginBottom: 12 }}>
              <Row gutter={16} align="middle">
                <Col span={2}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    backgroundColor: '#1890ff', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}>
                    {step.order}
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <Text strong>{step.nameVi}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {step.description}
                    </Text>
                  </div>
                </Col>
                <Col span={4}>
                  <Switch
                    checked={step.isAutomatic}
                    onChange={(checked) => updateApprovalStep(step.id, 'isAutomatic', checked)}
                  />
                  <Text style={{ marginLeft: 8, fontSize: 12 }}>
                    {step.isAutomatic ? 'Tự động' : 'Thủ công'}
                  </Text>
                </Col>
                <Col span={4}>
                  <Checkbox
                    checked={step.isRequired}
                    onChange={(e) => updateApprovalStep(step.id, 'isRequired', e.target.checked)}
                  >
                    Bắt buộc
                  </Checkbox>
                </Col>
                <Col span={6}>
                  {step.id === 'final-approval' && (
                    <Select
                      value={step.approverRole}
                      onChange={(value) => updateApprovalStep(step.id, 'approverRole', value)}
                      placeholder="Chọn vai trò"
                      style={{ width: '100%' }}
                    >
                      <Option value="Project Manager">Project Manager</Option>
                      <Option value="Technical Lead">Technical Lead</Option>
                      <Option value="Quality Manager">Quality Manager</Option>
                    </Select>
                  )}
                </Col>
              </Row>
            </Card>
          ))}
        </Panel>

        {/* File Naming Rules */}
        <Panel header="Quy Tắc Đặt Tên File" key="file-naming">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Cấu hình quy tắc đặt tên file theo ISO 19650
          </Text>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Template">
                <Input
                  value={fileNamingRule.template}
                  onChange={(e) => setFileNamingRule(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="{Project}-{Originator}-{Zone}-{Level}-{Type}-{Role}-{Number}"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ví dụ">
                <Input
                  value={fileNamingRule.example}
                  onChange={(e) => setFileNamingRule(prev => ({ ...prev, example: e.target.value }))}
                  placeholder="ABC-XYZ-00-00-DR-A-001.pdf"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Switch
              checked={fileNamingRule.isActive}
              onChange={(checked) => setFileNamingRule(prev => ({ ...prev, isActive: checked }))}
            />
            <Text style={{ marginLeft: 8 }}>Kích hoạt quy tắc đặt tên</Text>
          </Form.Item>
        </Panel>
      </Collapse>
    </div>
  );

  const renderPermissionMatrixTab = () => {
    // Show loading state
    if (loadingPermissions) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải ma trận phân quyền...</Text>
          </div>
        </div>
      );
    }

    // Show error state if no data
    if (!permissions.length || !roles.length) {
      return (
        <div className="permissions-error">
          <ExclamationCircleOutlined className="error-icon" />
          <div className="error-text">Không thể tải dữ liệu phân quyền</div>
          <Button type="primary" onClick={fetchPermissionMatrix}>
            Thử lại
          </Button>
        </div>
      );
    }

    const renderRolesMatrix = () => {
      return (
        <CollapsiblePermissionMatrix
          type="roles"
          permissions={permissions}
          roles={roles}
          permissionMatrix={permissionMatrix}
          loading={loading}
          hasUnsavedChanges={hasUnsavedPermissions}
          onPermissionChange={updatePermissionMatrix}
          onSave={handlePermissionMatrixSave}
          systemFeatures={systemFeatures}
        />
      );
    };

    const renderPositionsMatrix = () => {
      if (positions.length === 0) {
        return (
          <div className="permissions-empty">
            <div className="empty-text">Chưa có dữ liệu vị trí. Vui lòng thử lại sau.</div>
          </div>
        );
      }

      return (
        <CollapsiblePermissionMatrix
          type="positions"
          permissions={permissions}
          positions={positions}
          permissionMatrix={positionPermissionMatrix}
          loading={loading}
          hasUnsavedChanges={hasUnsavedPermissions}
          onPermissionChange={updatePositionPermissionMatrix}
          onSave={handlePositionPermissionMatrixSave}
          systemFeatures={systemFeatures}
        />
      );
    };

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4}>Ma Trận Phân Quyền</Title>
            <Text type="secondary">Quản lý quyền hạn theo chức năng hệ thống</Text>
            {hasUnsavedPermissions && (
              <div style={{ marginTop: 8 }}>
                <Text type="warning">
                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                  Có thay đổi chưa lưu
                </Text>
              </div>
            )}
          </div>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handlePermissionMatrixSave} 
            loading={loading}
            disabled={!hasUnsavedPermissions}
          >
            {hasUnsavedPermissions ? 'Lưu Thay Đổi' : 'Đã Lưu'}
          </Button>
        </div>

        <Tabs 
          activeKey={activePermissionTab} 
          onChange={setActivePermissionTab}
          items={[
            {
              key: 'roles',
              label: (
                <span>
                  <TeamOutlined />
                  Theo Vai Trò
                </span>
              ),
              children: renderRolesMatrix()
            },
            {
              key: 'positions',
              label: (
                <span>
                  <CrownOutlined />
                  Theo Vị Trí
                </span>
              ),
              children: renderPositionsMatrix()
            }
          ]}
        />
      </div>
    );
  };



  // Mobile view
  if (isMobile) {
    return (
      <MobileSettingsView
        // Profile props
        form={form}
        pwdForm={pwdForm}
        loading={loading}
        user={user}
        handleProfile={handleProfile}
        handlePassword={handlePassword}
        
        // ISO props
        projects={projects}
        selectedProjectId={selectedProjectId}
        handleProjectChange={handleProjectChange}
        documentStatuses={documentStatuses}
        metadataFields={metadataFields}
        approvalSteps={approvalSteps}
        fileNamingRule={fileNamingRule}
        updateDocumentStatus={updateDocumentStatus}
        updateMetadataField={updateMetadataField}
        updateApprovalStep={updateApprovalStep}
        setFileNamingRule={setFileNamingRule}
        addMetadataField={addMetadataField}
        removeMetadataField={removeMetadataField}
        handleISOSave={handleISOSave}
        
        // Permission props
        permissions={permissions}
        roles={roles}
        positions={positions}
        permissionMatrix={permissionMatrix}
        positionPermissionMatrix={positionPermissionMatrix}
        updatePermissionMatrix={updatePermissionMatrix}
        updatePositionPermissionMatrix={updatePositionPermissionMatrix}
        handlePermissionMatrixSave={handlePermissionMatrixSave}
        loadingPermissions={loadingPermissions}
        fetchPermissionMatrix={fetchPermissionMatrix}
        
        // Tab control
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  // Desktop view
  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <SettingOutlined style={{ fontSize: 24, marginRight: 12, color: '#1890ff' }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Cài Đặt</Title>
            <Text type="secondary">Quản lý thông tin cá nhân và cấu hình hệ thống</Text>
          </div>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'profile',
              label: (
                <span>
                  <FileTextOutlined />
                  Hồ sơ cá nhân
                </span>
              ),
              children: renderProfileTab()
            },
            {
              key: 'iso',
              label: (
                <span>
                  <ForkOutlined />
                  Quy trình ISO
                </span>
              ),
              children: renderISOTab()
            },
            {
              key: 'permissions',
              label: (
                <span>
                  <TeamOutlined />
                  Quản lý phân quyền
                </span>
              ),
              children: renderPermissionMatrixTab()
            },
            {
              key: 'sessions',
              label: (
                <span>
                  <SecurityScanOutlined />
                  Quản lý phiên đăng nhập
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  <SessionInfo showDetails={true} />
                  <div style={{ marginTop: 16 }}>
                    <SessionManager />
                  </div>
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default Settings; 