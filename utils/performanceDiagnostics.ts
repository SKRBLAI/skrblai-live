/**
 * Performance Diagnostics Utility - SKRBL AI Platform
 * Identifies performance issues and optimization opportunities
 */

import React from 'react';

interface PerformanceIssue {
  type: 'warning' | 'error' | 'optimization';
  category: 'memory' | 'rendering' | 'network' | 'metrics' | 'typescript' | 'build';
  message: string;
  component?: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = critical
  suggestion?: string;
  autoFixable?: boolean;
}

interface DiagnosticsReport {
  timestamp: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  issues: PerformanceIssue[];
  metrics: {
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    errors: number;
    optimizations: number;
    fixableIssues: number;
  };
  recommendations: string[];
}

class PerformanceDiagnostics {
  private issues: PerformanceIssue[] = [];
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Check for memory leaks and excessive intervals
   */
  checkMemoryUsage(): void {
    if (typeof window === 'undefined') return;

    // Check for memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      const usagePercent = (usedMB / limitMB) * 100;

      if (usagePercent > 80) {
        this.addIssue({
          type: 'error',
          category: 'memory',
          message: `High memory usage: ${usagePercent.toFixed(1)}% (${usedMB.toFixed(1)}MB)`,
          severity: 4,
          suggestion: 'Check for memory leaks, reduce interval frequency, or implement cleanup'
        });
      } else if (usagePercent > 60) {
        this.addIssue({
          type: 'warning',
          category: 'memory',
          message: `Moderate memory usage: ${usagePercent.toFixed(1)}% (${usedMB.toFixed(1)}MB)`,
          severity: 2,
          suggestion: 'Monitor memory usage and consider optimization'
        });
      }
    }
  }

  /**
   * Check rendering performance
   */
  checkRenderingPerformance(): void {
    if (typeof window === 'undefined') return;

    // Check for excessive DOM nodes
    const totalNodes = document.querySelectorAll('*').length;
    if (totalNodes > 3000) {
      this.addIssue({
        type: 'warning',
        category: 'rendering',
        message: `High DOM node count: ${totalNodes}`,
        severity: 3,
        suggestion: 'Consider virtualization for large lists or reduce DOM complexity'
      });
    }

    // Check for excessive stylesheets
    const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]').length;
    if (stylesheets > 15) {
      this.addIssue({
        type: 'optimization',
        category: 'rendering',
        message: `Many stylesheets loaded: ${stylesheets}`,
        severity: 2,
        suggestion: 'Consider consolidating CSS or using CSS-in-JS'
      });
    }
  }

  /**
   * Check network performance
   */
  async checkNetworkPerformance(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    try {
      // Check for slow loading resources
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        const navigation = entries[0];
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;

        if (loadTime > 5000) {
          this.addIssue({
            type: 'error',
            category: 'network',
            message: `Slow page load: ${(loadTime / 1000).toFixed(2)}s`,
            severity: 4,
            suggestion: 'Optimize images, use CDN, enable compression, or implement lazy loading'
          });
        } else if (loadTime > 3000) {
          this.addIssue({
            type: 'warning',
            category: 'network',
            message: `Moderate page load: ${(loadTime / 1000).toFixed(2)}s`,
            severity: 2,
            suggestion: 'Consider image optimization and code splitting'
          });
        }
      }
    } catch (error) {
      // Silent fail for performance checks
    }
  }

  /**
   * Check metrics system health
   */
  checkMetricsHealth(): void {
    if (typeof window === 'undefined') return;

    // Check localStorage for metrics data
    try {
      const metricsData = localStorage.getItem('metrics_performance');
      if (metricsData) {
        const data = JSON.parse(metricsData);
        if (data.length > 100) {
          this.addIssue({
            type: 'optimization',
            category: 'metrics',
            message: 'Metrics performance data is growing large',
            severity: 2,
            suggestion: 'Implement data cleanup or reduce tracking frequency',
            autoFixable: true
          });
        }
      }
    } catch (error) {
      this.addIssue({
        type: 'warning',
        category: 'metrics',
        message: 'Metrics data corruption detected',
        severity: 3,
        suggestion: 'Clear metrics cache and restart tracking'
      });
    }
  }

  /**
   * Check for TypeScript/build issues
   */
  checkBuildHealth(): void {
    // Check for development artifacts in production
    if (process.env.NODE_ENV === 'production') {
      if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        this.addIssue({
          type: 'warning',
          category: 'build',
          message: 'React DevTools detected in production',
          severity: 3,
          suggestion: 'Ensure proper production build configuration'
        });
      }
    }
  }

  /**
   * Add an issue to the diagnostics
   */
  private addIssue(issue: PerformanceIssue): void {
    this.issues.push({
      ...issue,
      component: issue.component || 'Platform'
    });
  }

  /**
   * Generate comprehensive diagnostics report
   */
  async generateReport(): Promise<DiagnosticsReport> {
    // Run all checks
    this.checkMemoryUsage();
    this.checkRenderingPerformance();
    await this.checkNetworkPerformance();
    this.checkMetricsHealth();
    this.checkBuildHealth();

    // Calculate metrics
    const criticalIssues = this.issues.filter(i => i.severity >= 4).length;
    const warnings = this.issues.filter(i => i.type === 'warning').length;
    const errors = this.issues.filter(i => i.type === 'error').length;
    const optimizations = this.issues.filter(i => i.type === 'optimization').length;
    const fixableIssues = this.issues.filter(i => i.autoFixable).length;

    // Determine overall health
    let overallHealth: DiagnosticsReport['overallHealth'] = 'excellent';
    if (criticalIssues > 0) overallHealth = 'critical';
    else if (errors > 0) overallHealth = 'poor';
    else if (warnings > 3) overallHealth = 'fair';
    else if (warnings > 0 || optimizations > 0) overallHealth = 'good';

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date().toISOString(),
      overallHealth,
      issues: this.issues,
      metrics: {
        totalIssues: this.issues.length,
        criticalIssues,
        warnings,
        errors,
        optimizations,
        fixableIssues
      },
      recommendations
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const categories = Array.from(new Set(this.issues.map(i => i.category)));

    if (categories.includes('memory')) {
      recommendations.push('🔧 Implement ProductionOptimizer to manage intervals and memory usage');
    }
    
    if (categories.includes('rendering')) {
      recommendations.push('🎨 Consider using React.memo for expensive components');
    }

    if (categories.includes('network')) {
      recommendations.push('🌐 Optimize images with WebP format and lazy loading');
    }

    if (categories.includes('metrics')) {
      recommendations.push('📊 Use standardized metrics system for consistency');
    }

    if (this.issues.filter(i => i.autoFixable).length > 0) {
      recommendations.push('🤖 Several issues can be auto-fixed - run optimization scripts');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Platform is running optimally - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Auto-fix common issues
   */
  autoFix(): string[] {
    const fixed: string[] = [];
    
    // Clear metrics cache if corrupted
    try {
      const metricsData = localStorage.getItem('metrics_performance');
      if (metricsData && JSON.parse(metricsData).length > 100) {
        localStorage.removeItem('metrics_performance');
        fixed.push('✅ Cleared excessive metrics data');
      }
    } catch (error) {
      localStorage.removeItem('metrics_performance');
      fixed.push('✅ Fixed corrupted metrics data');
    }

    return fixed;
  }
}

/**
 * Quick health check function
 */
export async function quickHealthCheck(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  issues: number;
  recommendations: string[];
}> {
  const diagnostics = new PerformanceDiagnostics();
  const report = await diagnostics.generateReport();

  return {
    status: report.overallHealth === 'excellent' || report.overallHealth === 'good' 
      ? 'healthy' 
      : report.overallHealth === 'critical' || report.overallHealth === 'poor'
      ? 'critical'
      : 'warning',
    issues: report.metrics.totalIssues,
    recommendations: report.recommendations.slice(0, 3) // Top 3 recommendations
  };
}

/**
 * React hook for continuous monitoring
 */
export function usePerformanceMonitoring(enabled = true) {
  const [health, setHealth] = React.useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [lastCheck, setLastCheck] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const runCheck = async () => {
      const result = await quickHealthCheck();
      setHealth(result.status);
      setLastCheck(new Date());
    };

    // Initial check
    runCheck();

    // Check every 5 minutes
    const interval = setInterval(runCheck, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  return { health, lastCheck };
}

export { PerformanceDiagnostics };
export default PerformanceDiagnostics; 