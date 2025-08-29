import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Upload,
  Button,
  Space,
  message,
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Divider,
  Spin
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveBreakpoint';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface KaizenFormProps {
  kaizen?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface KaizenTag {
  id: string;
  name: string;
  nameVi: string;
  color: string;
}

const KaizenForm: React.FC<KaizenFormProps> = ({ kaizen, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { isMobile } = useResponsiveBreakpoint();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<KaizenTag[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [beforeImageList, setBeforeImageList] = useState<any[]>([]);
  const [afterImageList, setAfterImageList] = useState<any[]>([]);

  // Categories and statuses
  const categories = [
    { value: 'PROCESS', label: 'Quy trình', color: '#1890ff' },
    { value: 'QUALITY', label: 'Chất lượng', color: '#52c41a' },
    { value: 'SAFETY', label: 'An toàn', color: '#faad14' },
    { value: 'EFFICIENCY', label: 'Hiệu quả', color: '#722ed1' },
    { value: 'COST', label: 'Chi phí', color: '#eb2f96' },
    { value: 'OTHER', label: 'Khác', color: '#8c8c8c' }
  ];

  const statuses = [
    { value: 'DRAFT', label: 'Nháp', color: '#8c8c8c' },
    { value: 'SUBMITTED', label: 'Đã gửi', color: '#1890ff' },
    { value: 'UNDER_REVIEW', label: 'Đang xem xét', color: '#faad14' },
    { value: 'APPROVED', label: 'Đã phê duyệt', color: '#52c41a' },
    { value: 'IMPLEMENTED', label: 'Đã triển khai', color: '#13c2c2' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: '#722ed1' },
    { value: 'REJECTED', label: 'Từ chối', color: '#f5222d' },
    { value: 'ARCHIVED', label: 'Lưu trữ', color: '#bfbfbf' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Thấp', color: '#52c41a' },
    { value: 'MEDIUM', label: 'Trung bình', color: '#faad14' },
    { value: 'HIGH', label: 'Cao', color: '#f5222d' },
    { value: 'URGENT', label: 'Khẩn cấp', color: '#cf1322' }
  ];

  const impacts = [
    { value: 'LOW', label: 'Thấp', color: '#52c41a' },
    { value: 'MEDIUM', label: 'Trung bình', color: '#faad14' },
    { value: 'HIGH', label: 'Cao', color: '#f5222d' },
    { value: 'CRITICAL', label: 'Quan trọng', color: '#cf1322' }
  ];

  // Fetch projects and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await fetch(`${process.env.REACT_APP_API_URL}/projects`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.projects || []);
        }

        // Fetch tags
        const tagsResponse = await fetch(`${process.env.REACT_APP_API_URL}/kaizen-tags`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Set initial values when editing
  useEffect(() => {
    if (kaizen) {
      form.setFieldsValue({
        title: kaizen.title,
        description: kaizen.description,
        content: kaizen.content,
        category: kaizen.category,
        status: kaizen.status,
        priority: kaizen.priority,
        impact: kaizen.impact,
        department: kaizen.department,
        location: kaizen.location,
        estimatedSavings: kaizen.estimatedSavings,
        implementationDate: kaizen.implementationDate ? new Date(kaizen.implementationDate) : null,
        completionDate: kaizen.completionDate ? new Date(kaizen.completionDate) : null,
        isPublic: kaizen.isPublic,
        projectId: kaizen.projectId,
        tagIds: kaizen.tags?.map((tag: any) => tag.id) || []
      });

      // Set file lists
      if (kaizen.beforeImage) {
        setBeforeImageList([{
          uid: '-1',
          name: 'before-image.jpg',
          status: 'done',
          url: kaizen.beforeImage
        }]);
      }
      if (kaizen.afterImage) {
        setAfterImageList([{
          uid: '-1',
          name: 'after-image.jpg',
          status: 'done',
          url: kaizen.afterImage
        }]);
      }
      if (kaizen.attachments) {
        setFileList(kaizen.attachments.map((file: any, index: number) => ({
          uid: `-${index}`,
          name: file.name || `attachment-${index}`,
          status: 'done',
          url: file.url
        })));
      }
    }
  }, [kaizen, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'implementationDate' || key === 'completionDate') {
            if (values[key]) {
              formData.append(key, values[key].toISOString());
            }
          } else if (key === 'tagIds') {
            if (values[key] && values[key].length > 0) {
              values[key].forEach((tagId: string) => {
                formData.append('tagIds', tagId);
              });
            }
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Add files
      beforeImageList.forEach(file => {
        if (file.originFileObj) {
          formData.append('beforeImage', file.originFileObj);
        }
      });
      afterImageList.forEach(file => {
        if (file.originFileObj) {
          formData.append('afterImage', file.originFileObj);
        }
      });
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('attachments', file.originFileObj);
        }
      });

      const url = kaizen 
        ? `${process.env.REACT_APP_API_URL}/kaizen/${kaizen.id}`
        : `${process.env.REACT_APP_API_URL}/kaizen`;
      
      const method = kaizen ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        message.success(kaizen ? 'Cập nhật cải tiến thành công' : 'Tạo cải tiến thành công');
        onSuccess();
      } else {
        const error = await response.json();
        message.error(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Có lỗi xảy ra khi gửi form');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    onChange: (info: any) => {
      // Handle file change
    }
  };

  return (
    <div style={{ padding: isMobile ? 8 : 16 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          category: 'PROCESS',
          status: 'DRAFT',
          priority: 'MEDIUM',
          impact: 'MEDIUM',
          isPublic: false
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Nhập tiêu đề cải tiến" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    <Tag color={cat.color}>{cat.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả ngắn"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả ngắn gọn về cải tiến"
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung chi tiết"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiết' }]}
        >
          <TextArea 
            rows={6} 
            placeholder="Mô tả chi tiết về cải tiến, cách thực hiện, kết quả mong đợi..."
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Form.Item
              name="status"
              label="Trạng thái"
            >
              <Select placeholder="Chọn trạng thái">
                {statuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
            >
              <Select placeholder="Chọn độ ưu tiên">
                {priorities.map(priority => (
                  <Option key={priority.value} value={priority.value}>
                    <Tag color={priority.color}>{priority.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="impact"
              label="Mức độ tác động"
            >
              <Select placeholder="Chọn mức độ tác động">
                {impacts.map(impact => (
                  <Option key={impact.value} value={impact.value}>
                    <Tag color={impact.color}>{impact.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="department"
              label="Phòng ban"
            >
              <Input placeholder="Phòng ban liên quan" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="location"
              label="Vị trí/Địa điểm"
            >
              <Input placeholder="Vị trí áp dụng cải tiến" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="estimatedSavings"
              label="Ước tính tiết kiệm"
            >
              <Input placeholder="Ví dụ: 10 triệu VND/năm" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="projectId"
              label="Dự án liên quan"
            >
              <Select placeholder="Chọn dự án (tùy chọn)" allowClear>
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="implementationDate"
              label="Ngày triển khai"
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Chọn ngày triển khai"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="completionDate"
              label="Ngày hoàn thành"
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Chọn ngày hoàn thành"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="tagIds"
          label="Tags"
        >
          <Select
            mode="multiple"
            placeholder="Chọn tags"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {tags.map(tag => (
              <Option key={tag.id} value={tag.id}>
                <Tag color={tag.color}>{tag.nameVi || tag.name}</Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="isPublic"
          label="Chia sẻ công khai"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider>Hình ảnh và tài liệu</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Hình ảnh trước cải tiến">
              <Upload
                {...uploadProps}
                listType="picture-card"
                fileList={beforeImageList}
                onChange={({ fileList }) => setBeforeImageList(fileList)}
                maxCount={1}
              >
                {beforeImageList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Hình ảnh sau cải tiến">
              <Upload
                {...uploadProps}
                listType="picture-card"
                fileList={afterImageList}
                onChange={({ fileList }) => setAfterImageList(fileList)}
                maxCount={1}
              >
                {afterImageList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Tài liệu đính kèm">
          <Upload
            {...uploadProps}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            maxCount={5}
          >
            <Button icon={<UploadOutlined />}>Tải lên tài liệu</Button>
          </Upload>
          <Text type="secondary">Tối đa 5 file, mỗi file tối đa 10MB</Text>
        </Form.Item>

        <Divider />

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {kaizen ? 'Cập nhật' : 'Tạo cải tiến'}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={onCancel}
            >
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default KaizenForm;
