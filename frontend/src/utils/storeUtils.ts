import store from '../store';

/**
 * Enhanced store access with comprehensive error handling
 * This utility helps prevent destructuring errors when the store is not properly initialized
 */
export const getStore = () => {
  try {
    if (!store) {
      console.error('Redux store is null or undefined');
      throw new Error('Redux store is not available');
    }
    
    // Validate store methods
    if (typeof store.getState !== 'function') {
      console.error('Redux store missing getState method');
      throw new Error('Redux store is corrupted - missing getState method');
    }
    
    if (typeof store.dispatch !== 'function') {
      console.error('Redux store missing dispatch method');
      throw new Error('Redux store is corrupted - missing dispatch method');
    }
    
    // Test store functionality
    try {
      const testState = store.getState();
      if (!testState) {
        console.error('Redux store getState returned null');
        throw new Error('Redux store getState returned null');
      }
    } catch (testError) {
      console.error('Redux store getState test failed:', testError);
      throw new Error(`Redux store test failed: ${testError.message}`);
    }
    
    return store;
  } catch (error) {
    console.error('Error accessing Redux store:', error);
    
    // Clear corrupted data and attempt recovery
    clearReduxDevToolsData();
    resetSessionFlags();
    
    throw error;
  }
};

/**
 * Safely get the current state from the Redux store with enhanced error handling
 */
export const getCurrentState = () => {
  try {
    const storeInstance = getStore();
    const state = storeInstance.getState();
    
    // Validate state structure
    if (!state || typeof state !== 'object') {
      throw new Error('Store state is not a valid object');
    }
    
    // Check for required state keys
    const requiredKeys = ['auth', 'projects', 'documents', 'tasks', 'users', 'ui', 'permissions'];
    const missingKeys = requiredKeys.filter(key => !(key in state));
    
    if (missingKeys.length > 0) {
      console.warn('Missing state keys:', missingKeys);
    }
    
    return state;
  } catch (error) {
    console.error('Error getting current state:', error);
    
    // If it's a destructuring error, clear data and reload
    if (error.message.includes('Cannot destructure') || error.message.includes('null')) {
      console.error('Destructuring error detected - clearing Redux data');
      clearReduxDevToolsData();
      resetSessionFlags();
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    throw error;
  }
};

/**
 * Safely dispatch an action to the Redux store with validation
 */
export const safeDispatch = (action: any) => {
  try {
    // Validate action
    if (!action || typeof action !== 'object') {
      throw new Error('Invalid action: must be an object');
    }
    
    if (!action.type) {
      throw new Error('Invalid action: missing type property');
    }
    
    const storeInstance = getStore();
    const result = storeInstance.dispatch(action);
    
    // Validate dispatch result
    if (result && typeof result.then === 'function') {
      // Handle async actions
      return result.catch((error: any) => {
        console.error('Async action dispatch error:', error);
        throw error;
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error dispatching action:', error);
    
    // Handle destructuring errors
    if (error.message.includes('Cannot destructure') || error.message.includes('null')) {
      console.error('Destructuring error in dispatch - clearing Redux data');
      clearReduxDevToolsData();
      resetSessionFlags();
    }
    
    throw error;
  }
};

/**
 * Enhanced store initialization check with comprehensive validation
 */
export const isStoreInitialized = () => {
  try {
    // Basic checks
    if (!store) {
      return false;
    }
    
    if (typeof store.getState !== 'function') {
      return false;
    }
    
    if (typeof store.dispatch !== 'function') {
      return false;
    }
    
    // Test store functionality
    const state = store.getState();
    if (!state || typeof state !== 'object') {
      return false;
    }
    
    // Check for basic state structure
    const requiredKeys = ['auth', 'projects', 'documents', 'tasks', 'users', 'ui', 'permissions'];
    const hasRequiredKeys = requiredKeys.every(key => key in state);
    
    return hasRequiredKeys;
  } catch (error) {
    console.error('Error checking store initialization:', error);
    return false;
  }
};

/**
 * Enhanced wait for store with better error handling and recovery
 */
export const waitForStore = (timeout = 5000): Promise<typeof store> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkStore = () => {
      try {
        if (isStoreInitialized()) {
          resolve(store);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          console.error('Store initialization timeout');
          
          // Attempt recovery before rejecting
          clearReduxDevToolsData();
          resetSessionFlags();
          
          reject(new Error('Store initialization timeout - data cleared for recovery'));
          return;
        }
        
        setTimeout(checkStore, 100);
      } catch (error) {
        console.error('Error in waitForStore:', error);
        
        if (Date.now() - startTime > timeout) {
          reject(error);
          return;
        }
        
        setTimeout(checkStore, 100);
      }
    };
    
    checkStore();
  });
};

/**
 * Enhanced Redux DevTools data clearing with better error handling
 */
export const clearReduxDevToolsData = () => {
  try {
    if (typeof window !== 'undefined') {
      // Clear Redux DevTools extension data
      localStorage.removeItem('redux-devtools-extension');
      sessionStorage.removeItem('redux-devtools-extension');
      
      // Clear any other Redux-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('redux') || key.includes('devtools') || key.includes('__REDUX'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log('Removed localStorage key:', key);
        } catch (error) {
          console.warn('Error removing localStorage key:', key, error);
        }
      });
      
      // Clear sessionStorage as well
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('redux') || key.includes('devtools') || key.includes('__REDUX'))) {
          sessionKeysToRemove.push(key);
        }
      }
      
      sessionKeysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
          console.log('Removed sessionStorage key:', key);
        } catch (error) {
          console.warn('Error removing sessionStorage key:', key, error);
        }
      });
      
      // Disconnect Redux DevTools if available
      if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
        try {
          (window as any).__REDUX_DEVTOOLS_EXTENSION__.disconnect();
          console.log('Disconnected Redux DevTools');
        } catch (error) {
          console.warn('Error disconnecting Redux DevTools:', error);
        }
      }
      
      // Clear window references
      try {
        delete (window as any).__REDUX_STORE__;
        delete (window as any).__REDUX_DEVTOOLS_EXTENSION__;
      } catch (error) {
        console.warn('Error clearing window references:', error);
      }
      
      console.log('Redux DevTools data cleared successfully');
    }
  } catch (error) {
    console.warn('Error clearing Redux DevTools data:', error);
  }
};

