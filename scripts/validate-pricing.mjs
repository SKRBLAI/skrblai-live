#!/usr/bin/env node

/**
 * validate-pricing.mjs
 * Validates pricing configuration and ensures no hardcoded STRIPE_PRICE_ references
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const REQUIRED_PRICE_KEYS = [
  'legacy.fusion',
  'early.fusion.monthly',
  'early.fusion.annual',
];

function checkForHardcodedPrices() {
  console.log('🔍 Checking for hardcoded STRIPE_PRICE_ references...\n');
  
  try {
    // Use grep to find any NEXT_PUBLIC_STRIPE_PRICE_ in UI code
    // Check in app/, components/, and lib/ directories
    const dirsToCheck = ['app', 'components', 'lib', 'contexts', 'hooks'];
    
    let foundViolations = false;
    
    for (const dir of dirsToCheck) {
      const dirPath = join(rootDir, dir);
      try {
        // Check if directory exists first
        const result = execSync(
          `grep -r "NEXT_PUBLIC_STRIPE_PRICE_" "${dirPath}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" || true`,
          { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
        );
        
        if (result.trim()) {
          foundViolations = true;
          console.error(`❌ Found hardcoded STRIPE_PRICE_ in ${dir}/:`);
          console.error(result);
        }
      } catch (error) {
        // Directory might not exist or grep found nothing
        continue;
      }
    }
    
    if (foundViolations) {
      console.error('\n❌ FAIL: Hardcoded NEXT_PUBLIC_STRIPE_PRICE_ references found');
      console.error('   Use NEXT_PUBLIC_PRICE_MAP_JSON instead\n');
      process.exit(1);
    }
    
    console.log('✅ No hardcoded STRIPE_PRICE_ references found');
  } catch (error) {
    // If grep fails for other reasons, warn but don't fail
    console.warn('⚠️  Could not complete grep check:', error.message);
  }
}

function validatePriceMap() {
  console.log('\n🔍 Validating NEXT_PUBLIC_PRICE_MAP_JSON structure...\n');
  
  const priceMapJson = process.env.NEXT_PUBLIC_PRICE_MAP_JSON;
  
  if (!priceMapJson) {
    console.error('❌ FAIL: NEXT_PUBLIC_PRICE_MAP_JSON not found in environment\n');
    process.exit(1);
  }
  
  let priceMap;
  try {
    priceMap = JSON.parse(priceMapJson);
  } catch (error) {
    console.error('❌ FAIL: NEXT_PUBLIC_PRICE_MAP_JSON is not valid JSON');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
  
  const missing = [];
  const present = [];
  
  for (const key of REQUIRED_PRICE_KEYS) {
    if (!priceMap[key]) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ FAIL: Missing required price keys in NEXT_PUBLIC_PRICE_MAP_JSON:\n');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nRequired keys:', REQUIRED_PRICE_KEYS.join(', '));
    console.error('');
    process.exit(1);
  }
  
  console.log('✅ PASS: All required price keys present:');
  present.forEach(key => console.log(`   - ${key}: ${priceMap[key]}`));
  console.log('');
}

// Run validations
checkForHardcodedPrices();
validatePriceMap();
