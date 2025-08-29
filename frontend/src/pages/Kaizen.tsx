import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  message,
  Tooltip,
  Avatar,
  Badge,
  Row,
  Col,
  Statistic,
  Progress,
  Empty,
  Spin,
  Typography,
  Divider,
  Image,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  ShareAltOutlined,
  BulbOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../hooks/useTheme';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveChart';
import KaizenForm from '../components/KaizenForm';
import KaizenDetail from '../components/KaizenDetail';
import KaizenStats from '../components/KaizenStats';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Kaizen {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  status: string;
  priority: string;
  impact: string;
  department: string;
  location: string;
  beforeImage: string;
  afterImage: string;
  attachments: any[];
  estimatedSavings: string;
  implementationDate: string;
  completionDate: string;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    code: string;
  };
  tags: Array<{
    id: string;
    name: string;
    nameVi: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const Kaizen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { actualIsDarkMode } = useTheme();
  const { isMobile, isTablet } = useResponsiveBreakpoint();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // State
  const [kaizens, setKaizens] = useState<Kaizen[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [isPublicFilter, setIsPublicFilter] = useState<boolean | null>(null);
  
  // Modals
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [selectedKaizen, setSelectedKaizen] = useState<Kaizen | null>(null);
  const [editingKaizen, setEditingKaizen] = useState<Kaizen | null>(null);

  // Categories and statuses
  const categories = [
    { value: 'PROCESS', label: 'Quy trình', color: '#1890ff' },
    { value: 'QUALITY', label: 'Chất lượng', color: '#52c41a' },
    { value: 'SAFETY', label: 'An toàn', color: '#faad14' },
    { value: 'EFFICIENCY', label: 'Hiệu quả', color: '#722ed1' },
    { value: 'COST', label: 'Chi phí', color: '#eb2f96' },
    { value: 'OTHER', label: 'Khác', color: '#8c8c8c' }
  ];

  const statuses = [
    { value: 'DRAFT', label: 'Nháp', color: '#8c8c8c' },
    { value: 'SUBMITTED', label: 'Đã gửi', color: '#1890ff' },
    { value: 'UNDER_REVIEW', label: 'Đang xem xét', color: '#faad14' },
    { value: 'APPROVED', label: 'Đã phê duyệt', color: '#52c41a' },
    { value: 'IMPLEMENTED', label: 'Đã triển khai', color: '#13c2c2' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: '#722ed1' },
    { value: 'REJECTED', label: 'Từ chối', color: '#f5222d' },
    { value: 'ARCHIVED', label: 'Lưu trữ', color: '#bfbfbf' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Thấp', color: '#52c41a' },
    { value: 'MEDIUM', label: 'Trung bình', color: '#faad14' },
    { value: 'HIGH', label: 'Cao', color: '#f5222d' },
    { value: 'URGENT', label: 'Khẩn cấp', color: '#cf1322' }
  ];

  // Fetch kaizens
  const fetchKaizens = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString()
      });

      if (searchText) params.append('search', searchText);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (tagFilter.length > 0) params.append('tags', tagFilter.join(','));
      if (authorFilter) params.append('authorId', authorFilter);
      if (isPublicFilter !== null) params.append('isPublic', isPublicFilter.toString());

      const response = await fetch(`${process.env.REACT_APP_API_URL}/kaizen?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKaizens(data.kaizens);
        setTotal(data.pagination.total);
      } else {
        message.error('Không thể tải danh sách cải tiến');
      }
    } catch (error) {
      console.error('Error fetching kaizens:', error);
      message.error('Lỗi khi tải danh sách cải tiến');
    } finally {
      setLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async (kaizenId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/kaizen/${kaizenId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKaizens(prev => prev.map(k => {
          if (k.id === kaizenId) {
            return {
              ...k,
              isLiked: data.liked,
              likeCount: data.liked ? k.likeCount + 1 : k.likeCount - 1
            };
          }
          return k;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      message.error('Lỗi khi thích/bỏ thích');
    }
  };

  // Handle delete
  const handleDelete = async (kaizenId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/kaizen/${kaizenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        message.success('Đã xóa cải tiến thành công');
        fetchKaizens();
      } else {
        message.error('Không thể xóa cải tiến');
      }
    } catch (error) {
      console.error('Error deleting kaizen:', error);
      message.error('Lỗi khi xóa cải tiến');
    }
  };

  // Effects
  useEffect(() => {
    fetchKaizens();
  }, [currentPage, pageSize, searchText, categoryFilter, statusFilter, priorityFilter, tagFilter, authorFilter, isPublicFilter]);

  // Table columns
  const columns = useMemo(() => [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Kaizen) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {text}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const cat = categories.find(c => c.value === category);
        return cat ? (
          <Tag color={cat.color}>{cat.label}</Tag>
        ) : null;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const stat = statuses.find(s => s.value === status);
        return stat ? (
          <Tag color={stat.color}>{stat.label}</Tag>
        ) : null;
      }
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const pri = priorities.find(p => p.value === priority);
        return pri ? (
          <Tag color={pri.color}>{pri.label}</Tag>
        ) : null;
      }
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      render: (author: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small">{author.name.charAt(0)}</Avatar>
          <span>{author.name}</span>
        </div>
      )
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (record: Kaizen) => (
        <Space size="small">
          <Tooltip title="Lượt xem">
            <Badge count={record.viewCount} size="small" />
          </Tooltip>
          <Tooltip title="Lượt thích">
            <Badge count={record.likeCount} size="small" />
          </Tooltip>
          <Tooltip title="Bình luận">
            <Badge count={record.commentCount} size="small" />
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Kaizen) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedKaizen(record);
                setDetailVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Thích">
            <Button
              type="text"
              icon={record.isLiked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
              onClick={() => handleLike(record.id)}
            />
          </Tooltip>
          {(currentUser?.id === record.author.id || currentUser?.role === 'ADMIN') && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingKaizen(record);
                    setFormVisible(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Xóa">
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa cải tiến này?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ], [currentUser, categories, statuses, priorities]);

  // Filter components
  const FilterSection = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Tìm kiếm cải tiến..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Danh mục"
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
            style={{ width: '100%' }}
          >
            {categories.map(cat => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: '100%' }}
          >
            {statuses.map(status => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Độ ưu tiên"
            value={priorityFilter}
            onChange={setPriorityFilter}
            allowClear
            style={{ width: '100%' }}
          >
            {priorities.map(priority => (
              <Option key={priority.value} value={priority.value}>
                {priority.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Công khai"
            value={isPublicFilter}
            onChange={setIsPublicFilter}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value={true}>Công khai</Option>
            <Option value={false}>Riêng tư</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={2}>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => {
              setSearchText('');
              setCategoryFilter('');
              setStatusFilter('');
              setPriorityFilter('');
              setTagFilter([]);
              setAuthorFilter('');
              setIsPublicFilter(null);
            }}
            style={{ width: '100%' }}
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ padding: isMobile ? 8 : 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <BulbOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Cải tiến Kaizen
            </Title>
            <Text type="secondary">
              Chia sẻ và quản lý các cải tiến trong tổ chức
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<TrophyOutlined />}
                onClick={() => setStatsVisible(true)}
              >
                Thống kê
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingKaizen(null);
                  setFormVisible(true);
                }}
              >
                Tạo cải tiến mới
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <FilterSection />

      <Card>
        <Table
          columns={columns}
          dataSource={kaizens}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} cải tiến`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <Modal
        title={editingKaizen ? 'Chỉnh sửa cải tiến' : 'Tạo cải tiến mới'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setEditingKaizen(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <KaizenForm
          kaizen={editingKaizen}
          onSuccess={() => {
            setFormVisible(false);
            setEditingKaizen(null);
            fetchKaizens();
          }}
          onCancel={() => {
            setFormVisible(false);
            setEditingKaizen(null);
          }}
        />
      </Modal>

      <Modal
        title="Chi tiết cải tiến"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedKaizen(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedKaizen && (
          <KaizenDetail
            kaizen={selectedKaizen}
            onClose={() => {
              setDetailVisible(false);
              setSelectedKaizen(null);
            }}
            onEdit={() => {
              setDetailVisible(false);
              setEditingKaizen(selectedKaizen);
              setFormVisible(true);
            }}
            onDelete={() => {
              setDetailVisible(false);
              handleDelete(selectedKaizen.id);
            }}
          />
        )}
      </Modal>

      <Modal
        title="Thống kê cải tiến Kaizen"
        open={statsVisible}
        onCancel={() => setStatsVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <KaizenStats />
      </Modal>
    </div>
  );
};

export default Kaizen;
