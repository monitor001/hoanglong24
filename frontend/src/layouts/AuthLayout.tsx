import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography, Select, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setLanguage } from '../store/slices/uiSlice';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const AuthLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { token } = theme.useToken();
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    dispatch(setLanguage(value as 'en' | 'vi'));
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: token.colorBgContainer,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        height: 'auto',
        minHeight: '64px'
      }}>
        <Title level={4} style={{ 
          margin: 0, 
          fontSize: '18px'
        }} className="auth-header-title">
          {t('app.name')}
        </Title>
        <Select
          defaultValue={i18n.language}
          style={{ 
            width: 'auto',
            minWidth: '120px'
          }}
          className="auth-language-select"
          onChange={handleLanguageChange}
          size="middle"
        >
          <Option value="en">English</Option>
          <Option value="vi">Tiếng Việt</Option>
        </Select>
      </Header>
      
      <Content style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 16px',
        minHeight: 'calc(100vh - 128px)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }} className="auth-content">
        <div style={{
          borderRadius: '8px',
          background: token.colorBgContainer,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          minHeight: 'fit-content',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
        className="auth-form-container"
        >
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center',
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        padding: '16px'
      }} className="auth-footer">
        <Text type="secondary" style={{
          fontSize: '14px'
        }} className="auth-footer-text">
          {t('app.name')} &copy; {new Date().getFullYear()} - {t('app.tagline')}
        </Text>
      </Footer>
    </Layout>
  );
};

export default AuthLayout; 