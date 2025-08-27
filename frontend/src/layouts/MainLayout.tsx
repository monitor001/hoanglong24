import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Button, Dropdown, Avatar, Typography, Space, Badge, Drawer, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  GlobalOutlined,
  BulbOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CommentOutlined,
  FormOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';

import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { toggleSidebar, setLanguage, setTheme } from '../store/slices/uiSlice';
import { useTheme } from '../hooks/useTheme';
import io from 'socket.io-client';
import NotificationCenter from '../components/NotificationCenter';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = theme.useToken();
  const { actualIsDarkMode } = useTheme();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState<boolean>(false);
  const [notificationsVisible, setNotificationsVisible] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  
  const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001', {
    transports: ['websocket']
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set data-theme attribute for CSS selectors
  useEffect(() => {
    const themeValue = actualIsDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeValue);
    document.body.setAttribute('data-theme', themeValue);
  }, [actualIsDarkMode]);

  // Get current path for menu selection
  const currentPath = location.pathname.split('/')[1] || 'dashboard';
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/login');
  };
  
  // Handle language change
  const handleLanguageChange = (lang: 'en' | 'vi') => {
    i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
  };
  
  // Handle theme change
  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(mode));
  };

  // Toggle sidebar
  const toggle = () => {
    dispatch(toggleSidebar());
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Navigate to related content based on notification type
    if (notification.relatedType && notification.relatedId) {
      switch (notification.relatedType) {
        case 'task':
          navigate(`/tasks?taskId=${notification.relatedId}`);
          break;
        case 'issue':
          navigate(`/issues?issueId=${notification.relatedId}`);
          break;
        case 'project':
          navigate(`/projects?projectId=${notification.relatedId}`);
          break;
        default:
          break;
      }
    }
    setNotificationsVisible(false);
  };

  useEffect(() => {
    if (user?.id) {
      socket.emit('join-user', user.id);
    }
  }, [user?.id]);

  // Menu items - All enabled without permission checks
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
      onClick: () => navigate('/dashboard'),
      description: 'Tổng quan hệ thống và thống kê'
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: t('navigation.projects'),
      onClick: () => navigate('/projects'),
      description: 'Quản lý dự án và thông tin chi tiết'
    },
    {
      key: 'documents-iso',
      icon: <FileTextOutlined />,
      label: 'Tài liệu ISO 19650',
      onClick: () => navigate('/documents-iso'),
      description: 'Quản lý tài liệu theo chuẩn ISO 19650'
    },
    {
      key: 'tasks',
      icon: <CheckSquareOutlined />,
      label: t('navigation.tasks'),
      onClick: () => navigate('/tasks'),
      description: 'Quản lý nhiệm vụ và công việc'
    },
    {
      key: 'issues',
      icon: <ExclamationCircleOutlined />,
      label: t('navigation.issues'),
      onClick: () => navigate('/issues'),
      description: 'Quản lý vấn đề và sự cố'
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Lịch',
      onClick: () => navigate('/calendar'),
      description: 'Quản lý lịch họp, deadline, milestone và các sự kiện dự án'
    },
    {
      key: 'notes',
      icon: <CommentOutlined />,
      label: 'Ghi chú',
      onClick: () => navigate('/notes')
    },
    {
      key: 'design-checklist',
      icon: <FormOutlined />,
      label: 'Hồ sơ Thiết kế',
      onClick: () => navigate('/design-checklist'),
      description: 'Quản lý checklist hồ sơ thiết kế'
    },
    {
      key: 'approval-kanban',
      icon: <AppstoreOutlined />,
      label: 'Phê duyệt hồ sơ',
      onClick: () => navigate('/approval-kanban'),
      description: 'Quản lý quy trình phê duyệt hồ sơ theo dạng Kanban'
    },
    {
      key: 'todo-list',
      icon: <UnorderedListOutlined />,
      label: 'Danh sách nhiệm vụ',
      onClick: () => navigate('/todo-list'),
      description: 'Quản lý nhiệm vụ theo ngày với giao diện album'
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Báo cáo',
      onClick: () => navigate('/reports'),
      description: 'Quản lý báo cáo và theo dõi hoạt động hệ thống'
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: t('navigation.users'),
      onClick: () => navigate('/users')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
      onClick: () => navigate('/settings')
    }
  ];
  
  // User dropdown menu
  const userMenu: MenuProps = {
    items: [
      {
        key: '1',
        icon: <UserOutlined />,
        label: t('settings.profile'),
        onClick: () => navigate('/settings')
      },
      {
        key: '2',
        icon: <LogoutOutlined />,
        label: t('auth.logout'),
        onClick: handleLogout
      }
    ]
  };
  
  // Language dropdown menu
  const languageMenu: MenuProps = {
    items: [
      {
        key: 'en',
        label: 'English',
        onClick: () => handleLanguageChange('en')
      },
      {
        key: 'vi',
        label: 'Tiếng Việt',
        onClick: () => handleLanguageChange('vi')
      }
    ]
  };
  
  // Theme dropdown menu
  const themeMenu: MenuProps = {
    items: [
      {
        key: 'light',
        label: t('settings.theme.light'),
        onClick: () => handleThemeChange('light')
      },
      {
        key: 'dark',
        label: t('settings.theme.dark'),
        onClick: () => handleThemeChange('dark')
      },
      {
        key: 'system',
        label: t('settings.theme.system'),
        onClick: () => handleThemeChange('system')
      }
    ]
  };
  

  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={sidebarCollapsed}
          breakpoint="lg"
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            background: actualIsDarkMode ? '#001529' : '#ffffff',
            boxShadow: actualIsDarkMode ? '2px 0 8px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.1)',
            borderRight: actualIsDarkMode ? '1px solid #303030' : '1px solid #f0f0f0'
          }}
          theme={actualIsDarkMode ? 'dark' : 'light'}
        >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          padding: sidebarCollapsed ? 0 : '0 16px',
          color: actualIsDarkMode ? '#ffffff' : '#1890ff',
          fontSize: 20,
          fontWeight: 'bold',
          background: actualIsDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(24,144,255,0.05)',
          borderBottom: actualIsDarkMode ? '1px solid #303030' : '1px solid #f0f0f0'
        }}>
          {!sidebarCollapsed && 'Hoàng Long'}
          {sidebarCollapsed && 'HL'}
        </div>
        <Menu
          theme={actualIsDarkMode ? 'dark' : 'light'}
          mode="inline"
          defaultSelectedKeys={[currentPath]}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none'
          }}
        />
        </Sider>
      )}
      
      {/* Mobile Drawer - Hidden, replaced by bottom navigation */}
      {!isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          bodyStyle={{ padding: 0 }}
          title="Hoàng Long"
        >
          <Menu
            theme={actualIsDarkMode ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={[currentPath]}
            items={menuItems}
            style={{
              background: actualIsDarkMode ? '#001529' : '#ffffff',
              border: 'none'
            }}
          />
        </Drawer>
      )}
      
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 200), 
        transition: 'all 0.2s' 
      }}>
        <Header style={{ 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          background: token.colorBgContainer,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Button
                type="text"
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggle}
              />
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size="middle">
              <Dropdown menu={themeMenu} placement="bottomRight">
                <Button type="text" icon={<BulbOutlined />} />
              </Dropdown>
              
              <Dropdown menu={languageMenu} placement="bottomRight">
                <Button type="text" icon={<GlobalOutlined />} />
              </Dropdown>
              
              <Badge count={0} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  onClick={() => setNotificationsVisible(true)}
                />
              </Badge>
              
              <Dropdown menu={userMenu} placement="bottomRight">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user?.name}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        
        <Content style={{ 
          margin: isMobile ? '0' : '24px 16px', 
          padding: isMobile ? 0 : 24, 
          paddingBottom: isMobile ? '90px' : 24, // Increased space for bottom nav
          background: token.colorBgContainer, 
          borderRadius: isMobile ? 0 : 4 
        }}>
          <Outlet />
        </Content>
      </Layout>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          backgroundColor: actualIsDarkMode ? '#141414' : '#ffffff',
          borderTop: `1px solid ${actualIsDarkMode ? '#303030' : '#f0f0f0'}`,
          zIndex: 1000,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
        }}>
          <div 
            className="mobile-nav-scroll"
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              padding: '0 12px',
              overflowX: 'auto',
              overflowY: 'hidden',
              gap: '8px'
            }}>
            {menuItems.filter(item => item?.key !== 'divider').map((item: any) => (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  opacity: currentPath === item.key ? 1 : 0.6,
                  color: currentPath === item.key ? '#1890ff' : (actualIsDarkMode ? '#ffffff' : '#000000'),
                  minWidth: '60px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: currentPath === item.key ? (actualIsDarkMode ? 'rgba(24,144,255,0.1)' : 'rgba(24,144,255,0.1)') : 'transparent',
                  flexShrink: 0
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '2px' }}>
                  {item.icon}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  maxWidth: '50px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Notification Center */}
      <NotificationCenter
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
        onNotificationClick={handleNotificationClick}
      />
    </Layout>
  );
};

export default MainLayout; 