/**
 * SKRBL AI Agent 3D Card Core Logic
 * 
 * Provides 3D card mechanics with flip animations, hover effects, and state management
 * Handles performance optimization and provides clean props for UI styling
 * 
 * @version 1.0.0
 * @author SKRBL AI Team - 3D Infrastructure
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { use3DModules, type Device3DCapabilities } from './dynamicImports';
import type { Agent } from '@/types/agent';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Agent3DCardState {
  isHovered: boolean;
  isFlipped: boolean;
  isExpanded: boolean;
  isAnimating: boolean;
  rotationY: number;
  scale: number;
  depth: number;
  glowIntensity: number;
  lastInteraction: number;
}

export interface Agent3DCardProps {
  // Agent data
  agent: Agent;
  index?: number;
  
  // 3D Configuration
  enableFlip?: boolean;
  enableHover?: boolean;
  enableExpand?: boolean;
  enable3D?: boolean;
  
  // Animation Configuration
  flipDuration?: number;
  hoverScale?: number;
  expandScale?: number;
  animationEasing?: string;
  
  // Performance Configuration
  complexity?: 'low' | 'medium' | 'high' | 'auto';
  enableLOD?: boolean;
  maxDistance?: number;
  
  // Visual Configuration
  cardDepth?: number;
  glowColor?: string;
  flipTrigger?: 'hover' | 'click' | 'both';
  expandTrigger?: 'none' | 'click' | 'doubleClick';
  
  // Interaction Callbacks
  onFlip?: (isFlipped: boolean) => void;
  onExpand?: (isExpanded: boolean) => void;
  onHover?: (isHovered: boolean) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  
  // Card Actions
  onInfo?: () => void;
  onChat?: () => void;
  onLaunch?: () => void;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Accessibility
  ariaLabel?: string;
  tabIndex?: number;
  
  // Performance tracking
  trackPerformance?: boolean;
  performanceId?: string;
}

export interface CardTransform {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  perspective: number;
}

export interface CardMaterial {
  color: string;
  metalness: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
}

export interface CardGeometry {
  width: number;
  height: number;
  depth: number;
  segments: number;
  bevelSize: number;
  bevelSegments: number;
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

export const DEFAULT_CARD_CONFIG = {
  flipDuration: 600,
  hoverScale: 1.05,
  expandScale: 1.2,
  animationEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  cardDepth: 0.1,
  glowColor: '#30D5C8',
  flipTrigger: 'hover' as const,
  expandTrigger: 'click' as const,
  complexity: 'auto' as const,
  enableLOD: true,
  maxDistance: 1000
};

export const CARD_GEOMETRIES = {
  low: { segments: 1, bevelSegments: 1, bevelSize: 0.01 },
  medium: { segments: 2, bevelSegments: 2, bevelSize: 0.02 },
  high: { segments: 4, bevelSegments: 4, bevelSize: 0.03 }
} as const;

// =============================================================================
// CORE AGENT 3D CARD CLASS
// =============================================================================

export class Agent3DCardCore {
  public state: Agent3DCardState;
  private config: Required<Agent3DCardProps>;
  private capabilities: Device3DCapabilities;
  private geometry: CardGeometry;
  private transform: CardTransform;
  private material: CardMaterial;
  private animationFrame: number | null = null;
  private performanceMetrics: Map<string, number> = new Map();

  constructor(props: Agent3DCardProps, capabilities: Device3DCapabilities) {
    this.capabilities = capabilities;
    this.config = this.mergeWithDefaults(props);
    
    this.state = {
      isHovered: false,
      isFlipped: false,
      isExpanded: false,
      isAnimating: false,
      rotationY: 0,
      scale: 1,
      depth: this.config.cardDepth,
      glowIntensity: 0,
      lastInteraction: 0
    };

    this.geometry = this.calculateGeometry();
    this.transform = this.calculateTransform();
    this.material = this.calculateMaterial();
  }

  /**
   * Handle hover interactions
   */
  onHover = (isHovered: boolean): void => {
    if (!this.config.enableHover) return;
    
    const now = Date.now();
    this.state.lastInteraction = now;
    
    this.updateState({
      isHovered,
      scale: isHovered ? this.config.hoverScale : (this.state.isExpanded ? this.config.expandScale : 1),
      glowIntensity: isHovered ? 0.8 : 0
    });

    // Handle flip on hover
    if (this.config.flipTrigger === 'hover' || this.config.flipTrigger === 'both') {
      this.setFlipped(isHovered);
    }

    this.config.onHover?.(isHovered);
    this.trackPerformance('hover', now);
  };

  /**
   * Handle click interactions
   */
  onClick = (): void => {
    const now = Date.now();
    this.state.lastInteraction = now;

    // Handle flip on click
    if (this.config.flipTrigger === 'click' || this.config.flipTrigger === 'both') {
      this.setFlipped(!this.state.isFlipped);
    }

    // Handle expand on click
    if (this.config.expandTrigger === 'click') {
      this.setExpanded(!this.state.isExpanded);
    }

    this.config.onClick?.();
    this.trackPerformance('click', now);
  };

  /**
   * Handle double click interactions
   */
  onDoubleClick = (): void => {
    const now = Date.now();
    this.state.lastInteraction = now;

    // Handle expand on double click
    if (this.config.expandTrigger === 'doubleClick') {
      this.setExpanded(!this.state.isExpanded);
    }

    this.config.onDoubleClick?.();
    this.trackPerformance('doubleClick', now);
  };

  /**
   * Set flip state with animation
   */
  setFlipped = (isFlipped: boolean): void => {
    if (!this.config.enableFlip || this.state.isFlipped === isFlipped) return;
    
    this.updateState({
      isFlipped,
      isAnimating: true,
      rotationY: isFlipped ? 180 : 0
    });

    // Reset animation state after duration
    setTimeout(() => {
      this.updateState({ isAnimating: false });
    }, this.config.flipDuration);

    this.config.onFlip?.(isFlipped);
  };

  /**
   * Set expanded state with animation
   */
  setExpanded = (isExpanded: boolean): void => {
    if (!this.config.enableExpand || this.state.isExpanded === isExpanded) return;
    
    this.updateState({
      isExpanded,
      isAnimating: true,
      scale: isExpanded ? this.config.expandScale : (this.state.isHovered ? this.config.hoverScale : 1),
      depth: isExpanded ? this.config.cardDepth * 2 : this.config.cardDepth
    });

    // Reset animation state after duration
    setTimeout(() => {
      this.updateState({ isAnimating: false });
    }, this.config.flipDuration);

    this.config.onExpand?.(isExpanded);
  };

  /**
   * Get render props for 3D rendering
   */
  getRenderProps() {
    this.updateTransform();
    this.updateMaterial();

    return {
      // Agent data
      agent: this.config.agent,
      
      // State
      state: { ...this.state },
      
      // 3D Properties
      geometry: this.geometry,
      transform: this.transform,
      material: this.material,
      
      // Animation properties
      animationDuration: this.config.flipDuration,
      animationEasing: this.config.animationEasing,
      
      // Interaction handlers
      onPointerEnter: () => this.onHover(true),
      onPointerLeave: () => this.onHover(false),
      onClick: this.onClick,
      onDoubleClick: this.onDoubleClick,
      
      // Action handlers
      onInfo: this.config.onInfo,
      onChat: this.config.onChat,
      onLaunch: this.config.onLaunch,
      
      // CSS transforms (fallback for non-3D)
      cssTransform: this.getCSSTransform(),
      
      // Accessibility
      ariaLabel: this.config.ariaLabel || `${this.config.agent.name} agent card`,
      tabIndex: this.config.tabIndex || 0,
      
      // Performance
      shouldRender3D: this.shouldRender3D(),
      complexity: this.getEffectiveComplexity()
    };
  }

  /**
   * Get CSS transform for fallback rendering
   */
  getCSSTransform(): string {
    const { rotationY, scale } = this.state;
    return `perspective(1000px) rotateY(${rotationY}deg) scale(${scale})`;
  }

  /**
   * Check if should render 3D version
   */
  shouldRender3D(): boolean {
    if (!this.config.enable3D) return false;
    if (this.capabilities.shouldUseFallback) return false;
    
    // Performance-based decisions
    if (this.capabilities.isMobile && this.capabilities.maxComplexity === 'low') {
      return false;
    }
    
    return true;
  }

  /**
   * Get effective complexity based on device capabilities
   */
  getEffectiveComplexity(): 'low' | 'medium' | 'high' {
    let complexity = this.config.complexity;
    
    if (complexity === 'auto') {
      complexity = this.capabilities.maxComplexity;
    }
    
    // Force low complexity on weak devices
    if (this.capabilities.isMobile && !this.capabilities.hasPerformance) {
      complexity = 'low';
    }
    
    return complexity;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.performanceMetrics.clear();
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private updateState(updates: Partial<Agent3DCardState>): void {
    this.state = { ...this.state, ...updates };
  }

  private mergeWithDefaults(props: Agent3DCardProps): Required<Agent3DCardProps> {
    return {
      agent: props.agent,
      index: props.index || 0,
      enableFlip: props.enableFlip ?? true,
      enableHover: props.enableHover ?? true,
      enableExpand: props.enableExpand ?? true,
      enable3D: props.enable3D ?? true,
      flipDuration: props.flipDuration || DEFAULT_CARD_CONFIG.flipDuration,
      hoverScale: props.hoverScale || DEFAULT_CARD_CONFIG.hoverScale,
      expandScale: props.expandScale || DEFAULT_CARD_CONFIG.expandScale,
      animationEasing: props.animationEasing || DEFAULT_CARD_CONFIG.animationEasing,
      complexity: props.complexity || DEFAULT_CARD_CONFIG.complexity,
      enableLOD: props.enableLOD ?? DEFAULT_CARD_CONFIG.enableLOD,
      maxDistance: props.maxDistance || DEFAULT_CARD_CONFIG.maxDistance,
      cardDepth: props.cardDepth || DEFAULT_CARD_CONFIG.cardDepth,
      glowColor: props.glowColor || DEFAULT_CARD_CONFIG.glowColor,
      flipTrigger: props.flipTrigger || DEFAULT_CARD_CONFIG.flipTrigger,
      expandTrigger: props.expandTrigger || DEFAULT_CARD_CONFIG.expandTrigger,
      onFlip: props.onFlip || (() => {}),
      onExpand: props.onExpand || (() => {}),
      onHover: props.onHover || (() => {}),
      onClick: props.onClick || (() => {}),
      onDoubleClick: props.onDoubleClick || (() => {}),
      onInfo: props.onInfo || (() => {}),
      onChat: props.onChat || (() => {}),
      onLaunch: props.onLaunch || (() => {}),
      className: props.className || '',
      style: props.style || {},
      ariaLabel: props.ariaLabel || '',
      tabIndex: props.tabIndex || 0,
      trackPerformance: props.trackPerformance ?? false,
      performanceId: props.performanceId || `agent-card-${props.agent.id}`
    };
  }

  private calculateGeometry(): CardGeometry {
    const complexity = this.getEffectiveComplexity();
    const geometryConfig = CARD_GEOMETRIES[complexity];
    
    return {
      width: 1,
      height: 1.4, // Card aspect ratio
      depth: this.config.cardDepth,
      segments: geometryConfig.segments,
      bevelSize: geometryConfig.bevelSize,
      bevelSegments: geometryConfig.bevelSegments
    };
  }

  private calculateTransform(): CardTransform {
    return {
      rotateX: 0,
      rotateY: this.state.rotationY,
      rotateZ: 0,
      scale: this.state.scale,
      translateX: 0,
      translateY: 0,
      translateZ: 0,
      perspective: 1000
    };
  }

  private calculateMaterial(): CardMaterial {
    return {
      color: '#ffffff',
      metalness: 0.1,
      roughness: 0.2,
      emissive: this.config.glowColor,
      emissiveIntensity: this.state.glowIntensity,
      opacity: 1
    };
  }

  private updateTransform(): void {
    this.transform = {
      ...this.transform,
      rotateY: this.state.rotationY,
      scale: this.state.scale,
      translateZ: this.state.depth
    };
  }

  private updateMaterial(): void {
    this.material = {
      ...this.material,
      emissiveIntensity: this.state.glowIntensity
    };
  }

  private trackPerformance(action: string, timestamp: number): void {
    if (!this.config.trackPerformance) return;
    
    const key = `${this.config.performanceId}-${action}`;
    this.performanceMetrics.set(key, timestamp);
    
    // Log performance data
    console.log(`[Agent 3D Card] ${action}:`, {
      performanceId: this.config.performanceId,
      timestamp,
      state: this.state
    });
  }
}

