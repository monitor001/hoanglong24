import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  Avatar,
  Button,
  Form,
  Input,
  message,
  Typography
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axiosInstance from '../axiosConfig';

const { Text } = Typography;

interface Comment {
  id: string;
  content: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  entityType: 'tasks' | 'projects' | 'documents';
  entityId: string | null;
  comments: Comment[];
  loading: boolean;
  onAddComment: (content: string) => Promise<void>;
  onFetchComments: (entityId: string) => Promise<void>;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({
  open,
  onClose,
  title,
  entityType,
  entityId,
  comments,
  loading,
  onAddComment,
  onFetchComments
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isDarkMode = useSelector((state: RootState) => state.ui.theme === 'dark');

  // Fetch comments when drawer opens
  useEffect(() => {
    if (open && entityId) {
      onFetchComments(entityId);
    }
  }, [open, entityId, onFetchComments]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      await onAddComment(values.content);
      
      form.resetFields();
      message.success('Đã thêm bình luận!');
      
      // Refresh comments
      if (entityId) {
        await onFetchComments(entityId);
      }
    } catch (error) {
      message.error('Lỗi khi thêm bình luận!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Drawer
      title={title}
      placement="right"
      width={400}
      onClose={onClose}
      open={open}
      destroyOnClose
      bodyStyle={{
        background: isDarkMode ? '#18191c' : '#fff',
        color: isDarkMode ? '#fff' : '#222',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      headerStyle={{
        background: isDarkMode ? '#18191c' : '#fff',
        color: isDarkMode ? '#fff' : '#222',
        borderBottom: isDarkMode ? '1px solid #333' : '1px solid #f0f0f0'
      }}
    >
      {/* Comments List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, minHeight: 200 }}>
        <List
          loading={loading}
          dataSource={comments}
          locale={{ emptyText: 'Chưa có bình luận nào.' }}
          renderItem={(item: Comment) => (
            <List.Item
              style={{
                borderBottom: isDarkMode ? '1px solid #333' : '1px solid #f0f0f0',
                padding: '12px 0'
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                      color: isDarkMode ? '#fff' : '#666'
                    }}
                  />
                }
                title={
                  <Text style={{ color: isDarkMode ? '#fff' : '#222', fontWeight: 600 }}>
                    {item.user?.name || item.authorName || 'Người dùng'}
                  </Text>
                }
                description={
                  <div>
                    <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>
                      {item.content}
                    </Text>
                    <div style={{ 
                      fontSize: 11, 
                      color: isDarkMode ? '#888' : '#999',
                      marginTop: 4
                    }}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {/* Comment Input */}
      <div style={{
        borderTop: isDarkMode ? '1px solid #333' : '1px solid #f0f0f0',
        background: isDarkMode ? '#18191c' : '#fff',
        padding: 12,
        position: 'sticky',
        bottom: 0,
        zIndex: 2
      }}>
        <Form form={form}>
          <Form.Item 
            name="content" 
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: 'Vui lòng nhập nội dung bình luận!' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập bình luận..."
              style={{ 
                background: isDarkMode ? '#232428' : '#fff', 
                color: isDarkMode ? '#fff' : '#222', 
                borderColor: isDarkMode ? '#333' : undefined 
              }}
              onKeyPress={handleKeyPress}
            />
          </Form.Item>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            style={{ 
              marginTop: 8, 
              background: isDarkMode ? '#1890ff' : undefined, 
              borderColor: isDarkMode ? '#1890ff' : undefined 
            }}
            block
          >
            Gửi bình luận
          </Button>
        </Form>
      </div>
    </Drawer>
  );
};

export default CommentDrawer;
