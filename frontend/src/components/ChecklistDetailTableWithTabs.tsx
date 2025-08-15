import React, { useEffect, useState, useMemo } from 'react';
import { Tabs, Empty, Button, Space, message, Popconfirm, Modal } from 'antd';
import { ExportOutlined, FileExcelOutlined, FilePdfOutlined, DeleteOutlined } from '@ant-design/icons';
import ExcelLikeTable from './ExcelLikeTable';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { TabPane } = Tabs;

interface ChecklistItem {
  id?: string;
  category: string;
  content: string;
  order: number;
  isChecked?: boolean;
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface ChecklistDetailTableWithTabsProps {
  items: ChecklistItem[];
  categories: Category[];
  onUpdateItem: (itemId: string, updates: any, setDynamicItems?: React.Dispatch<React.SetStateAction<ChecklistItem[]>>) => void;
  dynamicItems?: ChecklistItem[];
  setDynamicItems?: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  dynamicColumns?: string[];
  setDynamicColumns?: React.Dispatch<React.SetStateAction<string[]>>;
  currentActiveTab?: string;
  setCurrentActiveTab?: React.Dispatch<React.SetStateAction<string>>;
}

const ChecklistDetailTableWithTabs: React.FC<ChecklistDetailTableWithTabsProps> = ({
  items,
  categories,
  onUpdateItem,
  dynamicItems: parentDynamicItems,
  setDynamicItems: setParentDynamicItems,
  dynamicColumns: parentDynamicColumns,
  setDynamicColumns: setParentDynamicColumns,
  currentActiveTab,
  setCurrentActiveTab
}) => {
  // Initialize local state with items from props
  const [localDynamicItems, setLocalDynamicItems] = useState<ChecklistItem[]>([]);
  const [localDynamicColumns, setLocalDynamicColumns] = useState<string[]>(['STT', 'Hạng mục', 'Check', 'Ghi chú']);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initialize items when props change
  useEffect(() => {
    if (items && Array.isArray(items) && items.length > 0) {
      setLocalDynamicItems(items);
    }
  }, [items]);

  // Use parent state if available, otherwise use local state
  const dynamicItems = parentDynamicItems || localDynamicItems;
    
  const setDynamicItems = (newItems: ChecklistItem[] | ((prev: ChecklistItem[]) => ChecklistItem[])) => {
    if (setParentDynamicItems) {
      // If using parent state, update it properly
      setParentDynamicItems(newItems);
    } else {
      // Otherwise update local state
      setLocalDynamicItems(newItems);
    }
  };

  const dynamicColumns = parentDynamicColumns || localDynamicColumns;
  const setDynamicColumns = setParentDynamicColumns || setLocalDynamicColumns;

  // Group items by category with proper error handling
  const itemsByCategory = useMemo(() => {
    if (!dynamicItems || !Array.isArray(dynamicItems)) {
      console.warn('dynamicItems is not an array:', dynamicItems);
      return {};
    }
    
    const grouped = dynamicItems.reduce((acc, item) => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid item in dynamicItems:', item);
        return acc;
      }
      
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);
    return grouped;
  }, [dynamicItems]);

  // Initialize currentActiveTab if not set
  useEffect(() => {
    if (!currentActiveTab && Object.keys(itemsByCategory).length > 0) {
      const firstCategory = Object.keys(itemsByCategory)[0];
      if (setCurrentActiveTab) {
        setCurrentActiveTab(firstCategory);
      }
    }
  }, [itemsByCategory, currentActiveTab, setCurrentActiveTab]);

