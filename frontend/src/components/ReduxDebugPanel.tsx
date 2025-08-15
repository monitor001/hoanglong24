import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getStore, isStoreReady, clearReduxData } from '../utils/storeAccess';

const ReduxDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [storeHealth, setStoreHealth] = useState<any>(null);
  
  // Get current state from store
  const currentState = useSelector((state: RootState) => state);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Update debug info when state changes
    const updateDebugInfo = () => {
      try {
        const store = getStore();
        if (store) {
          const state = store.getState();
          const info = {
            stateKeys: Object.keys(state),
            stateSize: JSON.stringify(state).length,
            hasGetState: typeof store.getState === 'function',
            hasDispatch: typeof store.dispatch === 'function',
            hasSubscribe: typeof store.subscribe === 'function'
          };
          setDebugInfo(info);
        }
        
        const health = {
          storeReady: isStoreReady(),
          windowStore: !!(window as any).__REDUX_STORE__,
          localStorageKeys: Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(key => key && (key.includes('redux') || key.includes('__REDUX'))),
          sessionStorageKeys: Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i)).filter(key => key && (key.includes('redux') || key.includes('__REDUX')))
        };
        setStoreHealth(health);
      } catch (error) {
        console.error('Error updating debug info:', error);
        setDebugInfo({ error: error.message });
        setStoreHealth({ error: error.message });
      }
    };

    updateDebugInfo();
    
    // Update every 5 seconds
    const interval = setInterval(updateDebugInfo, 5000);
    
    return () => clearInterval(interval);
  }, [currentState]);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Floating debug button */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: isVisible ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Redux Debug Panel"
        >
          🔧
        </button>
        
        <button
          onClick={() => clearReduxData()}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#ffc107',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Clear Redux Data"
        >
          🧹
        </button>
      </div>

      {/* Debug panel */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '400px',
            maxHeight: '80vh',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10000,
            overflow: 'auto',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>🔧 Redux Debug Panel</h3>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
          </div>

          {/* Store Health */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Store Health</h4>
            {storeHealth ? (
              <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                <div>Store Ready: {storeHealth.storeReady ? '✅' : '❌'}</div>
                <div>Window Store: {storeHealth.windowStore ? '✅' : '❌'}</div>
                <div>LocalStorage Keys: {storeHealth.localStorageKeys?.length || 0}</div>
                <div>SessionStorage Keys: {storeHealth.sessionStorageKeys?.length || 0}</div>
                {storeHealth.error && (
                  <div style={{ color: '#dc3545' }}>Error: {storeHealth.error}</div>
                )}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>

          {/* Store Info */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Store Info</h4>
            {debugInfo ? (
              <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                <div>State Keys: {debugInfo.stateKeys?.join(', ') || 'None'}</div>
                <div>State Size: {debugInfo.stateSize || 0} chars</div>
                <div>getState: {debugInfo.hasGetState ? '✅' : '❌'}</div>
                <div>dispatch: {debugInfo.hasDispatch ? '✅' : '❌'}</div>
                <div>subscribe: {debugInfo.hasSubscribe ? '✅' : '❌'}</div>
                {debugInfo.error && (
                  <div style={{ color: '#dc3545' }}>Error: {debugInfo.error}</div>
                )}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>

          {/* Current State */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Current State</h4>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', maxHeight: '200px', overflow: 'auto' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(currentState, null, 2)}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                clearReduxData();
                window.location.reload();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReduxDebugPanel;
