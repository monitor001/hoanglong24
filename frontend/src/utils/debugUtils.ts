// Debug utility to control logging in different environments
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Debug logger that only logs in development
export const debugLog = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔍 ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, data);
    }
  },
  error: (message: string, data?: any) => {
    // Always log errors, even in production
    console.error(`❌ ${message}`, data);
  },
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, data);
    }
  },
  permission: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔐 ${message}`, data);
    }
  }
};

// Permission debug logger with deduplication
class PermissionDebugLogger {
  private loggedPermissions = new Set<string>();

  log(role: string, permission: string, hasPermission: boolean, fallbackPerms?: string[]) {
    const logKey = `${role}-${permission}`;
    
    if (!this.loggedPermissions.has(logKey)) {
      this.loggedPermissions.add(logKey);
      debugLog.permission('Permission check:', {
        userRole: role,
        permission: permission,
        hasPermission: hasPermission,
        fallbackPerms: fallbackPerms
      });
    }
  }

  clear() {
    this.loggedPermissions.clear();
  }
}

export const permissionLogger = new PermissionDebugLogger();

// Component debug logger
export const componentLogger = {
  mount: (componentName: string, data?: any) => {
    debugLog.info(`${componentName} mounted`, data);
  },
  unmount: (componentName: string) => {
    debugLog.info(`${componentName} unmounted`);
  },
  render: (componentName: string, data?: any) => {
    debugLog.info(`${componentName} rendering`, data);
  },
  permission: (componentName: string, hasPermission: boolean, permission?: string) => {
    if (hasPermission) {
      debugLog.success(`${componentName}: Access granted`, { permission });
    } else {
      debugLog.warn(`${componentName}: Access denied`, { permission });
    }
  }
};

// API debug logger
export const apiLogger = {
  request: (endpoint: string, data?: any) => {
    debugLog.info(`API Request: ${endpoint}`, data);
  },
  response: (endpoint: string, data?: any) => {
    debugLog.success(`API Response: ${endpoint}`, data);
  },
  error: (endpoint: string, error: any) => {
    debugLog.error(`API Error: ${endpoint}`, error);
  }
};

// Performance debug logger
export const performanceLogger = {
  start: (operation: string) => {
    if (isDevelopment) {
      console.time(`⏱️ ${operation}`);
    }
  },
  end: (operation: string) => {
    if (isDevelopment) {
      console.timeEnd(`⏱️ ${operation}`);
    }
  },
  measure: (operation: string, fn: () => any) => {
    if (isDevelopment) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`⏱️ ${operation}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  }
};

// Environment info
export const envInfo = {
  isDevelopment,
  isProduction,
  nodeEnv: process.env.NODE_ENV,
  apiUrl: process.env.REACT_APP_API_URL
};

// Debug configuration
export const debugConfig = {
  enablePermissionLogs: isDevelopment,
  enableComponentLogs: isDevelopment,
  enableApiLogs: isDevelopment,
  enablePerformanceLogs: isDevelopment,
  maxLogEntries: 1000
};
