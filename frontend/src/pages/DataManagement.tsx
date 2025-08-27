import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Progress,
  Alert,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Popconfirm,
  Divider,
  Timeline,
  Badge
} from 'antd';
import {
  DatabaseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axiosInstance from '../axiosConfig';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface StorageMetrics {
  tableName: string;
  recordCount: number;
  sizeInMB: number;
  lastOptimized: Date;
  optimizationNeeded: boolean;
}

interface MaintenanceJob {
  name: string;
  schedule: string;
  lastRun: Date;
  nextRun: Date;
  status: 'running' | 'completed' | 'failed' | 'idle';
}

interface CleanupResult {
  deleted: number;
  archived: number;
  compressed: number;
}

const DataManagement: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<StorageMetrics[]>([]);
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, jobsRes, recommendationsRes] = await Promise.all([
        axiosInstance.get('/api/admin/storage-metrics'),
        axiosInstance.get('/api/admin/maintenance-jobs'),
        axiosInstance.get('/api/admin/optimization-recommendations')
      ]);

      setMetrics(metricsRes.data);
      setJobs(jobsRes.data);
      setRecommendations(recommendationsRes.data);
    } catch (error) {
      console.error('Error loading data management info:', error);
      message.error('Failed to load data management information');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCleanup = async () => {
    setCleanupLoading(true);
    try {
      const result: CleanupResult = await axiosInstance.post('/api/admin/manual-cleanup');
      message.success(`Cleanup completed: ${result.deleted} deleted, ${result.archived} archived, ${result.compressed} compressed`);
      loadData();
    } catch (error) {
      console.error('Error during manual cleanup:', error);
      message.error('Failed to perform manual cleanup');
    } finally {
      setCleanupLoading(false);
      setCleanupModalVisible(false);
    }
  };

  const handleOptimizeIndexes = async () => {
    try {
      await axiosInstance.post('/api/admin/optimize-indexes');
      message.success('Database indexes optimized successfully');
      loadData();
    } catch (error) {
      console.error('Error optimizing indexes:', error);
      message.error('Failed to optimize database indexes');
    }
  };

  const handleRefreshCache = async () => {
    try {
      const result = await axiosInstance.post('/api/admin/clear-cache');
      message.success(`Cache cleared: ${result.data.cleared} entries removed`);
      loadData();
    } catch (error) {
      console.error('Error clearing cache:', error);
      message.error('Failed to clear cache');
    }
  };

  const columns = [
    {
      title: 'Table Name',
      dataIndex: 'tableName',
      key: 'tableName',
      render: (text: string) => (
        <Space>
          <DatabaseOutlined />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Record Count',
      dataIndex: 'recordCount',
      key: 'recordCount',
      render: (count: number) => (
        <Badge 
          count={count.toLocaleString()} 
          style={{ 
            backgroundColor: count > 50000 ? '#ff4d4f' : count > 10000 ? '#faad14' : '#52c41a' 
          }} 
        />
      ),
      sorter: (a: StorageMetrics, b: StorageMetrics) => a.recordCount - b.recordCount
    },
    {
      title: 'Size (MB)',
      dataIndex: 'sizeInMB',
      key: 'sizeInMB',
      render: (size: number) => (
        <Text type={size > 1000 ? 'danger' : size > 500 ? 'warning' : 'success'}>
          {size.toFixed(2)} MB
        </Text>
      ),
      sorter: (a: StorageMetrics, b: StorageMetrics) => a.sizeInMB - b.sizeInMB
    },
    {
      title: 'Last Optimized',
      dataIndex: 'lastOptimized',
      key: 'lastOptimized',
      render: (date: Date) => (
        <Space>
          <ClockCircleOutlined />
          {dayjs(date).format('YYYY-MM-DD HH:mm')}
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: StorageMetrics) => (
        <Tag color={record.optimizationNeeded ? 'red' : 'green'}>
          {record.optimizationNeeded ? 'Needs Optimization' : 'Optimized'}
        </Tag>
      )
    }
  ];

  const jobColumns = [
    {
      title: 'Job Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <SettingOutlined />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string) => (
        <Tag color="blue">{schedule}</Tag>
      )
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          running: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Running' },
          completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
          failed: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Failed' },
          idle: { color: 'default', icon: <ClockCircleOutlined />, text: 'Idle' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    }
  ];

  const totalRecords = metrics.reduce((sum, m) => sum + m.recordCount, 0);
  const totalSize = metrics.reduce((sum, m) => sum + m.sizeInMB, 0);
  const needsOptimization = metrics.filter(m => m.optimizationNeeded).length;

  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="Access Denied"
          description="You need administrator privileges to access this page."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <DatabaseOutlined /> Data Management
      </Title>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Records"
              value={totalRecords.toLocaleString()}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Size"
              value={totalSize.toFixed(2)}
              suffix="MB"
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tables Need Optimization"
              value={needsOptimization}
              prefix={<WarningOutlined />}
              valueStyle={{ color: needsOptimization > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Jobs"
              value={jobs.filter(j => j.status === 'running').length}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Refresh Data
          </Button>
          <Button 
            icon={<DeleteOutlined />}
            onClick={() => setCleanupModalVisible(true)}
            danger
          >
            Manual Cleanup
          </Button>
          <Button 
            icon={<SettingOutlined />}
            onClick={handleOptimizeIndexes}
          >
            Optimize Indexes
          </Button>
          <Button 
            icon={<DatabaseOutlined />}
            onClick={handleRefreshCache}
          >
            Clear Cache
          </Button>
        </Space>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card title="Optimization Recommendations" style={{ marginBottom: '24px' }}>
          <Timeline>
            {recommendations.map((rec, index) => (
              <Timeline.Item key={index} color="orange">
                <Text>{rec}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* Storage Metrics Table */}
      <Card title="Storage Metrics" style={{ marginBottom: '24px' }}>
        <Table
          columns={columns}
          dataSource={metrics}
          rowKey="tableName"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Maintenance Jobs */}
      <Card title="Maintenance Jobs">
        <Table
          columns={jobColumns}
          dataSource={jobs}
          rowKey="name"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Manual Cleanup Modal */}
      <Modal
        title="Manual Data Cleanup"
        open={cleanupModalVisible}
        onOk={handleManualCleanup}
        onCancel={() => setCleanupModalVisible(false)}
        confirmLoading={cleanupLoading}
        okText="Start Cleanup"
        cancelText="Cancel"
      >
        <Alert
          message="Warning"
          description="This will permanently delete old data based on retention policies. This action cannot be undone."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Text>
          The cleanup process will:
        </Text>
        <ul>
          <li>Delete read notifications older than 30 days</li>
          <li>Archive activity logs older than 90 days</li>
          <li>Compress document history older than 1 year</li>
          <li>Clean up expired user sessions</li>
        </ul>
      </Modal>
    </div>
  );
};

export default DataManagement;
