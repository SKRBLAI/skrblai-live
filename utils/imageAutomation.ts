// Image Automation Utility for SKRBL AI
// Provides automatic image optimization, WebP detection, and CDN integration

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'auto' | 'face' | 'center';
  eager?: boolean;
  cdn?: boolean;
}

interface OptimizedImage {
  src: string;
  webpSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  loading: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

class ImageAutomation {
  private webpSupported: boolean | null = null;
  private optimizationCache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<boolean>>();
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebPDetection();
      this.setupPerformanceTracking();
    }
  }

  private async initializeWebPDetection() {
    this.webpSupported = await this.checkWebPSupport();
    console.log('[ImageAutomation] WebP supported:', this.webpSupported);
  }

  private checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  private setupPerformanceTracking() {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name.includes('/images/') || entry.name.includes('cloudinary.com')) {
              console.log(`[ImageAutomation] Image loaded: ${entry.name} (${Math.round(entry.duration)}ms)`);
              
              // Track slow loading images
              if (entry.duration > 1000) {
                console.warn(`[ImageAutomation] Slow image load detected:`, {
                  url: entry.name,
                  loadTime: Math.round(entry.duration),
                  size: (entry as any).transferSize,
                  recommendation: 'Consider optimization or WebP conversion'
                });
              }
            }
          });
        });
        this.performanceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('[ImageAutomation] Performance tracking unavailable:', error);
      }
    }
  }

  /**
   * Get optimized image props for agent images
   */
  public getOptimizedAgentImage(
    agentSlug: string, 
    context: 'constellation' | 'carousel' | 'card' | 'hero' | 'mobile' | 'default' = 'default',
    options: ImageOptimizationOptions = {}
  ): OptimizedImage {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    
    // Context-specific defaults
    const contextDefaults = {
      constellation: { quality: 80, width: 96, height: 96 },
      carousel: { quality: 85, width: 128, height: 128 },
      card: { quality: 90, width: 256, height: 256 },
      hero: { quality: 95, width: 512, height: 512 },
      mobile: { quality: 75, width: 64, height: 64 },
      default: { quality: 85, width: 128, height: 128 }
    };

    const defaults = contextDefaults[context] || contextDefaults.default;
    const mergedOptions = { ...defaults, ...options };

    // Build optimized image URLs
    const baseImageName = `agents-${agentSlug}-nobg-skrblai`;
    const webpUrl = `/images/${baseImageName}.webp`;
    const pngUrl = `/images/${baseImageName}.png`;

    // Use WebP if supported, fallback to PNG
    const src = (this.webpSupported && this.imageExists(webpUrl)) ? webpUrl : pngUrl;
    const webpSrc = this.webpSupported ? webpUrl : undefined;

    return {
      src,
      webpSrc,
      alt: `${agentSlug} AI Agent`,
      width: mergedOptions.width,
      height: mergedOptions.height,
      loading: context === 'hero' ? 'eager' : 'lazy',
      priority: context === 'hero',
      sizes: this.getResponsiveSizes(context),
      placeholder: this.generatePlaceholder(agentSlug),
      onLoad: () => this.handleImageLoad(src, context),
      onError: () => this.handleImageError(src, agentSlug)
    };
  }

  /**
   * Optimize an existing image using CDN automation
   */
  public async optimizeImage(
    imageUrl: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `${imageUrl}_${JSON.stringify(options)}`;
      if (this.optimizationCache.has(cacheKey)) {
        return this.optimizationCache.get(cacheKey)!;
      }

      // Call CDN automation API
      const response = await fetch('/api/images/cdn-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimize',
          imageUrl,
          options
        })
      });

      const result = await response.json();

      if (result.success && result.result.optimizedUrl) {
        const optimizedUrl = result.result.optimizedUrl;
        this.optimizationCache.set(cacheKey, optimizedUrl);
        return optimizedUrl;
      } else {
        console.warn('[ImageAutomation] Optimization failed, using original:', result.error);
        return imageUrl;
      }

    } catch (error) {
      console.error('[ImageAutomation] Optimization error:', error);
      return imageUrl;
    }
  }

  /**
   * Batch optimize multiple images
   */
  public async batchOptimize(
    imageUrls: string[], 
    options: ImageOptimizationOptions = {}
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    // Process in chunks to avoid overwhelming the API
    const chunkSize = 5;
    const chunks = this.chunkArray(imageUrls, chunkSize);

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        const optimized = await this.optimizeImage(url, options);
        results[url] = optimized;
      });

      await Promise.allSettled(promises);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  /**
   * Preload critical images for performance
   */
  public preloadImages(imageUrls: string[]): Promise<boolean[]> {
    const promises = imageUrls.map(url => this.preloadImage(url));
    return Promise.allSettled(promises).then(results => 
      results.map(result => result.status === 'fulfilled' && result.value)
    );
  }

  private preloadImage(url: string): Promise<boolean> {
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const promise = new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Convert local images to WebP via CDN automation
   */
  public async convertToWebP(imagePaths: string[]): Promise<void> {
    try {
      const response = await fetch('/api/images/cdn-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'batch-process',
          options: {
            format: 'webp',
            quality: 85
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('[ImageAutomation] WebP conversion completed:', result.result.stats);
      } else {
        console.error('[ImageAutomation] WebP conversion failed:', result.error);
      }

    } catch (error) {
      console.error('[ImageAutomation] WebP conversion error:', error);
    }
  }

  /**
   * Analyze image performance and provide recommendations
   */
  public async analyzeImagePerformance(): Promise<any> {
    try {
      const response = await fetch('/api/images/cdn-automation?operation=analytics', {
        method: 'GET'
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('[ImageAutomation] Performance analysis:', result.analytics);
        return result.analytics;
      }

    } catch (error) {
      console.error('[ImageAutomation] Performance analysis error:', error);
    }

    return null;
  }

  /**
   * Get responsive image sizes for different contexts
   */
  private getResponsiveSizes(context: string): string {
    const sizeMap = {
      constellation: '(max-width: 480px) 48px, (max-width: 768px) 64px, 96px',
      carousel: '(max-width: 480px) 64px, (max-width: 768px) 96px, 128px',
      card: '(max-width: 480px) 128px, (max-width: 768px) 192px, 256px',
      hero: '(max-width: 480px) 256px, (max-width: 768px) 384px, 512px',
      mobile: '(max-width: 480px) 32px, (max-width: 768px) 48px, 64px',
      default: '(max-width: 768px) 96px, 128px'
    };

    return sizeMap[context as keyof typeof sizeMap] || sizeMap.default;
  }

  /**
   * Generate a placeholder for loading states
   */
  private generatePlaceholder(agentSlug: string): string {
    // Generate a simple SVG placeholder with the agent's first letter
    const letter = agentSlug.charAt(0).toUpperCase();
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" fill="#1a1a2e"/>
        <text x="64" y="64" text-anchor="middle" dy=".35em" font-family="Arial" font-size="48" fill="#00d4ff">${letter}</text>
      </svg>
    `)}`;
  }

  /**
   * Handle successful image load
   */
  private handleImageLoad(src: string, context: string) {
    console.log(`[ImageAutomation] Image loaded successfully: ${src} (${context})`);
    
    // Track loading performance
    if (typeof window !== 'undefined' && window.performance) {
      const entries = performance.getEntriesByName(src);
      if (entries.length > 0) {
        const entry = entries[entries.length - 1];
        console.log(`[ImageAutomation] Load time: ${Math.round(entry.duration)}ms`);
      }
    }
  }

  /**
   * Handle image loading errors
   */
  private handleImageError(src: string, agentSlug: string) {
    console.error(`[ImageAutomation] Failed to load image: ${src}`);
    
    // Try fallback to PNG if WebP failed
    if (src.includes('.webp')) {
      const fallbackSrc = src.replace('.webp', '.png');
      console.log(`[ImageAutomation] Trying PNG fallback: ${fallbackSrc}`);
      
      // This would need to be handled at the component level
      // Return fallback URL for the component to use
      return fallbackSrc;
    }

    // Log error for monitoring
    this.logImageError(src, agentSlug);
  }

  /**
   * Check if an image exists
   */
  private imageExists(url: string): boolean {
    // Simple check - in production, you might cache this information
    // For now, assume WebP versions exist for agent images
    return url.includes('agents-') && url.includes('-nobg-skrblai.webp');
  }

  /**
   * Log image errors for monitoring
   */
  private async logImageError(src: string, agentSlug: string) {
    try {
      // Send to mobile performance monitoring if available
      const performanceMonitor = (window as any).skrblPerformanceMonitor;
      if (performanceMonitor) {
        performanceMonitor.logCustomError(`Image load failed: ${src}`, {
          agentSlug,
          imageUrl: src,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('[ImageAutomation] Failed to log image error:', error);
    }
  }

  /**
   * Utility: Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get optimization status
   */
  public async getOptimizationStatus(): Promise<any> {
    try {
      const response = await fetch('/api/images/cdn-automation?operation=status');
      const result = await response.json();
      
      if (result.success) {
        return result.status;
      }
    } catch (error) {
      console.error('[ImageAutomation] Failed to get optimization status:', error);
    }
    
    return null;
  }

  /**
   * Force cleanup of caches and observers
   */
  public cleanup() {
    this.optimizationCache.clear();
    this.loadingPromises.clear();
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// Global instance
let globalImageAutomation: ImageAutomation | null = null;

export function getImageAutomation(): ImageAutomation {
  if (!globalImageAutomation) {
    globalImageAutomation = new ImageAutomation();
  }
  return globalImageAutomation;
}

export function initImageAutomation(): ImageAutomation {
  return getImageAutomation();
}

// React hook for image automation
export function useImageAutomation() {
  const automation = getImageAutomation();
  
  return {
    getOptimizedAgentImage: automation.getOptimizedAgentImage.bind(automation),
    optimizeImage: automation.optimizeImage.bind(automation),
    batchOptimize: automation.batchOptimize.bind(automation),
    preloadImages: automation.preloadImages.bind(automation),
    convertToWebP: automation.convertToWebP.bind(automation),
    analyzeImagePerformance: automation.analyzeImagePerformance.bind(automation),
    getOptimizationStatus: automation.getOptimizationStatus.bind(automation)
  };
}

// WebP detection utility for SSR
export async function isWebPSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const automation = getImageAutomation();
  // Wait for WebP detection to complete
  let attempts = 0;
  while (automation['webpSupported'] === null && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  return automation['webpSupported'] || false;
}

export default ImageAutomation; 