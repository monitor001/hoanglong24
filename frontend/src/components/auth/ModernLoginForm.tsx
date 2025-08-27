import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Typography, Alert } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { login, verifyTwoFactor, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
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
  const { isLoading, error, requireTwoFactor, tempUserId } = useSelector(
    (state: RootState) => state.auth
  );

  const [loginForm] = Form.useForm<LoginFormData>();
  const [twoFactorForm] = Form.useForm<TwoFactorFormData>();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (error && error.includes('Quá nhiều lần thử đăng nhập')) {
      setIsRateLimited(true);
      setCountdown(900);
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

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      loginForm.setFieldsValue({ email: rememberedEmail, remember: true });
    }
  }, [loginForm]);

  const handleLogin = async (values: LoginFormData) => {
    const { email, password, remember } = values;
    if (remember) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    await dispatch(login({ email, password }));
  };

  const handleVerify2FA = async (values: TwoFactorFormData) => {
    if (tempUserId) {
      await dispatch(verifyTwoFactor({ userId: tempUserId, token: values.code }));
    }
  };

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    dispatch(clearError());
  };

  if (requireTwoFactor) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card auth-card--2fa">
          <div className="auth-brand">
            <div className="auth-logo">MiniCDE</div>
            <div className="auth-tagline">Two-Factor Authentication</div>
          </div>
          {error && (
            <Alert message={error} type="error" showIcon className="auth-alert" />
          )}
          <Form
            form={twoFactorForm}
            name="twoFactor"
            onFinish={handleVerify2FA}
            layout="vertical"
            className="auth-form"
          >
            <Form.Item
              name="code"
              rules={[
                { required: true, message: t('errors.validation') },
                { len: 6, message: t('errors.validation') }
              ]}
            >
              <Input
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                className="auth-input auth-input--code"
                autoComplete="one-time-code"
                autoFocus
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="auth-button"
                block
              >
                {t('auth.verify')}
              </Button>
            </Form.Item>
            <Button type="link" onClick={handleBack} className="auth-link" block>
              {t('common.back')}
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-hero" aria-hidden="true">
        <div className="auth-hero__gradient" />
        <div className="auth-hero__pattern" />
      </div>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">MiniCDE</div>
          <div className="auth-tagline">Quản lý dự án BIM hiệu quả</div>
        </div>

        {error && (
          <Alert
            message={
              error.includes('Quá nhiều lần thử đăng nhập')
                ? 'Tài khoản bị tạm khóa do quá nhiều lần thử. Thử lại sau 15 phút.'
                : error
            }
            type="error"
            showIcon
            className="auth-alert"
          />
        )}

        <Form
          form={loginForm}
          name="login"
          initialValues={{ remember: false }}
          onFinish={handleLogin}
          layout="vertical"
          className="auth-form"
          disabled={isRateLimited}
        >
          <Form.Item
            name="email"
            label={t('auth.email')}
            rules={[
              { required: true, message: t('errors.validation') },
              { type: 'email', message: t('errors.validation') }
            ]}
          >
            <Input
              placeholder="you@example.com"
              className="auth-input"
              size="large"
              autoComplete="email"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[{ required: true, message: t('errors.validation') }]}
          >
            <Input.Password
              placeholder="••••••••"
              className="auth-input"
              size="large"
              autoComplete="current-password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <div className="auth-row">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="auth-checkbox">{t('auth.rememberMe')}</Checkbox>
            </Form.Item>
            <a href="#forgot-password" className="auth-link">
              {t('auth.forgotPassword')}
            </a>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={isRateLimited}
              className="auth-button"
              size="large"
              block
            >
              {isRateLimited ? `Thử lại sau ${formatCountdown(countdown)}` : t('auth.login')}
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">Project Management Support Tool Hoang Long 24</div>
      </div>
    </div>
  );
};

export default ModernLoginForm;
