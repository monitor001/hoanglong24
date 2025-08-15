import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Space, Select, Button, Typography, Collapse, Badge } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveChart';

const { Text } = Typography;
const { Panel } = Collapse;

interface FilterOption {
  label: string;
  value: string;
}

interface ResponsiveFiltersProps {
  // Task filters
  taskCategoryFilter: string;
  taskStatusFilter: string;
  taskPriorityFilter: string;
  onTaskCategoryChange: (value: string) => void;
  onTaskStatusChange: (value: string) => void;
  onTaskPriorityChange: (value: string) => void;
  taskCategoryOptions: FilterOption[];
  taskStatusOptions: FilterOption[];
  taskPriorityOptions: FilterOption[];
  
  // Issue filters
  issueCategoryFilter: string;
  issueStatusFilter: string;
  issuePriorityFilter: string;
  onIssueCategoryChange: (value: string) => void;
  onIssueStatusChange: (value: string) => void;
  onIssuePriorityChange: (value: string) => void;
  issueCategoryOptions: FilterOption[];
  issueStatusOptions: FilterOption[];
  issuePriorityOptions: FilterOption[];
  
  // Reset handlers
  onResetTaskFilters: () => void;
  onResetIssueFilters: () => void;
  
  // Filter type
  filterType: 'task' | 'issue';
}

