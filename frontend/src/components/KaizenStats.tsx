import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Typography,
  Spin,
  Empty,
  Divider,
  Space
} from 'antd';
import {
  BulbOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  UserOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  TrendingUpOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Line, Bar, Pie, Column } from '@ant-design/plots';

const { Title, Text } = Typography;

const KaizenStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/kaizen/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return <Empty description="Không có dữ liệu thống kê" />;
  }

  // Prepare chart data
  const statusData = stats.kaizensByStatus?.map((item: any) => ({
    type: getStatusLabel(item.status),
    value: item._count.status
  })) || [];

  const categoryData = stats.kaizensByCategory?.map((item: any) => ({
    type: getCategoryLabel(item.category),
    value: item._count.category
  })) || [];

  const monthlyData = stats.kaizensByMonth?.map((item: any) => ({
    month: new Date(item.month).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
    count: parseInt(item.count)
  })) || [];

  const topTagsData = stats.topTags?.slice(0, 10).map((tag: any) => ({
    type: tag.nameVi || tag.name,
    value: tag.usageCount
  })) || [];

  const topAuthorsData = stats.topAuthors?.map((author: any) => ({
    type: author.author?.name || 'Unknown',
    value: author._count.authorId
  })) || [];

  // Helper functions
  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'Nháp',
      'SUBMITTED': 'Đã gửi',
      'UNDER_REVIEW': 'Đang xem xét',
      'APPROVED': 'Đã phê duyệt',
      'IMPLEMENTED': 'Đã triển khai',
      'COMPLETED': 'Hoàn thành',
      'REJECTED': 'Từ chối',
      'ARCHIVED': 'Lưu trữ'
    };
    return statusMap[status] || status;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'PROCESS': 'Quy trình',
      'QUALITY': 'Chất lượng',
      'SAFETY': 'An toàn',
      'EFFICIENCY': 'Hiệu quả',
      'COST': 'Chi phí',
      'OTHER': 'Khác'
    };
    return categoryMap[category] || category;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'DRAFT': '#8c8c8c',
      'SUBMITTED': '#1890ff',
      'UNDER_REVIEW': '#faad14',
      'APPROVED': '#52c41a',
      'IMPLEMENTED': '#13c2c2',
      'COMPLETED': '#722ed1',
      'REJECTED': '#f5222d',
      'ARCHIVED': '#bfbfbf'
    };
    return colorMap[status] || '#8c8c8c';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'PROCESS': '#1890ff',
      'QUALITY': '#52c41a',
      'SAFETY': '#faad14',
      'EFFICIENCY': '#722ed1',
      'COST': '#eb2f96',
      'OTHER': '#8c8c8c'
    };
    return colorMap[category] || '#8c8c8c';
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số cải tiến"
              value={stats.totalKaizens}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={stats.kaizensByStatus?.find((s: any) => s.status === 'COMPLETED')?._count.status || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang triển khai"
              value={stats.kaizensByStatus?.find((s: any) => s.status === 'IMPLEMENTED')?._count.status || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang xem xét"
              value={stats.kaizensByStatus?.find((s: any) => s.status === 'UNDER_REVIEW')?._count.status || 0}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Phân bố theo trạng thái">
            {statusData.length > 0 ? (
              <Pie
                data={statusData}
                angleField="value"
                colorField="type"
                radius={0.8}
                label={{
                  type: 'outer',
                  content: '{name} {percentage}'
                }}
                interactions={[
                  {
                    type: 'element-active'
                  }
                ]}
                color={['#8c8c8c', '#1890ff', '#faad14', '#52c41a', '#13c2c2', '#722ed1', '#f5222d', '#bfbfbf']}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Phân bố theo danh mục">
            {categoryData.length > 0 ? (
              <Pie
                data={categoryData}
                angleField="value"
                colorField="type"
                radius={0.8}
                label={{
                  type: 'outer',
                  content: '{name} {percentage}'
                }}
                interactions={[
                  {
                    type: 'element-active'
                  }
                ]}
                color={['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#8c8c8c']}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Xu hướng theo tháng">
            {monthlyData.length > 0 ? (
              <Line
                data={monthlyData}
                xField="month"
                yField="count"
                point={{
                  size: 5,
                  shape: 'diamond'
                }}
                label={{
                  style: {
                    fill: '#aaa'
                  }
                }}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top 10 Tags phổ biến">
            {topTagsData.length > 0 ? (
              <Bar
                data={topTagsData}
                xField="value"
                yField="type"
                seriesField="type"
                legend={false}
                label={{
                  position: 'right',
                  style: {
                    fill: '#aaa'
                  }
                }}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Top tác giả đóng góp">
            {topAuthorsData.length > 0 ? (
              <Column
                data={topAuthorsData}
                xField="type"
                yField="value"
                label={{
                  position: 'top',
                  style: {
                    fill: '#aaa'
                  }
                }}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Cải tiến gần đây">
            {stats.recentKaizens && stats.recentKaizens.length > 0 ? (
              <List
                size="small"
                dataSource={stats.recentKaizens}
                renderItem={(kaizen: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BulbOutlined />} />}
                      title={kaizen.title}
                      description={
                        <Space>
                          <Text type="secondary">{kaizen.author.name}</Text>
                          <Text type="secondary">
                            {new Date(kaizen.createdAt).toLocaleDateString('vi-VN')}
                          </Text>
                          <Tag color={getStatusColor(kaizen.status)}>
                            {getStatusLabel(kaizen.status)}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Detailed Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Chi tiết theo trạng thái">
            {stats.kaizensByStatus && stats.kaizensByStatus.length > 0 ? (
              <List
                size="small"
                dataSource={stats.kaizensByStatus}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: getStatusColor(item.status) }} />
                      }
                      title={getStatusLabel(item.status)}
                      description={
                        <div>
                          <Text strong>{item._count.status}</Text> cải tiến
                          <Progress
                            percent={Math.round((item._count.status / stats.totalKaizens) * 100)}
                            size="small"
                            showInfo={false}
                            strokeColor={getStatusColor(item.status)}
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Chi tiết theo danh mục">
            {stats.kaizensByCategory && stats.kaizensByCategory.length > 0 ? (
              <List
                size="small"
                dataSource={stats.kaizensByCategory}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: getCategoryColor(item.category) }} />
                      }
                      title={getCategoryLabel(item.category)}
                      description={
                        <div>
                          <Text strong>{item._count.category}</Text> cải tiến
                          <Progress
                            percent={Math.round((item._count.category / stats.totalKaizens) * 100)}
                            size="small"
                            showInfo={false}
                            strokeColor={getCategoryColor(item.category)}
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KaizenStats;
