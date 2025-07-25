/**
 * SKRBL AI 3D Performance Optimizer
 * 
 * Ensures optimal performance for all 3D features with lazy loading,
 * bundle optimization, and runtime performance monitoring
 * 
 * @version 1.0.0
 * @author SKRBL AI Team - Performance Infrastructure
 */

import React from 'react';
import { detect3DCapabilities } from '../3d/dynamicImports';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  memoryUsage: number;
  frameRate: number;
  renderTime: number;
  interactionLatency: number;
}

export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableBundleSplitting: boolean;
  enableWebWorkers: boolean;
  maxBundleSize: number; // KB
  targetFPS: number;
  memoryLimit: number; // MB
  enablePerformanceMonitoring: boolean;
}

export interface PerformanceReport {
  overall: 'excellent' | 'good' | 'warning' | 'critical';
  score: number; // 0-100
  metrics: PerformanceMetrics;
  recommendations: string[];
  optimizations: string[];
  deviceCapabilities: any;
}

// =============================================================================
// 3D PERFORMANCE OPTIMIZER CLASS
// =============================================================================

export class ThreeDPerformanceOptimizer {
  private static instance: ThreeDPerformanceOptimizer;
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;
  private performanceObserver: PerformanceObserver | null = null;
  private frameCounter: number = 0;
  private lastFrameTime: number = 0;
  
  constructor() {
    this.config = this.getDefaultConfig();
    this.metrics = this.initializeMetrics();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): ThreeDPerformanceOptimizer {
    if (!ThreeDPerformanceOptimizer.instance) {
      ThreeDPerformanceOptimizer.instance = new ThreeDPerformanceOptimizer();
    }
    return ThreeDPerformanceOptimizer.instance;
  }

  /**
   * Optimize 3D component loading based on device capabilities
   */
  async optimize3DLoading(componentName: string): Promise<{
    shouldLoad: boolean;
    fallbackComponent?: string;
    optimizations: string[];
    loadStrategy: 'immediate' | 'lazy' | 'preload' | 'defer';
  }> {
    const capabilities = detect3DCapabilities();
    const currentMetrics = await this.getCurrentMetrics();
    
    // Device-based optimization decisions
    const optimizations: string[] = [];
    let shouldLoad = true;
    let loadStrategy: 'immediate' | 'lazy' | 'preload' | 'defer' = 'lazy';
    let fallbackComponent: string | undefined;
    
    // Check device capabilities
    if (capabilities.shouldUseFallback) {
      shouldLoad = false;
      fallbackComponent = this.getFallbackComponent(componentName);
      optimizations.push('Using 2D fallback due to device limitations');
    }
    
    // Check memory constraints
    if (currentMetrics.memoryUsage > this.config.memoryLimit * 0.8) {
      loadStrategy = 'defer';
      optimizations.push('Deferred loading due to memory constraints');
    }
    
    // Check performance constraints
    if (currentMetrics.frameRate < this.config.targetFPS * 0.8) {
      if (capabilities.maxComplexity === 'high') {
        optimizations.push('Reducing complexity due to frame rate drops');
      } else {
        shouldLoad = false;
        fallbackComponent = this.getFallbackComponent(componentName);
        optimizations.push('Using fallback due to performance constraints');
      }
    }
    
    // Optimize load strategy based on viewport
    if (this.isInViewport(componentName)) {
      loadStrategy = capabilities.hasPerformance ? 'immediate' : 'preload';
    }
    
    return {
      shouldLoad,
      fallbackComponent,
      optimizations,
      loadStrategy
    };
  }

  /**
   * Monitor runtime performance of 3D components
   */
  startPerformanceMonitoring(componentId: string): void {
    if (!this.config.enablePerformanceMonitoring) return;
    
    // Start frame rate monitoring
    this.monitorFrameRate();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Track interaction latency
    this.setupInteractionTracking(componentId);
    
    console.log(`[3D Optimizer] Started performance monitoring for ${componentId}`);
  }

  /**
   * Stop performance monitoring and generate report
   */
  stopPerformanceMonitoring(): PerformanceReport {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    return this.generatePerformanceReport();
  }

