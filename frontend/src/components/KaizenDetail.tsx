import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Space,
  Button,
  Typography,
  Row,
  Col,
  Avatar,
  Badge,
  Divider,
  Image,
  List,
  Form,
  Input,
  message,
  Tooltip,
  Statistic,
  Timeline,
  Empty,
  Spin
} from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  BulbOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  DownloadOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveChart';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface KaizenDetailProps {
  kaizen: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const KaizenDetail: React.FC<KaizenDetailProps> = ({ kaizen, onClose, onEdit, onDelete }) => {
  const { isMobile } = useResponsiveBreakpoint();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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

  const impacts = [
    { value: 'LOW', label: 'Thấp', color: '#52c41a' },
    { value: 'MEDIUM', label: 'Trung bình', color: '#faad14' },
    { value: 'HIGH', label: 'Cao', color: '#f5222d' },
    { value: 'CRITICAL', label: 'Quan trọng', color: '#cf1322' }
  ];

  // Load comments
  useEffect(() => {
    if (kaizen.comments) {
      setComments(kaizen.comments);
    }
  }, [kaizen]);

  // Handle like/unlike
  const handleLike = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/kaizen/${kaizen.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the kaizen object
        kaizen.isLiked = data.liked;
        kaizen.likeCount = data.liked ? kaizen.likeCount + 1 : kaizen.likeCount - 1;
        // Force re-render
        setComments([...comments]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      message.error('Lỗi khi thích/bỏ thích');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/kaizen/${kaizen.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: commentText,
          isInternal: false
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setCommentText('');
        message.success('Bình luận đã được gửi');
      } else {
        message.error('Không thể gửi bình luận');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('Lỗi khi gửi bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle share
  const handleShare = () => {
    // Implement share functionality
    message.info('Tính năng chia sẻ sẽ được phát triển sau');
  };

  // Get category, status, priority, impact info
  const getCategoryInfo = (value: string) => categories.find(c => c.value === value);
  const getStatusInfo = (value: string) => statuses.find(s => s.value === value);
  const getPriorityInfo = (value: string) => priorities.find(p => p.value === value);
  const getImpactInfo = (value: string) => impacts.find(i => i.value === value);

  return (
    <div style={{ padding: isMobile ? 8 : 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {kaizen.title}
            </Title>
            <Text type="secondary">
              Tạo bởi {kaizen.author.name} • {new Date(kaizen.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={kaizen.isLiked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                onClick={handleLike}
              >
                {kaizen.likeCount}
              </Button>
              <Button icon={<CommentOutlined />}>
                {kaizen.commentCount}
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                Chia sẻ
              </Button>
              {(currentUser?.id === kaizen.author.id || currentUser?.role === 'ADMIN') && (
                <>
                  <Button icon={<EditOutlined />} onClick={onEdit}>
                    Chỉnh sửa
                  </Button>
                  <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
                    Xóa
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* Tags and Status */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Space>
              {getCategoryInfo(kaizen.category) && (
                <Tag color={getCategoryInfo(kaizen.category)?.color}>
                  {getCategoryInfo(kaizen.category)?.label}
                </Tag>
              )}
              {getStatusInfo(kaizen.status) && (
                <Tag color={getStatusInfo(kaizen.status)?.color}>
                  {getStatusInfo(kaizen.status)?.label}
                </Tag>
              )}
              {getPriorityInfo(kaizen.priority) && (
                <Tag color={getPriorityInfo(kaizen.priority)?.color}>
                  {getPriorityInfo(kaizen.priority)?.label}
                </Tag>
              )}
              {getImpactInfo(kaizen.impact) && (
                <Tag color={getImpactInfo(kaizen.impact)?.color}>
                  {getImpactInfo(kaizen.impact)?.label}
                </Tag>
              )}
              {kaizen.tags?.map((tag: any) => (
                <Tag key={tag.id} color={tag.color}>
                  {tag.nameVi || tag.name}
                </Tag>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Statistic title="Lượt xem" value={kaizen.viewCount} prefix={<EyeOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Lượt thích" value={kaizen.likeCount} prefix={<LikeOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Bình luận" value={kaizen.commentCount} prefix={<CommentOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic 
            title="Trạng thái" 
            value={getStatusInfo(kaizen.status)?.label || kaizen.status}
            valueStyle={{ color: getStatusInfo(kaizen.status)?.color }}
          />
        </Col>
      </Row>

      {/* Content */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Description */}
          <Card title="Mô tả" style={{ marginBottom: 16 }}>
            <Paragraph>{kaizen.description}</Paragraph>
          </Card>

          {/* Detailed Content */}
          <Card title="Nội dung chi tiết" style={{ marginBottom: 16 }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {kaizen.content}
            </Paragraph>
          </Card>

          {/* Images */}
          {(kaizen.beforeImage || kaizen.afterImage) && (
            <Card title="Hình ảnh" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                {kaizen.beforeImage && (
                  <Col xs={24} md={12}>
                    <div>
                      <Text strong>Trước cải tiến:</Text>
                      <Image
                        src={kaizen.beforeImage}
                        alt="Trước cải tiến"
                        style={{ width: '100%', marginTop: 8 }}
                      />
                    </div>
                  </Col>
                )}
                {kaizen.afterImage && (
                  <Col xs={24} md={12}>
                    <div>
                      <Text strong>Sau cải tiến:</Text>
                      <Image
                        src={kaizen.afterImage}
                        alt="Sau cải tiến"
                        style={{ width: '100%', marginTop: 8 }}
                      />
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {/* Attachments */}
          {kaizen.attachments && kaizen.attachments.length > 0 && (
            <Card title="Tài liệu đính kèm" style={{ marginBottom: 16 }}>
              <List
                dataSource={kaizen.attachments}
                renderItem={(file: any, index: number) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<DownloadOutlined />}
                      title={file.name || `Tài liệu ${index + 1}`}
                      description={file.url ? (
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          Tải xuống
                        </a>
                      ) : 'Không có link tải xuống'}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Comments */}
          <Card title={`Bình luận (${comments.length})`}>
            {/* Comment form */}
            <div style={{ marginBottom: 16 }}>
              <Form.Item>
                <TextArea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                />
              </Form.Item>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleCommentSubmit}
                loading={submittingComment}
                disabled={!commentText.trim()}
              >
                Gửi bình luận
              </Button>
            </div>

            {/* Comments list */}
            <List
              dataSource={comments}
              renderItem={(comment: any) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
                    <Avatar>{comment.author.name.charAt(0)}</Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text strong>{comment.author.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </Text>
                      </div>
                      <Text>{comment.content}</Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Details */}
          <Card title="Thông tin chi tiết" style={{ marginBottom: 16 }}>
            <List size="small">
              {kaizen.department && (
                <List.Item>
                  <Text strong>Phòng ban:</Text> {kaizen.department}
                </List.Item>
              )}
              {kaizen.location && (
                <List.Item>
                  <Text strong>Vị trí:</Text> {kaizen.location}
                </List.Item>
              )}
              {kaizen.estimatedSavings && (
                <List.Item>
                  <Text strong>Ước tính tiết kiệm:</Text> {kaizen.estimatedSavings}
                </List.Item>
              )}
              {kaizen.project && (
                <List.Item>
                  <Text strong>Dự án:</Text> {kaizen.project.code} - {kaizen.project.name}
                </List.Item>
              )}
              {kaizen.implementationDate && (
                <List.Item>
                  <Text strong>Ngày triển khai:</Text> {new Date(kaizen.implementationDate).toLocaleDateString('vi-VN')}
                </List.Item>
              )}
              {kaizen.completionDate && (
                <List.Item>
                  <Text strong>Ngày hoàn thành:</Text> {new Date(kaizen.completionDate).toLocaleDateString('vi-VN')}
                </List.Item>
              )}
              <List.Item>
                <Text strong>Chia sẻ công khai:</Text> {kaizen.isPublic ? 'Có' : 'Không'}
              </List.Item>
            </List>
          </Card>

          {/* Timeline */}
          <Card title="Lịch sử">
            <Timeline>
              <Timeline.Item>
                <Text>Tạo bởi {kaizen.author.name}</Text>
                <br />
                <Text type="secondary">{new Date(kaizen.createdAt).toLocaleString('vi-VN')}</Text>
              </Timeline.Item>
              {kaizen.updatedAt !== kaizen.createdAt && (
                <Timeline.Item>
                  <Text>Cập nhật lần cuối</Text>
                  <br />
                  <Text type="secondary">{new Date(kaizen.updatedAt).toLocaleString('vi-VN')}</Text>
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KaizenDetail;