const ResponsiveFilters: React.FC<ResponsiveFiltersProps> = ({
  // Task filters
  taskCategoryFilter,
  taskStatusFilter,
  taskPriorityFilter,
  onTaskCategoryChange,
  onTaskStatusChange,
  onTaskPriorityChange,
  taskCategoryOptions,
  taskStatusOptions,
  taskPriorityOptions,
  
  // Issue filters
  issueCategoryFilter,
  issueStatusFilter,
  issuePriorityFilter,
  onIssueCategoryChange,
  onIssueStatusChange,
  onIssuePriorityChange,
  issueCategoryOptions,
  issueStatusOptions,
  issuePriorityOptions,
  
  // Reset handlers
  onResetTaskFilters,
  onResetIssueFilters,
  
  // Filter type
  filterType
}) => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useResponsiveBreakpoint();
  const [collapsed, setCollapsed] = useState(true);

  // Get current filter values based on type
  const getCurrentFilters = useCallback(() => {
    if (filterType === 'task') {
      return {
        categoryFilter: taskCategoryFilter,
        statusFilter: taskStatusFilter,
        priorityFilter: taskPriorityFilter,
        categoryOptions: taskCategoryOptions,
        statusOptions: taskStatusOptions,
        priorityOptions: taskPriorityOptions,
        onCategoryChange: onTaskCategoryChange,
        onStatusChange: onTaskStatusChange,
        onPriorityChange: onTaskPriorityChange,
        onReset: onResetTaskFilters,
        statusDisabled: taskCategoryFilter === 'all',
        priorityDisabled: taskCategoryFilter === 'all'
      };
    } else {
      return {
        categoryFilter: issueCategoryFilter,
        statusFilter: issueStatusFilter,
        priorityFilter: issuePriorityFilter,
        categoryOptions: issueCategoryOptions,
        statusOptions: issueStatusOptions,
        priorityOptions: issuePriorityOptions,
        onCategoryChange: onIssueCategoryChange,
        onStatusChange: onIssueStatusChange,
        onPriorityChange: onIssuePriorityChange,
        onReset: onResetIssueFilters,
        statusDisabled: issueCategoryFilter === 'all',
        priorityDisabled: issueCategoryFilter === 'all'
      };
    }
  }, [
    filterType,
    taskCategoryFilter, taskStatusFilter, taskPriorityFilter,
    issueCategoryFilter, issueStatusFilter, issuePriorityFilter,
    taskCategoryOptions, taskStatusOptions, taskPriorityOptions,
    issueCategoryOptions, issueStatusOptions, issuePriorityOptions,
    onTaskCategoryChange, onTaskStatusChange, onTaskPriorityChange,
    onIssueCategoryChange, onIssueStatusChange, onIssuePriorityChange,
    onResetTaskFilters, onResetIssueFilters
  ]);

  // Count active filters
  const getActiveFilterCount = useCallback(() => {
    const filters = getCurrentFilters();
    let count = 0;
    if (filters.categoryFilter !== 'all') count++;
    if (filters.statusFilter !== 'all') count++;
    if (filters.priorityFilter !== 'all') count++;
    return count;
  }, [getCurrentFilters]);

  // Render filter controls
  const renderFilterControls = useCallback(() => {
    const filters = getCurrentFilters();
    
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Category Filter */}
        <div>
          <Text strong>{t('dashboard.filterByCategory')}:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={filters.categoryFilter}
            onChange={filters.onCategoryChange}
            options={filters.categoryOptions}
            placeholder={t('dashboard.selectCategory')}
          />
        </div>
        
        {/* Status Filter */}
        <div>
          <Text strong>{t('dashboard.filterByStatus')}:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={filters.statusFilter}
            onChange={filters.onStatusChange}
            options={filters.statusOptions}
            disabled={filters.statusDisabled}
            placeholder={t('dashboard.selectStatus')}
          />
        </div>
        
        {/* Priority Filter */}
        <div>
          <Text strong>{t('dashboard.filterByPriority')}:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={filters.priorityFilter}
            onChange={filters.onPriorityChange}
            options={filters.priorityOptions}
            disabled={filters.priorityDisabled}
            placeholder={t('dashboard.selectPriority')}
          />
        </div>
        
        {/* Reset Button */}
        <Button 
          type="default" 
          icon={<ReloadOutlined />}
          onClick={filters.onReset}
          block
        >
          {t('common.reset')}
        </Button>
      </Space>
    );
  }, [getCurrentFilters, t]);

  // Mobile view with collapsible filters
  if (isMobile) {
    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Collapse
          ghost
          expandIconPosition="right"
          onChange={() => setCollapsed(!collapsed)}
        >
          <Panel
            header={
              <Space>
                <FilterOutlined />
                <Text strong>{t('dashboard.filters')}</Text>
                {getActiveFilterCount() > 0 && (
                  <Badge count={getActiveFilterCount()} />
                )}
              </Space>
            }
            key="filters"
          >
            {renderFilterControls()}
          </Panel>
        </Collapse>
      </Card>
    );
  }

  // Desktop view with horizontal layout
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        {/* Category Filter */}
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('dashboard.filterByCategory')}:</Text>
            <Select
              style={{ width: '100%' }}
              value={getCurrentFilters().categoryFilter}
              onChange={getCurrentFilters().onCategoryChange}
              options={getCurrentFilters().categoryOptions}
              placeholder={t('dashboard.selectCategory')}
            />
          </Space>
        </Col>
        
        {/* Status Filter */}
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('dashboard.filterByStatus')}:</Text>
            <Select
              style={{ width: '100%' }}
              value={getCurrentFilters().statusFilter}
              onChange={getCurrentFilters().onStatusChange}
              options={getCurrentFilters().statusOptions}
              disabled={getCurrentFilters().statusDisabled}
              placeholder={t('dashboard.selectStatus')}
            />
          </Space>
        </Col>
        
        {/* Priority Filter */}
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>{t('dashboard.filterByPriority')}:</Text>
            <Select
              style={{ width: '100%' }}
              value={getCurrentFilters().priorityFilter}
              onChange={getCurrentFilters().onPriorityChange}
              options={getCurrentFilters().priorityOptions}
              disabled={getCurrentFilters().priorityDisabled}
              placeholder={t('dashboard.selectPriority')}
            />
          </Space>
        </Col>
        
        {/* Reset Button */}
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ visibility: 'hidden' }}>{t('dashboard.filterByCategory')}:</Text>
            <Button 
              type="default" 
              icon={<ReloadOutlined />}
              onClick={getCurrentFilters().onReset}
              block={isTablet}
              style={{ height: '32px' }}
            >
              {t('common.reset')}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default ResponsiveFilters; 