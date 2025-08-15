import React, { useState } from 'react';
import { Row, Col, Input, Select, Space, Button, Drawer, Menu } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  CopyOutlined,
  MenuOutlined,
  CloseOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Option } = Select;

interface MobileChecklistHeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  projects: any[];
  onOpenCategoryManager: () => void;
  onOpenTemplateSelector: () => void;
  onCreateChecklist: () => void;
}

const MobileChecklistHeader: React.FC<MobileChecklistHeaderProps> = ({
  searchText,
  setSearchText,
  selectedProject,
  setSelectedProject,
  projects,
  onOpenCategoryManager,
  onOpenTemplateSelector,
  onCreateChecklist
}) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
  };

  const hideMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-checklist-header">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <div className="mobile-header-content">
              <h1>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Hồ sơ Thiết kế
              </h1>
              <div className="subtitle">
                Quản lý checklist thiết kế
              </div>
            </div>
          </Col>
          <Col>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={showMobileMenu}
              className="mobile-menu-button"
            />
          </Col>
        </Row>

        {/* Search and Filter Row */}
        <Row gutter={8} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
          <Col span={12}>
            <Select
              placeholder="Dự án"
              value={selectedProject}
              onChange={setSelectedProject}
              allowClear
              size="large"
              style={{ width: '100%' }}
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={hideMobileMenu}
        open={mobileMenuVisible}
        width={280}
        className="mobile-menu-drawer"
      >
        <div className="mobile-menu-content">
          <div className="mobile-menu-section">
            <h3>Thao tác chính</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  onCreateChecklist();
                  hideMobileMenu();
                }}
                size="large"
                block
              >
                Tạo Checklist
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  onOpenTemplateSelector();
                  hideMobileMenu();
                }}
                size="large"
                block
              >
                Từ Mẫu
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => {
                  onOpenCategoryManager();
                  hideMobileMenu();
                }}
                size="large"
                block
              >
                Quản lý Hạng mục
              </Button>
            </Space>
          </div>

          <div className="mobile-menu-section">
            <h3>Bộ lọc</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Tìm kiếm
              </label>
              <Input
                placeholder="Tìm kiếm checklist..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Dự án
              </label>
              <Select
                placeholder="Chọn dự án"
                value={selectedProject}
                onChange={setSelectedProject}
                allowClear
                size="large"
                style={{ width: '100%' }}
              >
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default MobileChecklistHeader; 