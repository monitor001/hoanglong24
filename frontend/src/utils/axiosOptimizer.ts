import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Cache for API responses
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Performance tracking
const requestStats = new Map<string, { count: number; totalTime: number; avgTime: number }>();

export class AxiosOptimizer {
  private static instance: AxiosOptimizer;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create();
    this.setupInterceptors();
  }

  static getInstance(): AxiosOptimizer {
    if (!AxiosOptimizer.instance) {
      AxiosOptimizer.instance = new AxiosOptimizer();
    }
    return AxiosOptimizer.instance;
  }

  // Setup interceptors for optimization
  private setupInterceptors(): void {
    // Request interceptor for caching and deduplication
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const url = config.url || '';
        const method = config.method || 'get';
        const cacheKey = `${method.toUpperCase()}:${url}`;

        // Track request statistics
        this.trackRequest(url);

        // For GET requests, check cache first
        if (method.toLowerCase() === 'get' && (config as any).cache !== false) {
          const cached = responseCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < cached.ttl) {
            console.log(`📦 Cache hit: ${url}`);
            return Promise.resolve({ data: cached.data, status: 200, statusText: 'OK', config });
          }
        }

        // Check for pending requests (deduplication)
        if (pendingRequests.has(cacheKey)) {
          console.log(`🔄 Deduplicating request: ${url}`);
          return pendingRequests.get(cacheKey);
        }

        // Add request start time for performance tracking
        (config as any).startTime = Date.now();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for caching and performance tracking
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const url = response.config.url || '';
        const method = response.config.method || 'get';
        const cacheKey = `${method.toUpperCase()}:${url}`;

        // Track response time
        const startTime = (response.config as any).startTime;
        if (startTime) {
          const duration = Date.now() - startTime;
          this.trackResponse(url, duration);
        }

        // Cache successful GET responses
        if (method.toLowerCase() === 'get' && (response.config as any).cache !== false) {
          const ttl = (response.config as any).cacheTTL || 5 * 60 * 1000; // 5 minutes default
          responseCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            ttl
          });
        }

        // Remove from pending requests
        pendingRequests.delete(cacheKey);

        return response;
      },
      (error) => {
        // Remove from pending requests on error
        const url = error.config?.url || '';
        const method = error.config?.method || 'get';
        const cacheKey = `${method.toUpperCase()}:${url}`;
        pendingRequests.delete(cacheKey);

        return Promise.reject(error);
      }
    );
  }

  // Track request statistics
  private trackRequest(url: string): void {
    const stats = requestStats.get(url) || { count: 0, totalTime: 0, avgTime: 0 };
    stats.count++;
    requestStats.set(url, stats);
  }

  // Track response time
  private trackResponse(url: string, duration: number): void {
    const stats = requestStats.get(url) || { count: 0, totalTime: 0, avgTime: 0 };
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    requestStats.set(url, stats);

    // Warn for slow requests
    if (duration > 5000) { // 5 seconds
      console.warn(`⚠️ Slow API request: ${url} took ${duration}ms`);
    }
  }

  // Get request statistics
  getRequestStats(): Record<string, any> {
    return Object.fromEntries(requestStats);
  }

  // Clear cache
  clearCache(): void {
    responseCache.clear();
    console.log('🗑️ Response cache cleared');
  }

  // Clear pending requests
  clearPendingRequests(): void {
    pendingRequests.clear();
    console.log('🗑️ Pending requests cleared');
  }

  // Get cache size
  getCacheSize(): number {
    return responseCache.size;
  }

  // Get pending requests count
  getPendingRequestsCount(): number {
    return pendingRequests.size;
  }

  // Get axios instance
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Optimized GET request with caching
  async get<T = any>(url: string, config?: AxiosRequestConfig & { cache?: boolean; cacheTTL?: number }): Promise<T> {
    return this.axiosInstance.get(url, config);
  }

  // Optimized POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post(url, data, config);
  }

  // Optimized PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config);
  }

  // Optimized DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config);
  }

  // Optimized PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.patch(url, data, config);
  }

  // Print performance report
  printReport(): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('📊 Axios Performance Report:');
    console.log('Cache size:', this.getCacheSize());
    console.log('Pending requests:', this.getPendingRequestsCount());
    console.log('Request statistics:', this.getRequestStats());
  }
}

// Export singleton instance
export const axiosOptimizer = AxiosOptimizer.getInstance();

// Add to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).axiosOptimizer = axiosOptimizer;
}

// Auto-print report every minute in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  setInterval(() => {
    axiosOptimizer.printReport();
  }, 60000);
}
