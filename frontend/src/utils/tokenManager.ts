import axios from 'axios';
import { config } from '../config/environment';

interface TokenInfo {
  token: string;
  expiresAt: number;
  userId: string;
  email: string;
  role: string;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Lấy token từ Redux store thay vì localStorage
  getToken(): string | null {
    try {
      const store = require('../store').store;
      const state = store.getState();
      return state.auth.token;
    } catch (error) {
      console.warn('Could not get token from store:', error);
      return null;
    }
  }

  // Kiểm tra token có hợp lệ không
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const tokenInfo = this.decodeToken(token);
      const now = Date.now();
      const expiresAt = tokenInfo.exp * 1000;
      
      // Token còn hiệu lực trong 5 phút
      const isValid = expiresAt > now + (5 * 60 * 1000);
      
      if (!isValid) {
        console.log('Token expired:', new Date(expiresAt), 'Current time:', new Date(now));
      }
      
      return isValid;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  // Xóa token - không cần thiết vì không lưu vào localStorage
  clearToken(): void {
    // Token được quản lý bởi Redux store, không cần xóa localStorage
    console.log('Token cleared from Redux store');
  }

  // Decode JWT token
  private decodeToken(token: string): any {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Browser-compatible base64 decoding
      const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    // Nếu đang refresh, trả về promise hiện tại
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string> {
    try {
      // Get current user info to refresh with their credentials
      const userInfo = this.getUserInfo();
      
      // If no user info is available, this means we're not logged in
      // or the session has expired completely
      if (!userInfo || !userInfo.email) {
        console.log('No user info available - session expired, requiring re-login');
        throw new Error('Session expired. Please log in again.');
      }

      // For now, we'll require re-login
      // In a real application, you would implement a proper refresh token mechanism
      console.log('Token refresh not implemented - requiring re-login');
      throw new Error('Token refresh requires re-authentication');
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Lấy thông tin user từ Redux store
  getUserInfo(): any {
    try {
      const store = require('../store').store;
      const state = store.getState();
      return state.auth.user;
    } catch (error) {
      console.warn('Could not get user info from store:', error);
      return null;
    }
  }

  // Kiểm tra và refresh token nếu cần
  async ensureValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.getToken()!;
    }

    console.log('Token expired, refreshing...');
    return this.refreshToken();
  }
}

export default TokenManager.getInstance(); 