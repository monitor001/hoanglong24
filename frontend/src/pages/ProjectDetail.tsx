import React, { useState, useEffect } from 'react';
import { 
  Card,
  Typography,
  Tag,
  Progress,
  Avatar,
  Button,
  Statistic,
  List,
  Descriptions,
  Tabs,
  Table,
  message,
  Modal
} from 'antd';
import { 
  FolderOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  MessageOutlined,
  SettingOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axiosInstance from '../axiosConfig';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ProjectMemberManagement from '../components/ProjectMemberManagement';

import '../styles/desktop-statistics-colors.css';
import '../styles/project-detail-mobile-optimization.css';
import '../styles/mobile-icon-standardization.css';
import '../styles/project-dark-theme-fixes.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  progress: number;
  manager: string;
  managerId?: string;
  teamSize: number;
  documents: number;
  tasks: number;
  issues: number;
  members: ProjectMember[];
  permissions: ProjectPermission[];
  comments?: ProjectComment[];
}

interface ProjectMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface ProjectPermission {
  id: string;
  userId: string;
  permission: 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';
  resource: 'PROJECT' | 'DOCUMENTS' | 'TASKS' | 'ISSUES' | 'CALENDAR';
  grantedAt: string;
}

interface ProjectComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [memberManagementVisible, setMemberManagementVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchComments();
    }
  }, [id]);
  
  const fetchProjectDetails = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${id}`);
      setProject(response.data);
        } catch (error) {
      console.error('Error fetching project details:', error);
      message.error('Không thể tải thông tin dự án!');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${id}/comments`);
      let commentsData = [];
      if (response.data && Array.isArray(response.data)) {
        commentsData = response.data;
      } else if (response.data && response.data.comments && Array.isArray(response.data.comments)) {
        commentsData = response.data.comments;
      }
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; icon: React.ReactNode } } = {
      'ACTIVE': { label: 'Đang thực hiện', color: 'green', icon: <CheckCircleOutlined style={{ color: isDarkMode ? '#52c41a' : '#52c41a' }} /> },
      'PLANNING': { label: 'Lập kế hoạch', color: 'blue', icon: <ClockCircleOutlined style={{ color: isDarkMode ? '#1890ff' : '#1890ff' }} /> },
      'ON_HOLD': { label: 'Tạm dừng', color: 'orange', icon: <ExclamationCircleOutlined style={{ color: isDarkMode ? '#faad14' : '#faad14' }} /> },
      'COMPLETED': { label: 'Hoàn thành', color: 'purple', icon: <CheckCircleOutlined style={{ color: isDarkMode ? '#722ed1' : '#722ed1' }} /> },
      'ARCHIVED': { label: 'Lưu trữ', color: 'grey', icon: <ExclamationCircleOutlined style={{ color: isDarkMode ? '#8c8c8c' : '#8c8c8c' }} /> }
    };
    return statusMap[status] || { label: status, color: 'default', icon: null };
  };

  const getPriorityDisplay = (priority: string) => {
    const priorityMap: { [key: string]: { label: string; color: string } } = {
      'HIGH': { label: 'Cao', color: 'red' },
      'MEDIUM': { label: 'Trung bình', color: 'orange' },
      'LOW': { label: 'Thấp', color: 'green' },
      'NONE': { label: 'Không', color: 'default' }
    };
    return priorityMap[priority] || { label: priority, color: 'default' };
  };

  const handleEdit = () => {
    navigate(`/projects/edit/${id}`);
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/projects/${id}`);
      message.success('Đã xóa dự án!');
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      message.error('Lỗi khi xóa dự án!');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
    }
  };

  const handleManageMembers = () => {
    setMemberManagementVisible(true);
  };

  const handleMembersUpdated = () => {
    fetchProjectDetails();
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!project) {
    return <div>Không tìm thấy dự án</div>;
  }

  const statusInfo = getStatusDisplay(project.status);
  const priorityInfo = getPriorityDisplay(project.priority);

  return (
    <div className="mobile-project-detail-container">
      {/* Header */}
      <div className="mobile-project-detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Button 
            className="back-button"
            icon={<ArrowLeftOutlined style={{ fontSize: '16px' }} />} 
            onClick={() => navigate('/projects')}
          >
            Quay lại
          </Button>
          <div className="mobile-project-title-section">
            <Title level={2} style={{ margin: 0 }}>{project.name}</Title>
            <Text type="secondary">{project.description}</Text>
          </div>
        </div>
        <div className="action-buttons">
          <Button 
            icon={<DownloadOutlined style={{ fontSize: '16px' }} />}
            style={{ 
              padding: '6px 12px',
              border: '1px solid #1890ff',
              borderRadius: '6px',
              backgroundColor: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)',
              color: '#1890ff'
            }}
          >
            Xuất Báo Cáo
          </Button>
          <Button 
            icon={<EditOutlined style={{ fontSize: '16px' }} />} 
            onClick={handleEdit}
            style={{ 
              padding: '6px 12px',
              border: '1px solid #52c41a',
              borderRadius: '6px',
              backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.05)',
              color: '#52c41a'
            }}
          >
            Chỉnh sửa
          </Button>
          <Button 
            icon={<DeleteOutlined style={{ fontSize: '16px' }} />} 
            onClick={handleDelete}
            style={{ 
              padding: '6px 12px',
              border: '1px solid #ff4d4f',
              borderRadius: '6px',
              backgroundColor: isDarkMode ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.05)',
              color: '#ff4d4f'
            }}
          >
            Xóa
          </Button>
          <Button 
            icon={<TeamOutlined style={{ fontSize: '16px' }} />} 
            onClick={handleManageMembers}
            style={{ 
              padding: '6px 12px',
              border: '1px solid #722ed1',
              borderRadius: '6px',
              backgroundColor: isDarkMode ? 'rgba(114, 46, 209, 0.1)' : 'rgba(114, 46, 209, 0.05)',
              color: '#722ed1'
            }}
          >
            Quản lý thành viên
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="mobile-project-overview">
        <Card className="mobile-project-info-card" title="Thông tin dự án">
          <Descriptions column={1}>
            <Descriptions.Item label="Trạng thái">
              <div className="mobile-project-tags">
                <Tag color={statusInfo.color} icon={statusInfo.icon}>
                  {statusInfo.label}
                </Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Mức độ ưu tiên">
              <div className="mobile-project-tags">
                <Tag color={priorityInfo.color}>
                  {priorityInfo.label}
                </Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {moment(project.startDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {moment(project.endDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Quản lý dự án">
              {project.manager || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Số thành viên">
              {project.teamSize || 0}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        
        <Card className="mobile-project-progress-card" title="Tiến độ dự án">
          <div style={{ textAlign: 'center' }}>
            <Progress 
              type="circle" 
              percent={project.progress} 
              size={120}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div className="progress-label">
              <Text strong>{project.progress}% hoàn thành</Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics */}
      <div className="mobile-project-overview">
        <div className="mobile-statistics-grid">
          <Card className="mobile-statistics-card">
            <Statistic
              title="Tài liệu"
              value={project.documents}
              prefix={<FileTextOutlined style={{ fontSize: '16px' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card className="mobile-statistics-card">
            <Statistic
              title="Nhiệm vụ"
              value={project.tasks}
              prefix={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="mobile-statistics-card">
            <Statistic
              title="Vấn đề"
              value={project.issues}
              prefix={<ExclamationCircleOutlined style={{ fontSize: '16px' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
          <Card className="mobile-statistics-card">
            <Statistic
              title="Thành viên"
              value={project.members?.length || 0}
              prefix={<TeamOutlined style={{ fontSize: '16px' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="mobile-project-tabs">
        <Tabs defaultActiveKey="members">
          <TabPane tab="Thành viên" key="members">
            <Card className="mobile-project-table">
              <Table 
                dataSource={project.members || []}
                columns={[
                  {
                    title: 'Thành viên',
                    key: 'user',
                    render: (record: ProjectMember) => (
                      <div className="mobile-user-info">
                        <Avatar size={32}>
                          {(record.userName || 'U').charAt(0)}
                        </Avatar>
                        <div className="user-details">
                          <div className="user-name">{record.userName || 'Unknown'}</div>
                          <div className="user-email">{record.userEmail || 'No email'}</div>
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'Vai trò',
                    dataIndex: 'role',
                    key: 'role',
                    render: (role: string) => {
                      const roleColors = {
                        'OWNER': 'red',
                        'MANAGER': 'orange',
                        'MEMBER': 'blue',
                        'VIEWER': 'green'
                      };
                      return <Tag color={roleColors[role as keyof typeof roleColors]}>{role}</Tag>;
                    }
                  },
                  {
                    title: 'Ngày tham gia',
                    dataIndex: 'joinedAt',
                    key: 'joinedAt',
                    render: (date: string) => moment(date).format('DD/MM/YYYY')
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                        {status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </Tag>
                    )
                  }
                ]}
                pagination={false}
              />
            </Card>
          </TabPane>

        <TabPane tab="Bình luận" key="comments">
          <div className="mobile-comments-section">
            {comments.length === 0 ? (
              <div className="mobile-empty-state">
                <div>Chưa có bình luận nào</div>
              </div>
            ) : (
              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            background:
                              project?.priority === 'HIGH' ? 'linear-gradient(135deg, #ff7875 0%, #ffa39e 100%)'
                              : project?.priority === 'MEDIUM' ? 'linear-gradient(135deg, #faad14 0%, #ffe58f 100%)'
                              : project?.priority === 'LOW' ? 'linear-gradient(135deg, #1890ff 0%, #91d5ff 100%)'
                              : 'linear-gradient(135deg, #bfbfbf 0%, #e6e6e6 100%)',
                            color: '#fff', fontWeight: 700
                          }}
                        >
                          {(comment.authorName || 'U').charAt(0)}
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{comment.authorName || 'Unknown'}</span>
                          <span className="comment-time">
                            {moment(comment.createdAt).format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                      }
                      description={
                        <div className="comment-content">{comment.content}</div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </TabPane>

        <TabPane tab="Phân quyền" key="permissions">
          <Card className="mobile-project-table">
            <Table
              dataSource={project.permissions || []}
              columns={[
                {
                  title: 'Thành viên',
                  key: 'user',
                  render: (record: ProjectPermission) => {
                    const member = (project.members || []).find(m => m.userId === record.userId);
                    return member ? (
                      <div className="mobile-user-info">
                        <Avatar size={32}>
                          {(member.userName || 'U').charAt(0)}
                        </Avatar>
                        <div className="user-details">
                          <div className="user-name">{member.userName || 'Unknown'}</div>
                          <div className="user-email">{member.userEmail || 'No email'}</div>
                        </div>
                      </div>
                    ) : 'Không xác định';
                  }
                },
                {
                  title: 'Quyền',
                  dataIndex: 'permission',
                  key: 'permission',
                  render: (permission: string) => {
                    const permissionColors = {
                      'ADMIN': 'red',
                      'WRITE': 'orange',
                      'READ': 'blue',
                      'DELETE': 'purple'
                    };
                    return <Tag color={permissionColors[permission as keyof typeof permissionColors]}>{permission}</Tag>;
                  }
                },
                {
                  title: 'Tài nguyên',
                  dataIndex: 'resource',
                  key: 'resource',
                  render: (resource: string) => {
                    const resourceLabels = {
                      'PROJECT': 'Dự án',
                      'DOCUMENTS': 'Tài liệu',
                      'TASKS': 'Nhiệm vụ',
                      'ISSUES': 'Vấn đề',
                      'CALENDAR': 'Lịch'
                    };
                    return resourceLabels[resource as keyof typeof resourceLabels] || resource;
                  }
                },
                {
                  title: 'Ngày cấp',
                  dataIndex: 'grantedAt',
                  key: 'grantedAt',
                  render: (date: string) => moment(date).format('DD/MM/YYYY')
                }
              ]}
              pagination={false}
            />
          </Card>
        </TabPane>
        </Tabs>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa dự án"
        content="Bạn có chắc chắn muốn xóa dự án"
        itemName={project?.name}
        loading={deleteLoading}
        size="medium"
      />

      {/* Member Management Modal */}
      <ProjectMemberManagement
        visible={memberManagementVisible}
        onClose={() => setMemberManagementVisible(false)}
        projectId={id || ''}
        projectName={project.name}
        onMembersUpdated={handleMembersUpdated}
      />
    </div>
  );
};

export default ProjectDetail; 