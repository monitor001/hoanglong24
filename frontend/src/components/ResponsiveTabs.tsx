import React from 'react';
import { Tabs, Segmented } from 'antd';
import { 
  RadarChartOutlined, 
  CheckCircleOutlined, 
  BugOutlined, 
  FileTextOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveChart';

const { TabPane } = Tabs;

interface ResponsiveTabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  children: React.ReactNode;
}

const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({ 
  activeKey, 
  onChange, 
  children 
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsiveBreakpoint();
  
  if (isMobile) {
    return (
      <div style={{ marginTop: 16 }}>
        <Segmented
          options={[
            { 
              label: <RadarChartOutlined style={{ fontSize: 16 }} />, 
              value: 'overview',
              title: t('dashboard.overview')
            },
            { 
              label: <CheckCircleOutlined style={{ fontSize: 16 }} />, 
              value: 'tasks',
              title: t('dashboard.tasks')
            },
            { 
              label: <BugOutlined style={{ fontSize: 16 }} />, 
              value: 'issues',
              title: t('dashboard.issues')
            },
            { 
              label: <FileTextOutlined style={{ fontSize: 16 }} />, 
              value: 'documents',
              title: t('dashboard.documents')
            },
            { 
              label: <CalendarOutlined style={{ fontSize: 16 }} />, 
              value: 'calendar',
              title: t('dashboard.calendar')
            },
          ]}
          value={activeKey}
          onChange={(value) => onChange(value as string)}
          block
          style={{ marginBottom: 16 }}
        />
        <div>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === TabPane) {
              return child.key === activeKey ? child.props.children : null;
            }
            return null;
          })}
        </div>
      </div>
    );
  }
  
  return (
    <Tabs 
      activeKey={activeKey} 
      onChange={onChange}
      style={{ marginTop: 24 }}
    >
      {children}
    </Tabs>
  );
};

export default ResponsiveTabs; 