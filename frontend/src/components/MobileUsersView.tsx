import React from 'react';
import { 
  List, 
  Empty, 
  Spin,
  Typography,
  Space,
  Button,
  theme
} from 'antd';
import { 
  ReloadOutlined,
  DownloadOutlined 
} from '@ant-design/icons';
import MobileUserCard from './MobileUserCard';
import MobileFilters from './MobileFilters';
import FloatingActionButton from './FloatingActionButton';
import { useResponsive } from '../hooks/useResponsive';

const { Text } = Typography;

interface MobileUsersViewProps {
  users: any[];
  loading: boolean;
  searchText: string;
  selectedRole: string;
  selectedStatus: string;
  selectedProject: string;
  projects: any[];
  projectsLoading: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onFiltersReset: () => void;
  onView: (user: any) => void;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

const MobileUsersView: React.FC<MobileUsersViewProps> = ({
  users,
  loading,
  searchText,
  selectedRole,
  selectedStatus,
  selectedProject,
  projects,
  projectsLoading,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onProjectChange,
  onFiltersReset,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onExport,
  onRefresh
}) => {
  const { isMobile } = useResponsive();
  const { token } = theme.useToken();
  
  // Detect dark mode từ Ant Design theme
  const isDarkMode = token.colorBgContainer === '#141414' || token.colorBgBase === '#000000' || 
                     document.documentElement.getAttribute('data-theme') === 'dark';

  // Chỉ hiển thị trên mobile
  if (!isMobile) {
    return null;
  }

  // Chuẩn bị dữ liệu cho MobileFilters
  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' }
  ];

  const roleOptions = [
    { value: 'all', label: 'Tất cả vai trò' },
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'PROJECT_MANAGER', label: 'Quản lý dự án' },
    { value: 'BIM_MANAGER', label: 'Quản lý BIM' },
    { value: 'CONTRIBUTOR', label: 'Biên tập viên' },
    { value: 'VIEWER', label: 'Người xem' },
    { value: 'USER', label: 'Người dùng' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'Tất cả phòng ban' },
    { value: 'Kỹ thuật', label: 'Kỹ thuật' },
    { value: 'Quản lý dự án', label: 'Quản lý dự án' },
    { value: 'Thiết kế', label: 'Thiết kế' },
    { value: 'Giám sát', label: 'Giám sát' }
  ];

  const projectOptions = [
    { value: 'all', label: 'Tất cả dự án' },
    ...projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Mobile Filters */}
      <MobileFilters
        searchValue={searchText}
        statusValue={selectedStatus}
        priorityValue={selectedRole} // Sử dụng role như priority
        assigneeValue="all" // Không sử dụng assignee cho users
        projectValue={selectedProject}
        statusOptions={statusOptions}
        priorityOptions={roleOptions} // Sử dụng role options
        assigneeOptions={departmentOptions} // Sử dụng department như assignee
        projectOptions={projectOptions}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onPriorityChange={onRoleChange} // Role change
        onAssigneeChange={() => {}} // Không sử dụng
        onProjectChange={onProjectChange}
        onReset={onFiltersReset}
        title="Bộ lọc thành viên"
        isDarkMode={isDarkMode}
      />

      {/* Action buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        gap: 8
      }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          {users.length} thành viên
        </Text>
        
        <Space size={8}>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            style={{ 
              width: 36, 
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={onExport}
            style={{ 
              width: 36, 
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Space>
      </div>

      {/* Users List */}
      <Spin spinning={loading}>
        {users.length === 0 ? (
          <Empty 
            description="Không có thành viên nào"
            style={{ 
              margin: '40px 0',
              color: '#999'
            }}
          />
        ) : (
          <List
            dataSource={users}
            renderItem={(user) => (
              <MobileUserCard
                key={user.id}
                user={user}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
            style={{ marginBottom: 80 }} // Space for FAB
          />
        )}
      </Spin>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={onAdd}
        tooltip="Thêm thành viên mới"
      />
    </div>
  );
};

export default MobileUsersView;
