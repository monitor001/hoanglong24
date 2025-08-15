import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Switch, 
  Collapse,
  Tooltip,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  UpOutlined, 
  DownOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;

interface FilterOption {
  value: string;
  label: string;
}

interface ResponsiveCollapsibleFiltersProps {
  // Search
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  
  // Status filter
  statusValue: string;
  statusOptions: FilterOption[];
  onStatusChange: (value: string) => void;
  
  // Priority filter
  priorityValue: string;
  priorityOptions: FilterOption[];
  onPriorityChange: (value: string) => void;
  
  // Project filter
  projectValue: string;
  projectOptions: FilterOption[];
  onProjectChange: (value: string) => void;
  
  // Assignee filter
  assigneeValue: string;
  assigneeOptions: FilterOption[];
  onAssigneeChange: (value: string) => void;
  
  // Overdue filter
  overdueValue?: boolean;
  onOverdueChange?: (value: boolean) => void;
  
  // Reset function
  onReset: () => void;
  
  // Title
  title?: string;
  
  // Responsive props
  isMobile: boolean;
  isTabletLandscape: boolean;
  isDarkMode?: boolean;
  
  // Additional filters (optional)
  additionalFilters?: React.ReactNode;
}

const ResponsiveCollapsibleFilters: React.FC<ResponsiveCollapsibleFiltersProps> = ({
  searchValue,
  searchPlaceholder = "Tìm kiếm...",
  onSearchChange,
  statusValue,
  statusOptions,
  onStatusChange,
  priorityValue,
  priorityOptions,
  onPriorityChange,
  projectValue,
  projectOptions,
  onProjectChange,
  assigneeValue,
  assigneeOptions,
  onAssigneeChange,
  overdueValue = false,
  onOverdueChange,
  onReset,
  title = "Bộ lọc",
  isMobile,
  isTabletLandscape,
  isDarkMode = false,
  additionalFilters
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed state

  // Mobile view - use existing MobileFilters component
  if (isMobile) {
    return null; // Let parent handle mobile filters
  }

  // Desktop view - use traditional layout
  if (!isTabletLandscape) {
    return (
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4 }}>Tìm kiếm</div>
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </div>
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4 }}>Trạng thái</div>
              <Select
                placeholder="Tất cả trạng thái"
                value={statusValue}
                onChange={onStatusChange}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả</Option>
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4 }}>Ưu tiên</div>
              <Select
                placeholder="Tất cả ưu tiên"
                value={priorityValue}
                onChange={onPriorityChange}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả</Option>
                {priorityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4 }}>Dự án</div>
              <Select
                placeholder="Tất cả dự án"
                value={projectValue}
                onChange={onProjectChange}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả</Option>
                {projectOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4 }}>Người thực hiện</div>
              <Select
                placeholder="Tất cả người dùng"
                value={assigneeValue}
                onChange={onAssigneeChange}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả</Option>
                {assigneeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={2}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4 }}>&nbsp;</div>
              <Button 
                icon={<FilterOutlined />}
                onClick={onReset}
                style={{ width: '100%' }}
              >
                Reset
              </Button>
            </div>
          </Col>
        </Row>
        {onOverdueChange && (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={6}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Quá hạn:</div>
                <Switch
                  checked={overdueValue}
                  onChange={onOverdueChange}
                  checkedChildren="Có"
                  unCheckedChildren="Tất cả"
                />
              </div>
            </Col>
          </Row>
        )}
        {additionalFilters && (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={24}>
              {additionalFilters}
            </Col>
          </Row>
        )}
      </Card>
    );
  }

  // Tablet Landscape view - Collapsible layout
  return (
    <Card 
      style={{ marginBottom: 16 }} 
      className="tablet-landscape-filter-card"
      bodyStyle={{ padding: '12px 16px' }}
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
          <SettingOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500, fontSize: '14px' }}>{title}</span>
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
            {/* Row 1: Search and Status */}
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
            <Col span={12}>
              <div className="tablet-filter-item">
                <div className="tablet-filter-label">Trạng thái</div>
                <Select
                  placeholder="Tất cả trạng thái"
                  value={statusValue}
                  onChange={onStatusChange}
                  allowClear
                  style={{ width: '100%' }}
                  size="middle"
                >
                  <Option value="all">Tất cả</Option>
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            {/* Row 2: Priority and Project */}
            <Col span={12}>
              <div className="tablet-filter-item">
                <div className="tablet-filter-label">Ưu tiên</div>
                <Select
                  placeholder="Tất cả ưu tiên"
                  value={priorityValue}
                  onChange={onPriorityChange}
                  allowClear
                  style={{ width: '100%' }}
                  size="middle"
                >
                  <Option value="all">Tất cả</Option>
                  {priorityOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div className="tablet-filter-item">
                <div className="tablet-filter-label">Dự án</div>
                <Select
                  placeholder="Tất cả dự án"
                  value={projectValue}
                  onChange={onProjectChange}
                  allowClear
                  style={{ width: '100%' }}
                  size="middle"
                >
                  <Option value="all">Tất cả</Option>
                  {projectOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            {/* Row 3: Assignee, Overdue, and Reset */}
            <Col span={8}>
              <div className="tablet-filter-item">
                <div className="tablet-filter-label">Người thực hiện</div>
                <Select
                  placeholder="Tất cả người dùng"
                  value={assigneeValue}
                  onChange={onAssigneeChange}
                  allowClear
                  style={{ width: '100%' }}
                  size="middle"
                >
                  <Option value="all">Tất cả</Option>
                  {assigneeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            {onOverdueChange && (
              <Col span={8}>
                <div className="tablet-filter-item">
                  <div className="tablet-filter-label">Quá hạn</div>
                  <Switch
                    checked={overdueValue}
                    onChange={onOverdueChange}
                    checkedChildren="Có"
                    unCheckedChildren="Tất cả"
                    size="default"
                  />
                </div>
              </Col>
            )}
            <Col span={onOverdueChange ? 8 : 16}>
              <div className="tablet-filter-item">
                <div className="tablet-filter-label">&nbsp;</div>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={onReset}
                  size="middle"
                  style={{ width: '100%' }}
                >
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
          
          {/* Additional filters */}
          {additionalFilters && (
            <Row gutter={[16, 12]} style={{ marginTop: 8 }}>
              <Col span={24}>
                {additionalFilters}
              </Col>
            </Row>
          )}
        </Panel>
      </Collapse>
    </Card>
  );
};

export default ResponsiveCollapsibleFilters;
