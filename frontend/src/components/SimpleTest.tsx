import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Test Component</h1>
      <p>This is a simple test component to check if rendering works.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default SimpleTest;
