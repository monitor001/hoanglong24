/**
 * Safe Redux Store Initializer
 * This utility ensures safe initialization and access to the Redux store
 */

let storeInstance: any = null;
let isInitializing = false;
let initializationPromise: Promise<any> | null = null;

/**
 * Safely initialize the Redux store
 */
export const initializeStore = async (): Promise<any> => {
  // If store is already initialized, return it
  if (storeInstance) {
    return storeInstance;
  }

  // If initialization is in progress, wait for it
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  isInitializing = true;
  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('🔄 Initializing Redux store...');

      // Clear any corrupted data before initialization
      clearCorruptedData();

      // Import store dynamically to avoid circular dependencies
      const { default: store } = await import('../store');
      
      if (!store) {
        throw new Error('Store import returned null');
      }

      // Validate store
      if (typeof store.getState !== 'function') {
        throw new Error('Store missing getState method');
      }

      if (typeof store.dispatch !== 'function') {
        throw new Error('Store missing dispatch method');
      }

      // Test store functionality
      const initialState = store.getState();
      if (!initialState || typeof initialState !== 'object') {
        throw new Error('Store getState returned invalid state');
      }

      // Validate state structure
      const requiredKeys = ['auth', 'projects', 'documents', 'tasks', 'users', 'ui', 'permissions'];
      const stateKeys = Object.keys(initialState);
      const missingKeys = requiredKeys.filter(key => !stateKeys.includes(key));

      if (missingKeys.length > 0) {
        console.warn('Missing state keys:', missingKeys);
      }

      // Store the instance
      storeInstance = store;

      // Reset session flags
      resetSessionFlags();

      console.log('✅ Redux store initialized successfully');
      resolve(store);
    } catch (error) {
      console.error('❌ Failed to initialize Redux store:', error);
      
      // Clear corrupted data and mark DevTools as disabled
      clearCorruptedData();
      sessionStorage.setItem('disable_devtools', 'true');
      
      reject(error);
    } finally {
      isInitializing = false;
    }
  });

  return initializationPromise;
};

/**
 * Get the store instance safely
 */
export const getStore = (): any => {
  if (!storeInstance) {
    throw new Error('Store not initialized. Call initializeStore() first.');
  }
  return storeInstance;
};

/**
 * Get store state safely
 */
export const getStoreState = (): any => {
  const store = getStore();
  return store.getState();
};

/**
 * Dispatch action safely
 */
export const dispatchAction = (action: any): any => {
  const store = getStore();
  return store.dispatch(action);
};

/**
 * Clear corrupted Redux data
 */
const clearCorruptedData = (): void => {
  try {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    const localStorageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('redux-devtools') || 
        key.includes('__REDUX') ||
        key.includes('redux_devtools')
      )) {
        localStorageKeys.push(key);
      }
    }

    localStorageKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`Removed localStorage: ${key}`);
      } catch (e) {
        console.warn(`Failed to remove localStorage key ${key}:`, e);
      }
    });

    // Clear sessionStorage
    const sessionStorageKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.includes('redux-devtools') || 
        key.includes('__REDUX') ||
        key.includes('redux_devtools')
      )) {
        sessionStorageKeys.push(key);
      }
    }

    sessionStorageKeys.forEach(key => {
      try {
        sessionStorage.removeItem(key);
        console.log(`Removed sessionStorage: ${key}`);
      } catch (e) {
        console.warn(`Failed to remove sessionStorage key ${key}:`, e);
      }
    });

    // Clear window references
    const windowKeys = [
      '__REDUX_STORE__',
      '__REDUX_DEVTOOLS_EXTENSION__',
      '__STORE_MONITOR_STOP__'
    ];

    windowKeys.forEach(key => {
      try {
        delete (window as any)[key];
        console.log(`Removed window reference: ${key}`);
      } catch (e) {
        console.warn(`Failed to remove window reference ${key}:`, e);
      }
    });

    console.log('✅ Corrupted Redux data cleared');
  } catch (error) {
    console.warn('Error clearing corrupted data:', error);
  }
};

/**
 * Reset session flags
 */
const resetSessionFlags = (): void => {
  try {
    if (typeof window === 'undefined') return;

    const flagsToRemove = [
      'redux_error_cleared',
      'app_initialized',
      'app_reload_attempted',
      'store_initialization_error',
      'redux_devtools_error',
      'store_recovery_attempted',
      'disable_devtools'
    ];

    flagsToRemove.forEach(flag => {
      try {
        sessionStorage.removeItem(flag);
        console.log(`Removed session flag: ${flag}`);
      } catch (error) {
        console.warn(`Failed to remove session flag ${flag}:`, error);
      }
    });

    console.log('✅ Session flags reset');
  } catch (error) {
    console.warn('Error resetting session flags:', error);
  }
};

/**
 * Check if store is initialized
 */
export const isStoreInitialized = (): boolean => {
  return storeInstance !== null && 
         typeof storeInstance.getState === 'function' && 
         typeof storeInstance.dispatch === 'function';
};

/**
 * Reset store instance (for testing or recovery)
 */
export const resetStoreInstance = (): void => {
  storeInstance = null;
  isInitializing = false;
  initializationPromise = null;
  console.log('Store instance reset');
};

/**
 * Enhanced store validation with better error handling
 */
export const validateStoreInstance = (): boolean => {
  try {
    if (!storeInstance) {
      console.error('Store instance is null');
      return false;
    }

    if (typeof storeInstance.getState !== 'function') {
      console.error('Store instance missing getState method');
      return false;
    }

    if (typeof storeInstance.dispatch !== 'function') {
      console.error('Store instance missing dispatch method');
      return false;
    }

    // Test getState
    const state = storeInstance.getState();
    if (!state || typeof state !== 'object') {
      console.error('Store getState returned invalid state');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Store validation failed:', error);
    return false;
  }
};

/**
 * Safe store access with fallback
 */
export const getSafeStoreInstance = (): any => {
  if (!isStoreInitialized()) {
    console.warn('Store not initialized, attempting to initialize...');
    return initializeStore().catch(error => {
      console.error('Failed to initialize store:', error);
      throw error;
    });
  }

  if (!validateStoreInstance()) {
    console.error('Store validation failed, resetting instance...');
    resetStoreInstance();
    return initializeStore().catch(error => {
      console.error('Failed to reinitialize store:', error);
      throw error;
    });
  }

  return storeInstance;
};
