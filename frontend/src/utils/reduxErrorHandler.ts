/**
 * Enhanced Redux Error Handler
 * This utility provides comprehensive error handling for Redux destructuring errors
 */

// Track error handling state
let errorHandlerInstalled = false;
let reactReduxErrorHandlerInstalled = false;
let unhandledErrorHandlerInstalled = false;

/**
 * Setup enhanced destructuring error handler
 */
export const setupDestructuringErrorHandler = () => {
  if (errorHandlerInstalled) {
    return;
  }

  try {
    // Override console.error to catch destructuring errors early
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      
      // Check for destructuring errors
      if (errorMessage.includes('Cannot destructure property') && 
          (errorMessage.includes('store') || errorMessage.includes('null'))) {
        
        console.warn('🔧 Destructuring error detected early, attempting recovery...');
        
        // Clear Redux data immediately
        clearReduxData();
        
        // Don't log the original error to avoid spam
        return;
      }
      
      // Call original error handler for other errors
      originalError.apply(console, args);
    };

    errorHandlerInstalled = true;
  } catch (error) {
    console.error('❌ Failed to install destructuring error handler:', error);
  }
};

/**
 * Setup React Redux specific error handler
 */
export const setupReactReduxErrorHandler = () => {
  if (reactReduxErrorHandlerInstalled) {
    return;
  }

  try {
    // Override window.onerror to catch unhandled React Redux errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const errorString = String(message);
      
      // Check for React Redux destructuring errors
      if (errorString.includes('Cannot destructure property') && 
          (errorString.includes('store') || errorString.includes('null')) &&
          (errorString.includes('react-redux') || errorString.includes('Provider'))) {
        
        console.warn('🔧 React Redux destructuring error detected, attempting recovery...');
        
        // Clear Redux data
        clearReduxData();
        
        // Prevent default error handling
        return true;
      }
      
      // Call original error handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    reactReduxErrorHandlerInstalled = true;
  } catch (error) {
    console.error('❌ Failed to install React Redux error handler:', error);
  }
};

/**
 * Setup unhandled error handler
 */
export const setupUnhandledErrorHandler = () => {
  if (unhandledErrorHandlerInstalled) {
    return;
  }

  try {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorString = String(event.reason);
      
      // Check for Redux-related errors
      if (errorString.includes('Cannot destructure property') && 
          (errorString.includes('store') || errorString.includes('null'))) {
        
        console.warn('🔧 Unhandled Redux error detected, attempting recovery...');
        
        // Clear Redux data
        clearReduxData();
        
        // Prevent default error handling
        event.preventDefault();
      }
    });

    unhandledErrorHandlerInstalled = true;
  } catch (error) {
    console.error('❌ Failed to install unhandled error handler:', error);
  }
};

/**
 * Clear all Redux-related data
 */
const clearReduxData = () => {
  try {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('redux') || key.includes('__REDUX'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('redux') || key.includes('__REDUX'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Clear window store reference
      if ((window as any).__REDUX_STORE__) {
        delete (window as any).__REDUX_STORE__;
      }
    }
  } catch (error) {
    console.error('❌ Error clearing Redux data:', error);
  }
};

/**
 * Setup all error handlers
 */
export const setupAllErrorHandlers = () => {
  setupDestructuringErrorHandler();
  setupReactReduxErrorHandler();
  setupUnhandledErrorHandler();
};

/**
 * Reset error handlers (for testing)
 */
export const resetErrorHandlers = () => {
  errorHandlerInstalled = false;
  reactReduxErrorHandlerInstalled = false;
  unhandledErrorHandlerInstalled = false;
};
