import React from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';

// Register all Handsontable modules
registerAllModules();

const SimpleTestTable: React.FC = () => {
  const data = [
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3']
  ];

  const settings = {
    data: data,
    colHeaders: ['Column 1', 'Column 2', 'Column 3'],
    rowHeaders: true,
    width: '100%',
    height: 300,
    licenseKey: 'non-commercial-and-evaluation',
    readOnly: false,
    afterChange: (changes: any, source: string) => {
      console.log('Simple Test - Data changed:', { changes, source });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '3px solid red', 
      margin: '20px', 
      backgroundColor: '#fff2f0',
      minHeight: '400px'
    }}>
      <h1 style={{ color: 'red', textAlign: 'center' }}>🧪 SIMPLE TEST TABLE</h1>
      <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
        Nếu bạn thấy bảng này, Handsontable đang hoạt động!
      </p>
      
      <div style={{ border: '2px solid blue', padding: '10px', backgroundColor: 'white' }}>
        <HotTable settings={settings} />
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>Hướng dẫn:</strong></p>
        <p>• Double-click vào ô để edit</p>
        <p>• Nhấn Enter để edit</p>
        <p>• Right-click để menu</p>
      </div>
    </div>
  );
};

export default SimpleTestTable; 