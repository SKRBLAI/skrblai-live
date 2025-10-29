#!/usr/bin/env node
/**
 * Bundle analyzer for lean pass optimization
 * Usage: node scripts/analyze-bundle.mjs
 */

import { execSync } from 'child_process';

console.log('🔍 Analyzing bundle for lean pass optimization...\n');

// Get build output
try {
  const buildOutput = execSync('npm run build', { encoding: 'utf8' });
  
  // Extract route information
  const routeMatches = buildOutput.match(/├ [○ƒ] [^\s]+[\s\S]*?(?=├|└|$)/g) || [];
  const routes = routeMatches.map(route => {
    const parts = route.trim().split(/\s+/);
    const type = parts[0];
    const path = parts[1];
    const size = parts[2];
    const firstLoad = parts[3];
    
    return {
      type: type === '○' ? 'static' : 'dynamic',
      path,
      size: size ? parseFloat(size) : 0,
      firstLoad: firstLoad ? parseFloat(firstLoad) : 0
    };
  }).filter(route => route.path && route.path !== '└');

  // Sort by first load JS size
  const sortedBySize = routes.sort((a, b) => b.firstLoad - a.firstLoad);
  
  console.log('📊 Top 10 largest routes by First Load JS:');
  console.log('┌─────────────────────────────────────┬──────────┬─────────────┐');
  console.log('│ Route                               │ Size     │ First Load  │');
  console.log('├─────────────────────────────────────┼──────────┼─────────────┤');
  
  sortedBySize.slice(0, 10).forEach(route => {
    const path = route.path.padEnd(35);
    const size = (route.size + ' kB').padStart(8);
    const firstLoad = (route.firstLoad + ' kB').padStart(11);
    console.log(`│ ${path} │ ${size} │ ${firstLoad} │`);
  });
  
  console.log('└─────────────────────────────────────┴──────────┴─────────────┘\n');
  
  // Calculate totals
  const totalRoutes = routes.length;
  const totalSize = routes.reduce((sum, route) => sum + route.size, 0);
  const totalFirstLoad = routes.reduce((sum, route) => sum + route.firstLoad, 0);
  
  console.log(`📈 Bundle Statistics:`);
  console.log(`   Total routes: ${totalRoutes}`);
  console.log(`   Total size: ${totalSize.toFixed(1)} kB`);
  console.log(`   Total first load: ${totalFirstLoad.toFixed(1)} kB`);
  console.log(`   Average route size: ${(totalSize / totalRoutes).toFixed(1)} kB`);
  console.log(`   Average first load: ${(totalFirstLoad / totalRoutes).toFixed(1)} kB\n`);
  
  // Identify optimization opportunities
  console.log('🎯 Optimization Opportunities:');
  
  const heavyRoutes = sortedBySize.filter(route => route.firstLoad > 200);
  if (heavyRoutes.length > 0) {
    console.log(`   Heavy routes (>200kB): ${heavyRoutes.length}`);
    heavyRoutes.forEach(route => {
      console.log(`     - ${route.path}: ${route.firstLoad} kB`);
    });
  }
  
  const dynamicRoutes = routes.filter(route => route.type === 'dynamic');
  console.log(`   Dynamic routes: ${dynamicRoutes.length} (consider static generation)`);
  
  const largeStaticRoutes = routes.filter(route => route.type === 'static' && route.firstLoad > 150);
  if (largeStaticRoutes.length > 0) {
    console.log(`   Large static routes: ${largeStaticRoutes.length}`);
    largeStaticRoutes.forEach(route => {
      console.log(`     - ${route.path}: ${route.firstLoad} kB`);
    });
  }
  
  console.log('\n✅ Bundle analysis complete!');
  
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  process.exit(1);
}
