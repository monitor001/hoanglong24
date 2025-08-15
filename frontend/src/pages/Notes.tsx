import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Drawer,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Dropdown,
  Menu,
  message,
  Typography,
  Divider,
  Tooltip,
  Popconfirm,
  Badge,
  Empty,
  Spin,
  Avatar,
  List,
  Tag as AntTag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  FolderOutlined,
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  PushpinOutlined,
  InboxOutlined,
  SearchOutlined,
  FilterOutlined,
  StarOutlined,
  ShareAltOutlined,
  CopyOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  SaveOutlined,
  FontSizeOutlined,
  EditOutlined as EditIcon,
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined as DeleteIcon,
  RestOutlined,
  CloseOutlined,
  DownloadOutlined,
  DownOutlined,
  UpOutlined,
  ClearOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axiosInstance from '../axiosConfig';
import dayjs from 'dayjs';
// Removed permission system

import { theme, Grid } from 'antd';
import RichTextEditor from '../components/RichTextEditor';
import NotesListView from '../components/NotesListView';
import { useResponsive } from '../hooks/useResponsive';
import MobileFilters from '../components/MobileFilters';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import TabletLandscapeCollapsibleFilters from '../components/TabletLandscapeCollapsibleFilters';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import '../styles/notes-responsive.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-fab.css';
import '../styles/tablet-landscape-improvements.css';
import '../styles/tablet-landscape-unified-forms.css';
import '../styles/tablet-landscape-unified-forms.css';
import FloatingActionButton from '../components/FloatingActionButton';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    notes: number;
  };
}

