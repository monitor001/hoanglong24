import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  TimePicker,
  Select,
  Button,
  Typography,
  Space,
  Divider,
  message,
  Row,
  Col,
  Alert
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axiosInstance from '../axiosConfig';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface NotificationPreferences {
  id?: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  taskNotifications: boolean;
  issueNotifications: boolean;
  projectNotifications: boolean;
  documentNotifications: boolean;
  calendarNotifications: boolean;
  systemNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch user notification preferences
  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user-preferences/notifications`);
      const preferences = response.data;
      
      form.setFieldsValue({
        ...preferences,
        quietHoursStart: preferences.quietHoursStart ? dayjs(preferences.quietHoursStart, 'HH:mm') : undefined,
        quietHoursEnd: preferences.quietHoursEnd ? dayjs(preferences.quietHoursEnd, 'HH:mm') : undefined
      });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      message.error('Không thể tải cài đặt thông báo');
    } finally {
      setLoading(false);
    }
  };

  // Save notification preferences
  const handleSave = async (values: any) => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const preferences = {
        ...values,
        quietHoursStart: values.quietHoursStart?.format('HH:mm'),
        quietHoursEnd: values.quietHoursEnd?.format('HH:mm')
      };

      await axiosInstance.put('/user-preferences/notifications', preferences);
      message.success('Đã lưu cài đặt thông báo');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      message.error('Không thể lưu cài đặt thông báo');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    form.setFieldsValue({
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      taskNotifications: true,
      issueNotifications: true,
      projectNotifications: true,
      documentNotifications: true,
      calendarNotifications: true,
      systemNotifications: true,
      quietHoursEnabled: false,
      quietHoursStart: dayjs('22:00', 'HH:mm'),
      quietHoursEnd: dayjs('08:00', 'HH:mm'),
      timezone: 'Asia/Ho_Chi_Minh'
    });
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]);

  return (
    <Card title="Cài đặt thông báo" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          emailNotifications: true,
          pushNotifications: true,
          inAppNotifications: true,
          taskNotifications: true,
          issueNotifications: true,
          projectNotifications: true,
          documentNotifications: true,
          calendarNotifications: true,
          systemNotifications: true,
          quietHoursEnabled: false,
          quietHoursStart: dayjs('22:00', 'HH:mm'),
          quietHoursEnd: dayjs('08:00', 'HH:mm'),
          timezone: 'Asia/Ho_Chi_Minh'
        }}
      >
        <Alert
          message="Thông báo qua Email"
          description="Nhận thông báo qua email khi có sự kiện quan trọng"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="emailNotifications"
              label="Thông báo Email"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pushNotifications"
              label="Thông báo Push"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>Loại thông báo</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Chọn loại thông báo bạn muốn nhận
        </Text>

        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="taskNotifications"
              label="Thông báo nhiệm vụ"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="issueNotifications"
              label="Thông báo vấn đề"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="projectNotifications"
              label="Thông báo dự án"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="documentNotifications"
              label="Thông báo tài liệu"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="calendarNotifications"
              label="Thông báo lịch"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="systemNotifications"
              label="Thông báo hệ thống"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>Giờ yên lặng</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Tạm thời tắt thông báo trong khoảng thời gian này
        </Text>

        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="quietHoursEnabled"
              label="Bật giờ yên lặng"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timezone"
              label="Múi giờ"
            >
              <Select>
                <Option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</Option>
                <Option value="UTC">UTC</Option>
                <Option value="America/New_York">New York (GMT-5)</Option>
                <Option value="Europe/London">London (GMT+0)</Option>
                <Option value="Asia/Tokyo">Tokyo (GMT+9)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="quietHoursStart"
              label="Bắt đầu"
            >
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="quietHoursEnd"
              label="Kết thúc"
            >
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            Lưu cài đặt
          </Button>
          <Button onClick={handleReset}>
            Đặt lại mặc định
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default NotificationSettings;
