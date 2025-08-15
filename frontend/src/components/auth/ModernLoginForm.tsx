import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Typography, Alert, Space, Divider, Switch } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { login, verifyTwoFactor, clearError } from '../../store/slices/authSlice';
import { setTheme } from '../../store/slices/uiSlice';
import { RootState, AppDispatch } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import './ModernLoginForm.css';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface TwoFactorFormData {
  code: string;
}

const ModernLoginForm: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, actualIsDarkMode } = useTheme();
  
  const { isLoading, error, requireTwoFactor, tempUserId, token } = useSelector(
    (state: RootState) => state.auth
  );
  
  const [loginForm] = Form.useForm<LoginFormData>();
  const [twoFactorForm] = Form.useForm<TwoFactorFormData>();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  // Handle rate limiting
  useEffect(() => {
    if (error && error.includes('Quá nhiều lần thử đăng nhập')) {
      setIsRateLimited(true);
      setCountdown(900); // 15 minutes
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [error]);
  
  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      loginForm.setFieldsValue({ email: rememberedEmail, remember: true });
    }
  }, [loginForm]);

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };
  
  // Handle login submission
  const handleLogin = async (values: LoginFormData) => {
    const { email, password, remember } = values;
    
    if (remember) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    await dispatch(login({ email, password }));
  };
  
  // Handle 2FA verification
  const handleVerify2FA = async (values: TwoFactorFormData) => {
    if (tempUserId) {
      await dispatch(verifyTwoFactor({ userId: tempUserId, token: values.code }));
    }
  };
  
  // Format countdown
  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Clear error and go back
  const handleBack = () => {
    dispatch(clearError());
  };

  // Theme toggle component
  const ThemeToggle = () => (
    <div className="modern-theme-toggle">
      <Switch
        checked={actualIsDarkMode}
        onChange={handleThemeToggle}
        checkedChildren={<BulbFilled />}
        unCheckedChildren={<BulbOutlined />}
        className="modern-theme-switch"
      />
      <Text className="modern-theme-label">
        {actualIsDarkMode ? t('common.darkMode') : t('common.lightMode')}
      </Text>
    </div>
  );
  
  if (requireTwoFactor) {
    return (
      <div className={`modern-login-container ${actualIsDarkMode ? 'dark' : 'light'}`}>
        <div className="modern-login-form">
          <div className="modern-login-header">
            <Title level={2} className="modern-login-title">
              {t('auth.twoFactorAuth')}
            </Title>
            <Text className="modern-login-subtitle">
              {t('auth.twoFactorCode')}
            </Text>
          </div>
          
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="modern-login-alert"
            />
          )}
          
          <Form
            form={twoFactorForm}
            name="twoFactor"
            onFinish={handleVerify2FA}
            layout="vertical"
            className="modern-login-form-content"
          >
            <Form.Item
              name="code"
              rules={[
                { required: true, message: t('errors.validation') },
                { len: 6, message: t('errors.validation') }
              ]}
            >
              <Input
                prefix={<LockOutlined className="modern-input-icon" />}
                placeholder="000000"
                maxLength={6}
                className="modern-input modern-input-2fa"
                autoComplete="off"
                autoFocus
              />
            </Form.Item>
            
            <Form.Item className="modern-form-actions">
              <Space direction="vertical" className="modern-action-buttons">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="modern-primary-button"
                  size="large"
                >
                  {t('auth.verify')}
                </Button>
                <Button
                  type="link"
                  onClick={handleBack}
                  className="modern-link-button"
                >
                  {t('common.back')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`modern-login-container ${actualIsDarkMode ? 'dark' : 'light'}`}>
      <div className="modern-login-form">
        <div className="modern-login-header">
          <Title level={2} className="modern-login-title">
            {t('auth.login')}
          </Title>
          <Text className="modern-login-subtitle">
            {t('auth.welcomeBack')}
          </Text>
        </div>
        
        {error && (
          <Alert
            message={
              error.includes('Quá nhiều lần thử đăng nhập')
                ? 'Tài khoản đã bị tạm khóa do quá nhiều lần thử đăng nhập sai. Vui lòng thử lại sau 15 phút.'
                : error
            }
            type="error"
            showIcon
            className="modern-login-alert"
          />
        )}
        
        <Form
          form={loginForm}
          name="login"
          initialValues={{ remember: false }}
          onFinish={handleLogin}
          layout="vertical"
          className="modern-login-form-content"
          disabled={isRateLimited}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('errors.validation') },
              { type: 'email', message: t('errors.validation') }
            ]}
          >
            <Input
              prefix={<UserOutlined className="modern-input-icon" />}
              placeholder={t('auth.email')}
              className="modern-input"
              size="large"
              autoComplete="email"
              autoFocus
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('errors.validation') }]}
          >
            <Input.Password
              prefix={<LockOutlined className="modern-input-icon" />}
              placeholder={t('auth.password')}
              className="modern-input"
              size="large"
              autoComplete="current-password"
              iconRender={(visible) => 
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
          
          <Form.Item className="modern-form-options">
            <div className="modern-options-container">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="modern-checkbox">
                  {t('auth.rememberMe')}
                </Checkbox>
              </Form.Item>
              <a href="#forgot-password" className="modern-forgot-link">
                {t('auth.forgotPassword')}
              </a>
            </div>
          </Form.Item>
          
          <Form.Item className="modern-form-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={isRateLimited}
              className="modern-primary-button"
              size="large"
              block
            >
              {isRateLimited 
                ? `Thử lại sau ${formatCountdown(countdown)}`
                : t('auth.login')
              }
            </Button>
          </Form.Item>
        </Form>
        
        <Divider className="modern-divider">
          <Text type="secondary" className="modern-divider-text">
            {t('app.tagline')}
          </Text>
        </Divider>

        <ThemeToggle />
      </div>
    </div>
  );
};

export default ModernLoginForm;
