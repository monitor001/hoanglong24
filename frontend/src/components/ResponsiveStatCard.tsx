import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveChart';


import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/unified-mobile-cards.css';

const { Text } = Typography;

export interface ResponsiveStatCardProps {
  title: React.ReactNode;
  value: number;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  valueStyle?: React.CSSProperties;
  color?: string;
  function?: string; // Thêm thuộc tính function để xác định chức năng của thẻ
}

const ResponsiveStatCard: React.FC<ResponsiveStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  suffix, 
  valueStyle = {},
  color,
  function: functionType
}) => {
  const { isMobile } = useResponsiveBreakpoint();
  
  // Map các function đặc biệt để đồng nhất styling
  const getFunctionType = (type?: string) => {
    if (!type) return type;
    
    // Map các function đặc biệt
    const functionMap: Record<string, string> = {
      'documentiso': 'documents',
      'project-calendar': 'calendar', 
      'document-approval': 'approval',
      'design-checklist': 'checklist'
    };
    
    return functionMap[type] || type;
  };
  
  return (
    <Card 
      size={isMobile ? 'small' : 'default'}
      data-function={getFunctionType(functionType)}
    >
      <Statistic
        title={
          typeof title === 'string' ? (
            <Text 
              ellipsis 
              style={{ 
                fontSize: isMobile ? 10 : 11,
                lineHeight: isMobile ? '11px' : '14px',
                // Color will be handled by CSS for consistency
              }}
            >
              {title}
            </Text>
          ) : (
            title
          )
        }
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{ 
          fontSize: isMobile ? 16 : 18,
          color: color,
          // Additional styles will be handled by CSS
          ...valueStyle
        }}
      />
    </Card>
  );
};

export default ResponsiveStatCard; 