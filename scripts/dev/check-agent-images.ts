#!/usr/bin/env tsx

/**
 * Simple agent image checker
 * Checks if agent images exist without loading the full registry
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

function main() {
  console.log('🖼️  Agent Image Validation');
  console.log('========================\n');
  
  const imagesDir = join(process.cwd(), 'public', 'images', 'agents');
  const placeholderPath = join(process.cwd(), 'public', 'agents', 'placeholder.png');
  
  // Check if images directory exists
  if (!existsSync(imagesDir)) {
    console.error('❌ Agent images directory not found:', imagesDir);
    return;
  }
  
  // Check if placeholder exists
  if (!existsSync(placeholderPath)) {
    console.warn('⚠️  Placeholder image not found:', placeholderPath);
  } else {
    console.log('✅ Placeholder image exists');
  }
  
  // List all available agent images
  const imageFiles = readdirSync(imagesDir);
  const agentImages = imageFiles.filter(file => 
    file.endsWith('.webp') || file.endsWith('.png')
  );
  
  console.log(`\n📊 Found ${agentImages.length} agent image files:`);
  
  const agents = new Set<string>();
  agentImages.forEach(file => {
    const baseName = file.replace(/\.(webp|png)$/, '').replace(/-nobg$/, '');
    agents.add(baseName);
    console.log(`   - ${file}`);
  });
  
  console.log(`\n🤖 Unique agents with images: ${agents.size}`);
  console.log('Agents:', Array.from(agents).sort().join(', '));
  
  // Check if default/placeholder images exist
  const essentialImages = ['default', 'percy', 'skillsmith', 'ira'];
  console.log('\n🔍 Checking essential agent images:');
  
  essentialImages.forEach(agentId => {
    const hasImage = agents.has(agentId);
    console.log(`   ${hasImage ? '✅' : '❌'} ${agentId}: ${hasImage ? 'found' : 'missing'}`);
  });
  
  console.log('\n✨ Image validation complete!');
}

if (require.main === module) {
  main();
}

export default main;