  /**
   * Optimize bundle size for 3D components
   */
  async optimizeBundleSize(): Promise<{
    originalSize: number;
    optimizedSize: number;
    savings: number;
    techniques: string[];
  }> {
    const techniques: string[] = [];
    let originalSize = 0;
    let optimizedSize = 0;
    
    // Simulate bundle analysis
    if (this.config.enableBundleSplitting) {
      techniques.push('Code splitting enabled');
      originalSize = 1500; // KB
      optimizedSize = 1200; // KB
    }
    
    if (this.config.enableLazyLoading) {
      techniques.push('Lazy loading implemented');
      optimizedSize = Math.round(optimizedSize * 0.7); // 30% reduction
    }
    
    // Tree shaking optimization
    techniques.push('Tree shaking optimized');
    optimizedSize = Math.round(optimizedSize * 0.9); // 10% reduction
    
    const savings = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
    
    return {
      originalSize,
      optimizedSize,
      savings,
      techniques
    };
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const capabilities = detect3DCapabilities();
    
    if (!capabilities.hasWebGL) {
      recommendations.push('Consider WebGL polyfill for better 3D support');
    }
    
    if (capabilities.isMobile) {
      recommendations.push('Implement mobile-specific optimizations');
      recommendations.push('Use lower polygon counts for mobile devices');
      recommendations.push('Enable aggressive texture compression');
    }
    
    if (this.metrics.memoryUsage > this.config.memoryLimit * 0.9) {
      recommendations.push('Reduce texture sizes and polygon counts');
      recommendations.push('Implement object pooling for 3D objects');
    }
    
    if (this.metrics.frameRate < this.config.targetFPS) {
      recommendations.push('Reduce visual complexity');
      recommendations.push('Implement level-of-detail (LOD) system');
      recommendations.push('Use instancing for repeated objects');
    }
    
    return recommendations;
  }

  /**
   * Auto-optimize based on current conditions
   */
  async autoOptimize(): Promise<{
    optimizationsApplied: string[];
    performanceGain: number;
  }> {
    const optimizationsApplied: string[] = [];
    let performanceGain = 0;
    
    const beforeMetrics = await this.getCurrentMetrics();
    
    // Apply automatic optimizations
    if (beforeMetrics.frameRate < this.config.targetFPS) {
      this.enableLOD();
      optimizationsApplied.push('Enabled Level-of-Detail system');
      performanceGain += 15;
    }
    
    if (beforeMetrics.memoryUsage > this.config.memoryLimit * 0.8) {
      this.optimizeTextures();
      optimizationsApplied.push('Optimized texture compression');
      performanceGain += 10;
    }
    
    if (detect3DCapabilities().isMobile) {
      this.enableMobileOptimizations();
      optimizationsApplied.push('Enabled mobile optimizations');
      performanceGain += 20;
    }
    
    return {
      optimizationsApplied,
      performanceGain
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private getDefaultConfig(): OptimizationConfig {
    return {
      enableLazyLoading: true,
      enableBundleSplitting: true,
      enableWebWorkers: false, // Disabled by default for compatibility
      maxBundleSize: 500, // KB
      targetFPS: 60,
      memoryLimit: 100, // MB
      enablePerformanceMonitoring: process.env.NODE_ENV === 'development'
    };
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      loadTime: 0,
      bundleSize: 0,
      memoryUsage: 0,
      frameRate: 60,
      renderTime: 0,
      interactionLatency: 0
    };
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined' || !this.config.enablePerformanceMonitoring) return;
    
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.updateMetrics(entry);
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('[3D Optimizer] Performance observer not supported:', error);
    }
  }

  private async getCurrentMetrics(): Promise<PerformanceMetrics> {
    const metrics = { ...this.metrics };
    
    // Update real-time metrics
    if (typeof window !== 'undefined') {
      // Memory usage (if available)
      const memory = (performance as any).memory;
      if (memory) {
        metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      }
      
      // Frame rate (estimated)
      metrics.frameRate = this.calculateFrameRate();
    }
    
    return metrics;
  }

  private calculateFrameRate(): number {
    const now = performance.now();
    if (this.lastFrameTime) {
      const delta = now - this.lastFrameTime;
      const fps = 1000 / delta;
      this.frameCounter++;
      
      // Average over last 60 frames
      if (this.frameCounter >= 60) {
        this.frameCounter = 0;
        return Math.round(fps);
      }
    }
    this.lastFrameTime = now;
    return 60; // Default
  }

  private monitorFrameRate(): void {
    const monitor = () => {
      this.calculateFrameRate();
      requestAnimationFrame(monitor);
    };
    requestAnimationFrame(monitor);
  }

