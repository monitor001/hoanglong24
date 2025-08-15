import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Space,
  message,
  Tag,
  ColorPicker,
  Typography,
  Card,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const { Title } = Typography;

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface CategoryManagerProps {
  visible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  visible,
  onClose,
  onRefresh
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Sử dụng endpoint public để lấy categories mặc định
      const response = await axiosInstance.get('/checklist/public/categories-with-defaults');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback: sử dụng categories mặc định nếu API không hoạt động
      const defaultCategories = [
        { id: 'giao-thong', name: 'Giao Thông', color: '#1890ff', description: 'Các hạng mục liên quan đến giao thông', isActive: true, createdAt: new Date().toISOString() },
        { id: 'san-nen', name: 'San Nền', color: '#52c41a', description: 'Các hạng mục liên quan đến san nền', isActive: true, createdAt: new Date().toISOString() },
        { id: 'xu-ly-nen', name: 'Xử lý nền', color: '#fa8c16', description: 'Các hạng mục liên quan đến xử lý nền', isActive: true, createdAt: new Date().toISOString() },
        { id: 'ke-ho', name: 'Kè hồ', color: '#722ed1', description: 'Các hạng mục liên quan đến kè hồ', isActive: true, createdAt: new Date().toISOString() },
        { id: 'tuong-chan', name: 'Tường chắn', color: '#eb2f96', description: 'Các hạng mục liên quan đến tường chắn', isActive: true, createdAt: new Date().toISOString() }
      ];
      setCategories(defaultCategories);
      message.warning('Đang sử dụng danh sách hạng mục mặc định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const handleCreateCategory = async (values: any) => {
    try {
      await axiosInstance.post('/checklist/categories', {
        ...values,
        color: values.color?.toHexString?.() || values.color
      });
      message.success('Tạo hạng mục thành công');
      setModalVisible(false);
      form.resetFields();
      fetchCategories();
      onRefresh();
    } catch (error) {
      console.error('Error creating category:', error);
      message.error('Không thể tạo hạng mục');
    }
  };

  const handleUpdateCategory = async (values: any) => {
    if (!editingCategory) return;
    
    try {
      await axiosInstance.put(`/checklist/categories/${editingCategory.id}`, {
        ...values,
        color: values.color?.toHexString?.() || values.color
      });
      message.success('Cập nhật hạng mục thành công');
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
      onRefresh();
    } catch (error) {
      console.error('Error updating category:', error);
      message.error('Không thể cập nhật hạng mục');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`/checklist/categories/${id}`);
      message.success('Xóa hạng mục thành công');
      fetchCategories();
      onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Không thể xóa hạng mục');
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setCategoryToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      handleDeleteCategory(categoryToDelete.id);
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Tên hạng mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <Tag color={record.color}>{text}</Tag>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              borderRadius: 4,
              marginRight: 8
            }}
          />
          <span>{color}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Modal
      title="Quản lý Hạng mục Kiểm tra"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Danh sách hạng mục
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Thêm hạng mục
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingCategory ? 'Chỉnh sửa Hạng mục' : 'Thêm Hạng mục Mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingCategory ? handleUpdateCategory : handleCreateCategory}
        >
          <Form.Item
            name="name"
            label="Tên hạng mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên hạng mục' }]}
          >
            <Input placeholder="Nhập tên hạng mục" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả hạng mục" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}
          >
            <ColorPicker />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
              >
                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa hạng mục"
        content="Bạn có chắc chắn muốn xóa hạng mục"
        itemName={categoryToDelete?.name}
        size="medium"
      />
    </Modal>
  );
};

export default CategoryManager; 