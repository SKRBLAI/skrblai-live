/**
 * SKRBL AI Percy 3D Orb Hero - Core Logic
 * 
 * Provides the 3D mechanics and interactions for Percy's orb avatar
 * Handles device capabilities, fallbacks, and performance optimization
 * 
 * @version 1.0.0
 * @author SKRBL AI Team - 3D Infrastructure
 */

'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { use3DModules, type Device3DCapabilities } from './dynamicImports';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Percy3DOrbTheme {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  particles: string;
  // Animation timing
  rotationSpeed: number;
  pulseSpeed: number;
  hoverScale: number;
  clickScale: number;
}

export interface Percy3DOrbProps {
  // Visual configuration
  theme?: Percy3DOrbTheme;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  
  // Behavior configuration
  autoRotate?: boolean;
  enableHover?: boolean;
  enableClick?: boolean;
  enableParticles?: boolean;
  enableGlow?: boolean;
  
  // Performance configuration
  complexity?: 'low' | 'medium' | 'high' | 'auto';
  maxFPS?: number;
  enableLOD?: boolean; // Level of Detail
  
  // Mobile configuration
  mobileOptimized?: boolean;
  mobileComplexity?: 'low' | 'medium';
  
  // Fallback configuration
  fallbackComponent?: React.ComponentType<any>;
  fallbackProps?: any;
  
  // Interaction callbacks
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onHover?: (isHovered: boolean) => void;
  onClick?: () => void;
  onReady?: () => void;
  
  // Analytics/tracking
  trackInteractions?: boolean;
  analyticsId?: string;
}

export interface OrbState {
  isLoaded: boolean;
  isError: boolean;
  isHovered: boolean;
  isClicked: boolean;
  rotationY: number;
  scale: number;
  glowIntensity: number;
  particleCount: number;
}

export interface OrbGeometry {
  radius: number;
  segments: number;
  rings: number;
  complexity: number;
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

export const DEFAULT_THEME: Percy3DOrbTheme = {
  primary: '#30D5C8',
  secondary: '#1E90FF', 
  accent: '#e879f9',
  glow: '#00ffff',
  particles: '#ffffff',
  rotationSpeed: 1,
  pulseSpeed: 2,
  hoverScale: 1.1,
  clickScale: 0.95
};

export const SIZE_CONFIGS = {
  sm: { width: 80, height: 80, radius: 1 },
  md: { width: 120, height: 120, radius: 1.5 },
  lg: { width: 160, height: 160, radius: 2 },
  xl: { width: 200, height: 200, radius: 2.5 }
} as const;

export const COMPLEXITY_CONFIGS = {
  low: { segments: 8, rings: 6, particles: 20, effects: false },
  medium: { segments: 16, rings: 12, particles: 50, effects: true },
  high: { segments: 32, rings: 24, particles: 100, effects: true }
} as const;

// =============================================================================
// CORE ORB LOGIC CLASS
// =============================================================================

export class Percy3DOrbCore {
  private state: OrbState;
  private config: Required<Percy3DOrbProps>;
  private capabilities: Device3DCapabilities;
  private geometry: OrbGeometry;
  private animationFrame: number | null = null;
  private startTime: number;

  constructor(props: Percy3DOrbProps, capabilities: Device3DCapabilities) {
    this.capabilities = capabilities;
    this.config = this.mergeWithDefaults(props);
    this.geometry = this.calculateGeometry();
    this.startTime = Date.now();
    
    this.state = {
      isLoaded: false,
      isError: false,
      isHovered: false,
      isClicked: false,
      rotationY: 0,
      scale: 1,
      glowIntensity: 0.5,
      particleCount: this.geometry.complexity
    };
  }

  /**
   * Initialize the orb with proper configuration
   */
  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Device-specific optimizations
        if (this.capabilities.shouldUseFallback) {
          throw new Error('3D not supported, using fallback');
        }

        // Setup animation loop
        this.startAnimationLoop();
        
        this.state.isLoaded = true;
        this.config.onLoad?.();
        this.config.onReady?.();
        
