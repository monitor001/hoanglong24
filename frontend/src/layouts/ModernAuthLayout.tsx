import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography, Select, theme, Space, Switch } from 'antd';
import { GlobalOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setLanguage, setTheme } from '../store/slices/uiSlice';
import { useTheme } from '../hooks/useTheme';
import './ModernAuthLayout.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ModernAuthLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { token } = theme.useToken();
  const { actualIsDarkMode } = useTheme();
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    dispatch(setLanguage(value as 'en' | 'vi'));
  };

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };
  
  return (
    <Layout className={`modern-auth-layout ${actualIsDarkMode ? 'dark' : 'light'}`}>
      <Header className="modern-auth-header">
        <div className="modern-auth-header-content">
          <div className="modern-auth-brand">
            <Title level={4} className="modern-auth-title">
              {t('app.name')}
            </Title>
          </div>
          
          <div className="modern-auth-controls">
            <Space size="middle">
              <div className="modern-theme-toggle-header">
                <Switch
                  checked={actualIsDarkMode}
                  onChange={handleThemeToggle}
                  checkedChildren={<BulbFilled />}
                  unCheckedChildren={<BulbOutlined />}
                  className="modern-theme-switch-header"
                  size="small"
                />
                <Text className="modern-theme-label-header">
                  {actualIsDarkMode ? t('common.darkMode') : t('common.lightMode')}
                </Text>
              </div>
              
              <Select
                defaultValue={i18n.language}
                className="modern-language-select"
                onChange={handleLanguageChange}
                size="middle"
                suffixIcon={<GlobalOutlined />}
              >
                <Option value="en">English</Option>
                <Option value="vi">Tiếng Việt</Option>
              </Select>
            </Space>
          </div>
        </div>
      </Header>
      
      <Content className="modern-auth-content">
        <div className="modern-auth-content-wrapper">
          <Outlet />
        </div>
      </Content>
      
      <Footer className="modern-auth-footer">
        <div className="modern-auth-footer-content">
          <Text className="modern-auth-footer-text">
            {t('app.name')} &copy; {new Date().getFullYear()} - {t('app.tagline')}
          </Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default ModernAuthLayout;
