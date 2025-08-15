import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Tooltip,
  Avatar,
  Popconfirm,
  message,
  Progress,
  Badge,
  Divider,
  Modal
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  MessageOutlined,
  PaperClipOutlined,
  UserOutlined,
  CalendarOutlined,
  ProjectOutlined,
  DownOutlined,
  UpOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MoreOutlined,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  FlagOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import '../styles/mobile-icon-standardization.css';

const { Text, Title, Paragraph } = Typography;

interface DocumentCard {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  category: string;
  sendDate: string;
  signDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  currentStage: 'design' | 'kcs' | 'verification' | 'appraisal';
  currentVersion?: number;
  stageDisplay?: string;
  assignedTo?: string;
  assignedToId?: string;
  priority: 'low' | 'medium' | 'high';
  rejectionReason?: string;
  history: any[];
  attachments?: string[];
  lastModified: string;
  comments: any[];
}

interface MobileApprovalCardProps {
  card: DocumentCard;
  onApprove: (card: DocumentCard) => void;
  onReject: (card: DocumentCard) => void;
  onSendToKCS: (card: DocumentCard) => void;
  onViewHistory: (card: DocumentCard) => void;
  onAddComment: (card: DocumentCard) => void;
  onEdit: (card: DocumentCard) => void;
  onDelete: (card: DocumentCard) => void;
  onExpand: (cardId: string) => void;
  isExpanded: boolean;
  onFavorite?: (card: DocumentCard) => void;
  onShare?: (card: DocumentCard) => void;
  isFavorite?: boolean;
  showQuickActions?: boolean;
  compactMode?: boolean;
  enableHapticFeedback?: boolean;
}

