import React, { useState, useEffect, useRef } from 'react';
import { 
  List, 
  Input, 
  Button, 
  Avatar, 
  Form, 
  message, 
  Popconfirm, 
  Typography,
  Space,
  Dropdown,
  Menu,
  Tooltip,
  Mentions,
  Modal
} from 'antd';
import { 
  SendOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  MoreOutlined,
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import moment from 'moment';
import axiosInstance from '../axiosConfig';
import { ROLES } from '../constants/permissions';

const { Text } = Typography;

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  replyTo?: {
    id: string;
    user: {
      id: string;
      name: string;
    };
  };
  replies?: Comment[];
}

interface UnifiedCommentSectionProps {
  entityType: 'project' | 'document';
  entityId: string;
  users: any[];
  isDarkMode: boolean;
}

const UnifiedCommentSection: React.FC<UnifiedCommentSectionProps> = ({
  entityType,
  entityId,
  users,
  isDarkMode
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentValue, setCommentValue] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const { user } = useSelector((state: any) => state.auth);
  const isAdmin = user?.role === ROLES.ADMIN;

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/${entityType}s/${entityId}/comments`);
      const sortedComments = response.data.sort((a: Comment, b: Comment) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      message.error('Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    // For now, we'll use polling for real-time updates
    // In a real implementation, you would use WebSocket
    const interval = setInterval(fetchComments, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [entityId, entityType, fetchComments]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [entityId, entityType, fetchComments]);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const handleCommentSubmit = async () => {
    if (!commentValue.trim()) return;

    try {
      setCommentLoading(true);
      const payload = {
        content: commentValue,
        ...(replyTo && { replyToId: replyTo.id })
      };

      const response = await axiosInstance.post(`/${entityType}s/${entityId}/comments`, payload);
      
      // Add new comment to the list
      setComments(prev => [...prev, response.data]);
      setCommentValue('');
      setReplyTo(null);
      
      message.success('Bình luận đã được gửi');
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('Không thể gửi bình luận');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    setCommentToDelete(comment);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setCommentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    
    try {
      await axiosInstance.delete(`/${entityType}s/${entityId}/comments/${commentToDelete.id}`);
      setComments(prev => prev.filter(comment => comment.id !== commentToDelete.id));
      message.success('Bình luận đã được xóa');
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error('Không thể xóa bình luận');
    } finally {
      setDeleteModalVisible(false);
      setCommentToDelete(null);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    // Focus on the input
    setTimeout(() => {
      const input = document.querySelector('.mentions-input') as HTMLTextAreaElement;
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const renderComment = (comment: Comment) => {
    const isOwnComment = comment.user.id === user?.id;
    const canDelete = isOwnComment || isAdmin;

    return (
      <List.Item 
        style={{
          background: isOwnComment ? (isDarkMode ? '#223355' : '#e6f7ff') : (isDarkMode ? '#232428' : '#fff'),
          color: isDarkMode ? '#fff' : '#222',
          borderBottom: isDarkMode ? '1px solid #222' : '1px solid #f0f0f0',
          borderRadius: 8,
          margin: '8px 0',
          padding: '12px',
          boxShadow: isDarkMode ? '0 2px 8px #0002' : '0 2px 8px #0001',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    background: isDarkMode ? '#222' : undefined,
                    border: isDarkMode ? '1px solid #333' : '1px solid #f0f0f0'
                  }} 
                />
              }
              title={
                <Space>
                  <span style={{ 
                    color: isDarkMode ? '#fff' : '#222',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    {comment.user.name}
                  </span>
                  {comment.replyTo && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      trả lời {comment.replyTo.user.name}
                    </Text>
                  )}
                </Space>
              }
              description={
                <div style={{ 
                  color: isDarkMode ? '#aaa' : '#555',
                  fontSize: 13,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  marginTop: 4
                }}>
                  {comment.content}
                </div>
              }
            />
            <Space>
              <Tooltip title="Trả lời">
                <Button
                  type="text"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => handleReply(comment)}
                  style={{ color: isDarkMode ? '#aaa' : '#666' }}
                />
              </Tooltip>
              {canDelete && (
                <Tooltip title="Xóa bình luận">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteComment(comment)}
                  />
                </Tooltip>
              )}
            </Space>
          </div>
          <div style={{ 
            fontSize: 11, 
            color: isDarkMode ? '#aaa' : '#888',
            marginTop: 8,
            textAlign: 'right'
          }}>
            {moment(comment.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <div style={{
      height: 400,
      maxHeight: 500,
      overflowY: 'auto',
      background: isDarkMode ? '#18191c' : '#fff',
      borderRadius: 8,
      padding: 12,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Reply indicator */}
      {replyTo && (
        <div style={{
          background: isDarkMode ? '#223355' : '#e6f7ff',
          border: isDarkMode ? '1px solid #333' : '1px solid #d9d9d9',
          borderRadius: 6,
          padding: 8,
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 12, color: isDarkMode ? '#fff' : '#222' }}>
            Trả lời {replyTo.user.name}: {replyTo.content.substring(0, 50)}...
          </Text>
          <Button size="small" onClick={cancelReply}>Hủy</Button>
        </div>
      )}

      {/* Comments list */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 200 }} ref={listRef}>
        <List
          loading={loading}
          dataSource={comments}
          locale={{
            emptyText: (
              <div style={{
                textAlign: 'center',
                padding: 20,
                color: isDarkMode ? '#aaa' : '#888'
              }}>
                <div style={{ fontSize: 16, marginBottom: 8 }}>💬</div>
                <div>Chưa có bình luận nào</div>
              </div>
            )
          }}
          renderItem={renderComment}
          style={{ background: 'transparent' }}
        />
        <div ref={commentsEndRef} />
      </div>

      {/* Comment input */}
      <div style={{
        borderTop: isDarkMode ? '1px solid #222' : '1px solid #f0f0f0',
        background: isDarkMode ? '#18191c' : '#fff',
        padding: 12,
        position: 'sticky',
        bottom: 0,
        zIndex: 2
      }}>
        <Mentions
          className="mentions-input"
          rows={3}
          placeholder={replyTo ? `Trả lời ${replyTo.user.name}...` : "Nhập bình luận trao đổi..."}
          value={commentValue}
          onChange={val => setCommentValue(val)}
          style={{
            background: isDarkMode ? '#232428' : '#fff',
            color: isDarkMode ? '#fff' : '#222',
            borderColor: isDarkMode ? '#333' : undefined
          }}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
          autoSize={{ minRows: 3, maxRows: 6 }}
          prefix="@"
          notFoundContent={null}
          loading={commentLoading}
          options={users.map(user => ({
            value: user.id,
            label: user.name
          }))}
        />
        <Button
          type="primary"
          onClick={handleCommentSubmit}
          loading={commentLoading}
          disabled={!commentValue.trim()}
          style={{
            marginTop: 8,
            background: isDarkMode ? '#223355' : undefined,
            color: isDarkMode ? '#fff' : undefined,
            border: isDarkMode ? 'none' : undefined
          }}
          block
        >
          Gửi bình luận
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa bình luận"
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa bình luận này không?</p>
        {commentToDelete && (
          <div style={{
            background: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            padding: 12,
            borderRadius: 6,
            marginTop: 12,
            border: `1px solid ${isDarkMode ? '#444' : '#d9d9d9'}`
          }}>
            <div style={{ fontSize: 12, color: isDarkMode ? '#aaa' : '#666', marginBottom: 4 }}>
              {commentToDelete.user.name} • {moment(commentToDelete.createdAt).format('DD/MM/YYYY HH:mm')}
            </div>
            <div style={{ color: isDarkMode ? '#fff' : '#333' }}>
              {commentToDelete.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UnifiedCommentSection; 