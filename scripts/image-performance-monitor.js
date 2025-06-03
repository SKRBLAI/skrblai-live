#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

console.log('📊 SKRBL AI Image Performance Monitor');
console.log('====================================');

// Analyze image performance
function analyzeImagePerformance() {
  const imageFiles = fs.readdirSync(PUBLIC_IMAGES_DIR)
    .filter(f => f.startsWith('agents-') && (f.endsWith('.png') || f.endsWith('.webp')));
  
  const analysis = {
    png: { count: 0, totalSize: 0, files: [] },
    webp: { count: 0, totalSize: 0, files: [] },
    potentialSavings: 0,
    recommendations: []
  };
  
  // Categorize and measure files
  imageFiles.forEach(file => {
    const filePath = path.join(PUBLIC_IMAGES_DIR, file);
    const stat = fs.statSync(filePath);
    const sizeMB = stat.size / 1024 / 1024;
    
    const fileInfo = {
      name: file,
      size: stat.size,
      sizeMB: Number(sizeMB.toFixed(1))
    };
    
    if (file.endsWith('.png')) {
      analysis.png.count++;
      analysis.png.totalSize += stat.size;
      analysis.png.files.push(fileInfo);
    } else if (file.endsWith('.webp')) {
      analysis.webp.count++;
      analysis.webp.totalSize += stat.size;
      analysis.webp.files.push(fileInfo);
    }
  });
  
  // Calculate potential savings for PNG files with WebP counterparts
  analysis.png.files.forEach(pngFile => {
    const webpEquivalent = pngFile.name.replace('.png', '.webp');
    const webpFile = analysis.webp.files.find(f => f.name === webpEquivalent);
    
    if (webpFile) {
      const savings = pngFile.size - webpFile.size;
      analysis.potentialSavings += savings;
      
      const savingsPercent = ((savings / pngFile.size) * 100).toFixed(1);
      analysis.recommendations.push({
        file: pngFile.name,
        originalSize: pngFile.sizeMB,
        webpSize: webpFile.sizeMB,
        savings: Number((savings / 1024 / 1024).toFixed(1)),
        savingsPercent: Number(savingsPercent),
        priority: pngFile.sizeMB > 2 ? 'HIGH' : pngFile.sizeMB > 1 ? 'MEDIUM' : 'LOW'
      });
    }
  });
  
  return analysis;
}

// Generate performance report
function generatePerformanceReport(analysis) {
  console.log('\n📈 Performance Analysis:');
  console.log(`   PNG Files: ${analysis.png.count} (${(analysis.png.totalSize / 1024 / 1024).toFixed(1)}MB)`);
  console.log(`   WebP Files: ${analysis.webp.count} (${(analysis.webp.totalSize / 1024 / 1024).toFixed(1)}MB)`);
  console.log(`   Total Potential Savings: ${(analysis.potentialSavings / 1024 / 1024).toFixed(1)}MB`);
  
  if (analysis.recommendations.length > 0) {
    console.log('\n🎯 Optimization Opportunities:');
    
    // Sort by savings potential
    analysis.recommendations
      .sort((a, b) => b.savings - a.savings)
      .forEach(rec => {
        console.log(`   ${rec.priority} | ${rec.file}`);
        console.log(`         ${rec.originalSize}MB → ${rec.webpSize}MB (${rec.savingsPercent}% smaller, saves ${rec.savings}MB)`);
      });
  }
  
  console.log('\n💾 Storage Impact:');
  const totalCurrentSize = analysis.png.totalSize + analysis.webp.totalSize;
  const optimizedSize = totalCurrentSize - analysis.potentialSavings;
  const overallSavings = ((analysis.potentialSavings / totalCurrentSize) * 100).toFixed(1);
  
  console.log(`   Current Total: ${(totalCurrentSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`   After Optimization: ${(optimizedSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`   Overall Savings: ${overallSavings}%`);
}

// Generate mobile performance impact assessment
function assessMobileImpact(analysis) {
  console.log('\n📱 Mobile Performance Impact:');
  
  const criticalImages = analysis.recommendations.filter(r => r.originalSize > 5);
  const highImpactImages = analysis.recommendations.filter(r => r.originalSize > 2);
  
  if (criticalImages.length > 0) {
    console.log(`   🚨 CRITICAL: ${criticalImages.length} images >5MB (causing mobile crashes)`);
    criticalImages.forEach(img => {
      console.log(`      - ${img.file}: ${img.originalSize}MB`);
    });
  }
  
  if (highImpactImages.length > 0) {
    console.log(`   ⚠️  HIGH IMPACT: ${highImpactImages.length} images >2MB (slow mobile loading)`);
  }
  
  // Calculate mobile data usage
  const mobileDataSavings = analysis.potentialSavings / 1024 / 1024;
  console.log(`   📊 Mobile Data Savings: ${mobileDataSavings.toFixed(1)}MB per page load`);
  
  // Loading time estimates (assuming 3G: 1.6Mbps, 4G: 12Mbps)
  const currentLoadTime3G = (analysis.png.totalSize * 8) / (1.6 * 1024 * 1024);
  const optimizedLoadTime3G = ((analysis.png.totalSize - analysis.potentialSavings) * 8) / (1.6 * 1024 * 1024);
  
  console.log(`   ⏱️  3G Load Time: ${currentLoadTime3G.toFixed(1)}s → ${optimizedLoadTime3G.toFixed(1)}s`);
  console.log(`   ⚡ Time Savings: ${(currentLoadTime3G - optimizedLoadTime3G).toFixed(1)}s faster`);
}

// Generate CDN switching recommendations
function generateCDNRecommendations(analysis) {
  console.log('\n🌐 CDN Switching Recommendations:');
  
  const readyForSwitching = analysis.recommendations.filter(r => r.savings > 1);
  
  if (readyForSwitching.length > 0) {
    console.log(`   ✅ Ready for WebP switchover: ${readyForSwitching.length} files`);
    console.log('   📋 Immediate actions:');
    console.log('      1. Update `getAgentImagePath()` to default to WebP');
    console.log('      2. Configure CDN to serve WebP when supported');
    console.log('      3. Add PNG fallback for older browsers');
    console.log('      4. Monitor Core Web Vitals improvements');
    
    console.log('\n   🚀 Expected Performance Gains:');
    console.log(`      - LCP (Largest Contentful Paint): ${(analysis.potentialSavings / analysis.png.totalSize * 100).toFixed(0)}% faster`);
    console.log(`      - Bandwidth savings: ${(analysis.potentialSavings / 1024 / 1024).toFixed(1)}MB per visit`);
    console.log(`      - Mobile UX: Significantly improved loading`);
  } else {
    console.log('   ⏳ Need more WebP conversions before switching');
  }
}

// Main execution
function runPerformanceMonitor() {
  const analysis = analyzeImagePerformance();
  
  generatePerformanceReport(analysis);
  assessMobileImpact(analysis);
  generateCDNRecommendations(analysis);
  
  console.log('\n📝 Performance Report Generated:');
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('   Status: Ready for production optimization');
  
  return analysis;
}

// Export for use in other scripts
if (require.main === module) {
  runPerformanceMonitor();
} else {
  module.exports = { runPerformanceMonitor, analyzeImagePerformance };
} 