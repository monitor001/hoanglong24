import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tabs, Segmented } from 'antd';
import { 
  RadarChartOutlined, 
  CheckCircleOutlined, 
  BugOutlined, 
  FileTextOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useResponsiveBreakpoint } from '../hooks/useResponsiveChart';
import '../styles/swipeable-tabs.css';

const { TabPane } = Tabs;

interface SwipeableTabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  children: React.ReactNode;
  isDarkMode?: boolean; // Add theme prop
}

const SwipeableTabs: React.FC<SwipeableTabsProps> = ({ 
  activeKey, 
  onChange, 
  children,
  isDarkMode = false // Default to light theme
}) => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useResponsiveBreakpoint();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if device is in landscape mode
  const [isLandscape, setIsLandscape] = useState(false);
  
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);
    };
    
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };
    
    checkOrientation();
    checkTouchDevice();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  // Enable swipe for all mobile and tablet devices (both portrait and landscape)
  const shouldUseSwipe = isMobile || isTablet;

  // Tab configuration
  const tabs = [
    { key: 'overview', icon: <RadarChartOutlined style={{ fontSize: 16 }} />, title: t('dashboard.overview') },
    { key: 'tasks', icon: <CheckCircleOutlined style={{ fontSize: 16 }} />, title: t('dashboard.tasks') },
    { key: 'issues', icon: <BugOutlined style={{ fontSize: 16 }} />, title: t('dashboard.issues') },
    { key: 'documents', icon: <FileTextOutlined style={{ fontSize: 16 }} />, title: t('dashboard.documents') },
    { key: 'calendar', icon: <CalendarOutlined style={{ fontSize: 16 }} />, title: t('dashboard.calendar') },
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.key === activeKey);

  // Add haptic feedback for mobile devices
  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator && isTouchDevice) {
      navigator.vibrate(10); // Short vibration
    }
  }, [isTouchDevice]);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!shouldUseSwipe) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  }, [shouldUseSwipe]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!shouldUseSwipe || !isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    setCurrentX(e.touches[0].clientX);
  }, [shouldUseSwipe, isDragging]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!shouldUseSwipe || !isDragging) return;
    
    setIsDragging(false);
    const deltaX = currentX - startX;
    // Adjust threshold based on device type and orientation
    const threshold = isMobile ? 30 : 40; // Lower threshold for mobile for better responsiveness

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentTabIndex > 0) {
        // Swipe right - go to previous tab
        triggerHapticFeedback();
        onChange(tabs[currentTabIndex - 1].key);
      } else if (deltaX < 0 && currentTabIndex < tabs.length - 1) {
        // Swipe left - go to next tab
        triggerHapticFeedback();
        onChange(tabs[currentTabIndex + 1].key);
      }
    }
  }, [shouldUseSwipe, isDragging, currentX, startX, currentTabIndex, onChange, tabs, isMobile]);

  // Handle mouse events for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!shouldUseSwipe) return;
    
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  }, [shouldUseSwipe]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!shouldUseSwipe || !isDragging) return;
    
    setCurrentX(e.clientX);
  }, [shouldUseSwipe, isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!shouldUseSwipe || !isDragging) return;
    
    setIsDragging(false);
    const deltaX = currentX - startX;
    const threshold = isMobile ? 30 : 50; // Adjust threshold for mobile

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentTabIndex > 0) {
        triggerHapticFeedback();
        onChange(tabs[currentTabIndex - 1].key);
      } else if (deltaX < 0 && currentTabIndex < tabs.length - 1) {
        triggerHapticFeedback();
        onChange(tabs[currentTabIndex + 1].key);
      }
    }
  }, [shouldUseSwipe, isDragging, currentX, startX, currentTabIndex, onChange, tabs, triggerHapticFeedback, isMobile]);

  // Add global mouse event listeners
  useEffect(() => {
    if (!shouldUseSwipe) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setCurrentX(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const deltaX = currentX - startX;
        const threshold = isMobile ? 30 : 40; // Adjust threshold for mobile

        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && currentTabIndex > 0) {
            triggerHapticFeedback();
            onChange(tabs[currentTabIndex - 1].key);
          } else if (deltaX < 0 && currentTabIndex < tabs.length - 1) {
            triggerHapticFeedback();
            onChange(tabs[currentTabIndex + 1].key);
          }
        }
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [shouldUseSwipe, isDragging, currentX, startX, currentTabIndex, onChange, tabs, triggerHapticFeedback]);

  // Calculate transform for visual feedback
  const getTransform = () => {
    if (!shouldUseSwipe || !isDragging) return 'translateX(0)';
    
    const deltaX = currentX - startX;
    const maxDelta = 80; // Maximum visual movement
    const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaX));
    
    // Add some resistance as user swipes
    const resistance = 0.6;
    const resistedDelta = clampedDelta * resistance;
    
    return `translateX(${resistedDelta}px)`;
  };

  // Dynamic styles based on theme
  const getContainerStyle = () => ({
    backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
    borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
  });

  const getTabItemStyle = (isActive: boolean) => ({
    backgroundColor: isActive 
      ? (isDarkMode ? '#177ddc' : '#e6f7ff')
      : 'transparent',
    borderColor: isActive 
      ? (isDarkMode ? '#177ddc' : '#91d5ff')
      : 'transparent',
    color: isActive 
      ? (isDarkMode ? '#ffffff' : '#1890ff')
      : (isDarkMode ? '#bfbfbf' : '#666'),
    boxShadow: isActive 
      ? (isDarkMode ? '0 2px 8px rgba(23, 125, 220, 0.3)' : '0 2px 8px rgba(24, 144, 255, 0.15)')
      : 'none',
  });

  const getInstructionsStyle = () => ({
    backgroundColor: isDarkMode ? '#1f1f1f' : '#f9f9f9',
    borderColor: isDarkMode ? '#303030' : '#f0f0f0',
    color: isDarkMode ? '#bfbfbf' : '#999',
  });

  if (shouldUseSwipe) {
    return (
      <div 
        ref={containerRef}
        className="swipeable-tabs-container"
      >
        {/* Swipe indicator */}
        <div className="swipeable-tabs-indicator">
          <div 
            className="swipeable-tabs-progress"
            style={{
              width: `${((currentTabIndex + 1) / tabs.length) * 100}%`,
              transition: isDragging ? 'none' : 'width 0.3s ease'
            }}
          />
        </div>

        {/* Tab indicators */}
        <div 
          className="swipeable-tabs-header"
          style={getContainerStyle()}
        >
          {tabs.map((tab, index) => (
            <div
              key={tab.key}
              className={`swipeable-tab-item ${activeKey === tab.key ? 'active' : ''}`}
              style={getTabItemStyle(activeKey === tab.key)}
              onClick={() => {
                triggerHapticFeedback();
                onChange(tab.key);
              }}
            >
              <div className="swipeable-tab-icon">
                {tab.icon}
              </div>
              <div className="swipeable-tab-title">
                {tab.title}
              </div>
            </div>
          ))}
        </div>

        {/* Swipeable content */}
        <div
          ref={contentRef}
          className={`swipeable-tabs-content ${isDragging ? 'dragging' : ''}`}
          style={{
            transform: getTransform()
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDragStart={(e) => e.preventDefault()} // Prevent default drag behavior
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === TabPane) {
              return child.key === activeKey ? child.props.children : null;
            }
            return null;
          })}
        </div>

        {/* Swipe instructions - only show on touch devices */}
        {isTouchDevice && (
          <div 
            className="swipeable-tabs-instructions"
            style={getInstructionsStyle()}
          >
            <span>
              {isLandscape ? 'Vuốt sang trái/phải để chuyển tab' : 'Vuốt sang trái/phải để chuyển tab'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback to regular responsive tabs for non-swipe devices
  if (isMobile) {
    return (
      <div style={{ marginTop: 16 }}>
        <Segmented
          options={tabs.map(tab => ({
            label: tab.icon,
            value: tab.key,
            title: tab.title
          }))}
          value={activeKey}
          onChange={(value) => onChange(value as string)}
          block
          style={{ marginBottom: 16 }}
        />
        <div>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === TabPane) {
              return child.key === activeKey ? child.props.children : null;
            }
            return null;
          })}
        </div>
      </div>
    );
  }
  
  return (
    <Tabs 
      activeKey={activeKey} 
      onChange={onChange}
      style={{ marginTop: 24 }}
    >
      {children}
    </Tabs>
  );
};

export default SwipeableTabs;
