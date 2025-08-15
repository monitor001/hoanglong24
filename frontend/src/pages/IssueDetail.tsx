import React, { useEffect, useState, useRef } from 'react';
import { Card, List, Input, Button, Upload, message, Avatar, Typography, Space, Tag, Tooltip, Progress, Row, Col, Divider, Badge, Statistic, Image, Modal, theme, Alert, Spin } from 'antd';
import { 
  UploadOutlined, 
  FilePdfOutlined, 
  FileUnknownOutlined, 
  ArrowDownOutlined,
  UserOutlined,
  CalendarOutlined,
  ProjectOutlined,
  MessageOutlined,
  PaperClipOutlined,
  SendOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  EyeOutlined,
  DownloadOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  DeleteOutlined,
  CloudOutlined,
  InfoCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  PlayCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
// Cloudinary service - backend handles file upload
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
// Removed permission system

import '../styles/desktop-statistics-colors.css';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Title, Text } = Typography;

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://qlda.hoanglong24.com');

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  let color = '#';
  for (let i = 0; i < 3; i++) color += ('00' + ((hash >> (i * 8)) & 0xff).toString(16)).slice(-2);
  return color;
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

// Component Preview File với màn hình lớn
const FilePreviewModal: React.FC<{
  visible: boolean;
  file: any;
  onClose: () => void;
  isDarkMode: boolean;
}> = ({ visible, file, onClose, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [viewerError, setViewerError] = useState(false);
  
  const renderPreview = () => {
    if (!file) return null;
    
    const fileType = file.mimetype || file.type || '';
    const fileUrl = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : '');
    
    // Preview ảnh
    if (fileType.startsWith('image/')) {
      return (
        <div style={{ 
          width: '100%',
          height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDarkMode ? '#000' : '#f5f5f5',
          position: 'relative'
        }}>
          <img
            src={fileUrl}
            alt={file.originalname || file.name}
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
          {loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <Spin size="large" />
            </div>
          )}
        </div>
      );
    }
    
    // Preview PDF
    if (fileType === 'application/pdf') {
      return (
        <div style={{ 
          width: '100%',
          height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
          position: 'relative'
        }}>
          <iframe
            src={fileUrl}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              background: isDarkMode ? '#1e1e1e' : '#fff'
            }}
            title={file.originalname || file.name}
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: isDarkMode ? '#1e1e1e' : '#fff',
              padding: 20,
              borderRadius: 8
            }}>
              <Spin size="large" tip="Đang tải PDF..." />
            </div>
          )}
        </div>
      );
    }
    
    // Preview Word/Excel/PowerPoint - Sử dụng Google Docs Viewer với fallback
    if (fileType.includes('word') || fileType.includes('excel') || fileType.includes('powerpoint') || 
        fileType.includes('document') || fileType.includes('spreadsheet') || fileType.includes('presentation') ||
        file.originalname?.match(/\.(xlsx?|docx?|pptx?|pdf)$/i)) {
      
      // Nếu có lỗi viewer, hiển thị download link
      if (viewerError) {
        return (
          <div style={{ 
            width: '100%',
            height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
            padding: 24
          }}>
            <div style={{
              textAlign: 'center',
              maxWidth: 400
            }}>
              <FileTextOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
              <h3 style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 16 }}>
                Không thể xem trước file
              </h3>
              <p style={{ color: isDarkMode ? '#ccc' : '#666', marginBottom: 24 }}>
                File này không thể hiển thị trong trình duyệt. Vui lòng tải xuống để xem.
              </p>
              <Button 
                type="primary" 
                size="large"
                icon={<DownloadOutlined />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = fileUrl;
                  link.download = file.originalname || file.name;
                  link.target = '_blank';
                  link.click();
                }}
              >
                Tải xuống file
              </Button>
            </div>
          </div>
        );
      }
      
      return (
        <div style={{ 
          width: '100%',
          height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
          position: 'relative',
          background: isDarkMode ? '#1e1e1e' : '#f5f5f5'
        }}>
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              background: '#fff'
            }}
            title={file.originalname || file.name}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setViewerError(true);
            }}
          />
          {loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: isDarkMode ? '#1e1e1e' : '#fff',
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
        file.originalname?.endsWith('.txt') || file.originalname?.endsWith('.json') ||
        file.originalname?.endsWith('.xml') || file.originalname?.endsWith('.csv')) {
      return (
        <div style={{ 
          width: '100%',
          height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
          overflow: 'auto',
          background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
          padding: 24
        }}>
          <pre style={{ 
            margin: 0,
            padding: 24,
            background: isDarkMode ? '#0d1117' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#30363d' : '#d0d7de'}`,
            borderRadius: 8,
            color: isDarkMode ? '#e6edf3' : '#24292f',
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
            onLoadedMetadata={() => setLoading(false)}
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
        color: isDarkMode ? '#d4d4d4' : '#666',
        background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
        height: fullscreen ? '100vh' : 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FileUnknownOutlined style={{ fontSize: 80, marginBottom: 24, color: isDarkMode ? '#6b7280' : '#9ca3af' }} />
        <Title level={4} style={{ color: isDarkMode ? '#d4d4d4' : '#666', marginBottom: 16 }}>
          Không thể xem trước file này
        </Title>
        <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: 24 }}>
          File loại {fileType || 'không xác định'} không được hỗ trợ xem trước
        </Text>
        <Button 
          type="primary" 
          size="large"
          icon={<DownloadOutlined />}
          onClick={() => {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = file.originalname || file.name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Tải về để xem
        </Button>
      </div>
    );
  };
  
  useEffect(() => {
    if (visible) {
      setLoading(true);
    }
  }, [visible]);
  
  return (
    <Modal
      open={visible}
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingRight: 40
        }}>
          <Space size="middle">
            {file && (() => {
              const getFileIcon = (mimetype: string, filename: string) => {
                const iconStyle = { fontSize: 20 };
                if (mimetype.startsWith('image/')) {
                  return <FileImageOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
                }
                if (mimetype === 'application/pdf') {
                  return <FilePdfOutlined style={{ ...iconStyle, color: '#cf1322' }} />;
                }
                if (mimetype.includes('word') || mimetype.includes('document')) {
                  return <FileWordOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
                }
                if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
                  return <FileExcelOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
                }
                if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('archive')) {
                  return <FileZipOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
                }
                if (mimetype.startsWith('video/')) {
                  return <PlayCircleOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
                }
                return <FileUnknownOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
              };
              return getFileIcon(file.mimetype || file.type || '', file.originalname || file.name || '');
            })()}
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {file?.originalname || file?.name || 'File'}
            </span>
            <Tag color={isDarkMode ? 'blue' : 'processing'}>
              {(() => {
                const formatFileSize = (bytes: number) => {
                  if (bytes === 0) return '0 Bytes';
                  const k = 1024;
                  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                  const i = Math.floor(Math.log(bytes) / Math.log(k));
                  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };
                return formatFileSize(file?.size || 0);
              })()}
            </Tag>
          </Space>
          <Space size="small">
            <Tooltip title={fullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}>
              <Button 
                icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setFullscreen(!fullscreen)}
                type="text"
              />
            </Tooltip>
            <Tooltip title="Tải xuống">
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : '');
                  link.download = file.originalname || file.name;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  message.success('Đã bắt đầu tải xuống!');
                }}
                type="primary"
              >
                Tải về
              </Button>
            </Tooltip>
          </Space>
        </div>
      }
      footer={null}
      onCancel={onClose}
      width={fullscreen ? '100%' : '95%'}
      style={{ 
        top: fullscreen ? 0 : 20,
        maxWidth: fullscreen ? '100%' : '1400px',
        paddingBottom: 0
      }}
      bodyStyle={{ 
        padding: 0,
        background: isDarkMode ? '#0d1117' : '#ffffff',
        height: fullscreen ? '100vh' : 'auto',
        overflow: 'hidden'
      }}
      maskStyle={{
        background: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.45)'
      }}
      centered={!fullscreen}
      destroyOnClose
    >
      {renderPreview()}
    </Modal>
  );
};

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { theme: appTheme, isDarkMode } = useSelector((state: RootState) => state.ui);
  
  const [issue, setIssue] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [highlightId, setHighlightId] = useState<string|null>(null);
  const [showNewBtn, setShowNewBtn] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [filePreviewVisible, setFilePreviewVisible] = useState(false);
  const [cloudinaryInfoVisible, setCloudinaryInfoVisible] = useState(false);
  const [selectedCloudinaryFile, setSelectedCloudinaryFile] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCloudinaryReady, setIsCloudinaryReady] = useState(true);
  const [uploadingToCloudinary, setUploadingToCloudinary] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const userId = (() => { try { return JSON.parse(localStorage.getItem('user')||'{}').id; } catch { return null; } })();
  const userRole = (() => { try { return JSON.parse(localStorage.getItem('user')||'{}').role; } catch { return null; } })();
  // Removed permission system - always allow delete
  const canDeleteIssues = true;

  useEffect(() => {
    fetchIssue();
    fetchComments();
    socket.on('issue:comment:created', (data: any) => {
      if (data.issueId === id) {
        setComments(prev => [...prev, data.comment]);
        setHighlightId(data.comment.id);
        if (isAtBottom()) scrollToBottom();
        else setShowNewBtn(true);
        setTimeout(() => setHighlightId(null), 2000);
      }
    });
    socket.on('issue:comment:deleted', (data: any) => {
      if (data.issueId === id) {
        setComments(prev => prev.filter(c => c.id !== data.commentId));
      }
    });
    return () => { 
      socket.off('issue:comment:created');
      socket.off('issue:comment:deleted');
    };
  }, [id]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  
    // Cloudinary is always ready - backend handles authentication
  useEffect(() => {
    setIsCloudinaryReady(true);
  }, []);

  const checkCloudinaryAuth = async () => {
    setIsCloudinaryReady(true); // Always ready since backend handles it
  };

  // Handler for Cloudinary (no login needed)
  const handleCloudinarySetup = async () => {
    setIsCloudinaryReady(true);
    message.success('Cloudinary đã sẵn sàng!');
  };

  // Handler download tất cả file
  const handleDownloadAll = async () => {
    if (!issue?.attachments || issue.attachments.length === 0) return;
    
    message.loading('Đang chuẩn bị tải file...', 0);
    
    for (const file of issue.attachments) {
      try {
        await handleDownload(file);
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay giữa các file
      } catch (error) {
        console.error('Error downloading file:', file.originalname);
      }
    }
    
    message.destroy();
    message.success('Đã tải xong tất cả file!');
  };

  const fetchIssue = async () => {
    try {
      const res = await axiosInstance.get(`/issues/${id}`);
      setIssue(res.data);
    } catch (error) {
      message.error('Không thể tải thông tin issue!');
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/issues/${id}/comments`);
      console.log('Fetched comments:', res.data);
      setComments(res.data);
      setTimeout(scrollToBottom, 200);
    } catch (error) {
      message.error('Không thể tải bình luận!');
    } finally {
      setLoading(false);
    }
  };

  // Handler gửi comment
  const handleSend = async () => {
    if (!comment.trim() && (!fileList || fileList.length === 0)) {
      message.warning('Vui lòng nhập nội dung hoặc chọn file đính kèm');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('content', comment || '');
      formData.append('issueId', id || '');

              // Thêm tất cả file vào formData (backend handles Cloudinary automatically)
      if (fileList && fileList.length > 0) {
        fileList.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('files', file.originFileObj);
          }
        });
      }

      const response = await axiosInstance.post(`/issues/${id}/comments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Backend returns comment object directly, not wrapped in success
      if (response.data) {
        message.success('Đã gửi bình luận thành công!');
        setComment('');
        setFileList([]);
        
        // Add comment to state immediately for realtime update
        setComments(prev => [...prev, response.data]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error: any) {
      console.error('Error sending comment:', error);
      message.error('Không thể gửi bình luận: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
    setShowNewBtn(false);
  };

  const isAtBottom = () => {
    if (!listRef.current) return true;
    return listRef.current.scrollHeight - listRef.current.scrollTop - listRef.current.clientHeight < 60;
  };

  const handleRemoveFile = (file: any) => {
    setFileList(list => list.filter(f => f.uid !== file.uid));
  };

  // Hàm lấy icon cho từng loại file
  const getFileIcon = (mimetype: string, filename: string) => {
    const iconStyle = { fontSize: 14 };
    
    if (mimetype.startsWith('image/')) {
      return <FileImageOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    }
    if (mimetype === 'application/pdf') {
      return <FilePdfOutlined style={{ ...iconStyle, color: '#cf1322' }} />;
    }
    if (mimetype.includes('word') || mimetype.includes('document')) {
      return <FileWordOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    }
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
      return <FileExcelOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    }
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('archive')) {
      return <FileZipOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
    }
    return <FileUnknownOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
  };

  // Hàm format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handler preview file
  const handlePreviewFile = async (fileData: any) => {
    try {
      // Xử lý cấu trúc file mới từ getAllFiles
      const file = fileData.file || fileData;
      console.log('Preview file data:', file);
      
      let fileUrl = '';
      
      // Ưu tiên data: URLs trước (cho screenshots và base64 files)
      if (file.url && file.url.startsWith('data:')) {
        console.log('Using data URL:', file.url);
        fileUrl = file.url;
      } else if (file.originFileObj) {
        // File từ upload component
        console.log('Using originFileObj URL');
        try {
          // Tạo blob URL với context bảo mật
          const blob = new Blob([file.originFileObj], { type: file.originFileObj.type });
          fileUrl = URL.createObjectURL(blob);
        } catch (error) {
          console.error('Error creating blob URL:', error);
          // Fallback: sử dụng data URL
          const reader = new FileReader();
          reader.onload = (e) => {
            fileUrl = e.target?.result as string;
          };
          reader.readAsDataURL(file.originFileObj);
        }
      } else if (file.url && file.url.includes('cloudinary.com')) {
        console.log('Using Cloudinary URL:', file.url);
        fileUrl = file.url;
      } else if (file.downloadUrl && file.downloadUrl.includes('cloudinary.com')) {
        console.log('Using Cloudinary download URL:', file.downloadUrl);
        fileUrl = file.downloadUrl;
      } else if (file.url && file.url.startsWith('http') && !file.url.includes('herokuapp.com')) {
        console.log('Using other cloud storage URL:', file.url);
        fileUrl = file.url;
      } else if (file.downloadUrl && file.downloadUrl.startsWith('http')) {
        console.log('Using other cloud storage download URL:', file.downloadUrl);
        fileUrl = file.downloadUrl;
      } else if (file.oneDriveId || file.cloudinaryId) {
        // Nếu có cloud storage ID nhưng không có URL, thông báo lỗi
        console.error('File has cloud storage ID but no URL available');
        message.error('File đã được lưu trên cloud storage nhưng không thể truy cập. Vui lòng thử lại sau.');
        return;
      } else if (file.url && file.url.startsWith('/uploads/')) {
        // File được lưu local, thử tải từ server
        console.log('Trying to load from server:', file.url);
        try {
          const response = await axiosInstance.get(file.url, {
            responseType: 'blob'
          });
          const blob = new Blob([response.data]);
          fileUrl = URL.createObjectURL(blob);
        } catch (serverError) {
          console.error('Server file not found:', serverError);
          throw new Error('File not found on server');
        }
      } else if (file.filename) {
        // Fallback: tải file từ server với filename
        console.log('Trying to load from server with filename:', `/uploads/${file.filename}`);
        try {
          const response = await axiosInstance.get(`/uploads/${file.filename}`, {
            responseType: 'blob'
          });
          const blob = new Blob([response.data]);
          fileUrl = URL.createObjectURL(blob);
        } catch (serverError) {
          console.error('Server file not found with filename:', serverError);
          throw new Error('File not found on server');
        }
      } else {
        console.error('No valid file URL found');
        message.error('Không tìm thấy đường dẫn file hợp lệ');
        return;
      }
      
      console.log('Final file URL:', fileUrl);
      console.log('File mimetype:', file.mimetype);
      
      // Sử dụng Google Docs Viewer cho tất cả file không phải ảnh (bao gồm Office files)
      if (!file.mimetype?.startsWith('image/')) {
        // Sử dụng Google Docs Viewer cho tất cả file không phải ảnh
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        console.log('Using Google Docs Viewer:', googleDocsUrl);
        setPreviewFile({
          ...file,
          url: googleDocsUrl
        });
      } else {
        console.log('Using direct image URL:', fileUrl);
        setPreviewFile({
          ...file,
          url: fileUrl
        });
      }
      
      setFilePreviewVisible(true);
    } catch (error) {
      console.error('Error previewing file:', error);
      console.error('File details:', fileData);
      message.error('Không thể xem trước file này');
    }
  };

  // Hàm xử lý preview ảnh
  const handlePreview = (file: any) => {
    handlePreviewFile(file);
  };

  // Hàm tải về file
  const handleDownload = async (file: any) => {
    try {
      const link = document.createElement('a');
      link.href = file.url || file.downloadUrl;
      link.download = file.originalname;
      link.target = '_blank';
      link.click();
      message.success('Đã tải file thành công!');
    } catch (error) {
      message.error('Không thể tải file!');
    }
  };

  // Handler xóa comment
  const handleDeleteComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    setCommentToDelete(comment);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setCommentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/issues/${id}/comments/${commentToDelete.id}`);
      message.success('Đã xóa bình luận thành công!');
      // Cập nhật state ngay lập tức
      setComments(prev => prev.filter(c => c.id !== commentToDelete.id));
    } catch (error: any) {
      message.error('Không thể xóa bình luận: ' + (error.response?.data?.error || error.message));
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setCommentToDelete(null);
    }
  };

  // Hiển thị thông tin OneDrive cho admin
  const showCloudinaryInfo = (file: any, cloudinaryPath: string) => {
    setSelectedCloudinaryFile({
      ...file,
      cloudinaryPath
    });
    setCloudinaryInfoVisible(true);
  };

  // Xuất bình luận ra PDF
  const exportCommentsToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      message.loading('Đang tạo PDF...', 0);
      
      // Tạo container tạm thời cho nội dung PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.style.background = '#ffffff';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Header
      const header = document.createElement('div');
      header.innerHTML = `
        <h1 style="color: #333; margin-bottom: 10px; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">
          Chi tiết Vấn đề: ${issue?.title || 'N/A'}
        </h1>
        <div style="margin-bottom: 20px; color: #666;">
          <p><strong>ID:</strong> ${issue?.id || 'N/A'}</p>
          <p><strong>Trạng thái:</strong> ${issue?.status || 'N/A'}</p>
          <p><strong>Mức độ ưu tiên:</strong> ${issue?.priority || 'N/A'}</p>
          <p><strong>Loại:</strong> ${issue?.type || 'N/A'}</p>
          <p><strong>Người tạo:</strong> ${issue?.createdBy?.name || issue?.createdBy?.username || 'N/A'}</p>
          <p><strong>Ngày tạo:</strong> ${dayjs(issue?.createdAt).format('DD/MM/YYYY HH:mm')}</p>
        </div>
        <h2 style="color: #333; margin-bottom: 15px;">Lịch sử Bình luận</h2>
      `;
      pdfContainer.appendChild(header);
      
      // Thêm từng bình luận
      comments.forEach((comment, index) => {
        const commentDiv = document.createElement('div');
        commentDiv.style.marginBottom = '20px';
        commentDiv.style.padding = '15px';
        commentDiv.style.border = '1px solid #e8e8e8';
        commentDiv.style.borderRadius = '8px';
        commentDiv.style.backgroundColor = comment.userId === userId ? '#f0f8ff' : '#fafafa';
        
        const attachments = comment.attachments && Array.isArray(comment.attachments) ? comment.attachments : [];
        
        commentDiv.innerHTML = `
          <div style="margin-bottom: 10px;">
            <span style="font-weight: bold; color: #333;">${comment.user?.name || comment.user?.username || 'Ẩn danh'}</span>
            ${comment.userId === userId ? '<span style="background: #1890ff; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 8px;">Bạn</span>' : ''}
            <span style="color: #999; font-size: 12px; margin-left: 10px;">${dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}</span>
          </div>
          <div style="color: #333; line-height: 1.6; margin-bottom: 10px;">${comment.content}</div>
          ${attachments.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong style="color: #666;">File đính kèm:</strong>
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${attachments.map((file: any) => `
                  <li style="color: #666; font-size: 12px;">
                    ${file.originalname || file.name} (${formatFileSize(file.size || 0)})
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        `;
        
        pdfContainer.appendChild(commentDiv);
      });
      
      document.body.appendChild(pdfContainer);
      
      // Tạo PDF
      const canvas = await html2canvas.default(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(pdfContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Tải xuống PDF
      const fileName = `issue-${issue?.id}-comments-${dayjs().format('YYYY-MM-DD-HH-mm')}.pdf`;
      pdf.save(fileName);
      
      message.destroy();
      message.success('Đã xuất PDF thành công!');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.destroy();
      message.error('Không thể xuất PDF!');
    }
  };

  // Thu thập tất cả file từ comments và issue
  const getAllFiles = () => {
    const allFiles: Array<{
      file: any;
      uploadedBy: string;
      uploadedAt: string;
      source: 'issue' | 'comment';
      commentId?: string;
      cloudinaryPath?: string;
    }> = [];

    // Thêm file từ issue
    if (issue?.attachments && Array.isArray(issue.attachments)) {
      issue.attachments.forEach((file: any) => {
        console.log('Issue attachment file:', file);
        const cloudinaryPath = file.oneDriveId ? 
          `minicde/issues/${issue.id}/${file.originalname} (ID: ${file.oneDriveId})` : 
          undefined;
        allFiles.push({
          file,
          uploadedBy: issue.createdBy?.name || issue.createdBy?.username || 'Ẩn danh',
          uploadedAt: issue.createdAt,
          source: 'issue',
          cloudinaryPath
        });
      });
    }

    // Thêm file từ comments
    if (comments && Array.isArray(comments)) {
      comments.forEach((comment: any) => {
        if (comment.attachments && Array.isArray(comment.attachments)) {
          comment.attachments.forEach((file: any) => {
            console.log('Comment attachment file:', file);
                    const cloudinaryPath = file.oneDriveId ? 
          `minicde/issues/${issue?.id}/comments/${comment.id}/${file.originalname} (ID: ${file.oneDriveId})` : 
          undefined;
        allFiles.push({
          file,
          uploadedBy: comment.user?.name || comment.user?.username || 'Ẩn danh',
          uploadedAt: comment.createdAt,
          source: 'comment',
          commentId: comment.id,
          cloudinaryPath
        });
          });
        }
      });
    }

    console.log('All collected files:', allFiles);
    console.log('Current user role:', userRole);
    console.log('Can delete issues:', canDeleteIssues);
    
    // Sắp xếp theo thời gian mới nhất
    return allFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  };

  // Handlers cho drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const isValidType = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|zip|rar)$/i.test(file.name);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      message.warning('Một số file không hợp lệ đã bị bỏ qua');
    }
    
    setFileList(prev => [...prev, ...validFiles.map(file => ({
      uid: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      originFileObj: file
    }))]);
  };

  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const customTheme = {
    dark: {
      bg: token.colorBgContainer,
      cardBg: token.colorBgElevated,
      border: token.colorBorder,
      text: token.colorText,
      textSecondary: token.colorTextSecondary,
      commentBg: token.colorBgContainer,
      myCommentBg: token.colorPrimaryBg,
      inputBg: token.colorBgContainer,
      highlightBg: token.colorPrimaryBg
    },
    light: {
      bg: token.colorBgContainer,
      cardBg: token.colorBgElevated,
      border: token.colorBorder,
      text: token.colorText,
      textSecondary: token.colorTextSecondary,
      commentBg: token.colorBgContainer,
      myCommentBg: token.colorPrimaryBg,
      inputBg: token.colorBgContainer,
      highlightBg: token.colorPrimaryBg
    }
  };
  
  const currentTheme = customTheme.dark; // Sử dụng theme từ Ant Design

  return (
    <div style={{ 
      background: currentTheme.bg, 
      minHeight: '100vh',
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 20px',
        background: currentTheme.cardBg,
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button 
            type="text" 
            onClick={() => navigate('/issues')}
            style={{ 
              fontSize: 14, 
              height: 32, 
              width: 32, 
              borderRadius: '50%', 
              color: currentTheme.text
            }}
          >
            ←
          </Button>
          <Title level={4} style={{ margin: 0, color: currentTheme.text }}>
            Chi tiết Vấn đề
          </Title>
        </div>
        
        <Space>
          <Button
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={() => {
              // Theme sẽ được quản lý bởi MainLayout
              // Không cần xử lý ở đây
            }}
            type="text"
            style={{ color: currentTheme.text }}
            disabled
          />
        </Space>
      </div>

      {/* Main content */}
      <div style={{ padding: '20px', height: 'calc(100vh - 64px)', overflow: 'auto' }}>
        {/* Cloudinary Status Alert */}
        {!isCloudinaryReady && (
          <div style={{ 
            marginBottom: 16,
            padding: 12,
            background: '#faad1420',
            border: '1px solid #faad14',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudOutlined style={{ color: '#faad14' }} />
              <span style={{ color: '#faad14', fontSize: 14 }}>
                Cloudinary chưa sẵn sàng. Kết nối Cloudinary để lưu trữ file đính kèm.
              </span>
            </div>
            <Button 
              size="small" 
              onClick={handleCloudinarySetup}
              style={{ 
                background: '#faad14',
                borderColor: '#faad14',
                color: '#fff'
              }}
            >
              Kết nối OneDrive
            </Button>
          </div>
        )}

        <Row gutter={[20, 20]}>
          <Col xs={24} lg={16}>
            {/* Card thông tin issue */}
            <Card 
              title={
                <Space>
                  <InfoCircleOutlined />
                  <span>Thông tin chi tiết</span>
                </Space>
              }
              bordered={false} 
              style={{ background: currentTheme.cardBg, marginBottom: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <Avatar 
                  style={{ backgroundColor: stringToColor(issue?.title || ''), marginRight: '10px' }}
                >
                  {issue?.title?.charAt(0) || 'I'}
                </Avatar>
                <Space>
                  <Title level={4} style={{ marginBottom: 0, color: currentTheme.text }}>
                    {issue?.title || ''}
                  </Title>
                  <Tag color="blue">{issue?.status || ''}</Tag>
                  <Tag color="purple">{issue?.priority || ''}</Tag>
                  <Tag color="green">{issue?.type || ''}</Tag>
                </Space>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <Text strong style={{ color: currentTheme.text }}>Mô tả:</Text>
                <p style={{ color: currentTheme.textSecondary, marginTop: 8 }}>
                  {issue?.description || 'Không có mô tả'}
                </p>
              </div>
              
              {/* Hiển thị attachments của issue */}
              {issue?.attachments && Array.isArray(issue.attachments) && issue.attachments.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <Text strong style={{ color: currentTheme.text }}>File đính kèm:</Text>
                  <div style={{ marginTop: 8 }}>
                    {issue.attachments.map((file: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: currentTheme.commentBg,
                          borderRadius: '6px',
                          marginBottom: '8px',
                          border: `1px solid ${currentTheme.border}`
                        }}
                      >
                        <div style={{ marginRight: '12px' }}>
                          {getFileIcon(file.type, file.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            color: currentTheme.text, 
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {file.name}
                          </div>
                          <div style={{ 
                            color: currentTheme.textSecondary, 
                            fontSize: '12px',
                            marginTop: '2px'
                          }}>
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                        <Space>
                          <Tooltip title="Xem trước">
                            <Button
                              type="text"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => handlePreview(file)}
                              style={{ color: currentTheme.textSecondary }}
                            />
                          </Tooltip>
                          <Tooltip title="Tải xuống">
                            <Button
                              type="text"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownload(file)}
                              style={{ color: currentTheme.textSecondary }}
                            />
                          </Tooltip>
                        </Space>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            

            {/* Card Bình luận */}
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Space>
                    <MessageOutlined />
                    <span>Bình luận ({comments.length})</span>
                  </Space>
                  {comments.length > 0 && (
                    <Button
                      size="small"
                      icon={<FilePdfOutlined />}
                      onClick={() => exportCommentsToPDF()}
                      title="Xuất bình luận ra PDF"
                    >
                      Xuất PDF
                    </Button>
                  )}
                </div>
              }
              bordered={false} 
              style={{ 
                background: currentTheme.cardBg, 
                marginBottom: '20px',
                height: '600px',
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 0
              }}
            >
              {/* Khung hiển thị bình luận */}
              <div 
                ref={listRef}
                style={{ 
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  borderBottom: `1px solid ${currentTheme.border}`,
                  maxHeight: '400px'
                }}
              >
                {comments.length === 0 && !loading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 40, 
                    color: currentTheme.textSecondary 
                  }}>
                    <MessageOutlined style={{ 
                      fontSize: 48, 
                      marginBottom: 16, 
                      color: currentTheme.textSecondary 
                    }} />
                    <div style={{ color: currentTheme.text }}>
                      Chưa có bình luận nào
                    </div>
                    <Text style={{ color: currentTheme.textSecondary }}>
                      Hãy là người đầu tiên bình luận!
                    </Text>
                  </div>
                ) : (
                  <List
                    dataSource={comments}
                    loading={loading}
                    renderItem={comment => {
                      const isMine = comment.userId === userId;
                      return (
                        <List.Item
                          key={comment.id}
                          style={{
                            background: isMine ? currentTheme.myCommentBg : currentTheme.commentBg,
                            marginBottom: '10px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: `1px solid ${currentTheme.border}`,
                            alignItems: 'flex-start'
                          }}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                style={{ 
                                  backgroundColor: stringToColor(comment.user?.name || comment.user?.username || '?')
                                }}
                              >
                                {comment.user?.name?.charAt(0) || comment.user?.username?.charAt(0) || '?'}
                              </Avatar>
                            }
                            title={
                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Space>
                                  <Text strong style={{ color: currentTheme.text }}>
                                    {comment.user?.name || comment.user?.username || 'Ẩn danh'}
                                  </Text>
                                  {isMine && (
                                    <Tag 
                                      color={isDarkMode ? '#1f2937' : '#dbeafe'}
                                      style={{ 
                                        fontSize: 11,
                                        border: `1px solid ${isDarkMode ? '#374151' : '#93c5fd'}`,
                                        color: isDarkMode ? '#60a5fa' : '#2563eb'
                                      }}
                                    >
                                      Bạn
                                    </Tag>
                                  )}
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {dayjs(comment.createdAt).fromNow()}
                                  </Text>
                                </Space>
                                
                                {/* Nút xóa comment cho người có quyền xóa issues hoặc người tạo */}
                                {(canDeleteIssues || isMine) && (
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteComment(comment.id)}
                                    style={{ 
                                      color: isDarkMode ? '#ef4444' : '#dc2626',
                                      padding: '2px 6px'
                                    }}
                                    title="Xóa bình luận"
                                  />
                                )}
                              </Space>
                            }
                            description={
                              <div style={{ marginTop: 8 }}>
                                <div style={{ 
                                  fontSize: 14, 
                                  lineHeight: 1.6, 
                                  color: currentTheme.text,
                                  marginBottom: comment.attachments?.length > 0 ? 12 : 0
                                }}>
                                  {comment.content}
                                </div>
                                
                                {/* Hiển thị file đính kèm */}
                                {comment.attachments && Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                                  // Debug: console.log('Attachments:', comment.attachments);
                                  <div style={{ 
                                    marginTop: 8,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6
                                  }}>
                                    {comment.attachments.map((file: any, idx: number) => (
                                      <Tooltip 
                                        key={idx} 
                                        title={
                                          <div>
                                            <div>{file.originalname}</div>
                                            <div>{formatFileSize(file.size)}</div>
                                          </div>
                                        }
                                      >
                                        <div
                                          onClick={() => handlePreviewFile(file)}
                                                                                             style={{
                                                     display: 'inline-flex',
                                                     alignItems: 'center',
                                                     gap: 6,
                                                     padding: '4px 8px',
                                                     background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                                     borderRadius: 4,
                                                     border: `1px solid ${currentTheme.border}`,
                                                     cursor: 'pointer',
                                                     fontSize: 12,
                                                     transition: 'all 0.2s'
                                                   }}
                                                   onMouseEnter={(e) => {
                                                     e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
                                                   }}
                                                   onMouseLeave={(e) => {
                                                     e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
                                                   }}
                                        >
                                          {getFileIcon(file.mimetype, file.originalname)}
                                          <span style={{ 
                                            color: currentTheme.text,
                                            maxWidth: 120,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {file.originalname}
                                          </span>
                                        </div>
                                      </Tooltip>
                                    ))}
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
                
                {showNewBtn && (
                  <Button 
                    icon={<ArrowDownOutlined />} 
                    type="primary" 
                    size="small" 
                    style={{ 
                      position: 'absolute', 
                      right: 20, 
                      bottom: 100, 
                      zIndex: 10,
                      borderRadius: 20,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }} 
                    onClick={scrollToBottom}
                  >
                    Xem bình luận mới
                  </Button>
                )}
              </div>
              
              {/* Form nhập bình luận - Updated to match task card style */}
              <div 
                style={{
                  borderTop: isDarkMode ? '1px solid #222' : '1px solid #f0f0f0',
                  background: isDarkMode ? '#18191c' : '#fff',
                  padding: 12,
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 2
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)',
                    border: `2px dashed ${isDarkMode ? '#40a9ff' : '#1890ff'}`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                      <p style={{ margin: '8px 0', color: currentTheme.text }}>
                        Thả file vào đây để tải lên
                      </p>
                      <p style={{ fontSize: 12, color: currentTheme.textSecondary }}>
                        Hỗ trợ: Ảnh, PDF, Word, Excel, Zip (tối đa 5MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Cloudinary Status */}
                {!isCloudinaryReady && (
                  <div style={{
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 173, 20, 0.05)',
                    border: `1px solid ${isDarkMode ? '#faad14' : '#ffc53d'}`,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12
                  }}>
                    <CloudOutlined style={{ color: '#faad14' }} />
                    <span style={{ color: currentTheme.text, flex: 1 }}>
                      Kết nối OneDrive để lưu trữ file
                    </span>
                    <Button 
                      size="small" 
                      onClick={handleCloudinarySetup}
                      style={{ fontSize: 12 }}
                    >
                      Kết nối
                    </Button>
                  </div>
                )}

                {/* File đã chọn */}
                {fileList.length > 0 && (
                  <div style={{ 
                    marginBottom: 12,
                    padding: 8,
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 8,
                    border: `1px solid ${currentTheme.border}`
                  }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 8
                    }}>
                      {fileList.map((file: any) => (
                        <div
                          key={file.uid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 10px',
                            background: currentTheme.commentBg,
                            borderRadius: 6,
                            border: `1px solid ${currentTheme.border}`,
                            position: 'relative'
                          }}
                        >
                          {/* Thumbnail preview */}
                          {file.type?.startsWith('image/') && file.originFileObj ? (
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 4,
                              overflow: 'hidden',
                              flexShrink: 0
                            }}>
                              <img 
                                src={(() => {
                                  try {
                                    const blob = new Blob([file.originFileObj], { type: file.originFileObj.type });
                                    return URL.createObjectURL(blob);
                                  } catch (error) {
                                    // Fallback to data URL
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file.originFileObj);
                                    return '';
                                  }
                                })()} 
                                alt=""
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }}
                              />
                            </div>
                          ) : (
                            <div style={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                              borderRadius: 4,
                              flexShrink: 0
                            }}>
                              {getFileIcon(file.type || '', file.name)}
                            </div>
                          )}
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 12, 
                              color: currentTheme.text,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {file.name}
                            </div>
                            <div style={{
                              fontSize: 10,
                              color: currentTheme.textSecondary
                            }}>
                              {formatFileSize(file.size || 0)}
                            </div>
                          </div>
                          
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveFile(file)}
                            style={{ 
                              color: '#ff4d4f',
                              padding: '2px 4px'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comment input - Updated to match task card style */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <TextArea
                    ref={inputRef}
                    placeholder="Nhập bình luận..."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    style={{ 
                      flex: 1,
                      background: isDarkMode ? '#232428' : '#fff', 
                      color: isDarkMode ? '#fff' : '#222', 
                      borderColor: isDarkMode ? '#333' : undefined,
                      borderRadius: 8
                    }}
                  />
                  
                  <Upload
                    multiple
                    fileList={[]}
                    beforeUpload={(file) => {
                      if (fileList.length >= 5) {
                        message.warning('Chỉ được đính kèm tối đa 5 file!');
                        return false;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        message.error('File không được vượt quá 5MB!');
                        return false;
                      }
                      setFileList(prev => [...prev, {
                        uid: Date.now() + Math.random(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        originFileObj: file
                      }]);
                      return false;
                    }}
                    showUploadList={false}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                  >
                    <Tooltip title="Đính kèm file">
                      <Button 
                        icon={<PaperClipOutlined />} 
                        style={{ 
                          borderColor: currentTheme.border,
                          color: currentTheme.text
                        }}
                      />
                    </Tooltip>
                  </Upload>
                
                  <Button 
                    type="primary"
                    onClick={handleSend}
                    loading={submitting || uploadingToCloudinary}
                    disabled={!comment.trim() && fileList.length === 0}
                    style={{ 
                      background: isDarkMode ? '#223355' : undefined, 
                      color: isDarkMode ? '#fff' : undefined, 
                      border: isDarkMode ? 'none' : undefined
                    }}
                  >
                    Gửi bình luận
                  </Button>
                </div>
              </div>
            </Card>

            {/* Bảng tất cả file đính kèm */}
            <Card 
              title={
                <Space>
                  <PaperClipOutlined />
                  <span>Tất cả file đính kèm ({getAllFiles().length})</span>
                </Space>
              }
              bordered={false} 
              style={{ 
                background: currentTheme.cardBg, 
                marginBottom: '20px',
                height: '400px',
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{
                flex: 1,
                padding: 0,
                overflow: 'hidden'
              }}
            >
              {getAllFiles().length > 0 ? (
                <div style={{ 
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <List
                    dataSource={getAllFiles()}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          padding: '12px 16px',
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: 8,
                          marginBottom: 8,
                          background: currentTheme.commentBg,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = currentTheme.highlightBg;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = currentTheme.commentBg;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={() => handlePreviewFile(item.file)}
                      >
                        <List.Item.Meta
                          avatar={
                            <div style={{
                              width: 48,
                              height: 48,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                              borderRadius: 6,
                              border: `1px solid ${currentTheme.border}`
                            }}>
                              {item.file.mimetype?.startsWith('image/') ? (
                                <img 
                                  src={item.file.url} 
                                  alt={item.file.originalname}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    borderRadius: 4
                                  }}
                                />
                              ) : (
                                getFileIcon(item.file.mimetype || '', item.file.originalname || item.file.name)
                              )}
                            </div>
                          }
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text 
                                strong 
                                style={{ 
                                  color: currentTheme.text,
                                  fontSize: 14,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '200px'
                                }}
                              >
                                {item.file.originalname || item.file.name}
                              </Text>
                              <Space size="small">
                                <Tag 
                                  color={item.source === 'issue' ? 'blue' : 'green'}
                                >
                                  {item.source === 'issue' ? 'Issue' : 'Comment'}
                                </Tag>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<CloudOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showCloudinaryInfo(item.file, item.cloudinaryPath || '');
                                  }}
                                  title="Xem thông tin file"
                                />
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DownloadOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(item.file);
                                  }}
                                  title="Tải xuống"
                                />
                              </Space>
                            </div>
                          }
                          description={
                            <div style={{ marginTop: 4 }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 12,
                                color: currentTheme.textSecondary
                              }}>
                                <Space size="small">
                                  <span>📤 {item.uploadedBy}</span>
                                  <span>📅 {dayjs(item.uploadedAt).format('DD/MM/YYYY HH:mm')}</span>
                                </Space>
                                <span>{formatFileSize(item.file.size || 0)}</span>
                              </div>
                              {item.cloudinaryPath && (
                                <div style={{ 
                                  marginTop: 4,
                                  fontSize: 11,
                                  color: isDarkMode ? '#52c41a' : '#52c41a',
                                  background: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.1)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  display: 'inline-block'
                                }}>
                                  ☁️ Cloudinary
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40,
                  color: currentTheme.textSecondary
                }}>
                  <PaperClipOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>Chưa có file đính kèm nào</p>
                </div>
              )}
            </Card>
          </Col>
          
          <Col span={8}>
            <Card 
              title="Thông tin issue" 
              bordered={false} 
              style={{ background: currentTheme.cardBg, marginBottom: '20px' }}
            >
              <List
                dataSource={[
                  { label: 'ID', value: issue?.id || '' },
                  { label: 'Trạng thái', value: issue?.status || '' },
                  { label: 'Mức độ ưu tiên', value: issue?.priority || '' },
                  { label: 'Loại', value: issue?.type || '' },
                  { label: 'Người tạo', value: issue?.user?.username || '' },
                  { label: 'Ngày tạo', value: dayjs(issue?.createdAt).format('DD/MM/YYYY HH:mm') },
                  { label: 'Người phụ trách', value: issue?.assignee?.username || '' },
                  { label: 'Ngày phụ trách', value: dayjs(issue?.assigneeAt).format('DD/MM/YYYY HH:mm') },
                  { label: 'Ngày hoàn thành', value: dayjs(issue?.completedAt).format('DD/MM/YYYY HH:mm') },
                  { label: 'Ngày kết thúc', value: dayjs(issue?.closedAt).format('DD/MM/YYYY HH:mm') },
                ]}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <span style={{ color: currentTheme.textSecondary }}>{item.label}:</span>
                      <span>{item.value}</span>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={null}
          width="90%"
          style={{ top: 20 }}
          bodyStyle={{ 
            padding: 0,
            background: isDarkMode ? '#1e1e1e' : '#fff'
          }}
        >
          <img
            src={previewImage}
            alt={previewTitle}
            style={{ 
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
          />
        </Modal>

        <FilePreviewModal
          visible={filePreviewVisible}
          file={previewFile}
          onClose={() => setFilePreviewVisible(false)}
          isDarkMode={isDarkMode}
        />

        {/* Modal thông tin file */}
        <Modal
          title={
            <Space>
              <CloudOutlined />
              <span>Thông tin chi tiết file</span>
            </Space>
          }
          open={cloudinaryInfoVisible}
          onCancel={() => setCloudinaryInfoVisible(false)}
          footer={[
            <Button key="close" onClick={() => setCloudinaryInfoVisible(false)}>
              Đóng
            </Button>
          ]}
          width={700}
        >
          {selectedCloudinaryFile && (
            <div>
              <Alert
                message="Thông tin file"
                description="Thông tin chi tiết về file và đường dẫn chia sẻ."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <List
                dataSource={[
                  { label: 'Tên file', value: selectedCloudinaryFile.originalname || selectedCloudinaryFile.name },
                  { label: 'Loại file', value: selectedCloudinaryFile.mimetype || 'N/A' },
                  { label: 'Kích thước', value: formatFileSize(selectedCloudinaryFile.size || 0) },
                  { label: 'Đường dẫn chia sẻ', value: (() => {
                    const shareUrl = selectedCloudinaryFile.url || selectedCloudinaryFile.downloadUrl || selectedCloudinaryFile.shareUrl;
                    if (shareUrl) {
                      return (
                        <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                            {shareUrl}
                          </a>
                        </div>
                      );
                    }
                    return 'Không có đường dẫn chia sẻ';
                  })() },
                  { label: 'Cloudinary ID', value: selectedCloudinaryFile.cloudinaryId || 'N/A' },
                  { label: 'Quyền truy cập', value: 'Công khai - Tất cả mọi người có thể xem và tải xuống' }
                ]}
                renderItem={item => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: currentTheme.text,
                        marginBottom: 4
                      }}>
                        {item.label}:
                      </div>
                      <div style={{ 
                        color: currentTheme.textSecondary,
                        wordBreak: 'break-all',
                        fontSize: 13,
                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: `1px solid ${currentTheme.border}`
                      }}>
                        {item.value}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa bình luận"
          content="Bạn có chắc chắn muốn xóa bình luận này"
          itemName={commentToDelete?.content ? commentToDelete.content.substring(0, 50) + '...' : 'này'}
          loading={deleteLoading}
          size="medium"
        />
      </div>
    </div>
  );
};

export default IssueDetail;