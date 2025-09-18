#!/usr/bin/env tsx

/**
 * Supabase Diagnostics Script
 * Validates environment variables and tests network connectivity to Supabase Auth
 */

import { validateSupabaseEnvSafe, redact } from '../../lib/env';

interface DiagnosticResult {
  env: {
    urlPresent: boolean;
    urlValid: boolean;
    anonPresent: boolean;
    anonPrefixValid: boolean;
    serviceRolePresent: boolean;
    serviceRolePrefixValid: boolean;
  };
  network: {
    reachable: boolean;
    status?: number;
    error?: string;
  };
  overall: boolean;
}

async function testSupabaseConnectivity(url: string, anonKey: string): Promise<{ reachable: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'invalid' }),
    });

    // We expect 400 or 422 for invalid credentials (good: reached Auth)
    // 401/403/5xx/ENOTFOUND/timeout => fail
    const status = response.status;
    
    if (status === 400 || status === 422) {
      return { reachable: true, status };
    } else if (status === 401 || status === 403) {
      return { reachable: false, status, error: 'Authentication failed - check API key' };
    } else if (status >= 500) {
      return { reachable: false, status, error: 'Server error from Supabase' };
    } else {
      return { reachable: false, status, error: `Unexpected status: ${status}` };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return { reachable: false, error: 'Network unreachable - check URL' };
      } else if (error.message.includes('timeout')) {
        return { reachable: false, error: 'Request timeout' };
      }
      return { reachable: false, error: error.message };
    }
    return { reachable: false, error: 'Unknown network error' };
  }
}

function printTable(result: DiagnosticResult, env: any) {
  console.log('\n📊 Supabase Diagnostics Report');
  console.log('═'.repeat(50));
  
  console.log('\n🔧 Environment Variables:');
  console.log('─'.repeat(30));
  console.log(`URL Present:        ${result.env.urlPresent ? '✅' : '❌'}`);
  console.log(`URL Valid:          ${result.env.urlValid ? '✅' : '❌'}`);
  console.log(`Anon Key Present:   ${result.env.anonPresent ? '✅' : '❌'}`);
  console.log(`Anon Key Prefix:    ${result.env.anonPrefixValid ? '✅' : '❌'}`);
  console.log(`Service Key Present:${result.env.serviceRolePresent ? '✅' : '❌'}`);
  console.log(`Service Key Prefix: ${result.env.serviceRolePrefixValid ? '✅' : '❌'}`);
  
  console.log('\n🌐 Network Connectivity:');
  console.log('─'.repeat(30));
  console.log(`Auth Reachable:     ${result.network.reachable ? '✅' : '❌'}`);
  if (result.network.status) {
    console.log(`Response Status:    ${result.network.status}`);
  }
  if (result.network.error) {
    console.log(`Error:              ${result.network.error}`);
  }
  
  console.log('\n🔐 Configuration (Redacted):');
  console.log('─'.repeat(30));
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log(`URL:                ${env.NEXT_PUBLIC_SUPABASE_URL}`);
  }
  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log(`Anon Key:           ${redact(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}`);
  }
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`Service Key:        ${redact(env.SUPABASE_SERVICE_ROLE_KEY)}`);
  }
  
  console.log('\n📋 Overall Status:');
  console.log('─'.repeat(30));
  console.log(`Result:             ${result.overall ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!result.overall) {
    console.log('\n💡 Troubleshooting:');
    console.log('─'.repeat(30));
    if (!result.env.urlPresent || !result.env.urlValid) {
      console.log('• Check NEXT_PUBLIC_SUPABASE_URL is set and valid');
    }
    if (!result.env.anonPresent || !result.env.anonPrefixValid) {
      console.log('• Check NEXT_PUBLIC_SUPABASE_ANON_KEY is set and starts with "sbp_"');
    }
    if (!result.env.serviceRolePresent || !result.env.serviceRolePrefixValid) {
      console.log('• Check SUPABASE_SERVICE_ROLE_KEY is set and starts with "sbs_"');
    }
    if (!result.network.reachable) {
      console.log('• Check network connectivity and Supabase project status');
    }
  }
  
  console.log('\n' + '═'.repeat(50));
}

async function main() {
  console.log('🔍 Running Supabase Diagnostics...\n');
  
  // Validate environment
  const validation = validateSupabaseEnvSafe();
  
  const result: DiagnosticResult = {
    env: {
      urlPresent: !!validation.env.NEXT_PUBLIC_SUPABASE_URL,
      urlValid: validation.isValid && !!validation.env.NEXT_PUBLIC_SUPABASE_URL,
      anonPresent: !!validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonPrefixValid: validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('sbp_') || false,
      serviceRolePresent: !!validation.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRolePrefixValid: validation.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sbs_') || false,
    },
    network: { reachable: false },
    overall: false,
  };
  
  // Test network connectivity if we have the required vars
  if (validation.env.NEXT_PUBLIC_SUPABASE_URL && validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('🌐 Testing network connectivity...');
    result.network = await testSupabaseConnectivity(
      validation.env.NEXT_PUBLIC_SUPABASE_URL,
      validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  } else {
    result.network.error = 'Missing URL or anon key for network test';
  }
  
  // Determine overall result
  result.overall = result.env.urlValid && 
                   result.env.anonPrefixValid && 
                   result.env.serviceRolePrefixValid && 
                   result.network.reachable;
  
  // Print results
  printTable(result, validation.env);
  
  // Exit with appropriate code
  process.exit(result.overall ? 0 : 1);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Run the diagnostics
main().catch((error) => {
  console.error('\n❌ Diagnostics failed:', error.message);
  process.exit(1);
});


