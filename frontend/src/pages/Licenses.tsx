import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  InputNumber,
  Typography,
  Divider,
  Badge,
  Progress
} from 'antd';
import { useResponsiveWithOrientation } from '../hooks/useResponsive';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  KeyOutlined,
  DesktopOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface License {
  id: string;
  licenseKey: string;
  machineId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  usageDays: number;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
  startDate: string;
  endDate: string;
  lastUsed?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

interface LicenseStats {
  total: number;
  active: number;
  expired: number;
  suspended: number;
  expiringSoon: number;
}

const Licenses: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile, isTabletLandscape } = useResponsiveWithOrientation();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<LicenseStats>({
    total: 0,
    active: 0,
    expired: 0,
    suspended: 0,
    expiringSoon: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch licenses
  const fetchLicenses = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (searchText) {
        params.append('search', searchText);
      }

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await axiosInstance.get(`/licenses?${params}`);
      setLicenses(response.data.licenses);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.data.pagination.total
      }));
    } catch (error: any) {
      console.error('Error fetching licenses:', error);
      if (error.response?.status === 401) {
        setError('Vui lòng đăng nhập để truy cập trang này');
        message.error('Vui lòng đăng nhập để truy cập trang này');
      } else {
        setError('Lỗi khi tải danh sách license');
        message.error('Lỗi khi tải danh sách license');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/licenses/stats');
      setStats(response.data.stats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Chỉ fetch data khi component mount, không cần dependencies
    fetchLicenses();
    fetchStats();
  }, []); // Empty dependency array

  useEffect(() => {
    // Fetch data khi search hoặc status thay đổi
    fetchLicenses(1, pagination.pageSize);
  }, [searchText, selectedStatus]); // Dependencies for search and status changes

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      if (editingLicense) {
        await axiosInstance.put(`/licenses/${editingLicense.id}`, values);
        message.success('Cập nhật license thành công');
      } else {
        await axiosInstance.post('/licenses', values);
        message.success('Tạo license thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingLicense(null);
      fetchLicenses(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (error: any) {
      console.error('Error saving license:', error);
      message.error(error.response?.data?.error || 'Lỗi khi lưu license');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/licenses/${id}`);
      message.success('Xóa license thành công');
      fetchLicenses(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting license:', error);
      message.error('Lỗi khi xóa license');
    }
  };

  // Handle edit
  const handleEdit = (license: License) => {
    setEditingLicense(license);
    form.setFieldsValue({
      ...license,
      startDate: moment(license.startDate),
      endDate: moment(license.endDate)
    });
    setModalVisible(true);
  };

  // Handle create new
  const handleCreate = () => {
    setEditingLicense(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đang hoạt động' },
      EXPIRED: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Đã hết hạn' },
      SUSPENDED: { color: 'orange', icon: <StopOutlined />, text: 'Tạm ngưng' },
      REVOKED: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Đã thu hồi' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Calculate remaining days
  const calculateRemainingDays = (endDate: string) => {
    const end = moment(endDate);
    const now = moment();
    const diff = end.diff(now, 'days');
    return Math.max(0, diff);
  };

  // Get remaining days display
  const getRemainingDaysDisplay = (endDate: string) => {
    const remaining = calculateRemainingDays(endDate);
    const total = moment(endDate).diff(moment(), 'days') + remaining;
    const percentage = total > 0 ? (remaining / total) * 100 : 0;

    if (remaining === 0) {
      return <Tag color="red">Đã hết hạn</Tag>;
    }

    if (remaining <= 30) {
      return (
        <div>
          <Tag color="orange">{remaining} ngày</Tag>
          <Progress percent={percentage} size="small" showInfo={false} />
        </div>
      );
    }

    return <Tag color="green">{remaining} ngày</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'LICENSE KEY',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      width: 200,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text code copyable>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'MÁY TÍNH',
      dataIndex: 'machineId',
      key: 'machineId',
      width: 150,
      render: (text: string) => (
        <div>
          <DesktopOutlined style={{ marginRight: 4 }} />
          {text}
        </div>
      )
    },
    {
      title: 'NGƯỜI DÙNG',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (text: string, record: License) => (
        <div>
          <div><UserOutlined style={{ marginRight: 4 }} />{text}</div>
          {record.userPhone && <Text type="secondary" style={{ fontSize: '12px' }}>{record.userPhone}</Text>}
          {record.userEmail && <Text type="secondary" style={{ fontSize: '12px' }}>{record.userEmail}</Text>}
        </div>
      )
    },
    {
      title: 'THỜI HẠN',
      key: 'duration',
      width: 120,
      render: (record: License) => (
        <div>
          <div>{record.usageDays} ngày</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(record.startDate).format('DD/MM/YYYY')} - {moment(record.endDate).format('DD/MM/YYYY')}
          </Text>
        </div>
      )
    },
    {
      title: 'CÒN LẠI',
      key: 'remaining',
      width: 120,
      render: (record: License) => getRemainingDaysDisplay(record.endDate)
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusDisplay(status)
    },
    {
      title: 'LẦN SỬ DỤNG CUỐI',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      width: 150,
      render: (text: string) => (
        text ? (
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {moment(text).format('DD/MM/YYYY HH:mm')}
          </div>
        ) : (
          <Text type="secondary">Chưa sử dụng</Text>
        )
      )
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 120,
      render: (record: License) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa license này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Handle table change
  const handleTableChange = (pagination: any) => {
    fetchLicenses(pagination.current, pagination.pageSize);
  };

  // Handle export
  const handleExport = () => {
    try {
      const data = licenses.map(license => ({
        'License Key': license.licenseKey,
        'Machine ID': license.machineId,
        'User Name': license.userName,
        'User Phone': license.userPhone || '',
        'User Email': license.userEmail || '',
        'Usage Days': license.usageDays,
        'Status': license.status,
        'Start Date': moment(license.startDate).format('DD/MM/YYYY'),
        'End Date': moment(license.endDate).format('DD/MM/YYYY'),
        'Last Used': license.lastUsed ? moment(license.lastUsed).format('DD/MM/YYYY HH:mm') : 'Chưa sử dụng',
        'Remaining Days': calculateRemainingDays(license.endDate),
        'Created By': license.createdBy?.name || '',
        'Created Date': moment(license.createdAt).format('DD/MM/YYYY')
      }));

      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = (row as any)[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_license_${moment().format('YYYY-MM-DD_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success(`Đã xuất ${licenses.length} license ra file CSV`);
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất file CSV');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2}>
              <KeyOutlined style={{ marginRight: '8px' }} />
              Quản lý License
            </Title>
            <Text type="secondary">
              Quản lý license theo ID máy và thời gian sử dụng
            </Text>
          </Col>
          {!isMobile && (
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Tạo License
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                >
                  Xuất CSV
                </Button>
              </Space>
            </Col>
          )}
        </Row>
      </div>

      {/* Error Display */}
      {error && (
        <Card style={{ marginBottom: '24px', borderColor: '#ff4d4f' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#ff4d4f', marginBottom: '8px' }}>
              {error}
            </Title>
            <Text type="secondary">
              Vui lòng đăng nhập lại hoặc liên hệ quản trị viên
            </Text>
            <br />
            <Button 
              type="primary" 
              onClick={() => window.location.href = '/login'}
              style={{ marginTop: '16px' }}
            >
              Đăng nhập
            </Button>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Tổng số"
              value={stats.total}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={stats.expired}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Tạm ngưng"
              value={stats.suspended}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<StopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Sắp hết hạn"
              value={stats.expiringSoon}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Tỷ lệ hoạt động"
              value={stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '24px' }}>
        {!isMobile && !isTabletLandscape && (
          <>
            {/* Custom CSS for desktop license filters */}
            <style>
              {`
                .desktop-license-filter-container {
                  display: flex !important;
                  align-items: center !important;
                  gap: 12px !important;
                }
                .desktop-license-filter-container .ant-input {
                  height: 44px !important;
                  line-height: 44px !important;
                  margin: 0 !important;
                  padding: 0 11px !important;
                  display: flex !important;
                  align-items: center !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                }
                .desktop-license-filter-container .ant-input-affix-wrapper {
                  height: 44px !important;
                  line-height: 44px !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  display: flex !important;
                  align-items: center !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                }
                .desktop-license-filter-container .ant-input-prefix {
                  margin-right: 8px !important;
                  display: flex !important;
                  align-items: center !important;
                  height: 44px !important;
                }
                .desktop-license-filter-container .ant-select {
                  height: 44px !important;
                  margin: 0 !important;
                  display: flex !important;
                  align-items: center !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                }
                .desktop-license-filter-container .ant-select .ant-select-selector {
                  height: 44px !important;
                  line-height: 44px !important;
                  margin: 0 !important;
                  padding: 0 11px !important;
                  display: flex !important;
                  align-items: center !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                }
                .desktop-license-filter-container .ant-select .ant-select-selection-search {
                  height: 44px !important;
                  line-height: 44px !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  display: flex !important;
                  align-items: center !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                }
                .desktop-license-filter-container .ant-select .ant-select-selection-item {
                  height: 44px !important;
                  line-height: 44px !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  display: flex !important;
                  align-items: center !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                }
                .desktop-license-filter-container .ant-btn {
                  height: 44px !important;
                  margin: 0 !important;
                  padding: 0 15px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                }
              `}
            </style>
            <div className="desktop-license-filter-container">
              <Input
                placeholder="Tìm kiếm license key, machine ID, tên người dùng..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ flex: 1, minWidth: '300px' }}
              />
              <Select
                placeholder="Trạng thái"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: '200px' }}
                allowClear
              >
                <Option value="all">Tất cả</Option>
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="EXPIRED">Đã hết hạn</Option>
                <Option value="SUSPENDED">Tạm ngưng</Option>
                <Option value="REVOKED">Đã thu hồi</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchLicenses(1, pagination.pageSize);
                  fetchStats();
                }}
              >
                Làm mới
              </Button>
            </div>
          </>
        )}
        
        {/* Mobile and Tablet Layout - Keep original */}
        {(isMobile || isTabletLandscape) && (
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm license key, machine ID, tên người dùng..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Trạng thái"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="all">Tất cả</Option>
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="EXPIRED">Đã hết hạn</Option>
                <Option value="SUSPENDED">Tạm ngưng</Option>
                <Option value="REVOKED">Đã thu hồi</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchLicenses(1, pagination.pageSize);
                    fetchStats();
                  }}
                >
                  Làm mới
                </Button>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* License Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={licenses}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} license`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingLicense ? 'Chỉnh sửa License' : 'Tạo License mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingLicense(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="machineId"
                label="Machine ID"
                rules={[{ required: true, message: 'Vui lòng nhập Machine ID!' }]}
              >
                <Input placeholder="Nhập Machine ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="usageDays"
                label="Số ngày sử dụng"
                rules={[{ required: true, message: 'Vui lòng nhập số ngày sử dụng!' }]}
              >
                <InputNumber
                  min={1}
                  max={3650}
                  style={{ width: '100%' }}
                  placeholder="Nhập số ngày"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userName"
                label="Tên người dùng"
                rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userPhone"
                label="Số điện thoại"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="userEmail"
            label="Email"
          >
            <Input placeholder="Nhập email" type="email" />
          </Form.Item>

          {editingLicense && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          )}

          {editingLicense && (
            <Form.Item
              name="status"
              label="Trạng thái"
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="EXPIRED">Đã hết hạn</Option>
                <Option value="SUSPENDED">Tạm ngưng</Option>
                <Option value="REVOKED">Đã thu hồi</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingLicense ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingLicense(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Licenses;