  // Function to delete empty tabs
  const deleteEmptyTab = (category: string) => {
    const categoryItems = itemsByCategory[category] || [];
    const hasContent = categoryItems.some(item => 
      item.content && item.content.trim() !== ''
    );
    
    if (!hasContent) {
      // Remove all items in this category
      const newItems = dynamicItems.filter(item => item.category !== category);
      setDynamicItems(newItems);
      
      // Switch to another tab if current tab is being deleted
      if (currentActiveTab === category) {
        const remainingCategories = Object.keys(itemsByCategory).filter(cat => cat !== category);
        if (remainingCategories.length > 0) {
          setCurrentActiveTab?.(remainingCategories[0]);
        }
      }
      
      message.success(`Đã xóa tab "${category}" vì không có nội dung`);
    } else {
      message.warning(`Không thể xóa tab "${category}" vì có nội dung`);
    }
  };

  // Function to delete tab with confirmation
  const deleteTab = (category: string) => {
    const categoryItems = itemsByCategory[category] || [];
    const itemCount = categoryItems.length;
    
    if (itemCount === 0) {
      deleteEmptyTab(category);
      return;
    }
    
    // Show confirmation for tabs with content
    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setCategoryToDelete('');
  };

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;
    
    setDeleteLoading(true);
    const categoryItems = itemsByCategory[categoryToDelete] || [];
    const itemCount = categoryItems.length;
    
    const newItems = dynamicItems.filter(item => item.category !== categoryToDelete);
    setDynamicItems(newItems);
    
    // Switch to another tab if current tab is being deleted
    if (currentActiveTab === categoryToDelete) {
      const remainingCategories = Object.keys(itemsByCategory).filter(cat => cat !== categoryToDelete);
      if (remainingCategories.length > 0) {
        setCurrentActiveTab?.(remainingCategories[0]);
      }
    }
    
