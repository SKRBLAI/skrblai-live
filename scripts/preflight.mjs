#!/usr/bin/env node
/**
 * SKRBL AI - Preflight Checks
 * Runs validation checks before build to ensure environment is properly configured
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run a script and return a promise
 */
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script ${scriptPath} failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main preflight execution
 */
async function main() {
  console.log('🚀 SKRBL AI Platform Preflight Starting...\n');

  const checks = [
    { name: 'Environment Variables', path: 'scripts/validate-env.mjs' },
    { name: 'Pricing Configuration', path: 'scripts/validate-pricing.mjs' }
  ];

  try {
    for (const check of checks) {
      console.log(`▶️  Running: ${check.name}`);
      await runScript(check.path);
      console.log(`✅ ${check.name} passed\n`);
    }

    console.log('✨ All preflight checks passed! Build can proceed.\n');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Preflight failed: ${error.message}`);
    console.error('\n🔧 Fix the issues above before deploying.\n');
    process.exit(1);
  }
}

main();