        resolve();
      } catch (error) {
        this.state.isError = true;
        this.config.onError?.(error as Error);
        reject(error);
      }
    });
  }

  /**
   * Update orb state based on interactions
   */
  updateState(updates: Partial<OrbState>): void {
    this.state = { ...this.state, ...updates };
    
    // Trigger callbacks
    if ('isHovered' in updates) {
      this.config.onHover?.(updates.isHovered!);
    }
  }

  /**
   * Handle hover interactions
   */
  onHover = (isHovered: boolean): void => {
    if (!this.config.enableHover) return;
    
    this.updateState({
      isHovered,
      scale: isHovered ? this.config.theme.hoverScale : 1,
      glowIntensity: isHovered ? 0.8 : 0.5
    });

    if (this.config.trackInteractions) {
      this.trackInteraction('hover', { isHovered });
    }
  };

  /**
   * Handle click interactions
   */
  onClick = (): void => {
    if (!this.config.enableClick) return;
    
    this.updateState({
      isClicked: true,
      scale: this.config.theme.clickScale
    });

    // Reset click state after animation
    setTimeout(() => {
      this.updateState({
        isClicked: false,
        scale: this.state.isHovered ? this.config.theme.hoverScale : 1
      });
    }, 150);

    this.config.onClick?.();

    if (this.config.trackInteractions) {
      this.trackInteraction('click', {});
    }
  };

  /**
   * Get current render props for 3D components
   */
  getRenderProps() {
    const sizeConfig = SIZE_CONFIGS[this.config.size];
    
    return {
      // Geometry
      radius: sizeConfig.radius,
      segments: this.geometry.segments,
      rings: this.geometry.rings,
      
      // Transform
      rotation: [0, this.state.rotationY, 0] as [number, number, number],
      scale: [this.state.scale, this.state.scale, this.state.scale] as [number, number, number],
      
      // Material
      color: this.config.theme.primary,
      emissive: this.config.theme.glow,
      glowIntensity: this.state.glowIntensity,
      
      // Particles
      particleCount: this.state.particleCount,
      particleColor: this.config.theme.particles,
      
      // Animation
      autoRotate: this.config.autoRotate,
      rotationSpeed: this.config.theme.rotationSpeed,
      
      // Interaction handlers
      onPointerEnter: () => this.onHover(true),
      onPointerLeave: () => this.onHover(false),
      onClick: this.onClick
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private mergeWithDefaults(props: Percy3DOrbProps): Required<Percy3DOrbProps> {
    return {
      theme: { ...DEFAULT_THEME, ...props.theme },
      size: props.size || 'md',
      className: props.className || '',
      autoRotate: props.autoRotate ?? true,
      enableHover: props.enableHover ?? true,
      enableClick: props.enableClick ?? true,
      enableParticles: props.enableParticles ?? true,
      enableGlow: props.enableGlow ?? true,
      complexity: props.complexity || 'auto',
      maxFPS: props.maxFPS || 60,
      enableLOD: props.enableLOD ?? true,
      mobileOptimized: props.mobileOptimized ?? true,
      mobileComplexity: props.mobileComplexity || 'low',
      fallbackComponent: props.fallbackComponent || (() => null),
      fallbackProps: props.fallbackProps || {},
      onLoad: props.onLoad || (() => {}),
      onError: props.onError || (() => {}),
      onHover: props.onHover || (() => {}),
      onClick: props.onClick || (() => {}),
      onReady: props.onReady || (() => {}),
      trackInteractions: props.trackInteractions ?? false,
      analyticsId: props.analyticsId || 'percy-3d-orb'
    };
  }

  private calculateGeometry(): OrbGeometry {
    let complexity = this.config.complexity;
    
    // Auto-detect complexity based on device capabilities
    if (complexity === 'auto') {
      complexity = this.capabilities.maxComplexity;
    }

    // Mobile optimizations
    if (this.capabilities.isMobile && this.config.mobileOptimized) {
      complexity = this.config.mobileComplexity;
    }

    const complexityConfig = COMPLEXITY_CONFIGS[complexity];
    const sizeConfig = SIZE_CONFIGS[this.config.size];

    return {
      radius: sizeConfig.radius,
      segments: complexityConfig.segments,
      rings: complexityConfig.rings,
      complexity: complexityConfig.particles
    };
  }

  private startAnimationLoop(): void {
    const animate = () => {
      if (!this.state.isLoaded) return;

      const elapsed = (Date.now() - this.startTime) / 1000;
      
      // Auto rotation
      if (this.config.autoRotate) {
        this.state.rotationY = elapsed * this.config.theme.rotationSpeed;
      }

      // Pulse effect
      const pulse = Math.sin(elapsed * this.config.theme.pulseSpeed) * 0.1 + 0.9;
      this.state.glowIntensity = this.state.isHovered ? 0.8 : pulse * 0.5;

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  private trackInteraction(type: string, data: any): void {
    if (!this.config.trackInteractions) return;
    
    // Placeholder for analytics integration
    console.log(`[Percy 3D Orb] ${type}:`, {
      analyticsId: this.config.analyticsId,
      timestamp: Date.now(),
      ...data
    });
  }
}

// =============================================================================
// REACT COMPONENT WRAPPER
// =============================================================================

export const Percy3DOrbProvider: React.FC<Percy3DOrbProps> = (props) => {
  const { capabilities, isLoaded, getLoadedModules } = use3DModules();
  const [orbCore, setOrbCore] = useState<Percy3DOrbCore | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize orb core
  useEffect(() => {
    const core = new Percy3DOrbCore(props, capabilities);
    setOrbCore(core);

    core.initialize().catch(setError);

    return () => {
      core.destroy();
    };
  }, [props, capabilities]);

  // Handle fallback cases
  if (error || capabilities.shouldUseFallback) {
    const FallbackComponent = props.fallbackComponent;
    return FallbackComponent ? <FallbackComponent {...props.fallbackProps} /> : null;
  }

  if (!orbCore || !isLoaded('Canvas')) {
    // Loading state - could be styled by Windsurf
    return (
      <div className={`percy-3d-orb-loading ${props.className || ''}`}>
        <div>Loading Percy...</div>
      </div>
    );
  }

  // This will be replaced with actual 3D canvas component
  // For now, return the render props for Windsurf to style
  return (
    <div 
      className={`percy-3d-orb-container ${props.className || ''}`}
      data-render-props={JSON.stringify(orbCore.getRenderProps())}
    >
      {/* Windsurf will replace this with actual 3D canvas */}
      <div>3D Orb Placeholder - Ready for Windsurf styling</div>
    </div>
  );
};

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export { Percy3DOrbCore as default }; 