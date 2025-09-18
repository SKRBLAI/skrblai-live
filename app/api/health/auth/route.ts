import { NextRequest, NextResponse } from 'next/server';
import { validateSupabaseEnvSafe, redact } from '@/lib/env';

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

async function testSupabaseConnectivity(url: string, anonKey: string): Promise<{ authReachable: boolean; status?: number }> {
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'invalid' }),
    });

    const status = response.status;
    
    // We expect 400 or 422 for invalid credentials (good: reached Auth)
    if (status === 400 || status === 422) {
      return { authReachable: true, status };
    } else {
      return { authReachable: false, status };
    }
  } catch (error) {
    return { authReachable: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate environment
    const validation = validateSupabaseEnvSafe();
    
    const envChecks = {
      urlOk: validation.isValid && !!validation.env.NEXT_PUBLIC_SUPABASE_URL,
      anonPrefixOk: validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('sbp_') || false,
      serviceRolePrefixOk: validation.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sbs_') || false,
    };
    
    // Test network connectivity if we have the required vars
    let networkCheck = { authReachable: false, status: undefined as number | undefined };
    if (validation.env.NEXT_PUBLIC_SUPABASE_URL && validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const net = await testSupabaseConnectivity(
        validation.env.NEXT_PUBLIC_SUPABASE_URL,
        validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      networkCheck = { authReachable: net.authReachable, status: net.status };
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
        network: networkCheck,
      },
      meta: {
        url: validation.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anonKeyRedacted: redact(validation.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
        serviceKeyRedacted: redact(validation.env.SUPABASE_SERVICE_ROLE_KEY || ''),
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


