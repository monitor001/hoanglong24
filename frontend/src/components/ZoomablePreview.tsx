import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  FullscreenOutlined,
  FullscreenExitOutlined,
  RotateLeftOutlined,
  RotateRightOutlined
} from '@ant-design/icons';

interface ZoomablePreviewProps {
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

const ZoomablePreview: React.FC<ZoomablePreviewProps> = ({ 
  children, 
  width = '100%', 
  height = '100%',
  style = {}
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;
  const SCALE_STEP = 0.25;

  // Zoom functions
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - SCALE_STEP, MIN_SCALE));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const rotateLeft = useCallback(() => {
    setRotation(prev => prev - 90);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation(prev => prev + 90);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta)));
    }
  }, []);

  // Mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    background: '#000',
    cursor: isDragging ? 'grabbing' : 'grab',
    ...style
  };

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    userSelect: 'none',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8
  };

  return (
    <div 
      ref={containerRef}
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div ref={contentRef} style={contentStyle}>
        {children}
      </div>
      
      {/* Controls */}
      <div style={controlsStyle}>
        <Space size="small">
          <Tooltip title="Thu nhỏ (Ctrl + -)">
            <Button 
              type="text" 
              icon={<ZoomOutOutlined />} 
              onClick={zoomOut}
              style={{ color: 'white' }}
              disabled={scale <= MIN_SCALE}
            />
          </Tooltip>
          
          <Tooltip title="Phóng to (Ctrl + +)">
            <Button 
              type="text" 
              icon={<ZoomInOutlined />} 
              onClick={zoomIn}
              style={{ color: 'white' }}
              disabled={scale >= MAX_SCALE}
            />
          </Tooltip>
          
          <Tooltip title="Xoay trái">
            <Button 
              type="text" 
              icon={<RotateLeftOutlined />} 
              onClick={rotateLeft}
              style={{ color: 'white' }}
            />
          </Tooltip>
          
          <Tooltip title="Xoay phải">
            <Button 
              type="text" 
              icon={<RotateRightOutlined />} 
              onClick={rotateRight}
              style={{ color: 'white' }}
            />
          </Tooltip>
          
          <Tooltip title="Đặt lại">
            <Button 
              type="text" 
              onClick={resetZoom}
              style={{ color: 'white' }}
            >
              Reset
            </Button>
          </Tooltip>
          
          <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
            <Button 
              type="text" 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              onClick={toggleFullscreen}
              style={{ color: 'white' }}
            />
          </Tooltip>
        </Space>
      </div>
      
      {/* Zoom info */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12
      }}>
        {Math.round(scale * 100)}% | {rotation}°
      </div>
    </div>
  );
};

export default ZoomablePreview; 