import React, { useState, useEffect } from 'react';
import { Fab, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { Add, Edit, Delete, Visibility, Download, Share, Settings } from '@mui/icons-material';
import { useResponsiveWithOrientation } from '../hooks/useResponsive';
import './TabletLandscapeFAB.css';

export interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  tooltip?: string;
}

interface TabletLandscapeFABProps {
  actions: FABAction[];
  mainAction?: FABAction;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const TabletLandscapeFAB: React.FC<TabletLandscapeFABProps> = ({
  actions,
  mainAction,
  position = 'bottom-right',
  showOnTablet = true,
  showOnDesktop = false,
  showOnMobile = false,
  className = '',
  style = {}
}) => {
  const { isTablet, isTabletLandscape, isDesktop, isMobile } = useResponsiveWithOrientation();
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Kiểm tra xem có nên hiển thị FAB không
  const shouldShow = () => {
    if (isTabletLandscape && showOnTablet) return true;
    if (isDesktop && showOnDesktop) return true;
    if (isMobile && showOnMobile) return true;
    return false;
  };

  useEffect(() => {
    setIsVisible(shouldShow());
  }, [isTablet, isTabletLandscape, isDesktop, isMobile]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleActionClick = (action: FABAction) => {
    action.onClick();
    setOpen(false);
  };

  if (!isVisible) return null;

  // Nếu chỉ có một action và không có mainAction, sử dụng SpeedDial đơn giản
  if (actions.length === 1 && !mainAction) {
    const action = actions[0];
    return (
      <Fab
        color={action.color || 'primary'}
        aria-label={action.label}
        onClick={action.onClick}
        disabled={action.disabled}
        className={`tablet-landscape-fab single-fab ${position} ${className}`}
        style={style}
        title={action.tooltip || action.label}
      >
        {action.icon}
      </Fab>
    );
  }

  // Nếu có mainAction, sử dụng SpeedDial với main action
  if (mainAction) {
    return (
      <SpeedDial
        ariaLabel="Tablet Landscape FAB"
        sx={{
          position: 'fixed',
          ...getPositionStyles(position),
          '& .MuiFab-primary': {
            width: 56,
            height: 56,
          },
        }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        className={`tablet-landscape-fab speed-dial ${position} ${className}`}
        style={style}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.id}
            icon={action.icon}
            tooltipTitle={action.tooltip || action.label}
            onClick={() => handleActionClick(action)}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                backgroundColor: action.color ? `${action.color}.main` : 'primary.main',
                '&:hover': {
                  backgroundColor: action.color ? `${action.color}.dark` : 'primary.dark',
                },
              },
            }}
          />
        ))}
      </SpeedDial>
    );
  }

  // Nếu có nhiều actions, sử dụng SpeedDial thông thường
  return (
    <SpeedDial
      ariaLabel="Tablet Landscape FAB"
      sx={{
        position: 'fixed',
        ...getPositionStyles(position),
        '& .MuiFab-primary': {
          width: 56,
          height: 56,
        },
      }}
      icon={<SpeedDialIcon />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      className={`tablet-landscape-fab speed-dial ${position} ${className}`}
      style={style}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.id}
          icon={action.icon}
          tooltipTitle={action.tooltip || action.label}
          onClick={() => handleActionClick(action)}
          sx={{
            '& .MuiSpeedDialAction-fab': {
              backgroundColor: action.color ? `${action.color}.main` : 'primary.main',
              '&:hover': {
                backgroundColor: action.color ? `${action.color}.dark` : 'primary.dark',
              },
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};

// Helper function để tính toán vị trí
const getPositionStyles = (position: string) => {
  const baseStyles = {
    zIndex: 1000,
  };

  switch (position) {
    case 'bottom-right':
      return { ...baseStyles, bottom: 16, right: 16 };
    case 'bottom-left':
      return { ...baseStyles, bottom: 16, left: 16 };
    case 'top-right':
      return { ...baseStyles, top: 16, right: 16 };
    case 'top-left':
      return { ...baseStyles, top: 16, left: 16 };
    default:
      return { ...baseStyles, bottom: 16, right: 16 };
  }
};

export default TabletLandscapeFAB;
