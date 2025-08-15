import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, Progress, Table, Tag, Space, Typography, Alert } from 'antd';
import { 
  ReloadOutlined, 
  ClearOutlined, 
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';

const { Title, Text } = Typography;

interface PermissionMetrics {
  totalChecks: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  slowQueries: number;
  errors: number;
}

interface PermissionPerformancePanelProps {
  visible?: boolean;
  refreshInterval?: number; // in milliseconds
}

const PermissionPerformancePanel: React.FC<PermissionPerformancePanelProps> = ({ 
  visible = false, 
  refreshInterval = 30000 // 30 seconds
}) => {
  const [metrics, setMetrics] = useState<PermissionMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/permissions/optimized/metrics');
      setMetrics(response.data.data.metrics);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Failed to fetch permission metrics:', err);
      setError(err.response?.data?.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const resetMetrics = async () => {
    try {
      await axiosInstance.post('/permissions/optimized/metrics/reset');
      await fetchMetrics();
    } catch (err: any) {
      console.error('Failed to reset metrics:', err);
      setError(err.response?.data?.message || 'Failed to reset metrics');
    }
  };

  const clearCache = async () => {
    try {
      await axiosInstance.post('/permissions/optimized/cache/clear');
      await fetchMetrics();
    } catch (err: any) {
      console.error('Failed to clear cache:', err);
      setError(err.response?.data?.message || 'Failed to clear cache');
    }
  };

  useEffect(() => {
    if (visible) {
      fetchMetrics();
      
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [visible, refreshInterval]);

  if (!visible) return null;

  const cacheHitRate = metrics ? (metrics.cacheHits / metrics.totalChecks * 100) : 0;
  const errorRate = metrics ? (metrics.errors / metrics.totalChecks * 100) : 0;
  const slowQueryRate = metrics ? (metrics.slowQueries / metrics.totalChecks * 100) : 0;

  const getPerformanceStatus = () => {
    if (!metrics) return 'unknown';
    
    if (cacheHitRate >= 80 && errorRate < 1 && slowQueryRate < 5) return 'excellent';
    if (cacheHitRate >= 60 && errorRate < 5 && slowQueryRate < 10) return 'good';
    if (cacheHitRate >= 40 && errorRate < 10 && slowQueryRate < 20) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'orange';
      case 'poor': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Unknown';
    }
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <Card
      title={
        <Space>
          <BarChartOutlined />
          <span>Permission System Performance</span>
          <Tag color={getStatusColor(performanceStatus)}>
            {getStatusText(performanceStatus)}
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchMetrics} 
            loading={loading}
            size="small"
          >
            Refresh
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={clearCache}
            size="small"
            danger
          >
            Clear Cache
          </Button>
          <Button 
            onClick={resetMetrics}
            size="small"
          >
            Reset Metrics
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {lastRefresh && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </Text>
      )}

      {metrics && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Statistic
                title="Total Checks"
                value={metrics.totalChecks}
                prefix={<BarChartOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Cache Hit Rate"
                value={cacheHitRate}
                precision={2}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: cacheHitRate >= 80 ? '#3f8600' : cacheHitRate >= 60 ? '#1890ff' : '#cf1322' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Avg Response Time"
                value={metrics.averageResponseTime}
                precision={2}
                suffix="ms"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: metrics.averageResponseTime < 100 ? '#3f8600' : metrics.averageResponseTime < 500 ? '#1890ff' : '#cf1322' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Error Rate"
                value={errorRate}
                precision={2}
                suffix="%"
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: errorRate < 1 ? '#3f8600' : errorRate < 5 ? '#1890ff' : '#cf1322' }}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card size="small" title="Cache Performance">
                <Progress
                  type="circle"
                  percent={cacheHitRate}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                  status={cacheHitRate >= 80 ? 'success' : cacheHitRate >= 60 ? 'normal' : 'exception'}
                />
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <Text type="secondary">
                    {metrics.cacheHits} hits / {metrics.cacheMisses} misses
                  </Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Query Performance">
                <Progress
                  type="circle"
                  percent={100 - slowQueryRate}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                  status={slowQueryRate < 5 ? 'success' : slowQueryRate < 10 ? 'normal' : 'exception'}
                />
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <Text type="secondary">
                    {metrics.slowQueries} slow queries
                  </Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Error Rate">
                <Progress
                  type="circle"
                  percent={100 - errorRate}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                  status={errorRate < 1 ? 'success' : errorRate < 5 ? 'normal' : 'exception'}
                />
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <Text type="secondary">
                    {metrics.errors} errors
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card size="small" title="Performance Recommendations">
            <ul>
              {cacheHitRate < 60 && (
                <li>
                  <Text type="warning">
                    Cache hit rate is low ({cacheHitRate.toFixed(1)}%). Consider increasing cache TTL or optimizing permission checks.
                  </Text>
                </li>
              )}
              {metrics.averageResponseTime > 500 && (
                <li>
                  <Text type="warning">
                    Average response time is high ({metrics.averageResponseTime.toFixed(2)}ms). Consider optimizing database queries.
                  </Text>
                </li>
              )}
              {errorRate > 5 && (
                <li>
                  <Text type="danger">
                    Error rate is high ({errorRate.toFixed(2)}%). Check for database connection issues or permission configuration problems.
                  </Text>
                </li>
              )}
              {slowQueryRate > 10 && (
                <li>
                  <Text type="warning">
                    Slow query rate is high ({slowQueryRate.toFixed(2)}%). Consider adding database indexes or optimizing queries.
                  </Text>
                </li>
              )}
              {cacheHitRate >= 80 && errorRate < 1 && metrics.averageResponseTime < 100 && (
                <li>
                  <Text type="success">
                    Permission system is performing excellently! All metrics are within optimal ranges.
                  </Text>
                </li>
              )}
            </ul>
          </Card>
        </>
      )}
    </Card>
  );
};

export default PermissionPerformancePanel;
