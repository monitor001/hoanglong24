import React from 'react';
import { Table, TableProps } from 'antd';
import { useResponsive } from '../hooks/useResponsive';
import { COMPONENT_BREAKPOINTS } from '../config/breakpoints';

interface ResponsiveTableProps<T = any> extends TableProps<T> {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

const ResponsiveTable = <T extends object = any>({
  mobileBreakpoint,
  tabletBreakpoint,
  scroll,
  size,
  pagination,
  ...props
}: ResponsiveTableProps<T>) => {
  const { isMobile, isTablet } = useResponsive();

  // Responsive scroll settings
  const responsiveScroll = {
    x: isMobile ? COMPONENT_BREAKPOINTS.TABLE.MOBILE_SCROLL_X : 
       isTablet ? COMPONENT_BREAKPOINTS.TABLE.TABLET_SCROLL_X : 
       COMPONENT_BREAKPOINTS.TABLE.DESKTOP_SCROLL_X,
    y: isMobile ? 400 : undefined,
    ...scroll
  };

  // Responsive size
  const responsiveSize = isMobile ? 'small' : 'middle';

  // Responsive pagination
  const responsivePagination = {
    pageSize: isMobile ? COMPONENT_BREAKPOINTS.TABLE.MOBILE_PAGE_SIZE : 
              isTablet ? COMPONENT_BREAKPOINTS.TABLE.TABLET_PAGE_SIZE : 
              COMPONENT_BREAKPOINTS.TABLE.DESKTOP_PAGE_SIZE,
    showSizeChanger: !isMobile,
    showQuickJumper: !isMobile,
    size: isMobile ? 'small' as const : 'default' as const,
    ...pagination
  };

  return (
    <div className="projects-table-container">
      <Table
        {...props}
        scroll={responsiveScroll}
        size={responsiveSize}
        pagination={responsivePagination}
      />
    </div>
  );
};

export default ResponsiveTable; 