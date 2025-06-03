// Mobile Performance Monitoring Utility for SKRBL AI
// Tracks crashes, errors, performance metrics, and Core Web Vitals

interface PerformanceData {
  sessionId: string;
  userId?: string;
  deviceInfo: {
    userAgent: string;
    isMobile: boolean;
    screenSize: string;
    deviceMemory?: number;
    connection?: string;
    hardwareConcurrency?: number;
    platform: string;
  };
  performanceData: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
    pageLoadTime?: number;
    resourceLoadTime?: number;
    memoryUsage?: number;
    javaScriptErrors: any[];
    navigationTiming?: any;
    resourceTiming?: any[];
  };
  errorLogs?: any[];
}

interface CrashData {
  sessionId: string;
  userId?: string;
  errorType: 'javascript' | 'unhandled-rejection' | 'react-error' | 'network' | 'performance';
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  deviceInfo: any;
  breadcrumbs?: any[];
  customData?: any;
}

class MobilePerformanceMonitor {
  private sessionId: string;
  private userId?: string;
  private errorBuffer: any[] = [];
  private performanceMetrics: any = {};
  private breadcrumbs: any[] = [];
  private isInitialized = false;

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    this.userId = userId;
    
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Set up error tracking
    this.setupErrorTracking();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    
    // Set up Core Web Vitals tracking
    this.setupWebVitalsTracking();
    
    // Set up navigation and resource timing
    this.setupTimingTracking();
    
    // Set up memory monitoring (mobile-specific)
    this.setupMemoryMonitoring();
    
    // Set up page visibility tracking
    this.setupVisibilityTracking();

