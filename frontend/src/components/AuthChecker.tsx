import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { refreshToken } from '../store/slices/authSlice';

interface AuthCheckerProps {
  children: React.ReactNode;
}

const AuthChecker: React.FC<AuthCheckerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Nếu có token nhưng không có user, thử refresh token
        if (token && !user) {
          console.log('🔄 Checking authentication state...');
          await dispatch(refreshToken()).unwrap();
          console.log('✅ Authentication restored from token');
        }
        // Nếu không có token và đang ở trang cần auth, redirect to login
        else if (!token && !isLoading) {
          const publicPaths = ['/login', '/register', '/forgot-password', '/test'];
          const currentPath = window.location.pathname;
          
          if (!publicPaths.includes(currentPath)) {
            console.log('🔒 No authentication found, redirecting to login');
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        // Không redirect nếu có lỗi, chỉ log
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, token, user, isLoading]);

  // Hiển thị loading nếu đang kiểm tra auth
  if (isLoading || isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px'
      }}>
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthChecker;