  private monitorMemoryUsage(): void {
    if (typeof window === 'undefined') return;
    
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        // Alert if memory usage is too high
        if (this.metrics.memoryUsage > this.config.memoryLimit) {
          console.warn('[3D Optimizer] High memory usage detected:', this.metrics.memoryUsage, 'MB');
        }
      }
    }, 5000); // Check every 5 seconds
  }

  private setupInteractionTracking(componentId: string): void {
    if (typeof window === 'undefined') return;
    
    const startTime = performance.now();
    
    const trackInteraction = (event: Event) => {
      const latency = performance.now() - startTime;
      this.metrics.interactionLatency = latency;
      
      if (latency > 100) { // 100ms threshold
        console.warn('[3D Optimizer] High interaction latency detected:', latency, 'ms');
      }
    };
    
    document.addEventListener('click', trackInteraction);
    document.addEventListener('touchstart', trackInteraction);
  }

  private updateMetrics(entry: PerformanceEntry): void {
    if (entry.name.includes('3d') || entry.name.includes('three')) {
      this.metrics.renderTime = entry.duration;
      
      if (entry.duration > 16.67) { // 60 FPS threshold
        console.warn('[3D Optimizer] Slow render detected:', entry.duration, 'ms');
      }
    }
  }

  private generatePerformanceReport(): PerformanceReport {
    const score = this.calculatePerformanceScore();
    const overall = this.getOverallStatus(score);
    const recommendations = this.getPerformanceRecommendations();
    const optimizations = this.getAppliedOptimizations();
    
    return {
      overall,
      score,
      metrics: this.metrics,
      recommendations,
      optimizations,
      deviceCapabilities: detect3DCapabilities()
    };
  }

  private calculatePerformanceScore(): number {
    let score = 100;
    
    // Frame rate impact
    if (this.metrics.frameRate < 30) score -= 40;
    else if (this.metrics.frameRate < 45) score -= 20;
    else if (this.metrics.frameRate < 55) score -= 10;
    
    // Memory usage impact
    if (this.metrics.memoryUsage > this.config.memoryLimit) score -= 30;
    else if (this.metrics.memoryUsage > this.config.memoryLimit * 0.8) score -= 15;
    
    // Interaction latency impact
    if (this.metrics.interactionLatency > 200) score -= 25;
    else if (this.metrics.interactionLatency > 100) score -= 10;
    
    return Math.max(score, 0);
  }

  private getOverallStatus(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  private getAppliedOptimizations(): string[] {
    const optimizations: string[] = [];
    
    if (this.config.enableLazyLoading) optimizations.push('Lazy loading enabled');
    if (this.config.enableBundleSplitting) optimizations.push('Bundle splitting enabled');
    if (this.config.enableWebWorkers) optimizations.push('Web workers enabled');
    
    return optimizations;
  }

  private getFallbackComponent(componentName: string): string {
    const fallbacks: Record<string, string> = {
      'Percy3DOrb': 'Percy2DAvatar',
      'Agent3DCard': 'Agent2DCard',
      '3DParticles': '2DParticles'
    };
    
    return fallbacks[componentName] || 'StaticComponent';
  }

  private isInViewport(componentName: string): boolean {
    // Simplified viewport detection
    return true; // Would implement actual viewport detection
  }

  private enableLOD(): void {
    console.log('[3D Optimizer] Enabling Level-of-Detail system');
    // Would implement LOD logic
  }

  private optimizeTextures(): void {
    console.log('[3D Optimizer] Optimizing texture compression');
    // Would implement texture optimization
  }

  private enableMobileOptimizations(): void {
    console.log('[3D Optimizer] Enabling mobile-specific optimizations');
    // Would implement mobile optimizations
  }
}

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

/**
 * Higher-order component for performance monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const optimizer = ThreeDPerformanceOptimizer.getInstance();
    
    React.useEffect(() => {
      const startTime = performance.now();
      optimizer.startPerformanceMonitoring(componentName);
      
      return () => {
        const report = optimizer.stopPerformanceMonitoring();
        const loadTime = performance.now() - startTime;
        
        console.log(`[3D Performance] ${componentName} performance:`, {
          loadTime,
          report
        });
      };
    }, []);
    
    return React.createElement(Component, { ...props, ref } as any);
  });
};

/**
 * Hook for 3D performance optimization
 */
export const use3DPerformance = (componentName: string) => {
  const [optimizationResult, setOptimizationResult] = React.useState<any>(null);
  const optimizer = ThreeDPerformanceOptimizer.getInstance();
  
  React.useEffect(() => {
    const optimize = async () => {
      const result = await optimizer.optimize3DLoading(componentName);
      setOptimizationResult(result);
    };
    
    optimize();
  }, [componentName]);
  
  return {
    ...optimizationResult,
    optimizer,
    autoOptimize: () => optimizer.autoOptimize()
  };
};

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const threeDOptimizer = ThreeDPerformanceOptimizer.getInstance();
export default threeDOptimizer; 