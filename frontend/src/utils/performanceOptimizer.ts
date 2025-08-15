
import React from 'react';

// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private renderCounts: Map<string, number> = new Map();
  private lastRenderTime: Map<string, number> = new Map();
  private throttleTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Track component renders
  trackRender(componentName: string): void {
    if (process.env.NODE_ENV !== 'development') return;

    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);
    
    const now = Date.now();
    const lastTime = this.lastRenderTime.get(componentName) || 0;
    const timeSinceLastRender = now - lastTime;
    
    this.lastRenderTime.set(componentName, now);

    // Log if component is rendering too frequently
    if (timeSinceLastRender < 100) { // Less than 100ms between renders
      console.warn(`⚠️ Performance: ${componentName} rendering too frequently (${timeSinceLastRender}ms since last render, total: ${count + 1})`);
    }

    // Log every 10th render
    if ((count + 1) % 10 === 0) {
      console.log(`📊 Performance: ${componentName} has rendered ${count + 1} times`);
    }
  }

  // Throttle function calls
  throttle<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.throttleTimers.has(key)) {
        clearTimeout(this.throttleTimers.get(key)!);
      }

      this.throttleTimers.set(key, setTimeout(() => {
        func(...args);
        this.throttleTimers.delete(key);
      }, delay));
    };
  }

  // Debounce function calls
  debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.throttleTimers.has(key)) {
        clearTimeout(this.throttleTimers.get(key)!);
      }

      this.throttleTimers.set(key, setTimeout(() => {
        func(...args);
        this.throttleTimers.delete(key);
      }, delay));
    };
  }

  // Get render statistics
  getRenderStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.renderCounts.forEach((count, component) => {
      stats[component] = count;
    });
    return stats;
  }

  // Reset statistics
  resetStats(): void {
    this.renderCounts.clear();
    this.lastRenderTime.clear();
  }

  // Clear all timers
  clearTimers(): void {
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.clear();
  }

  // Optimize React component with memo
  optimizeComponent<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
  ): React.MemoExoticComponent<React.ComponentType<P>> {
    const displayName = componentName || Component.displayName || Component.name || 'Component';
    
    const OptimizedComponent = React.memo(Component, (prevProps, nextProps) => {
      // Custom comparison function
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    });
    
    OptimizedComponent.displayName = `Optimized(${displayName})`;
    
    return OptimizedComponent;
  }

  // Create optimized hook
  createOptimizedHook<T extends (...args: any[]) => any>(
    hook: T,
    hookName: string
  ): T {
    return ((...args: Parameters<T>) => {
      const result = hook(...args);
      
      // Track hook usage
      this.trackRender(`${hookName}Hook`);
      
      return result;
    }) as T;
  }

  // Optimize expensive calculations
  memoize<T extends (...args: any[]) => any>(
    func: T,
    getKey: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = getKey(...args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  // Batch state updates
  batchStateUpdates<T extends Record<string, any>>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    updates: Partial<T>[]
  ): void {
    React.startTransition(() => {
      updates.forEach(update => {
        setState(prev => ({ ...prev, ...update }));
      });
    });
  }

  // Optimize list rendering
  optimizeList<T>(
    items: T[],
    keyExtractor: (item: T, index: number) => string,
    renderItem: (item: T, index: number) => any,
    options?: {
      windowSize?: number;
      overscan?: number;
    }
  ): any[] {
    const { windowSize = 10, overscan = 5 } = options || {};
    
    // Simple virtualization for large lists
    if (items.length > windowSize) {
      return items.slice(0, windowSize + overscan).map((item, index) => 
        renderItem(item, index)
      );
    }
    
    return items.map((item, index) => 
      renderItem(item, index)
    );
  }

  // Optimize images
  optimizeImage(
    src: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    }
  ): string {
    // Add image optimization parameters
    const params = new URLSearchParams();
    
    if (options?.width) params.append('w', options.width.toString());
    if (options?.height) params.append('h', options.height.toString());
    if (options?.quality) params.append('q', options.quality.toString());
    if (options?.format) params.append('f', options.format);
    
    return params.toString() ? `${src}?${params.toString()}` : src;
  }

  // Optimize CSS
  optimizeCSS(css: string): string {
    // Remove comments and unnecessary whitespace
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove trailing semicolons
      .trim();
  }

  // Optimize JavaScript
  optimizeJS(code: string): string {
    // Remove console statements in production
    if (process.env.NODE_ENV === 'production') {
      return code
        .replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '')
        .replace(/debugger;?/g, '');
    }
    
    return code;
  }

  // Get performance metrics
  getMetrics(): {
    renderCounts: Record<string, number>;
    totalRenders: number;
    averageRenderTime: number;
  } {
    const renderCounts = this.getRenderStats();
    const totalRenders = Object.values(renderCounts).reduce((sum, count) => sum + count, 0);
    
    let totalTime = 0;
    let timeCount = 0;
    this.lastRenderTime.forEach((time) => {
      totalTime += time;
      timeCount++;
    });
    
    const averageRenderTime = timeCount > 0 ? totalTime / timeCount : 0;
    
    return {
      renderCounts,
      totalRenders,
      averageRenderTime
    };
  }

  // Print performance report
  printReport(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const metrics = this.getMetrics();
    console.log('📊 Performance Optimizer Report:');
    console.log('Render Counts:', metrics.renderCounts);
    console.log('Total Renders:', metrics.totalRenders);
    console.log('Average Render Time:', metrics.averageRenderTime.toFixed(2), 'ms');
  }
}

// Utility to check if component should re-render
export const shouldComponentUpdate = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keysToCompare: (keyof T)[]
): boolean => {
  return keysToCompare.some(key => prevProps[key] !== nextProps[key]);
};

// Memoization helper
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();
