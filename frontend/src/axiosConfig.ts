import axios from 'axios';
import { message } from 'antd';
import { config, getEnvironment } from './config/environment';
import tokenManager from './utils/tokenManager';
import { sessionManager } from './utils/sessionManager';

// Create axios instance with environment-aware configuration
const axiosInstance = axios.create({
  baseURL: config.API_URL, // Use full API_URL including /api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.REQUEST_TIMEOUT,
  withCredentials: true, // Enable cookies for CORS
});

// Helper functions to get token and sessionId from Redux store
function getTokenFromStore(): string | null {
  try {
    // Import store dynamically to avoid circular dependency
    const store = require('./store').store;
    const state = store.getState();
    return state.auth.token;
  } catch (error) {
    console.warn('Could not get token from store:', error);
    return null;
  }
}

function getSessionIdFromStore(): string | null {
  try {
    // Import store dynamically to avoid circular dependency
    const store = require('./store').store;
    const state = store.getState();
    return state.auth.sessionId || null;
  } catch (error) {
    console.warn('Could not get sessionId from store:', error);
    return null;
  }
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available from Redux store, except for dashboard endpoints
    const isDashboardEndpoint = config.url?.includes('/dashboard/');
    if (!isDashboardEndpoint) {
      // Lấy token từ Redux store thay vì localStorage
      const token = getTokenFromStore();
      const sessionId = getSessionIdFromStore();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (sessionId) {
        config.headers['x-session-id'] = sessionId;
      }
    }
    
    // Add CORS headers for development
    if (getEnvironment() === 'development') {
      config.headers['Access-Control-Allow-Origin'] = '*';
      config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    
    // Add request timestamp for debugging
    (config as any).metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (getEnvironment() === 'development') {
      const endTime = new Date();
      const startTime = (response.config as any).metadata?.startTime;
      const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;
      
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    
    return response;
  },
  (error) => {
    // Log errors
    const endTime = new Date();
    const startTime = (error.config as any)?.metadata?.startTime;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;
    
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'NETWORK'} (${duration}ms)`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth state but don't redirect automatically
      console.log('🔄 Unauthorized access detected');
      // Let components handle 401 errors themselves
    } else if (error.response?.status === 403) {
      // Forbidden - show permission error
      message.error('Bạn không có quyền thực hiện hành động này');
    } else if (error.response?.status === 429) {
      // Rate limited
      message.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
    } else if (error.response?.status >= 500) {
      // Server error
      message.error('Lỗi máy chủ. Vui lòng thử lại sau.');
    } else if (!error.response) {
      // Network error
      message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 