/**
 * Session Manager Utility
 * Quản lý session và đảm bảo logout hoàn toàn
 */

export class SessionManager {
  private static instance: SessionManager;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private isCheckingSession = false; // Flag để tránh check trùng lặp
  private lastCheckTime = 0; // Thời gian check cuối cùng
  private readonly MIN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 phút
  private readonly FOCUS_DEBOUNCE_TIME = 1000; // 1 giây debounce cho focus
  
  private constructor() {}
  
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Xóa sạch tất cả session data
   */
  public clearAllSessionData(): void {
    // Xóa tất cả localStorage items liên quan đến auth
    const authKeys = [
      'token',
      'user',
      'sessionId',
      'tokenInfo',
      'rememberedEmail',
      'authState',
      'refreshToken',
      'lastActivity'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Xóa tất cả cookies liên quan đến auth
    this.clearAuthCookies();
    
    // Xóa Redux store nếu có
    this.clearReduxStore();
    
    // Dừng session check interval
    this.stopSessionCheck();
  }

  /**
   * Xóa tất cả cookies liên quan đến authentication
   */
  private clearAuthCookies(): void {
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Xóa các cookies liên quan đến auth
      if (name.includes('token') || name.includes('session') || name.includes('auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    });
  }

  /**
   * Xóa Redux store nếu có
   */
  private clearReduxStore(): void {
    // Dispatch action để clear Redux store nếu cần
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
      try {
        // Clear Redux DevTools
        window.__REDUX_DEVTOOLS_EXTENSION__.disconnect();
      } catch (error) {
        console.warn('Error disconnecting Redux DevTools:', error);
      }
    }
  }

  /**
   * Kiểm tra trạng thái session trên server
   */
  public async checkSessionStatus(): Promise<boolean> {
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('sessionId');
    
    if (!token || !sessionId) {
      return false;
    }
    
    try {
      // Import axiosInstance dynamically to avoid circular dependency
      const { default: axiosInstance } = await import('../axiosConfig');
      
      // Gọi API để kiểm tra trạng thái session
      const response = await axiosInstance.get('/auth/check-session');
      
      return response.data.isValid;
    } catch (error) {
      console.error('❌ Error checking session status:', error);
      return false;
    }
  }

  /**
   * Bắt đầu kiểm tra session định kỳ
   */
  public startSessionCheck(): void {
    if (this.sessionCheckInterval) {
      return; // Đã đang chạy
    }
    
    // Kiểm tra ngay lập tức
    this.performSessionCheck();
    
    // Kiểm tra định kỳ mỗi 5 phút thay vì 30 giây
    this.sessionCheckInterval = setInterval(() => {
      this.performSessionCheck();
    }, this.MIN_CHECK_INTERVAL);
    
    // Kiểm tra khi tab được focus với debounce
    let focusTimeout: NodeJS.Timeout | null = null;
    window.addEventListener('focus', () => {
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      focusTimeout = setTimeout(() => {
        this.performSessionCheck();
      }, this.FOCUS_DEBOUNCE_TIME);
    });
    
    // Loại bỏ việc kiểm tra khi user tương tác để giảm thiểu API calls
    // const events = ['click', 'keypress', 'scroll', 'mousemove'];
    // events.forEach(event => {
    //   window.addEventListener(event, () => {
    //     this.performSessionCheck();
    //   }, { passive: true });
    // });
  }

  /**
   * Dừng kiểm tra session
   */
  public stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Thực hiện kiểm tra session
   */
  private async performSessionCheck(): Promise<void> {
    // Tránh check trùng lặp
    if (this.isCheckingSession) {
      return;
    }
    
    // Kiểm tra thời gian tối thiểu giữa các lần check
    const now = Date.now();
    if (now - this.lastCheckTime < this.MIN_CHECK_INTERVAL) {
      return;
    }
    
    this.isCheckingSession = true;
    this.lastCheckTime = now;
    
    try {
      if (!this.isSessionValid()) {
        this.clearAllSessionData();
        this.redirectToLogin();
        return;
      }
      
      const isServerSessionValid = await this.checkSessionStatus();
      
      if (!isServerSessionValid) {
        this.clearAllSessionData();
        this.showSessionExpiredMessage();
        this.redirectToLogin();
      }
    } catch (error) {
      console.error('❌ Error during session check:', error);
      // Không logout ngay lập tức nếu có lỗi network
    } finally {
      this.isCheckingSession = false;
    }
  }

  /**
   * Hiển thị thông báo session hết hạn
   */
  private showSessionExpiredMessage(): void {
    if (typeof window !== 'undefined') {
      // Sử dụng alert đơn giản hoặc có thể tích hợp với notification system
      const message = 'Phiên đăng nhập đã hết hạn hoặc bạn đã đăng nhập từ thiết bị khác. Vui lòng đăng nhập lại.';
      
      if (window.alert) {
        window.alert(message);
      }
    }
  }

  /**
   * Chuyển hướng đến trang login
   */
  private redirectToLogin(): void {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Force logout - xóa sạch tất cả và redirect
   */
  public async forceLogout(): Promise<void> {
    try {
      // Gọi API logout để deactivate session trên server
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            // Server logout successful
          }
        } catch (error) {
          console.warn('⚠️ Server logout failed, but continuing with local cleanup');
        }
      }
    } catch (error) {
      console.warn('⚠️ Error during server logout:', error);
    } finally {
      // Luôn xóa sạch local data
      this.clearAllSessionData();
      
      // Redirect to login page
      this.redirectToLogin();
    }
  }

  /**
   * Kiểm tra và dọn dẹp session cũ
   */
  public cleanupOldSessions(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        // Kiểm tra token có hợp lệ không
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenData.exp && tokenData.exp < currentTime) {
          this.clearAllSessionData();
          return;
        }
        
        // Kiểm tra user data có hợp lệ không
        const userData = JSON.parse(user);
        if (!userData.id || !userData.email) {
          this.clearAllSessionData();
          return;
        }
      } catch (error) {
        this.clearAllSessionData();
      }
    }
  }

  /**
   * Tạo session mới
   */
  public createNewSession(token: string, user: any, sessionId?: string): void {
    // Xóa session cũ trước
    this.clearAllSessionData();
    
    // Lưu session mới
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
    }
    
    // Lưu thời gian tạo session
    localStorage.setItem('sessionCreated', Date.now().toString());
    
    // Bắt đầu kiểm tra session định kỳ
    this.startSessionCheck();
  }

  /**
   * Kiểm tra session có hợp lệ không
   */
  public isSessionValid(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        return false;
      }
      
      const userData = JSON.parse(user);
      return !!(userData.id && userData.email);
    } catch (error) {
      return false;
    }
  }

  /**
   * Lấy thông tin session hiện tại
   */
  public getSessionInfo(): {
    hasToken: boolean;
    hasUser: boolean;
    tokenExpiry?: number;
    userEmail?: string;
    sessionAge?: number;
  } {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const sessionCreated = localStorage.getItem('sessionCreated');
    
    const result = {
      hasToken: !!token,
      hasUser: !!user,
      tokenExpiry: undefined as number | undefined,
      userEmail: undefined as string | undefined,
      sessionAge: undefined as number | undefined
    };
    
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        result.tokenExpiry = tokenData.exp;
      } catch (error) {
        console.warn('Error parsing token:', error);
      }
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        result.userEmail = userData.email;
      } catch (error) {
        console.warn('Error parsing user data:', error);
      }
    }
    
    if (sessionCreated) {
      result.sessionAge = Date.now() - parseInt(sessionCreated);
    }
    
    return result;
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