// =============================================================================
// REACT COMPONENT WRAPPER
// =============================================================================

export const Agent3DCardProvider: React.FC<Agent3DCardProps> = (props) => {
  const { capabilities } = use3DModules();
  const [cardCore, setCardCore] = useState<Agent3DCardCore | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Initialize card core
  useEffect(() => {
    const core = new Agent3DCardCore(props, capabilities);
    setCardCore(core);

    return () => {
      core.destroy();
    };
  }, [props, capabilities]);

  // Memoize render props for performance
  const renderProps = useMemo(() => {
    return cardCore?.getRenderProps() || null;
  }, [cardCore?.state]);

  if (!cardCore || !renderProps) {
    return (
      <div className={`agent-3d-card-loading ${props.className || ''}`}>
        Loading...
      </div>
    );
  }

  // For now, return container with render props data for Windsurf to style
  return (
    <div
      ref={componentRef}
      className={`agent-3d-card-container ${props.className || ''}`}
      style={props.style}
      data-render-props={JSON.stringify(renderProps)}
      data-agent-id={props.agent.id}
      data-should-render-3d={renderProps.shouldRender3D}
    >
      {/* Windsurf will replace this with actual 3D card component */}
      <div className="agent-3d-card-placeholder">
        <h3>{props.agent.name}</h3>
        <p>3D Card Ready for Windsurf styling</p>
        <div>State: {JSON.stringify(renderProps.state, null, 2)}</div>
      </div>
    </div>
  );
};

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export { Agent3DCardCore as default }; 