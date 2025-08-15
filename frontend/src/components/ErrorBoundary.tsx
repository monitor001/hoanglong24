import React from 'react';
import { Alert } from 'antd';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert
          message="Đã xảy ra lỗi"
          description="Không thể hiển thị timeline. Vui lòng thử lại sau."
          type="error"
          showIcon
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;