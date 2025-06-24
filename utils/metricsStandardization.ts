/**
 * Metrics Standardization Utility - SKRBL AI Platform
 * Provides consistent live metrics across all pages
 */

import { useState, useEffect } from 'react';
import { productionOptimizer } from './productionOptimizer';

export interface StandardMetricsConfig {
  pageType: 'landing' | 'service' | 'dashboard' | 'general';
  priority: 'high' | 'medium' | 'low';
  baseValues: Record<string, number>;
  updateRules: Record<string, {
    min?: number;
    max?: number;
    increment: [number, number]; // [min, max] range - required
    decrements?: boolean; // Allow negative changes
  }>;
  updateInterval: number;
  formatters?: Record<string, (value: number) => string>;
}

/**
 * Predefined metric configurations for different page types
 */
export const STANDARD_METRICS: Record<string, StandardMetricsConfig> = {
  // Landing page metrics - high engagement
  homepage: {
    pageType: 'landing',
    priority: 'high',
    baseValues: {
      liveUsers: 2847,
      companiesTransformed: 47213,
      revenueGenerated: 284756923,
      competitorsDestroyed: 18934
    },
    updateRules: {
      liveUsers: { min: 1000, max: 5000, increment: [1, 8] },
      companiesTransformed: { min: 40000, increment: [1, 4] },
      revenueGenerated: { min: 200000000, increment: [10000, 75000] },
      competitorsDestroyed: { increment: [0, 2] } // Sometimes no change
    },
    updateInterval: 8000,
    formatters: {
      revenueGenerated: (val) => `$${val.toLocaleString()}`,
      companiesTransformed: (val) => val.toLocaleString(),
      liveUsers: (val) => val.toLocaleString(),
      competitorsDestroyed: (val) => val.toLocaleString()
    }
  },

  // Book publishing metrics
  bookPublishing: {
    pageType: 'service',
    priority: 'medium',
    baseValues: {
      booksPublished: 2847,
      authorsLaunched: 1623,
      revenueGenerated: 4792341,
      competitorsLeft: 8429
    },
    updateRules: {
      booksPublished: { min: 2500, increment: [1, 4] },
      authorsLaunched: { min: 1500, increment: [0, 3] },
      revenueGenerated: { min: 4000000, increment: [2000, 8000] },
      competitorsLeft: { min: 5000, increment: [-2, 0], decrements: true }
    },
    updateInterval: 8000
  },

  // Branding metrics  
  branding: {
    pageType: 'service',
    priority: 'medium',
    baseValues: {
      brandsTransformed: 3942,
      revenueGenerated: 8473291,
      brandRecognition: 347,
      competitorsDestroyed: 2847
    },
    updateRules: {
      brandsTransformed: { min: 3500, increment: [1, 5] },
      revenueGenerated: { min: 8000000, increment: [3000, 12000] },
      brandRecognition: { min: 300, max: 500, increment: [1, 4] },
      competitorsDestroyed: { min: 2500, increment: [0, 3] }
    },
    updateInterval: 7000
  },

  // Social media metrics
  socialMedia: {
    pageType: 'service',
    priority: 'medium',
    baseValues: {
      postsGenerated: 487294,
      followersGained: 2847392,
      engagementBoost: 492,
      viralPosts: 8472
    },
    updateRules: {
      postsGenerated: { min: 480000, increment: [8, 20] },
      followersGained: { min: 2800000, increment: [25, 75] },
      engagementBoost: { min: 450, max: 600, increment: [1, 6] },
      viralPosts: { min: 8000, increment: [1, 4] }
    },
    updateInterval: 6000
  },

  // Agent service pages
  agentService: {
    pageType: 'service',
    priority: 'low',
    baseValues: {
      liveUsers: 47,
      successRate: 94,
      urgencySpots: 23
    },
    updateRules: {
      liveUsers: { min: 15, max: 150, increment: [-2, 4] },
      successRate: { min: 85, max: 99, increment: [-1, 2] },
      urgencySpots: { min: 5, max: 75, increment: [-1, 1], decrements: true }
    },
    updateInterval: 8000
  },

  // Contact page metrics
  contact: {
    pageType: 'general',
    priority: 'low',
    baseValues: {
      responseTime: 24,
      inquiriesToday: 47,
      dealsClosedThisWeek: 12,
      avgProjectValue: 85000
    },
    updateRules: {
      responseTime: { min: 1, max: 48, increment: [-2, 0], decrements: true },
      inquiriesToday: { min: 30, increment: [0, 3] },
      dealsClosedThisWeek: { increment: [0, 1] }, // Rare updates
      avgProjectValue: { min: 75000, max: 150000, increment: [-2500, 7500] }
    },
    updateInterval: 8000
  },

  // Features page metrics
  features: {
    pageType: 'landing',
    priority: 'high',
    baseValues: {
      liveUsers: 2847,
      companiesTransformed: 47213,
      revenueGenerated: 284756923,
      competitorsDestroyed: 18934
    },
    updateRules: {
      liveUsers: { min: 2000, max: 4000, increment: [1, 7] },
      companiesTransformed: { min: 45000, increment: [1, 4] },
      revenueGenerated: { min: 280000000, increment: [10000, 65000] },
      competitorsDestroyed: { increment: [0, 2] }
    },
    updateInterval: 8000
  }
};

