// Enhanced auth probe with cookie and session diagnosis
import { NextResponse } from 'next/server';
import { getServerSupabaseAnon } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { requireRole } from '@/lib/auth/roles';

export async function GET() {
  // Lock down in production - admin/founder only
  if (process.env.NODE_ENV === 'production') {
    try {
      await requireRole(['admin', 'founder']);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }
  try {
    const cookieStore = await cookies();
    
    // Check cookie configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let cookieDomain = '';
    let sameSite = '';
    let customAuthDomainDetected = false;
    
    try {
      if (supabaseUrl) {
        const url = new URL(supabaseUrl);
        cookieDomain = url.hostname;
        customAuthDomainDetected = false; // Removed custom auth domain support
      }
    } catch {}

    // Check for auth cookies
    const authCookies = cookieStore.getAll().filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('sb-')
    );

    // Test session
    const supabase = getServerSupabaseAnon();
    let sessionPresent = false;
    let user = null;
    let sessionError = null;
    let getUserResult = null;

    if (supabase) {
      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        sessionPresent = !!session;
        user = session?.user || null;
        sessionError = sessionErr?.message || null;
        
        if (session) {
          const { data: { user: currentUser }, error: userErr } = await supabase.auth.getUser();
          getUserResult = {
            success: !userErr,
            user: currentUser,
            error: userErr?.message || null
          };
        }
      } catch (e: any) {
        sessionError = e?.message || 'session-exception';
      }
    }

    // Check for common cookie issues
    const cookieWarnings: string[] = [];
    if (authCookies.length === 0) {
      cookieWarnings.push('No auth cookies found');
    }
    // Removed custom auth domain checks

    return NextResponse.json({
      // Cookie config
      cookieDomain,
      sameSite,
      customAuthDomainDetected,
      authCookiesFound: authCookies.length,
      authCookieNames: authCookies.map(c => c.name),
      
      // Session status
      sessionPresent,
      user: user ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      } : null,
      sessionError,
      getUserResult,
      
      // Warnings
      warnings: cookieWarnings,
      
      // Timestamp
      timestamp: new Date().toISOString()
    }, { 
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return NextResponse.json({
      cookieDomain: '',
      sameSite: '',
      customAuthDomainDetected: false,
      authCookiesFound: 0,
      authCookieNames: [],
      sessionPresent: false,
      user: null,
      sessionError: e?.message || 'auth-probe-exception',
      getUserResult: null,
      warnings: ['Auth probe failed'],
      timestamp: new Date().toISOString()
    }, { 
      status: 500, 
      headers: { 'Cache-Control': 'no-store' } 
    });
  }
}
