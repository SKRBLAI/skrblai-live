#!/usr/bin/env node

/**
 * preflight.mjs
 * Orchestrates all preflight checks before build
 * Runs validate-env and validate-pricing, exits with 1 on any failure
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('#')) return null;

  const noExport = trimmed.startsWith('export ') ? trimmed.slice('export '.length).trim() : trimmed;
  const eqIndex = noExport.indexOf('=');
  if (eqIndex <= 0) return null;

  const key = noExport.slice(0, eqIndex).trim();
  let value = noExport.slice(eqIndex + 1).trim();

  const isQuoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
  if (!isQuoted) {
    const hashIndex = value.indexOf(' #');
    if (hashIndex !== -1) value = value.slice(0, hashIndex).trim();
  }

  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);

  if (!key) return null;
  return { key, value };
}

function loadEnvFiles() {
  const envPaths = [
    join(rootDir, '.env.local'),
    join(rootDir, '.env.production'),
    join(rootDir, '.env'),
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const parsed = parseEnvLine(line);
      if (!parsed) return;
      if (process.env[parsed.key] === undefined) {
        process.env[parsed.key] = parsed.value;
      }
    });
  }
}

function isTruthy(value) {
  if (value === undefined || value === null) return false;
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function requireEnv(keys) {
  const missing = [];
  for (const key of keys) {
    if (!process.env[key]) missing.push(key);
  }
  return missing;
}

function validateEnvContract() {
  console.log('🔍 Validating environment variables (conditional contract)...\n');

  const alwaysRequired = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'FF_SITE_VERSION',
    'FF_N8N_NOOP',
  ];

  const missing = [];
  missing.push(...requireEnv(alwaysRequired));

  const enableStripe = isTruthy(process.env.NEXT_PUBLIC_ENABLE_STRIPE ?? process.env.ENABLE_STRIPE);
  if (enableStripe) {
    missing.push(
      ...requireEnv([
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
      ])
    );
  }

  const boostEnabled = isTruthy(process.env.FF_BOOST);
  if (boostEnabled) {
    missing.push(
      ...requireEnv([
        'NEXT_PUBLIC_SUPABASE_URL_BOOST',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST',
        'SUPABASE_SERVICE_ROLE_KEY_BOOST',
      ])
    );
  }

  const clerkEnabled = isTruthy(process.env.FF_CLERK);
  if (clerkEnabled) {
    missing.push(
      ...requireEnv([
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
      ])
    );
  }

  // If pricing has been migrated to a server-only price map, validate it only when provided.
  if (process.env.PRICE_MAP_JSON) {
    try {
      const parsed = JSON.parse(process.env.PRICE_MAP_JSON);
      if (!parsed || typeof parsed !== 'object') throw new Error('PRICE_MAP_JSON must be a JSON object');
      console.log('✅ PRICE_MAP_JSON is valid JSON');
    } catch (error) {
      missing.push('PRICE_MAP_JSON (invalid JSON)');
    }
  }

  if (missing.length > 0) {
    console.error('❌ FAIL: Missing required environment variables:\n');
    [...new Set(missing)].forEach((key) => console.error(`   - ${key}`));
    console.error('');
    throw new Error('Missing required environment variables');
  }

  console.log('✅ PASS: Environment variables satisfy conditional contract\n');
}

function scanDirsForSubstring(rootDir, dirs, needle) {
  const violations = [];

  function scanDir(relativeDir) {
    const fullPath = join(rootDir, relativeDir);
    if (!fs.existsSync(fullPath)) return;

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.name === 'node_modules' || entry.name === '.next') continue;

      const entryRel = join(relativeDir, entry.name);
      const entryPath = join(rootDir, entryRel);

      if (entry.isDirectory()) {
        scanDir(entryRel);
      } else if (entry.isFile()) {
        if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
        const content = fs.readFileSync(entryPath, 'utf8');
        if (content.includes(needle)) violations.push(entryRel);
      }
    }
  }

  for (const dir of dirs) scanDir(dir);
  return violations;
}

function scanDirsForRegex(rootDir, dirs, pattern) {
  const violations = [];

  function scanDir(relativeDir) {
    const fullPath = join(rootDir, relativeDir);
    if (!fs.existsSync(fullPath)) return;

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.name === 'node_modules' || entry.name === '.next') continue;

      const entryRel = join(relativeDir, entry.name);
      const entryPath = join(rootDir, entryRel);

      if (entry.isDirectory()) {
        scanDir(entryRel);
      } else if (entry.isFile()) {
        if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
        const content = fs.readFileSync(entryPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const match = line.match(pattern);
          if (!match) return;
          violations.push({ file: entryRel, line: idx + 1, match: match[0] });
        });
      }
    }
  }

  for (const dir of dirs) scanDir(dir);
  return violations;
}

function validatePricingConfiguration() {
  console.log('🔍 Checking for client-side NEXT_PUBLIC_STRIPE_PRICE_* env reads...\n');

  const dirsToCheck = ['app', 'components', 'lib', 'contexts', 'hooks', 'utils'];
  const pattern = /process\.env\.NEXT_PUBLIC_STRIPE_PRICE_[A-Z0-9_]+/g;
  const violations = scanDirsForRegex(rootDir, dirsToCheck, pattern);

  if (violations.length > 0) {
    console.error('❌ FAIL: Client-side NEXT_PUBLIC_STRIPE_PRICE_* env reads found:');
    violations.forEach((v) => console.error(`   - ${v.file}:${v.line} → ${v.match}`));
    console.error('');
    throw new Error('Client-side price env usage found');
  }

  console.log('✅ PASS: No client-side NEXT_PUBLIC_STRIPE_PRICE_* env reads found\n');
}

const CHECKS = [
  {
    name: 'Environment Variables',
    run: validateEnvContract,
  },
  {
    name: 'Pricing Configuration',
    run: validatePricingConfiguration,
  },
];

function runCheck(check) {
  console.log(`${'='.repeat(60)}`);
  console.log(`  ${check.name}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    check.run();
    return true;
  } catch (error) {
    return false;
  }
}

function main() {
  console.log('\n🚀 SKRBL AI - Preflight Build Validation\n');
  loadEnvFiles();
  
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
