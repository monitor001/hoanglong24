import React from 'react';
import { Modal, Button, Space } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import '../styles/delete-confirmation-modal.css';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  content?: string;
  itemName?: string;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title = 'Xác nhận xóa',
  content = 'Bạn có chắc chắn muốn xóa mục này?',
  itemName,
  loading = false,
  size = 'medium'
}) => {
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const isMobile = window.innerWidth <= 768;

  const getModalSize = () => {
    if (isMobile) {
      return { 
        width: '90%', 
        maxWidth: 380,
        bodyStyle: { padding: '16px' } 
      };
    }
    
    switch (size) {
      case 'small':
        return { width: 380, bodyStyle: { padding: '20px' } };
      case 'large':
        return { width: 580, bodyStyle: { padding: '28px' } };
      default:
        return { width: 460, bodyStyle: { padding: '24px' } };
    }
  };

  const modalConfig = getModalSize();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      destroyOnClose
      className="delete-confirmation-modal"
      maskClosable={false}
      keyboard={true}
      styles={{
        content: {
          borderRadius: isMobile ? '12px' : '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: 'none',
          maxHeight: isMobile ? 'calc(100vh - 32px)' : '90vh',
          overflowY: 'auto'
        },
        header: {
          display: 'none'
        },
        body: {
          ...modalConfig.bodyStyle,
          padding: '0',
          maxHeight: isMobile ? 'calc(100vh - 120px)' : '70vh',
          overflowY: 'auto'
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(2px)'
        }
      }}
      {...modalConfig}
    >
      <div className="delete-confirmation-content">
        <div className="delete-confirmation-icon">
          <div className="delete-confirmation-icon-wrapper">
            <ExclamationCircleOutlined 
              style={{ 
                fontSize: isMobile ? '36px' : '44px', 
                color: '#ff4d4f'
              }} 
            />
          </div>
        </div>
        
        <div className="delete-confirmation-text">
          <h3 className="delete-confirmation-title">
            {title}
          </h3>
          <p className="delete-confirmation-message">
            {itemName ? `${content} "${itemName}"?` : content}
          </p>
          <p className="delete-confirmation-warning">
            ⚠️ Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="delete-confirmation-actions">
          <Space size={isMobile ? "small" : "middle"} style={{ width: '100%', justifyContent: 'center' }}>
            <Button 
              size={isMobile ? "middle" : "large"}
              onClick={onCancel}
              className="delete-confirmation-cancel-btn"
              style={{
                minWidth: isMobile ? '80px' : '100px',
                height: isMobile ? '36px' : '40px',
                borderRadius: '8px',
                border: `1.5px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                background: isDarkMode ? '#1f1f1f' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              danger
              size={isMobile ? "middle" : "large"}
              icon={<DeleteOutlined />}
              onClick={onConfirm}
              loading={loading}
              className="delete-confirmation-delete-btn"
              style={{
                minWidth: isMobile ? '80px' : '100px',
                height: isMobile ? '36px' : '40px',
                borderRadius: '8px',
                background: '#ff4d4f',
                borderColor: '#ff4d4f',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                boxShadow: '0 3px 10px rgba(255, 77, 79, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Xóa
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
