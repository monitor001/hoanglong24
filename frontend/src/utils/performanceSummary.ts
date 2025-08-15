// Performance summary and optimization utility
import { performanceMonitor } from './performanceMonitor';
import { axiosOptimizer } from './axiosOptimizer';
import { performanceCheck } from './performanceCheck';

export class PerformanceSummary {
  private static instance: PerformanceSummary;
  private isMonitoring = false;

  static getInstance(): PerformanceSummary {
    if (!PerformanceSummary.instance) {
      PerformanceSummary.instance = new PerformanceSummary();
    }
    return PerformanceSummary.instance;
  }

  // Start all performance monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    if (process.env.NODE_ENV !== 'development') return;

    console.log('🚀 Starting comprehensive performance monitoring...');
    
    // Start individual monitors
    performanceMonitor.start();
    
    // Start performance check
    performanceCheck.runCheck();
    
    this.isMonitoring = true;
    
    // Print summary every 2 minutes
    setInterval(() => {
      this.printSummary();
    }, 120000);
  }

  // Print comprehensive performance summary
  printSummary(): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('📊 ===== PERFORMANCE SUMMARY =====');
    
    // Performance Monitor stats
    const monitorStats = performanceMonitor.getReport();
    console.log('📈 Performance Monitor:');
    console.log(`  - Uptime: ${monitorStats.uptime}s`);
    console.log(`  - Avg Memory: ${monitorStats.averageMemoryUsage}MB`);
    console.log(`  - Components: ${monitorStats.totalComponents}`);
    console.log(`  - API Calls: ${monitorStats.totalApiCalls}`);
    
    // Axios Optimizer stats
    console.log('🌐 Axios Optimizer:');
    console.log(`  - Cache Size: ${axiosOptimizer.getCacheSize()}`);
    console.log(`  - Pending Requests: ${axiosOptimizer.getPendingRequestsCount()}`);
    
    // Performance Check results
    console.log('🔍 Performance Check:');
    const checkResults = performanceCheck.checkPerformance();
    checkResults.then(({ issues, recommendations }) => {
      if (issues.length === 0) {
        console.log('  ✅ No issues detected');
      } else {
        console.log(`  ⚠️ ${issues.length} issues found`);
        issues.forEach(issue => console.log(`    - ${issue}`));
      }
      
      if (recommendations.length > 0) {
        console.log(`  💡 ${recommendations.length} recommendations`);
        recommendations.forEach(rec => console.log(`    - ${rec}`));
      }
    });
    
    console.log('=====================================');
  }

  // Get all performance data
  getAllData(): any {
    return {
      monitor: performanceMonitor.getReport(),
      axios: {
        cacheSize: axiosOptimizer.getCacheSize(),
        pendingRequests: axiosOptimizer.getPendingRequestsCount(),
        requestStats: axiosOptimizer.getRequestStats()
      },
      timestamp: new Date().toISOString()
    };
  }

  // Clear all performance data
  clearAllData(): void {
    performanceMonitor.reset();
    axiosOptimizer.clearCache();
    axiosOptimizer.clearPendingRequests();
    console.log('🗑️ All performance data cleared');
  }

  // Export performance data
  exportData(): string {
    const data = this.getAllData();
    return JSON.stringify(data, null, 2);
  }

  // Print detailed report
  printDetailedReport(): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('📋 ===== DETAILED PERFORMANCE REPORT =====');
    
    // Monitor detailed stats
    const monitorStats = performanceMonitor.getReport();
    console.log('📈 Performance Monitor Details:');
    console.log('Component Renders:', monitorStats.componentRenders);
    console.log('API Calls:', monitorStats.apiCalls);
    
    // Axios detailed stats
    console.log('🌐 Axios Details:');
    console.log('Request Statistics:', axiosOptimizer.getRequestStats());
    
    console.log('==========================================');
  }

  // Check for critical issues
  checkCriticalIssues(): string[] {
    const issues: string[] = [];
    const monitorStats = performanceMonitor.getReport();
    
    // Check memory usage
    if (monitorStats.averageMemoryUsage > 100) {
      issues.push('Critical: High memory usage detected');
    }
    
    // Check for excessive API calls
    if (monitorStats.totalApiCalls > 100) {
      issues.push('Critical: Excessive API calls detected');
    }
    
    // Check for excessive component renders
    if (monitorStats.totalComponents > 50) {
      issues.push('Critical: Many components rendering frequently');
    }
    
    return issues;
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    const monitorStats = performanceMonitor.getReport();
    let score = 100;
    
    // Deduct points for issues
    if (monitorStats.averageMemoryUsage > 50) {
      score -= 20;
    }
    if (monitorStats.totalApiCalls > 50) {
      score -= 15;
    }
    if (monitorStats.totalComponents > 30) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  // Print performance score
  printPerformanceScore(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const score = this.getPerformanceScore();
    const issues = this.checkCriticalIssues();
    
    console.log('🎯 ===== PERFORMANCE SCORE =====');
    console.log(`Score: ${score}/100`);
    
    if (score >= 80) {
      console.log('Status: 🟢 Excellent');
    } else if (score >= 60) {
      console.log('Status: 🟡 Good');
    } else if (score >= 40) {
      console.log('Status: 🟠 Fair');
    } else {
      console.log('Status: 🔴 Poor');
    }
    
    if (issues.length > 0) {
      console.log('Critical Issues:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    console.log('===============================');
  }
}

// Export singleton instance
export const performanceSummary = PerformanceSummary.getInstance();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Start monitoring after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceSummary.startMonitoring();
    }, 3000);
  });

  // Add to window for debugging
  (window as any).performanceSummary = performanceSummary;
  
  // Add keyboard shortcut to print summary
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      performanceSummary.printSummary();
      performanceSummary.printPerformanceScore();
    }
  });
}
