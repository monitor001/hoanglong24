/**
 * Safe Store Access Utility
 * This utility provides safe access to the Redux store and prevents destructuring errors
 */

import store from '../store';

/**
 * Safely get the Redux store instance
 */
export const getStore = () => {
  try {
    if (!store) {
      console.error('Redux store is not available');
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
    
    if (typeof store.subscribe !== 'function') {
      console.error('Redux store missing subscribe method');
      throw new Error('Redux store is corrupted - missing subscribe method');
    }
    
    // Test store functionality
    try {
      const state = store.getState();
      if (!state || typeof state !== 'object') {
        throw new Error('Store getState returned invalid state');
      }
    } catch (stateError) {
      console.error('Store state test failed:', stateError);
      throw new Error(`Store state test failed: ${stateError.message}`);
    }
    
    return store;
  } catch (error) {
    console.error('Error in getStore:', error);
    
    // If it's a destructuring error, clear data and reload
    if (error.message.includes('Cannot destructure') || error.message.includes('null')) {
      console.error('Destructuring error detected - clearing Redux data');
      clearReduxData();
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    throw error;
  }
};

/**
 * Safely get the current state from the Redux store
 */
export const getState = () => {
  try {
    const storeInstance = getStore();
    const state = storeInstance.getState();
    
    if (!state || typeof state !== 'object') {
      throw new Error('Store state is not a valid object');
    }
    
    return state;
  } catch (error) {
    console.error('Error getting store state:', error);
    
    // If it's a destructuring error, clear data and reload
    if (error.message.includes('Cannot destructure') || error.message.includes('null')) {
      console.error('Destructuring error detected - clearing Redux data');
      clearReduxData();
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    throw error;
  }
};

/**
 * Safely dispatch an action to the Redux store
 */
export const dispatch = (action: any) => {
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
      clearReduxData();
    }
    
    throw error;
  }
};

/**
 * Safely subscribe to store changes
 */
export const subscribe = (listener: () => void) => {
  try {
    const storeInstance = getStore();
    return storeInstance.subscribe(listener);
  } catch (error) {
    console.error('Error subscribing to store:', error);
    
    // Handle destructuring errors
    if (error.message.includes('Cannot destructure') || error.message.includes('null')) {
      console.error('Destructuring error in subscribe - clearing Redux data');
      clearReduxData();
    }
    
    throw error;
  }
};

/**
 * Clear all Redux related data
 */
export const clearReduxData = () => {
  try {
    console.log('🧹 Clearing Redux data...');
    
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
        console.log('🧹 Removed localStorage key:', key);
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
        console.log('🧹 Removed sessionStorage key:', key);
      });
      
      // Clear window store reference
      if ((window as any).__REDUX_STORE__) {
        delete (window as any).__REDUX_STORE__;
        console.log('🧹 Removed window store reference');
      }
      
      console.log('✅ Redux data cleared successfully');
    }
  } catch (error) {
    console.error('❌ Error clearing Redux data:', error);
  }
};

/**
 * Check if store is properly initialized
 */
export const isStoreReady = () => {
  try {
    if (!store) {
      return false;
    }
    
    if (typeof store.getState !== 'function') {
      return false;
    }
    
    if (typeof store.dispatch !== 'function') {
      return false;
    }
    
    if (typeof store.subscribe !== 'function') {
      return false;
    }
    
    const state = store.getState();
    if (!state || typeof state !== 'object') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking store readiness:', error);
    return false;
  }
};

/**
 * Wait for store to be ready
 */
export const waitForStore = (timeout = 5000): Promise<typeof store> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkStore = () => {
      try {
        if (isStoreReady()) {
          resolve(store);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          console.error('Store initialization timeout');
          clearReduxData();
          reject(new Error('Store initialization timeout'));
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

// Export the store directly for backward compatibility
export { store };