    console.log('[MobilePerformanceMonitor] Initialized for session:', this.sessionId);
  }

  private setupErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      const errorData = {
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      this.logError(errorData);
      this.addBreadcrumb('error', 'JavaScript error occurred', { message: event.message });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorData = {
        type: 'unhandled-rejection',
        message: `Unhandled promise rejection: ${event.reason}`,
        reason: event.reason,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      this.logError(errorData);
      this.addBreadcrumb('error', 'Unhandled promise rejection', { reason: event.reason });
    });

    // Network errors (resource loading failures)
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
          const errorData = {
            type: 'network',
            message: `Failed to load resource: ${target.tagName}`,
            src: target.getAttribute('src') || target.getAttribute('href'),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          };

          this.logError(errorData);
          this.addBreadcrumb('network', 'Resource load failed', { 
            element: target.tagName, 
            src: target.getAttribute('src') || target.getAttribute('href') 
          });
        }
      }
    }, true);
  }

  private setupPerformanceMonitoring() {
    // Page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        this.performanceMetrics = {
          ...this.performanceMetrics,
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          timeToFirstByte: navigation.responseStart - navigation.requestStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          navigationTiming: {
            connectEnd: navigation.connectEnd,
            connectStart: navigation.connectStart,
            domainLookupEnd: navigation.domainLookupEnd,
            domainLookupStart: navigation.domainLookupStart,
            fetchStart: navigation.fetchStart,
            loadEventEnd: navigation.loadEventEnd,
            loadEventStart: navigation.loadEventStart,
            responseEnd: navigation.responseEnd,
            responseStart: navigation.responseStart
          }
        };

        // First Paint and First Contentful Paint
        paintEntries.forEach(entry => {
          if (entry.name === 'first-paint') {
            this.performanceMetrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            this.performanceMetrics.fcp = entry.startTime;
          }
        });

        this.logPerformanceData();
      }, 1000);
    });
  }

  private setupWebVitalsTracking() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.performanceMetrics.lcp = lastEntry.startTime;
          
          this.sendWebVitals('LCP', lastEntry.startTime, this.getVitalRating('lcp', lastEntry.startTime));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.performanceMetrics.fid = entry.processingStart - entry.startTime;
            
            this.sendWebVitals('FID', entry.processingStart - entry.startTime, this.getVitalRating('fid', entry.processingStart - entry.startTime));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          this.performanceMetrics.cls = clsValue;
          this.sendWebVitals('CLS', clsValue, this.getVitalRating('cls', clsValue));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('[MobilePerformanceMonitor] PerformanceObserver not supported:', error);
      }
    }
  }

  private setupTimingTracking() {
    // Resource timing
    setTimeout(() => {
      const resourceEntries = performance.getEntriesByType('resource');
      this.performanceMetrics.resourceTiming = resourceEntries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        transferSize: (entry as any).transferSize,
        initiatorType: (entry as any).initiatorType
      }));
    }, 2000);
  }

  private setupMemoryMonitoring() {
    // Memory usage monitoring (mobile-critical)
    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsageMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        this.performanceMetrics.memoryUsage = memoryUsageMB;

        // Alert on high memory usage (mobile threshold)
        if (memoryUsageMB > 100) {
          this.logError({
            type: 'performance',
            message: `High memory usage detected: ${memoryUsageMB}MB`,
            memoryUsage: memoryUsageMB,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          });
        }
      }
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  private setupVisibilityTracking() {
    // Track page visibility changes (mobile app switching)
    document.addEventListener('visibilitychange', () => {
      this.addBreadcrumb('navigation', 'Page visibility changed', { 
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });
  }

  private getVitalRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getDeviceInfo() {
    const isMobile = window.innerWidth < 768;
    const connection = (navigator as any).connection;
    
    return {
      userAgent: navigator.userAgent,
      isMobile,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      deviceMemory: (navigator as any).deviceMemory,
      connection: connection ? connection.effectiveType : undefined,
      hardwareConcurrency: navigator.hardwareConcurrency,
      platform: navigator.platform
    };
  }

  private addBreadcrumb(category: string, message: string, data?: any) {
    const breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data
    };

    this.breadcrumbs.push(breadcrumb);
    
    // Keep only last 20 breadcrumbs
    if (this.breadcrumbs.length > 20) {
      this.breadcrumbs = this.breadcrumbs.slice(-20);
    }
  }

  private async logError(errorData: any) {
    try {
      const crashReport: CrashData = {
        sessionId: this.sessionId,
        userId: this.userId,
        errorType: errorData.type,
        errorMessage: errorData.message,
        errorStack: errorData.stack,
        url: errorData.url,
        userAgent: errorData.userAgent,
        deviceInfo: this.getDeviceInfo(),
        breadcrumbs: [...this.breadcrumbs],
        customData: errorData
      };

      await this.sendToAPI('crash', crashReport);
    } catch (error) {
      console.error('[MobilePerformanceMonitor] Failed to log error:', error);
    }
  }

  private async logPerformanceData() {
    try {
      const performanceData: PerformanceData = {
        sessionId: this.sessionId,
        userId: this.userId,
        deviceInfo: this.getDeviceInfo(),
        performanceData: {
          ...this.performanceMetrics,
          javaScriptErrors: [...this.errorBuffer]
        },
        errorLogs: [...this.errorBuffer]
      };

      await this.sendToAPI('performance', performanceData);
    } catch (error) {
      console.error('[MobilePerformanceMonitor] Failed to log performance data:', error);
    }
  }

  private async sendWebVitals(metricName: string, metricValue: number, metricRating: string) {
    try {
      const vitalsData = {
        sessionId: this.sessionId,
        userId: this.userId,
        metricName,
        metricValue,
        metricRating,
        pageUrl: window.location.href,
        deviceInfo: this.getDeviceInfo()
      };

      await this.sendToAPI('vitals', vitalsData);
    } catch (error) {
      console.error('[MobilePerformanceMonitor] Failed to send web vitals:', error);
    }
  }

  private async sendToAPI(type: string, data: any) {
    try {
      const response = await fetch('/api/mobile/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('[MobilePerformanceMonitor] API request failed:', error);
      // Store in localStorage for retry
      this.storeForRetry(type, data);
    }
  }

  private storeForRetry(type: string, data: any) {
    try {
      const stored = localStorage.getItem('skrbl_performance_retry') || '[]';
      const retryQueue = JSON.parse(stored);
      
      retryQueue.push({
        type,
        data,
        timestamp: new Date().toISOString()
      });

      // Keep only last 50 entries
      const trimmed = retryQueue.slice(-50);
      localStorage.setItem('skrbl_performance_retry', JSON.stringify(trimmed));
    } catch (error) {
      console.error('[MobilePerformanceMonitor] Failed to store retry data:', error);
    }
  }

  // Public methods
  public logCustomError(message: string, customData?: any) {
    this.logError({
      type: 'custom',
      message,
      customData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public addCustomBreadcrumb(message: string, data?: any) {
    this.addBreadcrumb('custom', message, data);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  // Force performance data collection and send
  public async flushData() {
    await this.logPerformanceData();
  }

  // Retry failed requests
  public async retryFailedRequests() {
    try {
      const stored = localStorage.getItem('skrbl_performance_retry');
      if (!stored) return;

      const retryQueue = JSON.parse(stored);
      const successful: number[] = [];

      for (let i = 0; i < retryQueue.length; i++) {
        const item = retryQueue[i];
        try {
          await this.sendToAPI(item.type, item.data);
          successful.push(i);
        } catch (error) {
          console.warn('[MobilePerformanceMonitor] Retry failed for item:', i);
        }
      }

      // Remove successful items
      const remaining = retryQueue.filter((_: any, index: number) => !successful.includes(index));
      localStorage.setItem('skrbl_performance_retry', JSON.stringify(remaining));

      if (successful.length > 0) {
        console.log(`[MobilePerformanceMonitor] Successfully retried ${successful.length} failed requests`);
      }
    } catch (error) {
      console.error('[MobilePerformanceMonitor] Failed to retry requests:', error);
    }
  }
}

// Global instance
let globalMonitor: MobilePerformanceMonitor | null = null;

export function initMobilePerformanceMonitor(userId?: string): MobilePerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new MobilePerformanceMonitor(userId);
    
    // Retry failed requests on initialization
    setTimeout(() => {
      globalMonitor?.retryFailedRequests();
    }, 2000);
  }
  
  return globalMonitor;
}

export function getMobilePerformanceMonitor(): MobilePerformanceMonitor | null {
  return globalMonitor;
}

// React Error Boundary integration
export function logReactError(error: Error, errorInfo: any) {
  if (globalMonitor) {
    globalMonitor.logCustomError(`React Error: ${error.message}`, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }
}

export default MobilePerformanceMonitor; 