import React, { useRef, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';
import './TestHandsontable.css';

// Register all Handsontable modules
registerAllModules();

const TestHandsontable: React.FC = () => {
  const hotTableRef = useRef<any>(null);

  // Test data đơn giản - giống như SimpleTestTable
  const testData = [
    ['Test 1', 'Value 1', true],
    ['Test 2', 'Value 2', false],
    ['Test 3', 'Value 3', true]
  ];

  // Settings đơn giản - giống như SimpleTestTable
  const hotSettings = {
    data: testData,
    colHeaders: ['Tên', 'Giá trị', 'Trạng thái'],
    rowHeaders: true,
    width: '100%',
    height: 300,
    licenseKey: 'non-commercial-and-evaluation',
    readOnly: false,
    afterChange: (changes: any, source: string) => {
      console.log('🔧 Test Table - Data changed:', { changes, source });
      if (hotTableRef.current?.hotInstance) {
        const newData = hotTableRef.current.hotInstance.getData();
        console.log('🔧 Test Table - New data:', newData);
      }
    }
  };

  useEffect(() => {
    console.log('🔧 Test Table - Component mounted');
    const checkInstance = () => {
      const hotInstance = hotTableRef.current?.hotInstance;
      if (hotInstance) {
        console.log('🔧 Test Table - Instance found:', {
          isReadOnly: hotInstance.getSettings().readOnly,
          data: hotInstance.getData()
        });
      } else {
        console.log('🔧 Test Table - No instance yet');
      }
    };

    checkInstance();
    const timeoutId = setTimeout(checkInstance, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #1890ff', 
      margin: '20px', 
      backgroundColor: '#f0f8ff'
    }}>
      <h2 style={{ color: '#1890ff' }}>🔧 Test Handsontable Component</h2>
      <p>Đây là bảng test để kiểm tra khả năng edit của Handsontable</p>
      
      <div style={{ border: '2px solid #52c41a', padding: '10px', backgroundColor: 'white' }}>
        <HotTable
          ref={hotTableRef}
          settings={hotSettings}
        />
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <h3 style={{ color: '#52c41a' }}>Hướng dẫn test:</h3>
        <ul>
          <li>Double-click vào cell để edit</li>
          <li>Nhấn Enter để bắt đầu edit</li>
          <li>Nhấn F2 để edit</li>
          <li>Right-click để mở context menu</li>
          <li>Checkbox có thể click</li>
        </ul>
      </div>
    </div>
  );
};

export default TestHandsontable; 