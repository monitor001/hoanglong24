import React, { useState } from 'react';
import {
  Card,
  Table,
  Checkbox,
  Typography,
  Button,
  Tooltip,
  Collapse,
  Tag,
  Space,
  Alert,
  Spin,
  Row,
  Col
} from 'antd';
import {
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  RightOutlined
} from '@ant-design/icons';
import '../styles/collapsible-permission-matrix.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Permission {
  id: string;
  name: string;
  nameVi: string;
  description?: string;
  category?: string;
}

interface Role {
  id: string;
  name: string;
  nameVi: string;
  color: string;
}

interface Position {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  description: string;
  level: number;
}

interface PermissionMatrix {
  [permissionId: string]: {
    [roleId: string]: boolean;
  };
}

interface PositionPermissionMatrix {
  [permissionId: string]: {
    [positionId: string]: boolean;
  };
}

interface SystemFeature {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  permissions: Permission[];
  order: number; // Thêm thứ tự để sắp xếp
}

interface CollapsiblePermissionMatrixProps {
  type: 'roles' | 'positions';
  permissions: Permission[];
  roles?: Role[];
  positions?: Position[];
  permissionMatrix: PermissionMatrix | PositionPermissionMatrix;
  loading: boolean;
  hasUnsavedChanges: boolean;
  onPermissionChange: (permissionId: string, roleId: string, value: boolean) => void;
  onSave: () => void;
  systemFeatures: SystemFeature[];
}

