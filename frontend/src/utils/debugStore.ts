import store from '../store';
import { isStoreInitialized, getCurrentState } from './storeUtils';

// Debug utility for Redux store
export const debugStore = {
  // Check if store is properly initialized
  checkStoreHealth: () => {
    try {
      // Check if store exists in window (for development)
      const windowStore = (window as any).__REDUX_STORE__;
      console.log('🔍 Store Debug - Window store:', windowStore);
      
      // Check localStorage for Redux data
      const reduxKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('redux') || key.includes('__REDUX'))) {
          reduxKeys.push(key);
        }
      }
      console.log('🔍 Store Debug - Redux localStorage keys:', reduxKeys);
      
      // Check sessionStorage for Redux data
      const sessionReduxKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('redux') || key.includes('__REDUX'))) {
          sessionReduxKeys.push(key);
        }
      }
      console.log('🔍 Store Debug - Redux sessionStorage keys:', sessionReduxKeys);
      
      return {
        windowStore: !!windowStore,
        localStorageKeys: reduxKeys,
        sessionStorageKeys: sessionReduxKeys
      };
    } catch (error) {
      console.error('🔍 Store Debug - Error checking store health:', error);
      return { error: error.message };
    }
  },

  // Clear all Redux related data
  clearReduxData: () => {
    try {
      console.log('🧹 Clearing Redux data...');
      
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
      return true;
    } catch (error) {
      console.error('❌ Error clearing Redux data:', error);
      return false;
    }
  },

  // Test store functionality
  testStore: (store: any) => {
    try {
      console.log('🧪 Testing store functionality...');
      
      if (!store) {
        console.error('❌ Store is null or undefined');
        return false;
      }
      
      // Test getState
      if (typeof store.getState !== 'function') {
        console.error('❌ Store missing getState method');
        return false;
      }
      
      const state = store.getState();
      console.log('✅ Store getState works, state:', state);
      
      // Test dispatch
      if (typeof store.dispatch !== 'function') {
        console.error('❌ Store missing dispatch method');
        return false;
      }
      
      // Test subscribe
      if (typeof store.subscribe !== 'function') {
        console.error('❌ Store missing subscribe method');
        return false;
      }
      
      console.log('✅ Store functionality test passed');
      return true;
    } catch (error) {
      console.error('❌ Store functionality test failed:', error);
      return false;
    }
  },

  // Monitor store changes
  monitorStore: (store: any) => {
    try {
      console.log('👀 Starting store monitoring...');
      
      const unsubscribe = store.subscribe(() => {
        const state = store.getState();
        console.log('📊 Store state changed:', state);
      });
      
      // Return unsubscribe function
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error monitoring store:', error);
      return null;
    }
  },

  // Get detailed store information
  getStoreInfo: (store: any) => {
    try {
      const state = store.getState();
      const stateKeys = Object.keys(state);
      
      console.log('📋 Store Information:');
      console.log('- State keys:', stateKeys);
      console.log('- State size:', JSON.stringify(state).length, 'characters');
      console.log('- Store methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(store)));
      
      return {
        stateKeys,
        stateSize: JSON.stringify(state).length,
        hasGetState: typeof store.getState === 'function',
        hasDispatch: typeof store.dispatch === 'function',
        hasSubscribe: typeof store.subscribe === 'function'
      };
    } catch (error) {
      console.error('❌ Error getting store info:', error);
      return { error: error.message };
    }
  }
};

// Auto-run debug on page load in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    console.log('🔍 Auto-running store debug on page load...');
    debugStore.checkStoreHealth();
  });
  
  // Add debug functions to window for console access
  (window as any).debugStore = debugStore;
}
