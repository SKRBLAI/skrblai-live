import { NextRequest, NextResponse } from 'next/server';
import { validateEnvSafe } from '@/lib/env';

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
    // Validate environment using new validateEnvSafe()
    const validation = validateEnvSafe();
    
    // Build envChecks from validation.checks
    const envChecks = validation.checks;
    
    // Initialize networkCheck
    let networkCheck: Net = { authReachable: false };
    
    // Only call testSupabaseConnectivity if urlOk && anonPrefixOk
    if (validation.checks.urlOk && validation.checks.anonPrefixOk) {
      networkCheck = await testSupabaseConnectivity(
        validation.env.NEXT_PUBLIC_SUPABASE_URL!,
        validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    
    // Determine overall health
    const overallOk = envChecks.urlOk && 
                     envChecks.anonPrefixOk && 
                     envChecks.serviceRolePrefixOk && 
                     networkCheck.authReachable;
    
    const response: HealthResponse = {
      ok: overallOk,
      checks: {
        env: envChecks,
        network: { authReachable: networkCheck.authReachable, status: networkCheck.status },
      },
      meta: {
        url: validation.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anonKeyRedacted: validation.redact(validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        serviceKeyRedacted: validation.redact(validation.env.SUPABASE_SERVICE_ROLE_KEY),
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


