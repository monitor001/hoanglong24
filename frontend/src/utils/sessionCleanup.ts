/**
 * Session Cleanup Utility
 * Dọn dẹp session cũ khi khởi động ứng dụng
 */

import { sessionManager } from './sessionManager';

export class SessionCleanup {
  private static instance: SessionCleanup;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  private constructor() {}
  
  public static getInstance(): SessionCleanup {
    if (!SessionCleanup.instance) {
      SessionCleanup.instance = new SessionCleanup();
    }
    return SessionCleanup.instance;
  }

  /**
   * Khởi tạo cleanup process
   */
  public initialize(): void {
    console.log('🧹 Initializing session cleanup...');
    
    // Dọn dẹp ngay lập tức khi khởi động
    this.performInitialCleanup();
    
    // Thiết lập interval để dọn dẹp định kỳ (mỗi 10 phút) - ít thường xuyên hơn
    this.cleanupInterval = setInterval(() => {
      this.performPeriodicCleanup();
    }, 10 * 60 * 1000);
    
    console.log('✅ Session cleanup initialized');
  }

  /**
   * Thực hiện dọn dẹp ban đầu khi khởi động app
   */
  private performInitialCleanup(): void {
    try {
      const sessionInfo = sessionManager.getSessionInfo();
      
      // Kiểm tra session có hợp lệ không
      if (!sessionManager.isSessionValid()) {
        console.log('🧹 Invalid session detected on startup, clearing...');
        sessionManager.clearAllSessionData();
        return;
      }
      
      // Kiểm tra session có quá cũ không (quá 7 ngày)
      if (sessionInfo.sessionAge && sessionInfo.sessionAge > 7 * 24 * 60 * 60 * 1000) {
        console.log('🧹 Session too old on startup, clearing...');
        sessionManager.clearAllSessionData();
        return;
      }
      
      console.log('✅ Initial session cleanup completed - session is valid');
    } catch (error) {
      console.error('❌ Error during initial session cleanup:', error);
      // Nếu có lỗi, xóa sạch session để đảm bảo an toàn
      sessionManager.clearAllSessionData();
    }
  }

  /**
   * Thực hiện dọn dẹp định kỳ
   */
  private performPeriodicCleanup(): void {
    try {
      const sessionInfo = sessionManager.getSessionInfo();
      
      // Kiểm tra token có sắp hết hạn không (trong vòng 1 giờ)
      if (sessionInfo.tokenExpiry) {
        const oneHourFromNow = (Date.now() / 1000) + (60 * 60);
        if (sessionInfo.tokenExpiry < oneHourFromNow) {
          console.log('⚠️ Token will expire soon:', new Date(sessionInfo.tokenExpiry * 1000));
        }
      }
      
      // Kiểm tra session có quá cũ không (quá 7 ngày)
      if (sessionInfo.sessionAge && sessionInfo.sessionAge > 7 * 24 * 60 * 60 * 1000) {
        console.log('🧹 Session too old during periodic cleanup, clearing...');
        sessionManager.clearAllSessionData();
        return;
      }
      
      console.log('✅ Periodic session cleanup completed - session is valid');
    } catch (error) {
      console.error('❌ Error during periodic session cleanup:', error);
      // Không xóa session ngay lập tức nếu có lỗi trong periodic cleanup
    }
  }

  /**
   * Dừng cleanup process
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    console.log('🛑 Session cleanup stopped');
  }

  /**
   * Force cleanup ngay lập tức
   */
  public forceCleanup(): void {
    console.log('🧹 Force cleanup requested...');
    this.performInitialCleanup();
  }

  /**
   * Kiểm tra trạng thái cleanup
   */
  public getStatus(): {
    isRunning: boolean;
    lastCleanup?: Date;
    sessionInfo: any;
  } {
    return {
      isRunning: this.cleanupInterval !== null,
      lastCleanup: new Date(),
      sessionInfo: sessionManager.getSessionInfo()
    };
  }
}

// Export singleton instance
export const sessionCleanup = SessionCleanup.getInstance();
