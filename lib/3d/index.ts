/**
 * SKRBL AI 3D Infrastructure - Modular Exports
 * 
 * Tree-shakable, SSR-safe 3D components and utilities
 * Use dynamic imports to ensure optimal bundle size
 * 
 * @version 1.0.0
 * @author SKRBL AI Team - 3D Infrastructure
 */

import React from 'react';
import type { Device3DCapabilities } from './dynamicImports';

// =============================================================================
// DYNAMIC IMPORTS (SSR-SAFE)
// =============================================================================

/**
 * Dynamic import for 3D utilities and device detection
 */
export const load3DUtils = () => import('./dynamicImports').then(module => ({
  threeDLoader: module.threeDLoader,
  detect3DCapabilities: module.detect3DCapabilities,
  use3DModules: module.use3DModules,
  with3DCapabilities: module.with3DCapabilities,
  ThreeDynamicLoader: module.ThreeDynamicLoader
}));

/**
 * Dynamic import for Percy 3D Orb
 */
export const loadPercy3DOrb = () => import('./Percy3DOrbCore').then(module => ({
  Percy3DOrbCore: module.default,
  Percy3DOrbProvider: module.Percy3DOrbProvider,
  DEFAULT_THEME: module.DEFAULT_THEME,
  SIZE_CONFIGS: module.SIZE_CONFIGS,
  COMPLEXITY_CONFIGS: module.COMPLEXITY_CONFIGS
}));

/**
 * Dynamic import for Agent 3D Cards
 */
export const loadAgent3DCard = () => import('./Agent3DCardCore').then(module => ({
  Agent3DCardCore: module.default,
  Agent3DCardProvider: module.Agent3DCardProvider,
  DEFAULT_CARD_CONFIG: module.DEFAULT_CARD_CONFIG,
  CARD_GEOMETRIES: module.CARD_GEOMETRIES
}));

// =============================================================================
// TYPE EXPORTS (ALWAYS AVAILABLE)
// =============================================================================

export type { 
  ThreeJSModules, 
  LoadOptions, 
  Device3DCapabilities 
} from './dynamicImports';

export type { 
  Percy3DOrbTheme, 
  Percy3DOrbProps, 
  OrbState, 
  OrbGeometry 
} from './Percy3DOrbCore';

export type { 
  Agent3DCardProps, 
  Agent3DCardState, 
  CardTransform, 
  CardMaterial, 
  CardGeometry 
} from './Agent3DCardCore';

// =============================================================================
// SSR-SAFE 3D FEATURE DETECTION
// =============================================================================

/**
 * Check if 3D features should be enabled (SSR-safe)
 */
export const shouldEnable3D = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    const webGL = !!(
      canvas.getContext('webgl') || 
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webgl2')
    );
    return webGL;
  } catch {
    return false;
  }
};

/**
 * Get device performance tier (SSR-safe)
 */
export const getDevicePerformanceTier = (): 'low' | 'medium' | 'high' => {
  if (typeof window === 'undefined') return 'low';
  
  try {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) return 'low';
    
    const cores = navigator.hardwareConcurrency || 1;
    const memory = (navigator as any).deviceMemory || 2;
    
    if (cores >= 8 && memory >= 8) return 'high';
    if (cores >= 4 && memory >= 4) return 'medium';
    return 'low';
  } catch {
    return 'low';
  }
};

// =============================================================================
// CONVENIENCE HOOKS (LAZY-LOADED)
// =============================================================================

/**
 * React hook for lazy-loaded 3D capabilities
 */
export const use3DCapabilities = () => {
  const [capabilities, setCapabilities] = React.useState<Device3DCapabilities | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadCapabilities = async () => {
      try {
        const { detect3DCapabilities } = await load3DUtils();
        setCapabilities(detect3DCapabilities());
      } catch (error) {
        console.warn('[3D] Failed to load capabilities:', error);
        setCapabilities({
          hasWebGL: false,
          hasPerformance: false,
          isMobile: true,
          shouldUseFallback: true,
          maxComplexity: 'low'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCapabilities();
  }, []);
  
  return { capabilities, isLoading };
};

/**
 * React hook for lazy-loaded Percy 3D Orb
 */
export const usePercy3DOrb = (props: any) => {
  const [OrbComponent, setOrbComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    const loadOrb = async () => {
      try {
        const { Percy3DOrbProvider } = await loadPercy3DOrb();
        setOrbComponent(() => Percy3DOrbProvider);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (shouldEnable3D()) {
      loadOrb();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  return { OrbComponent, isLoading, error };
};

/**
 * React hook for lazy-loaded Agent 3D Cards
 */
export const useAgent3DCard = (props: any) => {
  const [CardComponent, setCardComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    const loadCard = async () => {
      try {
        const { Agent3DCardProvider } = await loadAgent3DCard();
        setCardComponent(() => Agent3DCardProvider);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (shouldEnable3D()) {
      loadCard();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  return { CardComponent, isLoading, error };
};

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

/**
 * Bundle size optimized component loader
 */
export const create3DLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<T>,
  exportName: keyof T,
  fallbackComponent?: React.ComponentType<any>
) => {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      return { default: module[exportName] as React.ComponentType<any> };
    } catch (error) {
      console.warn('[3D] Failed to load component:', error);
      
      if (fallbackComponent) {
        return { default: fallbackComponent };
      }
      
      // Return minimal fallback
      return { 
        default: () => React.createElement('div', { 
          className: '3d-fallback' 
        }, 'Loading...') 
      };
    }
  });
};

/**
 * 3D feature flag with performance budgeting
 */
export const with3DFeatureFlag = (
  feature: '3d-orb' | '3d-cards' | '3d-particles',
  performanceBudget: number = 100 // ms
) => {
  return (Component: React.ComponentType<any>) => {
    return React.forwardRef<any, any>((props, ref) => {
      const [shouldRender, setShouldRender] = React.useState(false);
      const [performanceMetric, setPerformanceMetric] = React.useState(0);
      
      React.useEffect(() => {
        const startTime = performance.now();
        
        const checkPerformance = () => {
          const loadTime = performance.now() - startTime;
          setPerformanceMetric(loadTime);
          
          // Only render if within performance budget
          setShouldRender(loadTime <= performanceBudget);
        };
        
        // Defer check to next frame
        requestAnimationFrame(checkPerformance);
      }, []);
      
      if (!shouldRender) {
        return React.createElement('div', {
          className: `${feature}-fallback`,
          'data-performance-metric': performanceMetric
        }, 'Optimizing...');
      }
      
      return React.createElement(Component, { ...props, ref });
    });
  };
};

// =============================================================================
// LEGACY SUPPORT
// =============================================================================

/**
 * Legacy compatibility for existing components
 */
export const legacy3DSupport = {
  shouldUseFallback: () => !shouldEnable3D(),
  getPerformanceTier: getDevicePerformanceTier,
  
  // Deprecated - use load3DUtils instead
  get3DCapabilities: () => {
    console.warn('[3D] get3DCapabilities is deprecated, use load3DUtils instead');
    return load3DUtils().then(utils => utils.detect3DCapabilities());
  }
};

export default {
  load3DUtils,
  loadPercy3DOrb,
  loadAgent3DCard,
  shouldEnable3D,
  getDevicePerformanceTier,
  use3DCapabilities,
  usePercy3DOrb,
  useAgent3DCard,
  create3DLazyComponent,
  with3DFeatureFlag,
  legacy3DSupport
}; 