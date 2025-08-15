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

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available from localStorage, except for dashboard endpoints
    const isDashboardEndpoint = config.url?.includes('/dashboard/');
    if (!isDashboardEndpoint) {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');
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
    // Log response time for debugging
    const endTime = new Date();
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      // Only log in development mode
      if (getEnvironment() === 'development') {
        // Log only for slow requests (>1s) or errors
        if (duration > 1000) {
          console.warn(`⚠️ Slow API Response (${duration}ms): ${response.config.url}`);
        }
      }
    }
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('❌ Received HTML instead of JSON:', response.data);
      throw new Error('Server returned HTML instead of JSON. This might be a 404 or 500 error page.');
    }
    
    return response;
  },
  async (error) => {
    const { response, request, message } = error;
    
    // Log error details
    console.error('❌ API Error:', {
      status: response?.status,
      statusText: response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: message,
      data: response?.data,
    });
    
    if (response) {
      // Handle different status codes
      switch (response.status) {
        case 401:
          // Unauthorized - check if it's session expired or login failure
          const errorMessage = response.data?.error || '';
          const isLoginRequest = error.config?.url?.includes('/auth/login');
          
          if (isLoginRequest) {
            // This is a login failure, don't try to refresh token
            return Promise.reject(error);
          }
          
          // Check for specific session-related errors
          if (errorMessage.includes('Session expired') || 
              errorMessage.includes('Please login again') ||
              errorMessage.includes('Session expired or invalid')) {
            
            // Clear auth data from memory only (not localStorage)
            // sessionManager.clearAllSessionData();
            
            // Show user-friendly message about session expiration
            if (typeof window !== 'undefined' && window.alert) {
              window.alert('Phiên đăng nhập đã hết hạn hoặc bạn đã đăng nhập từ thiết bị khác. Vui lòng đăng nhập lại.');
            }
            
            // Redirect to login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }
          
          // Try to refresh token for other 401 errors (only if we have a token)
          const currentToken = tokenManager.getToken();
          if (currentToken) {
            try {
              await tokenManager.refreshToken();
              // Retry the original request
              const originalRequest = error.config;
              if (originalRequest) {
                const newToken = tokenManager.getToken();
                if (newToken) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  return axiosInstance(originalRequest);
                }
              }
            } catch (refreshError) {
              // Token refresh failed, clear auth data from memory only
              // sessionManager.clearAllSessionData();
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('❌ Access forbidden - insufficient permissions');
          const forbiddenData = response.data;
          const forbiddenMessage = forbiddenData?.message || 'Bạn chưa được cấp quyền để thực hiện thao tác này!';
          const forbiddenHint = forbiddenData?.hint || 'Vui lòng liên hệ quản trị viên để được cấp quyền.';
          
          message.error(`${forbiddenMessage} ${forbiddenHint}`);
          break;
          
        case 404:
          // Not found
          console.error('❌ Resource not found:', error.config?.url);
          break;
          
        case 500:
          // Server error
          console.error('❌ Server error:', response.data);
          break;
          
        default:
          // Other errors
          console.error('❌ Unexpected error:', response.status, response.data);
      }
    } else if (request) {
      // Network error (no response received)
      console.error('❌ Network error - no response received');
    } else {
      // Other error
      console.error('❌ Request setup error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 