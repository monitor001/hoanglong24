import { useState, useCallback } from 'react';
import axiosInstance from '../axiosConfig';
import { message } from 'antd';

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

interface UseCommentsProps {
  entityType: 'tasks' | 'projects' | 'documents';
}

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  fetchComments: (entityId: string) => Promise<void>;
  addComment: (entityId: string, content: string) => Promise<void>;
  deleteComment: (entityId: string, commentId: string) => Promise<void>;
}

export const useComments = ({ entityType }: UseCommentsProps): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments for entity
  const fetchComments = useCallback(async (entityId: string) => {
    setLoading(true);
    try {
      let response;
      
      switch (entityType) {
        case 'tasks':
          // For tasks, comments are included in task details
          response = await axiosInstance.get(`/tasks/${entityId}`);
          setComments(response.data.comments || []);
          break;
          
        case 'projects':
          // For projects, comments have dedicated endpoint
          response = await axiosInstance.get(`/projects/${entityId}/comments`);
          // Handle different response formats
          if (Array.isArray(response.data)) {
            setComments(response.data);
          } else if (response.data.comments && Array.isArray(response.data.comments)) {
            setComments(response.data.comments);
          } else {
            setComments([]);
          }
          break;
          
        case 'documents':
          // For documents, check if endpoint exists or create placeholder
          try {
            response = await axiosInstance.get(`/documents/${entityId}/comments`);
            setComments(response.data.comments || response.data || []);
          } catch (error: any) {
            if (error.response?.status === 404) {
              // Endpoint doesn't exist yet, return empty array
              setComments([]);
            } else {
              throw error;
            }
          }
          break;
          
        default:
          setComments([]);
      }
    } catch (error) {
      console.error(`Error fetching ${entityType} comments:`, error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  // Add comment to entity
  const addComment = useCallback(async (entityId: string, content: string) => {
    try {
      let response: any = null;
      
      switch (entityType) {
        case 'tasks':
          response = await axiosInstance.post(`/tasks/${entityId}/comments`, {
            content
          });
          break;
          
        case 'projects':
          response = await axiosInstance.post(`/projects/${entityId}/comments`, {
            content
          });
          break;
          
        case 'documents':
          // For documents, we might need to create the endpoint or use a generic one
          try {
            response = await axiosInstance.post(`/documents/${entityId}/comments`, {
              content
            });
          } catch (error: any) {
            if (error.response?.status === 404) {
              // If endpoint doesn't exist, we can simulate success for now
              message.info('Tính năng bình luận tài liệu sẽ được phát triển trong phiên bản tiếp theo');
              return;
            } else {
              throw error;
            }
          }
          break;
      }
      
      // Update comments list if response contains the new comment
      if (response?.data) {
        setComments(prevComments => [response.data, ...prevComments]);
      }
      
    } catch (error) {
      console.error(`Error adding ${entityType} comment:`, error);
      throw error;
    }
  }, [entityType]);

  // Delete comment from entity
  const deleteComment = useCallback(async (entityId: string, commentId: string) => {
    try {
      switch (entityType) {
        case 'tasks':
          await axiosInstance.delete(`/tasks/${entityId}/comments/${commentId}`);
          break;
          
        case 'projects':
          await axiosInstance.delete(`/projects/${entityId}/comments/${commentId}`);
          break;
          
        case 'documents':
          try {
            await axiosInstance.delete(`/documents/${entityId}/comments/${commentId}`);
          } catch (error: any) {
            if (error.response?.status === 404) {
              message.info('Tính năng bình luận tài liệu sẽ được phát triển trong phiên bản tiếp theo');
              return;
            } else {
              throw error;
            }
          }
          break;
      }
      
      // Remove comment from local state
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
      
      message.success('Đã xóa bình luận!');
      
    } catch (error) {
      console.error(`Error deleting ${entityType} comment:`, error);
      message.error('Lỗi khi xóa bình luận!');
      throw error;
    }
  }, [entityType]);

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment
  };
};
