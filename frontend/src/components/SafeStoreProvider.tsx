import React, { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface SafeStoreProviderProps {
  children: ReactNode;
}

const SafeStoreProvider: React.FC<SafeStoreProviderProps> = ({ children }) => {
  const [storeStatus, setStoreStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Use useSelector hooks at the component level
  const auth = useSelector((state: RootState) => state.auth);
  const projects = useSelector((state: RootState) => state.projects);
  const documents = useSelector((state: RootState) => state.documents);
  const tasks = useSelector((state: RootState) => state.tasks);
  const users = useSelector((state: RootState) => state.users);
  const ui = useSelector((state: RootState) => state.ui);
  // Removed permissions from store

  useEffect(() => {
    const validateStore = async () => {
      try {
        // Add a small delay to ensure Redux is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test store access by checking if state slices are accessible
        if (auth === undefined || projects === undefined || documents === undefined || 
            tasks === undefined || users === undefined || ui === undefined) {
          throw new Error('Some state slices are undefined');
        }
        
        // Verify store is accessible via window
        if (typeof window !== 'undefined') {
          const windowStore = (window as any).__REDUX_STORE__;
          if (!windowStore) {
            console.warn('⚠️ Store not found in window.__REDUX_STORE__, but continuing...');
          }
        }
        
        setStoreStatus('ready');
        
      } catch (err) {
        console.error('❌ SafeStoreProvider - Store validation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStoreStatus('error');
      }
    };

    // Add a small delay to ensure store is fully initialized
    const timer = setTimeout(() => {
      validateStore();
    }, 200);

    return () => clearTimeout(timer);
  }, [auth, projects, documents, tasks, users, ui]);

  // Show loading state
  if (storeStatus === 'loading') {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '50px auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#007bff', marginBottom: '20px' }}>
          🔧 Validating Application
        </h2>
        <p style={{ color: '#6c757d', marginBottom: '15px' }}>
          Validating the application state management system...
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e9ecef',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error state
  if (storeStatus === 'error') {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '50px auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
          🔧 Store Validation Error
        </h2>
        <p style={{ color: '#6c757d', marginBottom: '15px' }}>
          The application state management system validation failed.
        </p>
        {error && (
          <p style={{ color: '#dc3545', marginBottom: '15px', fontSize: '14px' }}>
            Error: {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🔄 Reload Page
          </button>
          <button 
            onClick={() => {
              // Clear Redux data
              try {
                // Clear localStorage
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.includes('redux') || key.includes('__REDUX'))) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Clear sessionStorage
                const sessionKeysToRemove = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                  const key = sessionStorage.key(i);
                  if (key && (key.includes('redux') || key.includes('__REDUX'))) {
                    sessionKeysToRemove.push(key);
                  }
                }
                sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
                
                // Clear window store reference
                if ((window as any).__REDUX_STORE__) {
                  delete (window as any).__REDUX_STORE__;
                }
              } catch (clearError) {
                console.error('Failed to clear Redux data:', clearError);
              }
              window.location.reload();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🧹 Clear Data & Reload
          </button>
        </div>
      </div>
    );
  }

  // Store is ready, render children
  return <>{children}</>;
};

export default SafeStoreProvider;
