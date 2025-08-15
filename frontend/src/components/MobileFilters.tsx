import React, { useState } from 'react';
import { 
  Drawer, 
  Button, 
  Input, 
  Select, 
  Space, 
  Typography,
  Badge,
  Divider
} from 'antd';
import { 
  FilterOutlined, 
  SearchOutlined, 
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

interface MobileFiltersProps {
  // Filter states
  searchValue: string;
  statusValue: string;
  priorityValue: string;
  typeValue?: string;
  assigneeValue: string;
  projectValue: string;
  
  // Filter options
  statusOptions: { value: string; label: string }[];
  priorityOptions: { value: string; label: string }[];
  typeOptions?: { value: string; label: string }[];
  assigneeOptions: { value: string; label: string }[];
  projectOptions: { value: string; label: string }[];
  
  // Filter handlers
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onTypeChange?: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onReset: () => void;
  
  // UI props
  title?: string;
  isDarkMode?: boolean;
  filterCount?: number;
  pageType?: 'issues' | 'tasks' | 'projects' | 'documents' | 'notes';
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  searchValue,
  statusValue,
  priorityValue,
  typeValue,
  assigneeValue,
  projectValue,
  statusOptions,
  priorityOptions,
  typeOptions,
  assigneeOptions,
  projectOptions,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onTypeChange,
  onAssigneeChange,
  onProjectChange,
  onReset,
  title = 'Bộ lọc',
  isDarkMode = false,
  filterCount = 0,
  pageType = 'issues'
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchValue) count++;
    if (statusValue) count++;
    if (priorityValue) count++;
    if (typeValue) count++;
    if (assigneeValue) count++;
    if (projectValue) count++;
    return count;
  };

  const activeFilters = getActiveFilterCount();

  // Tách bộ lọc theo từng chức năng
  const getFiltersByPageType = () => {
    const baseFilters = [
      {
        key: 'search',
        label: 'Tìm kiếm',
        component: (
          <Input
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
            className="mobile-filter-input"
            size="small"
          />
        )
      }
    ];

    switch (pageType) {
      case 'issues':
        return [
          ...baseFilters,
          {
            key: 'status',
            label: 'Trạng thái',
            component: (
              <Select
                placeholder="Chọn trạng thái"
                value={statusValue}
                onChange={onStatusChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'priority',
            label: 'Độ ưu tiên',
            component: (
              <Select
                placeholder="Chọn độ ưu tiên"
                value={priorityValue}
                onChange={onPriorityChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {priorityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          ...(typeOptions && onTypeChange ? [{
            key: 'type',
            label: 'Loại',
            component: (
              <Select
                placeholder="Chọn loại"
                value={typeValue}
                onChange={onTypeChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {typeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          }] : []),
          {
            key: 'assignee',
            label: 'Người được giao',
            component: (
              <Select
                placeholder="Chọn người được giao"
                value={assigneeValue}
                onChange={onAssigneeChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {assigneeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'project',
            label: 'Dự án',
            component: (
              <Select
                placeholder="Chọn dự án"
                value={projectValue}
                onChange={onProjectChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {projectOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          }
        ];

      case 'tasks':
        return [
          ...baseFilters,
          {
            key: 'status',
            label: 'Trạng thái',
            component: (
              <Select
                placeholder="Chọn trạng thái"
                value={statusValue}
                onChange={onStatusChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'priority',
            label: 'Độ ưu tiên',
            component: (
              <Select
                placeholder="Chọn độ ưu tiên"
                value={priorityValue}
                onChange={onPriorityChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {priorityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'assignee',
            label: 'Người thực hiện',
            component: (
              <Select
                placeholder="Chọn người thực hiện"
                value={assigneeValue}
                onChange={onAssigneeChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {assigneeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'project',
            label: 'Dự án',
            component: (
              <Select
                placeholder="Chọn dự án"
                value={projectValue}
                onChange={onProjectChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {projectOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          }
        ];

      case 'projects':
        return [
          ...baseFilters,
          {
            key: 'project',
            label: 'Dự án',
            component: (
              <Select
                placeholder="Chọn dự án"
                value={projectValue}
                onChange={onProjectChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                <Option value="all">Tất cả dự án</Option>
                {projectOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'status',
            label: 'Trạng thái',
            component: (
              <Select
                placeholder="Chọn trạng thái"
                value={statusValue}
                onChange={onStatusChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'priority',
            label: 'Mức độ ưu tiên',
            component: (
              <Select
                placeholder="Chọn mức độ ưu tiên"
                value={priorityValue}
                onChange={onPriorityChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {priorityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'assignee',
            label: 'Người phụ trách',
            component: (
              <Select
                placeholder="Chọn người phụ trách"
                value={assigneeValue}
                onChange={onAssigneeChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                <Option value="all">Tất cả người dùng</Option>
                {assigneeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          }
        ];

      case 'documents':
        return [
          ...baseFilters,
          {
            key: 'type',
            label: 'Loại tài liệu',
            component: (
              <Select
                placeholder="Chọn loại tài liệu"
                value={typeValue}
                onChange={onTypeChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {typeOptions?.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          },
          {
            key: 'project',
            label: 'Dự án',
            component: (
              <Select
                placeholder="Chọn dự án"
                value={projectValue}
                onChange={onProjectChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {projectOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          }
        ];

      case 'notes':
        return [
          ...baseFilters,
          {
            key: 'assignee',
            label: 'Tác giả',
            component: (
              <Select
                placeholder="Chọn tác giả"
                value={assigneeValue}
                onChange={onAssigneeChange}
                allowClear
                className="mobile-filter-select"
                size="small"
                dropdownStyle={{
                  background: isDarkMode ? '#2f2f2f' : '#fff',
                  borderColor: isDarkMode ? '#404040' : '#d9d9d9'
                }}
              >
                {assigneeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )
          }
        ];

      default:
        return baseFilters;
    }
  };

  const filters = getFiltersByPageType();

  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        type="primary"
        icon={<FilterOutlined />}
        onClick={showDrawer}
        className="mobile-filter-button"
        size="small"
      >
        <Space size="small">
          <FilterOutlined />
          <Text>
            {title}
          </Text>
          {activeFilters > 0 && (
            <Badge 
              count={activeFilters} 
              size="small"
              className="mobile-filter-badge"
            />
          )}
        </Space>
      </Button>

      {/* Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="mobile-filter-drawer-title">
            <Text>
              {title}
            </Text>
            {activeFilters > 0 && (
              <Badge 
                count={activeFilters} 
                size="small"
                className="mobile-filter-badge"
              />
            )}
          </div>
        }
        placement="bottom"
        onClose={onClose}
        open={drawerVisible}
        height="80vh"
        className="mobile-filter-drawer"
        closeIcon={<CloseOutlined />}
      >
        <div className="mobile-filter-container">
          {/* Filter Items - Compact layout */}
          {filters.map((filter, index) => (
            <div key={filter.key} className="mobile-filter-item">
              <Text className="mobile-filter-label">
                {filter.label}
              </Text>
              {filter.component}
              {index < filters.length - 1 && (
                <Divider className="mobile-filter-divider" />
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="mobile-filter-actions">
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              className="mobile-reset-btn"
              size="small"
            >
              Đặt lại
            </Button>
            <Button
              type="primary"
              onClick={onClose}
              className="mobile-apply-btn"
              size="small"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default MobileFilters; 