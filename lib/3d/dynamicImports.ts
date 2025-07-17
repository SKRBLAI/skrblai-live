/**
 * SKRBL AI 3D Dynamic Import Utility
 * 
 * Provides SSR-safe, lazy-loaded imports for Three.js modules
 * Includes fallback mechanisms and mobile optimization
 * 
 * @version 1.0.0
 * @author SKRBL AI Team - 3D Infrastructure
 */

import React, { type ComponentType, type LazyExoticComponent } from 'react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ThreeJSModules {
  Canvas?: ComponentType<any>;
  useFrame?: any;
  useThree?: any;
  extend?: any;
  // Drei helpers
  OrbitControls?: ComponentType<any>;
  Text?: ComponentType<any>;
  Float?: ComponentType<any>;
  Environment?: ComponentType<any>;
  PerspectiveCamera?: ComponentType<any>;
  // Core Three.js
  THREE?: any;
}

export interface LoadOptions {
  fallback?: ComponentType<any>;
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface Device3DCapabilities {
  hasWebGL: boolean;
  hasPerformance: boolean;
  isMobile: boolean;
  shouldUseFallback: boolean;
  maxComplexity: 'low' | 'medium' | 'high';
}

// =============================================================================
// DEVICE CAPABILITY DETECTION
// =============================================================================

export const detect3DCapabilities = (): Device3DCapabilities => {
  if (typeof window === 'undefined') {
    return {
      hasWebGL: false,
      hasPerformance: false,
      isMobile: false,
      shouldUseFallback: true,
      maxComplexity: 'low'
    };
  }

  // WebGL detection
  const canvas = document.createElement('canvas');
  const webGL = !!(
    canvas.getContext('webgl') || 
    canvas.getContext('experimental-webgl') ||
    canvas.getContext('webgl2')
  );

  // Mobile detection
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Performance heuristics
  const hasGoodPerformance = (() => {
    if (!webGL) return false;
    
    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 1;
    if (cores < 4) return false;

    // Check memory (if available)
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) return false;

    return true;
  })();

  // Complexity determination
  const maxComplexity = (() => {
    if (!webGL || isMobile) return 'low';
    if (!hasGoodPerformance) return 'medium';
    return 'high';
  })();

  return {
    hasWebGL: webGL,
    hasPerformance: hasGoodPerformance,
    isMobile,
    shouldUseFallback: !webGL || (isMobile && !hasGoodPerformance),
    maxComplexity
  };
};

// =============================================================================
// DYNAMIC IMPORT MANAGER
// =============================================================================

export class ThreeDynamicLoader {
  private static instance: ThreeDynamicLoader;
  private loadedModules: ThreeJSModules = {};
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private capabilities: Device3DCapabilities;

  constructor() {
    this.capabilities = detect3DCapabilities();
  }

  static getInstance(): ThreeDynamicLoader {
    if (!ThreeDynamicLoader.instance) {
      ThreeDynamicLoader.instance = new ThreeDynamicLoader();
    }
    return ThreeDynamicLoader.instance;
  }

  get device3DCapabilities(): Device3DCapabilities {
    return this.capabilities;
  }

  /**
   * Load React Three Fiber core modules
   */
  async loadFiberCore(options: LoadOptions = {}): Promise<ThreeJSModules> {
    const cacheKey = 'fiber-core';
    
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadPromise = this.performLoad(
      () => import('@react-three/fiber'),
      'Canvas',
      options
    );

    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const modules = await loadPromise;
      this.loadedModules = { ...this.loadedModules, ...modules };
      options.onSuccess?.();
      return modules;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      options.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Load Drei helper modules
   */
  async loadDreiHelpers(options: LoadOptions = {}): Promise<ThreeJSModules> {
    const cacheKey = 'drei-helpers';
    
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadPromise = this.performLoad(
      () => import('@react-three/drei'),
      'OrbitControls',
      options
    );

    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const modules = await loadPromise;
      this.loadedModules = { ...this.loadedModules, ...modules };
      options.onSuccess?.();
      return modules;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      options.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Load Three.js core
   */
  async loadThreeCore(options: LoadOptions = {}): Promise<ThreeJSModules> {
    const cacheKey = 'three-core';
    
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadPromise = this.performLoad(
      () => import('three'),
      'THREE',
      options
    );

    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const modules = await loadPromise;
      this.loadedModules = { ...this.loadedModules, THREE: modules };
      options.onSuccess?.();
      return { THREE: modules };
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      options.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Load all 3D modules at once
   */
  async loadAll(options: LoadOptions = {}): Promise<ThreeJSModules> {
    try {
      const [fiber, drei, three] = await Promise.all([
        this.loadFiberCore(options),
        this.loadDreiHelpers(options),
        this.loadThreeCore(options)
      ]);

      return { ...fiber, ...drei, ...three };
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Get loaded modules (synchronous access)
   */
  getLoadedModules(): ThreeJSModules {
    return this.loadedModules;
  }

  /**
   * Check if modules are loaded
   */
  isLoaded(moduleKey?: keyof ThreeJSModules): boolean {
    if (moduleKey) {
      return !!this.loadedModules[moduleKey];
    }
    return Object.keys(this.loadedModules).length > 0;
  }

  /**
   * Internal load performer with timeout and retry logic
   */
  private async performLoad(
    importFn: () => Promise<any>,
    exportName: string,
    options: LoadOptions
  ): Promise<any> {
    const { timeout = 10000, retries = 2 } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Import timeout')), timeout);
        });

        const modules = await Promise.race([
          importFn(),
          timeoutPromise
        ]);

        return modules;
      } catch (error) {
        console.warn(`[3D Loader] Attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries) {
          throw new Error(`Failed to load ${exportName} after ${retries + 1} attempts`);
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

// =============================================================================
// CONVENIENCE HOOKS AND UTILITIES
// =============================================================================

/**
 * React hook for loading 3D modules
 */
export const use3DModules = () => {
  const loader = ThreeDynamicLoader.getInstance();
  return {
    capabilities: loader.device3DCapabilities,
    loadFiberCore: (options?: LoadOptions) => loader.loadFiberCore(options),
    loadDreiHelpers: (options?: LoadOptions) => loader.loadDreiHelpers(options),
    loadThreeCore: (options?: LoadOptions) => loader.loadThreeCore(options),
    loadAll: (options?: LoadOptions) => loader.loadAll(options),
    getLoadedModules: () => loader.getLoadedModules(),
    isLoaded: (key?: keyof ThreeJSModules) => loader.isLoaded(key)
  };
};

/**
 * Higher-order component for 3D capability detection
 */
export const with3DCapabilities = <P extends object>(
  Component: ComponentType<P & { capabilities: Device3DCapabilities }>
): ComponentType<P> => {
  const WrappedComponent = (props: P) => {
    const capabilities = detect3DCapabilities();
    return React.createElement(Component, { ...props, capabilities } as P & { capabilities: Device3DCapabilities });
  };
  return WrappedComponent;
};

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const threeDLoader = ThreeDynamicLoader.getInstance();
export default threeDLoader; 