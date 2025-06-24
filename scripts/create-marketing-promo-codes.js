#!/usr/bin/env node

/**
 * SKRBL AI Marketing Promo Code Generator
 * Creates 15 promo codes for 30-day full access for personal contacts
 * 
 * Usage: node scripts/create-marketing-promo-codes.js
 */

const { createClient } = require('@supabase/supabase-js');

// Environment variables (these should be set in your system or .env)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
  console.error('\n💡 Make sure your environment variables are properly configured.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 15 Marketing Promo Codes for Personal Contacts (30-day full access)
const MARKETING_PROMO_CODES = [
  {
    code: 'FRIEND01',
    type: 'PROMO',
    usage_limit: 1, // Single use for specific person
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #1',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND02',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #2',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND03',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #3',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND04',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #4',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND05',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #5',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND06',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #6',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND07',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #7',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND08',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #8',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND09',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #9',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND10',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #10',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND11',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #11',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND12',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #12',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND13',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #13',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND14',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #14',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  },
  {
    code: 'FRIEND15',
    type: 'PROMO',
    usage_limit: 1,
    benefits: {
      dashboard_access: true,
      duration_days: 30,
      features: ['all_agents', 'premium_features', 'advanced_analytics', 'priority_support'],
      access_level: 'full'
    },
    metadata: {
      description: '30-day full access for personal contact #15',
      campaign: 'personal_network_2025',
      target_audience: 'personal_contacts'
    },
    expires_at: '2025-03-31T23:59:59Z'
  }
];

async function createPromoCode(codeData) {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: codeData.code,
        type: codeData.type,
        usage_limit: codeData.usage_limit,
        benefits: codeData.benefits,
        metadata: codeData.metadata,
        expires_at: codeData.expires_at,
        status: 'active',
        current_usage: 0
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to create promo code ${codeData.code}:`, error.message);
      return false;
    }

    console.log(`✅ Created promo code: ${codeData.code} (30-day full access)`);
    return true;
  } catch (err) {
    console.error(`❌ Exception creating promo code ${codeData.code}:`, err.message);
    return false;
  }
}

async function generateMarketingCodes() {
  console.log('🚀 SKRBL AI Personal Network Promo Codes');
  console.log('=========================================\n');

  console.log('📢 Creating 15 Personal Contact Promo Codes (30-day full access)...\n');
  let createdCodes = 0;
  
  for (const codeData of MARKETING_PROMO_CODES) {
    const success = await createPromoCode(codeData);
    if (success) createdCodes++;
    // Small delay to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Successfully created ${createdCodes}/${MARKETING_PROMO_CODES.length} promo codes\n`);

  // Display the codes for easy reference
  console.log('📋 YOUR PERSONAL CONTACT PROMO CODES:');
  console.log('=====================================');
  MARKETING_PROMO_CODES.forEach((code, index) => {
    console.log(`${(index + 1).toString().padStart(2, '0')}. ${code.code} - 30-day full access (expires March 31, 2025)`);
  });

  console.log('\n📊 SUMMARY:');
  console.log(`• Total codes created: ${createdCodes}`);
  console.log(`• Access level: Full platform access`);
  console.log(`• Duration: 30 days each`);
  console.log(`• Usage: Single-use codes (1 per person)`);
  console.log(`• Expires: March 31, 2025`);
  console.log(`• Target: Personal network contacts`);

  console.log('\n💡 USAGE INSTRUCTIONS:');
  console.log('• Share these codes with your personal contacts');
  console.log('• Each code can only be used once');
  console.log('• Users get full access to all agents and features');
  console.log('• 30-day trial period with priority support');
  console.log('• Perfect for getting feedback and testimonials');

  console.log('\n🎯 READY TO SHARE! 🚀');
  console.log('Your personal network promo codes are ready for distribution.');
}

// Run the script
if (require.main === module) {
  generateMarketingCodes().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { generateMarketingCodes, MARKETING_PROMO_CODES }; 