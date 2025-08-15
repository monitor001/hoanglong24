import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, List, Tag, Space, Typography, Tabs } from 'antd';
import { EyeOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import TechnicalChecklistTable from './TechnicalChecklistTable';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  checklist: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
  };
  items: Array<{
    id: string;
    category: string;
    content: string;
    order: number;
  }>;
}

interface TemplateSelectorProps {
  onSelectTemplate?: (template: TemplateItem) => void;
  visible?: boolean;
  onClose?: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  visible = false,
  onClose
}) => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchTemplates();
    }
  }, [visible]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/checklist/public/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = (template: TemplateItem) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  const handleUseTemplate = (template: TemplateItem) => {
    onSelectTemplate?.(template);
    onClose?.();
  };

  const groupItemsByCategory = (items: TemplateItem['items']) => {
    const grouped: { [key: string]: TemplateItem['items'] } = {};
    items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;

    const groupedItems = groupItemsByCategory(selectedTemplate.items);
    const categories = Object.keys(groupedItems);

    return (
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Xem trước: {selectedTemplate.name}
            </Title>
          </Space>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="use"
            type="primary"
            onClick={() => handleUseTemplate(selectedTemplate)}
          >
            Sử dụng template này
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Mô tả: </Text>
          <Text>{selectedTemplate.description}</Text>
        </div>
        
        <Tabs defaultActiveKey={categories[0]} type="card">
          {categories.map(category => (
            <TabPane tab={category} key={category}>
              <TechnicalChecklistTable
                category={category}
                items={groupedItems[category]}
                readOnly={true}
              />
            </TabPane>
          ))}
        </Tabs>
      </Modal>
    );
  };

  return (
    <>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Chọn Template
            </Title>
          </Space>
        }
        loading={loading}
      >
        <List
          dataSource={templates}
          renderItem={(template) => (
            <List.Item
              actions={[
                <Button
                  key="preview"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreviewTemplate(template)}
                >
                  Xem trước
                </Button>,
                <Button
                  key="use"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleUseTemplate(template)}
                >
                  Sử dụng
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{template.name}</Text>
                    {template.isActive && (
                      <Tag color="green">Hoạt động</Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text>{template.description}</Text>
                    <br />
                    <Text type="secondary">
                      Số lượng mục: {template.items.length} | 
                      Dự án: {template.checklist.project.name} |
                      Tạo lúc: {new Date(template.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {renderTemplatePreview()}
    </>
  );
};

export default TemplateSelector; 