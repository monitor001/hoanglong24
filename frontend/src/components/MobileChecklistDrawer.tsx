import React from 'react';
import { Drawer, Card, Row, Col, Typography, Button, Space, Upload, Tabs, Empty } from 'antd';
import {
  ImportOutlined,
  ExportOutlined,
  SaveOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';
import ChecklistDetailTableWithTabs from './ChecklistDetailTableWithTabs';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface ChecklistItem {
  id?: string;
  category: string;
  content: string;
  order: number;
  isChecked?: boolean;
  notes?: string;
}

interface Checklist {
  id: string;
  name: string;
  project: {
    id: string;
    name: string;
    code: string;
  };
  description?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  items: ChecklistItem[];
  _count?: {
    items: number;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface MobileChecklistDrawerProps {
  visible: boolean;
  onClose: () => void;
  checklist: Checklist | null;
  categories: Category[];
  onUpdateItem: (itemId: string, updates: any, setDynamicItems?: React.Dispatch<React.SetStateAction<ChecklistItem[]>>) => void;
  dynamicItems?: ChecklistItem[];
  setDynamicItems?: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  dynamicColumns?: string[];
  setDynamicColumns?: React.Dispatch<React.SetStateAction<string[]>>;
  currentActiveTab?: string;
  setCurrentActiveTab?: React.Dispatch<React.SetStateAction<string>>;
  onExport: () => void;
  onImport: (file: File) => void;
  onSave: () => void;
}

const MobileChecklistDrawer: React.FC<MobileChecklistDrawerProps> = ({
  visible,
  onClose,
  checklist,
  categories,
  onUpdateItem,
  dynamicItems,
  setDynamicItems,
  dynamicColumns,
  setDynamicColumns,
  currentActiveTab,
  setCurrentActiveTab,
  onExport,
  onImport,
  onSave
}) => {
  if (!checklist) return null;

  return (
    <Drawer
      title={
        <div className="mobile-drawer-title">
          <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
            {checklist.name}
          </Title>
        </div>
      }
      placement="right"
      width="100%"
      open={visible}
      onClose={onClose}
      className="mobile-checklist-drawer"
    >
      <div className="mobile-drawer-content">
        {/* Checklist Info Card */}
        <Card className="mobile-info-card" style={{ marginBottom: 16 }}>
          <div className="mobile-info-section">
            <div className="mobile-info-item">
              <Text strong>Dự án:</Text>
              <Text>{checklist.project.name}</Text>
            </div>
            <div className="mobile-info-item">
              <Text strong>Người tạo:</Text>
              <Text>{checklist.createdBy.name}</Text>
            </div>
            <div className="mobile-info-item">
              <Text strong>Ngày tạo:</Text>
              <Text>{moment(checklist.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
            {checklist.description && (
              <div className="mobile-info-item">
                <Text strong>Mô tả:</Text>
                <Text>{checklist.description}</Text>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="mobile-actions-card" style={{ marginBottom: 16 }}>
          <div className="mobile-actions-grid">
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={(file) => {
                onImport(file);
                return false;
              }}
            >
              <Button 
                icon={<ImportOutlined />} 
                type="dashed" 
                size="large"
                block
                className="mobile-action-button"
              >
                Import
              </Button>
            </Upload>
            <Button 
              icon={<ExportOutlined />} 
              onClick={onExport}
              size="large"
              block
              className="mobile-action-button"
            >
              Export
            </Button>
            <Button 
              icon={<SaveOutlined />} 
              type="primary" 
              onClick={onSave}
              size="large"
              block
              className="mobile-action-button"
            >
              Lưu
            </Button>
          </div>
        </Card>

        {/* Checklist Content */}
        <Card className="mobile-content-card">
          <ChecklistDetailTableWithTabs
            items={checklist.items}
            categories={categories}
            onUpdateItem={onUpdateItem}
            dynamicItems={dynamicItems}
            setDynamicItems={setDynamicItems}
            dynamicColumns={dynamicColumns}
            setDynamicColumns={setDynamicColumns}
            currentActiveTab={currentActiveTab}
            setCurrentActiveTab={setCurrentActiveTab}
          />
        </Card>
      </div>
    </Drawer>
  );
};

export default MobileChecklistDrawer; 