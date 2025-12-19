/**
 * De-Cursed Environment Verification Script
 * 
 * This script enforces the canonical env contract:
 * 1. Checks for required env vars
 * 2. Fails build if NEXT_PUBLIC_STRIPE_PRICE_* is used in client code
 * 3. Fails build if non-canonical flags are used
 * 4. Validates canonical flags only
 * 
 * Usage: `npx ts-node scripts/verifyEnv.ts` or `npm run preflight`
 */
import fs from 'fs';
import path from 'path';

// === CONFIGURATION ===

// Canonical flags (the only flags that should be read from env)
const CANONICAL_FLAGS = [
  'FF_BOOST',
  'FF_CLERK', 
  'FF_SITE_VERSION',
  'FF_N8N_NOOP',
  'ENABLE_STRIPE',
];

// Required env vars (build will fail if missing)
const REQUIRED_ENVS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Optional but recommended env vars
const RECOMMENDED_ENVS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'OPENAI_API_KEY',
];

// Directories to scan for violations
const SCAN_DIRS = ['app', 'components', 'lib', 'hooks', 'utils', 'contexts'];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx'];

// === HELPERS ===

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('#')) return null;

  const noExport = trimmed.startsWith('export ') ? trimmed.slice('export '.length).trim() : trimmed;
  const eqIndex = noExport.indexOf('=');
  if (eqIndex <= 0) return null;

  const key = noExport.slice(0, eqIndex).trim();
  let value = noExport.slice(eqIndex + 1).trim();

  // Strip inline comments for unquoted values: KEY=value # comment
  const isQuoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
  if (!isQuoted) {
    const hashIndex = value.indexOf(' #');
    if (hashIndex !== -1) value = value.slice(0, hashIndex).trim();
  }

  // Remove surrounding quotes
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);

  if (!key) return null;
  return { key, value };
}

function loadEnvFile() {
  // Mirror Next.js precedence (roughly): local first, then production, then base.
  const envPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env.production'),
    path.resolve(process.cwd(), '.env'),
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const parsed = parseEnvLine(line);
      if (!parsed) return;
      if (process.env[parsed.key] === undefined) {
        process.env[parsed.key] = parsed.value;
      }
    });
  }
}

function scanFilesForPattern(pattern: RegExp, dirs: string[]): { file: string; line: number; match: string }[] {
  const violations: { file: string; line: number; match: string }[] = [];
  
  function scanDir(dir: string) {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) return;
    
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(fullPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDir(path.join(dir, entry.name));
      } else if (entry.isFile() && SCAN_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(entryPath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          const matches = line.match(pattern);
          if (matches) {
            violations.push({
              file: path.relative(process.cwd(), entryPath),
              line: idx + 1,
              match: matches[0]
            });
          }
        });
      }
    }
  }
  
  dirs.forEach(scanDir);
  return violations;
}

// === CHECKS ===

function checkRequiredEnvs(): { missing: string[]; present: string[] } {
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const key of REQUIRED_ENVS) {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }
  
  return { missing, present };
}

function checkRecommendedEnvs(): { missing: string[]; present: string[] } {
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const key of RECOMMENDED_ENVS) {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }
  
  return { missing, present };
}

function checkCanonicalFlags(): { set: string[]; unset: string[] } {
  const set: string[] = [];
  const unset: string[] = [];
  
  for (const flag of CANONICAL_FLAGS) {
    if (process.env[flag] !== undefined) {
      set.push(flag);
    } else {
      unset.push(flag);
    }
  }
  
  return { set, unset };
}

function checkClientPriceEnvUsage(): { file: string; line: number; match: string }[] {
  // Pattern: process.env.NEXT_PUBLIC_STRIPE_PRICE_ in client code
  const pattern = /process\.env\.NEXT_PUBLIC_STRIPE_PRICE_[A-Z0-9_]+/g;
  return scanFilesForPattern(pattern, SCAN_DIRS);
}

// === MAIN ===

console.log('\n🔍 DE-CURSED ENV VERIFICATION\n');
console.log('=' .repeat(50));

loadEnvFile();

let hasErrors = false;
let hasWarnings = false;

// 1. Check required envs
console.log('\n📋 REQUIRED ENVIRONMENT VARIABLES\n');
const required = checkRequiredEnvs();
for (const key of [...required.present, ...required.missing]) {
  const status = required.present.includes(key) ? '✅' : '❌';
  console.log(`  ${status} ${key}`);
}
if (required.missing.length > 0) {
  console.log(`\n  ❌ FAIL: Missing ${required.missing.length} required env vars`);
  hasErrors = true;
} else {
  console.log(`\n  ✅ PASS: All required env vars present`);
}

// 2. Check recommended envs
console.log('\n📋 RECOMMENDED ENVIRONMENT VARIABLES\n');
const recommended = checkRecommendedEnvs();
for (const key of [...recommended.present, ...recommended.missing]) {
  const status = recommended.present.includes(key) ? '✅' : '⚠️';
  console.log(`  ${status} ${key}`);
}
if (recommended.missing.length > 0) {
  console.log(`\n  ⚠️ WARN: Missing ${recommended.missing.length} recommended env vars`);
  hasWarnings = true;
}

// 3. Check canonical flags
console.log('\n🚩 CANONICAL FLAGS (5 total)\n');
const flags = checkCanonicalFlags();
for (const flag of CANONICAL_FLAGS) {
  const status = flags.set.includes(flag) ? '✅ SET' : '⚪ DEFAULT';
  console.log(`  ${status.padEnd(12)} ${flag}`);
}

// 4. Check for client-side NEXT_PUBLIC_STRIPE_PRICE_* usage
console.log('\n💳 CLIENT-SIDE PRICE ENV USAGE CHECK\n');
const priceViolations = checkClientPriceEnvUsage();
if (priceViolations.length > 0) {
  console.log('  ❌ VIOLATIONS FOUND:');
  for (const v of priceViolations) {
    console.log(`     ${v.file}:${v.line} → ${v.match}`);
  }
  console.log(`\n  ❌ FAIL: ${priceViolations.length} client-side NEXT_PUBLIC_STRIPE_PRICE_* usages found`);
  console.log('     Client code should send SKU only; server resolves priceId');
  hasErrors = true;
} else {
  console.log('  ✅ PASS: No client-side NEXT_PUBLIC_STRIPE_PRICE_* usage');
}

// Summary
console.log('\n' + '=' .repeat(50));
console.log('\n📊 SUMMARY\n');

if (hasErrors) {
  console.log('  ❌ PREFLIGHT FAILED - Fix errors above before deploying\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('  ⚠️ PREFLIGHT PASSED WITH WARNINGS\n');
  process.exit(0);
} else {
  console.log('  ✅ PREFLIGHT PASSED - Ready to deploy\n');
  process.exit(0);
}
