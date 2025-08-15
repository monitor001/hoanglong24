import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';
import { message, Button, Space, Popconfirm } from 'antd';
import { DeleteOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import './ExcelLikeTable.css';

// Register all Handsontable modules
registerAllModules();

interface ExcelLikeTableProps {
  data: any[];
  columns: any[];
  onDataChange?: (data: any[]) => void;
  onAddRow?: (index: number, count?: number) => void;
  onRemoveRow?: (index: number) => void;
  onRemoveColumn?: (columnIndex: number, columnKey: string) => void;
  onResizeTable?: (width: number, height: number) => void;
  resizable?: boolean;
  showColumnControls?: boolean;
}

const ExcelLikeTable: React.FC<ExcelLikeTableProps> = ({
  data,
  columns,
  onDataChange,
  onAddRow,
  onRemoveRow,
  onRemoveColumn,
  onResizeTable,
  resizable = true,
  showColumnControls = false // Mặc định bỏ icon xóa cột
}) => {
  const hotTableRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [tableWidth, setTableWidth] = useState<number | undefined>(undefined);
  const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);

  // Transform data to Handsontable format (array of arrays)
  const transformedData = useMemo(() => {
    console.log('🔄 Transforming data...', { data, columns });
    
    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return [];
    }
    
    if (!Array.isArray(columns)) {
      console.error('Columns is not an array:', columns);
      return [];
    }
    
    return data.map(row => {
      return columns.map(col => {
        const key = col.dataIndex || col.key;
        const value = row[key];
        
        if (col.dataIndex === 'isChecked') {
          return Boolean(value);
        } else if (col.dataIndex === 'order') {
          return typeof value === 'number' ? value : parseInt(value) || 1;
        } else {
          return value || '';
        }
      });
    });
  }, [data, columns]);

  // Transform columns to Handsontable format with resize support
  const transformedColumns = useMemo(() => {
    return columns.map(col => {
      const columnDef: any = {
        data: columns.indexOf(col),
        title: col.title || col.key,
        width: col.width || 150,
        resizable: col.resizable !== false // Mặc định cho phép resize
      };

      if (col.dataIndex === 'isChecked') {
        columnDef.type = 'checkbox';
      }

      // Bỏ đánh số tự động cho cột STT
      if (col.dataIndex === 'order') {
        columnDef.readOnly = true; // Không cho phép chỉnh sửa cột STT
        columnDef.renderer = function(instance: any, td: any, row: number, col: number, prop: any, value: any) {
          td.innerHTML = String(row + 1); // Đảm bảo convert sang string
          td.style.textAlign = 'center';
          td.className = 'htDimmed'; // Thêm class để styling
          return td;
        };
      }

      return columnDef;
    });
  }, [columns]);

  // Handle column removal
  const handleRemoveColumn = useCallback((columnIndex: number) => {
    const column = columns[columnIndex];
    const columnKey = column.dataIndex || column.key;
    
    if (onRemoveColumn) {
      onRemoveColumn(columnIndex, columnKey);
      message.success(`Đã xóa cột "${column.title || columnKey}"`);
    } else {
      message.warning('Chức năng xóa cột chưa được cấu hình');
    }
  }, [columns, onRemoveColumn]);

  // Handle table resize
  const handleResizeTable = useCallback((width: number, height: number) => {
    setTableWidth(width);
    setTableHeight(height);
    
    if (onResizeTable) {
      onResizeTable(width, height);
    }
    
    // Update Handsontable instance
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance) {
      hotInstance.refreshDimensions();
    }
  }, [onResizeTable]);

  // Resize handlers
  const startResize = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;
    
    // Minimum size constraints
    const minWidth = 400;
    const minHeight = 300;
    
    if (newWidth >= minWidth && newHeight >= minHeight) {
      handleResizeTable(newWidth, newHeight);
    }
  }, [isResizing, handleResizeTable]);

  // Add mouse move listener for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing, handleMouseMove, stopResize]);

  // Handle paste with automatic row expansion
  const handlePaste = useCallback((data: any[], coords: any[]) => {
    console.log('🔄 ===== PASTE HANDLER START =====');
    console.log('📋 Paste data:', { 
      dataLength: data?.length, 
      dataSample: data?.slice(0, 3),
      coords: coords 
    });
    
    if (!data || data.length === 0 || !coords || coords.length === 0) {
      console.log('❌ Invalid paste data or coordinates, allowing default paste');
      return true; // Cho phép paste tiếp tục
    }
    
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) {
      console.log('❌ No hot instance available, allowing default paste');
      return true;
    }
    
    try {
      const currentRowCount = hotInstance.countRows();
      const pasteRowCount = data.length;
      
      // Lấy vị trí bắt đầu paste
      const startRow = coords[0]?.startRow || coords[0]?.start?.row || 0;
      const endRow = startRow + pasteRowCount;
      
      console.log('📊 Paste analysis:', {
        currentRowCount,
        pasteRowCount,
        startRow,
        endRow,
        needsMoreRows: endRow > currentRowCount,
        currentDataLength: data?.length,
        columnsCount: columns?.length
      });
      
      // Nếu cần thêm dòng mới
      if (endRow > currentRowCount) {
        const rowsToAdd = endRow - currentRowCount;
        console.log(`🔄 Need to add ${rowsToAdd} rows`);
        console.log(`📍 Adding rows from position ${currentRowCount} to ${endRow - 1}`);
        
        // Thêm dòng trực tiếp vào Handsontable trước
        console.log('🔧 Calling hotInstance.alter("insert_row", ...)');
        hotInstance.alter('insert_row', currentRowCount, rowsToAdd);
        console.log('✅ Rows added to Handsontable');
        
        // Tạo dữ liệu mới cho các dòng cần thêm
        console.log('🏗️ Creating new row data...');
        const newRows = Array(rowsToAdd).fill(null).map((_, index) => {
          const newRow: any = {};
          columns.forEach(col => {
            const key = col.dataIndex || col.key;
            if (key === 'isChecked') {
              newRow[key] = false;
            } else if (key === 'order') {
              newRow[key] = currentRowCount + index + 1;
            } else {
              newRow[key] = '';
            }
          });
          return newRow;
        });
        
        console.log('📝 New rows created:', newRows);
        
        // Let Handsontable handle the paste and then onDataChange will process the new data
        console.log('✅ Rows added to Handsontable, letting onDataChange handle the rest');
        
        // Don't call onAddRow here - let onDataChange handle everything
        console.log('ℹ️ Skipping onAddRow call - onDataChange will handle new rows');
        
        // Don't call onDataChange here either - let the afterChange hook handle it
        console.log('ℹ️ Skipping onDataChange call - afterChange will handle data updates');
        
        console.log(`✅ Successfully processed paste with ${rowsToAdd} new rows`);
      } else {
        console.log('ℹ️ No additional rows needed for paste');
      }
      
      console.log('🔄 ===== PASTE HANDLER END =====');
      return true; // Cho phép paste
    } catch (error) {
      console.error('❌ Error in paste handler:', error);
      console.error('❌ Error details:', {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack
      });
      return true;
    }
  }, [columns, data, onDataChange, onAddRow]); // Add onAddRow to dependencies

  // Simple data change handler with debouncing to prevent request aborted
  const handleDataChange = useCallback((changes: any[] | null, source: string) => {
    console.log('📝 Data change detected:', { changes, source });
    
    if (source === 'loadData' || !changes || changes.length === 0) {
      return;
    }

    console.log('🔄 Processing changes:', changes);

    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) {
      console.log('❌ No hot instance found');
      return;
    }

    try {
      const newData = hotInstance.getData();
      console.log('📊 New data from hot instance:', newData);
      
      // Validate newData is an array
      if (!Array.isArray(newData)) {
        console.error('❌ New data is not an array:', newData);
        return;
      }
      
      // Transform back to original format with proper error handling
      const transformedData = newData.map((row: any[], index: number) => {
        if (!Array.isArray(row)) {
          console.warn(`❌ Row ${index} is not an array:`, row);
          return {};
        }
        
        const originalRow = data[index] || {};
        const transformedRow: any = { ...originalRow };
        
        columns.forEach((col, colIndex) => {
          const key = col.dataIndex || col.key;
          const newValue = row[colIndex];
          
          if (key) {
            if (col.dataIndex === 'isChecked') {
              transformedRow[key] = Boolean(newValue);
            } else if (col.dataIndex === 'order') {
              transformedRow[key] = typeof newValue === 'number' ? newValue : parseInt(newValue) || 1;
            } else {
              transformedRow[key] = newValue;
            }
          }
        });
        
        return transformedRow;
      });

      console.log('🔄 Calling onDataChange with:', transformedData);
      
      // Use setTimeout to debounce rapid changes and prevent request aborted
      setTimeout(() => {
        try {
          onDataChange?.(transformedData);
        } catch (error) {
          console.error('❌ Error in onDataChange callback:', error);
          message.error('Lỗi khi cập nhật dữ liệu. Vui lòng thử lại.');
        }
      }, 100); // 100ms debounce
      
    } catch (error) {
      console.error('❌ Error updating data:', error);
      message.error('Không thể cập nhật dữ liệu. Vui lòng thử lại.');
    }
  }, [columns, onDataChange, data]);

  // Enhanced hot settings with context menu and editing features
  const hotSettings = useMemo(() => {
    const contextMenuItems: any = {
      'row_above': {
        name: 'Thêm dòng phía trên'
      },
      'row_below': {
        name: 'Thêm dòng phía dưới'
      },
      'remove_row': {
        name: 'Xóa dòng'
      },
      'separator1': {},
      'copy': {
        name: 'Sao chép'
      },
      'cut': {
        name: 'Cắt'
      },
      'paste': {
        name: 'Dán'
      },
      'separator2': {},
      'undo': {
        name: 'Hoàn tác'
      },
      'redo': {
        name: 'Làm lại'
      },
      'separator3': {},
      'alignment': {
        name: 'Căn chỉnh'
      },
      'filter_by_condition': {
        name: 'Lọc theo điều kiện'
      },
      'filter_action_bar': {
        name: 'Thanh lọc'
      }
    };

    // Add column operations only if showColumnControls is true
    if (showColumnControls) {
      contextMenuItems.separator4 = {};
      contextMenuItems.remove_column = {
        name: 'Xóa cột',
        callback: function(key: string, selection: any[], clickEvent: any) {
          const selectedColumns = selection[0]?.start.col !== undefined ? 
            [selection[0].start.col] : [];
          
          if (selectedColumns.length > 0) {
            const columnIndex = selectedColumns[0];
            handleRemoveColumn(columnIndex);
          }
        }
      };
    }

    const settings = {
      data: transformedData,
      colHeaders: transformedColumns.map(col => col.title),
      columns: transformedColumns,
      rowHeaders: true,
      width: tableWidth || '100%',
      height: tableHeight || 'auto',
      licenseKey: 'non-commercial-and-evaluation',
      readOnly: false,
      // Context menu
      contextMenu: {
        items: contextMenuItems
      },
      // Editing features
      enterBeginsEditing: true,
      enterMoves: { row: 1, col: 0 },
      tabMoves: { row: 0, col: 1 },
      // Copy/paste with enhanced features
      copyPaste: {
        pasteMode: 'overwrite' as const, // Overwrite existing data
        rowHeaderWidth: 0, // Don't copy row headers
        uiContainer: document.body, // Container for paste UI
        beforePaste: (data: any[], coords: any[]) => {
          console.log('Before paste:', { data, coords });
          // Gọi hàm xử lý paste tùy chỉnh
          return handlePaste(data, coords);
        },
        beforeCopy: (data: any[], coords: any[]) => {
          console.log('Before copy:', { data, coords });
          return true; // Allow copy
        }
      },
      // Undo/redo
      undo: true,
      // Auto-wrap text
      autoWrapRow: true,
      // Stretch columns
      stretchH: 'all' as const,
      // Allow row/column operations
      allowInsertRow: true,
      allowRemoveRow: true,
      allowInsertColumn: false, // Không cho phép thêm cột mới
      allowRemoveColumn: showColumnControls, // Chỉ cho phép xóa cột nếu showColumnControls = true
      // Column resize
      colWidths: transformedColumns.map(col => col.width),
      manualColumnResize: true, // Cho phép resize cột bằng chuột
      manualRowResize: true,    // Cho phép resize hàng bằng chuột
      rowHeights: 30,           // Chiều cao mặc định của hàng
      // Cell rendering
      cells: function(row: number, col: number) {
        const columnDef = transformedColumns[col];
        if (columnDef && columnDef.type === 'checkbox') {
          return {
            type: 'checkbox',
            className: 'htCenter htMiddle',
            readOnly: false
          };
        }
        return {
          readOnly: false,
          className: 'htMiddle'
        };
      },
      // Event handlers
      afterChange: handleDataChange,
      afterRemoveRow: (index: number, amount: number) => {
        onRemoveRow?.(index);
      },
      afterCreateRow: (index: number, amount: number) => {
        onAddRow?.(index);
      },
      afterRemoveColumn: (index: number, amount: number) => {
        // This will be handled by the context menu callback
      },
      // Column resize event
      afterColumnResize: (currentColumn: number, newSize: number, isDoubleClick: boolean) => {
        console.log(`Column ${currentColumn} resized to ${newSize}px`);
        // Có thể lưu kích thước cột vào localStorage hoặc state
      },
      // Row resize event
      afterRowResize: (currentRow: number, newSize: number, isDoubleClick: boolean) => {
        console.log(`Row ${currentRow} resized to ${newSize}px`);
      },
      // Paste event handler - chỉ log để debug
      afterPaste: (data: any[], coords: any[]) => {
        console.log('✅ Paste completed:', { dataLength: data?.length, coords });
      },
      // Copy event handler
      beforeCopy: (data: any[], coords: any[]) => {
        console.log('Copy event:', { data, coords });
        return true; // Allow copy
      }
    };
    
    console.log('⚙️ Hot settings:', { 
      readOnly: settings.readOnly, 
      dataLength: settings.data.length,
      columnsLength: settings.columns.length,
      hasContextMenu: !!settings.contextMenu,
      width: settings.width,
      height: settings.height,
      showColumnControls
    });
    
         return settings;
   }, [transformedData, transformedColumns, handleDataChange, handlePaste, onRemoveRow, onAddRow, showColumnControls, handleRemoveColumn, tableWidth, tableHeight]);

  useEffect(() => {
    console.log('🎯 Table mounted, checking instance...');
    const checkInstance = () => {
      const hotInstance = hotTableRef.current?.hotInstance;
      if (hotInstance) {
        console.log('✅ Hot instance found:', {
          isReadOnly: hotInstance.getSettings().readOnly,
          data: hotInstance.getData()
        });
      } else {
        console.log('❌ No hot instance yet');
      }
    };

    checkInstance();
    const timeoutId = setTimeout(checkInstance, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [transformedData]);

  return (
    <div 
      ref={containerRef}
      className={`excel-table-container ${resizable ? 'resizable' : ''}`}
      style={{ 
        width: tableWidth || '100%', 
        height: tableHeight || '100%'
      }}
    >
      {/* Column Controls - chỉ hiển thị khi showColumnControls = true */}
      {showColumnControls && (
        <div className="column-controls">
          <Space size="small">
            {columns.map((column, index) => (
              <Button
                key={index}
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                title={`Xóa cột ${column.title || column.key}`}
                style={{ color: '#ff4d4f' }}
                onClick={() => handleRemoveColumn(index)}
              />
            ))}
          </Space>
        </div>
      )}

      {/* Resize Handle */}
      {resizable && (
        <div
          className="resize-handle"
          onMouseDown={startResize}
          title="Kéo để thay đổi kích thước bảng"
        />
      )}

      {/* Resize Indicator */}
      <div className={`resize-indicator ${isResizing ? 'show' : ''}`}>
        {tableWidth && tableHeight ? `${Math.round(tableWidth)}px × ${Math.round(tableHeight)}px` : 'Đang thay đổi kích thước...'}
      </div>

      <HotTable
        ref={hotTableRef}
        settings={hotSettings}
      />
    </div>
  );
};

export default ExcelLikeTable; 