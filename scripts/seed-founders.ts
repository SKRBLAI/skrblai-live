#!/usr/bin/env tsx
/**
 * Founder Codes Seeding Script
 * Securely seeds founder codes with bcrypt hashing
 * NEVER logs or stores plaintext codes
 * 
 * Usage:
 *   npm run seed:founders
 *   or
 *   npx tsx scripts/seed-founders.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getServerSupabaseAdmin } from '../lib/supabase/server';
import { hashFounderCode } from '../lib/founders/codes';

interface FounderCodeSeed {
  label: string;
  role: 'creator' | 'founder' | 'heir';
  agent_likeness: string;
  code: string;
  max_redemptions?: number;
  expires_at?: string;
}

/**
 * Load founder codes from local file or environment
 */
function loadFounderCodes(): FounderCodeSeed[] {
  // Try to load from local file first (not committed to git)
  const localFilePath = join(process.cwd(), 'scripts/data/founders.local.json');
  
  if (existsSync(localFilePath)) {
    try {
      const fileContent = readFileSync(localFilePath, 'utf-8');
      const codes = JSON.parse(fileContent);
      console.log(`📁 Loaded ${codes.length} founder codes from local file`);
      return codes;
    } catch (error) {
      console.error('❌ Error reading local founder codes file:', error);
    }
  }

  // Fallback to environment variable
  const envCodes = process.env.FOUNDER_CODES;
  if (envCodes) {
    try {
      const codes = JSON.parse(envCodes);
      console.log(`🔐 Loaded ${codes.length} founder codes from environment`);
      return codes;
    } catch (error) {
      console.error('❌ Error parsing FOUNDER_CODES environment variable:', error);
    }
  }

  // Default test codes (for development only)
  console.warn('⚠️  Using default test codes - NOT for production!');
  return [
    {
      label: "BrandAlexander",
      role: "founder" as const,
      agent_likeness: "BrandAlexander",
      code: "diggin_420"
    },
    {
      label: "SocialNino", 
      role: "founder" as const,
      agent_likeness: "SocialNino",
      code: "bmore_finest_365"
    },
    {
      label: "ContentCarltig",
      role: "founder" as const, 
      agent_likeness: "ContentCarltig",
      code: "gold_glove_92"
    },
    {
      label: "Jaelin",
      role: "heir" as const,
      agent_likeness: "Percy", 
      code: "mstr_jay_12"
    },
    {
      label: "Creator",
      role: "creator" as const,
      agent_likeness: "Percy",
      code: "mstr_skrbl_3",
      max_redemptions: 3
    }
  ];
}

/**
 * Seed founder codes into database
 */
async function seedFounderCodes() {
  console.log('🚀 Starting founder codes seeding...');

  // Get admin Supabase client
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    console.error('❌ Could not initialize Supabase admin client');
    console.error('   Make sure SUPABASE_SERVICE_ROLE_KEY is set');
    process.exit(1);
  }

  // Load founder codes
  const founderCodes = loadFounderCodes();
  if (founderCodes.length === 0) {
    console.error('❌ No founder codes to seed');
    process.exit(1);
  }

  console.log(`📝 Processing ${founderCodes.length} founder codes...`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const codeData of founderCodes) {
    try {
      // Validate required fields
      if (!codeData.label || !codeData.role || !codeData.agent_likeness || !codeData.code) {
        console.error(`❌ Invalid code data for ${codeData.label}: missing required fields`);
        errorCount++;
        continue;
      }

      // Check if code already exists (by label)
      const { data: existingCode, error: checkError } = await supabase
        .from('founder_codes')
        .select('id, label')
        .eq('label', codeData.label)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking existing code for ${codeData.label}:`, checkError);
        errorCount++;
        continue;
      }

      if (existingCode) {
        console.log(`⏭️  Skipping ${codeData.label} - already exists`);
        skipCount++;
        continue;
      }

      // Hash the code securely
      console.log(`🔐 Hashing code for ${codeData.label}...`);
      const codeHash = await hashFounderCode(codeData.code);

      // Insert the founder code
      const { error: insertError } = await supabase
        .from('founder_codes')
        .insert({
          label: codeData.label,
          role: codeData.role,
          agent_likeness: codeData.agent_likeness,
          code_hash: codeHash,
          max_redemptions: codeData.max_redemptions || 1,
          expires_at: codeData.expires_at || null,
          is_active: true
        });

      if (insertError) {
        console.error(`❌ Error inserting code for ${codeData.label}:`, insertError);
        errorCount++;
        continue;
      }

      console.log(`✅ Successfully seeded ${codeData.label} (${codeData.role})`);
      successCount++;

    } catch (error) {
      console.error(`❌ Unexpected error processing ${codeData.label}:`, error);
      errorCount++;
    }
  }

  // Summary
  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${founderCodes.length}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Some codes failed to seed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All founder codes seeded successfully!');
    process.exit(0);
  }
}

/**
 * Main execution
 */
if (require.main === module) {
  seedFounderCodes().catch((error) => {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  });
}