import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Typography,
  Divider,
  Empty,
  Tag,
  Drawer,
  List,
  Avatar,
  Progress,
  Collapse,
  Checkbox,
  InputNumber,
  ColorPicker,
  Tabs,
  Upload,
  Dropdown,
  Menu,
  Breadcrumb,
  Spin,
  notification,
  Alert
} from 'antd';
import ResponsiveStatCard from '../components/ResponsiveStatCard';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ProjectOutlined,
  SaveOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  SettingOutlined,
  MoreOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  ImportOutlined,
  ExportOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import moment from 'moment';
import 'moment/locale/vi';
import { useOutletContext } from 'react-router-dom';
import CategoryManager from '../components/CategoryManager';
import TemplateSelector from '../components/TemplateSelector';
import ExcelLikeTable from '../components/ExcelLikeTable';
import MobileChecklistHeader from '../components/MobileChecklistHeader';
import MobileChecklistTable from '../components/MobileChecklistTable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ChecklistDetailTableWithTabs from '../components/ChecklistDetailTableWithTabs';
import ResponsiveCollapsibleFilters from '../components/ResponsiveCollapsibleFilters';
import '../styles/checklist-improvements.css';
import '../styles/checklist-responsive.css';


import '../styles/desktop-statistics-colors.css';
import '../styles/mobile-statistics-colors.css';
import '../styles/tablet-landscape-statistics-colors.css';
import '../styles/tablet-landscape-statistics-improvements.css';
import '../styles/tablet-landscape-unified-forms.css';

const { Title } = Typography;

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface ChecklistItem {
  id?: string;
  category: string;
  content: string;
  order: number;
  isChecked?: boolean;
  notes?: string;
}

interface Checklist {
  id: string;
  name: string;
  project: {
    id: string;
    name: string;
    code: string;
  };
  description?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  items: ChecklistItem[];
  _count?: {
    items: number;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  defaultContent?: any[];
  hasTeapmleMauContent?: boolean;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  checklist: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
  };
}