/**
 * React hook for standardized live metrics
 */
export function useStandardMetrics(configKey: keyof typeof STANDARD_METRICS) {
  const config = STANDARD_METRICS[configKey];
  if (!config) {
    throw new Error(`Unknown metrics config: ${configKey}`);
  }

  const [metrics, setMetrics] = useState(config.baseValues);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(prev => {
        const updated = { ...prev };
        
        Object.keys(config.updateRules).forEach(key => {
          const rule = config.updateRules[key];
          const currentValue = updated[key];
          
          // Calculate increment
          const [minInc, maxInc] = rule.increment || [1, 3];
          let change = Math.floor(Math.random() * (maxInc - minInc + 1)) + minInc;
          
          // Handle decrements
          if (!rule.decrements && change < 0) {
            change = Math.abs(change);
          }
          
          let newValue = currentValue + change;
          
          // Apply constraints
          if (rule.min !== undefined) newValue = Math.max(newValue, rule.min);
          if (rule.max !== undefined) newValue = Math.min(newValue, rule.max);
          
          updated[key] = newValue;
        });
        
        return updated;
      });
    };

    // Use optimized interval from production optimizer
    const cleanup = productionOptimizer.createOptimizedInterval(
      `metrics_${configKey}`,
      updateMetrics,
      config.updateInterval,
      {
        priority: config.priority,
        reducedMotion: true
      }
    );

    return cleanup;
  }, [config, configKey]);

  // Format metrics if formatters are provided
  const formattedMetrics = config.formatters 
    ? Object.keys(metrics).reduce((acc, key) => {
        const formatter = config.formatters![key];
        acc[key] = formatter ? formatter(metrics[key]) : metrics[key];
        return acc;
      }, {} as Record<string, string | number>)
    : metrics;

  return { metrics, formattedMetrics, config };
}

/**
 * Utility to create custom metric configurations
 */
export function createCustomMetricsConfig(
  baseConfig: Partial<StandardMetricsConfig>
): StandardMetricsConfig {
  return {
    pageType: 'general',
    priority: 'medium',
    baseValues: {},
    updateRules: {},
    updateInterval: 8000,
    ...baseConfig
  } as StandardMetricsConfig;
}

/**
 * Performance metrics for analytics
 */
export function trackMetricsPerformance(configKey: string, renderTime: number) {
  if (typeof window !== 'undefined' && window.performance) {
    const entry = {
      name: `metrics_${configKey}_render`,
      startTime: window.performance.now() - renderTime,
      duration: renderTime,
      entryType: 'measure'
    };
    
    // Store in session storage for analytics
    const existingData = sessionStorage.getItem('metrics_performance') || '[]';
    const performanceData = JSON.parse(existingData);
    performanceData.push(entry);
    
    // Keep only last 50 entries
    if (performanceData.length > 50) {
      performanceData.splice(0, performanceData.length - 50);
    }
    
    sessionStorage.setItem('metrics_performance', JSON.stringify(performanceData));
  }
}

export default useStandardMetrics; 