const MobileApprovalCard: React.FC<MobileApprovalCardProps> = ({
  card,
  onApprove,
  onReject,
  onSendToKCS,
  onViewHistory,
  onAddComment,
  onEdit,
  onDelete,
  onExpand,
  isExpanded,
  onFavorite,
  onShare,
  isFavorite = false,
  showQuickActions = true,
  compactMode = false,
  enableHapticFeedback = true
}) => {
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: any) => state.ui.isDarkMode);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'rejected':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDarkMode ? '#ff7875' : '#ff4d4f';
      case 'medium':
        return isDarkMode ? '#ffc53d' : '#faad14';
      case 'low':
        return isDarkMode ? '#73d13d' : '#52c41a';
      default:
        return isDarkMode ? '#595959' : '#d9d9d9';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'design':
        return isDarkMode ? '#40a9ff' : '#1890ff';
      case 'kcs':
        return isDarkMode ? '#b37feb' : '#722ed1';
      case 'verification':
        return isDarkMode ? '#36cfc9' : '#13c2c2';
      case 'appraisal':
        return isDarkMode ? '#73d13d' : '#52c41a';
      default:
        return isDarkMode ? '#595959' : '#d9d9d9';
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'design':
        return 'THIẾT KẾ';
      case 'kcs':
        return 'KCS';
      case 'verification':
        return 'THẨM TRA';
      case 'appraisal':
        return 'THẨM ĐỊNH';
      default:
        return stage.toUpperCase();
    }
  };

  // Haptic feedback function
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback) return;
    
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate([30, 10, 30]);
          break;
      }
    }
  }, [enableHapticFeedback]);

  // Get stage progress percentage
  const getStageProgress = useCallback(() => {
    const stages = ['design', 'kcs', 'verification', 'appraisal'];
    const currentIndex = stages.indexOf(card.currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  }, [card.currentStage]);

  // Format time ago
  const formatTimeAgo = useCallback((date: string) => {
    const now = dayjs();
    const target = dayjs(date);
    const diffInHours = now.diff(target, 'hour');
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours}h trước`;
    } else {
      const diffInDays = now.diff(target, 'day');
      return `${diffInDays} ngày trước`;
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const startTime = Date.now();
    setTouchStartTime(startTime);
    setDragStartX(e.touches[0].clientX);
    setIsDragging(true);
    setIsLongPressed(false);
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPressed(true);
      triggerHapticFeedback('medium');
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if user moves finger
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStartX;
    const newTranslateX = Math.max(-120, Math.min(0, diff));
    setCurrentTranslateX(newTranslateX);
    
    // Light haptic feedback when starting to swipe
    if (Math.abs(diff) > 10 && !isSwiped) {
      triggerHapticFeedback('light');
    }
    
    // Prevent default to avoid scrolling while swiping
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    setIsDragging(false);
    
    if (currentTranslateX < -60) {
      // Swipe left - Show actions
      setCurrentTranslateX(-120);
      setIsSwiped(true);
      triggerHapticFeedback('medium');
    } else {
      // Reset position
      setCurrentTranslateX(0);
      setIsSwiped(false);
    }
    
    // Reset long press state
    setTimeout(() => setIsLongPressed(false), 100);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const handleActionClick = (action: string) => {
    setCurrentTranslateX(0);
    setIsSwiped(false);
    triggerHapticFeedback('light');
    
    switch (action) {
      case 'approve':
        triggerHapticFeedback('heavy');
        onApprove(card);
        break;
      case 'reject':
        triggerHapticFeedback('heavy');
        onReject(card);
        break;
      case 'send':
        triggerHapticFeedback('medium');
        onSendToKCS(card);
        break;
      case 'history':
        onViewHistory(card);
        break;
      case 'comment':
        onAddComment(card);
        break;
      case 'edit':
        onEdit(card);
        break;
      case 'delete':
        triggerHapticFeedback('heavy');
        setDeleteModalVisible(true);
        break;
      case 'favorite':
        triggerHapticFeedback('medium');
        onFavorite?.(card);
        break;
      case 'share':
        onShare?.(card);
        break;
      case 'expand':
        onExpand(card.id);
        break;
    }
  };

  // Handle quick actions from long press
  const handleQuickAction = (action: string) => {
    if (!isLongPressed) return;
    handleActionClick(action);
  };

  // Handle delete confirmation
  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(card);
    setDeleteModalVisible(false);
  };

  return (
    <div
      ref={cardRef}
      className={`mobile-approval-card-container ${compactMode ? 'compact' : ''} ${isLongPressed ? 'long-pressed' : ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        marginBottom: compactMode ? 3 : 6,
        borderRadius: compactMode ? 8 : 12,
        backgroundColor: isDarkMode ? '#141414' : '#ffffff',
        transform: `translateX(${currentTranslateX}px) ${isLongPressed ? 'scale(0.98)' : 'scale(1)'}`,
        transition: isDragging ? 'none' : 'all 0.3s ease',
        touchAction: 'pan-y',
        boxShadow: isLongPressed 
          ? (isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)')
          : (isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'),
        border: isFavorite ? '2px solid #1890ff' : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hidden Actions (Left side) */}
      <div className="mobile-swipe-actions">
        {/* Primary actions based on stage */}
        {card.currentStage === 'design' && (
          <Tooltip title="Gửi đến KCS" placement="top">
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleActionClick('send')}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            />
          </Tooltip>
        )}
        
        {(card.currentStage === 'kcs' || card.currentStage === 'verification' || card.currentStage === 'appraisal') && (
          <>
            <Tooltip title="Phê duyệt" placement="top">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleActionClick('approve')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              />
            </Tooltip>
            <Tooltip title="Từ chối" placement="top">
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleActionClick('reject')}
                style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
              />
            </Tooltip>
          </>
        )}
        
        {/* Secondary actions */}
        {onFavorite && (
          <Tooltip title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"} placement="top">
            <Button
              type="text"
              size="small"
              icon={isFavorite ? <StarFilled /> : <StarOutlined />}
              onClick={() => handleActionClick('favorite')}
              style={{ color: isFavorite ? '#faad14' : '#666' }}
            />
          </Tooltip>
        )}
        
        <Tooltip title="Chỉnh sửa" placement="top">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleActionClick('edit')}
            style={{ color: '#1890ff' }}
          />
        </Tooltip>
      </div>

      {/* Main Card Content */}
      <Card
        size="small"
        className={`mobile-approval-card ${card.status === 'rejected' ? 'rejected' : ''} ${isDragging ? 'swiping' : ''} ${isSwiped ? 'swiped' : ''}`}
        bodyStyle={{ padding: 4 }}
        style={{
          border: `2px solid ${getPriorityColor(card.priority)}`,
          backgroundColor: card.status === 'rejected' 
            ? (isDarkMode ? '#2a1f1f' : '#fff2f0') 
            : (isDarkMode ? '#141414' : '#fff'),
          borderRadius: 12,
          transform: isDragging ? `translateX(${currentTranslateX}px)` : undefined,
          boxShadow: card.status === 'rejected' 
            ? '0 2px 8px rgba(255, 77, 79, 0.2)' 
            : (isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)')
        }}
      >
        {/* Header */}
        <div className="mobile-card-header-enhanced" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 4,
          padding: '0 2px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <Tag 
              style={{ 
                fontSize: 9, 
                fontWeight: 700,
                margin: 0,
                padding: '1px 4px',
                borderRadius: 3,
                backgroundColor: getPriorityColor(card.priority),
                color: '#fff',
                border: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                boxShadow: `0 1px 3px ${getPriorityColor(card.priority)}40`
              }}
            >
              {card.priority.toUpperCase()}
            </Tag>
            
            {/* Stage indicator */}
            <Tag
              style={{ 
                padding: '1px 6px', 
                borderRadius: 3,
                fontSize: 8,
                fontWeight: 700,
                margin: 0,
                backgroundColor: getStageColor(card.currentStage),
                color: '#fff',
                border: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                boxShadow: `0 1px 3px ${getStageColor(card.currentStage)}40`
              }}
            >
              {getStageText(card.currentStage)}
            </Tag>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {getStatusIcon(card.status)}
              <Text style={{ fontSize: 10, color: isDarkMode ? '#d9d9d9' : '#666666' }}>

                {formatTimeAgo(card.lastModified)}
              </Text>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Favorite indicator */}
            {isFavorite && (
              <StarFilled style={{ color: '#faad14', fontSize: 12 }} />
            )}
            
            {/* Comments indicator */}
            {card.comments.length > 0 && (
              <Badge 
                count={card.comments.length} 
                size="small"
                style={{ fontSize: 9 }}
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<MessageOutlined />} 
                  onClick={() => handleActionClick('comment')}
                  className="mobile-icon-standard"
                  style={{ 
                    color: '#1890ff'
                  }}
                />
              </Badge>
            )}
            
            {/* Attachments indicator */}
            {card.attachments && card.attachments.length > 0 && (
              <Badge 
                count={card.attachments.length} 
                size="small"
                style={{ fontSize: 9 }}
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<PaperClipOutlined />} 
                  className="mobile-icon-standard"
                  style={{ 
                    color: '#52c41a'
                  }}
                />
              </Badge>
            )}
            

          </div>
        </div>

        {/* Progress Bar */}
        {!compactMode && (
          <div style={{ marginBottom: 8 }}>
            <Progress
              percent={getStageProgress()}
              size="small"
              strokeColor={{
                '0%': '#1890ff',
                '25%': '#722ed1',
                '50%': '#13c2c2',
                '100%': '#52c41a'
              }}
              trailColor={isDarkMode ? '#2f2f2f' : '#f0f0f0'}
              showInfo={false}
              strokeWidth={3}
            />
            <Text style={{ 
              fontSize: 9, 
              color: isDarkMode ? '#999' : '#666',
              display: 'block',
              textAlign: 'center',
              marginTop: 2
            }}>
              {Math.round(getStageProgress())}% hoàn thành
            </Text>
          </div>
        )}

        {/* Title */}
        <Title 
          level={5} 
          style={{ 
            color: isDarkMode ? '#ffffff' : '#000000',
            margin: '0 0 8px 0',
            fontSize: compactMode ? '14px' : '16px',
            fontWeight: 600,
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: compactMode ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {card.title}
        </Title>
        
        {/* Project and User Info */}
        <div style={{
          display: 'flex',
          flexDirection: compactMode ? 'row' : 'column',
          gap: compactMode ? 8 : 4,
          marginBottom: 8,
          alignItems: compactMode ? 'center' : 'flex-start'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            flex: compactMode ? 1 : 'none'
          }}>
            <Text style={{ 
              fontSize: 10, 
              color: isDarkMode ? '#d9d9d9' : '#666666',
              fontWeight: 500
            }}>
              {card.projectName}
            </Text>
            
            {card.assignedTo && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                backgroundColor: isDarkMode ? '#1f1f1f' : '#f8f9fa',
                borderRadius: 4,
                border: `1px solid ${isDarkMode ? '#303030' : '#e9ecef'}`
              }}>
                <Avatar 
                  size={14} 
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: '#52c41a',
                    fontSize: 8
                  }}
                />
                <Text style={{ 
                  fontSize: 10, 
                  color: isDarkMode ? '#d9d9d9' : '#666666',
                  fontWeight: 500
                }}>
                  {card.assignedTo}
                </Text>
              </div>
            )}
          </div>
          
          {/* Category info */}
          {!compactMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag 
                color="cyan" 
                style={{ 
                  fontSize: 9, 
                  margin: 0,
                  padding: '1px 4px',
                  borderRadius: 3
                }}
              >
                {card.category}
              </Tag>
              
              {/* Send date */}
              <Text style={{ 
                fontSize: 9, 
                color: isDarkMode ? '#999' : '#999',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <CalendarOutlined style={{ fontSize: 9 }} />
                Gửi: {dayjs(card.sendDate).format('DD/MM/YYYY')}
              </Text>
              
              {card.signDate && (
                <Text style={{ 
                  fontSize: 9, 
                  color: isDarkMode ? '#999' : '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <CheckCircleOutlined style={{ fontSize: 9 }} />
                  Ký: {dayjs(card.signDate).format('DD/MM/YYYY')}
                </Text>
              )}
            </div>
          )}
        </div>



        {/* Action Buttons - Right Aligned Icons Only */}
        {showQuickActions && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: 6,
            paddingTop: 4,
            borderTop: `1px solid ${isDarkMode ? '#2f2f2f' : '#f0f0f0'}`,
            gap: 2
          }}>
            {/* Primary Action Buttons */}
            {card.currentStage === 'design' && (
              <Tooltip title="Gửi đến KCS" placement="top">
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined style={{ color: '#40a9ff' }} />}
                  onClick={() => handleActionClick('send')}
                  className="mobile-icon-standard"
                  style={{ 
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    boxShadow: '0 2px 4px rgba(24, 144, 255, 0.3)'
                  }}
                />
              </Tooltip>
            )}

            {(card.currentStage === 'kcs' || card.currentStage === 'verification' || card.currentStage === 'appraisal') && (
              <>
                <Tooltip title="Phê duyệt" placement="top">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    onClick={() => handleActionClick('approve')}
                    className="mobile-icon-standard"
                    style={{ 
                      backgroundColor: '#52c41a', 
                      borderColor: '#52c41a',
                      boxShadow: '0 2px 4px rgba(82, 196, 26, 0.3)'
                    }}
                  />
                </Tooltip>
                <Tooltip title="Từ chối" placement="top">
                  <Button
                    danger
                    size="small"
                    icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    onClick={() => handleActionClick('reject')}
                    className="mobile-icon-standard"
                    style={{ 
                      backgroundColor: '#ff4d4f',
                      borderColor: '#ff4d4f',
                      boxShadow: '0 2px 4px rgba(255, 77, 79, 0.3)'
                    }}
                  />
                </Tooltip>
              </>
            )}

            {/* Secondary Action Buttons */}
            <Tooltip title="Lịch sử" placement="top">
              <Button
                type="text"
                size="small"
                icon={<HistoryOutlined style={{ color: '#1890ff' }} />}
                onClick={() => handleActionClick('history')}
                className="mobile-icon-standard"
                style={{ 
                  color: '#1890ff',
                  backgroundColor: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)'
                }}
              />
            </Tooltip>

            <Tooltip title="Chỉnh sửa" placement="top">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ color: '#faad14' }} />}
                onClick={() => handleActionClick('edit')}
                className="mobile-icon-standard"
                style={{ 
                  color: '#faad14',
                  backgroundColor: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 173, 20, 0.05)'
                }}
              />
            </Tooltip>

            <Tooltip title="Chi tiết" placement="top">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined style={{ color: '#722ed1' }} />}
                onClick={() => handleActionClick('detail')}
                className="mobile-icon-standard"
                style={{ 
                  color: '#722ed1',
                  backgroundColor: isDarkMode ? 'rgba(114, 46, 209, 0.1)' : 'rgba(114, 46, 209, 0.05)'
                }}
              />
            </Tooltip>

            <Tooltip title="Bình luận" placement="top">
              <Button
                type="text"
                size="small"
                icon={<MessageOutlined style={{ color: '#52c41a' }} />}
                onClick={() => handleActionClick('comment')}
                className="mobile-icon-standard"
                style={{ 
                  color: '#52c41a',
                  backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.05)'
                }}
              />
            </Tooltip>

            <Tooltip title="Xóa" placement="top">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                onClick={() => handleActionClick('delete')}
                className="mobile-icon-standard"
                style={{ 
                  color: '#ff4d4f',
                  backgroundColor: isDarkMode ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.05)'
                }}
              />
            </Tooltip>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa hồ sơ"
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa hồ sơ này không?</p>
        <div style={{
          background: isDarkMode ? '#2a2a2a' : '#f5f5f5',
          padding: 12,
          borderRadius: 6,
          marginTop: 12,
          border: `1px solid ${isDarkMode ? '#444' : '#d9d9d9'}`
        }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#333', marginBottom: 4 }}>
            {card.title}
          </div>
          <div style={{ fontSize: 12, color: isDarkMode ? '#aaa' : '#666' }}>
            Dự án: {card.projectName} • {card.category}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MobileApprovalCard;