const CollapsiblePermissionMatrix: React.FC<CollapsiblePermissionMatrixProps> = ({
  type,
  permissions,
  roles = [],
  positions = [],
  permissionMatrix,
  loading,
  hasUnsavedChanges,
  onPermissionChange,
  onSave,
  systemFeatures
}) => {
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'custom'>('custom');

  // Sắp xếp systemFeatures theo thứ tự
  const sortedFeatures = [...systemFeatures].sort((a, b) => a.order - b.order);

  // Toggle expanded state cho một feature
  const toggleFeature = (featureId: string) => {
    setExpandedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Toggle tất cả features
  const toggleAllFeatures = () => {
    if (expandedFeatures.length === sortedFeatures.length) {
      setExpandedFeatures([]);
    } else {
      setExpandedFeatures(sortedFeatures.map(f => f.id));
    }
  };

  // Render header với controls
  const renderHeader = () => (
    <div className="matrix-header">
      <div className="matrix-header-info">
        <h3 className="matrix-title">
          Phân Quyền Theo {type === 'roles' ? 'Vai Trò' : 'Vị Trí'}
        </h3>
        <p className="matrix-subtitle">
          Quản lý quyền hạn theo {type === 'roles' ? 'vai trò' : 'vị trí công việc'}
        </p>
        
        {type === 'roles' && (
          <div className="matrix-alert">
            <Alert
              message="Lưu ý về Dashboard"
              description="Quyền 'Xem tổng quan' (dashboard_view) ảnh hưởng đến khả năng truy cập Dashboard. Tắt quyền này sẽ khiến người dùng không thể xem Dashboard."
              type="info"
              showIcon
            />
          </div>
        )}
        
        {hasUnsavedChanges && (
          <div className="matrix-changes-indicator">
            <CheckCircleOutlined />
            Có thay đổi chưa lưu
          </div>
        )}
      </div>
      
      <div className="matrix-header-controls">
        <Button 
          size="small"
          className="toggle-all-button"
          onClick={toggleAllFeatures}
        >
          {expandedFeatures.length === sortedFeatures.length ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
        </Button>
        
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={onSave} 
          loading={loading}
          disabled={!hasUnsavedChanges}
          className="save-button"
        >
          {hasUnsavedChanges ? 'Lưu Thay Đổi' : 'Đã Lưu'}
        </Button>
      </div>
    </div>
  );

  // Render feature header với icon và toggle
  const renderFeatureHeader = (feature: SystemFeature) => {
    const isExpanded = expandedFeatures.includes(feature.id);
    const featurePermissions = permissions.filter(p => p.category === feature.id);
    
    return (
      <div 
        className={`feature-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => toggleFeature(feature.id)}
      >
        <div className="feature-info">
          <div className="feature-icon">
            {feature.nameVi.charAt(0)}
          </div>
          <div className="feature-details">
            <div className="feature-title">{feature.nameVi}</div>
            <div className="feature-description">
              {feature.description} ({featurePermissions.length} quyền)
            </div>
          </div>
        </div>
        
        <div className="feature-controls">
          <div className="feature-count">{featurePermissions.length} quyền</div>
          <div className="feature-toggle">
            {isExpanded ? <DownOutlined /> : <RightOutlined />}
          </div>
        </div>
      </div>
    );
  };

  // Render permissions table cho một feature
  const renderFeaturePermissions = (feature: SystemFeature) => {
    const featurePermissions = permissions.filter(p => p.category === feature.id);
    const isExpanded = expandedFeatures.includes(feature.id);
    
    if (!isExpanded) return null;

    const columns = [
      {
        title: 'QUYỀN HẠN',
        dataIndex: 'permission',
        key: 'permission',
        width: '40%',
        render: (permission: Permission) => (
          <div>
            <div className="permission-name">{permission.nameVi}</div>
            <div className="permission-description">{permission.name}</div>
          </div>
        )
      },
      ...(type === 'roles' ? roles : positions).map(role => ({
        title: (
          <div className="role-header">
            <div 
              className="role-icon"
              style={{ 
                backgroundColor: type === 'roles' 
                  ? role.color || '#8c8c8c'
                  : role.level <= 2 ? '#ff4d4f' : 
                    role.level <= 3 ? '#1890ff' : 
                    role.level <= 5 ? '#52c41a' : '#8c8c8c'
              }}
            >
              {role.nameVi.charAt(0)}
            </div>
            <div className="role-name">
              {role.nameVi}
            </div>
          </div>
        ),
        dataIndex: role.id,
        key: role.id,
        width: `${60 / (type === 'roles' ? roles.length : positions.length)}%`,
        align: 'center' as const,
        render: (value: boolean, record: any) => (
          <Checkbox
            checked={permissionMatrix[record.permission.id]?.[role.id] || false}
            onChange={(e) => onPermissionChange(record.permission.id, role.id, e.target.checked)}
          />
        )
      }))
    ];

    const dataSource = featurePermissions.map(permission => {
      const baseRecord = {
        key: permission.id,
        permission,
      };
      
      if (type === 'roles') {
        return {
          ...baseRecord,
          ...roles.reduce((acc: any, role: Role) => {
            acc[role.id] = permissionMatrix[permission.id]?.[role.id] || false;
            return acc;
          }, {} as any)
        };
      } else {
        return {
          ...baseRecord,
          ...positions.reduce((acc: any, position: Position) => {
            acc[position.id] = permissionMatrix[permission.id]?.[position.id] || false;
            return acc;
          }, {} as any)
        };
      }
    });

    return (
      <div className="permissions-content">
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          bordered
          className="permissions-table"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="permissions-loading">
        <Spin size="large" />
        <div className="loading-text">Đang tải ma trận phân quyền...</div>
      </div>
    );
  }

  if (!permissions.length || (type === 'roles' ? !roles.length : !positions.length)) {
    return (
      <div className="permissions-error">
        <ExclamationCircleOutlined className="error-icon" />
        <div className="error-text">Không thể tải dữ liệu phân quyền</div>
      </div>
    );
  }

  return (
    <div className="collapsible-permission-matrix">
      {renderHeader()}
      
      <Card>
        {sortedFeatures
          .map(feature => {
            const featurePermissions = permissions.filter(p => p.category === feature.id);
            if (featurePermissions.length === 0) return null;
            
            return (
              <div key={feature.id} style={{ marginBottom: 16 }}>
                {renderFeatureHeader(feature)}
                {renderFeaturePermissions(feature)}
              </div>
            );
          })}
      </Card>
    </div>
  );
};

export default CollapsiblePermissionMatrix;
