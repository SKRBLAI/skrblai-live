/*
 * SKRBL AI 3D SSR Optimizer
 * Advanced SSR optimisation utilities for React-Three-Fiber components.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================
export interface SSROptimizationConfig {
  enableProgressiveLoading: boolean;
  mobileStrategy: 'fallback' | 'simplified' | 'disabled';
  loadingStrategy: 'eager' | 'lazy' | 'intersection';
  performanceBudget: {
    maxLoadTime: number;
    maxMemoryMB: number;
    maxCPUUsage: number;
  };
  fallbackStrategy: 'placeholder' | 'image' | 'svg' | 'none';
}

export interface DeviceMetrics {
  deviceMemory: number;
  hardwareConcurrency: number;
  connectionSpeed: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  batteryLevel?: number;
  isLowPowerMode: boolean;
}

export interface Mobile3DSettings {
  antialias: boolean;
  shadows: boolean;
  pixelRatio: number;
  powerPreference: 'high-performance' | 'low-power';
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
}

export interface BundleAnalysis {
  totalSize: number;
  loadTime: number;
  cacheHitRate: number;
  resources: Array<{ url: string; size: number; loadTime: number; cached: boolean }>;
}

// =============================================================================
// CORE HELPERS
// =============================================================================
export const getDeviceMetrics = (): DeviceMetrics => {
  // Check for SSR context to avoid hydration issues
  const isSSR = typeof window === 'undefined';
  
  // Return safe default values for server-side rendering
  if (isSSR) {
    return { deviceMemory: 4, hardwareConcurrency: 4, connectionSpeed: 'unknown', isLowPowerMode: false };
  }
  
  // Client-side execution
  const nav = navigator as any;
  
  // Safely access browser APIs
  return {
    deviceMemory: nav.deviceMemory || 4,
    hardwareConcurrency: nav.hardwareConcurrency || 4,
    connectionSpeed: nav.connection?.effectiveType || 'unknown',
    batteryLevel: nav.battery?.level,
    isLowPowerMode: nav.battery?.chargingTime === Infinity && nav.battery?.dischargingTime < 3600
  };
};

export const determine3DLoadingStrategy = (
  m: DeviceMetrics
): 'immediate' | 'deferred' | 'disabled' => {
  if (m.deviceMemory < 2 || m.hardwareConcurrency < 2) return 'disabled';
  if (m.isLowPowerMode || (m.batteryLevel && m.batteryLevel < 0.2)) return 'deferred';
  if (m.connectionSpeed === 'slow-2g' || m.connectionSpeed === '2g') return 'deferred';
  if (m.deviceMemory >= 8 && m.hardwareConcurrency >= 8) return 'immediate';
  return 'deferred';
};

// =============================================================================
// HOC – Progressive Enhancement
// =============================================================================
export const withProgressiveEnhancement = <P extends Record<string, any>>(
  ThreeDComponent: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<P>,
  cfg: Partial<SSROptimizationConfig> = {}
): React.ComponentType<P> => {
  const defaults: SSROptimizationConfig = {
    enableProgressiveLoading: true,
    mobileStrategy: 'simplified',
    loadingStrategy: 'intersection',
    performanceBudget: { maxLoadTime: 3000, maxMemoryMB: 100, maxCPUUsage: 80 },
    fallbackStrategy: 'placeholder'
  };
  const config = { ...defaults, ...cfg };

  const Enhanced: React.FC<P> = (props) => {
    const [shouldLoad3D, setShouldLoad3D] = useState(false);
    const [loadingStrategy, setLoadingStrategy] = useState<'immediate' | 'deferred' | 'disabled'>('deferred');
    const [visible, setVisible] = useState(false);
    const [performanceOk, setPerformanceOk] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // visibility
    useEffect(() => {
      if (!containerRef.current || config.loadingStrategy !== 'intersection') {
        setVisible(true);
        return;
      }
      const ob = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { setVisible(true); ob.disconnect(); }
      }, { threshold: 0.1, rootMargin: '50px' });
      ob.observe(containerRef.current);
      return () => ob.disconnect();
    }, [config.loadingStrategy]);

    // performance monitor
    useEffect(() => {
      // Ensure we're in browser environment and PerformanceObserver exists
      if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;
      
      let perfObs: PerformanceObserver | null = null;
      
      try {
        // Create performance observer with error handling
        perfObs = new PerformanceObserver(() => {
          try {
            // Safely access memory API which might not exist in all browsers
            const memory = (performance as any).memory?.usedJSHeapSize;
            if (memory) {
              const memoryMB = memory / 1048576;
              if (memoryMB > config.performanceBudget.maxMemoryMB) {
                setPerformanceOk(false);
              }
            }
          } catch (err) {
            console.warn('[SSROptimizer] Performance monitoring error:', err);
          }
        });
        
        perfObs.observe({ entryTypes: ['measure','navigation'] });
      } catch (error) {
        console.warn('[SSROptimizer] Could not initialize performance observer:', error);
      }
      
      return () => {
        if (perfObs) {
          try {
            perfObs.disconnect();
          } catch (err) {
            console.warn('[SSROptimizer] Error disconnecting performance observer:', err);
          }
        }
      };
    }, []);

    // decide when to load
    useEffect(() => {
      const metrics = getDeviceMetrics();
      const strat = determine3DLoadingStrategy(metrics);
      setLoadingStrategy(strat);
      if (strat === 'immediate') setShouldLoad3D(true);
      else if (strat === 'deferred' && visible) {
        const t = setTimeout(() => setShouldLoad3D(true), 1000);
        return () => clearTimeout(t);
      }
    }, [visible]);

    const canRender3D = shouldLoad3D && performanceOk && loadingStrategy !== 'disabled';

    // Render paths
    if (!canRender3D) {
      return (
        <div ref={containerRef} className={canRender3D ? 'ssr-3d-ready' : 'ssr-3d-fallback'}>
          {config.fallbackStrategy === 'image' ? <FallbackComponent {...props} /> : (
            <div className="loading-placeholder">Loading 3D…</div>
          )}
        </div>
      );
    }

    return (
      <div ref={containerRef} className="ssr-3d-container">
        <React.Suspense fallback={<FallbackComponent {...props} />}> <ThreeDComponent {...props} /> </React.Suspense>
      </div>
    );
  };
  Enhanced.displayName = `withProgressiveEnhancement(${ThreeDComponent.displayName || ThreeDComponent.name})`;
  return Enhanced;
};

// =============================================================================
// Mobile 3D optimisation hook
// =============================================================================
export const useMobile3DOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState<Mobile3DSettings>({
    antialias: true, shadows: true, pixelRatio: 1, powerPreference: 'high-performance'
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => {
      const mobile = window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
      setIsMobile(mobile);
      const px = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      setSettings({
        antialias: !mobile,
        shadows: !mobile,
        pixelRatio: px,
        powerPreference: mobile ? 'low-power' : 'high-performance',
        alpha: mobile ? false : undefined,
        depth: mobile ? false : undefined,
        stencil: mobile ? false : undefined
      });
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return { isMobile, settings };
};

// =============================================================================
// Utility: bundle analysis (client only)
// =============================================================================
export const analyze3DBundle = async (): Promise<BundleAnalysis | null> => {
  if (typeof window === 'undefined') return null;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const threeRes = resources.filter(r => /three|fiber|drei|3d/.test(r.name));
  return {
    totalSize: threeRes.reduce((s, r) => s + (r.transferSize || 0), 0),
    loadTime: Math.max(...threeRes.map(r => r.duration), 0),
    cacheHitRate: threeRes.filter(r => r.transferSize === 0).length / (threeRes.length || 1),
    resources: threeRes.map(r => ({ url: r.name, size: r.transferSize || 0, loadTime: r.duration, cached: r.transferSize === 0 }))
  };
};

// =============================================================================
// Export singleton helper
// =============================================================================
export const SSROptimizer = {
  getDeviceMetrics,
  determine3DLoadingStrategy,
  withProgressiveEnhancement,
  useMobile3DOptimization,
  analyze3DBundle
};

export default SSROptimizer; 