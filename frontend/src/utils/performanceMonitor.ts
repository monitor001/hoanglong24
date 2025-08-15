// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any> = new Map();
  private startTime: number = Date.now();
  private renderCounts: Map<string, number> = new Map();
  private apiCallCounts: Map<string, number> = new Map();
  private memoryUsage: number[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start monitoring
  start(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('🚀 Performance Monitor Started');
    
    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Monitor render performance
    this.startRenderMonitoring();
    
    // Monitor API calls
    this.startApiMonitoring();
  }

  // Track component render
  trackRender(componentName: string): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);
    
    // Warn if component renders too frequently
    if (count > 100) {
      console.warn(`⚠️ Performance: ${componentName} has rendered ${count + 1} times`);
    }
  }

  // Track API call
  trackApiCall(endpoint: string): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const count = this.apiCallCounts.get(endpoint) || 0;
    this.apiCallCounts.set(endpoint, count + 1);
    
    // Warn if API is called too frequently
    if (count > 20) {
      console.warn(`⚠️ API Performance: ${endpoint} called ${count + 1} times`);
    }
  }

  // Start memory monitoring
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;
    
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.memoryUsage.push(memory.usedJSHeapSize);
        
        // Keep only last 100 measurements
        if (this.memoryUsage.length > 100) {
          this.memoryUsage.shift();
        }
        
        // Warn if memory usage is high
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          console.warn(`⚠️ Memory Usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  // Start render monitoring
  private startRenderMonitoring(): void {
    if (typeof window === 'undefined') return;
    
    let lastRenderTime = Date.now();
    let renderCount = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          renderCount++;
          const now = Date.now();
          
          if (now - lastRenderTime < 100) { // Less than 100ms between renders
            console.warn(`⚠️ Rapid Rendering: ${entry.name} took ${entry.duration}ms`);
          }
          
          lastRenderTime = now;
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }

  // Start API monitoring
  private startApiMonitoring(): void {
    if (typeof window === 'undefined') return;
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        if (duration > 5000) { // More than 5 seconds
          console.warn(`⚠️ Slow API Call: ${url} took ${duration}ms`);
        }
        
        this.trackApiCall(url);
        return response;
      } catch (error) {
        console.error(`❌ API Error: ${url}`, error);
        throw error;
      }
    };
  }

  // Get performance report
  getReport(): any {
    const uptime = Date.now() - this.startTime;
    const avgMemory = this.memoryUsage.length > 0 
      ? this.memoryUsage.reduce((a, b) => a + b, 0) / this.memoryUsage.length 
      : 0;

    return {
      uptime: Math.round(uptime / 1000), // seconds
      averageMemoryUsage: Math.round(avgMemory / 1024 / 1024), // MB
      componentRenders: Object.fromEntries(this.renderCounts),
      apiCalls: Object.fromEntries(this.apiCallCounts),
      totalComponents: this.renderCounts.size,
      totalApiCalls: this.apiCallCounts.size
    };
  }

  // Print performance report
  printReport(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const report = this.getReport();
    console.log('📊 Performance Report:', report);
  }

  // Reset metrics
  reset(): void {
    this.metrics.clear();
    this.renderCounts.clear();
    this.apiCallCounts.clear();
    this.memoryUsage = [];
    this.startTime = Date.now();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  performanceMonitor.start();
  
  // Add to window for debugging
  (window as any).performanceMonitor = performanceMonitor;
  
  // Print report every 30 seconds
  setInterval(() => {
    performanceMonitor.printReport();
  }, 30000);
}
