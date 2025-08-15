import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  List,
  Card,
  Typography,
  Space,
  Button,
  Empty,
  Spin,
  Badge,
  Divider,
  FloatButton,
  BackTop
} from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MobileApprovalCard from './MobileApprovalCard';
import MobileFilters from './MobileFilters';
import MobileRefreshIndicator from './MobileRefreshIndicator';
import { useResponsive } from '../hooks/useResponsive';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface DocumentCard {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  category: string;
  sendDate: string;
  signDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  currentStage: 'design' | 'kcs' | 'verification' | 'appraisal';
  currentVersion?: number;
  stageDisplay?: string;
  assignedTo?: string;
  assignedToId?: string;
  priority: 'low' | 'medium' | 'high';
  rejectionReason?: string;
  history: any[];
  attachments?: string[];
  lastModified: string;
  comments: any[];
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface MobileApprovalListViewProps {
  documents: DocumentCard[];
  projects: Project[];
  users: User[];
  loading: boolean;
  onRefresh: () => void;
  onApprove: (card: DocumentCard) => void;
  onReject: (card: DocumentCard) => void;
  onSendToKCS: (card: DocumentCard) => void;
  onViewHistory: (card: DocumentCard) => void;
  onAddComment: (card: DocumentCard) => void;
  onEdit: (card: DocumentCard) => void;
  onDelete: (card: DocumentCard) => void;
  onAddNew: () => void;
  onFavorite?: (card: DocumentCard) => void;
  onShare?: (card: DocumentCard) => void;
  favorites?: string[];
  enablePullToRefresh?: boolean;
  enableVirtualScroll?: boolean;
  compactMode?: boolean;
}

type SortField = 'sendDate' | 'lastModified' | 'priority' | 'title' | 'status';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'list' | 'grid';
type GroupBy = 'none' | 'project' | 'stage' | 'status' | 'priority';

const MobileApprovalListView: React.FC<MobileApprovalListViewProps> = ({
  documents,
  projects,
  users,
  loading,
  onRefresh,
  onApprove,
  onReject,
  onSendToKCS,
  onViewHistory,
  onAddComment,
  onEdit,
  onDelete,
  onAddNew,
  onFavorite,
  onShare,
  favorites = [],
  enablePullToRefresh = true,
  enableVirtualScroll = true,
  compactMode = false
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const isDarkMode = useSelector((state: any) => state.ui.isDarkMode);

  // State for list management
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [groupBy, setGroupBy] = useState<GroupBy>('project');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [priorityValue, setPriorityValue] = useState('');
  const [stageValue, setStageValue] = useState('');
  const [projectValue, setProjectValue] = useState('');
  const [assigneeValue, setAssigneeValue] = useState('');

  // Pull to refresh
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  // Filter options
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'approved', label: 'Đã phê duyệt' },
    { value: 'rejected', label: 'Từ chối' },
    { value: 'completed', label: 'Hoàn thành' }
  ];

  const priorityOptions = [
    { value: '', label: 'Tất cả mức độ' },
    { value: 'low', label: 'Thấp' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'high', label: 'Cao' }
  ];

  const stageOptions = [
    { value: '', label: 'Tất cả giai đoạn' },
    { value: 'design', label: 'Thiết kế' },
    { value: 'kcs', label: 'KCS Nội Bộ' },
    { value: 'verification', label: 'Thẩm tra' },
    { value: 'appraisal', label: 'Thẩm định' }
  ];

  const projectOptions = [
    { value: '', label: 'Tất cả dự án' },
    ...projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  const assigneeOptions = [
    { value: '', label: 'Tất cả người phụ trách' },
    ...users.map(user => ({
      value: user.id,
      label: user.name
    }))
  ];

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = !searchValue || 
        doc.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
        doc.projectName.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesStatus = !statusValue || doc.status === statusValue;
      const matchesPriority = !priorityValue || doc.priority === priorityValue;
      const matchesStage = !stageValue || doc.currentStage === stageValue;
      const matchesProject = !projectValue || doc.projectId === projectValue;
      const matchesAssignee = !assigneeValue || doc.assignedToId === assigneeValue;

      return matchesSearch && matchesStatus && matchesPriority && 
             matchesStage && matchesProject && matchesAssignee;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'sendDate':
          comparison = dayjs(a.sendDate).valueOf() - dayjs(b.sendDate).valueOf();
          break;
        case 'lastModified':
          comparison = dayjs(a.lastModified).valueOf() - dayjs(b.lastModified).valueOf();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchValue, statusValue, priorityValue, stageValue, 
      projectValue, assigneeValue, sortField, sortOrder]);

  // Group documents
  const groupedDocuments = useMemo(() => {
    if (groupBy === 'none') {
      return { 'Tất cả hồ sơ': filteredAndSortedDocuments };
    }

    const groups: { [key: string]: DocumentCard[] } = {};

    filteredAndSortedDocuments.forEach(doc => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'project':
          groupKey = doc.projectName;
          break;
        case 'stage':
          const stageNames = {
            design: 'Thiết kế',
            kcs: 'KCS Nội Bộ',
            verification: 'Thẩm tra',
            appraisal: 'Thẩm định'
          };
          groupKey = stageNames[doc.currentStage] || doc.currentStage;
          break;
        case 'status':
          const statusNames = {
            pending: 'Chờ xử lý',
            approved: 'Đã phê duyệt',
            rejected: 'Từ chối',
            completed: 'Hoàn thành'
          };
          groupKey = statusNames[doc.status] || doc.status;
          break;
        case 'priority':
          const priorityNames = {
            high: 'Cao',
            medium: 'Trung bình',
            low: 'Thấp'
          };
          groupKey = priorityNames[doc.priority] || doc.priority;
          break;
        default:
          groupKey = 'Khác';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
    });

    return groups;
  }, [filteredAndSortedDocuments, groupBy]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefreshTime(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Handle pull to refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enablePullToRefresh || window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
  }, [enablePullToRefresh]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enablePullToRefresh || window.scrollY > 0 || !startY) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, 100));
    }
  }, [enablePullToRefresh, startY]);

  const handleTouchEnd = useCallback(() => {
    if (!enablePullToRefresh) return;
    
    if (pullDistance > 60) {
      handleRefresh();
    }
    
    setIsPulling(false);
    setPullDistance(0);
    setStartY(0);
  }, [enablePullToRefresh, pullDistance, handleRefresh]);

  // Handle card expand
  const handleExpand = useCallback((cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  }, [expandedCards]);

  // Handle favorite
  const handleFavorite = useCallback((card: DocumentCard) => {
    onFavorite?.(card);
  }, [onFavorite]);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    setSearchValue('');
    setStatusValue('');
    setPriorityValue('');
    setStageValue('');
    setProjectValue('');
    setAssigneeValue('');
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField, sortOrder]);

  return (
    <div 
      className="mobile-approval-list-view"
      style={{
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#000' : '#f5f5f5',
        position: 'relative'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: pullDistance,
          background: 'linear-gradient(180deg, rgba(24,144,255,0.1) 0%, rgba(24,144,255,0.3) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <ReloadOutlined 
            spin={pullDistance > 60} 
            style={{ 
              color: '#1890ff',
              fontSize: 16,
              transform: `rotate(${pullDistance * 3.6}deg)`
            }} 
          />
        </div>
      )}

      {/* Header with filters */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: isDarkMode ? '#141414' : '#fff',
        borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
        padding: '12px 16px'
      }}>
        {/* Refresh indicator */}
        <MobileRefreshIndicator
          isRefreshing={isRefreshing}
          lastRefreshTime={lastRefreshTime}
          onRefresh={handleRefresh}
        />

        {/* Filters */}
        <MobileFilters
          searchValue={searchValue}
          statusValue={statusValue}
          priorityValue={priorityValue}
          assigneeValue={assigneeValue}
          projectValue={projectValue}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          typeOptions={stageOptions}
          assigneeOptions={assigneeOptions}
          projectOptions={projectOptions}
          onSearchChange={setSearchValue}
          onStatusChange={setStatusValue}
          onPriorityChange={setPriorityValue}
          onTypeChange={setStageValue}
          onAssigneeChange={setAssigneeValue}
          onProjectChange={setProjectValue}
          onReset={handleFilterReset}
          title="Lọc hồ sơ"
          isDarkMode={isDarkMode}
        />

        {/* View controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8
        }}>
          <Space size="small">
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('list')}
            />
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              size="small"
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('grid')}
            />
          </Space>

          <Space size="small">
            <Button
              size="small"
              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => handleSortChange(sortField)}
            >
              {sortField === 'lastModified' && 'Cập nhật'}
              {sortField === 'sendDate' && 'Ngày gửi'}
              {sortField === 'priority' && 'Ưu tiên'}
              {sortField === 'title' && 'Tên'}
              {sortField === 'status' && 'Trạng thái'}
            </Button>
          </Space>
        </div>

        {/* Summary */}
        <div style={{ marginTop: 8 }}>
          <Text style={{ 
            fontSize: 12, 
            color: isDarkMode ? '#999' : '#666' 
          }}>
            Hiển thị {filteredAndSortedDocuments.length} / {documents.length} hồ sơ
          </Text>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '8px 12px' }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px'
          }}>
            <Spin size="large" />
          </div>
        ) : filteredAndSortedDocuments.length === 0 ? (
          <Empty
            description="Không có hồ sơ nào"
            style={{ marginTop: 40 }}
          />
        ) : (
          Object.entries(groupedDocuments).map(([groupName, groupDocs]) => (
            <div key={groupName} style={{ marginBottom: 16 }}>
              {groupBy !== 'none' && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: isDarkMode ? '#1f1f1f' : '#f8f9fa',
                  borderRadius: 6,
                  marginBottom: 8,
                  border: `1px solid ${isDarkMode ? '#303030' : '#e9ecef'}`
                }}>
                  <Text style={{ 
                    fontWeight: 600,
                    color: isDarkMode ? '#fff' : '#000'
                  }}>
                    {groupName}
                  </Text>
                  <Badge 
                    count={groupDocs.length} 
                    style={{ marginLeft: 8 }}
                  />
                </div>
              )}

              <List
                dataSource={groupDocs}
                renderItem={(card) => (
                  <List.Item style={{ padding: 0, marginBottom: 8 }}>
                    <MobileApprovalCard
                      card={card}
                      onApprove={onApprove}
                      onReject={onReject}
                      onSendToKCS={onSendToKCS}
                      onViewHistory={onViewHistory}
                      onAddComment={onAddComment}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onExpand={handleExpand}
                      isExpanded={expandedCards.has(card.id)}
                      onFavorite={onFavorite}
                      onShare={onShare}
                      isFavorite={favorites.includes(card.id)}
                      compactMode={compactMode}
                      enableHapticFeedback={true}
                    />
                  </List.Item>
                )}
              />
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 16, bottom: 80 }}
        onClick={onAddNew}
      />

      {/* Back to top */}
      <BackTop style={{ right: 16, bottom: 24 }} />
    </div>
  );
};

export default MobileApprovalListView;
