/**
 * Production Optimizer - SKRBL AI Platform
 * Removes console logs, optimizes performance for production
 */

import React from 'react';

interface OptimizationConfig {
  removeConsoleLogging: boolean;
  optimizeAnimations: boolean;
  enableMetricsAggregation: boolean;
  maxIntervalDuration: number;
}

class ProductionOptimizer {
  private config: OptimizationConfig;
  private isProduction: boolean;
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<OptimizationConfig>) {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.config = {
      removeConsoleLogging: true,
      optimizeAnimations: true,
      enableMetricsAggregation: true,
      maxIntervalDuration: 10000, // 10 seconds max for production
      ...config
    };

    if (this.isProduction && this.config.removeConsoleLogging) {
      this.disableConsoleLogging();
    }
  }

  /**
   * Disable console logging in production
   */
  private disableConsoleLogging(): void {
    if (typeof window !== 'undefined') {
      // Preserve error logging but disable debug logs
      const originalError = console.error;
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.debug = () => {};
      
      // Keep error logging but make it less verbose
      console.error = (...args: any[]) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('[CRITICAL]')) {
          originalError.apply(console, args);
        }
      };
    }
  }

  /**
   * Optimized interval management for live metrics
   */
  public createOptimizedInterval(
    key: string,
    callback: () => void,
    duration: number,
    options?: { 
      reducedMotion?: boolean;
      priority?: 'high' | 'medium' | 'low';
    }
  ): () => void {
    // Clear existing interval if exists
    this.clearInterval(key);

    // Optimize duration for production
    let optimizedDuration = duration;
    if (this.isProduction) {
      optimizedDuration = Math.min(duration, this.config.maxIntervalDuration);
      
      // Reduce frequency for low priority animations
      if (options?.priority === 'low') {
        optimizedDuration = Math.max(optimizedDuration * 2, 15000);
      }
    }

    // Check for reduced motion preference
    if (options?.reducedMotion && typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        optimizedDuration = Math.max(optimizedDuration * 3, 30000);
      }
    }

    const interval = setInterval(callback, optimizedDuration);
    this.activeIntervals.set(key, interval);

    // Return cleanup function
    return () => this.clearInterval(key);
  }

  /**
   * Clear specific interval
   */
  public clearInterval(key: string): void {
    const interval = this.activeIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.activeIntervals.delete(key);
    }
  }

  /**
   * Clear all intervals
   */
  public clearAllIntervals(): void {
    this.activeIntervals.forEach((interval) => clearInterval(interval));
    this.activeIntervals.clear();
  }

  /**
   * Aggregate metrics for better performance
   */
  public createMetricsAggregator<T extends Record<string, number>>(
    initialMetrics: T,
    updateRules: Partial<Record<keyof T, { min?: number; max?: number; increment?: number }>>
  ) {
    return {
      metrics: { ...initialMetrics },
      
      update: function(this: { metrics: T }) {
        Object.keys(updateRules).forEach((key) => {
          const rule = updateRules[key];
          if (rule) {
            const currentValue = this.metrics[key];
            const increment = rule.increment || Math.floor(Math.random() * 5) + 1;
            let newValue = currentValue + increment;
            
            if (rule.min !== undefined) newValue = Math.max(newValue, rule.min);
            if (rule.max !== undefined) newValue = Math.min(newValue, rule.max);
            
            this.metrics[key] = newValue;
          }
        });
      }
    };
  }

  /**
   * Performance-optimized animation frame
   */
  public createAnimationFrame(callback: () => void, priority: 'high' | 'medium' | 'low' = 'medium'): () => void {
    let frameId: number;
    let lastTime = 0;
    
    // Different throttling based on priority
    const throttleMs = {
      high: 16,    // ~60fps
      medium: 33,  // ~30fps  
      low: 66      // ~15fps
    }[priority];

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= throttleMs) {
        callback();
        lastTime = currentTime;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }

  /**
   * Memory cleanup utility
   */
  public cleanup(): void {
    this.clearAllIntervals();
  }
}

// Global instance
export const productionOptimizer = new ProductionOptimizer();

// React hook for optimized intervals
export function useOptimizedInterval(
  callback: () => void,
  delay: number,
  options?: {
    key?: string;
    priority?: 'high' | 'medium' | 'low';
    reducedMotion?: boolean;
  }
) {
  const key = options?.key || `interval_${Date.now()}_${Math.random()}`;
  
  React.useEffect(() => {
    const cleanup = productionOptimizer.createOptimizedInterval(
      key,
      callback,
      delay,
      {
        priority: options?.priority,
        reducedMotion: options?.reducedMotion
      }
    );

    return cleanup;
  }, [callback, delay, key, options?.priority, options?.reducedMotion]);
}

export default ProductionOptimizer; 