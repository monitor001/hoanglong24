import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Collapse,
  Tooltip,
  Space,
  Typography
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  UpOutlined, 
  DownOutlined,
  SettingOutlined,
  ClearOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;
const { Title } = Typography;

interface FilterOption {
  value: string;
  label: string;
}

interface TabletLandscapeCollapsibleFiltersProps {
  // Search
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  
  // Additional filters
  filters?: {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'input';
    value: any;
    options?: FilterOption[];
    placeholder?: string;
    onChange: (value: any) => void;
  }[];
  
  // Reset function
  onReset: () => void;
  
  // Title
  title?: string;
  
  // Theme
  isDarkMode?: boolean;
  
  // Custom content
  children?: React.ReactNode;
}

const TabletLandscapeCollapsibleFilters: React.FC<TabletLandscapeCollapsibleFiltersProps> = ({
  searchValue,
  searchPlaceholder = "Tìm kiếm...",
  onSearchChange,
  filters = [],
  onReset,
  title = "Tìm kiếm và Bộ lọc",
  isDarkMode = false,
  children
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed state

  const renderFilterItem = (filter: any) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select
            placeholder={filter.placeholder}
            value={filter.value}
            onChange={filter.onChange}
            allowClear
            size="middle"
            style={{ width: '100%' }}
          >
            {filter.options?.map((option: FilterOption) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      
      case 'multiselect':
        return (
          <Select
            mode="multiple"
            placeholder={filter.placeholder}
            value={filter.value}
            onChange={filter.onChange}
            allowClear
            size="middle"
            style={{ width: '100%' }}
          >
            {filter.options?.map((option: FilterOption) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      
      case 'input':
        return (
          <Input
            placeholder={filter.placeholder}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            size="middle"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card 
      style={{ 
        marginBottom: 16,
        background: isDarkMode ? '#1f1f1f' : '#fff',
        border: isDarkMode ? '1px solid #303030' : '1px solid #d9d9d9',
        borderRadius: '8px'
      }}
      bodyStyle={{ padding: '16px' }}
      className="tablet-landscape-collapsible-filter-card"
    >
      {/* Header with collapse toggle */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: isCollapsed ? 0 : 12,
          cursor: 'pointer'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SearchOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
          <Title level={5} style={{ 
            color: isDarkMode ? '#fff' : '#000', 
            margin: 0,
            fontSize: '14px'
          }}>
            {title}
          </Title>
        </div>
        <Tooltip title={isCollapsed ? "Mở rộng bộ lọc" : "Thu nhỏ bộ lọc"}>
          <Button 
            type="text" 
            size="small"
            icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
          />
        </Tooltip>
      </div>

      {/* Collapsible content */}
      <Collapse 
        activeKey={isCollapsed ? [] : ['filters']} 
        ghost
        style={{ 
          background: 'transparent',
          border: 'none'
        }}
      >
        <Panel 
          key="filters" 
          header={null}
          showArrow={false}
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: 0
          }}
        >
          <Row gutter={[16, 12]}>
            {/* Search field */}
            <Col span={12}>
              <div className="tablet-filter-item">
                <div className="tablet-filter-label">Tìm kiếm</div>
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  prefix={<SearchOutlined />}
                  size="middle"
                />
              </div>
            </Col>
            
            {/* Additional filters */}
            {filters.map((filter, index) => (
              <Col span={12} key={filter.key}>
                <div className="tablet-filter-item">
                  <div className="tablet-filter-label">{filter.label}</div>
                  {renderFilterItem(filter)}
                </div>
              </Col>
            ))}
            
            {/* Reset button */}
            <Col span={filters.length % 2 === 0 ? 12 : 24}>
              <div className="tablet-filter-item">
                <div className="tablet-filter-label">&nbsp;</div>
                <Button 
                  icon={<ClearOutlined />}
                  onClick={onReset}
                  size="middle"
                  style={{ width: '100%' }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </Col>
          </Row>
          
          {/* Custom content */}
          {children && (
            <Row gutter={[16, 12]} style={{ marginTop: 8 }}>
              <Col span={24}>
                {children}
              </Col>
            </Row>
          )}
        </Panel>
      </Collapse>
    </Card>
  );
};

export default TabletLandscapeCollapsibleFilters;
