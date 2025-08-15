import React from 'react';

// Debug performance issues
export const debugPerformance = {
  // Track API calls
  apiCalls: new Map<string, number>(),
  
  // Track component renders
  componentRenders: new Map<string, number>(),
  
  // Track useEffect calls
  useEffectCalls: new Map<string, number>(),

  // Log API call
  logApiCall: (endpoint: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const count = debugPerformance.apiCalls.get(endpoint) || 0;
    debugPerformance.apiCalls.set(endpoint, count + 1);
    
    if (count > 10) {
      console.warn(`⚠️ API Call Warning: ${endpoint} called ${count + 1} times`);
    }
  },

  // Log component render
  logComponentRender: (componentName: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const count = debugPerformance.componentRenders.get(componentName) || 0;
    debugPerformance.componentRenders.set(componentName, count + 1);
    
    if (count > 50) {
      console.warn(`⚠️ Component Render Warning: ${componentName} rendered ${count + 1} times`);
    }
  },

  // Log useEffect call
  logUseEffect: (componentName: string, effectName: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const key = `${componentName}:${effectName}`;
    const count = debugPerformance.useEffectCalls.get(key) || 0;
    debugPerformance.useEffectCalls.set(key, count + 1);
    
    if (count > 20) {
      console.warn(`⚠️ useEffect Warning: ${key} called ${count + 1} times`);
    }
  },

  // Get statistics
  getStats: () => {
    return {
      apiCalls: Object.fromEntries(debugPerformance.apiCalls),
      componentRenders: Object.fromEntries(debugPerformance.componentRenders),
      useEffectCalls: Object.fromEntries(debugPerformance.useEffectCalls)
    };
  },

  // Reset statistics
  reset: () => {
    debugPerformance.apiCalls.clear();
    debugPerformance.componentRenders.clear();
    debugPerformance.useEffectCalls.clear();
  },

  // Print statistics
  printStats: () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('📊 Performance Debug Statistics:');
    console.log('API Calls:', debugPerformance.getStats().apiCalls);
    console.log('Component Renders:', debugPerformance.getStats().componentRenders);
    console.log('useEffect Calls:', debugPerformance.getStats().useEffectCalls);
  }
};

// Hook to track component performance
export const useDebugPerformance = (componentName: string) => {
  React.useEffect(() => {
    debugPerformance.logComponentRender(componentName);
  });
};

// Hook to track useEffect performance
export const useDebugUseEffect = (componentName: string, effectName: string, deps: any[]) => {
  React.useEffect(() => {
    debugPerformance.logUseEffect(componentName, effectName);
  }, deps);
};

// Intercept axios calls
export const interceptAxiosCalls = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use((config: any) => {
    debugPerformance.logApiCall(config.url);
    return config;
  });
};

// Add to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugPerformance = debugPerformance;
}
