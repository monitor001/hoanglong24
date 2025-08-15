import React from 'react';
import { Button, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useResponsiveWithOrientation } from '../hooks/useResponsive';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  color?: string;
  tooltip?: string;
  bottom?: number;
  right?: number;
  size?: 'small' | 'middle' | 'large';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showOnTablet?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <PlusOutlined />,
  color,
  tooltip,
  bottom = 80,
  right = 16,
  size = 'large',
  variant = 'primary',
  showOnTablet = true
}) => {
  const { token } = theme.useToken();
  const { isMobile, isTabletLandscape } = useResponsiveWithOrientation();

  // Chỉ hiển thị trên mobile hoặc tablet landscape (nếu được cho phép)
  if (!isMobile && !(isTabletLandscape && showOnTablet)) {
    return null;
  }

  const buttonSize = size === 'large' ? 56 : size === 'middle' ? 48 : 40;
  const iconSize = size === 'large' ? '20px' : size === 'middle' ? '16px' : '14px';

  // Điều chỉnh vị trí cho tablet landscape
  const adjustedBottom = isTabletLandscape ? bottom - 20 : bottom;
  const adjustedRight = isTabletLandscape ? right + 20 : right;

  // Màu sắc theo variant
  const getVariantColor = () => {
    switch (variant) {
      case 'secondary':
        return token.colorBgContainer;
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'danger':
        return '#ff4d4f';
      default:
        return color ? color : `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`;
    }
  };

  // Border color cho tablet landscape
  const getBorderColor = () => {
    if (isTabletLandscape) {
      switch (variant) {
        case 'secondary':
          return token.colorBorder;
        case 'success':
          return '#52c41a';
        case 'warning':
          return '#faad14';
        case 'danger':
          return '#ff4d4f';
        default:
          return token.colorPrimary;
      }
    }
    return 'transparent';
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: adjustedBottom, 
      right: adjustedRight, 
      zIndex: 1000 
    }}>
      <Button
        type={variant === 'secondary' ? 'default' : 'primary'}
        shape="circle"
        size={size}
        icon={icon}
        title={tooltip}
        style={{ 
          width: buttonSize,
          height: buttonSize,
          background: getVariantColor(),
          border: isTabletLandscape ? `2px solid ${getBorderColor()}` : 'none',
          boxShadow: isTabletLandscape 
            ? '0 6px 16px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)' 
            : '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isTabletLandscape ? 'scale(1.1)' : 'scale(1)',
          color: variant === 'secondary' ? token.colorText : '#fff'
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (isTabletLandscape) {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (isTabletLandscape) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)';
          }
        }}
      />
    </div>
  );
};

export default FloatingActionButton;
