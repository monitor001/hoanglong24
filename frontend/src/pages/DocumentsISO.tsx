import React, { useEffect, useState, useRef } from 'react';
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
  Upload, 
  message,
  Tooltip,
  Badge,
  Divider,
  Typography,
  Drawer,
  List,
  Avatar,
  Steps,
  Alert,
  Image,
  Descriptions,
  Popconfirm,
  Spin,
  Popover,
  Switch,
  Checkbox,
  ColorPicker,
  InputNumber,
  Collapse
} from 'antd';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import { 
  UploadOutlined, 
  SettingOutlined, 
  RobotOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  FileTextOutlined,
  FolderOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  PauseCircleOutlined,
  UndoOutlined,
  UserSwitchOutlined,
  EyeOutlined,
  CommentOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  MinusOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  PlayCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  RightOutlined,
  LeftOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  FileOutlined,
  SaveOutlined,
  PlusOutlined,
  UpOutlined,
  DownOutlined,
  ProjectOutlined,
  HistoryOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import ISOMetadataForm from '../components/ISOMetadataForm';
import ISOStatusBadge from '../components/ISOStatusBadge';
import DocumentMetadata from '../components/DocumentMetadata';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import html2canvas from 'html2canvas';
import ZoomablePreview from '../components/ZoomablePreview';
import { useResponsive } from '../hooks/useResponsive';
import MobileFilters from '../components/MobileFilters';
import CommentDrawer from '../components/CommentDrawer';
// Removed permission system
import FloatingActionButton from '../components/FloatingActionButton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import { useComments } from '../hooks/useComments';
import '../styles/documents-responsive.css';


import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/tablet-landscape-statistics-colors.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import '../styles/tablet-icon-standardization.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/modal-button-fix.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { Panel } = Collapse;

interface Document {
  id: string;
  name: string;
  originalName: string;
  description: string;
  status: string;
  version: string;
  revision?: string;
  code?: string;
  discipline?: string;
  type?: string;
  filePath: string;
  fileUrl: string;
  shareUrl?: string;
  downloadUrl?: string;
  cloudinaryId?: string;
  uploader: string;
  uploadDate: string;
  createdAt?: string;
  updatedAt?: string;
  fileSize: string;
  size?: number;
  metadata: any;
  projectId: string;
  projectName: string;
  cloudinaryUrl?: string;
  fileType?: string;
  mimeType?: string;
}

interface Project {
  id: string;
  name: string;
  status?: string;
  priority?: string;
  documents: Document[];
}

// Component để load text file
const TextFileViewer: React.FC<{ url: string }> = ({ url }) => {
  const [content, setContent] = useState('Đang tải...');
  
  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(() => setContent('Không thể tải nội dung file'));
  }, [url]);
  
  return <>{content}</>;
};


