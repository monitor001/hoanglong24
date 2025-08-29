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
  
  // Type filter (for Issues page)
  typeValue?: string;
  typeOptions?: FilterOption[];
  onTypeChange?: (value: string) => void;
  
  // Organization filter (for Users page)
  organizationValue?: string;
  organizationOptions?: FilterOption[];
  onOrganizationChange?: (value: string) => void;
  
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
  typeValue,
  typeOptions,
  onTypeChange,
  organizationValue,
  organizationOptions,
  onOrganizationChange,
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

  // Desktop view - optimized single row layout with proper spacing
  if (!isTabletLandscape) {
    return (
      <>
                 {/* Custom CSS for desktop selectors */}
         <style>
           {`
             /* Fix all filter elements alignment */
             .desktop-filter-container {
               display: flex !important;
               align-items: center !important;
               gap: 12px !important;
               flex-wrap: nowrap !important;
             }
             
             .desktop-filter-select {
               height: 44px !important;
               margin: 0 !important;
               display: flex !important;
               align-items: center !important;
             }
             
             .desktop-filter-select .ant-select-selector {
               margin: 0 !important;
               padding: 0 11px !important;
               height: 44px !important;
               line-height: 44px !important;
               display: flex !important;
               align-items: center !important;
             }
             .desktop-filter-select .ant-select-selection-search {
               margin: 0 !important;
               padding: 0 !important;
               height: 44px !important;
               line-height: 44px !important;
               display: flex !important;
               align-items: center !important;
             }
             .desktop-filter-select .ant-select-selection-item {
               margin: 0 !important;
               padding: 0 !important;
               height: 44px !important;
               line-height: 44px !important;
               display: flex !important;
               align-items: center !important;
             }
             
             /* Fix input alignment for desktop */
             .desktop-filter-input {
               height: 44px !important;
               margin: 0 !important;
               display: flex !important;
               align-items: center !important;
             }
             
             .desktop-filter-input .ant-input {
               height: 44px !important;
               line-height: 44px !important;
               padding: 0 11px !important;
               margin: 0 !important;
               display: flex !important;
               align-items: center !important;
             }
             .desktop-filter-input .ant-input-affix-wrapper {
               height: 44px !important;
               line-height: 44px !important;
               margin: 0 !important;
               padding: 0 !important;
               display: flex !important;
               align-items: center !important;
             }
             .desktop-filter-input .ant-input-prefix {
               margin-right: 8px !important;
               display: flex !important;
               align-items: center !important;
               height: 44px !important;
             }
             
             /* Ensure all filter elements have same baseline */
             .desktop-filter-item {
               display: flex !important;
               align-items: center !important;
               height: 44px !important;
               flex-shrink: 0 !important;
             }
             
                           /* Fix button alignment */
              .desktop-filter-item .ant-btn {
                height: 44px !important;
                margin: 0 !important;
                padding: 0 15px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
              
              /* Fix switch alignment for desktop */
              .desktop-filter-item .ant-switch {
                height: 44px !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .desktop-filter-item .ant-switch .ant-switch-inner {
                height: 44px !important;
                line-height: 44px !important;
                padding: 0 11px !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
              }
             
                           /* Flexible widths for different filter types */
              .desktop-filter-search {
                min-width: 300px !important;
                max-width: 400px !important;
                width: 350px !important;
                flex: none !important;
              }
              
              .desktop-filter-status {
                min-width: 140px !important;
                flex: 1 !important;
              }
              
              .desktop-filter-priority {
                min-width: 140px !important;
                flex: 1 !important;
              }
              
              .desktop-filter-project {
                min-width: 140px !important;
                flex: 1 !important;
              }
              
              .desktop-filter-assignee {
                min-width: 160px !important;
                flex: 1 !important;
              }
              
              .desktop-filter-organization {
                min-width: 140px !important;
                flex: 1 !important;
              }
              
              .desktop-filter-type {
                min-width: 120px !important;
                flex: 1 !important;
              }
              
              .desktop-filter-overdue {
                min-width: 100px !important;
                flex: 1 !important;
              }
              
              .desktop-filter-reset {
                min-width: 100px !important;
                flex: 1 !important;
              }
           `}
         </style>
        <Card 
          style={{ 
            marginBottom: 16,
            borderRadius: 8,
            boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
            border: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0'
          }}
          bodyStyle={{ 
            padding: '16px 20px',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff'
          }}
        >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0'
        }}>
          <FilterOutlined style={{ 
            color: isDarkMode ? '#1890ff' : '#1890ff', 
            marginRight: 8,
            fontSize: '16px'
          }} />
          <span style={{ 
            fontWeight: 600, 
            fontSize: '15px',
            color: isDarkMode ? '#ffffff' : '#262626'
          }}>
            {title}
          </span>
        </div>

                 {/* Single row layout - flexbox for better control */}
         <div className="desktop-filter-container">
                     {/* Search - Flexible width */}
           <div className="desktop-filter-item desktop-filter-search">
             <div style={{ 
               fontSize: '13px', 
               fontWeight: 500, 
               marginBottom: 4,
               color: isDarkMode ? '#d9d9d9' : '#595959'
             }}>
               Tìm kiếm
             </div>
              <Input
                 className="desktop-filter-input"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                 prefix={<SearchOutlined style={{ 
                   color: isDarkMode ? '#8c8c8c' : '#bfbfbf',
                   fontSize: '14px'
                 }} />}
                 style={{ 
                   borderRadius: 6,
                   height: '32px',
                   backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                   color: isDarkMode ? '#ffffff' : '#262626'
                 }}
                 size="small"
              />
            </div>

                     {/* Status filter */}
           <div className="desktop-filter-item desktop-filter-status">
             <div style={{ 
               fontSize: '13px', 
               fontWeight: 500, 
               marginBottom: 4,
               color: isDarkMode ? '#d9d9d9' : '#595959'
             }}>
               Trạng thái
             </div>
              <Select
                 className="desktop-filter-select"
                 placeholder="Tất cả"
                value={statusValue}
                onChange={onStatusChange}
                allowClear
                 style={{ 
                   width: '100%', 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9'
                 }}
                 dropdownStyle={{ 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                   margin: 0,
                   padding: 0
                 }}
                 size="small"
              >
                <Option value="all">Tất cả</Option>
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

                     {/* Priority filter */}
           <div className="desktop-filter-item desktop-filter-priority">
             <div style={{ 
               fontSize: '13px', 
               fontWeight: 500, 
               marginBottom: 4,
               color: isDarkMode ? '#d9d9d9' : '#595959'
             }}>
               Ưu tiên
             </div>
              <Select
                 className="desktop-filter-select"
                 placeholder="Tất cả"
                value={priorityValue}
                onChange={onPriorityChange}
                allowClear
                 style={{ 
                   width: '100%', 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9'
                 }}
                 dropdownStyle={{ 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                   margin: 0,
                   padding: 0
                 }}
                 size="small"
              >
                <Option value="all">Tất cả</Option>
                {priorityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

                     {/* Project filter */}
           <div className="desktop-filter-item desktop-filter-project">
             <div style={{ 
               fontSize: '13px', 
               fontWeight: 500, 
               marginBottom: 4,
               color: isDarkMode ? '#d9d9d9' : '#595959'
             }}>
               Dự án
             </div>
              <Select
                 className="desktop-filter-select"
                 placeholder="Tất cả"
                value={projectValue}
                onChange={onProjectChange}
                allowClear
                 style={{ 
                   width: '100%', 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9'
                 }}
                 dropdownStyle={{ 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                   margin: 0,
                   padding: 0
                 }}
                 size="small"
              >
                <Option value="all">Tất cả</Option>
                {projectOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

                     {/* Assignee filter */}
           <div className="desktop-filter-item desktop-filter-assignee">
             <div style={{ 
               fontSize: '13px', 
               fontWeight: 500, 
               marginBottom: 4,
               color: isDarkMode ? '#d9d9d9' : '#595959'
             }}>
               Người thực hiện
             </div>
              <Select
                 className="desktop-filter-select"
                 placeholder="Tất cả"
                value={assigneeValue}
                onChange={onAssigneeChange}
                allowClear
                 style={{ 
                   width: '100%', 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9'
                 }}
                 dropdownStyle={{ 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                   margin: 0,
                   padding: 0
                 }}
                 size="small"
              >
                <Option value="all">Tất cả</Option>
                {assigneeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

                     {/* Organization filter (for Users page) */}
           {onOrganizationChange && organizationOptions && (
             <div className="desktop-filter-item desktop-filter-organization">
               <div style={{ 
                 fontSize: '13px', 
                 fontWeight: 500, 
                 marginBottom: 4,
                 color: isDarkMode ? '#d9d9d9' : '#595959'
               }}>
                 Tổ chức
               </div>
               <Select
                 className="desktop-filter-select"
                 placeholder="Tất cả"
                 value={organizationValue}
                 onChange={onOrganizationChange}
                 allowClear
                 style={{ 
                   width: '100%', 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9'
                 }}
                 dropdownStyle={{ 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                   margin: 0,
                   padding: 0
                 }}
                 size="small"
               >
                 <Option value="all">Tất cả</Option>
                 {organizationOptions.map(option => (
                   <Option key={option.value} value={option.value}>
                     {option.label}
                   </Option>
                 ))}
               </Select>
             </div>
           )}

                     {/* Type filter (for Issues page) */}
           {onTypeChange && typeOptions && (
             <div className="desktop-filter-item desktop-filter-type">
               <div style={{ 
                 fontSize: '13px', 
                 fontWeight: 500, 
                 marginBottom: 4,
                 color: isDarkMode ? '#d9d9d9' : '#595959'
               }}>
                 Loại
               </div>
               <Select
                 className="desktop-filter-select"
                 placeholder="Tất cả"
                 value={typeValue}
                 onChange={onTypeChange}
                 allowClear
                 style={{ 
                   width: '100%', 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9'
                 }}
                 dropdownStyle={{ 
                   borderRadius: 6,
                   backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                   border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                   margin: 0,
                   padding: 0
                 }}
                 size="small"
               >
                 <Option value="all">Tất cả</Option>
                 {typeOptions.map(option => (
                   <Option key={option.value} value={option.value}>
                     {option.label}
                   </Option>
                 ))}
               </Select>
            </div>
           )}

                     {/* Overdue filter - inline with other filters */}
        {onOverdueChange && (
             <div className="desktop-filter-item desktop-filter-overdue">
               <div style={{ 
                 fontSize: '13px', 
                 fontWeight: 500, 
                 marginBottom: 4,
                 color: isDarkMode ? '#d9d9d9' : '#595959'
               }}>
                 Quá hạn
               </div>
                               <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '44px'
                }}>
                <Switch
                  checked={overdueValue}
                  onChange={onOverdueChange}
                  checkedChildren="Có"
                  unCheckedChildren="Tất cả"
                    size="small"
                />
              </div>
             </div>
           )}

                     {/* Reset button - smaller size and inline */}
           <div className="desktop-filter-item desktop-filter-reset">
             <div style={{ 
               fontSize: '13px', 
               fontWeight: 500, 
               marginBottom: 4,
               color: isDarkMode ? '#d9d9d9' : '#595959'
             }}>
               &nbsp;
             </div>
             <Button 
               icon={<FilterOutlined style={{ fontSize: '12px' }} />}
               onClick={onReset}
               style={{ 
                 width: '100%',
                 borderRadius: 6,
                 height: '32px',
                 backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                 border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                 color: isDarkMode ? '#ffffff' : '#262626',
                 fontSize: '12px',
                 padding: '0 8px'
               }}
               type="default"
               size="small"
             >
               Reset
             </Button>
           </div>
         </div>

        {/* Additional filters - only if needed */}
        {additionalFilters && (
          <div style={{ marginTop: 12 }}>
              {additionalFilters}
          </div>
        )}
      </Card>
       </>
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
            
            {/* Row 3: Assignee, Type, and Reset */}
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
            {onOrganizationChange && organizationOptions && (
              <Col span={8}>
                <div className="tablet-filter-item">
                  <div className="tablet-filter-label">Tổ chức</div>
                  <Select
                    placeholder="Tất cả tổ chức"
                    value={organizationValue}
                    onChange={onOrganizationChange}
                    allowClear
                    style={{ width: '100%' }}
                    size="middle"
                  >
                    <Option value="all">Tất cả</Option>
                    {organizationOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            )}
            {onTypeChange && typeOptions && (
              <Col span={8}>
                <div className="tablet-filter-item">
                  <div className="tablet-filter-label">Loại</div>
                  <Select
                    placeholder="Tất cả loại"
                    value={typeValue}
                    onChange={onTypeChange}
                    allowClear
                    style={{ width: '100%' }}
                    size="middle"
                  >
                    <Option value="all">Tất cả</Option>
                    {typeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            )}
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
            <Col span={
              (onTypeChange && typeOptions ? 1 : 0) + 
              (onOrganizationChange && organizationOptions ? 1 : 0) + 
              (onOverdueChange ? 1 : 0) === 0 ? 16 : 
              (onTypeChange && typeOptions ? 1 : 0) + 
              (onOrganizationChange && organizationOptions ? 1 : 0) + 
              (onOverdueChange ? 1 : 0) === 1 ? 8 : 8
            }>
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
