import React from 'react';
import { Menu } from 'antd';
import { KeyOutlined } from '@ant-design/icons';

const LicenseMenuTest: React.FC = () => {
  const menuItems = [
    {
      key: 'licenses',
      icon: <KeyOutlined />,
      label: 'Quản lý License',
      onClick: () => console.log('Navigate to /licenses')
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h3>Test Menu License</h3>
      <Menu
        mode="inline"
        items={menuItems}
        style={{ width: 200 }}
      />
    </div>
  );
};

export default LicenseMenuTest;