    message.success(`Đã xóa tab "${categoryToDelete}" và ${itemCount} mục`);
    setDeleteLoading(false);
    setDeleteModalVisible(false);
    setCategoryToDelete('');
  };

  const addRow = (category: string) => {
    const newItem: ChecklistItem = {
      id: `${category}-${Date.now()}-${Math.random()}`,
      category,
      content: '',
      order: dynamicItems.filter(item => item.category === category).length + 1,
      isChecked: false,
      notes: ''
    };
    setDynamicItems([...dynamicItems, newItem]);
  };

  const addRowAtPosition = (category: string, index: number, count: number = 1) => {
    console.log('🔄 ===== ADD ROW AT POSITION START =====');
    console.log('📋 Parameters:', { category, index, count });
    console.log('📊 Current dynamicItems length:', dynamicItems?.length);
    
    const categoryItems = dynamicItems.filter(item => item.category === category);
    const otherItems = dynamicItems.filter(item => item.category !== category);
    
    console.log('📊 Category items before:', {
      categoryItemsCount: categoryItems?.length,
      categoryItems: categoryItems?.map(item => ({ id: item.id, order: item.order, content: item.content?.substring(0, 20) }))
    });
    
    // Tạo nhiều dòng mới nếu cần
    console.log('🏗️ Creating new items...');
    const newItems: ChecklistItem[] = [];
    for (let i = 0; i < count; i++) {
      const newItem: ChecklistItem = {
        id: `${category}-${Date.now()}-${Math.random()}-${i}`,
        category,
        content: '',
        order: index + i + 1,
        isChecked: false,
        notes: ''
      };
      newItems.push(newItem);
      console.log(`📝 Created item ${i + 1}:`, { 
        id: newItem.id, 
        order: newItem.order, 
        category: newItem.category 
      });
    }
    
    console.log('📝 All new items created:', newItems);
    
    // Insert at the correct position within the category
    console.log(`🔧 Inserting ${newItems.length} items at position ${index} in categoryItems`);
    categoryItems.splice(index, 0, ...newItems);
    console.log('✅ Items inserted into categoryItems');
    
    // Update order numbers for all items in the category
    console.log('🔄 Updating order numbers for all category items...');
    categoryItems.forEach((item, idx) => {
      const oldOrder = item.order;
      item.order = idx + 1;
      console.log(`📊 Item ${item.id}: order ${oldOrder} → ${item.order}`);
    });
    
    console.log('📊 Category items after update:', {
      categoryItemsCount: categoryItems?.length,
      categoryItems: categoryItems?.map(item => ({ id: item.id, order: item.order, content: item.content?.substring(0, 20) }))
    });
    
    // Combine back all items
    console.log('🔄 Combining all items...');
    console.log('📊 Other items count:', otherItems?.length);
    const combinedItems = [...otherItems, ...categoryItems];
    console.log('📊 Combined items count:', combinedItems?.length);
    
    console.log('📞 Calling setDynamicItems...');
    setDynamicItems(combinedItems);
    console.log('✅ setDynamicItems called');
    
    console.log('🔄 ===== ADD ROW AT POSITION END =====');
    console.log(`✅ Successfully added ${count} row(s) for category "${category}"`);
  };

  const removeRow = (itemId: string) => {
    setDynamicItems(dynamicItems.filter(item => item.id !== itemId));
  };

  // Export to Excel function with HTTPS support
  const exportToExcel = (category: string, categoryItems: ChecklistItem[]) => {
    try {
      const sortedItems = [...categoryItems].sort((a, b) => a.order - b.order);
      
      const worksheetData = [
        ['STT', 'Hạng mục', 'Checklist', 'Ghi chú'], // Header
        ...sortedItems.map(item => [
          item.order,
          item.content,
          item.isChecked ? '✓' : '✗',
          item.notes || ''
        ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, category);

      // Auto-size columns
      const columnWidths = [
        { wch: 8 },  // STT
        { wch: 50 }, // Hạng mục
        { wch: 12 }, // Checklist
        { wch: 30 }  // Ghi chú
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.writeFile(workbook, `checklist_${category}_${new Date().toISOString().split('T')[0]}.xlsx`);
      message.success(`Đã xuất Excel cho hạng mục "${category}"`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Lỗi khi xuất Excel');
    }
  };

  // Export to PDF function with HTTPS support
  const exportToPDF = (category: string, categoryItems: ChecklistItem[]) => {
    try {
      const sortedItems = [...categoryItems].sort((a, b) => a.order - b.order);
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Checklist - ${category}`, 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 14, 30);
      
      // Prepare table data
      const tableData = sortedItems.map(item => [
        item.order.toString(),
        item.content,
        item.isChecked ? '✓' : '✗',
        item.notes || ''
      ]);

      // Add table using autoTable plugin
      if (typeof (doc as any).autoTable === 'function') {
        (doc as any).autoTable({
          startY: 40,
          head: [['STT', 'Hạng mục', 'Checklist', 'Ghi chú']],
          body: tableData,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 15 }, // STT
            1: { cellWidth: 80 }, // Hạng mục
            2: { cellWidth: 25 }, // Checklist
            3: { cellWidth: 50 }  // Ghi chú
          }
        });
      } else {
        // Fallback: create simple table without autoTable
        let yPosition = 40;
        const lineHeight = 7;
        
        // Header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('STT', 14, yPosition);
        doc.text('Hạng mục', 35, yPosition);
        doc.text('Checklist', 120, yPosition);
        doc.text('Ghi chú', 150, yPosition);
        
        yPosition += lineHeight;
        doc.line(14, yPosition, 200, yPosition);
        yPosition += lineHeight;
        
        // Data rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        tableData.forEach((row, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(row[0], 14, yPosition);
          doc.text(row[1], 35, yPosition);
          doc.text(row[2], 120, yPosition);
          doc.text(row[3], 150, yPosition);
          
          yPosition += lineHeight;
        });
      }

      doc.save(`checklist_${category}_${new Date().toISOString().split('T')[0]}.pdf`);
      message.success(`Đã xuất PDF cho hạng mục "${category}"`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      message.error('Lỗi khi xuất PDF: ' + (error as Error).message);
    }
  };

  const renderTableForCategory = (category: string, categoryItems: ChecklistItem[]) => {
    // Sort items by order
    const sortedItems = [...categoryItems].sort((a, b) => a.order - b.order);
    
    const columns = [
      {
        title: 'STT',
        dataIndex: 'order',
        key: 'order',
        width: 80,
        className: 'text-center',
        resizable: true
      },
      {
        title: 'Hạng mục',
        dataIndex: 'content',
        key: 'content',
        width: 300,
        className: 'text-left',
        resizable: true
      },
      {
        title: 'Checklist',
        dataIndex: 'isChecked',
        key: 'isChecked',
        width: 100,
        className: 'text-center',
        resizable: true
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
        width: 200,
        className: 'text-left',
        resizable: true
      }
    ];

    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Export buttons and tab actions */}
        <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '8px' }}>
          <Space>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              size="small"
              onClick={() => exportToExcel(category, categoryItems)}
            >
              Xuất Excel
            </Button>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              size="small"
              onClick={() => exportToPDF(category, categoryItems)}
            >
              Xuất PDF
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => deleteTab(category)}
            >
              Xóa Tab
            </Button>
          </Space>
        </div>
        
        {/* Table */}
        <div style={{ flex: 1, width: '100%' }}>
          <ExcelLikeTable
            data={sortedItems}
            columns={columns}
            onDataChange={(newData) => {
              console.log('🔄 ===== ON DATA CHANGE START =====');
              console.log('📋 New data received:', {
                newDataLength: newData?.length,
                newDataSample: newData?.slice(0, 3),
                sortedItemsLength: sortedItems?.length,
                sortedItemsSample: sortedItems?.slice(0, 3)
              });
              
              // Create a map of the current items for this category
              if (!Array.isArray(sortedItems)) {
                console.error('sortedItems is not an array:', sortedItems);
                return;
              }
              const itemMap = new Map(sortedItems.map(item => [item.order - 1, item]));
              console.log('📊 Item map created:', {
                mapSize: itemMap.size,
                mapKeys: Array.from(itemMap.keys())
              });
              
              // Process updates and new items
              const updates: Array<{item: ChecklistItem, updates: any}> = [];
              const newItems: ChecklistItem[] = [];
              
              newData.forEach((updatedItem, index) => {
                const originalItem = itemMap.get(index);
                console.log(`📊 Processing item at index ${index}:`, {
                  hasOriginalItem: !!originalItem,
                  originalItemId: originalItem?.id,
                  updatedItem: updatedItem
                });
                
                if (originalItem && originalItem.id) {
                  // This is an existing item - check for updates
                  const itemUpdates: any = {};
                  
                  // Check for changes
                  if (updatedItem.order !== originalItem.order) {
                    itemUpdates.order = updatedItem.order;
                    console.log(`🔄 Order changed: ${originalItem.order} → ${updatedItem.order}`);
                  }
                  if (updatedItem.content !== originalItem.content) {
                    itemUpdates.content = updatedItem.content;
                    console.log(`🔄 Content changed: "${originalItem.content?.substring(0, 20)}" → "${updatedItem.content?.substring(0, 20)}"`);
                  }
                  if (updatedItem.isChecked !== originalItem.isChecked) {
                    itemUpdates.isChecked = updatedItem.isChecked;
                    console.log(`🔄 Checked changed: ${originalItem.isChecked} → ${updatedItem.isChecked}`);
                  }
                  if (updatedItem.notes !== originalItem.notes) {
                    itemUpdates.notes = updatedItem.notes;
                    console.log(`🔄 Notes changed: "${originalItem.notes?.substring(0, 20)}" → "${updatedItem.notes?.substring(0, 20)}"`);
                  }
                  
                  if (Object.keys(itemUpdates).length > 0) {
                    updates.push({ item: originalItem, updates: itemUpdates });
                    console.log(`✅ Updates collected for item ${originalItem.id}:`, itemUpdates);
                  } else {
                    console.log(`ℹ️ No changes detected for item ${originalItem.id}`);
                  }
                } else {
                  // This is a new item from paste
                  console.log(`🆕 Creating new item for index ${index}`);
                  const newItem: ChecklistItem = {
                    id: `${category}-${Date.now()}-${Math.random()}-${index}`,
                    category: category,
                    content: updatedItem.content || '',
                    order: index + 1,
                    isChecked: updatedItem.isChecked || false,
                    notes: updatedItem.notes || ''
                  };
                  newItems.push(newItem);
                  console.log(`✅ New item created:`, newItem);
                }
              });
              
              console.log('📊 Total updates collected:', updates.length);
              console.log('📊 Total new items created:', newItems.length);
              
              // Get current category items
              const currentCategoryItems = dynamicItems.filter(item => item.category === category);
              const otherItems = dynamicItems.filter(item => item.category !== category);
              
              // Apply updates to existing items
              let updatedCategoryItems = currentCategoryItems.map(item => {
                const update = updates.find(u => u.item.id === item.id);
                if (update) {
                  console.log(`🔄 Updating item ${item.id}:`, update.updates);
                  // Call the API update
                  onUpdateItem(item.id!, update.updates, setParentDynamicItems);
                  // Return updated item
                  return { ...item, ...update.updates };
                }
                return item;
              });
              
              // Add new items
              if (newItems.length > 0) {
                console.log('🆕 Adding new items to category:', newItems);
                updatedCategoryItems = [...updatedCategoryItems, ...newItems];
                
                // Update order numbers for all category items
                console.log('🔄 Updating order numbers for all category items...');
                updatedCategoryItems.forEach((item, index) => {
                  item.order = index + 1;
                  console.log(`📊 Item ${item.id}: order ${item.order}`);
                });
              }
              
              // Combine with other items and update state
              const finalItems = [...otherItems, ...updatedCategoryItems];
              console.log('📞 Calling setDynamicItems with final items...');
              console.log('📊 Final items count:', finalItems.length);
              setDynamicItems(finalItems);
              console.log('✅ setDynamicItems called');
              
              console.log('🔄 ===== ON DATA CHANGE END =====');
            }}
            onAddRow={(index: number, count?: number) => {
              console.log('🔄 ===== ON ADD ROW CALLBACK START =====');
              console.log('📋 Parameters:', { index, count, category });
              console.log('📊 Current sortedItems length:', sortedItems?.length);
              console.log('📊 Current dynamicItems length:', dynamicItems?.length);
              
              addRowAtPosition(category, index, count || 1);
              
              console.log('🔄 ===== ON ADD ROW CALLBACK END =====');
            }}
            onRemoveRow={(index: number) => {
              const itemToRemove = sortedItems[index];
              if (itemToRemove && itemToRemove.id) {
                removeRow(itemToRemove.id);
              }
            }}
            resizable={true}
            showColumnControls={false} // Bỏ icon xóa cột
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {Object.keys(itemsByCategory).length > 0 ? (
        <div style={{ height: '100%', width: '100%' }}>
          <Tabs 
            defaultActiveKey={Object.keys(itemsByCategory)[0]}
            activeKey={currentActiveTab || Object.keys(itemsByCategory)[0]}
            onChange={(activeKey) => {
              if (setCurrentActiveTab) {
                setCurrentActiveTab(activeKey);
              }
            }}
            style={{ height: '100%', width: '100%' }}
            tabBarStyle={{ margin: 0, padding: '0 16px' }}
            type="editable-card"
            onEdit={(targetKey, action) => {
              if (action === 'remove' && typeof targetKey === 'string') {
                deleteTab(targetKey);
              }
            }}
          >
            {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
              <TabPane 
                tab={category} 
                key={category} 
                style={{ height: '100%', width: '100%' }}
                closable={true}
              >
                {renderTableForCategory(category, categoryItems)}
              </TabPane>
            ))}
          </Tabs>
        </div>
      ) : (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty 
            description="Chưa có dữ liệu kiểm tra" 
            style={{ margin: 0 }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tab"
        content="Bạn có chắc chắn muốn xóa tab"
        itemName={categoryToDelete}
        loading={deleteLoading}
        size="medium"
      />
    </div>
  );
};

export default ChecklistDetailTableWithTabs; 