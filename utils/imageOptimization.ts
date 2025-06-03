// Image Optimization Utilities for SKRBL AI Mobile Performance

export interface ImageOptimizationReport {
  filename: string;
  currentSizeKB: number;
  recommendedFormat: 'webp' | 'png' | 'jpg';
  estimatedSavings: number;
  priority: 'high' | 'medium' | 'low';
}

// File size analysis based on current images
const AGENT_IMAGE_SIZES: Record<string, number> = {
  'agents-adcreative-nobg-skrblai.png': 11018.3, // 11MB - CRITICAL
  'agents-branding-nobg-skrblai.png': 2590.9,
  'agents-contentcreation-nobg-skrblai.png': 2516.4,
  'agents-payment-nobg-skrblai.png': 2410.4,
  'agents-proposal-nobg-skrblai.png': 2377.4,
  'agents-social-nobg-skrblai.png': 2343.4,
  'agents-analytics-nobg-skrblai.png': 2011.3,
  'agents-percy-nobg-skrblai.png': 1895.8,
  'agents-clientsuccess-nobg-skrblai.png': 1872.9,
  'agents-publishing-nobg-skrblai.png': 1866.6,
  'agents-site-nobg-skrblai.png': 1843.0,
  'agents-videocontent-nobg-skrblai.png': 1798.4,
  'agents-biz-nobg-skrblai.png': 1789.0,
  'agents-sync-nobg-skrblai.png': 243.7
};

export function analyzeImageOptimization(): ImageOptimizationReport[] {
  return Object.entries(AGENT_IMAGE_SIZES).map(([filename, sizeKB]) => {
    let priority: 'high' | 'medium' | 'low' = 'low';
    let estimatedSavings = 0;

    if (sizeKB > 5000) {
      priority = 'high';
      estimatedSavings = Math.round(sizeKB * 0.7); // WebP can save ~70%
    } else if (sizeKB > 1000) {
      priority = 'medium';
      estimatedSavings = Math.round(sizeKB * 0.5); // WebP can save ~50%
    } else {
      priority = 'low';
      estimatedSavings = Math.round(sizeKB * 0.3); // WebP can save ~30%
    }

    return {
      filename,
      currentSizeKB: sizeKB,
      recommendedFormat: 'webp' as const,
      estimatedSavings,
      priority
    };
  }).sort((a, b) => b.currentSizeKB - a.currentSizeKB);
}

export function getMobileImageLoadingStrategy(isMobile: boolean) {
  return {
    loading: isMobile ? 'lazy' as const : 'eager' as const,
    priority: !isMobile,
    quality: isMobile ? 75 : 90,
    sizes: isMobile 
      ? '(max-width: 480px) 48px, (max-width: 768px) 64px, 96px'
      : '(max-width: 768px) 96px, 128px'
  };
}

export function checkWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

export function logImageLoadingPerformance(imageName: string, startTime: number) {
  const loadTime = performance.now() - startTime;
  const isMobile = window.innerWidth < 768;
  
  console.log('[ImageOptimization] Load Performance:', {
    image: imageName,
    loadTimeMs: Math.round(loadTime),
    isMobile,
    timestamp: new Date().toISOString()
  });
  
  // Warn for slow loading images on mobile
  if (isMobile && loadTime > 1000) {
    console.warn('[ImageOptimization] Slow image load detected on mobile:', {
      image: imageName,
      loadTimeMs: Math.round(loadTime),
      recommendation: 'Consider WebP conversion or further compression'
    });
  }
}

// Development utility to log optimization recommendations
export function logOptimizationReport() {
  if (process.env.NODE_ENV === 'development') {
    const report = analyzeImageOptimization();
    console.group('[ImageOptimization] Agent Image Analysis');
    
    const highPriority = report.filter(r => r.priority === 'high');
    const totalSavings = report.reduce((sum, r) => sum + r.estimatedSavings, 0);
    
    console.log('🔥 High Priority Images (>5MB):', highPriority.length);
    console.log('💾 Total Potential Savings:', Math.round(totalSavings / 1024) + 'MB');
    console.log('📱 Mobile Impact: Critical - Images too large for mobile');
    
    console.table(report.slice(0, 5)); // Show top 5 largest
    console.groupEnd();
  }
} 