const DocumentsISO: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [commentDocument, setCommentDocument] = useState<Document | null>(null);
  
  // Use comment hook
  const {
    comments,
    loading: commentLoading,
    fetchComments,
    addComment
  } = useComments({ entityType: 'documents' });
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [automationDrawerOpen, setAutomationDrawerOpen] = useState(false);
  
  // Cloudinary và Preview states
  const [isCloudinaryReady, setIsCloudinaryReady] = useState(true);
  const [uploadingToCloudinary, setUploadingToCloudinary] = useState(false);
  const [cloudinaryInfoVisible, setCloudinaryInfoVisible] = useState(false);
  const [selectedCloudinaryFile, setSelectedCloudinaryFile] = useState<any>(null);
  const [issueForm] = Form.useForm();
  const [createIssueModalVisible, setCreateIssueModalVisible] = useState(false);
  const [creatingIssue, setCreatingIssue] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [issueAttachments, setIssueAttachments] = useState<any[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  // New state variables for enhanced features
  const [fileInfoModalVisible, setFileInfoModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [enhancedPreviewModalVisible, setEnhancedPreviewModalVisible] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // ISO Settings Modal states
  const [isISOSettingsModalVisible, setIsISOSettingsModalVisible] = useState<boolean>(false);
  const [selectedProjectForISO, setSelectedProjectForISO] = useState<string | null>(null);
  const [documentStatuses, setDocumentStatuses] = useState<any[]>([]);
  const [metadataFields, setMetadataFields] = useState<any[]>([]);
  const [approvalSteps, setApprovalSteps] = useState<any[]>([]);
  const [fileNamingRule, setFileNamingRule] = useState<any>({});
  const [isLoadingISO, setIsLoadingISO] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);
  const isDarkMode = theme === 'dark';
  // Removed permission system - always allow all actions
  const canViewDocuments = true;
  const canEditDocuments = true;
  const canDeleteDocuments = true;
  const canManageDocumentTemplates = true;
  const { isMobile } = useResponsive();

  // Tablet landscape detection
  const [isTabletLandscape, setIsTabletLandscape] = useState(
    window.innerWidth >= 769 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth
  );

  // Mock data for demonstration
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'BaoCaoKhaoSat_v1_50.pdf',
      originalName: 'Báo cáo khảo sát địa chất.pdf',
      description: 'Báo cáo khảo sát địa chất công trình',
      status: 'wip',
      version: 'v1',
      filePath: '/Du_An_X/WIP/ST/2024-06-15/BaoCaoKhaoSat_v1_50.pdf',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      shareUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      downloadUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      cloudinaryId: 'demo_architecture_signs',
      uploader: 'Nguyễn Văn A',
      uploadDate: '15:30 15/06/2024',
      fileSize: '2.5 MB',
      metadata: {
        discipline: 'ST',
        originator: 'Công ty TNHH ABC',
        zone: 'Khu A',
        level: '50',
        type: 'SK',
        role: 'A',
        number: '001'
      },
      projectId: '1',
      projectName: 'Dự án X',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      fileType: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: '2',
      name: 'BanVeKienTruc_v2_30.dwg',
      originalName: 'Bản vẽ kiến trúc mặt bằng.dwg',
      description: 'Bản vẽ kiến trúc mặt bằng tầng 1',
      status: 'shared',
      version: 'v2',
      filePath: '/Du_An_X/Shared/AR/2024-06-15/BanVeKienTruc_v2_30.dwg',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      shareUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      downloadUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      cloudinaryId: 'demo_architecture_signs_2',
      uploader: 'Trần Thị B',
      uploadDate: '14:20 15/06/2024',
      fileSize: '5.2 MB',
      metadata: {
        discipline: 'AR',
        originator: 'Công ty TNHH XYZ',
        zone: 'Khu B',
        level: '30',
        type: 'DR',
        role: 'A',
        number: '002'
      },
      projectId: '1',
      projectName: 'Dự án X',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      fileType: 'dwg',
      mimeType: 'application/acad'
    },
    {
      id: '3',
      name: 'TinhToanKetCau_v1_40.pdf',
      originalName: 'Tính toán kết cấu.pdf',
      description: 'Tính toán kết cấu móng cọc',
      status: 'published',
      version: 'v1',
      filePath: '/Du_An_X/Published/ST/2024-06-15/TinhToanKetCau_v1_40.pdf',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      shareUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      downloadUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      cloudinaryId: 'demo_architecture_signs_3',
      uploader: 'Nguyễn Văn C',
      uploadDate: '13:15 15/06/2024',
      fileSize: '3.8 MB',
      metadata: {
        discipline: 'ST',
        originator: 'Công ty TNHH ABC',
        zone: 'Khu A',
        level: '40',
        type: 'CA',
        role: 'A',
        number: '003'
      },
      projectId: '1',
      projectName: 'Dự án X',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      fileType: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: '4',
      name: 'HopDongThiCong_v1_00.pdf',
      originalName: 'Hợp đồng thi công.pdf',
      description: 'Hợp đồng thi công phần móng',
      status: 'archived',
      version: 'v1',
      filePath: '/Du_An_X/Archived/PM/2024-06-15/HopDongThiCong_v1_00.pdf',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      shareUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      downloadUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      cloudinaryId: 'demo_architecture_signs_4',
      uploader: 'Nguyễn Văn D',
      uploadDate: '12:00 15/06/2024',
      fileSize: '1.2 MB',
      metadata: {
        discipline: 'PM',
        originator: 'Công ty TNHH ABC',
        zone: 'Toàn bộ',
        level: '00',
        type: 'CO',
        role: 'A',
        number: '004'
      },
      projectId: '1',
      projectName: 'Dự án X',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      fileType: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: '5',
      name: 'BaoCaoNghiemThu_v1_50.pdf',
      originalName: 'Báo cáo nghiệm thu.pdf',
      description: 'Báo cáo nghiệm thu phần móng',
      status: 'wip',
      version: 'v1',
      filePath: '/Du_An_X/WIP/QS/2024-06-15/BaoCaoNghiemThu_v1_50.pdf',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      shareUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      downloadUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      cloudinaryId: 'demo_architecture_signs_5',
      uploader: 'Nguyễn Văn E',
      uploadDate: '11:45 15/06/2024',
      fileSize: '4.1 MB',
      metadata: {
        discipline: 'QS',
        originator: 'Công ty TNHH ABC',
        zone: 'Khu A',
        level: '50',
        type: 'RP',
        role: 'A',
        number: '005'
      },
      projectId: '1',
      projectName: 'Dự án X',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg',
      fileType: 'pdf',
      mimeType: 'application/pdf'
    }
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/documents/iso', {
        params: {
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          discipline: selectedDiscipline === 'all' ? undefined : selectedDiscipline,
          projectId: selectedProject === 'all' ? undefined : selectedProject,
          search: searchText || undefined
        }
      });
      setDocuments(response.data.documents || mockDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Fallback to mock data
      setDocuments(mockDocuments);
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/projects');
      const projectsData = response.data.projects || response.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Mock projects data
      setProjects([
        {
          id: '1',
          name: 'Dự án X',
          documents: mockDocuments.filter(doc => doc.projectId === '1')
        }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/all');
      const usersData = response.data.users || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock users data
      setUsers([
        { id: '1', name: 'Nguyễn Văn A' },
        { id: '2', name: 'Trần Thị B' },
        { id: '3', name: 'Lê Văn C' }
      ]);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
    fetchUsers();
  }, [selectedStatus, selectedDiscipline, selectedProject, searchText]);

  // Tablet landscape effect handler
  useEffect(() => {
    const handleResize = () => {
      const nowTabletLandscape = window.innerWidth >= 769 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth;
      setIsTabletLandscape(nowTabletLandscape);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Nhóm documents theo project
  const groupedDocuments = projects.map(project => ({
    key: project.id,
    project,
    documents: documents.filter(doc => doc.projectId === project.id),
  })).filter(g => g.documents.length > 0);

  const getStatusCount = (status: string) => {
    if (status === 'all') return documents.length;
    return documents.filter(doc => doc.status === status).length;
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      const matchesDiscipline = selectedDiscipline === 'all' || doc.metadata?.discipline === selectedDiscipline;
      const matchesProject = selectedProject === 'all' || doc.projectId === selectedProject;
      
      return matchesSearch && matchesStatus && matchesDiscipline && matchesProject;
    });
  };

  // Sắp xếp dự án theo trạng thái và mức độ ưu tiên (như bên thẻ dự án)
  const getSortedProjects = () => {
    const statusOrder = {
      'ACTIVE': 1,      // Đang thực hiện
      'PLANNING': 2,    // Đang lên kế hoạch
      'ON_HOLD': 3,     // Đang tạm dừng
      'COMPLETED': 4,   // Hoàn thành
      'ARCHIVED': 5     // Lưu trữ
    };

    return projects.sort((a, b) => {
      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 999;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 999;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // Nếu cùng trạng thái, sắp xếp theo mức độ ưu tiên (chỉ áp dụng cho ACTIVE)
      if (a.status === 'ACTIVE' && b.status === 'ACTIVE') {
        const priorityOrder = {
          'HIGH': 1,        // Cao
          'MEDIUM': 2,      // Trung bình
          'LOW': 3          // Thấp
        };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 999;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 999;
        return priorityA - priorityB;
      }
      
      // Các trạng thái khác sắp xếp theo tên dự án
      return a.name.localeCompare(b.name);
    });
  };

  // Sắp xếp documents trong 1 dự án theo ưu tiên từ cao tới thấp
  const getSortedDocumentsForProject = (projectId: string) => {
    const projectDocuments = documents.filter(d => d.projectId === projectId);
    const priorityOrder = {
      'published': 1,
      'shared': 2,
      'wip': 3,
      'archived': 4
    };

    return projectDocuments.sort((a, b) => {
      const priorityA = priorityOrder[a.status as keyof typeof priorityOrder] || 999;
      const priorityB = priorityOrder[b.status as keyof typeof priorityOrder] || 999;
      return priorityA - priorityB;
    });
  };

  // Thao tác cho từng file
  const getDocumentActions = (document: Document) => {
    const actions = [
      {
        icon: <ZoomInOutlined />,
        tooltip: 'Xem trước',
        key: 'preview',
        onClick: () => handleEnhancedPreview(document)
      },
      {
        icon: <SendOutlined />,
        tooltip: 'Chuyển tiếp giai đoạn',
        key: 'nextStage',
        onClick: () => handleNextStage(document)
      },
      {
        icon: <CommentOutlined />,
        tooltip: 'Bình luận',
        key: 'comment',
        onClick: () => handleComment(document)
      },
      {
        icon: <DownloadOutlined />,
        tooltip: 'Tải về',
        key: 'download',
        onClick: () => handleDownload(document)
      }
    ];

    // Add share URL button if Cloudinary URL is available
    if (document.shareUrl) {
      actions.push({
        icon: <LinkOutlined />,
        tooltip: 'Sao chép link chia sẻ',
        key: 'share',
        onClick: () => handleCopyShareUrl(document)
      });
    }

    // Add delete action for users with delete permission
    if (canDeleteDocuments) {
      actions.push({
        icon: <DeleteOutlined />,
        tooltip: 'Xóa tài liệu',
        key: 'delete',
        onClick: () => handleDeleteDocument(document)
      });
    }

    return actions;
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
    setPreviewModalVisible(true);
  };

  const handleNextStage = (document: Document) => {
    const stages = ['wip', 'shared', 'published', 'archived'];
    const currentIndex = stages.indexOf(document.status);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      message.success(`Đã chuyển ${document.name} sang giai đoạn ${nextStage}`);
      // TODO: Call API to update document status
    } else {
      message.info('Tài liệu đã ở giai đoạn cuối cùng');
    }
  };

  const handleComment = (document: Document) => {
    setCommentDocument(document);
    setCommentDrawerOpen(true);
    // TODO: Fetch comments for this document
  };

  const handleDownload = (document: Document) => {
    message.success(`Đang tải về ${document.name}`);
    // TODO: Implement download functionality
  };

  const handleCopyShareUrl = (document: Document) => {
    const shareUrl = document.shareUrl || document.cloudinaryUrl || document.fileUrl;
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        message.success('Đã sao chép link chia sẻ vào clipboard!');
      }).catch(() => {
        message.error('Không thể sao chép link chia sẻ!');
      });
    } else {
      message.warning('Không có link chia sẻ cho tài liệu này!');
    }
  };

  // New functions for enhanced features
  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDocumentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/documents/${documentToDelete.id}`);
      message.success('Đã xóa tài liệu thành công!');
      fetchDocuments(); // Refresh the document list
    } catch (error: any) {
      console.error('Delete document error:', error);
      message.error(error.response?.data?.error || 'Không thể xóa tài liệu!');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setDocumentToDelete(null);
    }
  };

  const handleRowClick = (record: Document) => {
    setSelectedDocument(record);
    setFileInfoModalVisible(true);
  };

  const handleEnhancedPreview = async (document: Document) => {
    try {
      console.log('Preview document data:', document);
      
      let fileUrl = '';
      
      // Ưu tiên Cloudinary URLs trước
      if (document.fileUrl && document.fileUrl.includes('cloudinary.com')) {
        console.log('Using Cloudinary URL:', document.fileUrl);
        fileUrl = document.fileUrl;
      } else if (document.downloadUrl && document.downloadUrl.includes('cloudinary.com')) {
        console.log('Using Cloudinary download URL:', document.downloadUrl);
        fileUrl = document.downloadUrl;
      } else if (document.shareUrl && document.shareUrl.includes('cloudinary.com')) {
        console.log('Using Cloudinary share URL:', document.shareUrl);
        fileUrl = document.shareUrl;
      } else if (document.fileUrl && document.fileUrl.startsWith('http') && !document.fileUrl.includes('herokuapp.com')) {
        console.log('Using other cloud storage URL:', document.fileUrl);
        fileUrl = document.fileUrl;
      } else if (document.downloadUrl && document.downloadUrl.startsWith('http')) {
        console.log('Using other cloud storage download URL:', document.downloadUrl);
        fileUrl = document.downloadUrl;
      } else if (document.shareUrl && document.shareUrl.startsWith('http')) {
        console.log('Using other cloud storage share URL:', document.shareUrl);
        fileUrl = document.shareUrl;
      } else if (document.cloudinaryId) {
        // Nếu có cloud storage ID nhưng không có URL, thông báo lỗi
        console.error('Document has cloud storage ID but no URL available');
        message.error('Tài liệu đã được lưu trên cloud storage nhưng không thể truy cập. Vui lòng thử lại sau.');
        return;
      } else if (document.fileUrl && document.fileUrl.startsWith('/uploads/')) {
        // File được lưu local, thử tải từ server
        console.log('Trying to load from server:', document.fileUrl);
        try {
          const response = await axiosInstance.get(document.fileUrl, {
            responseType: 'blob'
          });
          const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
          fileUrl = URL.createObjectURL(blob);
        } catch (serverError) {
          console.error('Server file not found:', serverError);
          throw new Error('File not found on server');
        }
      } else {
        // Fallback: tải file từ server với filename
        console.log('Trying to load from server with filename:', `/uploads/${document.name}`);
        try {
          const response = await axiosInstance.get(`/uploads/${document.name}`, {
            responseType: 'blob'
          });
          const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
          fileUrl = URL.createObjectURL(blob);
        } catch (serverError) {
          console.error('Server file not found with filename:', serverError);
          throw new Error('File not found on server');
        }
      }
      
      console.log('Final file URL:', fileUrl);
      console.log('Document mimetype:', document.mimeType);
      
      // Cập nhật document với URL đã xử lý
      const enhancedDocument = {
        ...document,
        fileUrl: fileUrl
      };
      
      setPreviewDocument(enhancedDocument);
      setEnhancedPreviewModalVisible(true);
      setPreviewLoading(true);
    } catch (error) {
      console.error('Error previewing document:', error);
      console.error('Document details:', document);
      message.error('Không thể xem trước tài liệu này');
    }
  };

  const getFileIcon = (fileType: string, mimeType: string) => {
    const type = fileType?.toLowerCase() || mimeType?.toLowerCase() || '';
    
    if (type.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (type.includes('image')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
    if (type.includes('word') || type.includes('doc')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
    if (type.includes('excel') || type.includes('xls')) return <FileExcelOutlined style={{ color: '#52c41a' }} />;
    if (type.includes('zip') || type.includes('rar')) return <FileZipOutlined style={{ color: '#faad14' }} />;
    
    return <FileUnknownOutlined style={{ color: '#8c8c8c' }} />;
  };

  const renderEnhancedPreview = (document: Document) => {
    if (!document) return null;
    
    const fileType = document.mimeType || document.fileType || '';
    const fileUrl = document.fileUrl || document.shareUrl || document.downloadUrl || '';
    
    // Preview ảnh
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType.toLowerCase())) {
      return (
        <ZoomablePreview
          width="100%"
          height={fullscreen ? '100vh' : 'calc(100vh - 200px)'}
        >
          <img
            src={fileUrl}
            alt={document.originalName}
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onLoad={() => setPreviewLoading(false)}
            onError={() => setPreviewLoading(false)}
          />
          {previewLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001
            }}>
              <Spin size="large" />
            </div>
          )}
        </ZoomablePreview>
      );
    }
    
    // Preview PDF
    if (fileType === 'application/pdf' || fileType.includes('pdf')) {
      return (
        <ZoomablePreview
          width="100%"
          height={fullscreen ? '100vh' : 'calc(100vh - 200px)'}
        >
          <iframe
            src={fileUrl}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              background: '#fff'
            }}
            title={document.originalName}
            onLoad={() => setPreviewLoading(false)}
          />
          {previewLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              padding: 20,
              borderRadius: 8,
              zIndex: 1001
            }}>
              <Spin size="large" tip="Đang tải PDF..." />
            </div>
          )}
        </ZoomablePreview>
      );
    }
    
    // Preview Word/Excel/PowerPoint - Sử dụng Google Docs Viewer
    if (fileType.includes('word') || fileType.includes('excel') || fileType.includes('powerpoint') || 
        fileType.includes('document') || fileType.includes('spreadsheet') || fileType.includes('presentation') ||
        document.originalName?.match(/\.(xlsx?|docx?|pptx?|pdf)$/i)) {
      
      return (
        <div style={{ 
          width: '100%',
          height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
          position: 'relative',
          background: '#f5f5f5'
        }}>
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              background: '#fff'
            }}
            title={document.originalName}
            onLoad={() => setPreviewLoading(false)}
            onError={() => setPreviewLoading(false)}
          />
          {previewLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              padding: 20,
              borderRadius: 8
            }}>
              <Spin size="large" tip="Đang tải file Office..." />
            </div>
          )}
        </div>
      );
    }
    
    // Preview text files
    if (fileType.includes('text') || fileType === 'application/json' || 
        document.originalName?.endsWith('.txt') || document.originalName?.endsWith('.json') ||
        document.originalName?.endsWith('.xml') || document.originalName?.endsWith('.csv')) {
      return (
        <div style={{ 
          width: '100%',
          height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
          overflow: 'auto',
          background: '#f5f5f5',
          padding: 24
        }}>
          <pre style={{ 
            margin: 0,
            padding: 24,
            background: '#ffffff',
            border: '1px solid #d0d7de',
            borderRadius: 8,
            color: '#24292f',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            <TextFileViewer url={fileUrl} />
          </pre>
        </div>
      );
    }
    
    // Preview video
    if (fileType.startsWith('video/')) {
      return (
        <div style={{ 
          width: '100%',
          height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000'
        }}>
          <video
            src={fileUrl}
            controls
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            onLoadedMetadata={() => setPreviewLoading(false)}
          >
            Trình duyệt không hỗ trợ video này
          </video>
        </div>
      );
    }
    
    // Không hỗ trợ preview
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 80,
        color: '#666',
        background: '#f5f5f5',
        height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FileUnknownOutlined style={{ fontSize: 80, marginBottom: 24, color: '#9ca3af' }} />
        <Title level={4} style={{ color: '#666', marginBottom: 16 }}>
          Không thể xem trước file này
        </Title>
        <Text style={{ color: '#6b7280', marginBottom: 24 }}>
          File loại {fileType || 'không xác định'} không được hỗ trợ xem trước
        </Text>
        <Button 
          type="primary" 
          size="large"
          icon={<DownloadOutlined />}
          onClick={() => {
            const link = window.document.createElement('a');
            link.href = fileUrl;
            link.download = document.originalName;
            link.target = '_blank';
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
          }}
        >
          Tải về để xem
        </Button>
      </div>
    );
  };



  const handleISOSettings = () => {
    setIsISOSettingsModalVisible(true);
    loadISOConfigForProject(null); // Load global config first
  };

  const loadISOConfigForProject = async (projectId: string | null) => {
    setIsLoadingISO(true);
    try {
      const url = projectId
        ? `/settings/iso/config?projectId=${projectId}`
        : '/settings/iso/config';

      const response = await axiosInstance.get(url);
      const config = response.data;

      if (config.documentStatuses) {
        setDocumentStatuses(config.documentStatuses);
      }
      if (config.metadataFields) {
        setMetadataFields(config.metadataFields);
      }
      if (config.approvalSteps) {
        setApprovalSteps(config.approvalSteps);
      }
      if (config.fileNamingRule) {
        setFileNamingRule(config.fileNamingRule);
      }
    } catch (error) {
      console.error('Error loading ISO config:', error);
      message.error('Không thể tải cấu hình ISO');
    } finally {
      setIsLoadingISO(false);
    }
  };

  const handleProjectChangeForISO = (projectId: string | null) => {
    setSelectedProjectForISO(projectId);
    loadISOConfigForProject(projectId);
  };

  const handleISOSave = async () => {
    setIsLoadingISO(true);
    try {
      const isoConfig = {
        documentStatuses,
        metadataFields,
        approvalSteps,
        fileNamingRule,
        projectId: selectedProjectForISO
      };

      await axiosInstance.put('/settings/iso/config', isoConfig);

      const projectName = selectedProjectForISO
        ? projects.find(p => p.id === selectedProjectForISO)?.name || 'Dự án'
        : 'Toàn hệ thống';

      message.success(`Đã lưu cấu hình ISO 19650 cho ${projectName}!`);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Lỗi lưu cấu hình!');
    } finally {
      setIsLoadingISO(false);
    }
  };

  const updateDocumentStatus = (id: string, field: string, value: any) => {
    setDocumentStatuses(prev => 
      prev.map(status => 
        status.id === id ? { ...status, [field]: value } : status
      )
    );
  };

  const updateMetadataField = (id: string, field: string, value: any) => {
    setMetadataFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, [field]: value } : field
      )
    );
  };

  const updateApprovalStep = (id: string, field: string, value: any) => {
    setApprovalSteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  const addMetadataField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: '',
      nameVi: '',
      isRequired: false,
      isActive: true
    };
    setMetadataFields(prev => [...prev, newField]);
  };

  const removeMetadataField = (id: string) => {
    setMetadataFields(prev => prev.filter(field => field.id !== id));
  };

  const handleAutomation = () => {
    setAutomationDrawerOpen(true);
  };

  const handleUpload = async (values: any) => {
    setUploading(true);
    try {
      console.log('🔍 DEBUG: Starting upload process...');
      console.log('📋 Form values:', values);
      console.log('📁 File list:', fileList);
      
      if (fileList.length === 0) {
        console.log('❌ No file selected');
        message.error('Vui lòng chọn tài liệu!');
        return;
      }

      // Validate required metadata fields
      // Extract metadata from flattened form values
      const metadata: { [key: string]: any } = {
        discipline: values['metadata.discipline'] || values.metadata?.discipline,
        originator: values['metadata.originator'] || values.metadata?.originator,
        zone: values['metadata.zone'] || values.metadata?.zone,
        level: values['metadata.level'] || values.metadata?.level,
        type: values['metadata.type'] || values.metadata?.type,
        role: values['metadata.role'] || values.metadata?.role,
        number: values['metadata.number'] || values.metadata?.number
      };
      
      console.log('📊 Metadata from form:', metadata);
      console.log('📊 All form values:', values);
      console.log('📊 Metadata keys:', Object.keys(metadata));
      
      const requiredFields = ['discipline', 'originator'];
      const missingFields = requiredFields.filter(field => !metadata[field] || metadata[field].trim() === '');
      
      console.log('🔍 Required fields check:', {
        requiredFields,
        missingFields,
        discipline: metadata.discipline,
        originator: metadata.originator,
        disciplineType: typeof metadata.discipline,
        originatorType: typeof metadata.originator,
        disciplineLength: metadata.discipline ? metadata.discipline.length : 0,
        originatorLength: metadata.originator ? metadata.originator.length : 0
      });
      
      if (missingFields.length > 0) {
        const fieldNames = {
          discipline: 'Chuyên ngành kỹ thuật',
          originator: 'Tổ chức tạo tài liệu'
        };
        const missingFieldNames = missingFields.map(field => fieldNames[field as keyof typeof fieldNames]).join(', ');
        console.log('❌ Missing required fields:', missingFieldNames);
        message.error(`Vui lòng điền đầy đủ các trường bắt buộc: ${missingFieldNames}`);
        return;
      }

      console.log('✅ Validation passed, preparing form data...');
      
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('name', fileList[0].name);
      formData.append('description', values.description || fileList[0].name);
      formData.append('projectId', values.projectId || '1');
      formData.append('status', values.status || 'WORK_IN_PROGRESS');
      formData.append('metadata', JSON.stringify(metadata));

      console.log('📤 FormData prepared:', {
        fileName: fileList[0].name,
        description: values.description || fileList[0].name,
        projectId: values.projectId || '1',
        metadata: JSON.stringify(metadata)
      });

      console.log('🚀 Sending request to server...');
      const response = await axiosInstance.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload successful:', response.data);
      console.log('📄 Uploaded document details:', response.data.document);
      console.log('🔗 Share URL:', response.data.document.shareUrl);
      console.log('⬇️ Download URL:', response.data.document.downloadUrl);
      console.log('📁 File URL:', response.data.document.fileUrl);
      
      // Show success message with file details
      const uploadedDocument = response.data.document;
      message.success(
        <div>
          <div>Tài liệu đã được tải lên thành công!</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            <div><strong>Tên file:</strong> {uploadedDocument.name}</div>
            {uploadedDocument.shareUrl && (
              <div><strong>Link chia sẻ:</strong> <a href={uploadedDocument.shareUrl} target="_blank" rel="noopener noreferrer">{uploadedDocument.shareUrl}</a></div>
            )}
            {uploadedDocument.downloadUrl && (
              <div><strong>Link tải xuống:</strong> <a href={uploadedDocument.downloadUrl} target="_blank" rel="noopener noreferrer">{uploadedDocument.downloadUrl}</a></div>
            )}
            {uploadedDocument.fileUrl && !uploadedDocument.shareUrl && (
              <div><strong>Link file:</strong> <a href={uploadedDocument.fileUrl} target="_blank" rel="noopener noreferrer">{uploadedDocument.fileUrl}</a></div>
            )}
          </div>
        </div>,
        10 // Show for 10 seconds
      );
      
      setUploadModalVisible(false);
      uploadForm.resetFields();
      setFileList([]);
      
      // Refresh documents list
      fetchDocuments();
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.response?.data?.error || 'Lỗi khi tải lên tài liệu!';
      message.error(errorMessage);
      
      // Show specific validation errors if available
      if (error.response?.status === 400 && errorMessage.includes('Metadata validation failed')) {
        message.error('Vui lòng kiểm tra lại thông tin metadata theo chuẩn ISO 19650');
      }
    }
    setUploading(false);
  };

  // Cloudinary và Preview functions
  const checkCloudinaryAuth = async () => {
    setIsCloudinaryReady(true); // Backend handles authentication
  };

  const handleCloudinarySetup = async () => {
    setIsCloudinaryReady(true);
    message.success('Cloudinary đã sẵn sàng!');
  };

  const showCloudinaryInfo = (file: any, cloudinaryPath: string) => {
    setSelectedCloudinaryFile({
      ...file,
      cloudinaryPath
    });
    setCloudinaryInfoVisible(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreviewFile = (fileType: string, mimeType: string): boolean => {
    const previewableTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/html',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    return previewableTypes.includes(mimeType) || 
           !!(fileType?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|pdf|txt|html|docx|xlsx|pptx)$/));
  };

  const getPreviewComponent = (document: Document) => {
    if (!document.cloudinaryUrl) {
      return <div>Không có URL preview</div>;
    }

    const fileType = document.mimeType || document.fileType;
    
    if (fileType?.includes('image/') || document.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return (
        <Image
          src={document.cloudinaryUrl}
          alt={document.originalName}
          style={{ maxWidth: '100%', maxHeight: '70vh' }}
          preview={false}
        />
      );
    } else if (fileType?.includes('pdf') || document.name?.match(/\.pdf$/i)) {
      return (
        <iframe
          src={`${document.cloudinaryUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          style={{ width: '100%', height: '70vh', border: 'none' }}
          title={document.originalName}
        />
      );
    } else {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <p>File không hỗ trợ preview trực tiếp</p>
          <Button type="primary" onClick={() => window.open(document.cloudinaryUrl, '_blank')}>
            Mở trong tab mới
          </Button>
        </div>
      );
    }
  };

  const handleCreateIssueFromPreview = async (values: any) => {
    try {
      setCreatingIssue(true);
      
      // Prepare attachments array
      const attachments = [];
      
      // Add screenshot if exists
      if (screenshotData) {
        attachments.push({
          name: 'screenshot.png',
          url: screenshotData,
          type: 'image/png',
          size: screenshotData.length
        });
      }
      
      // Add uploaded files
      if (issueAttachments.length > 0) {
        attachments.push(...issueAttachments);
      }
      
      // Tạo description với thông tin tài liệu liên quan (không nhúng ảnh)
      let description = values.description || '';
      if (previewDocument) {
        description = `**Tài liệu liên quan:** ${previewDocument.originalName}\n\n${description}`;
      }
      
      const issueData = {
        ...values,
        description: description, // Không nhúng ảnh vào description
        type: 'ISSUE',
        priority: values.priority || 'MEDIUM',
        status: 'NEW',
        attachments: attachments, // Gửi attachments riêng biệt
        relatedDocumentId: previewDocument?.id,
        relatedDocumentName: previewDocument?.originalName
      };

      const response = await axiosInstance.post('/issues', issueData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 201) {
        message.success('Vấn đề đã được tạo thành công!');
        setCreateIssueModalVisible(false);
        setScreenshotData('');
        setIssueAttachments([]);
        issueForm.resetFields();
        navigate(`/issues/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      message.error('Không thể tạo vấn đề. Vui lòng thử lại.');
    } finally {
      setCreatingIssue(false);
    }
  };

  const captureScreenshot = async () => {
    try {
      if (!previewRef.current) {
        message.error('Không thể tìm thấy vùng cần chụp ảnh');
        return;
      }

      message.loading('Đang chụp ảnh màn hình...', 0);
      
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false
      });

      const screenshotUrl = canvas.toDataURL('image/png');
      setScreenshotData(screenshotUrl);
      
      message.destroy();
      message.success('Đã chụp ảnh màn hình thành công!');
    } catch (error) {
      message.destroy();
      console.error('Error capturing screenshot:', error);
      message.error('Không thể chụp ảnh màn hình. Vui lòng thử lại.');
    }
  };

  // Component FileCard đơn giản (không có hover)
  const FileCard: React.FC<{
    document: Document;
    onClick: () => void;
    getFileIcon: (fileType: string, mimeType: string) => React.ReactNode;
    formatFileSize: (bytes: number) => string;
  }> = ({ document, onClick, getFileIcon, formatFileSize }) => {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 8, 
          cursor: 'pointer',
          width: '100%'
        }}
        onClick={onClick}
      >
        {getFileIcon(document.fileType || '', document.mimeType || '')}
        <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
          <div style={{ fontWeight: 'bold', fontSize: 14, color: '#1890ff', wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {document.name}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            <ISOStatusBadge status={document.status} />
            <span style={{ marginLeft: 8 }}>v{document.version}</span>
          </div>
        </div>
      </div>
    );
  };

  // Component để tạo hover content
  const createHoverContent = (document: Document) => {
    const getFileType = () => {
      if (document.fileType) return document.fileType.toUpperCase();
      if (document.mimeType) {
        const type = document.mimeType.split('/')[0];
        return type.toUpperCase();
      }
      return 'FILE';
    };

    const getFileSize = () => {
      if (document.fileSize) return document.fileSize;
      return 'N/A';
    };

    const getUploadDate = () => {
      if (document.uploadDate) {
        return new Date(document.uploadDate).toLocaleString('vi-VN');
      }
      return 'N/A';
    };

    const getSource = () => {
      if (document.cloudinaryUrl) return 'Cloudinary';
      if (document.fileUrl) return 'Local Storage';
      return 'Unknown';
    };

    return (
      <div style={{ width: 400 }}>
        <Table
          dataSource={[
            {
              key: 'name',
              label: 'Tên file',
              value: document.originalName
            },
            {
              key: 'type',
              label: 'Loại file',
              value: getFileType()
            },
            {
              key: 'size',
              label: 'Kích thước',
              value: getFileSize()
            },
            {
              key: 'date',
              label: 'Ngày tạo',
              value: getUploadDate()
            },
            {
              key: 'uploader',
              label: 'Người upload',
              value: document.uploader
            },
            {
              key: 'source',
              label: 'Nguồn lưu trữ',
              value: getSource()
            },
            {
              key: 'shareUrl',
              label: 'Đường dẫn chia sẻ',
              value: (() => {
                const shareUrl = document.shareUrl || document.cloudinaryUrl || document.fileUrl;
                if (shareUrl) {
                  return (
                    <div style={{ wordBreak: 'break-all', fontSize: '11px' }}>
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                        {shareUrl}
                      </a>
                    </div>
                  );
                }
                return 'Không có đường dẫn chia sẻ';
              })()
            },
            {
              key: 'version',
              label: 'Phiên bản',
              value: `v${document.version}`
            },
            {
              key: 'status',
              label: 'Trạng thái',
              value: <ISOStatusBadge status={document.status} />
            },
            ...(document.metadata ? (() => {
              const formattedMetadata = (() => {
                const formatted: any = {};
                const fieldMappings: { [key: string]: string } = {
                  discipline: 'Chuyên ngành kỹ thuật',
                  originator: 'Tổ chức tạo tài liệu',
                  zone: 'Khu vực hoặc hệ thống',
                  level: 'Mức độ thông tin',
                  type: 'Loại tài liệu',
                  role: 'Vai trò',
                  number: 'Số thứ tự'
                };
                
                for (const [key, value] of Object.entries(document.metadata)) {
                  if (value && fieldMappings[key]) {
                    formatted[fieldMappings[key]] = value;
                  }
                }
                return formatted;
              })();

              return Object.entries(formattedMetadata).map(([key, value]) => ({
                key: `metadata_${key}`,
                label: key,
                value: (() => {
                  if (key === 'Chuyên ngành kỹ thuật') {
                    const disciplineMap: { [key: string]: string } = {
                      'AR': 'Kiến trúc',
                      'ST': 'Kết cấu',
                      'ME': 'Cơ điện',
                      'PL': 'Quy hoạch',
                      'LD': 'Cảnh quan',
                      'QS': 'Định giá',
                      'PM': 'Quản lý dự án'
                    };
                    return (
                      <span>
                        <Tag color="blue" style={{ marginRight: 4 }}>{String(value)}</Tag>
                        {disciplineMap[String(value)] || String(value)}
                      </span>
                    );
                  }
                  
                  if (key === 'Loại tài liệu') {
                    const typeMap: { [key: string]: string } = {
                      'DR': 'Bản vẽ',
                      'SP': 'Đặc tả',
                      'RE': 'Báo cáo',
                      'SC': 'Lịch trình',
                      'CO': 'Hợp đồng',
                      'IN': 'Hướng dẫn'
                    };
                    return (
                      <span>
                        <Tag color="green" style={{ marginRight: 4 }}>{String(value)}</Tag>
                        {typeMap[String(value)] || String(value)}
                      </span>
                    );
                  }
                  
                  if (key === 'Vai trò') {
                    const roleMap: { [key: string]: string } = {
                      'AR': 'Kiến trúc sư',
                      'ST': 'Kỹ sư kết cấu',
                      'ME': 'Kỹ sư cơ điện',
                      'PL': 'Quy hoạch sư',
                      'LD': 'Kiến trúc sư cảnh quan',
                      'QS': 'Định giá viên',
                      'PM': 'Quản lý dự án'
                    };
                    return (
                      <span>
                        <Tag color="orange" style={{ marginRight: 4 }}>{String(value)}</Tag>
                        {roleMap[String(value)] || String(value)}
                      </span>
                    );
                  }
                  
                  if (key === 'Mức độ thông tin') {
                    const levelMap: { [key: string]: string } = {
                      'LOD100': 'Khái niệm',
                      'LOD200': 'Sơ đồ',
                      'LOD300': 'Chi tiết',
                      'LOD400': 'Thi công',
                      'LOD500': 'Hoàn thiện'
                    };
                    return (
                      <span>
                        <Tag color="purple" style={{ marginRight: 4 }}>{String(value)}</Tag>
                        {levelMap[String(value)] || String(value)}
                      </span>
                    );
                  }

                  return String(value);
                })()
              }));
            })() : [])
          ]}
          columns={[
            {
              title: 'Thuộc tính',
              dataIndex: 'label',
              key: 'label',
              width: 160,
              render: (text: string) => (
                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{text}</span>
              )
            },
            {
              title: 'Giá trị',
              dataIndex: 'value',
              key: 'value',
              width: 240,
              render: (value: any) => (
                <span style={{ fontSize: '12px' }}>{value}</span>
              )
            }
          ]}
          pagination={false}
          size="small"
          showHeader={true}
          bordered={true}
          style={{ 
            width: 400,
            fontSize: '12px'
          }}
        />
      </div>
    );
  };

  // 1. Table cha chỉ hiển thị tên dự án
  const parentColumns = [
    {
      title: '',
      dataIndex: 'project',
      key: 'project',
      render: (_: any, record: any) => (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          <Tag color="blue" style={{ fontSize: 15 }}>{record.project?.name || 'Dự án'}</Tag>
        </span>
      )
    }
  ];

  // 2. Table con: không có cột dự án, cột tên tài liệu rộng hơn
  const childColumns = [
    {
      title: 'Tài liệu',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (text: string, record: Document) => (
        <Popover
          content={createHoverContent(record)}
          title="Thông tin chi tiết file"
          trigger="hover"
          placement="rightTop"
          overlayStyle={{ width: 400 }}
        >
          <div>
            <FileCard
              document={record}
              onClick={() => handleRowClick(record)}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
            />
          </div>
        </Popover>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      render: (text: string, record: Document) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleRowClick(record)}>
          <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{text || 'Không có mô tả'}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4, wordBreak: 'break-word' }}>
            <Text type="secondary">Tên gốc: {record.originalName}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Người tải lên',
      dataIndex: 'uploader',
      key: 'uploader',
      width: '15%',
      render: (text: string, record: Document) => (
        <div style={{ cursor: 'pointer', wordBreak: 'break-word' }} onClick={() => handleRowClick(record)}>
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span style={{ wordBreak: 'break-word' }}>{text}</span>
          </Space>
        </div>
      ),
    },
    {
      title: 'Ngày tải lên',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: '15%',
      render: (text: string, record: Document) => (
        <div style={{ cursor: 'pointer', wordBreak: 'break-word' }} onClick={() => handleRowClick(record)}>
          <Space>
            <CalendarOutlined />
            <span style={{ wordBreak: 'break-word' }}>{text}</span>
          </Space>
        </div>
      ),
    },
    {
      title: 'Kích thước',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: '10%',
      render: (text: string, record: Document) => (
        <div style={{ cursor: 'pointer', wordBreak: 'break-word' }} onClick={() => handleRowClick(record)}>
          {text}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '15%',
      render: (record: Document) => (
        <div style={{ wordBreak: 'break-word' }}>
          <Space size="small">
            {getDocumentActions(record).map((action, index) => (
              <Tooltip key={index} title={action.tooltip}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={action.icon}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                />
              </Tooltip>
            ))}
          </Space>
        </div>
      ),
    },
  ];

  // Tablet landscape columns for documents
  const getTabletLandscapeColumns = () => [
    {
      title: 'Tài liệu',
      dataIndex: 'document',
      key: 'document',
      width: '70%',
      render: (text: string, record: Document) => {
        const project = projects.find(p => p.id === record.projectId);
        return (
          <div className="tablet-document-info">
            {/* Dòng 1: Tên dự án - trạng thái file */}
            <div className="tablet-document-row-1">
              <span className="tablet-document-project">
                <ProjectOutlined />
                {project?.name || 'Dự án'}
              </span>
              <ISOStatusBadge status={record.status} />
            </div>
            
            {/* Dòng 2: Tên file */}
            <div className="tablet-document-row-2">
              <FileTextOutlined />
              {record.name}
            </div>
            
            {/* Dòng 3: Mô tả */}
            <div className="tablet-document-row-3">
              {record.description || 'Không có mô tả'}
            </div>
            
            {/* Dòng 4: Tên file gốc upload */}
            <div className="tablet-document-row-4">
              <span className="tablet-document-original">
                <FileOutlined />
                {record.originalName}
              </span>
            </div>
            
            {/* Dòng 5: Ngày đăng - người đăng - kích thước */}
            <div className="tablet-document-row-5">
              <span>
                <CalendarOutlined />
                {record.uploadDate}
              </span>
              <span>
                <UserOutlined />
                {record.uploader}
              </span>
              <span>
                {record.fileSize}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '30%',
      render: (record: Document) => (
        <div className="tablet-documents-actions-container">
          {/* Hàng 1: Xem chi tiết, Chỉnh sửa, Bình luận */}
          <div className="tablet-documents-actions-row">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record)}
                className="tablet-documents-icon-standard tablet-documents-icon-view"
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setSelectedDocument(record)}
                className="tablet-documents-icon-standard tablet-documents-icon-edit"
              />
            </Tooltip>
            <Tooltip title="Bình luận">
              <Button
                type="text"
                size="small"
                icon={<CommentOutlined />}
                onClick={() => handleComment(record)}
                className="tablet-documents-icon-standard tablet-documents-icon-comment"
              />
            </Tooltip>
          </div>
          
          {/* Hàng 2: Tải xuống, Chia sẻ, Xóa */}
          <div className="tablet-documents-actions-row">
            <Tooltip title="Tải xuống">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record)}
                className="tablet-documents-icon-standard tablet-documents-icon-download"
              />
            </Tooltip>
            <Tooltip title="Chia sẻ">
              <Button
                type="text"
                size="small"
                icon={<ShareAltOutlined />}
                onClick={() => handleCopyShareUrl(record)}
                className="tablet-documents-icon-standard tablet-documents-icon-share"
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteDocument(record)}
                className="tablet-documents-icon-standard tablet-documents-icon-delete"
              />
            </Tooltip>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <style>
        {`
          .ant-table-tbody > tr > td {
            word-break: break-word;
            white-space: normal;
            vertical-align: top;
          }
          .ant-table-thead > tr > th {
            word-break: break-word;
            white-space: normal;
          }
        `}
      </style>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: 24,
        gap: isMobile ? 16 : 0
      }}>
        <div>
          <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
            {isMobile ? '📁 Tài Liệu CDE' : 'Quản Lý Tài Liệu CDE'}
          </Title>
          {!isMobile && <Text type="secondary">Common Data Environment theo chuẩn ISO 19650</Text>}
        </div>
        <Space size={isMobile ? 'small' : 'middle'} wrap>
          <Button 
            type="primary" 
            icon={<RobotOutlined />} 
            onClick={handleAutomation}
            size={isMobile ? 'small' : 'middle'}
          >
            {isMobile ? 'Tự Động' : 'Tự Động Hóa'}
          </Button>
          <Button 
            type="primary" 
            icon={<UploadOutlined />} 
            onClick={() => setUploadModalVisible(true)}
            size={isMobile ? 'small' : 'middle'}
          >
            {isMobile ? 'Tải Lên' : 'Tải Lên'}
          </Button>
          <Button 
            icon={<SettingOutlined />} 
            onClick={handleISOSettings}
            size={isMobile ? 'small' : 'middle'}
          >
            {isMobile ? 'Cài Đặt' : 'Cài Đặt CDE'}
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <div className="documents-container">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="dashboard-stats-row">
          <Col xs={12} sm={8} md={6} lg={4} xl={4}>
          <ResponsiveStatCard
            title="Tổng Dự Án"
            value={projects.length}
            icon={<FolderOutlined />}
            function="projects"
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={4}>
          <ResponsiveStatCard
            title="Tổng Tài Liệu"
            value={documents.length}
            icon={<FileTextOutlined />}
            function="documentiso"
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={4}>
          <ResponsiveStatCard
            title="Đang Xử Lý"
            value={getStatusCount('wip')}
            icon={<ClockCircleOutlined />}
            function="documents"
            color="#faad14"
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={4}>
          <ResponsiveStatCard
            title="Đã Chia Sẻ"
            value={getStatusCount('shared')}
            icon={<SendOutlined />}
            function="documents"
            color="#1890ff"
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={4}>
          <ResponsiveStatCard
            title="Đã Phê Duyệt"
            value={getStatusCount('published')}
            icon={<CheckCircleOutlined />}
            function="document-approval"
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={4}>
          <ResponsiveStatCard
            title="Đã Lưu Trữ"
            value={getStatusCount('archived')}
            icon={<FolderOutlined />}
            function="documents"
            color="#8c8c8c"
          />
        </Col>
        </Row>
      </div>



      {/* Search and Filter */}
      <Card style={{ marginBottom: 24 }}>
        <style>
          {`
            /* Desktop-only filter alignment fixes */
            @media (min-width: 769px) {
              .desktop-documents-filter-container {
                display: flex !important;
                align-items: center !important;
                gap: 16px !important;
              }
              
              .desktop-documents-filter-container .ant-input,
              .desktop-documents-filter-container .ant-input-affix-wrapper {
                height: 44px !important;
                margin: 0 !important;
                padding: 0 11px !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .desktop-documents-filter-container .ant-select {
                height: 44px !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .desktop-documents-filter-container .ant-select .ant-select-selector {
                height: 44px !important;
                margin: 0 !important;
                padding: 0 11px !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .desktop-documents-filter-container .ant-select .ant-select-selection-search {
                height: 44px !important;
                margin: 0 !important;
                padding: 0 !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .desktop-documents-filter-container .ant-select .ant-select-selection-item {
                height: 44px !important;
                margin: 0 !important;
                padding: 0 !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .desktop-documents-filter-container .ant-btn {
                height: 44px !important;
                margin: 0 !important;
                padding: 0 15px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
            }
          `}
        </style>
        {!isMobile && !isTabletLandscape ? (
          // Desktop layout
          <div className="desktop-documents-filter-container">
            <Input
              placeholder="Tìm kiếm tài liệu..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              value={selectedDiscipline}
              onChange={setSelectedDiscipline}
              style={{ width: 200 }}
              placeholder="Tất cả chuyên ngành"
            >
              <Option value="all">Tất cả chuyên ngành</Option>
              <Option value="AR">Kiến trúc</Option>
              <Option value="ST">Kết cấu</Option>
              <Option value="ME">Cơ điện</Option>
              <Option value="QS">Định giá</Option>
              <Option value="PM">Quản lý dự án</Option>
            </Select>
            <Select
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: 200 }}
              placeholder="Tất cả dự án"
            >
              <Option value="all">Tất cả dự án</Option>
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
            <Button 
              icon={<ClearOutlined />} 
              onClick={() => {
                setSearchText('');
                setSelectedStatus('all');
                setSelectedDiscipline('all');
                setSelectedProject('all');
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : isTabletLandscape ? (
          <ResponsiveCollapsibleFilters
            searchValue={searchText}
            searchPlaceholder="Tìm kiếm tài liệu..."
            onSearchChange={setSearchText}
            statusValue={selectedStatus}
            statusOptions={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'DRAFT', label: 'Bản nháp' },
              { value: 'IN_REVIEW', label: 'Đang xem xét' },
              { value: 'APPROVED', label: 'Đã phê duyệt' },
              { value: 'REJECTED', label: 'Bị từ chối' }
            ]}
            onStatusChange={setSelectedStatus}
            priorityValue=""
            priorityOptions={[]}
            onPriorityChange={() => {}}
            projectValue={selectedProject}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onProjectChange={setSelectedProject}
            assigneeValue=""
            assigneeOptions={[]}
            onAssigneeChange={() => {}}
            onReset={() => {
              setSearchText('');
              setSelectedDiscipline('all');
              setSelectedProject('all');
              setSelectedStatus('all');
            }}
            title="Bộ lọc tài liệu"
            isMobile={isMobile}
            isTabletLandscape={isTabletLandscape}
            isDarkMode={isDarkMode}
            additionalFilters={
              <Col span={12}>
                <div className="tablet-filter-item">
                  <div className="tablet-filter-label">Chuyên ngành</div>
                  <Select
                    value={selectedDiscipline}
                    onChange={setSelectedDiscipline}
                    style={{ width: '100%' }}
                    placeholder="Chuyên ngành"
                    size="middle"
                  >
                    <Option value="all">Tất cả chuyên ngành</Option>
                    <Option value="AR">Kiến trúc</Option>
                    <Option value="ST">Kết cấu</Option>
                    <Option value="ME">Cơ điện</Option>
                    <Option value="QS">Định giá</Option>
                    <Option value="PM">Quản lý dự án</Option>
                  </Select>
                </div>
              </Col>
            }
          />
        ) : (
          // Mobile layout with standard MobileFilters component
          <MobileFilters
            searchValue={searchText}
            statusValue={selectedStatus}
            priorityValue={selectedDiscipline}
            assigneeValue=""
            projectValue={selectedProject}
            statusOptions={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'DRAFT', label: 'Bản nháp' },
              { value: 'REVIEW', label: 'Đang xem xét' },
              { value: 'APPROVED', label: 'Đã phê duyệt' },
              { value: 'PUBLISHED', label: 'Đã xuất bản' },
              { value: 'ARCHIVED', label: 'Đã lưu trữ' }
            ]}
            priorityOptions={[
              { value: 'all', label: 'Tất cả chuyên ngành' },
              { value: 'AR', label: 'Kiến trúc' },
              { value: 'ST', label: 'Kết cấu' },
              { value: 'MEP', label: 'MEP' },
              { value: 'ARCH', label: 'Kiến trúc' },
              { value: 'CIVIL', label: 'Dân dụng' }
            ]}
            assigneeOptions={[]}
            projectOptions={[
              { value: 'all', label: 'Tất cả dự án' },
              ...projects.map(project => ({ value: project.id, label: project.name }))
            ]}
            onSearchChange={setSearchText}
            onStatusChange={setSelectedStatus}
            onPriorityChange={setSelectedDiscipline}
            onAssigneeChange={() => {}}
            onProjectChange={setSelectedProject}
            onReset={() => {
              setSearchText('');
              setSelectedStatus('all');
              setSelectedDiscipline('all');
              setSelectedProject('all');
            }}
            title="Bộ lọc tài liệu"
            isDarkMode={isDarkMode}
            pageType="documents"
          />
        )}
      </Card>

      {/* Document List */}
      <Card title={`Danh sách tài liệu (${getFilteredDocuments().length})`}>
        {isMobile ? (
          // Mobile Card View
          <div>
            {getSortedProjects().map(project => {
              const projectDocuments = getSortedDocumentsForProject(project.id);
              if (projectDocuments.length === 0) return null;
              
              return (
                <div key={project.id} style={{ marginBottom: 24 }}>
                  <Card 
                    size="small" 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FolderOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{project.name}</span>
                        <Tag color="blue">{projectDocuments.length} tài liệu</Tag>
                      </div>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    {projectDocuments.map(doc => (
                      <Card 
                        key={doc.id}
                        size="small"
                        style={{ 
                          marginBottom: 12, 
                          border: '1px solid #f0f0f0',
                          borderRadius: 8
                        }}
                        bodyStyle={{ padding: 12 }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {/* Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <FileTextOutlined style={{ color: '#52c41a' }} />
                                <Text 
                                  strong 
                                  style={{ 
                                    fontSize: 13,
                                    color: isDarkMode ? '#fff' : '#262626'
                                  }}
                                >
                                  {doc.name}
                                </Text>
                              </div>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {doc.code} • Rev. {doc.revision}
                              </Text>
                            </div>
                            <ISOStatusBadge status={doc.status} />
                          </div>
                          
                          {/* Meta Info */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            <Tag color="cyan">{doc.discipline}</Tag>
                            <Tag color="orange">{doc.type}</Tag>
                            {doc.size && (
                              <Tag color="default">
                                {(doc.size / (1024 * 1024)).toFixed(1)} MB
                              </Tag>
                            )}
                          </div>
                          
                          {/* Dates */}
                          <div style={{ fontSize: 11, color: '#666' }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            Tạo: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : new Date(doc.uploadDate).toLocaleDateString('vi-VN')}
                            {doc.updatedAt && (
                              <span style={{ marginLeft: 8 }}>
                                • Cập nhật: {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                            <Button 
                              size="small" 
                              icon={
                                <EyeOutlined 
                                  style={{ 
                                    fontSize: '16px',
                                    color: '#1890ff'
                                  }} 
                                />
                              } 
                              type="text"
                              onClick={() => handlePreview(doc)}
                              style={{
                                border: '1px solid #1890ff',
                                borderRadius: '6px',
                                backgroundColor: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)'
                              }}
                            />
                            <Button 
                              size="small" 
                              icon={
                                <DownloadOutlined 
                                  style={{ 
                                    fontSize: '16px',
                                    color: '#52c41a'
                                  }} 
                                />
                              } 
                              type="text"
                              onClick={() => handleDownload(doc)}
                              style={{
                                border: '1px solid #52c41a',
                                borderRadius: '6px',
                                backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.05)'
                              }}
                            />
                            <Button 
                              size="small" 
                              icon={
                                <EditOutlined 
                                  style={{ 
                                    fontSize: '16px',
                                    color: '#fa8c16'
                                  }} 
                                />
                              } 
                              type="text"
                              onClick={() => setSelectedDocument(doc)}
                              style={{
                                border: '1px solid #fa8c16',
                                borderRadius: '6px',
                                backgroundColor: isDarkMode ? 'rgba(250, 140, 22, 0.1)' : 'rgba(250, 140, 22, 0.05)'
                              }}
                            />
                            <Button 
                              size="small" 
                              icon={
                                <DeleteOutlined 
                                  style={{ 
                                    fontSize: '16px',
                                    color: '#ff4d4f'
                                  }} 
                                />
                              } 
                              type="text"
                              onClick={() => handleDeleteDocument(doc)}
                              style={{
                                border: '1px solid #ff4d4f',
                                borderRadius: '6px',
                                backgroundColor: isDarkMode ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.05)'
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Card>
                </div>
              );
            })}
            {getSortedProjects().every(project => getSortedDocumentsForProject(project.id).length === 0) && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Không có tài liệu nào</div>
              </div>
            )}
          </div>
        ) : isTabletLandscape ? (
          // Tablet Landscape Table View
          <Table
            columns={getTabletLandscapeColumns()}
            dataSource={getFilteredDocuments()}
            rowKey={doc => (doc && typeof doc === 'object' && 'id' in doc ? (doc as any).id : undefined)}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài liệu`,
            }}
            showHeader={true}
            bordered
            scroll={{ x: 800 }}
            style={{ marginTop: 24 }}
            locale={{ emptyText: 'Không có tài liệu nào' }}
          />
        ) : (
          // Desktop Table View
          <Table
            columns={parentColumns}
            dataSource={getSortedProjects().map(project => ({
              key: project.id,
              project,
              documents: getSortedDocumentsForProject(project.id),
            })).filter(g => g.documents.length > 0)}
            rowKey={record => (record && typeof record === 'object' && 'key' in record ? (record as any).key : undefined)}
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  columns={childColumns}
                  dataSource={record.documents}
                  rowKey={doc => (doc && typeof doc === 'object' && 'id' in doc ? (doc as any).id : undefined)}
                  pagination={false}
                  showHeader={true}
                  bordered={false}
                  scroll={{ x: 800 }}
                  components={{
                    body: {
                      row: (props: any) => {
                        const { children, ...restProps } = props;
                        return <tr {...restProps}>{children}</tr>;
                      }
                    }
                  }}
                />
              ),
              rowExpandable: record => record.documents.length > 0,
            }}
            pagination={false}
            showHeader={false}
            bordered
            scroll={{ x: 600 }}
            style={{ marginTop: 24 }}
            locale={{ emptyText: 'Không có tài liệu nào' }}
          />
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Tải lên tài liệu theo ISO 19650"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={800}
        style={{ maxHeight: '80vh' }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
          className="document-upload-form"
        >
          <Form.Item
            name="file"
            label="Chọn tài liệu"
            rules={[{ required: true, message: 'Vui lòng chọn tài liệu!' }]}
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn tài liệu</Button>
            </Upload>
          </Form.Item>

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

          <Form.Item
            name="description"
            label="Mô tả tài liệu"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết về tài liệu..." />
          </Form.Item>

          <Form.Item
            name="status"
            label="Phân loại tài liệu"
            rules={[{ required: true, message: 'Vui lòng chọn phân loại!' }]}
            initialValue="WORK_IN_PROGRESS"
          >
            <Select placeholder="Chọn phân loại tài liệu">
              <Option value="WORK_IN_PROGRESS">Đang xử lý (WIP)</Option>
              <Option value="SHARED">Đã chia sẻ (Shared)</Option>
              <Option value="PUBLISHED">Đã phê duyệt (Published)</Option>
              <Option value="ARCHIVED">Đã lưu trữ (Archived)</Option>
            </Select>
          </Form.Item>

          <Divider />

          <Alert
            message="Thông tin bắt buộc"
            description="Các trường có dấu * là bắt buộc theo chuẩn ISO 19650."
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
          />

          <ISOMetadataForm 
            form={uploadForm} 
            showTitle={false}
          />

          <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setUploadModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Tải lên
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`Xem trước: ${previewDocument?.name}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(previewDocument!)}>
            Tải về
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {previewDocument && (
          <div>
            <Alert
              message="Xem trước tài liệu"
              description={`Đang xem trước: ${previewDocument.originalName}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ 
              height: 400, 
              border: '1px solid #d9d9d9', 
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f5f5'
            }}>
              <div style={{ textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <div style={{ marginTop: 16 }}>
                  <Text strong>{previewDocument.name}</Text>
                </div>
                <div style={{ marginTop: 8, color: '#666' }}>
                  <Text type="secondary">Kích thước: {previewDocument.fileSize}</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" icon={<DownloadOutlined />}>
                    Tải về để xem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Comment Drawer */}
      <CommentDrawer
        open={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        title={`Bình luận cho: ${commentDocument?.name || ''}`}
        entityType="documents"
        entityId={commentDocument?.id || null}
        comments={comments}
        loading={commentLoading}
        onAddComment={async (content: string) => {
          if (!commentDocument) return;
          await addComment(commentDocument.id, content);
        }}
        onFetchComments={fetchComments}
      />

      {/* Automation Drawer - Responsive cho 3 thiết bị */}
      <Drawer
        title="Thiết lập tự động hóa đặt tên file"
        placement="right"
        width={
          isMobile ? '100%' : 
          isTabletLandscape ? '60%' : 
          500
        }
        onClose={() => setAutomationDrawerOpen(false)}
        open={automationDrawerOpen}
        className={
          isMobile ? "" : 
          isTabletLandscape ? "tablet-landscape-edit-modal" : 
          ""
        }
      >
        <div style={{ padding: 16 }}>
          <Alert
            message="Quy tắc đặt tên file theo dự án"
            description="Thiết lập quy tắc tự động đặt tên file khi upload theo chuẩn ISO 19650"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Steps direction="vertical" current={1} style={{ marginBottom: 24 }}>
            <Step 
              title="Chọn dự án" 
              description="Chọn dự án để áp dụng quy tắc"
              icon={<FolderOutlined />}
            />
            <Step 
              title="Thiết lập quy tắc" 
              description="Định nghĩa format tên file"
              icon={<SettingOutlined />}
            />
            <Step 
              title="Áp dụng" 
              description="Lưu và áp dụng quy tắc"
              icon={<CheckCircleOutlined />}
            />
          </Steps>

          <Form 
            layout="vertical"
            className={
              isMobile ? "" : 
              isTabletLandscape ? "document-edit-form" : 
              ""
            }
          >
            <Form.Item label="Dự án">
              <Select placeholder="Chọn dự án">
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Format tên file">
              <Input 
                placeholder="Ví dụ: {ProjectCode}_{Discipline}_{Type}_{Level}_{Version}"
                defaultValue="{ProjectCode}_{Discipline}_{Type}_{Level}_{Version}"
              />
            </Form.Item>

            <Form.Item label="Mô tả">
              <Input.TextArea 
                rows={3}
                placeholder="Mô tả quy tắc đặt tên file..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary">
                  Lưu quy tắc
                </Button>
                <Button>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Drawer>

      {/* Preview Modal với Cloudinary */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Xem trước: {previewDocument?.originalName}</span>
          </Space>
        }
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="createIssue" 
            type="primary" 
            icon={<ExclamationCircleOutlined />}
            onClick={async () => {
              // Tự động chụp ảnh trước khi mở form tạo vấn đề
              await captureScreenshot();
              setCreateIssueModalVisible(true);
            }}
          >
            Tạo vấn đề
          </Button>
        ]}
      >
        {previewDocument && (
          <div>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên file" span={2}>
                {previewDocument.originalName}
              </Descriptions.Item>
              <Descriptions.Item label="Dự án">
                {previewDocument.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <ISOStatusBadge status={previewDocument.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Người upload">
                {previewDocument.uploader}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày upload">
                {previewDocument.uploadDate}
              </Descriptions.Item>
              {previewDocument.cloudinaryUrl && (
                <Descriptions.Item label="Cloudinary URL" span={3}>
                  <Space>
                    <LinkOutlined />
                    <Text copyable style={{ fontSize: '12px' }}>
                      {previewDocument.cloudinaryUrl}
                    </Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px' }}>
              {getPreviewComponent(previewDocument)}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal tạo vấn đề từ preview */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined />
            <span>Tạo vấn đề từ tài liệu</span>
          </Space>
        }
        open={createIssueModalVisible}
        onCancel={() => setCreateIssueModalVisible(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setCreateIssueModalVisible(false)}
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => issueForm.submit()}
            loading={creatingIssue}
          >
            OK
          </Button>
        ]}
        width={600}
        destroyOnClose
      >
        <Form
          form={issueForm}
          layout="vertical"
          onFinish={handleCreateIssueFromPreview}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề vấn đề" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả vấn đề" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Dự án"
                initialValue={previewDocument?.projectId}
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
                name="type" 
                label="Loại" 
                initialValue="ISSUE"
                rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
              >
                <Select placeholder="Chọn loại">
                  <Option value="ISSUE">Vấn đề</Option>
                  <Option value="RFI">RFI</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label="Trạng thái" 
                initialValue="NEW"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="NEW">Mới</Option>
                  <Option value="IN_PROGRESS">Đang xử lý</Option>
                  <Option value="RESOLVED">Đã xử lý</Option>
                  <Option value="CLOSED">Đã đóng</Option>
                  <Option value="OVERDUE">Quá hạn</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="priority" 
                label="Độ ưu tiên" 
                initialValue="MEDIUM"
                rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}
              >
                <Select placeholder="Chọn độ ưu tiên">
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="URGENT">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="assigneeId" label="Người được giao">
            <Select placeholder="Chọn người được giao" allowClear>
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="attachments"
            label="File đính kèm"
          >
            <Upload
              multiple
              beforeUpload={(file) => {
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  message.error('File phải nhỏ hơn 10MB!');
                  return false;
                }
                return false; // Prevent auto upload
              }}
              onChange={(info) => {
                const fileList = info.fileList.map(file => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  originFileObj: file.originFileObj
                }));
                setIssueAttachments(fileList);
              }}
              fileList={issueAttachments.map((file, index) => ({
                uid: index.toString(),
                name: file.name,
                status: 'done',
                size: file.size
              }))}
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          {screenshotData && (
            <Form.Item label="Ảnh chụp màn hình">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image
                  src={screenshotData}
                  alt="Screenshot"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.8)' }}
                  onClick={() => setScreenshotData('')}
                />
              </div>
            </Form.Item>
          )}

          <Alert
            message="Thông tin liên quan"
            description={
              <div>
                <div>Vấn đề này sẽ được liên kết với tài liệu: <strong>{previewDocument?.originalName}</strong></div>
                {screenshotData && <div>• Ảnh chụp màn hình: <strong>screenshot.png</strong></div>}
                {issueAttachments.length > 0 && (
                  <div>• File đính kèm: <strong>{issueAttachments.length} file</strong></div>
                )}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Form>
      </Modal>

      {/* Cloudinary Info Modal */}
      <Modal
        title="Thông tin Cloudinary"
        open={cloudinaryInfoVisible}
        onCancel={() => setCloudinaryInfoVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCloudinaryInfoVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedCloudinaryFile && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên file">
              {selectedCloudinaryFile.originalname || selectedCloudinaryFile.name}
            </Descriptions.Item>
            <Descriptions.Item label="Cloudinary ID">
              {selectedCloudinaryFile.cloudinaryId || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Đường dẫn chia sẻ công khai">
              <Text copyable style={{ fontSize: '12px' }}>
                {selectedCloudinaryFile.url || 'N/A'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Đường dẫn tải xuống trực tiếp">
              <Text copyable style={{ fontSize: '12px' }}>
                {selectedCloudinaryFile.downloadUrl || 'N/A'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại file">
              {selectedCloudinaryFile.mimetype || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Kích thước">
              {formatFileSize(selectedCloudinaryFile.size || 0)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* File Info Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Thông tin tài liệu</span>
          </Space>
        }
        open={fileInfoModalVisible}
        onCancel={() => setFileInfoModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFileInfoModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="preview" 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => {
              setFileInfoModalVisible(false);
              if (selectedDocument) {
                handleEnhancedPreview(selectedDocument);
              }
            }}
          >
            Xem trước
          </Button>
        ]}
        width={700}
      >
        {selectedDocument && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Tên tài liệu" span={2}>
                <Text strong>{selectedDocument.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tên gốc" span={2}>
                {selectedDocument.originalName}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedDocument.description}
              </Descriptions.Item>
              <Descriptions.Item label="Dự án">
                {selectedDocument.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <ISOStatusBadge status={selectedDocument.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Phiên bản">
                v{selectedDocument.version}
              </Descriptions.Item>
              <Descriptions.Item label="Loại file">
                {selectedDocument.fileType || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Kích thước">
                {selectedDocument.fileSize}
              </Descriptions.Item>
              <Descriptions.Item label="Người tải lên">
                {selectedDocument.uploader}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tải lên">
                {selectedDocument.uploadDate}
              </Descriptions.Item>
              {(selectedDocument.shareUrl || selectedDocument.downloadUrl || selectedDocument.fileUrl) && (
                <Descriptions.Item label="Đường dẫn chia sẻ" span={2}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {selectedDocument.shareUrl && (
                      <Space>
                        <LinkOutlined />
                        <Text copyable style={{ fontSize: '12px' }}>
                          <a href={selectedDocument.shareUrl} target="_blank" rel="noopener noreferrer">
                            {selectedDocument.shareUrl}
                          </a>
                        </Text>
                      </Space>
                    )}
                    {selectedDocument.downloadUrl && (
                      <Space>
                        <DownloadOutlined />
                        <Text copyable style={{ fontSize: '12px' }}>
                          <a href={selectedDocument.downloadUrl} target="_blank" rel="noopener noreferrer">
                            {selectedDocument.downloadUrl}
                          </a>
                        </Text>
                      </Space>
                    )}
                    {selectedDocument.fileUrl && !selectedDocument.shareUrl && (
                      <Space>
                        <FileOutlined />
                        <Text copyable style={{ fontSize: '12px' }}>
                          <a href={selectedDocument.fileUrl} target="_blank" rel="noopener noreferrer">
                            {selectedDocument.fileUrl}
                          </a>
                        </Text>
                      </Space>
                    )}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <Divider />
            
            <Alert
              message="Metadata ISO 19650"
              description="Thông tin metadata theo chuẩn ISO 19650"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <DocumentMetadata metadata={selectedDocument.metadata} showTitle={false} />
          </div>
        )}
      </Modal>

      {/* Enhanced Preview Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Xem trước: {previewDocument?.originalName}</span>
          </Space>
        }
        open={enhancedPreviewModalVisible}
        onCancel={() => setEnhancedPreviewModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setEnhancedPreviewModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="fullscreen" 
            icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          </Button>,
          <Button 
            key="createIssue" 
            type="primary" 
            icon={<ExclamationCircleOutlined />}
            onClick={async () => {
              // Tự động chụp ảnh trước khi mở form tạo vấn đề
              await captureScreenshot();
              setCreateIssueModalVisible(true);
            }}
          >
            Tạo vấn đề
          </Button>
        ]}
      >
        {previewDocument && (
          <div>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên file" span={2}>
                {previewDocument.originalName}
              </Descriptions.Item>
              <Descriptions.Item label="Dự án">
                {previewDocument.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <ISOStatusBadge status={previewDocument.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Người upload">
                {previewDocument.uploader}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày upload">
                {previewDocument.uploadDate}
              </Descriptions.Item>
              {canViewDocuments && previewDocument.shareUrl && (
                <Descriptions.Item label="Đường dẫn chia sẻ" span={3}>
                  <Space>
                    <LinkOutlined />
                    <Text copyable style={{ fontSize: '12px' }}>
                      {previewDocument.shareUrl}
                    </Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div 
              ref={previewRef}
              style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px' }}
            >
              {renderEnhancedPreview(previewDocument)}
            </div>
          </div>
        )}
      </Modal>

      {/* ISO Settings Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            <span>Cấu hình ISO 19650</span>
          </Space>
        }
        open={isISOSettingsModalVisible}
        onCancel={() => setIsISOSettingsModalVisible(false)}
        width="80%"
        style={{ top: 20 }}
        footer={[
          <Button key="cancel" onClick={() => setIsISOSettingsModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={handleISOSave}
            loading={isLoadingISO}
          >
            Lưu cấu hình
          </Button>
        ]}
      >
        <div>
          {/* Project Selector */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Text strong>Chọn dự án:</Text>
              <Select
                style={{ width: 300 }}
                placeholder="Chọn dự án để cấu hình riêng (hoặc để trống cho cấu hình toàn hệ thống)"
                allowClear
                value={selectedProjectForISO}
                onChange={handleProjectChangeForISO}
              >
                <Option value={null}>Toàn hệ thống (Global)</Option>
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
              {selectedProjectForISO && (
                <Tag color="blue">
                  Cấu hình riêng cho: {projects.find(p => p.id === selectedProjectForISO)?.name}
                </Tag>
              )}
            </div>
          </Card>

          {isLoadingISO ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Đang tải cấu hình...</div>
            </div>
          ) : (
            <Collapse defaultActiveKey={['document-status', 'metadata-fields', 'approval-process', 'file-naming']}>
              
              {/* Document Status Configuration */}
              <Panel header="Trạng Thái Tài Liệu" key="document-status">
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Cấu hình các trạng thái tài liệu theo ISO 19650
                </Text>
                
                {documentStatuses.map((status) => (
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
                  style={{ marginTop: 8 }}
                >
                  Thêm trường metadata
                </Button>
              </Panel>

              {/* Approval Process Configuration */}
              <Panel header="Quy Trình Phê Duyệt" key="approval-process">
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Cấu hình các bước phê duyệt tự động
                </Text>
                
                {approvalSteps.map((step) => (
                  <Card key={step.id} size="small" style={{ marginBottom: 12 }}>
                    <Row gutter={16} align="middle">
                      <Col span={4}>
                        <InputNumber
                          value={step.order}
                          onChange={(value) => updateApprovalStep(step.id, 'order', value)}
                          placeholder="Thứ tự"
                          min={1}
                        />
                      </Col>
                      <Col span={6}>
                        <Input
                          value={step.name}
                          onChange={(e) => updateApprovalStep(step.id, 'name', e.target.value)}
                          placeholder="Tên bước"
                        />
                      </Col>
                      <Col span={6}>
                        <Input
                          value={step.nameVi}
                          onChange={(e) => updateApprovalStep(step.id, 'nameVi', e.target.value)}
                          placeholder="Tên tiếng Việt"
                        />
                      </Col>
                      <Col span={4}>
                        <Checkbox
                          checked={step.isAutomatic}
                          onChange={(e) => updateApprovalStep(step.id, 'isAutomatic', e.target.checked)}
                        >
                          Tự động
                        </Checkbox>
                      </Col>
                      <Col span={4}>
                        <Switch
                          checked={step.isRequired}
                          onChange={(checked) => updateApprovalStep(step.id, 'isRequired', checked)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Panel>

              {/* File Naming Rule Configuration */}
              <Panel header="Quy Tắc Đặt Tên File" key="file-naming">
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Cấu hình quy tắc đặt tên file theo ISO 19650
                </Text>
                
                <Card size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Template">
                        <Input
                          value={fileNamingRule.template}
                          onChange={(e) => setFileNamingRule((prev: any) => ({ ...prev, template: e.target.value }))}
                          placeholder="Ví dụ: {ProjectCode}-{Discipline}-{Type}-{Number}"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Ví dụ">
                        <Input
                          value={fileNamingRule.example}
                          onChange={(e) => setFileNamingRule((prev: any) => ({ ...prev, example: e.target.value }))}
                          placeholder="Ví dụ: PROJ-AR-DR-001"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Checkbox
                        checked={fileNamingRule.isActive}
                        onChange={(e) => setFileNamingRule((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                      >
                        Kích hoạt quy tắc đặt tên
                      </Checkbox>
                    </Col>
                  </Row>
                </Card>
              </Panel>
            </Collapse>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tài liệu"
        content="Bạn có chắc chắn muốn xóa tài liệu"
        itemName={documentToDelete?.name}
        loading={deleteLoading}
        size="medium"
      />

      {/* Floating Action Button for Mobile and Tablet */}
      <FloatingActionButton 
        onClick={() => setUploadModalVisible(true)}
        tooltip="Tải lên tài liệu mới"
        icon={<UploadOutlined />}
        color={`linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)`}
      />
    </div>
  );
};

export default DocumentsISO; 