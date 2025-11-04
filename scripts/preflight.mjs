#!/usr/bin/env node

/**
 * preflight.mjs
 * Orchestrates all preflight checks before build
 * Runs validate-env and validate-pricing, exits with 1 on any failure
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHECKS = [
  {
    name: 'Environment Variables',
    script: 'validate-env.mjs',
  },
  {
    name: 'Pricing Configuration',
    script: 'validate-pricing.mjs',
  },
];

function runCheck(check) {
  console.log(`${'='.repeat(60)}`);
  console.log(`  ${check.name}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    const scriptPath = join(__dirname, check.script);
    execSync(`node "${scriptPath}"`, {
      stdio: 'inherit',
      env: process.env,
    });
    return true;
  } catch (error) {
    return false;
  }
}

function main() {
  console.log('\n🚀 SKRBL AI - Preflight Build Validation\n');
  
  let allPassed = true;
  
  for (const check of CHECKS) {
    const passed = runCheck(check);
    if (!passed) {
      allPassed = false;
      break; // Stop on first failure
    }
  }
  
  console.log(`${'='.repeat(60)}`);
  if (allPassed) {
    console.log('✅ PREFLIGHT PASSED: All checks successful');
    console.log(`${'='.repeat(60)}\n`);
    process.exit(0);
  } else {
    console.log('❌ PREFLIGHT FAILED: Fix issues above before building');
    console.log(`${'='.repeat(60)}\n`);
    process.exit(1);
  }
}

main();
