import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosConfig';
import { jwtDecode } from 'jwt-decode';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  requireTwoFactor: boolean;
  tempUserId: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  sessionId?: string;
  requireTwoFactor?: boolean;
  userId?: string;
}

interface TwoFactorVerifyData {
  userId: string;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  organization?: string;
}

// Initial state
const initialState: AuthState = {
  user: null, // Không lưu user từ localStorage
  token: null, // Không lưu token từ localStorage
  isLoading: false,
  error: null,
  requireTwoFactor: false,
  tempUserId: null,
};

// Async thunks
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      
      // Check if 2FA is required
      if (response.data.requireTwoFactor) {
        return {
          user: {} as User,
          token: '',
          requireTwoFactor: true,
          userId: response.data.userId,
        };
      }
      
      // Store token, user, and sessionId in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      
      // Note: User permissions will be loaded separately after login
      // to avoid circular dependency issues
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Extract error message from response
      let errorMessage = 'Login failed';
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyTwoFactor = createAsyncThunk<LoginResponse, TwoFactorVerifyData>(
  'auth/verifyTwoFactor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/verify-2fa', data);
      
      // Store token, user, and sessionId in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      
      // Note: User permissions will be loaded separately after 2FA verification
      // to avoid circular dependency issues
      
      return response.data;
    } catch (error: any) {
      console.error('❌ 2FA verification error:', error);
      return rejectWithValue(error.response?.data?.error || '2FA verification failed');
    }
  }
);

export const register = createAsyncThunk<LoginResponse, RegisterData>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', data);
      
      // Store token, user, and sessionId in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout endpoint
      await axiosInstance.post('/auth/logout');
      
      // Clear session data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      
      // Even if logout fails, clear local session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    
    if (!auth.token) {
      return rejectWithValue('No token available');
    }
    
    try {
      // Check if token is expired
      const decodedToken: any = jwtDecode(auth.token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token is expired, try to refresh
        const response = await axiosInstance.post('/auth/refresh-token');
        
        // Store new token, user, and sessionId in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.sessionId) {
          localStorage.setItem('sessionId', response.data.sessionId);
        }
        
        return response.data;
      }
      
      // Token is still valid
      return { token: auth.token, user: auth.user };
    } catch (error: any) {
      // Clear token, user, and sessionId from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      
      return rejectWithValue(error.response?.data?.error || 'Token refresh failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      
      if (action.payload.requireTwoFactor) {
        state.requireTwoFactor = true;
        state.tempUserId = action.payload.userId || null;
      } else {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.requireTwoFactor = false;
        state.tempUserId = null;
        if (action.payload.sessionId) {
          localStorage.setItem('sessionId', action.payload.sessionId);
        }
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Verify Two-Factor
    builder.addCase(verifyTwoFactor.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyTwoFactor.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.requireTwoFactor = false;
      state.tempUserId = null;
      if (action.payload.sessionId) {
        localStorage.setItem('sessionId', action.payload.sessionId);
      }
    });
    builder.addCase(verifyTwoFactor.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.sessionId) {
        localStorage.setItem('sessionId', action.payload.sessionId);
      }
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
    });
    
    // Refresh Token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (action.payload.sessionId) {
        localStorage.setItem('sessionId', action.payload.sessionId);
      }
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
    });
  },
});

export const { clearError, updateUser } = authSlice.actions;

export default authSlice.reducer; 