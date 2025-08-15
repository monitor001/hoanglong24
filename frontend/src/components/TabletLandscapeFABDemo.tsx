import React from 'react';
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Download, 
  Share, 
  Settings,
  FileCopy,
  Print,
  Email
} from '@mui/icons-material';
import { Box, Typography, Paper, Grid } from '@mui/material';
import TabletLandscapeFAB, { FABAction } from './TabletLandscapeFAB';

const TabletLandscapeFABDemo: React.FC = () => {
  // Ví dụ 1: FAB đơn giản với một action
  const singleAction: FABAction = {
    id: 'add',
    icon: <Add />,
    label: 'Thêm mới',
    onClick: () => console.log('Thêm mới'),
    color: 'primary',
    tooltip: 'Thêm item mới'
  };

  // Ví dụ 2: Nhiều actions cho quản lý dự án
  const projectActions: FABAction[] = [
    {
      id: 'add-project',
      icon: <Add />,
      label: 'Thêm dự án',
      onClick: () => console.log('Thêm dự án'),
      color: 'primary'
    },
    {
      id: 'edit-project',
      icon: <Edit />,
      label: 'Chỉnh sửa',
      onClick: () => console.log('Chỉnh sửa dự án'),
      color: 'info'
    },
    {
      id: 'view-project',
      icon: <Visibility />,
      label: 'Xem chi tiết',
      onClick: () => console.log('Xem chi tiết dự án'),
      color: 'success'
    },
    {
      id: 'delete-project',
      icon: <Delete />,
      label: 'Xóa dự án',
      onClick: () => console.log('Xóa dự án'),
      color: 'error'
    }
  ];

  // Ví dụ 3: Actions cho quản lý tài liệu
  const documentActions: FABAction[] = [
    {
      id: 'download',
      icon: <Download />,
      label: 'Tải xuống',
      onClick: () => console.log('Tải xuống tài liệu'),
      color: 'primary'
    },
    {
      id: 'share',
      icon: <Share />,
      label: 'Chia sẻ',
      onClick: () => console.log('Chia sẻ tài liệu'),
      color: 'info'
    },
    {
      id: 'print',
      icon: <Print />,
      label: 'In tài liệu',
      onClick: () => console.log('In tài liệu'),
      color: 'warning'
    },
    {
      id: 'email',
      icon: <Email />,
      label: 'Gửi email',
      onClick: () => console.log('Gửi email'),
      color: 'success'
    },
    {
      id: 'copy',
      icon: <FileCopy />,
      label: 'Sao chép',
      onClick: () => console.log('Sao chép tài liệu'),
      color: 'secondary'
    }
  ];

  // Ví dụ 4: Main action với sub-actions
  const mainAction: FABAction = {
    id: 'main-settings',
    icon: <Settings />,
    label: 'Cài đặt',
    onClick: () => console.log('Mở cài đặt chính'),
    color: 'primary'
  };

  const settingsActions: FABAction[] = [
    {
      id: 'user-settings',
      icon: <Edit />,
      label: 'Cài đặt người dùng',
      onClick: () => console.log('Cài đặt người dùng'),
      color: 'info'
    },
    {
      id: 'system-settings',
      icon: <Settings />,
      label: 'Cài đặt hệ thống',
      onClick: () => console.log('Cài đặt hệ thống'),
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', position: 'relative' }}>
      <Typography variant="h4" gutterBottom>
        TabletLandscapeFAB Demo
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 200 }}>
            <Typography variant="h6" gutterBottom>
              Ví dụ 1: FAB đơn giản
            </Typography>
            <Typography variant="body2" color="text.secondary">
              FAB với một action duy nhất
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 200 }}>
            <Typography variant="h6" gutterBottom>
              Ví dụ 2: Quản lý dự án
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SpeedDial với nhiều actions cho quản lý dự án
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 200 }}>
            <Typography variant="h6" gutterBottom>
              Ví dụ 3: Quản lý tài liệu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SpeedDial với nhiều actions cho quản lý tài liệu
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 200 }}>
            <Typography variant="h6" gutterBottom>
              Ví dụ 4: Main Action
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SpeedDial với main action và sub-actions
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* FAB Examples */}
      
      {/* Ví dụ 1: FAB đơn giản */}
      <TabletLandscapeFAB
        actions={[singleAction]}
        position="bottom-right"
        showOnTablet={true}
        showOnDesktop={true}
        showOnMobile={true}
      />

      {/* Ví dụ 2: Quản lý dự án */}
      <TabletLandscapeFAB
        actions={projectActions}
        position="bottom-left"
        showOnTablet={true}
        showOnDesktop={false}
        showOnMobile={false}
      />

      {/* Ví dụ 3: Quản lý tài liệu */}
      <TabletLandscapeFAB
        actions={documentActions}
        position="top-right"
        showOnTablet={true}
        showOnDesktop={false}
        showOnMobile={false}
      />

      {/* Ví dụ 4: Main Action */}
      <TabletLandscapeFAB
        actions={settingsActions}
        mainAction={mainAction}
        position="top-left"
        showOnTablet={true}
        showOnDesktop={false}
        showOnMobile={false}
      />
    </Box>
  );
};

export default TabletLandscapeFABDemo;
