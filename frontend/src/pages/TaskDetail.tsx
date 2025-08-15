import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, Card, Tabs, Button, Space, Tag, Descriptions, 
  Table, Modal, Form, Input, Select, Spin, Popconfirm, message,
  Timeline, Avatar, List, DatePicker, Drawer, Divider, Row, Col
} from 'antd';
import { Comment } from '@ant-design/compatible';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  UserOutlined, FileOutlined, SendOutlined,
  ClockCircleOutlined, CloseOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { 
  fetchTaskById, updateTask, deleteTask, 
  addComment, addDocumentToTask, removeDocumentFromTask 
} from '../store/slices/taskSlice';
import { fetchDocuments } from '../store/slices/documentSlice';
import { RootState } from '../store';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import { useResponsive } from '../hooks/useResponsive';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import FloatingActionButton from '../components/FloatingActionButton';
import axiosInstance from '../axiosConfig';
import { config } from '../config/environment';
import '../styles/task-detail-responsive.css';
import '../styles/task-detail-mobile-optimization.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/task-mobile-form-optimization.css';
import '../styles/mobile-task-form-final.css';
import '../styles/task-form-mobile-optimization.css';
import '../styles/task-form-specific-optimization.css';
import '../styles/mobile-task-buttons-optimization.css';
import '../styles/mobile-icon-standardization.css';
import '../styles/tasks-mobile-tablet-optimization.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Helper function to safely get array data
const getSafeArray = (data: any, key: string): any[] => {
  if (!data || typeof data !== 'object') return [];
  const value = data[key];
  return Array.isArray(value) ? value : [];
};

// Helper function to safely get nested object
const getSafeObject = (data: any, key: string): any => {
  if (!data || typeof data !== 'object') return null;
  const value = data[key];
  return value && typeof value === 'object' ? value : null;
};

const TaskDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isMobile } = useResponsive();
  
  const { currentTask, isLoading, error } = useSelector((state: RootState) => state.tasks);
  const { documents } = useSelector((state: RootState) => state.documents);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isAddDocumentModalVisible, setIsAddDocumentModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [commentValue, setCommentValue] = useState<string>('');
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Fetch task data
  useEffect(() => {
    if (id) {
      console.log('Fetching task with ID:', id);
      const fetchTask = async () => {
        try {
          await dispatch(fetchTaskById(id) as any);
        } catch (error) {
          console.error('Failed to fetch task:', error);
        }
      };
      fetchTask();
    }
  }, [dispatch, id]);

  // Fetch projects and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await axiosInstance.get('/projects');
        setProjects(projectsResponse.data);

        // Fetch users
        const usersResponse = await axiosInstance.get('/users/all');
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Don't show error for these optional data fetches
      }
    };

    fetchData();
  }, []);
  
  // Set form values when task data is loaded
  useEffect(() => {
    if (currentTask) {
      console.log('Task data loaded:', currentTask);
      try {
        form.setFieldsValue({
          title: currentTask.title || '',
          description: currentTask.description || '',
          status: currentTask.status || 'PENDING',
          priority: currentTask.priority || 'MEDIUM',
          assigneeId: currentTask.assigneeId || undefined,
          projectId: currentTask.projectId || undefined,
          category: currentTask.category || 'OTHER',
          startDate: currentTask.startDate ? dayjs(currentTask.startDate) : undefined,
          dueDate: currentTask.dueDate ? dayjs(currentTask.dueDate) : undefined
        });
        
        // Fetch project documents for document selection
        if (currentTask.projectId) {
          dispatch(fetchDocuments(currentTask.projectId) as any);
        }
      } catch (error) {
        console.error('Error setting form values:', error);
      }
    }
  }, [currentTask, form, dispatch]);
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải thông tin nhiệm vụ...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Lỗi khi tải dữ liệu</h3>
        <p style={{ color: '#ff4d4f', marginBottom: '16px' }}>{error}</p>
        <div style={{ marginBottom: '16px' }}>
          <p>Mã nhiệm vụ: {id}</p>
          <p>URL API: {config.API_URL}/tasks/{id}</p>
        </div>
        <Space>
          <Button 
            type="primary" 
            onClick={() => {
              if (id) {
                dispatch(fetchTaskById(id) as any);
              }
            }}
          >
            Thử lại
          </Button>
          <Button onClick={() => navigate('/tasks')}>
            Quay lại danh sách
          </Button>
        </Space>
      </div>
    );
  }
  
  if (!currentTask) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>{t('tasks.notFound')}</h3>
        <p style={{ marginBottom: '16px' }}>Không tìm thấy nhiệm vụ với mã: {id}</p>
        <Button onClick={() => navigate('/tasks')}>Quay lại danh sách</Button>
      </div>
    );
  }
  
  // Handle task update
  const handleUpdateTask = async (values: any) => {
    if (id) {
      // Format dates
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
        category: values.category || 'OTHER'
      };
      
      await dispatch(updateTask({ id, data: formattedValues }) as any);
      setIsEditModalVisible(false);
      message.success(t('tasks.updateSuccess'));
    }
  };
  
  // Handle task delete
  const handleDeleteTask = async () => {
    if (id) {
      await dispatch(deleteTask(id) as any);
      navigate('/tasks');
      message.success(t('tasks.deleteSuccess'));
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
  };
  
  // Handle comment submit
  const handleCommentSubmit = async () => {
    if (commentValue.trim() && id) {
      await dispatch(addComment({ taskId: id, content: commentValue.trim() }) as any);
      setCommentValue('');
      message.success(t('tasks.commentAdded'));
    }
  };
  
  // Handle add document to task
  const handleAddDocument = async (values: { documentId: string }) => {
    if (id) {
      await dispatch(addDocumentToTask({ taskId: id, documentId: values.documentId }) as any);
      setIsAddDocumentModalVisible(false);
      message.success(t('tasks.documentAdded'));
    }
  };
  
  // Handle remove document from task
  const handleRemoveDocument = async (documentId: string) => {
    if (id) {
      await dispatch(removeDocumentFromTask({ taskId: id, documentId }) as any);
      message.success(t('tasks.documentRemoved'));
    }
  };

  // Handle close form and return to main screen
  const handleCloseForm = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  // Handle back to tasks list
  const handleBackToTasks = () => {
    navigate('/tasks');
  };
  
  // Task status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'default';
      case 'IN_PROGRESS':
        return 'processing';
      case 'REVIEW':
        return 'warning';
      case 'DONE':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Task priority tag color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'blue';
      case 'MEDIUM':
        return 'orange';
      case 'HIGH':
        return 'red';
      default:
        return 'default';
    }
  };

  // Mobile Task Info Card Component
  const MobileTaskInfoCard = () => (
    <Card className="mobile-task-info-card" style={{ marginBottom: 16 }}>
      <div className="mobile-task-header">
        <div className="mobile-task-title-section">
          <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
            {currentTask.title || 'Không có tiêu đề'}
          </Title>
          <div className="mobile-task-tags">
            <Tag color={getStatusColor(currentTask.status || 'PENDING')} style={{ fontSize: '10px' }}>
              {currentTask.status || 'PENDING'}
            </Tag>
            <Tag color={getPriorityColor(currentTask.priority || 'MEDIUM')} style={{ fontSize: '10px' }}>
              {currentTask.priority || 'MEDIUM'}
            </Tag>
          </div>
        </div>
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      
      <div className="mobile-task-details">
        <div className="mobile-task-detail-item">
          <Text strong style={{ fontSize: '12px' }}>Người thực hiện:</Text>
          <Text style={{ fontSize: '12px' }}>
            {getSafeObject(currentTask, 'assignee')?.name || t('tasks.unassigned')}
          </Text>
        </div>
        
        <div className="mobile-task-detail-item">
          <Text strong style={{ fontSize: '12px' }}>Hạn hoàn thành:</Text>
          <Text style={{ fontSize: '12px' }}>
            {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : t('tasks.noDueDate')}
          </Text>
        </div>
        
        <div className="mobile-task-detail-item">
          <Text strong style={{ fontSize: '12px' }}>Người tạo:</Text>
          <Text style={{ fontSize: '12px' }}>
            {getSafeObject(currentTask, 'createdBy')?.name || '-'}
          </Text>
        </div>
        
        <div className="mobile-task-detail-item">
          <Text strong style={{ fontSize: '12px' }}>Ngày tạo:</Text>
          <Text style={{ fontSize: '12px' }}>
            {currentTask.createdAt ? new Date(currentTask.createdAt).toLocaleDateString() : '-'}
          </Text>
        </div>
        
        {currentTask.description && (
          <div className="mobile-task-detail-item">
            <Text strong style={{ fontSize: '12px' }}>Mô tả:</Text>
            <Text style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
              {currentTask.description}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );

  // Mobile Action Buttons Component - Optimized
  const MobileActionButtons = () => (
    <Card className="mobile-action-buttons-card" style={{ marginBottom: 16 }}>
      <div className="mobile-actions-grid" style={{ display: 'flex', gap: 12 }}>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => setIsEditModalVisible(true)}
          size="large"
          style={{ flex: 1 }}
          className="mobile-action-button"
        >
          {t('common.edit')}
        </Button>
        
        <Button 
          danger 
          icon={<DeleteOutlined />}
          size="large"
          style={{ flex: 1 }}
          className="mobile-action-button"
          onClick={handleDeleteConfirm}
        >
          {t('common.delete')}
        </Button>
      </div>
    </Card>
  );
  
  // Tab items - only create if currentTask exists
  const items: TabsProps['items'] = currentTask ? [
    {
      key: 'overview',
      label: t('tasks.tabs.overview'),
      children: isMobile ? (
        <div className="mobile-task-overview">
          <MobileTaskInfoCard />
          <MobileActionButtons />
        </div>
      ) : (
        <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
          <Descriptions.Item label={t('tasks.title')}>{currentTask.title || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('tasks.status')}>
            <Tag color={getStatusColor(currentTask.status || 'PENDING')}>{currentTask.status || 'PENDING'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('tasks.priority')}>
            <Tag color={getPriorityColor(currentTask.priority || 'MEDIUM')}>{currentTask.priority || 'MEDIUM'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('tasks.assignee')}>
            {getSafeObject(currentTask, 'assignee')?.name || t('tasks.unassigned')}
          </Descriptions.Item>
          <Descriptions.Item label={t('tasks.dueDate')}>
            {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : t('tasks.noDueDate')}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.createdBy')}>
            {getSafeObject(currentTask, 'createdBy')?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.createdAt')}>
            {currentTask.createdAt ? new Date(currentTask.createdAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.updatedAt')}>
            {currentTask.updatedAt ? new Date(currentTask.updatedAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('tasks.description')} span={4}>
            {currentTask.description || t('common.noDescription')}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'documents',
      label: t('tasks.tabs.documents'),
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsAddDocumentModalVisible(true)}
              size={isMobile ? "large" : "middle"}
              block={isMobile}
            >
              {t('tasks.addDocument')}
            </Button>
          </div>
          <Table 
            dataSource={getSafeArray(currentTask, 'documents')} 
            rowKey="id"
            size={isMobile ? "small" : "middle"}
            scroll={isMobile ? { x: 300 } : undefined}
            columns={[
              {
                title: t('documents.name'),
                dataIndex: ['document', 'name'],
                key: 'name',
                width: isMobile ? 120 : undefined,
              },
              {
                title: t('documents.version'),
                dataIndex: ['document', 'version'],
                key: 'version',
                width: isMobile ? 80 : undefined,
                render: (version) => `v${version}`,
              },
              {
                title: t('documents.fileType'),
                dataIndex: ['document', 'fileType'],
                key: 'fileType',
                width: isMobile ? 80 : undefined,
              },
              {
                title: t('common.actions'),
                key: 'actions',
                width: isMobile ? 100 : undefined,
                render: (_, record) => (
                  <Space size={isMobile ? "small" : "middle"}>
                    <Button 
                      size={isMobile ? "small" : "middle"}
                      icon={<FileOutlined />}
                      onClick={() => navigate(`/documents/${record.documentId}`)}
                    />
                    <Popconfirm
                      title={t('tasks.confirmRemoveDocument')}
                      onConfirm={() => handleRemoveDocument(record.documentId)}
                      okText={t('common.yes')}
                      cancelText={t('common.no')}
                    >
                      <Button size={isMobile ? "small" : "middle"} danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      key: 'comments',
      label: t('tasks.tabs.comments'),
      children: (
        <>
          <List
            className="comment-list"
            itemLayout="horizontal"
            dataSource={getSafeArray(currentTask, 'comments')}
            renderItem={(comment) => (
              <li>
                <Comment
                  author={getSafeObject(comment, 'user')?.name}
                  avatar={<Avatar icon={<UserOutlined />} />}
                  content={<p>{comment.content}</p>}
                  datetime={new Date(comment.createdAt).toLocaleString()}
                />
              </li>
            )}
          />
          <div style={{ marginTop: 16 }}>
            <TextArea 
              rows={4} 
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              placeholder={t('tasks.addComment')}
              style={{ marginBottom: 8 }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleCommentSubmit}
              disabled={!commentValue.trim()}
              size={isMobile ? "large" : "middle"}
              block={isMobile}
            >
              {t('common.send')}
            </Button>
          </div>
        </>
      ),
    },
    {
      key: 'history',
      label: t('tasks.tabs.history'),
      children: (
        <Timeline
          mode="left"
          items={
            getSafeArray(currentTask, 'history').map((h) => ({
              label: new Date(h.createdAt).toLocaleString(),
                                children: (
                    <div>
                      <Paragraph>
                        <Text strong>{getSafeObject(h, 'user')?.name || '-'}</Text>
                      </Paragraph>
                      <Paragraph>
                        <Text>{h.action}: {h.details}</Text>
                      </Paragraph>
                    </div>
                  ),
              dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />
            }))
          }
        />
      ),
    },
  ] : [];
  
  return (
    <div className={isMobile ? "mobile-task-detail-container" : ""}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="mobile-task-detail-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 16
        }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            type="text" 
            onClick={handleBackToTasks}
            style={{ fontSize: '16px' }}
          />
          <Title level={4} style={{ margin: 0, fontSize: '16px' }}>
            Chi tiết nhiệm vụ
          </Title>
          <div style={{ width: 32 }} /> {/* Spacer for centering */}
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && currentTask && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>{currentTask.title}</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => setIsEditModalVisible(true)}
            >
              {t('common.edit')}
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </Button>
          </Space>
        </div>
      )}
      
      {currentTask && (
        <Card>
          <Tabs defaultActiveKey="overview" items={items} />
        </Card>
      )}
      
      {/* Edit Task Modal (Desktop) / Drawer (Mobile) */}
      {isMobile ? (
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Sửa nhiệm vụ</span>
              <Button 
                icon={<CloseOutlined />} 
                type="text" 
                onClick={handleCloseForm}
                size="small"
                style={{ fontSize: '16px' }}
              />
            </div>
          }
          placement="bottom"
          height="90vh"
          open={isEditModalVisible}
          onClose={handleCloseForm}
          className="mobile-task-edit-drawer"
          styles={{
            header: { 
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              background: '#fafafa',
              minHeight: '48px'
            },
            body: { 
              padding: '8px 12px',
              paddingBottom: '16px'
            }
          }}
        >
          <div style={{ 
            maxHeight: 'calc(90vh - 80px)', 
            overflowY: 'auto',
            paddingBottom: '16px'
          }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateTask}
              size="middle"
              style={{ padding: '0' }}
              className="task-detail-form"
            >
              {/* Thông tin cơ bản - Tối ưu cho mobile */}
              <div className="form-section section-basic">
                <div className="form-section-header">
                  📋 Thông tin cơ bản
                </div>
                <div className="form-section-content">
                  <Form.Item
                    name="title"
                    label="Tên nhiệm vụ *"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
                  >
                    <Input 
                      placeholder="Nhập tên nhiệm vụ..." 
                      style={{ fontSize: '13px' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="description"
                    label="Mô tả"
                  >
                    <Input.TextArea 
                      rows={2} 
                      placeholder="Nhập mô tả chi tiết nhiệm vụ..."
                      style={{ fontSize: '13px' }}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Dự án và người thực hiện - Gộp lại */}
              <div className="form-section section-project">
                <div className="form-section-header">
                  🏗️ Dự án & Phân công
                </div>
                <div className="form-section-content">
                  <Form.Item
                    name="projectId"
                    label="Dự án *"
                    rules={[{ required: true, message: 'Vui lòng chọn dự án!' }]}
                  >
                    <Select 
                      placeholder="Chọn dự án"
                      style={{ fontSize: '13px' }}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {projects.map(project => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="assigneeId"
                    label="Người thực hiện"
                  >
                    <Select 
                      allowClear 
                      placeholder="Chọn người thực hiện"
                      style={{ fontSize: '13px' }}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {users.map(user => (
                        <Option key={user.id} value={user.id}>
                          {user.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              {/* Trạng thái và ưu tiên - Gộp lại */}
              <div className="form-section section-status">
                <div className="form-section-header">
                  ⚡ Trạng thái & Ưu tiên
                </div>
                <div className="form-section-content">
                  <Form.Item
                    name="status"
                    label="Trạng thái *"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                  >
                    <Select placeholder="Chọn trạng thái" style={{ fontSize: '13px' }}>
                      <Option value="TODO">🕐 Chờ thực hiện</Option>
                      <Option value="IN_PROGRESS">🔄 Đang thực hiện</Option>
                      <Option value="REVIEW">👁️ Đang xem xét</Option>
                      <Option value="COMPLETED">✅ Hoàn thành</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="priority"
                    label="Mức độ ưu tiên *"
                    rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
                  >
                    <Select placeholder="Chọn mức độ ưu tiên" style={{ fontSize: '13px' }}>
                      <Option value="LOW">🔵 Thấp</Option>
                      <Option value="MEDIUM">🟡 Trung bình</Option>
                      <Option value="HIGH">🔴 Cao</Option>
                      <Option value="URGENT">🚨 Khẩn cấp</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              {/* Thời gian - Thu gọn */}
              <div className="form-section section-time">
                <div className="form-section-header">
                  📅 Thời gian
                </div>
                <div className="form-section-content">
                  <Form.Item
                    name="startDate"
                    label="Ngày bắt đầu"
                  >
                    <DatePicker 
                      style={{ width: '100%', fontSize: '13px' }}
                      placeholder="Chọn ngày bắt đầu"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="dueDate"
                    label="Hạn hoàn thành"
                  >
                    <DatePicker 
                      style={{ width: '100%', fontSize: '13px' }}
                      placeholder="Chọn hạn hoàn thành"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Phân loại - Thu gọn */}
              <div className="form-section section-category">
                <div className="form-section-header">
                  🏷️ Phân loại
                </div>
                <div className="form-section-content">
                  <Form.Item
                    name="category"
                    label="Loại nhiệm vụ"
                  >
                    <Select placeholder="Chọn phân loại" style={{ fontSize: '13px' }}>
                      <Option value="DESIGN">🎨 Thiết kế</Option>
                      <Option value="SURVEY">📊 Khảo sát</Option>
                      <Option value="BVTKTC">📋 BVTKTC</Option>
                      <Option value="DEVELOPMENT">💻 Phát triển</Option>
                      <Option value="TESTING">🧪 Kiểm thử</Option>
                      <Option value="DOCUMENTATION">📄 Tài liệu</Option>
                      <Option value="MEETING">🤝 Họp</Option>
                      <Option value="OTHER">📌 Khác</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
              
              {/* Action Buttons - Optimized for Mobile */}
              <div className="action-buttons">
                <Button 
                  onClick={handleCloseForm}
                  size="large"
                  style={{ flex: 1 }}
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  size="large"
                  style={{ flex: 1 }}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </div>
        </Drawer>
      ) : (
        <Modal
          title={t('tasks.edit')}
          open={isEditModalVisible}
          onCancel={handleCloseForm}
          footer={null}
          width={800}
          className="tablet-landscape-edit-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateTask}
            className="tablet-landscape-edit-form task-form"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label={t('tasks.title')}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="projectId"
                  label="Dự án"
                  rules={[{ required: true, message: 'Vui lòng chọn dự án!' }]}
                >
                  <Select placeholder="Chọn dự án">
                    {projects.map(project => (
                      <Option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label={t('tasks.description')}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label={t('tasks.status')}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Select>
                    <Option value="TODO">Chờ thực hiện</Option>
                    <Option value="IN_PROGRESS">Đang thực hiện</Option>
                    <Option value="REVIEW">Đang xem xét</Option>
                    <Option value="COMPLETED">Hoàn thành</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="priority"
                  label={t('tasks.priority')}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Select>
                    <Option value="LOW">Thấp</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="HIGH">Cao</Option>
                    <Option value="URGENT">Khẩn cấp</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="category"
                  label="Phân loại"
                >
                  <Select placeholder="Chọn phân loại">
                    <Option value="DESIGN">Thiết kế</Option>
                    <Option value="SURVEY">Khảo sát</Option>
                    <Option value="BVTKTC">BVTKTC</Option>
                    <Option value="DEVELOPMENT">Phát triển</Option>
                    <Option value="TESTING">Kiểm thử</Option>
                    <Option value="DOCUMENTATION">Tài liệu</Option>
                    <Option value="MEETING">Họp</Option>
                    <Option value="OTHER">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="assigneeId"
                  label={t('tasks.assignee')}
                >
                  <Select allowClear placeholder={t('tasks.selectAssignee')}>
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu"
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="dueDate"
              label={t('tasks.dueDate')}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
      
      {/* Add Document Modal */}
      <Modal
        title={t('tasks.addDocument')}
        open={isAddDocumentModalVisible}
        onCancel={() => setIsAddDocumentModalVisible(false)}
        footer={null}
        width={isMobile ? '90%' : 500}
      >
        <Form
          layout="vertical"
          onFinish={handleAddDocument}
        >
          <Form.Item
            name="documentId"
            label={t('documents.select')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select placeholder={t('documents.select')}>
              {documents.map(doc => (
                <Option key={doc.id} value={doc.id}>{doc.name} (v{doc.version})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('common.add')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteTask}
        title="Xác nhận xóa nhiệm vụ"
        content="Bạn có chắc chắn muốn xóa nhiệm vụ"
        itemName={currentTask.title}
        size="medium"
      />

      {/* Floating Action Button for Mobile and Tablet */}
      <FloatingActionButton 
        onClick={() => setIsAddDocumentModalVisible(true)}
        tooltip="Thêm tài liệu cho nhiệm vụ"
        icon={<FileOutlined />}
        color={`linear-gradient(135deg, #722ed1 0%, #531dab 100%)`}
      />
    </div>
  );
};

export default TaskDetail; 