#!/usr/bin/env node
// MMM: Runtime probe runner for production and local environments

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const PROD_BASE = 'https://skrblai.io';
const LOCAL_BASE = 'http://localhost:3000';

const PROBES = [
  '/api/_probe/env',
  '/api/_probe/supabase',
  '/api/_probe/stripe',
  '/api/_probe/auth',
  '/api/_probe/flags',
  '/api/_probe/storage',
];

async function runProbe(baseUrl, probePath) {
  try {
    const response = await fetch(`${baseUrl}${probePath}`, {
      headers: { 'Cache-Control': 'no-store' }
    });
    
    if (!response.ok) {
      return {
        status: response.status,
        ok: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        probePath,
      };
    }
    
    const data = await response.json();
    return {
      status: response.status,
      ok: true,
      data,
      probePath,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      probePath,
    };
  }
}

async function runAllProbes(baseUrl, environment) {
  console.log(`\n🔍 Running probes for ${environment} (${baseUrl})...\n`);
  
  const results = {};
  
  for (const probe of PROBES) {
    process.stdout.write(`  ${probe}... `);
    const result = await runProbe(baseUrl, probe);
    results[probe] = result;
    
    if (result.ok) {
      console.log('✅ PASS');
    } else {
      console.log(`❌ FAIL (${result.error || result.status})`);
    }
  }
  
  return results;
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  const outputDir = `analysis/probes/${timestamp}`;
  
  // Create output directory
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(`${outputDir}/prod`, { recursive: true });
  mkdirSync(`${outputDir}/local`, { recursive: true });
  
  // Run prod probes
  const prodResults = await runAllProbes(PROD_BASE, 'production');
  
  // Save prod results
  for (const [probe, result] of Object.entries(prodResults)) {
    const filename = probe.replace(/^\/api\/_probe\//, '').replace(/\//g, '_') + '.json';
    writeFileSync(
      `${outputDir}/prod/${filename}`,
      JSON.stringify(result, null, 2)
    );
  }
  
  // Try local probes (may fail if not running)
  console.log('\n📍 Checking if local server is running...');
  try {
    const healthCheck = await fetch(`${LOCAL_BASE}/api/_probe/env`);
    if (healthCheck.ok) {
      const localResults = await runAllProbes(LOCAL_BASE, 'local');
      
      // Save local results
      for (const [probe, result] of Object.entries(localResults)) {
        const filename = probe.replace(/^\/api\/_probe\//, '').replace(/\//g, '_') + '.json';
        writeFileSync(
          `${outputDir}/local/${filename}`,
          JSON.stringify(result, null, 2)
        );
      }
    }
  } catch (error) {
    console.log('⚠️  Local server not running, skipping local probes');
    writeFileSync(
      `${outputDir}/local/README.md`,
      '# Local Probes Skipped\n\nLocal development server was not running when probes were executed.\n'
    );
  }
  
  // Generate summary
  const summary = {
    timestamp,
    prod: prodResults,
    outputDir,
  };
  
  writeFileSync(
    `${outputDir}/summary.json`,
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`\n✅ Probes complete! Results saved to: ${outputDir}`);
  console.log(`\nNext: Review the PASS/FAIL table and update analysis/PROBE_SUMMARY.md\n`);
}

main().catch(console.error);
