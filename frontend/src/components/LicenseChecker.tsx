import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Tag,
  Alert,
  Divider,
  Row,
  Col,
  Statistic,
  Progress
} from 'antd';
import {
  KeyOutlined,
  DesktopOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Title, Text } = Typography;

interface LicenseInfo {
  licenseKey: string;
  machineId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  usageDays: number;
  status: string;
  startDate: string;
  endDate: string;
  lastUsed?: string;
  notes?: string;
}

const LicenseChecker: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [machineId, setMachineId] = useState<string>('');

  // Generate machine ID on component mount
  useEffect(() => {
    generateMachineId();
  }, []);

  const generateMachineId = () => {
    // Trong thực tế, bạn có thể sử dụng thông tin phần cứng thực
    // Ví dụ: CPU ID, Motherboard Serial, MAC Address, etc.
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const generatedId = `MACHINE-${timestamp}-${random}`.toUpperCase();
    setMachineId(generatedId);
  };

  const handleCheckLicense = async (values: { licenseKey: string }) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/licenses/activate', {
        licenseKey: values.licenseKey,
        machineId: machineId
      });

      setLicenseInfo(response.data.license);
      message.success('License hợp lệ và đã được kích hoạt!');
    } catch (error: any) {
      console.error('Error checking license:', error);
      message.error(error.response?.data?.error || 'Lỗi khi kiểm tra license');
      setLicenseInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (endDate: string) => {
    const end = moment(endDate);
    const now = moment();
    const diff = end.diff(now, 'days');
    return Math.max(0, diff);
  };

  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đang hoạt động' },
      EXPIRED: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Đã hết hạn' },
      SUSPENDED: { color: 'orange', icon: <ExclamationCircleOutlined />, text: 'Tạm ngưng' },
      REVOKED: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Đã thu hồi' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getRemainingDaysDisplay = (endDate: string) => {
    const remaining = calculateRemainingDays(endDate);
    const total = moment(endDate).diff(moment(), 'days') + remaining;
    const percentage = total > 0 ? (remaining / total) * 100 : 0;

    if (remaining === 0) {
      return (
        <div>
          <Tag color="red">Đã hết hạn</Tag>
          <Progress percent={0} size="small" showInfo={false} />
        </div>
      );
    }

    if (remaining <= 30) {
      return (
        <div>
          <Tag color="orange">{remaining} ngày còn lại</Tag>
          <Progress percent={percentage} size="small" showInfo={false} />
        </div>
      );
    }

    return (
      <div>
        <Tag color="green">{remaining} ngày còn lại</Tag>
        <Progress percent={percentage} size="small" showInfo={false} />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>
            <KeyOutlined style={{ marginRight: '8px' }} />
            Kiểm tra License
          </Title>
          <Text type="secondary">
            Nhập license key để kiểm tra và kích hoạt
          </Text>
        </div>

        {/* Machine ID Display */}
        <Alert
          message="Machine ID"
          description={
            <div>
              <Text code>{machineId}</Text>
              <br />
              <Text type="secondary">ID này được tạo tự động dựa trên thông tin máy tính</Text>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* License Check Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheckLicense}
        >
          <Form.Item
            name="licenseKey"
            label="License Key"
            rules={[
              { required: true, message: 'Vui lòng nhập License Key!' },
              {
                pattern: /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/,
                message: 'License Key không đúng định dạng!'
              }
            ]}
          >
            <Input
              placeholder="Nhập License Key (VD: A1B2-C3D4-E5F6-G7H8-I9J0-K1L2-M3N4-O5P6)"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Kiểm tra và Kích hoạt License
            </Button>
          </Form.Item>
        </Form>

        {/* License Information Display */}
        {licenseInfo && (
          <>
            <Divider>Thông tin License</Divider>
            
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12}>
                <Card size="small">
                  <Statistic
                    title="Trạng thái"
                    value={licenseInfo.status}
                    valueStyle={{ color: licenseInfo.status === 'ACTIVE' ? '#3f8600' : '#cf1322' }}
                    prefix={licenseInfo.status === 'ACTIVE' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small">
                  <Statistic
                    title="Ngày còn lại"
                    value={calculateRemainingDays(licenseInfo.endDate)}
                    suffix="ngày"
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>License Key:</Text>
                      <br />
                      <Text code copyable>{licenseInfo.licenseKey}</Text>
                    </div>
                    
                    <div>
                      <Text strong>Machine ID:</Text>
                      <br />
                      <Text code>{licenseInfo.machineId}</Text>
                    </div>
                    
                    <div>
                      <Text strong>Người dùng:</Text>
                      <br />
                      <Space>
                        <UserOutlined />
                        <Text>{licenseInfo.userName}</Text>
                      </Space>
                      {licenseInfo.userPhone && (
                        <div>
                          <Text type="secondary">{licenseInfo.userPhone}</Text>
                        </div>
                      )}
                      {licenseInfo.userEmail && (
                        <div>
                          <Text type="secondary">{licenseInfo.userEmail}</Text>
                        </div>
                      )}
                    </div>
                  </Space>
                </Col>
                
                <Col xs={24} md={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Thời hạn sử dụng:</Text>
                      <br />
                      <Text>{licenseInfo.usageDays} ngày</Text>
                    </div>
                    
                    <div>
                      <Text strong>Ngày bắt đầu:</Text>
                      <br />
                      <Space>
                        <CalendarOutlined />
                        <Text>{moment(licenseInfo.startDate).format('DD/MM/YYYY')}</Text>
                      </Space>
                    </div>
                    
                    <div>
                      <Text strong>Ngày kết thúc:</Text>
                      <br />
                      <Space>
                        <CalendarOutlined />
                        <Text>{moment(licenseInfo.endDate).format('DD/MM/YYYY')}</Text>
                      </Space>
                    </div>
                    
                    <div>
                      <Text strong>Lần sử dụng cuối:</Text>
                      <br />
                      {licenseInfo.lastUsed ? (
                        <Text>{moment(licenseInfo.lastUsed).format('DD/MM/YYYY HH:mm')}</Text>
                      ) : (
                        <Text type="secondary">Chưa sử dụng</Text>
                      )}
                    </div>
                  </Space>
                </Col>
              </Row>
              
              <Divider />
              
              <div>
                <Text strong>Trạng thái:</Text>
                <br />
                {getStatusDisplay(licenseInfo.status)}
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <Text strong>Thời gian còn lại:</Text>
                <br />
                {getRemainingDaysDisplay(licenseInfo.endDate)}
              </div>
              
              {licenseInfo.notes && (
                <div style={{ marginTop: '16px' }}>
                  <Text strong>Ghi chú:</Text>
                  <br />
                  <Text type="secondary">{licenseInfo.notes}</Text>
                </div>
              )}
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default LicenseChecker;
