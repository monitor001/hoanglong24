import React, { useState, useEffect } from 'react';
import { List, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message, Tooltip, Badge, Divider, Menu, Dropdown, Typography } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PushpinOutlined,
  InboxOutlined,
  ShareAltOutlined,
  CopyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: string;
    name: string;
    color: string;
  };
}

interface NotesListViewProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  isDarkMode: boolean;
  convertColorBetweenThemes: (color: string) => string;
  getTextColorForBackground: (backgroundColor: string) => string;
}

const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
  isDarkMode,
  convertColorBetweenThemes,
  getTextColorForBackground,
}) => {
  const noteMenu = (note: Note) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(note)}>
        Chỉnh sửa
      </Menu.Item>
      <Menu.Item key="pin" icon={<PushpinOutlined />} onClick={() => onTogglePin(note)}>
        {note.isPinned ? 'Bỏ ghim' : 'Ghim'}
      </Menu.Item>
      <Menu.Item key="archive" icon={<InboxOutlined />} onClick={() => onToggleArchive(note)}>
        {note.isArchived ? 'Bỏ lưu trữ' : 'Lưu trữ'}
      </Menu.Item>
      <Menu.Item key="share" icon={<ShareAltOutlined />}>
        Chia sẻ
      </Menu.Item>
      <Menu.Item key="copy" icon={<CopyOutlined />}>
        Sao chép
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => onDelete(note.id)}>
        Xóa
      </Menu.Item>
    </Menu>
  );

  return (
    <List
      dataSource={notes}
      renderItem={(note) => (
        <List.Item
          style={{
            padding: '16px',
            marginBottom: '8px',
            background: convertColorBetweenThemes(note.color) || '#fff',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                {note.isPinned && <PushpinOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />}
                {note.isArchived && <InboxOutlined style={{ color: '#52c41a', marginRight: '8px' }} />}
                <Title level={5} style={{ margin: 0, color: getTextColorForBackground(convertColorBetweenThemes(note.color) || '#fff') }}>
                  {note.title}
                </Title>
              </div>
              
              <Text
                style={{
                  color: getTextColorForBackground(convertColorBetweenThemes(note.color) || '#fff') === '#000' ? '#666' : '#ccc',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                {note.content.replace(/<[^>]*>/g, '')} {/* Remove HTML tags for preview */}
              </Text>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Space size="small">
                  <ClockCircleOutlined style={{ fontSize: '12px', color: getTextColorForBackground(convertColorBetweenThemes(note.color) || '#fff') === '#000' ? '#999' : '#ccc' }} />
                  <Text type="secondary" style={{ fontSize: '12px', color: getTextColorForBackground(convertColorBetweenThemes(note.color) || '#fff') === '#000' ? '#999' : '#ccc' }}>
                    {dayjs(note.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Space>
                
                {note.folder && (
                  <Tag 
                    color={note.folder.color} 
                    style={{ 
                      margin: 0, 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: getTextColorForBackground(convertColorBetweenThemes(note.folder.color) || '#fff'),
                      border: `2px solid ${note.folder.color}`,
                      backgroundColor: note.folder.color
                    }}
                  >
                    {note.folder.name}
                  </Tag>
                )}
                
                {note.tags && note.tags.slice(0, 3).map(tag => (
                  <Tag 
                    key={tag} 
                    style={{ 
                      margin: 0, 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#1890ff',
                      border: '2px solid #1890ff',
                      borderRadius: '12px',
                      padding: '2px 8px'
                    }}
                  >
                    #{tag}
                  </Tag>
                ))}
                
                {note.tags && note.tags.length > 3 && (
                  <Tag 
                    style={{ 
                      margin: 0, 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#722ed1',
                      border: '2px solid #722ed1',
                      borderRadius: '12px',
                      padding: '2px 8px'
                    }}
                  >
                    +{note.tags.length - 3}
                  </Tag>
                )}
              </div>
            </div>
            
            <Dropdown overlay={noteMenu(note)} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} style={{ color: getTextColorForBackground(convertColorBetweenThemes(note.color) || '#fff') }} />
            </Dropdown>
          </div>
        </List.Item>
      )}
    />
  );
};

export default NotesListView; 