const Notes: React.FC = () => {
  const { isMobile } = useResponsive();
  
  // Removed permission system - always allow all actions
  const canViewNotes = true;
  const canCreateNotes = true;
  const canEditNotes = true;
  const canDeleteNotes = true;
  
  // Tablet landscape detection
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  
  useEffect(() => {
    const checkTabletLandscape = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsTabletLandscape(width >= 769 && width <= 1366 && height < width);
    };
    
    checkTabletLandscape();
    window.addEventListener('resize', checkTabletLandscape);
    window.addEventListener('orientationchange', checkTabletLandscape);
    
    return () => {
      window.removeEventListener('resize', checkTabletLandscape);
      window.removeEventListener('orientationchange', checkTabletLandscape);
    };
  }, []);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [noteForm] = Form.useForm();
  const [folderForm] = Form.useForm();
  const [foldersTimeFilter, setFoldersTimeFilter] = useState<string>('week');
  const [notesTimeFilter, setNotesTimeFilter] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<{title: string, content: string} | null>(null);
  
  // Editor mode
  const [useRichEditor, setUseRichEditor] = useState(true);
  
  // Tags system

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInputVisible, setTagInputVisible] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Trash bin
  const [showTrash, setShowTrash] = useState(false);
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareForm] = Form.useForm();
  const [shareLoading, setShareLoading] = useState(false);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);
  
  // Performance optimization states
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  // Share functionality states
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Mobile filters state
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Mobile note detail state
  const [selectedNoteForDetail, setSelectedNoteForDetail] = useState<Note | null>(null);
  const [noteDetailVisible, setNoteDetailVisible] = useState(false);

  // Delete modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'note' | 'folder', id: string, name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isDarkMode = useSelector((state: RootState) => state.ui.theme === 'dark');
  const authToken = useSelector((state: RootState) => state.auth.token);
  const { token: themeToken } = theme.useToken();
  const screens = Grid.useBreakpoint();

  // Responsive layout helpers
  const getColSpan = () => {
    return 6; // Luôn hiển thị 4 card trên 1 dòng (24/6 = 4)
  };

  const getFolderColSpan = () => {
    if (screens.xs) return 12;
    if (screens.sm) return 8;
    if (screens.md) return 6;
    if (screens.lg) return 4;
    if (screens.xl) return 3;
    return 3;
  };

  // Bộ màu cho light mode và dark mode
  const lightColors = ['#FFE5B4', '#B4E5FF', '#FFB4E5', '#B4FFB4'];
  // Bộ màu mới cho dark mode: nhẹ nhàng, trong suốt cao, nổi bật
  const darkColors = [
    'rgba(139, 69, 19, 0.15)',   // Nâu nhẹ trong suốt cao
    'rgba(70, 130, 180, 0.15)',  // Xanh dương nhẹ trong suốt cao
    'rgba(147, 112, 219, 0.15)', // Tím nhẹ trong suốt cao
    'rgba(60, 179, 113, 0.15)'   // Xanh lá nhẹ trong suốt cao
  ];

  const cardColors = isDarkMode ? darkColors : lightColors;

  // Hàm chuyển đổi màu giữa light và dark mode
  const convertColorBetweenThemes = (color: string) => {
    if (!color) return getRandomColor();
    
    // Tìm index trong lightColors
    const lightIndex = lightColors.indexOf(color);
    if (lightIndex !== -1) {
      return isDarkMode ? darkColors[lightIndex] : color;
    }
    
    // Tìm index trong darkColors  
    const darkIndex = darkColors.indexOf(color);
    if (darkIndex !== -1) {
      return isDarkMode ? color : lightColors[darkIndex];
    }
    
    // Xử lý màu cũ (hex colors) - chuyển đổi thành màu mới
    const oldDarkColors = ['#4A3A28', '#28384A', '#4A284A', '#284A28'];
    const oldLightColors = ['#FFE5B4', '#B4E5FF', '#FFB4E5', '#B4FFB4'];
    
    // Kiểm tra xem có phải màu cũ không
    const oldDarkIndex = oldDarkColors.indexOf(color);
    if (oldDarkIndex !== -1) {
      return isDarkMode ? darkColors[oldDarkIndex] : lightColors[oldDarkIndex];
    }
    
    const oldLightIndex = oldLightColors.indexOf(color);
    if (oldLightIndex !== -1) {
      return isDarkMode ? darkColors[oldLightIndex] : lightColors[oldLightIndex];
    }
    
    // Nếu là màu hex khác, map thành màu tương ứng
    if (color.startsWith('#')) {
      const colorIndex = Math.abs(color.charCodeAt(1)) % darkColors.length;
      return isDarkMode ? darkColors[colorIndex] : lightColors[colorIndex];
    }
    
    // Fallback: trả về màu random
    return getRandomColor();
  };

  // Sửa hàm getRandomColor
  const getRandomColor = () => {
    const colors = isDarkMode ? darkColors : lightColors;
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Hàm tính toán màu text phù hợp dựa trên độ sáng của background
  const getTextColorForBackground = (backgroundColor: string) => {
    // Xử lý màu rgba
    if (backgroundColor.startsWith('rgba')) {
      // Trong dark mode với màu rgba trong suốt, dùng text trắng
      return isDarkMode ? '#ffffff' : '#000000';
    }
    
    // Xử lý màu hex
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return dark text for light backgrounds, light text for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Performance optimization: Debounced search
  const debouncedSearch = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setSearchText(value), 300);
      };
    },
    []
  );

  // Performance optimization: Memoized filtered and sorted notes
  const filteredAndSortedNotes = useMemo(() => {
    console.log('=== FILTER DEBUG START ===');
    console.log('Total notes before filter:', notes.length);
    console.log('showTrash:', showTrash);
    console.log('selectedFolder:', selectedFolder);
    
    const filtered = notes.filter((note, index) => {
      
      // Trash filter - Sửa lại logic
      if (showTrash) {
        // Chỉ hiển thị notes đã xóa khi xem thùng rác
        if (note.isDeleted !== true) {
          console.log(`Note ${index} filtered by trash (trash mode):`, note.title, 'isDeleted:', note.isDeleted);
          return false;
        }
      } else {
        // Hiển thị notes KHÔNG bị xóa (bao gồm cả undefined/null)
        if (note.isDeleted === true) {
          console.log(`Note ${index} filtered by trash (normal mode):`, note.title, 'isDeleted:', note.isDeleted);
          return false;
        }
      }
      
      // Folder filter
      if (selectedFolder) {
        if (note.folder?.id !== selectedFolder) {
          console.log(`Note ${index} filtered by folder:`, note.title);
          return false;
        }
      }
      
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(searchLower);
        const matchesContent = note.content.toLowerCase().includes(searchLower);
        const matchesTags = note.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesFolder = note.folder?.name.toLowerCase().includes(searchLower);
        
        if (!matchesTitle && !matchesContent && !matchesTags && !matchesFolder) {
          console.log(`Note ${index} filtered by search:`, note.title);
          return false;
        }
      }
      
      // Tags filter
      if (selectedTags.length > 0) {
        if (!selectedTags.every(tag => note.tags?.includes(tag))) {
          console.log(`Note ${index} filtered by tags:`, note.title);
          return false;
        }
      }
      
      return true;
    });
    
    console.log('Filtered notes count:', filtered.length);
    console.log('=== FILTER DEBUG END ===');
    
    // Sort notes: pinned first, then by creation date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notes, showTrash, selectedFolder, searchText, selectedTags]);

  // Performance optimization: Memoized all tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [notes]);

  // Accessibility: Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Batch operations
  const handleBatchDelete = async () => {
    try {
      await Promise.all(
        selectedNoteIds.map(id => axiosInstance.delete(`/notes/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }))
      );
      message.success(`Đã xóa ${selectedNoteIds.length} ghi chú`);
      setSelectedNoteIds([]);
      setIsMultiSelectMode(false);
      fetchNotes();
    } catch (error) {
      message.error('Lỗi khi xóa ghi chú');
    }
  };

  const handleBatchArchive = async () => {
    try {
      await Promise.all(
        selectedNoteIds.map(id => axiosInstance.put(`/notes/${id}`, {
          isArchived: true
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        }))
      );
      message.success(`Đã lưu trữ ${selectedNoteIds.length} ghi chú`);
      setSelectedNoteIds([]);
      setIsMultiSelectMode(false);
      fetchNotes();
    } catch (error) {
      message.error('Lỗi khi lưu trữ ghi chú');
    }
  };

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  // Export/Import features
  const handleExportNotes = () => {
    const dataStr = JSON.stringify(filteredAndSortedNotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `notes_${dayjs().format('YYYY-MM-DD')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportNotes = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedNotes = JSON.parse(e.target?.result as string);
        console.log('Imported notes:', importedNotes);
        message.success(`Đã import ${importedNotes.length} ghi chú`);
        // Note: In a real app, you'd want to send this to the backend
      } catch (error) {
        message.error('Lỗi khi đọc file import');
      }
    };
    reader.readAsText(file);
  };

  // Auto-save function
  const autoSaveNote = useCallback(async (values: any) => {
    if (!editingNote) return;
    
    try {
      setAutoSaveStatus('saving');
      const submitData = {
        ...values,
        color: convertColorBetweenThemes(editingNote.color)
      };
      
      await axiosInstance.put(`/notes/${editingNote.id}`, submitData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setAutoSaveStatus('saved');
      setLastSavedContent({ title: values.title, content: values.content });
      
      // Reset status after 2 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [editingNote, authToken]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback((values: any) => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      autoSaveNote(values);
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    setAutoSaveTimer(timer);
  }, [autoSaveNote, autoSaveTimer]);

  // Handle form changes for auto-save
  const handleFormChange = () => {
    if (!editingNote) return;
    
    const values = noteForm.getFieldsValue();
    const currentContent = { title: values.title, content: values.content };
    
    // Only auto-save if content has changed
    if (lastSavedContent && 
        lastSavedContent.title === currentContent.title && 
        lastSavedContent.content === currentContent.content) {
      return;
    }
    
    debouncedAutoSave(values);
  };

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);



  // Tags functions
  const handleTagInputConfirm = () => {
    if (tagInputValue && !allTags.includes(tagInputValue)) {
      // Tags will be automatically updated when notes are refreshed
    }
    setTagInputVisible(false);
    setTagInputValue('');
  };

  const handleTagClose = (removedTag: string) => {
    const newTags = selectedTags.filter(tag => tag !== removedTag);
    setSelectedTags(newTags);
  };

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Trash bin functions
  const handleMoveToTrash = async (noteId: string) => {
    try {
      await axiosInstance.put(`/notes/${noteId}`, {
        isDeleted: true,
        deletedAt: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      message.success('Đã chuyển ghi chú vào thùng rác');
      fetchNotes(notesTimeFilter);
    } catch (error) {
      console.error('Error moving to trash:', error);
      message.error('Không thể chuyển vào thùng rác');
    }
  };

  const handleRestoreNote = async (noteId: string) => {
    try {
      await axiosInstance.put(`/notes/${noteId}`, {
        isDeleted: false,
        deletedAt: null
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      message.success('Đã khôi phục ghi chú');
      fetchNotes(notesTimeFilter);
    } catch (error) {
      console.error('Error restoring note:', error);
      message.error('Không thể khôi phục ghi chú');
    }
  };

  const handlePermanentDelete = async (noteId: string) => {
    try {
      await axiosInstance.delete(`/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      message.success('Đã xóa vĩnh viễn ghi chú');
      fetchNotes(notesTimeFilter);
    } catch (error) {
      console.error('Error permanently deleting note:', error);
      message.error('Không thể xóa vĩnh viễn ghi chú');
    }
  };

  const folderIcons = [
    { icon: <FolderOutlined />, name: 'folder' },
    { icon: <FileTextOutlined />, name: 'document' },
    { icon: <BookOutlined />, name: 'book' },
    { icon: <StarOutlined />, name: 'star' },
    { icon: <CalendarOutlined />, name: 'calendar' },
    { icon: <UserOutlined />, name: 'user' },
  ];

  // Fetch data
  const fetchNotes = async (timeFilter?: string) => {
    try {
      const params = new URLSearchParams();
      if (timeFilter) params.append('timeFilter', timeFilter);

      const response = await axiosInstance.get(`/notes?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('Raw API response:', response);
      
      if (Array.isArray(response.data)) {
        console.log('Fetched notes:', response.data.length, 'notes');
        
        // Log chi tiết từng note
        response.data.forEach((note, index) => {
          console.log(`Note ${index}:`, {
            id: note.id,
            title: note.title,
            isDeleted: note.isDeleted,
            isArchived: note.isArchived,
            hasFolder: !!note.folder,
            folderId: note.folder?.id
          });
        });
        
        // Normalize data - đảm bảo các field cần thiết
        const normalizedNotes = response.data.map(note => ({
          ...note,
          isDeleted: note.isDeleted || false,
          isArchived: note.isArchived || false,
          isPinned: note.isPinned || false,
          tags: note.tags || [],
        }));
        
        console.log('Normalized notes:', normalizedNotes);
        setNotes(normalizedNotes);
      } else {
        console.warn('Notes API returned non-array data:', response.data);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      message.error('Không thể tải ghi chú');
      setNotes([]);
    }
  };

  const fetchFolders = async (timeFilter?: string) => {
    try {
      const params = new URLSearchParams();
      if (timeFilter) params.append('timeFilter', timeFilter);

      const response = await axiosInstance.get(`/folders?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Đảm bảo response.data là array
      if (Array.isArray(response.data)) {
        console.log('Fetched folders:', response.data.length, 'folders');
        response.data.forEach(folder => {
          console.log('Folder:', {
            folderId: folder.id,
            folderName: folder.name,
            noteCount: folder._count.notes
          });
        });
        setFolders(response.data);
      } else {
        console.warn('Folders API returned non-array data:', response.data);
        setFolders([]);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      message.error('Không thể tải thư mục');
      setFolders([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axiosInstance.get('/users/all', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Backend trả về { users: [...], pagination: {...} }
      const usersData = response.data?.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
      console.log('Fetched users:', usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách thành viên');
      setUsers([]); // Đảm bảo luôn là mảng
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with:', {
      notesTimeFilter,
      foldersTimeFilter,
      selectedFolder
    });
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchNotes(notesTimeFilter),
        fetchFolders(foldersTimeFilter)
      ]);
      setLoading(false);
    };
    loadData();
  }, [notesTimeFilter, foldersTimeFilter]); // Bỏ selectedFolder khỏi dependencies

  // Fetch users when share modal opens
  useEffect(() => {
    if (shareModalVisible && users.length === 0) {
      fetchUsers();
    }
  }, [shareModalVisible]);

  // Create/Update Note
  const handleNoteSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        color: editingNote ? convertColorBetweenThemes(editingNote.color) : getRandomColor()
      };
      
      if (editingNote) {
        await axiosInstance.put(`/notes/${editingNote.id}`, submitData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        message.success('Cập nhật ghi chú thành công');
      } else {
        await axiosInstance.post('/notes', submitData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        message.success('Tạo ghi chú thành công');
      }
      setNoteModalVisible(false);
      setEditingNote(null);
      noteForm.resetFields();
      setAutoSaveStatus('idle');
      setLastSavedContent(null);
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        setAutoSaveTimer(null);
      }
      fetchNotes(notesTimeFilter);
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Không thể lưu ghi chú');
    }
  };

  // Create/Update Folder
  const handleFolderSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        color: editingFolder ? convertColorBetweenThemes(editingFolder.color) : getRandomColor()
      };
      
      if (editingFolder) {
        await axiosInstance.put(`/folders/${editingFolder.id}`, submitData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        message.success('Cập nhật thư mục thành công');
      } else {
        await axiosInstance.post('/folders', submitData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        message.success('Tạo thư mục thành công');
      }
      setFolderModalVisible(false);
      setEditingFolder(null);
      folderForm.resetFields();
      fetchFolders(foldersTimeFilter);
    } catch (error) {
      console.error('Error saving folder:', error);
      message.error('Không thể lưu thư mục');
    }
  };

  // Delete Note
  const handleDeleteNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    setItemToDelete({
      type: 'note',
      id: noteId,
      name: note?.title || 'này'
    });
    setDeleteModalVisible(true);
  };

  // Delete Folder
  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    setItemToDelete({
      type: 'folder',
      id: folderId,
      name: folder?.name || 'này'
    });
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleteLoading(true);
    try {
      if (itemToDelete.type === 'note') {
        await axiosInstance.delete(`/notes/${itemToDelete.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        message.success('Xóa ghi chú thành công');
        fetchNotes(notesTimeFilter);
      } else {
        await axiosInstance.delete(`/folders/${itemToDelete.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        message.success('Xóa thư mục thành công');
        fetchFolders(foldersTimeFilter);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error(`Không thể xóa ${itemToDelete.type === 'note' ? 'ghi chú' : 'thư mục'}`);
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  // Toggle Pin/Archive
  const handleTogglePin = async (note: Note) => {
    try {
      await axiosInstance.put(`/notes/${note.id}`, {
        ...note,
        isPinned: !note.isPinned
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      message.success(note.isPinned ? 'Bỏ ghim ghi chú' : 'Ghim ghi chú thành công');
      fetchNotes(notesTimeFilter);
    } catch (error) {
      console.error('Error toggling pin:', error);
      message.error('Không thể thay đổi trạng thái ghim');
    }
  };

  const handleToggleArchive = async (note: Note) => {
    try {
      await axiosInstance.put(`/notes/${note.id}`, {
        ...note,
        isArchived: !note.isArchived
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      message.success(note.isArchived ? 'Bỏ lưu trữ ghi chú' : 'Lưu trữ ghi chú thành công');
      fetchNotes(notesTimeFilter);
    } catch (error) {
      console.error('Error toggling archive:', error);
      message.error('Không thể thay đổi trạng thái lưu trữ');
    }
  };

  // Share note function
  const handleShareNote = async (values: any) => {
    if (!sharingNote) return;
    
    try {
      setShareLoading(true);
      await axiosInstance.post(`/notes/${sharingNote.id}/share`, {
        sharedWith: values.sharedWith,
        message: values.message,
        permissions: values.permissions
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      message.success('Chia sẻ ghi chú thành công');
      setShareModalVisible(false);
      shareForm.resetFields();
      setSharingNote(null);
    } catch (error) {
      console.error('Error sharing note:', error);
      message.error('Không thể chia sẻ ghi chú');
    } finally {
      setShareLoading(false);
    }
  };

  // Debug logging for notes state
  console.log('Notes state:', {
    totalNotes: notes.length,
    filteredNotes: filteredAndSortedNotes.length,
    selectedFolder,
    showTrash,
    searchText,
    selectedTags
  });

  const getFolderIcon = (iconName: string) => {
    const icon = folderIcons.find(i => i.name === iconName);
    return icon ? icon.icon : <FolderOutlined />;
  };



  const timeFilterOptions = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Tuần này', value: 'week' },
    { label: 'Tháng này', value: 'month' },
  ];

  const noteMenu = (note: Note) => {
    if (showTrash) {
      return (
        <Menu>
          <Menu.Item key="restore" icon={<RestOutlined />} onClick={() => handleRestoreNote(note.id)}>
            Khôi phục
          </Menu.Item>
          <Menu.Item key="copy" icon={<CopyOutlined />}>
            Sao chép
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handlePermanentDelete(note.id)}>
            Xóa vĩnh viễn
          </Menu.Item>
        </Menu>
      );
    }
    
    return (
      <Menu>
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => {
          setEditingNote(note);
          noteForm.setFieldsValue(note);
          setLastSavedContent({ title: note.title, content: note.content });
          setAutoSaveStatus('idle');
          setNoteModalVisible(true);
        }}>
          Chỉnh sửa
        </Menu.Item>
        <Menu.Item key="pin" icon={<PushpinOutlined />} onClick={() => handleTogglePin(note)}>
          {note.isPinned ? 'Bỏ ghim' : 'Ghim'}
        </Menu.Item>
        <Menu.Item key="archive" icon={<InboxOutlined />} onClick={() => handleToggleArchive(note)}>
          {note.isArchived ? 'Bỏ lưu trữ' : 'Lưu trữ'}
        </Menu.Item>
        <Menu.Item key="share" icon={<ShareAltOutlined />} onClick={() => {
          setSharingNote(note);
          setShareModalVisible(true);
        }}>
          Chia sẻ
        </Menu.Item>
        <Menu.Item key="copy" icon={<CopyOutlined />}>
          Sao chép
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleMoveToTrash(note.id)}>
          Chuyển vào thùng rác
        </Menu.Item>
      </Menu>
    );
  };

  const folderMenu = (folder: Folder) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => {
        setEditingFolder(folder);
        folderForm.setFieldsValue(folder);
        setFolderModalVisible(true);
      }}>
        Chỉnh sửa
      </Menu.Item>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        Xem ghi chú
      </Menu.Item>
      <Menu.Item key="share" icon={<ShareAltOutlined />}>
        Chia sẻ
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteFolder(folder.id)}>
        Xóa
      </Menu.Item>
    </Menu>
  );

  // Reset filters function
  const resetFilters = () => {
    setSearchText('');
    setSelectedFolder(null);
    setSelectedTags([]);
    setNotesTimeFilter('');
    setFiltersExpanded(false);
    message.success('Đã reset bộ lọc');
  };



  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '0' : '24px', 
      background: isMobile ? themeToken.colorBgLayout : (isDarkMode ? '#141414' : '#f5f5f5'), 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      {isMobile ? (
        <div style={{ 
          background: themeToken.colorBgContainer,
          padding: '12px 16px 8px',
          borderRadius: '0 0 16px 16px',
          marginBottom: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8 
          }}>
            <FileTextOutlined style={{ fontSize: 20, color: themeToken.colorPrimary }} />
            <Title level={4} style={{ margin: 0, color: themeToken.colorText }}>Ghi chú</Title>
          </div>
          <Text type="secondary" style={{ 
            fontSize: 11, 
            display: 'block', 
            textAlign: 'center',
            marginTop: 2
          }}>
            Quản lý ghi chú và thư mục
          </Text>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: isDarkMode ? '#fff' : '#000', margin: 0 }}>
            Ghi chú
          </Title>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingNote(null);
              noteForm.resetFields();
              setNoteModalVisible(true);
            }}
          >
            Tạo ghi chú mới
          </Button>
        </div>
      )}

      {/* Mobile Filters */}
      {isMobile && (
        <MobileFilters
          searchValue={searchText}
          statusValue=""
          priorityValue=""
          assigneeValue=""
          projectValue=""
          statusOptions={[]}
          priorityOptions={[]}
          assigneeOptions={[]}
          projectOptions={[]}
          onSearchChange={setSearchText}
          onStatusChange={() => {}}
          onPriorityChange={() => {}}
          onAssigneeChange={() => {}}
          onProjectChange={() => {}}
          onReset={() => {
            setSearchText('');
            setSelectedFolder(null);
            setSelectedTags([]);
            setNotesTimeFilter('');
            message.success('Đã reset bộ lọc');
          }}
                      title="Bộ lọc ghi chú"
            isDarkMode={isDarkMode}
            pageType="notes"
          />
      )}

      {/* Recent Folders Section */}
      <div style={{ 
        marginBottom: isMobile ? 8 : 24,
        margin: isMobile ? '0 -12px 8px' : '0 0 24px'
      }}>
        <Card
          style={{
            background: isMobile ? themeToken.colorBgContainer : (isDarkMode ? '#1f1f1f' : '#fff'),
            border: isMobile ? 'none' : (isDarkMode ? '1px solid #303030' : '1px solid #d9d9d9'),
            borderRadius: isMobile ? '16px 16px 0 0' : undefined,
            boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : undefined
          }}
          bodyStyle={{ padding: isMobile ? '12px 16px' : '24px' }}
        >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: isMobile ? 12 : 20,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 8 : 0
        }}>
          <Title level={isMobile ? 5 : 4} style={{ 
            color: isDarkMode ? '#fff' : themeToken.colorText, 
            margin: 0,
            fontSize: isMobile ? 14 : undefined
          }}>
            Thư mục gần đây
          </Title>
          <Space size={isMobile ? 4 : 8}>
            {timeFilterOptions.map(option => (
              <Button
                key={option.value}
                type={foldersTimeFilter === option.value ? 'primary' : 'default'}
                size={isMobile ? 'small' : 'small'}
                onClick={() => setFoldersTimeFilter(option.value)}
                style={{
                  background: foldersTimeFilter === option.value ? themeToken.colorPrimary : 'transparent',
                  borderColor: foldersTimeFilter === option.value ? themeToken.colorPrimary : undefined,
                  fontSize: isMobile ? 11 : undefined,
                  padding: isMobile ? '2px 8px' : undefined,
                  height: isMobile ? 24 : undefined
                }}
              >
                {option.label}
              </Button>
            ))}
          </Space>
        </div>

        <div style={isMobile ? { 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '8px'
        } : { 
          height: '120px', 
          overflowX: 'auto', 
          overflowY: 'hidden',
          display: 'flex',
          gap: '12px',
          paddingBottom: '8px'
        }}
        className={!isMobile ? (isDarkMode ? 'folders-scroll-container dark' : 'folders-scroll-container light') : undefined}
        >
          {/* New Folder Card lên đầu */}
          <div style={{ 
            minWidth: isMobile ? 'auto' : (screens.xs ? '120px' : screens.sm ? '140px' : screens.md ? '160px' : screens.lg ? '180px' : '200px'),
            flexShrink: isMobile ? 'unset' : 0
          }}>
            <Card
              hoverable
              style={{
                border: '2px dashed #d9d9d9',
                borderRadius: isMobile ? '6px' : '8px',
                height: isMobile ? '80px' : '100px',
                background: 'transparent',
                cursor: 'pointer'
              }}
              bodyStyle={{ 
                padding: isMobile ? '8px' : '12px', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
              onClick={() => {
                setEditingFolder(null);
                folderForm.resetFields();
                setFolderModalVisible(true);
              }}
            >
              <PlusOutlined style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                color: isDarkMode ? '#fff' : '#999', 
                marginBottom: isMobile ? '2px' : '4px' 
              }} />
              <Text style={{ 
                color: isDarkMode ? '#fff' : '#999', 
                fontSize: isMobile ? '10px' : '12px' 
              }}>
                Thư mục mới
              </Text>
            </Card>
          </div>
          {/* Danh sách folder */}
          {Array.isArray(folders) && folders.map((folder, index) => (
            <div key={folder.id} style={{ 
              minWidth: isMobile ? 'auto' : (screens.xs ? '120px' : screens.sm ? '140px' : screens.md ? '160px' : screens.lg ? '180px' : '200px'),
              flexShrink: isMobile ? 'unset' : 0
            }}>
              <Card
                hoverable
                className="folder-item"
                style={{
                  background: convertColorBetweenThemes(folder.color) || getRandomColor(),
                  border: 'none',
                  borderRadius: isMobile ? '6px' : '8px',
                  height: isMobile ? '80px' : '100px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                ref={(el) => {
                  if (el) {
                    const bgColor = convertColorBetweenThemes(folder.color) || getRandomColor();
                    el.style.setProperty('background', bgColor, 'important');
                  }
                }}
                bodyStyle={{ padding: isMobile ? '8px' : '12px', height: '100%' }}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? '6px' : '8px',
                    flex: 1
                  }}>
                    <div style={{ 
                      fontSize: isMobile ? '16px' : '20px', 
                      color: getTextColorForBackground(convertColorBetweenThemes(folder.color) || getRandomColor()) 
                    }}>
                      {getFolderIcon(folder.icon)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        color: getTextColorForBackground(convertColorBetweenThemes(folder.color) || getRandomColor()), 
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {folder.name}
                      </Text>
                      <Text type="secondary" style={{ 
                        fontSize: isMobile ? '8px' : '10px', 
                        color: getTextColorForBackground(convertColorBetweenThemes(folder.color) || getRandomColor()) === '#000000' ? '#666' : '#ccc' 
                      }}>
                        {folder._count.notes} ghi chú
                      </Text>
                    </div>
                  </div>
                  {!isMobile && (
                    <Dropdown overlay={folderMenu(folder)} trigger={['click']}>
                      <Button 
                        type="text" 
                        icon={<MoreOutlined />} 
                        size="small" 
                        style={{ color: getTextColorForBackground(convertColorBetweenThemes(folder.color) || getRandomColor()) }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
        </Card>
      </div>

      {/* Tablet Landscape - Collapsible Search and Filter Container */}
      {isTabletLandscape && (
        <TabletLandscapeCollapsibleFilters
          searchValue={searchText}
          searchPlaceholder="Tìm kiếm ghi chú..."
          onSearchChange={debouncedSearch}
          filters={[
            {
              key: 'time',
              label: 'Thời gian',
              type: 'select',
              value: notesTimeFilter,
              options: timeFilterOptions,
              placeholder: 'Lọc theo thời gian',
              onChange: setNotesTimeFilter
            },
            {
              key: 'folder',
              label: 'Thư mục',
              type: 'select',
              value: selectedFolder,
              options: Array.isArray(folders) ? folders.map(folder => ({
                value: folder.id,
                label: folder.name
              })) : [],
              placeholder: 'Lọc theo thư mục',
              onChange: setSelectedFolder
            },
            {
              key: 'tags',
              label: 'Tags',
              type: 'multiselect',
              value: selectedTags,
              options: allTags.map(tag => ({
                value: tag,
                label: tag
              })),
              placeholder: 'Lọc theo tags',
              onChange: setSelectedTags
            }
          ]}
          onReset={() => {
            setSearchText('');
            setNotesTimeFilter('');
            setSelectedFolder('');
            setSelectedTags([]);
          }}
          title="Tìm kiếm và Bộ lọc"
          isDarkMode={isDarkMode}
        />
      )}

      {/* My Notes Section */}
      <div style={{ 
        marginBottom: isMobile ? 8 : 24,
        margin: isMobile ? '0 -12px 8px' : '0 0 24px'
      }}>
        <Card
          style={{
            background: isMobile ? themeToken.colorBgContainer : (isDarkMode ? '#1f1f1f' : '#fff'),
            border: isMobile ? 'none' : (isDarkMode ? '1px solid #303030' : '1px solid #d9d9d9'),
            borderRadius: isMobile ? '16px 16px 0 0' : undefined,
            boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : undefined
          }}
          bodyStyle={{ padding: isMobile ? '12px 16px' : '24px' }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: isMobile ? 12 : 20,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? 8 : 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
              <Title level={isMobile ? 5 : 4} style={{ 
                color: isDarkMode ? '#fff' : themeToken.colorText, 
                margin: 0,
                fontSize: isMobile ? 14 : undefined
              }}>
                {showTrash ? 'Thùng rác' : 'Ghi chú của tôi'}
              </Title>
              {selectedFolder && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text type="secondary">|</Text>
                  <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>
                    {folders.find(f => f.id === selectedFolder)?.name}
                  </Text>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CloseOutlined />} 
                    onClick={() => setSelectedFolder(null)}
                    style={{ color: isDarkMode ? '#fff' : '#666' }}
                  />
                </div>
              )}
            </div>
            {!isMobile && !isTabletLandscape && (
              <Space>
                {/* Các filter/search */}
                <Input
                  placeholder="Tìm kiếm ghi chú..."
                  prefix={<SearchOutlined />}
                  defaultValue={searchText}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  style={{ width: '200px' }}
                  aria-label="Tìm kiếm ghi chú"
                />
                <Select
                  placeholder="Lọc theo thời gian"
                  value={notesTimeFilter}
                  onChange={setNotesTimeFilter}
                  allowClear
                  style={{ width: '150px' }}
                >
                  {timeFilterOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="Lọc theo thư mục"
                  value={selectedFolder}
                  onChange={setSelectedFolder}
                  allowClear
                  style={{ width: '150px' }}
                >
                  {Array.isArray(folders) && folders.map(folder => (
                    <Option key={folder.id} value={folder.id}>{folder.name}</Option>
                  ))}
                </Select>
                <Select
                  mode="multiple"
                  placeholder="Lọc theo tags"
                  value={selectedTags}
                  onChange={setSelectedTags}
                  allowClear
                  style={{ width: '150px' }}
                >
                  {allTags.map(tag => (
                    <Option key={tag} value={tag}>{tag}</Option>
                  ))}
                </Select>
                <Button.Group>
                  <Button
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('grid')}
                    title="Xem dạng lưới"
                  />
                  <Button
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    icon={<UnorderedListOutlined />}
                    onClick={() => setViewMode('list')}
                    title="Xem dạng danh sách"
                  />
                </Button.Group>
                <Button
                  type={showTrash ? 'primary' : 'default'}
                  icon={<DeleteIcon />}
                  onClick={() => setShowTrash(!showTrash)}
                  title={showTrash ? 'Quay lại ghi chú' : 'Thùng rác'}
                  aria-label={showTrash ? 'Quay lại ghi chú' : 'Thùng rác'}
                >
                  {showTrash ? 'Ghi chú' : 'Thùng rác'}
                </Button>
                <Button
                  type={isMultiSelectMode ? 'primary' : 'default'}
                  icon={<EditIcon />}
                  onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                  title="Chọn nhiều"
                  aria-label="Chế độ chọn nhiều ghi chú"
                >
                  Chọn nhiều
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportNotes}
                  title="Xuất ghi chú"
                  aria-label="Xuất ghi chú ra file JSON"
                >
                  Xuất
                </Button>
              </Space>
            )}
            
            {/* Tablet Landscape - Separate Filter Container - REMOVED from here */}

            {/* Tablet Landscape - Separate Action Buttons Container */}
            {isTabletLandscape && (
              <Card style={{ marginBottom: 16 }} className="tablet-landscape-notes-actions-card">
                <Row gutter={[16, 12]} align="middle">
                  {/* View Mode Buttons */}
                  <Col span={6}>
                    <div className="tablet-notes-filter-item">
                      <div className="tablet-notes-filter-label">Chế độ xem</div>
                      <Button.Group style={{ width: '100%' }}>
                        <Button
                          type={viewMode === 'grid' ? 'primary' : 'default'}
                          icon={<AppstoreOutlined />}
                          onClick={() => setViewMode('grid')}
                          title="Xem dạng lưới"
                          style={{ flex: 1 }}
                        />
                        <Button
                          type={viewMode === 'list' ? 'primary' : 'default'}
                          icon={<UnorderedListOutlined />}
                          onClick={() => setViewMode('list')}
                          title="Xem dạng danh sách"
                          style={{ flex: 1 }}
                        />
                      </Button.Group>
                    </div>
                  </Col>
                  
                  {/* Trash Toggle Button */}
                  <Col span={6}>
                    <div className="tablet-notes-filter-item">
                      <div className="tablet-notes-filter-label">Hiển thị</div>
                      <Button
                        type={showTrash ? 'primary' : 'default'}
                        icon={<DeleteOutlined />}
                        onClick={() => setShowTrash(!showTrash)}
                        title={showTrash ? 'Quay lại ghi chú' : 'Thùng rác'}
                        style={{ width: '100%' }}
                      >
                        {showTrash ? 'Ghi chú' : 'Thùng rác'}
                      </Button>
                    </div>
                  </Col>
                  
                  {/* Import/Export Buttons */}
                  <Col span={6}>
                    <div className="tablet-notes-filter-item">
                      <div className="tablet-notes-filter-label">Dữ liệu</div>
                      <Button.Group style={{ width: '100%' }}>
                        <Button
                          icon={<ImportOutlined />}
                          onClick={() => {
                            // Trigger file input for import
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.json';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                handleImportNotes(file);
                              }
                            };
                            input.click();
                          }}
                          title="Nhập ghi chú"
                          style={{ flex: 1 }}
                        />
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={handleExportNotes}
                          title="Xuất ghi chú"
                          style={{ flex: 1 }}
                        />
                      </Button.Group>
                    </div>
                  </Col>
                  
                  {/* Batch Actions */}
                  <Col span={6}>
                    <div className="tablet-notes-filter-item">
                      <div className="tablet-notes-filter-label">Thao tác hàng loạt</div>
                      <Space>
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={handleBatchDelete}
                          disabled={selectedNoteIds.length === 0}
                        >
                          Xóa ({selectedNoteIds.length})
                        </Button>
                        <Button
                          size="small"
                          icon={<InboxOutlined />}
                          onClick={handleBatchArchive}
                          disabled={selectedNoteIds.length === 0}
                        >
                          Lưu trữ ({selectedNoteIds.length})
                        </Button>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}
          </div>

          {/* Batch operations toolbar */}
          {isMultiSelectMode && selectedNoteIds.length > 0 && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              background: isDarkMode ? '#1f1f1f' : '#f0f0f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Text strong>Đã chọn {selectedNoteIds.length} ghi chú</Text>
              <Button 
                size="small" 
                danger 
                onClick={handleBatchDelete}
                aria-label="Xóa tất cả ghi chú đã chọn"
              >
                Xóa tất cả
              </Button>
              <Button 
                size="small" 
                onClick={handleBatchArchive}
                aria-label="Lưu trữ tất cả ghi chú đã chọn"
              >
                Lưu trữ tất cả
              </Button>
              <Button 
                size="small" 
                onClick={() => {
                  setSelectedNoteIds([]);
                  setIsMultiSelectMode(false);
                }}
              >
                Hủy chọn
              </Button>
            </div>
          )}

        {viewMode === 'grid' ? (
          isMobile ? (
            // Mobile: Single column layout
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* New Note Card - Mobile */}
              <Card
                hoverable
                style={{
                  border: '2px dashed #d9d9d9',
                  borderRadius: '8px',
                  height: '60px',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                bodyStyle={{ 
                  padding: '8px 12px', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={() => {
                  setEditingNote(null);
                  noteForm.resetFields();
                  setNoteModalVisible(true);
                }}
              >
                <PlusOutlined style={{ fontSize: '16px', color: '#d9d9d9' }} />
                <Text style={{ fontSize: '12px', color: '#999' }}>
                  Tạo ghi chú mới
                </Text>
              </Card>
              
              {/* Mobile Notes Layout */}
              {filteredAndSortedNotes.map((note, index) => (
                <Card
                  key={note.id}
                  hoverable
                  className="note-item"
                  style={{
                    background: convertColorBetweenThemes(note.color) || getRandomColor(),
                    border: 'none',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    position: 'relative'
                  }}
                  ref={(el) => {
                    if (el) {
                      const bgColor = convertColorBetweenThemes(note.color) || getRandomColor();
                      el.style.setProperty('background', bgColor, 'important');
                    }
                  }}
                  bodyStyle={{ padding: '12px' }}
                  onClick={() => {
                    setSelectedNoteForDetail(note);
                    setNoteDetailVisible(true);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Text type="secondary" style={{ 
                          fontSize: '10px', 
                          color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) === '#000000' ? '#666' : '#ccc' 
                        }}>
                          {dayjs(note.createdAt).format('DD/MM')}
                        </Text>
                        {note.isPinned && <PushpinOutlined style={{ color: '#ff4d4f', fontSize: '10px' }} />}
                        {note.isArchived && <InboxOutlined style={{ color: '#52c41a', fontSize: '10px' }} />}
                      </div>
                      
                      <Title level={5} style={{ 
                        margin: '0 0 4px 0', 
                        color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()),
                        fontSize: '14px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {note.title}
                      </Title>
                      
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ 
                          fontSize: '11px', 
                          color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) === '#000000' ? '#666' : '#ccc',
                          margin: '0 0 8px 0',
                          lineHeight: '1.3'
                        }}
                      >
                        {note.content.replace(/<[^>]*>/g, '')}
                      </Paragraph>

                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {note.folder && (
                          <AntTag 
                            color={note.folder.color} 
                            style={{ 
                              margin: 0, 
                              fontSize: '8px',
                              fontWeight: 'bold',
                              color: getTextColorForBackground(note.folder.color),
                              border: `1px solid ${note.folder.color}`,
                              backgroundColor: note.folder.color,
                              padding: '1px 4px',
                              height: '16px',
                              lineHeight: '14px'
                            }}
                          >
                            {note.folder.name}
                          </AntTag>
                        )}
                        {note.tags && note.tags.slice(0, 1).map(tag => (
                          <AntTag 
                            key={tag} 
                            style={{ 
                              margin: 0, 
                              fontSize: '8px',
                              fontWeight: 'bold',
                              color: '#fff',
                              backgroundColor: '#722ed1',
                              border: '1px solid #722ed1',
                              borderRadius: '8px',
                              padding: '1px 4px',
                              height: '16px',
                              lineHeight: '14px'
                            }}
                          >
                            #{tag}
                          </AntTag>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      type="text" 
                      icon={<MoreOutlined />} 
                      size="small"
                      style={{ 
                        color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()),
                        minWidth: '24px',
                        height: '24px',
                        padding: 0
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle more actions
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {/* New Note Card - Desktop */}
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{
                    border: '2px dashed #d9d9d9',
                    borderRadius: '12px',
                    height: '200px',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ 
                    padding: '16px', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}
                  onClick={() => {
                    setEditingNote(null);
                    noteForm.resetFields();
                    setNoteModalVisible(true);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, () => {
                    setEditingNote(null);
                    noteForm.resetFields();
                    setNoteModalVisible(true);
                  })}
                  tabIndex={0}
                  role="button"
                  aria-label="Tạo ghi chú mới"
                >
                  <PlusOutlined style={{ fontSize: '32px', color: isDarkMode ? '#fff' : '#999', marginBottom: '8px' }} />
                  <Text style={{ color: isDarkMode ? '#fff' : '#999' }}>Ghi chú mới</Text>
                </Card>
              </Col>
              
              {filteredAndSortedNotes.map((note, index) => (
                <Col span={getColSpan()} key={note.id}>
                  <Card
                    hoverable
                    className="note-item"
                    style={{
                      background: convertColorBetweenThemes(note.color) || getRandomColor(),
                      border: 'none',
                      borderRadius: '12px',
                      height: '200px',
                      position: 'relative'
                    }}
                    ref={(el) => {
                      if (el) {
                        const bgColor = convertColorBetweenThemes(note.color) || getRandomColor();
                        el.style.setProperty('background', bgColor, 'important');
                      }
                    }}
                    bodyStyle={{ padding: '16px', height: '100%' }}
                    onClick={() => isMultiSelectMode && handleNoteSelect(note.id)}
                  >
                    {isMultiSelectMode && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        left: '8px', 
                        zIndex: 1 
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.includes(note.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleNoteSelect(note.id);
                          }}
                          style={{ transform: 'scale(1.2)' }}
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) === '#000000' ? '#666' : '#ccc' }}>
                          {dayjs(note.createdAt).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                      <Dropdown overlay={noteMenu(note)} trigger={['click']}>
                        <Button type="text" icon={<EditOutlined />} style={{ color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) }} />
                      </Dropdown>
                    </div>
                    
                    <div style={{ marginTop: '8px' }}>
                      <Title level={5} style={{ margin: '8px 0', color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) }}>
                        {note.title}
                      </Title>
                      <Paragraph
                        ellipsis={{ rows: 3, expandable: false }}
                        style={{ 
                          fontSize: '12px', 
                          color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) === '#000000' ? '#666' : '#ccc',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}
                      >
                        {note.content.replace(/<[^>]*>/g, '')}
                      </Paragraph>
                    </div>

                    <div style={{ 
                      position: 'absolute', 
                      bottom: '16px', 
                      left: '16px', 
                      right: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClockCircleOutlined style={{ fontSize: '12px', color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) === '#000000' ? '#999' : '#ccc' }} />
                        <Text type="secondary" style={{ fontSize: '11px', color: getTextColorForBackground(convertColorBetweenThemes(note.color) || getRandomColor()) === '#000000' ? '#999' : '#ccc' }}>
                          {dayjs(note.createdAt).format('hh:mm A, dddd')}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {note.isPinned && <PushpinOutlined style={{ color: '#ff4d4f' }} />}
                        {note.isArchived && <InboxOutlined style={{ color: '#52c41a' }} />}
                        {note.folder && (
                          <AntTag 
                            color={note.folder.color} 
                            style={{ 
                              margin: 0, 
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: getTextColorForBackground(note.folder.color),
                              border: `2px solid ${note.folder.color}`,
                              backgroundColor: note.folder.color
                            }}
                          >
                            {note.folder.name}
                          </AntTag>
                        )}
                        {note.tags && note.tags.slice(0, 2).map(tag => (
                          <AntTag 
                            key={tag} 
                            style={{ 
                              margin: 0, 
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#fff',
                              backgroundColor: '#1890ff',
                              border: '2px solid #1890ff',
                              borderRadius: '12px',
                              padding: '2px 8px'
                            }}
                          >
                            #{tag}
                          </AntTag>
                        ))}
                        {note.tags && note.tags.length > 2 && (
                          <AntTag 
                            style={{ 
                              margin: 0, 
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#fff',
                              backgroundColor: '#722ed1',
                              border: '2px solid #722ed1',
                              borderRadius: '12px',
                              padding: '2px 8px'
                            }}
                          >
                            +{note.tags.length - 2}
                          </AntTag>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )
        ) : (
          <div>
            {/* New Note Button for List View */}
            <Card
              hoverable
              style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                background: 'transparent',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
              bodyStyle={{ 
                padding: '16px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
              onClick={() => {
                setEditingNote(null);
                noteForm.resetFields();
                setNoteModalVisible(true);
              }}
              onKeyDown={(e) => handleKeyDown(e, () => {
                setEditingNote(null);
                noteForm.resetFields();
                setNoteModalVisible(true);
              })}
              tabIndex={0}
              role="button"
              aria-label="Tạo ghi chú mới"
            >
              <PlusOutlined style={{ fontSize: '24px', color: isDarkMode ? '#fff' : '#999', marginRight: '8px' }} />
              <Text style={{ color: isDarkMode ? '#fff' : '#999' }}>Ghi chú mới</Text>
            </Card>
            
            <NotesListView
              notes={filteredAndSortedNotes}
              onEdit={(note) => {
                setEditingNote(note);
                noteForm.setFieldsValue(note);
                setLastSavedContent({ title: note.title, content: note.content });
                setAutoSaveStatus('idle');
                setNoteModalVisible(true);
              }}
              onDelete={handleDeleteNote}
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
              isDarkMode={isDarkMode}
              convertColorBetweenThemes={convertColorBetweenThemes}
              getTextColorForBackground={getTextColorForBackground}
            />
          </div>
        )}

          {filteredAndSortedNotes.length === 0 && (
            <Empty
              description="Chưa có ghi chú nào"
              style={{ margin: '40px 0' }}
            />
          )}
        </Card>
      </div>

      {/* Note Modal - Responsive cho 3 thiết bị */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{editingNote ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú mới'}</span>
            {editingNote && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {autoSaveStatus === 'saving' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1890ff' }}>
                    <Spin size="small" />
                    <Text style={{ fontSize: '12px' }}>Đang lưu...</Text>
                  </div>
                )}
                {autoSaveStatus === 'saved' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#52c41a' }}>
                    <SaveOutlined />
                    <Text style={{ fontSize: '12px' }}>Đã lưu</Text>
                  </div>
                )}
                {autoSaveStatus === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4d4f' }}>
                    <Text style={{ fontSize: '12px' }}>Lỗi lưu</Text>
                  </div>
                )}
              </div>
            )}
          </div>
        }
        open={noteModalVisible}
        onCancel={() => {
          setNoteModalVisible(false);
          setEditingNote(null);
          noteForm.resetFields();
          setAutoSaveStatus('idle');
          setLastSavedContent(null);
        }}
        footer={null}
        width={
          isMobile ? '95%' : 
          isTabletLandscape ? '85%' : 
          600
        }
        style={
          isMobile ? { top: 20 } : 
          isTabletLandscape ? { top: 10 } : 
          {}
        }
        bodyStyle={
          isMobile ? { padding: '16px 12px' } : 
          isTabletLandscape ? { padding: '20px 24px' } : 
          {}
        }
        className={
          isMobile ? "" : 
          isTabletLandscape ? "tablet-landscape-edit-modal" : 
          ""
        }
      >
        <Form
          form={noteForm}
          layout="vertical"
          onFinish={handleNoteSubmit}
          onValuesChange={handleFormChange}
          className={
            isMobile ? "" : 
            isTabletLandscape ? "note-form" : 
            ""
          }
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề ghi chú" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Nội dung</span>
                <Button
                  type="text"
                  size="small"
                  icon={useRichEditor ? <EditIcon /> : <FontSizeOutlined />}
                  onClick={() => setUseRichEditor(!useRichEditor)}
                  style={{ fontSize: '12px' }}
                >
                  {useRichEditor ? 'Chế độ đơn giản' : 'Chế độ rich text'}
                </Button>
              </div>
            }
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            {useRichEditor ? (
              <RichTextEditor
                value={noteForm.getFieldValue('content') || ''}
                onChange={(value) => noteForm.setFieldValue('content', value)}
                placeholder="Nhập nội dung ghi chú..."
                isDarkMode={isDarkMode}
              />
            ) : (
              <TextArea
                rows={10}
                placeholder="Nhập nội dung ghi chú..."
                style={{ resize: 'horizontal', minHeight: '250px' }}
              />
            )}
          </Form.Item>

          <Form.Item name="folderId" label="Thư mục">
            <Select placeholder="Chọn thư mục (tùy chọn)" allowClear>
              {Array.isArray(folders) && folders.map(folder => (
                <Option key={folder.id} value={folder.id}>
                  {folder.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Thêm tags (nhấn Enter để tạo tag mới)"
              allowClear
              style={{ width: '100%' }}
              maxTagCount={5}
            >
              {allTags.map(tag => (
                <Option key={tag} value={tag}>
                  #{tag}
                </Option>
              ))}
            </Select>
          </Form.Item>



          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingNote ? 'Cập nhật' : 'Tạo ghi chú'}
              </Button>
              <Button onClick={() => {
                setNoteModalVisible(false);
                setEditingNote(null);
                noteForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Folder Modal */}
      <Modal
        title={editingFolder ? 'Chỉnh sửa thư mục' : 'Tạo thư mục mới'}
        open={folderModalVisible}
        onCancel={() => {
          setFolderModalVisible(false);
          setEditingFolder(null);
          folderForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={folderForm}
          layout="vertical"
          onFinish={handleFolderSubmit}
        >
          <Form.Item
            name="name"
            label="Tên thư mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên thư mục' }]}
          >
            <Input placeholder="Nhập tên thư mục" />
          </Form.Item>

          <Form.Item name="icon" label="Biểu tượng">
            <Select placeholder="Chọn biểu tượng">
              {folderIcons.map(icon => (
                <Option key={icon.name} value={icon.name}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {icon.icon}
                    <span style={{ marginLeft: '8px' }}>
                      {icon.name.charAt(0).toUpperCase() + icon.name.slice(1)}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>



          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingFolder ? 'Cập nhật' : 'Tạo thư mục'}
              </Button>
              <Button onClick={() => {
                setFolderModalVisible(false);
                setEditingFolder(null);
                folderForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Share Modal */}
      <Modal
        title={`Chia sẻ ghi chú: ${sharingNote?.title}`}
        open={shareModalVisible}
        onCancel={() => {
          setShareModalVisible(false);
          setSharingNote(null);
          shareForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={shareForm}
          layout="vertical"
          onFinish={handleShareNote}
        >
          <Form.Item
            name="sharedWith"
            label="Chia sẻ với"
            rules={[{ required: true, message: 'Vui lòng chọn thành viên' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn thành viên để chia sẻ"
              style={{ width: '100%' }}
              loading={loadingUsers}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {(Array.isArray(users) ? users : []).map(user => (
                <Option key={user.id} value={user.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: user.avatarColor || '#1890ff' }}>
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{user.name || 'Không có tên'}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Quyền truy cập"
            rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập' }]}
          >
            <Select placeholder="Chọn quyền truy cập">
              <Option value="read">Chỉ đọc</Option>
              <Option value="edit">Chỉnh sửa</Option>
              <Option value="admin">Quản trị</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="Tin nhắn (tùy chọn)"
          >
            <TextArea
              rows={3}
              placeholder="Nhập tin nhắn cho người nhận..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={shareLoading}>
                Chia sẻ
              </Button>
              <Button onClick={() => {
                setShareModalVisible(false);
                setSharingNote(null);
                shareForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Note Detail Modal/Drawer for Mobile */}
      {isMobile ? (
        <Drawer
          title={selectedNoteForDetail?.title}
          placement="bottom"
          height="90vh"
          open={noteDetailVisible}
          onClose={() => {
            setNoteDetailVisible(false);
            setSelectedNoteForDetail(null);
          }}
          styles={{
            header: { 
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              fontSize: '16px'
            },
            body: { 
              padding: '16px',
              background: selectedNoteForDetail ? (convertColorBetweenThemes(selectedNoteForDetail.color) || getRandomColor()) : themeToken.colorBgContainer
            }
          }}
        >
          {selectedNoteForDetail && (
            <div style={{ 
              color: getTextColorForBackground(convertColorBetweenThemes(selectedNoteForDetail.color) || getRandomColor()),
              height: '100%',
              overflow: 'auto'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Text style={{ 
                    fontSize: '12px', 
                    color: getTextColorForBackground(convertColorBetweenThemes(selectedNoteForDetail.color) || getRandomColor()) === '#000000' ? '#666' : '#ccc' 
                  }}>
                    {dayjs(selectedNoteForDetail.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                  {selectedNoteForDetail.isPinned && <PushpinOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />}
                  {selectedNoteForDetail.isArchived && <InboxOutlined style={{ color: '#52c41a', fontSize: '12px' }} />}
                </div>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {selectedNoteForDetail.folder && (
                    <AntTag 
                      color={selectedNoteForDetail.folder.color} 
                      style={{ 
                        margin: 0, 
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: getTextColorForBackground(selectedNoteForDetail.folder.color),
                        border: `1px solid ${selectedNoteForDetail.folder.color}`,
                        backgroundColor: selectedNoteForDetail.folder.color
                      }}
                    >
                      {selectedNoteForDetail.folder.name}
                    </AntTag>
                  )}
                  {selectedNoteForDetail.tags && selectedNoteForDetail.tags.map(tag => (
                    <AntTag 
                      key={tag} 
                      style={{ 
                        margin: 0, 
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: '#722ed1',
                        border: '1px solid #722ed1',
                        borderRadius: '8px'
                      }}
                    >
                      #{tag}
                    </AntTag>
                  ))}
                </div>
              </div>
              
              <div style={{ 
                fontSize: '14px',
                lineHeight: '1.6',
                color: getTextColorForBackground(convertColorBetweenThemes(selectedNoteForDetail.color) || getRandomColor())
              }}>
                <div dangerouslySetInnerHTML={{ __html: selectedNoteForDetail.content }} />
              </div>
              
              <div style={{ 
                position: 'fixed',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px'
              }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingNote(selectedNoteForDetail);
                    noteForm.setFieldsValue(selectedNoteForDetail);
                    setNoteModalVisible(true);
                    setNoteDetailVisible(false);
                  }}
                  style={{
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      ) : (
        <Modal
          title={selectedNoteForDetail?.title}
          open={noteDetailVisible}
          onCancel={() => {
            setNoteDetailVisible(false);
            setSelectedNoteForDetail(null);
          }}
          footer={[
            <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
              setEditingNote(selectedNoteForDetail);
              noteForm.setFieldsValue(selectedNoteForDetail);
              setNoteModalVisible(true);
              setNoteDetailVisible(false);
            }}>
              Chỉnh sửa
            </Button>
          ]}
          width={800}
        >
          {selectedNoteForDetail && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {dayjs(selectedNoteForDetail.createdAt).format('DD/MM/YYYY HH:mm')}
                </Text>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {selectedNoteForDetail.folder && (
                    <AntTag color={selectedNoteForDetail.folder.color}>
                      {selectedNoteForDetail.folder.name}
                    </AntTag>
                  )}
                  {selectedNoteForDetail.tags && selectedNoteForDetail.tags.map(tag => (
                    <AntTag key={tag} color="purple">#{tag}</AntTag>
                  ))}
                </div>
              </div>
              
              <div dangerouslySetInnerHTML={{ __html: selectedNoteForDetail.content }} />
            </div>
          )}
        </Modal>
      )}

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton 
        onClick={() => {
          setEditingNote(null);
          noteForm.resetFields();
          setNoteModalVisible(true);
        }}
        tooltip="Tạo ghi chú mới"
        icon={<FileTextOutlined />}
        color={`linear-gradient(135deg, ${themeToken.colorWarning} 0%, #d48806 100%)`}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={itemToDelete?.type === 'note' ? 'Xác nhận xóa ghi chú' : 'Xác nhận xóa thư mục'}
        content={itemToDelete?.type === 'note' ? 'Bạn có chắc chắn muốn xóa ghi chú' : 'Bạn có chắc chắn muốn xóa thư mục'}
        itemName={itemToDelete?.name}
        loading={deleteLoading}
        size="medium"
      />
    </div>
  );
};

export default Notes; 