/**
 * Enhanced store reset with better error handling
 */
export const resetStore = () => {
  try {
    const storeInstance = getStore();
    // Dispatch a reset action to all reducers
    storeInstance.dispatch({ type: 'RESET_STORE' });
    console.log('Store reset successfully');
  } catch (error) {
    console.error('Error resetting store:', error);
    
    // If reset fails, clear data and reload
    if (error.message.includes('Cannot destructure') || error.message.includes('null')) {
      console.error('Destructuring error in reset - clearing data and reloading');
      clearReduxDevToolsData();
      resetSessionFlags();
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
};

/**
 * Enhanced session flags reset with better error handling
 */
export const resetSessionFlags = () => {
  try {
    if (typeof window !== 'undefined') {
      const flagsToRemove = [
        'redux_error_cleared',
        'app_initialized',
        'app_reload_attempted',
        'store_initialization_error',
        'redux_devtools_error'
      ];
      
      flagsToRemove.forEach(flag => {
        try {
          sessionStorage.removeItem(flag);
          console.log('Removed session flag:', flag);
        } catch (error) {
          console.warn('Error removing session flag:', flag, error);
        }
      });
      
      console.log('Session flags reset successfully');
    }
  } catch (error) {
    console.warn('Error resetting session flags:', error);
  }
};

/**
 * Enhanced store state debugging with better error handling
 */
export const debugStoreState = () => {
  try {
    const storeInstance = getStore();
    const state = storeInstance.getState();
    
    console.group('🔍 Redux Store Debug');
    console.log('Store initialized:', !!storeInstance);
    console.log('State keys:', Object.keys(state));
    console.log('Current state:', state);
    
    // Check for potential issues
    const stateKeys = Object.keys(state);
    const expectedKeys = ['auth', 'projects', 'documents', 'tasks', 'users', 'ui', 'permissions'];
    const missingKeys = expectedKeys.filter(key => !stateKeys.includes(key));
    
    if (missingKeys.length > 0) {
      console.warn('Missing state keys:', missingKeys);
    }
    
    // Test serialization
    try {
      JSON.stringify(state);
      console.log('State is serializable');
    } catch (serializeError) {
      console.error('State contains circular references:', serializeError);
    }
    
    console.groupEnd();
    
    return state;
  } catch (error) {
    console.error('Error debugging store state:', error);
    
    // Handle destructuring errors
    if (error.message.includes('Cannot destructure') || error.message.includes('null')) {
      console.error('Destructuring error in debug - clearing data');
      clearReduxDevToolsData();
      resetSessionFlags();
    }
    
    return null;
  }
};
