import React from 'react';
import { Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface MobileRefreshIndicatorProps {
  isRefreshing: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}

const MobileRefreshIndicator: React.FC<MobileRefreshIndicatorProps> = ({
  isRefreshing,
  lastRefreshTime,
  onRefresh
}) => {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }
  };

  return (
    <div className="mobile-refresh-indicator">
      <div className="refresh-status">
        <span className="refresh-text">
          Cập nhật lần cuối: {formatTimeAgo(lastRefreshTime)}
        </span>
        {isRefreshing && (
          <div className="refresh-loading">
            <Spin size="small" />
            <span>Đang cập nhật...</span>
          </div>
        )}
      </div>
      
      <button 
        className="mobile-refresh-button"
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Làm mới dữ liệu"
      >
        <ReloadOutlined spin={isRefreshing} />
      </button>
    </div>
  );
};

export default MobileRefreshIndicator;
