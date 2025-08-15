import React from 'react';

// Performance check and optimization utility
export class PerformanceCheck {
  private static instance: PerformanceCheck;
  private issues: string[] = [];
  private recommendations: string[] = [];

  static getInstance(): PerformanceCheck {
    if (!PerformanceCheck.instance) {
      PerformanceCheck.instance = new PerformanceCheck();
    }
    return PerformanceCheck.instance;
  }

  // Check for common performance issues
  async checkPerformance(): Promise<{ issues: string[]; recommendations: string[] }> {
    this.issues = [];
    this.recommendations = [];

    if (typeof window === 'undefined') {
      return { issues: this.issues, recommendations: this.recommendations };
    }

    // Check console for excessive logging
    this.checkConsoleLogging();

    // Check for memory leaks
    this.checkMemoryUsage();

    // Check for excessive re-renders
    this.checkRerenders();

    // Check for slow API calls
    this.checkApiPerformance();

    // Check for large bundle size
    this.checkBundleSize();

    // Check for unused event listeners
    this.checkEventListeners();

    // Generate recommendations
    this.generateRecommendations();

    return { issues: this.issues, recommendations: this.recommendations };
  }

  // Check for excessive console logging
  private checkConsoleLogging(): void {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    let logCount = 0;
    let warnCount = 0;
    let errorCount = 0;

    console.log = (...args) => {
      logCount++;
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      warnCount++;
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      errorCount++;
      originalError.apply(console, args);
    };

    // Check after 10 seconds
    setTimeout(() => {
      if (logCount > 1000) {
        this.issues.push(`Excessive console.log calls: ${logCount} in 10 seconds`);
      }
      if (warnCount > 100) {
        this.issues.push(`Excessive console.warn calls: ${warnCount} in 10 seconds`);
      }
      if (errorCount > 50) {
        this.issues.push(`Excessive console.error calls: ${errorCount} in 10 seconds`);
      }

      // Restore original functions
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }, 10000);
  }

  // Check memory usage
  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);

      if (usedMB > 100) {
        this.issues.push(`High memory usage: ${usedMB}MB used out of ${totalMB}MB`);
      }

      if (memory.usedJSHeapSize / memory.totalJSHeapSize > 0.8) {
        this.issues.push('Memory usage is above 80% of total heap');
      }
    }
  }

  // Check for excessive re-renders
  private checkRerenders(): void {
    let renderCount = 0;
    const originalCreateElement = React.createElement;

    React.createElement = (...args) => {
      renderCount++;
      return originalCreateElement.apply(React, args);
    };

    // Check after 5 seconds
    setTimeout(() => {
      if (renderCount > 5000) {
        this.issues.push(`Excessive re-renders: ${renderCount} in 5 seconds`);
      }

      // Restore original function
      React.createElement = originalCreateElement;
    }, 5000);
  }

  // Check API performance
  private checkApiPerformance(): void {
    const originalFetch = window.fetch;
    const slowRequests: string[] = [];

    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        if (duration > 3000) {
          slowRequests.push(`${url}: ${duration}ms`);
        }

        return response;
      } catch (error) {
        throw error;
      }
    };

    // Check after 30 seconds
    setTimeout(() => {
      if (slowRequests.length > 0) {
        this.issues.push(`Slow API requests detected: ${slowRequests.join(', ')}`);
      }

      // Restore original function
      window.fetch = originalFetch;
    }, 30000);
  }

  // Check bundle size
  private checkBundleSize(): void {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('static/js/')) {
        // Estimate size based on filename
        if (src.includes('main.') && src.includes('.js')) {
          totalSize += 500; // Estimate 500KB for main bundle
        }
      }
    });

    if (totalSize > 2000) {
      this.issues.push(`Large bundle size detected: ~${totalSize}KB`);
    }
  }

  // Check for unused event listeners
  private checkEventListeners(): void {
    // This is a simplified check - in a real implementation, you'd need more sophisticated detection
    const elements = document.querySelectorAll('*');
    let eventListenerCount = 0;

    elements.forEach(element => {
      // Check for common event attributes
      const events = ['click', 'change', 'input', 'submit', 'keydown', 'keyup', 'mouseover', 'mouseout'];
      events.forEach(event => {
        if (element.hasAttribute(`on${event}`)) {
          eventListenerCount++;
        }
      });
    });

    if (eventListenerCount > 1000) {
      this.issues.push(`Many event listeners detected: ${eventListenerCount}`);
    }
  }

  // Generate recommendations based on issues
  private generateRecommendations(): void {
    if (this.issues.some(issue => issue.includes('console.log'))) {
      this.recommendations.push('Remove or reduce console.log statements in production');
    }

    if (this.issues.some(issue => issue.includes('memory'))) {
      this.recommendations.push('Implement memory cleanup and avoid memory leaks');
    }

    if (this.issues.some(issue => issue.includes('re-renders'))) {
      this.recommendations.push('Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders');
    }

    if (this.issues.some(issue => issue.includes('API'))) {
      this.recommendations.push('Implement API caching and request deduplication');
    }

    if (this.issues.some(issue => issue.includes('bundle'))) {
      this.recommendations.push('Implement code splitting and lazy loading');
    }

    if (this.issues.some(issue => issue.includes('event listeners'))) {
      this.recommendations.push('Remove unused event listeners and use event delegation');
    }

    // General recommendations
    this.recommendations.push('Use React DevTools Profiler to identify performance bottlenecks');
    this.recommendations.push('Implement virtual scrolling for large lists');
    this.recommendations.push('Use web workers for heavy computations');
  }

  // Print performance report
  printReport(): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('🔍 Performance Check Report:');
    
    if (this.issues.length === 0) {
      console.log('✅ No performance issues detected');
    } else {
      console.log('⚠️ Performance Issues:');
      this.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (this.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }

  // Run performance check and print report
  async runCheck(): Promise<void> {
    console.log('🔍 Starting performance check...');
    
    const result = await this.checkPerformance();
    
    setTimeout(() => {
      this.printReport();
    }, 35000); // Wait for all checks to complete
  }
}

// Export singleton instance
export const performanceCheck = PerformanceCheck.getInstance();

// Auto-run performance check in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceCheck.runCheck();
    }, 5000);
  });

  // Add to window for debugging
  (window as any).performanceCheck = performanceCheck;
}