const DesignChecklist: React.FC = () => {
  const outletContext = useOutletContext<{ user: any }>();
  const { user } = outletContext || {};
  
  // Responsive detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width <= 768);
      setIsTabletLandscape(width >= 769 && width <= 1366 && height < width);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    window.addEventListener('orientationchange', checkResponsive);
    
    return () => {
      window.removeEventListener('resize', checkResponsive);
      window.removeEventListener('orientationchange', checkResponsive);
    };
  }, []);
  
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [categoryManagerVisible, setCategoryManagerVisible] = useState(false);
  const [templateSelectorVisible, setTemplateSelectorVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Dynamic data state for current session
  const [dynamicItems, setDynamicItems] = useState<ChecklistItem[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState(['STT', 'Hạng mục', 'Checklist', 'Ghi chú']);
  const [currentActiveTab, setCurrentActiveTab] = useState<string>('');

  // Bulk actions state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);

  // Handle opening drawer with proper state initialization
  const handleOpenDrawer = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    
    // Kiểm tra xem có dữ liệu đã lưu trong localStorage không
    const savedData = localStorage.getItem(`checklist_${checklist.id}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        console.log('📦 Loading saved data from localStorage:', data);
        
        // Sử dụng dữ liệu đã lưu nếu có
        setDynamicItems(data.items || checklist.items || []);
        setDynamicColumns(data.columns || ['STT', 'Hạng mục', 'Check', 'Ghi chú']);
        if (data.currentActiveTab) {
          setCurrentActiveTab(data.currentActiveTab);
        } else {
          // Fallback: Initialize currentActiveTab with first category if available
          if (checklist.items && checklist.items.length > 0) {
            const categories = Array.from(new Set(checklist.items.map(item => item.category).filter(Boolean)));
            if (categories.length > 0) {
              setCurrentActiveTab(categories[0]);
            }
          }
        }
        
        console.log('✅ Loaded saved data successfully');
      } catch (error) {
        console.error('❌ Error loading saved data:', error);
        // Fallback to original data if loading fails
        setDynamicItems(checklist.items || []);
        setDynamicColumns(['STT', 'Hạng mục', 'Check', 'Ghi chú']);
        
        if (checklist.items && checklist.items.length > 0) {
          const categories = Array.from(new Set(checklist.items.map(item => item.category).filter(Boolean)));
          if (categories.length > 0) {
            setCurrentActiveTab(categories[0]);
          }
        }
      }
    } else {
      // Không có dữ liệu đã lưu, sử dụng dữ liệu từ database
      console.log('📦 No saved data found, using database data');
      setDynamicItems(checklist.items || []);
      setDynamicColumns(['STT', 'Hạng mục', 'Check', 'Ghi chú']);
      
      // Initialize currentActiveTab with first category if available
      if (checklist.items && checklist.items.length > 0) {
        const categories = Array.from(new Set(checklist.items.map(item => item.category).filter(Boolean)));
        if (categories.length > 0) {
          setCurrentActiveTab(categories[0]);
        }
      }
    }
    
    setDrawerVisible(true);
  };

  // Fetch data
  const fetchChecklists = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString()
      });
      
      if (searchText) params.append('search', searchText);
      if (selectedProject) params.append('projectId', selectedProject);

      const response = await axiosInstance.get(`/checklist/checklists?${params}`);
      setChecklists(response.data.checklists);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total
      });
    } catch (error) {
      console.error('Error fetching checklists:', error);
      notification.error({
        message: 'Lỗi khi tải dữ liệu',
        description: 'Không thể tải danh sách checklist. Vui lòng thử lại.',
        className: 'toast-error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      // Sử dụng endpoint public để lấy categories mặc định
      const response = await axiosInstance.get('/checklist/public/categories-with-defaults');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback: sử dụng categories mặc định nếu API không hoạt động
      const defaultCategories = [
        { id: 'giao-thong', name: 'Giao Thông', color: '#1890ff', description: 'Các hạng mục liên quan đến giao thông' },
        { id: 'san-nen', name: 'San Nền', color: '#52c41a', description: 'Các hạng mục liên quan đến san nền' },
        { id: 'xu-ly-nen', name: 'Xử lý nền', color: '#fa8c16', description: 'Các hạng mục liên quan đến xử lý nền' },
        { id: 'ke-ho', name: 'Kè hồ', color: '#722ed1', description: 'Các hạng mục liên quan đến kè hồ' },
        { id: 'tuong-chan', name: 'Tường chắn', color: '#eb2f96', description: 'Các hạng mục liên quan đến tường chắn' }
      ];
      setCategories(defaultCategories);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axiosInstance.get('/checklist/public/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchChecklists();
    fetchProjects();
    fetchCategories();
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchChecklists(pagination.current, pagination.pageSize);
  }, [searchText, selectedProject]);

  // Handle form submission
  const handleCreateChecklist = async (values: any) => {
    try {
      console.log('Form values received:', values);
      
      // Validate items
      const items = values.items || [];
      console.log('Items from form:', items);
      
      if (items.length === 0) {
        message.error('Vui lòng thêm ít nhất một mục kiểm tra');
        return;
      }

      const checklistData = {
        ...values,
        items: items.map((item: any, index: number) => ({
          ...item,
          order: index + 1
        }))
      };
      
      console.log('Final checklist data:', checklistData);

      await axiosInstance.post('/checklist/checklists', checklistData);
      message.success('Tạo checklist thành công');
      setModalVisible(false);
      form.resetFields();
      
      // Fetch updated checklists and open the newly created one
      await fetchChecklists();
      
      // Find and open the newly created checklist
      const response = await axiosInstance.get(`/checklist/checklists?search=${encodeURIComponent(values.name)}`);
      const newChecklist = response.data.checklists.find((c: any) => c.name === values.name);
      if (newChecklist) {
        handleOpenDrawer(newChecklist);
      }
    } catch (error) {
      console.error('Error creating checklist:', error);
      message.error('Không thể tạo checklist');
    }
  };

  const handleCreateTemplate = async (values: any) => {
    try {
      await axiosInstance.post('/checklist/templates', {
        checklistId: selectedChecklist?.id,
        name: values.name,
        description: values.description,
        saveAsDefault: values.saveAsDefault || false
      });
      message.success('Tạo mẫu thành công');
      setTemplateModalVisible(false);
      templateForm.resetFields();
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Không thể tạo mẫu');
    }
  };

  const handleCreateChecklistWithDefaults = async (values: any) => {
    try {
      const response = await axiosInstance.post('/checklist/checklists-with-defaults', {
        name: values.name,
        description: values.description,
        projectId: values.projectId
      });
      message.success('Tạo checklist với nội dung mặc định thành công');
      setModalVisible(false);
      form.resetFields();
      fetchChecklists();
    } catch (error) {
      console.error('Error creating checklist with defaults:', error);
      message.error('Không thể tạo checklist với nội dung mặc định');
    }
  };

  const handleCreateFromTemplate = async (template: Template) => {
    try {
      const values = await form.validateFields();
      await axiosInstance.post(`/checklist/templates/${template.id}/create-checklist`, {
        projectId: values.projectId,
        name: values.name,
        description: values.description
      });
      message.success('Tạo checklist từ mẫu thành công');
      setModalVisible(false);
      form.resetFields();
      fetchChecklists();
    } catch (error) {
      console.error('Error creating from template:', error);
      message.error('Không thể tạo checklist từ mẫu');
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setModalVisible(true);
    form.setFieldsValue({
      name: `${template.name} - Copy`,
      description: template.description,
      items: template.items
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/checklist/checklists/${id}`);
      message.success('Xóa checklist thành công');
      fetchChecklists();
    } catch (error) {
      console.error('Error deleting checklist:', error);
      message.error('Không thể xóa checklist');
    }
  };

  const handleDeleteClick = (checklist: Checklist) => {
    setChecklistToDelete(checklist);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setChecklistToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (checklistToDelete) {
      handleDelete(checklistToDelete.id);
      setDeleteModalVisible(false);
      setChecklistToDelete(null);
    }
  };

  const handleUpdateItem = async (itemId: string, updates: any, setDynamicItems?: React.Dispatch<React.SetStateAction<ChecklistItem[]>>) => {
    try {
      // Validate updates object
      if (!updates || typeof updates !== 'object') {
        console.error('Invalid updates object:', updates);
        message.error('Dữ liệu cập nhật không hợp lệ');
        return;
      }

      // Prepare clean updates object
      const cleanUpdates: any = {};
      
      // Validate and clean each field
      if (updates.order !== undefined) {
        cleanUpdates.order = typeof updates.order === 'number' ? updates.order : parseInt(updates.order) || 1;
      }
      if (updates.content !== undefined) {
        cleanUpdates.content = String(updates.content || '');
      }
      if (updates.isChecked !== undefined) {
        cleanUpdates.isChecked = Boolean(updates.isChecked);
      }
      if (updates.notes !== undefined) {
        cleanUpdates.notes = String(updates.notes || '');
      }
      if (updates.category !== undefined) {
        cleanUpdates.category = String(updates.category || 'Unknown');
      }

      // Check if the itemId looks like a temporary ID
      const isTemporaryId = itemId.includes('-') && itemId.split('-').length >= 2;
      
      if (isTemporaryId && selectedChecklist) {
        // This is a temporary ID, create the item first
        const createData = {
          checklistId: selectedChecklist.id,
          category: cleanUpdates.category || 'Unknown',
          content: cleanUpdates.content || '',
          order: cleanUpdates.order || 1,
          isChecked: cleanUpdates.isChecked || false,
          notes: cleanUpdates.notes || ''
        };

        // Add timeout to prevent request aborted
        const createResponse = await Promise.race([
          axiosInstance.post('/checklist/checklist-items', createData),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 30000)
          )
        ]);
        
        const newItemId = (createResponse as any).data.id;
        
        // Update local state with the new item
        if (setDynamicItems) {
          setDynamicItems(prevItems => 
            prevItems.map(item => 
              item.id === itemId ? { ...item, id: newItemId, ...cleanUpdates } : item
            )
          );
        }
        
        // Update the selectedChecklist items locally without fetching
        if (selectedChecklist) {
          setSelectedChecklist(prev => ({
            ...prev!,
            items: [
              ...prev!.items.filter(item => item.id !== itemId),
              { id: newItemId, ...createData }
            ]
          }));
        }
        
        // Save to local storage after creating new item
        setTimeout(() => saveToLocalStorage(), 100);
        
        message.success('Item đã được tạo thành công!');
      } else {
        // This is a real database ID, update directly
        // Add timeout to prevent request aborted
        await Promise.race([
          axiosInstance.put(`/checklist/checklist-items/${itemId}`, cleanUpdates),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 30000)
          )
        ]);
        
        // Update the item in the local state
        if (setDynamicItems) {
          setDynamicItems(prevItems => 
            prevItems.map(item => 
              item.id === itemId ? { ...item, ...cleanUpdates } : item
            )
          );
        }
        
        // Update the selectedChecklist items locally without fetching
        if (selectedChecklist) {
          setSelectedChecklist(prev => ({
            ...prev!,
            items: prev!.items.map(item => 
              item.id === itemId ? { ...item, ...cleanUpdates } : item
            )
          }));
        }
        
        // Save to local storage after updating item
        setTimeout(() => saveToLocalStorage(), 100);
        
        message.success('Item đã được cập nhật thành công!');
      }
    } catch (error: any) {
      console.error('Error updating item:', error);
      
      // Handle timeout errors specifically
      if (error.message === 'Request timeout') {
        message.error('Yêu cầu bị timeout. Vui lòng thử lại.');
        return;
      }
      
      // Handle request aborted errors
      if (error.code === 'ECONNABORTED' || error.message === 'Request aborted') {
        message.error('Kết nối bị gián đoạn. Vui lòng kiểm tra mạng và thử lại.');
        return;
      }
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        message.error('Dữ liệu không hợp lệ: ' + (error.response.data?.error || 'Vui lòng kiểm tra lại thông tin'));
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy item để cập nhật');
      } else if (error.response?.status === 500) {
        message.error('Lỗi server: ' + (error.response.data?.error || 'Vui lòng thử lại sau'));
      } else {
        message.error('Không thể cập nhật item: ' + (error.message || 'Lỗi không xác định'));
      }
    }
  };

  // Export/Import functions with HTTPS support
  const exportToJSON = () => {
    if (!selectedChecklist) {
      message.warning('Vui lòng chọn một checklist để export');
      return;
    }

    if (!currentActiveTab) {
      message.warning('Vui lòng chọn một tab để export');
      return;
    }

    const exportData = {
      checklist: selectedChecklist,
      currentTab: currentActiveTab,
      items: dynamicItems.filter(item => item.category === currentActiveTab) || [],
      columns: dynamicColumns,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Use HTTPS-compatible URL creation
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checklist_${selectedChecklist.name}_${currentActiveTab}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL to prevent memory leaks
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
    
    message.success(`Export tab "${currentActiveTab}" thành công!`);
  };

  const importFromJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.checklist && data.currentTab && data.items && data.columns) {
          setSelectedChecklist(data.checklist);
          setCurrentActiveTab(data.currentTab);
          
          // Ensure items is an array before setting
          const itemsArray = Array.isArray(data.items) ? data.items : [];
          setDynamicItems(prev => {
            // Filter out items from the same category and add new ones
            const otherItems = prev.filter(item => item.category !== data.currentTab);
            return [...otherItems, ...itemsArray];
          });
          
          setDynamicColumns(data.columns);
          message.success(`Import tab "${data.currentTab}" thành công!`);
        } else {
          message.error('File không đúng định dạng');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        message.error('File JSON không hợp lệ');
      }
    };
    
    reader.onerror = () => {
      message.error('Lỗi khi đọc file');
    };
    
    reader.readAsText(file);
  };

  // saveAsTemplate function removed as requested

  const saveToLocalStorage = () => {
    if (!selectedChecklist) {
      message.warning('Vui lòng chọn một checklist để lưu');
      return;
    }

    console.log('💾 Saving to localStorage:', {
      checklistId: selectedChecklist.id,
      dynamicItemsCount: dynamicItems.length,
      dynamicColumns: dynamicColumns,
      currentActiveTab
    });

    const saveData = {
      checklist: selectedChecklist,
      items: dynamicItems,
      columns: dynamicColumns,
      currentActiveTab,
      saveDate: new Date().toISOString(),
      version: '1.0'
    };

    try {
      // Lưu toàn bộ checklist
      localStorage.setItem(`checklist_${selectedChecklist.id}`, JSON.stringify(saveData));
      
      // Lưu vào danh sách các checklist đã lưu
      const savedChecklists = JSON.parse(localStorage.getItem('saved_checklists') || '[]');
      const existingIndex = savedChecklists.findIndex((item: any) => item.id === selectedChecklist.id);
      
      const savedItem = {
        id: selectedChecklist.id,
        name: selectedChecklist.name,
        projectName: selectedChecklist.project.name,
        saveDate: new Date().toISOString(),
        itemCount: dynamicItems.length
      };
      
      if (existingIndex >= 0) {
        savedChecklists[existingIndex] = savedItem;
      } else {
        savedChecklists.push(savedItem);
      }
      
      localStorage.setItem('saved_checklists', JSON.stringify(savedChecklists));
      
      console.log('✅ Successfully saved to localStorage:', {
        key: `checklist_${selectedChecklist.id}`,
        itemCount: dynamicItems.length,
        saveDate: new Date().toISOString()
      });
      
      message.success(`Đã lưu checklist "${selectedChecklist.name}" thành công! (${dynamicItems.length} items)`);
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      message.error('Lỗi khi lưu dữ liệu vào localStorage');
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = () => {
    if (!selectedChecklist) {
      message.warning('Vui lòng chọn một checklist để tải');
      return;
    }

    console.log('📂 Loading from localStorage for checklist:', selectedChecklist.id);

    const savedData = localStorage.getItem(`checklist_${selectedChecklist.id}`);
    if (!savedData) {
      message.warning('Không tìm thấy dữ liệu đã lưu cho checklist này');
      return;
    }

    try {
      const data = JSON.parse(savedData);
      console.log('📦 Loaded data from localStorage:', {
        itemCount: data.items?.length || 0,
        columns: data.columns,
        currentActiveTab: data.currentActiveTab,
        saveDate: data.saveDate
      });

      setDynamicItems(data.items || []);
      setDynamicColumns(data.columns || ['STT', 'Hạng mục', 'Check', 'Ghi chú']);
      if (data.currentActiveTab) {
        setCurrentActiveTab(data.currentActiveTab);
      }
      
      console.log('✅ Successfully loaded data from localStorage');
      message.success(`Đã tải dữ liệu đã lưu từ ${new Date(data.saveDate).toLocaleDateString('vi-VN')} (${data.items?.length || 0} items)`);
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      message.error('Lỗi khi tải dữ liệu đã lưu');
    }
  };

  // Bulk actions handlers
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: 'Không có checklist nào được chọn',
        description: 'Vui lòng chọn ít nhất một checklist để xóa',
        className: 'toast-warning'
      });
      return;
    }

    setBulkLoading(true);
    try {
      // Delete multiple checklists
      const deletePromises = selectedRowKeys.map(id => 
        axiosInstance.delete(`/checklist/checklists/${id}`)
      );
      await Promise.all(deletePromises);
      
      notification.success({
        message: 'Xóa thành công',
        description: `Đã xóa ${selectedRowKeys.length} checklist`,
        className: 'toast-success'
      });
      
      setSelectedRowKeys([]);
      fetchChecklists();
    } catch (error) {
      console.error('Error deleting checklists:', error);
      notification.error({
        message: 'Lỗi khi xóa',
        description: 'Không thể xóa một số checklist. Vui lòng thử lại.',
        className: 'toast-error'
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: 'Không có checklist nào được chọn',
        description: 'Vui lòng chọn ít nhất một checklist để xuất',
        className: 'toast-warning'
      });
      return;
    }

    setBulkLoading(true);
    try {
      const selectedChecklists = checklists.filter(c => selectedRowKeys.includes(c.id));
      const exportData = {
        checklists: selectedChecklists,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Use HTTPS-compatible URL creation
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checklists_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL to prevent memory leaks
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      notification.success({
        message: 'Xuất thành công',
        description: `Đã xuất ${selectedRowKeys.length} checklist`,
        className: 'toast-success'
      });
    } catch (error) {
      console.error('Error exporting checklists:', error);
      notification.error({
        message: 'Lỗi khi xuất',
        description: 'Không thể xuất checklist. Vui lòng thử lại.',
        className: 'toast-error'
      });
    } finally {
      setBulkLoading(false);
    }
  };

  // Group checklists by project
  const groupedChecklists = checklists.reduce((acc, checklist) => {
    const projectId = checklist.project.id;
    if (!acc[projectId]) {
      acc[projectId] = {
        key: projectId,
        project: checklist.project,
        checklists: []
      };
    }
    acc[projectId].checklists.push(checklist);
    return acc;
  }, {} as Record<string, { key: string; project: any; checklists: Checklist[] }>);

  // Parent columns (Project level)
  const parentColumns = [
    {
      title: 'Dự án',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar size="large" icon={<ProjectOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{project.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{project.code}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: any) => {
        const totalChecklists = record.checklists.length;
        const completedChecklists = record.checklists.filter((c: Checklist) => 
          c.items.every(item => item.isChecked)
        ).length;
        const inProgressChecklists = record.checklists.filter((c: Checklist) => 
          c.items.some(item => item.isChecked) && !c.items.every(item => item.isChecked)
        ).length;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              <Tag color="green">Hoàn thành: {completedChecklists}</Tag>
            </div>
            <div>
              <Tag color="blue">Đang thực hiện: {inProgressChecklists}</Tag>
            </div>
            <div>
              <Tag color="default">Chưa bắt đầu: {totalChecklists - completedChecklists - inProgressChecklists}</Tag>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Số Checklist',
      key: 'count',
      render: (record: any) => (
        <div style={{ textAlign: 'center' }}>
          <Statistic 
            value={record.checklists.length} 
            prefix={<FileTextOutlined />}
            valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
          />
        </div>
      )
    }
  ];

  // Child columns (Checklist level)
  const childColumns = [
    {
      title: 'Tên Checklist',
      dataIndex: 'name',
      key: 'name',
             render: (text: string, record: Checklist) => (
         <div style={{ paddingLeft: '24px' }}>
           <div 
             style={{ 
               fontWeight: 'bold', 
               fontSize: '14px', 
               color: '#1890ff', 
               cursor: 'pointer',
               textDecoration: 'underline'
             }}
             onClick={() => {
               setSelectedChecklist(record);
               setDrawerVisible(true);
             }}
           >
             {text}
           </div>
           {record.description && (
             <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{record.description}</div>
           )}
         </div>
       )
    },
    {
      title: 'Người tạo',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      render: (text: string, record: Checklist) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (record: Checklist) => {
        const totalItems = record._count?.items || record.items.length;
        const checkedItems = record.items.filter(item => item.isChecked).length;
        const percentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
        
        return (
          <div style={{ width: '200px' }}>
            <Progress percent={percentage} size="small" />
            <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
              {checkedItems}/{totalItems} hoàn thành
            </div>
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Checklist) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedChecklist(record);
                setModalVisible(true);
                form.setFieldsValue({
                  name: record.name,
                  projectId: record.project.id,
                  description: record.description,
                  items: record.items
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteClick(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Calculate statistics
  const checklistStats = {
    total: checklists.length,
    completed: checklists.filter(c => c.items.every(item => item.isChecked)).length,
    inProgress: checklists.filter(c => 
      c.items.some(item => item.isChecked) && !c.items.every(item => item.isChecked)
    ).length,
    notStarted: checklists.filter(c => !c.items.some(item => item.isChecked)).length
  };

  return (
    <div className="design-checklist-container" style={{ padding: '24px' }}>
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-container">
        <Breadcrumb>
          <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Quản lý dự án</Breadcrumb.Item>
          <Breadcrumb.Item>Hồ sơ thiết kế</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Mobile Header */}
      <MobileChecklistHeader
        searchText={searchText}
        setSearchText={setSearchText}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
        onOpenCategoryManager={() => setCategoryManagerVisible(true)}
        onOpenTemplateSelector={() => setTemplateSelectorVisible(true)}
        onCreateChecklist={() => {
          setSelectedChecklist(null);
          setModalVisible(true);
          form.resetFields();
          
          // Tự động import nội dung mặc định từ TeapmleMau
          const defaultItems: any[] = [];
          let order = 1;
          
          categories.forEach(category => {
            if (category.defaultContent && category.defaultContent.length > 0) {
              category.defaultContent.forEach((item: any) => {
                defaultItems.push({
                  category: category.name,
                  content: item.content,
                  order: order++
                });
              });
            }
          });
          
          if (defaultItems.length > 0) {
            form.setFieldsValue({
              items: defaultItems
            });
          } else if (categories.length > 0) {
            // Fallback: sử dụng category đầu tiên nếu không có nội dung mặc định
            const defaultCategory = categories[0].name;
            form.setFieldsValue({
              items: [{
                category: defaultCategory,
                content: '',
                order: 1
              }]
            });
          }
        }}
      />

      {/* Desktop Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle" justify="space-between" style={{ marginBottom: '16px' }}>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Title level={3} style={{ margin: 0 }}>Hồ sơ thiết kế</Title>
            </div>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setCategoryManagerVisible(true)}
              >
                Quản lý Hạng mục
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => setTemplateSelectorVisible(true)}
              >
                Từ Mẫu
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedChecklist(null);

        {/* Responsive Filters for Tablet Landscape */}
        {isTabletLandscape && (
          <ResponsiveCollapsibleFilters
            searchValue={searchText}
            searchPlaceholder="Tìm kiếm checklist..."
            onSearchChange={setSearchText}
            statusValue=""
            statusOptions={[]}
            onStatusChange={() => {}}
            priorityValue=""
            priorityOptions={[]}
            onPriorityChange={() => {}}
            projectValue={selectedProject}
            projectOptions={projects.map(project => ({ value: project.id, label: project.name }))}
            onProjectChange={setSelectedProject}
            assigneeValue=""
            assigneeOptions={[]}
            onAssigneeChange={() => {}}
            onReset={() => {
              setSearchText('');
              setSelectedProject('');
            }}
            title="Bộ lọc checklist"
            isMobile={isMobile}
            isTabletLandscape={isTabletLandscape}
            isDarkMode={false}
          />
        )}
                  setModalVisible(true);
                  form.resetFields();
                }}
              >
                Tạo Checklist
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Đã chọn {selectedRowKeys.length} checklist</span>
            <Button 
              type="link" 
              size="small" 
              onClick={() => setSelectedRowKeys([])}
            >
              Bỏ chọn tất cả
            </Button>
          </div>
          <Space>
            <Button 
              icon={<DeleteOutlined />} 
              danger
              loading={bulkLoading}
              onClick={handleBulkDelete}
            >
              Xóa ({selectedRowKeys.length})
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              loading={bulkLoading}
              onClick={handleBulkExport}
            >
              Xuất ({selectedRowKeys.length})
            </Button>
          </Space>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="checklist-container">
        <Row gutter={16} style={{ marginBottom: '24px' }} className="dashboard-stats-row">
          <Col span={6}>
            <ResponsiveStatCard
              title="Tổng số Checklist"
              value={checklistStats.total}
              icon={<FileTextOutlined />}
              function="design-checklist"
            />
          </Col>
          <Col span={6}>
            <ResponsiveStatCard
              title="Đã hoàn thành"
              value={checklistStats.completed}
              icon={<CheckCircleOutlined />}
              function="design-checklist"
              color="#52c41a"
            />
          </Col>
          <Col span={6}>
            <ResponsiveStatCard
              title="Đang thực hiện"
              value={checklistStats.inProgress}
              icon={<ClockCircleOutlined />}
              function="design-checklist"
              color="#1890ff"
            />
          </Col>
          <Col span={6}>
            <ResponsiveStatCard
              title="Chưa bắt đầu"
              value={checklistStats.notStarted}
              icon={<FileTextOutlined />}
              function="design-checklist"
              color="#faad14"
            />
          </Col>
        </Row>
      </div>

      {/* Desktop Filters - Moved below statistics for desktop */}
      {!isMobile && !isTabletLandscape && (
        <ResponsiveCollapsibleFilters
          searchValue={searchText}
          searchPlaceholder="Tìm kiếm checklist..."
          onSearchChange={setSearchText}
          statusValue=""
          statusOptions={[
            { value: '', label: 'Tất cả trạng thái' }
          ]}
          onStatusChange={() => {}}
          priorityValue=""
          priorityOptions={[
            { value: '', label: 'Tất cả độ ưu tiên' }
          ]}
          onPriorityChange={() => {}}
          projectValue={selectedProject}
          projectOptions={[
            { value: '', label: 'Tất cả dự án' },
            ...projects.map(project => ({ value: project.id, label: project.name }))
          ]}
          onProjectChange={setSelectedProject}
          assigneeValue=""
          assigneeOptions={[
            { value: '', label: 'Tất cả người dùng' }
          ]}
          onAssigneeChange={() => {}}
          onReset={() => {
            setSearchText('');
            setSelectedProject('');
          }}
          title={`Bộ lọc checklist (${checklists.length})`}
          isMobile={isMobile}
          isTabletLandscape={isTabletLandscape}
          isDarkMode={false}
        />
      )}

      {/* Mobile Checklist Table */}
      <MobileChecklistTable
        checklists={checklists}
        onViewChecklist={handleOpenDrawer}
        onEditChecklist={(checklist) => {
          setSelectedChecklist(checklist);
          setModalVisible(true);
          form.setFieldsValue({
            name: checklist.name,
            projectId: checklist.project.id,
            description: checklist.description,
            items: checklist.items
          });
        }}
        onDeleteChecklist={(id: string) => {
          const checklist = checklists.find(c => c.id === id);
          if (checklist) {
            handleDeleteClick(checklist);
          }
        }}
        loading={loading}
      />

      {/* Desktop Checklist Table */}
      <Card className="checklist-card desktop-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Đang tải dữ liệu...</div>
          </div>
        ) : Object.values(groupedChecklists).length === 0 ? (
          <div className="empty-state-container">
            <div className="empty-state-illustration">
              <FileTextOutlined />
            </div>
            <div className="empty-state-title">Chưa có checklist nào</div>
            <div className="empty-state-description">
              Bắt đầu tạo checklist đầu tiên để quản lý hồ sơ thiết kế của bạn
            </div>
            <Space direction="vertical" size="middle">
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedChecklist(null);
                  setModalVisible(true);
                  form.resetFields();
                }}
              >
                Tạo Checklist đầu tiên
              </Button>
              <Button 
                size="large" 
                icon={<FileAddOutlined />}
                onClick={() => {
                  setSelectedChecklist(null);
                  setModalVisible(true);
                  form.resetFields();
                  // Sử dụng form với nội dung mặc định
                  form.setFieldsValue({
                    useDefaults: true
                  });
                }}
              >
                Tạo với nội dung mặc định
              </Button>
            </Space>
          </div>
        ) : (
          <Table
            columns={parentColumns}
            dataSource={Object.values(groupedChecklists)}
            rowKey="key"
            rowSelection={{
              selectedRowKeys,
              onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
              getCheckboxProps: (record) => ({
                disabled: record.checklists.length === 0,
                name: record.project.name,
              }),
            }}
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  columns={childColumns}
                  dataSource={record.checklists}
                  rowKey="id"
                  rowSelection={{
                    selectedRowKeys,
                    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                    getCheckboxProps: (record) => ({
                      name: record.name,
                    }),
                  }}
                  pagination={false}
                  showHeader={true}
                  bordered={false}
                />
              ),
              rowExpandable: record => record.checklists.length > 0,
            }}
            pagination={false}
            showHeader={false}
            bordered
            style={{ marginTop: 24 }}
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedChecklist ? 'Chỉnh sửa Checklist' : 'Tạo Checklist Mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        className="tablet-landscape-edit-modal"
      >
        <Form
          form={form}
          layout="vertical"
          className="tablet-landscape-edit-form checklist-form"
          onFinish={(values) => {
            if (values.useDefaults) {
              return handleCreateChecklistWithDefaults(values);
            } else {
              return handleCreateChecklist(values);
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên Checklist"
                rules={[{ required: true, message: 'Vui lòng nhập tên checklist' }]}
              >
                <Input placeholder="Nhập tên checklist" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Dự án"
                rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
              >
                <Select placeholder="Chọn dự án">
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả checklist" />
          </Form.Item>

          <Form.Item label="Danh sách kiểm tra">
            <ChecklistItemsForm form={form} categories={categories} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {selectedChecklist ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer with Category Tabs */}
      <Drawer
        title={
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              {selectedChecklist?.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Dự án: {selectedChecklist?.project.name} | 
              Người tạo: {selectedChecklist?.createdBy.name} | 
              Ngày tạo: {selectedChecklist ? moment(selectedChecklist.createdAt).format('DD/MM/YYYY HH:mm') : ''}
            </div>
          </div>
        }
        placement="right"
        width={1000}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedChecklist && (
          <div>
            {/* Action Buttons - Simplified */}
            <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
              <Space>
                <Upload
                  accept=".json"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    importFromJSON(file);
                    return false;
                  }}
                >
                  <Button icon={<ImportOutlined />} type="dashed" size="small">
                    Import JSON
                  </Button>
                </Upload>
                <Button icon={<ExportOutlined />} onClick={exportToJSON} size="small">
                  Export JSON
                </Button>
                <Button icon={<SaveOutlined />} type="primary" onClick={saveToLocalStorage} size="small">
                  Lưu Local
                </Button>
                <Button icon={<SaveOutlined />} onClick={loadFromLocalStorage} size="small">
                  Tải Local
                </Button>
                <Button 
                  icon={<DeleteOutlined />} 
                  danger 
                  onClick={() => {
                    if (selectedChecklist) {
                      localStorage.removeItem(`checklist_${selectedChecklist.id}`);
                      message.success('Đã xóa dữ liệu đã lưu');
                    }
                  }} 
                  size="small"
                >
                  Xóa Local
                </Button>
                <Button 
                  icon={<SaveOutlined />} 
                  type="primary"
                  onClick={() => setTemplateModalVisible(true)} 
                  size="small"
                >
                  Tạo mẫu
                </Button>
              </Space>
            </div>

            <ChecklistDetailTableWithTabs
              items={selectedChecklist.items || []}
              categories={categories}
              onUpdateItem={handleUpdateItem}
              dynamicItems={dynamicItems}
              setDynamicItems={setDynamicItems}
              dynamicColumns={dynamicColumns}
              setDynamicColumns={setDynamicColumns}
              currentActiveTab={currentActiveTab}
              setCurrentActiveTab={setCurrentActiveTab}
            />
          </div>
        )}
      </Drawer>

      {/* Category Manager */}
      <CategoryManager
        visible={categoryManagerVisible}
        onClose={() => setCategoryManagerVisible(false)}
        onRefresh={fetchCategories}
      />

      {/* Template Selector */}
      <TemplateSelector
        visible={templateSelectorVisible}
        onClose={() => setTemplateSelectorVisible(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Create Template Modal */}
      <Modal
        title="Tạo mẫu từ checklist"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={templateForm}
          layout="vertical"
          onFinish={handleCreateTemplate}
        >
          <Form.Item
            name="name"
            label="Tên mẫu"
            rules={[{ required: true, message: 'Vui lòng nhập tên mẫu' }]}
          >
            <Input placeholder="Nhập tên mẫu" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả mẫu" />
          </Form.Item>

          <Form.Item
            name="saveAsDefault"
            valuePropName="checked"
          >
            <Checkbox>
              Lưu mẫu vào file mặc định để áp dụng cho các lần sau
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Tạo mẫu
              </Button>
              <Button onClick={() => setTemplateModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa checklist"
        content="Bạn có chắc chắn muốn xóa checklist"
        itemName={checklistToDelete?.name}
        size="medium"
      />
    </div>
  );
};

// Component for checklist items form
const ChecklistItemsForm: React.FC<{ form: any; categories: Category[] }> = ({ form, categories }) => {
  const hasTeapmleMauContent = categories.some(cat => cat.hasTeapmleMauContent);
  
  return (
    <div>
      {hasTeapmleMauContent && (
        <Alert
          message="Nội dung mặc định từ TeapmleMau"
          description="Các hạng mục đã được tự động import từ tài liệu kỹ thuật mẫu. Bạn có thể chỉnh sửa hoặc thêm mới."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <div>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} style={{ marginBottom: 8 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      {...restField}
                      name={[name, 'category']}
                      rules={[{ required: true, message: 'Vui lòng chọn hạng mục' }]}
                    >
                      <Select placeholder="Chọn hạng mục" style={{ width: '100%' }}>
                        {categories.map(category => (
                          <Option key={category.name} value={category.name}>
                            <Tag color={category.color}>
                              {category.name}
                              {category.hasTeapmleMauContent && (
                                <span style={{ marginLeft: 4, fontSize: '10px' }}>📋</span>
                              )}
                            </Tag>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      rules={[{ required: true, message: 'Vui lòng nhập nội dung kiểm tra' }]}
                    >
                      <Input placeholder="Nhập nội dung kiểm tra (bắt buộc)" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Col>
                </Row>
              </Card>
            ))}
            <Button 
              type="dashed" 
              onClick={() => {
                const defaultCategory = categories.length > 0 ? categories[0].name : '';
                add({
                  category: defaultCategory,
                  content: '',
                  order: fields.length + 1
                });
              }} 
              block 
              icon={<PlusOutlined />}
            >
              Thêm mục kiểm tra
            </Button>
          </div>
        )}
      </Form.List>
    </div>
  );
};



 

 export default DesignChecklist; 