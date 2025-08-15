import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isDestructuringError: boolean;
}

class ReduxErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isDestructuringError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a destructuring error
    const isDestructuringError = error.message.includes('Cannot destructure') || 
                                error.message.includes('null') ||
                                error.message.includes('store');
    
    return { 
      hasError: true, 
      error,
      isDestructuringError 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Check if this is a destructuring error
    const isDestructuringError = error.message.includes('Cannot destructure') || 
                                error.message.includes('null') ||
                                error.message.includes('store');
    
    if (isDestructuringError) {
      console.warn('🔧 Destructuring error detected in Error Boundary, attempting recovery...');
      
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
        
        console.log('✅ Redux data cleared from Error Boundary');
        
        // Reload page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (clearError) {
        console.error('Failed to clear Redux data from Error Boundary:', clearError);
      }
    }
    
    // Log detailed error information
    console.group('🚨 Error Boundary Error Report');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Type:', typeof error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Name:', error.name);
    console.error('Timestamp:', new Date().toISOString());
    console.error('User Agent:', navigator.userAgent);
    console.error('URL:', window.location.href);
    
    // Check Redux store state
    try {
      const store = (window as any).__REDUX_STORE__;
      if (store) {
        console.error('Store exists:', !!store);
        console.error('Store type:', typeof store);
        console.error('Store methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(store)));
      } else {
        console.error('Store not found in window');
      }
    } catch (storeError) {
      console.error('Error checking store:', storeError);
    }
    
    console.groupEnd();
  }

  private handleReloadPage = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isDestructuringError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Special handling for destructuring errors
      if (this.state.isDestructuringError) {
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
              🔧 Redux Store Error
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '15px' }}>
              The application state management system encountered an error.
            </p>
            <p style={{ color: '#6c757d', marginBottom: '25px' }}>
              This has been automatically fixed. The page will reload shortly.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={this.handleReloadPage}
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
                🔄 Reload Now
              </button>
              
              <button 
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🔄 Retry
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  color: '#495057',
                  padding: '10px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px'
                }}>
                  🔍 Error Details (Development)
                </summary>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '12px',
                  marginTop: '10px',
                  border: '1px solid #dee2e6'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        );
      }

      // General error handling
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
            🔧 Application Error
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '15px' }}>
            The application encountered an unexpected error.
          </p>
          <p style={{ color: '#6c757d', marginBottom: '25px' }}>
            Please try reloading the page to resolve this issue.
          </p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={this.handleReloadPage}
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
              onClick={this.handleRetry}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🔄 Retry
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                color: '#495057',
                padding: '10px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px'
              }}>
                🔍 Error Details (Development)
              </summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px',
                border: '1px solid #dee2e6'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ReduxErrorBoundary;
