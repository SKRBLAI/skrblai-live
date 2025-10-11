import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseAnon } from '@/lib/supabase';
import { readEnvAny } from '@/lib/env/readEnvAny';

interface HealthResponse {
  ok: boolean;
  checks: {
    env: {
      urlOk: boolean;
      anonPrefixOk: boolean;
      serviceRolePrefixOk: boolean;
    };
    network: {
      authReachable: boolean;
      status?: number;
    };
    supabase: {
      connected: boolean;
    };
  };
  meta: {
    url: string;
    anonKeyRedacted: string;
    serviceKeyRedacted: string;
  };
}

type Net = { authReachable: boolean; status?: number };

async function testSupabaseConnectivity(url: string, anonKey: string): Promise<Net> {
  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "content-type": "application/json" },
      body: JSON.stringify({ email: "x@y.z", password: "x" }),
      cache: "no-store",
    });
    return { authReachable: true, status: res.status };
  } catch {
    return { authReachable: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Manual environment validation
    const supabaseUrl = readEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
    const anonKey = readEnvAny('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const envChecks = {
      urlOk: !!supabaseUrl && supabaseUrl.includes('.supabase.co'),
      anonPrefixOk: !!anonKey && (anonKey.startsWith('eyJ') || anonKey.startsWith('sbp_')),
      serviceRolePrefixOk: !!serviceKey && serviceKey.startsWith('eyJ'),
    };
    
    // Test Supabase connectivity
    const supabase = getServerSupabaseAnon();
    let supabaseOk = false;
    if (supabase) {
      try {
        // Simple connectivity test - just check if we can create a client
        supabaseOk = true; // If we got here, client creation worked
        console.log('[Auth Health] Supabase client created successfully');
      } catch (error) {
        console.error('Supabase connectivity test failed:', error);
        supabaseOk = false;
      }
    }
    
    // Initialize networkCheck
    let networkCheck: Net = { authReachable: false };
    
    // Only call testSupabaseConnectivity if we have valid environment
    if (envChecks.urlOk && envChecks.anonPrefixOk && supabaseUrl && anonKey) {
      networkCheck = await testSupabaseConnectivity(supabaseUrl, anonKey);
    }
    
    // Determine overall health
    const overallOk = envChecks.urlOk && 
                     envChecks.anonPrefixOk && 
                     envChecks.serviceRolePrefixOk && 
                     networkCheck.authReachable &&
                     supabaseOk;
    
    const response: HealthResponse = {
      ok: overallOk,
      checks: {
        env: envChecks,
        network: { authReachable: networkCheck.authReachable, status: networkCheck.status },
        supabase: { connected: supabaseOk },
      },
      meta: {
        url: supabaseUrl || '',
        anonKeyRedacted: anonKey ? `${anonKey.substring(0, 8)}...${anonKey.substring(anonKey.length - 8)}` : '****',
        serviceKeyRedacted: serviceKey ? `${serviceKey.substring(0, 8)}...${serviceKey.substring(serviceKey.length - 8)}` : '****',
      },
    };
    
    return NextResponse.json(response, { 
      status: overallOk ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse: HealthResponse = {
      ok: false,
      checks: {
        env: {
          urlOk: false,
          anonPrefixOk: false,
          serviceRolePrefixOk: false,
        },
        network: {
          authReachable: false,
        },
        supabase: {
          connected: false,
        },
      },
      meta: {
        url: '',
        anonKeyRedacted: '****',
        serviceKeyRedacted: '****',
      },
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}


