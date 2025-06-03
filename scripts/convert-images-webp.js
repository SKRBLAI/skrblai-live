#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Top 3 largest images to convert based on size analysis
const TARGET_IMAGES = [
  'agents-adcreative-nobg-skrblai.png',     // 11MB - CRITICAL
  'agents-branding-nobg-skrblai.png',      // 2.5MB
  'agents-contentcreation-nobg-skrblai.png' // 2.4MB
];

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

console.log('🖼️  SKRBL AI Image Optimization - WebP Converter');
console.log('================================================');

// Check if Sharp is available for conversion
function checkSharpAvailability() {
  try {
    require('sharp');
    return true;
  } catch (error) {
    console.log('⚠️  Sharp not found. Installing...');
    try {
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
      return true;
    } catch (installError) {
      console.error('❌ Failed to install Sharp:', installError.message);
      return false;
    }
  }
}

// Convert PNG to WebP using Sharp
async function convertToWebP(imageName) {
  const sharp = require('sharp');
  
  const inputPath = path.join(PUBLIC_IMAGES_DIR, imageName);
  const outputPath = path.join(PUBLIC_IMAGES_DIR, imageName.replace('.png', '.webp'));
  
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Source image not found: ${imageName}`);
    return false;
  }
  
  if (fs.existsSync(outputPath)) {
    console.log(`ℹ️  WebP already exists: ${imageName.replace('.png', '.webp')}`);
    return true;
  }
  
  try {
    console.log(`🔄 Converting: ${imageName}`);
    
    const originalStat = fs.statSync(inputPath);
    const originalSizeMB = (originalStat.size / 1024 / 1024).toFixed(1);
    
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 }) // High quality, maximum effort
      .toFile(outputPath);
    
    const convertedStat = fs.statSync(outputPath);
    const convertedSizeMB = (convertedStat.size / 1024 / 1024).toFixed(1);
    const savings = ((1 - convertedStat.size / originalStat.size) * 100).toFixed(1);
    
    console.log(`✅ ${imageName}`);
    console.log(`   📉 ${originalSizeMB}MB → ${convertedSizeMB}MB (${savings}% smaller)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${imageName}:`, error.message);
    return false;
  }
}

// Alternative conversion using ImageMagick (fallback)
function convertWithImageMagick(imageName) {
  const inputPath = path.join(PUBLIC_IMAGES_DIR, imageName);
  const outputPath = path.join(PUBLIC_IMAGES_DIR, imageName.replace('.png', '.webp'));
  
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Source image not found: ${imageName}`);
    return false;
  }
  
  if (fs.existsSync(outputPath)) {
    console.log(`ℹ️  WebP already exists: ${imageName.replace('.png', '.webp')}`);
    return true;
  }
  
  try {
    console.log(`🔄 Converting with ImageMagick: ${imageName}`);
    
    const originalStat = fs.statSync(inputPath);
    const originalSizeMB = (originalStat.size / 1024 / 1024).toFixed(1);
    
    execSync(`magick "${inputPath}" -quality 85 "${outputPath}"`, { stdio: 'pipe' });
    
    const convertedStat = fs.statSync(outputPath);
    const convertedSizeMB = (convertedStat.size / 1024 / 1024).toFixed(1);
    const savings = ((1 - convertedStat.size / originalStat.size) * 100).toFixed(1);
    
    console.log(`✅ ${imageName}`);
    console.log(`   📉 ${originalSizeMB}MB → ${convertedSizeMB}MB (${savings}% smaller)`);
    
    return true;
  } catch (error) {
    console.error(`❌ ImageMagick conversion failed for ${imageName}:`, error.message);
    return false;
  }
}

// Main conversion process
async function convertImages() {
  console.log(`📁 Working in: ${PUBLIC_IMAGES_DIR}`);
  console.log(`🎯 Converting ${TARGET_IMAGES.length} priority images\n`);
  
  let successCount = 0;
  let totalSavings = 0;
  
  const useSharp = checkSharpAvailability();
  
  for (const imageName of TARGET_IMAGES) {
    let success = false;
    
    if (useSharp) {
      success = await convertToWebP(imageName);
    } else {
      // Fallback to ImageMagick
      console.log('📌 Trying ImageMagick as fallback...');
      success = convertWithImageMagick(imageName);
    }
    
    if (success) {
      successCount++;
    }
    
    console.log(''); // Add spacing
  }
  
  console.log('🎉 Conversion Summary:');
  console.log(`   ✅ Successfully converted: ${successCount}/${TARGET_IMAGES.length} images`);
  
  if (successCount > 0) {
    console.log('\n📋 Next Steps:');
    console.log('   1. Test WebP images in browser');
    console.log('   2. Update image references to use WebP when supported');
    console.log('   3. Configure CDN to serve optimized formats');
    console.log('   4. Monitor loading performance improvements');
  }
  
  console.log('\n🚀 Ready for CDN switchover when needed!');
}

// Run the conversion
convertImages().catch(error => {
  console.error('💥 Conversion process failed:', error);
  process.exit(1);
}); 