import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = new URL(req.url);
    url.host = host.slice(4); // strip "www."
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

<<<<<<< HEAD
export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  
  // Handle apex → www redirect (if needed)
  const hostname = request.headers.get('host');
  if (hostname === 'www.skrblai.io') {
    const url = request.nextUrl.clone();
    url.hostname = 'skrblai.io';
    response = NextResponse.redirect(url, 308);
  }
  
  // Add security headers to all responses
  response = addSecurityHeaders(response);
  
  // Skip auth logic for static files and API health
  const path = request.nextUrl.pathname;
  if (path.startsWith('/_next/') || path.startsWith('/api/health')) {
    return response;
  }
  
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get URL info
  const url = request.nextUrl.clone();

  // Bundle redirect rules - redirect all bundle-related paths to /sports#plans
  if (path.startsWith('/bundle') || 
      path.startsWith('/bundles') || 
      path.includes('/bundle')) {
    console.log('[MIDDLEWARE] Redirecting bundle path to sports plans:', path);
    const redirectUrl = new URL('/sports#plans', request.url);
    return NextResponse.redirect(redirectUrl, 301); // Permanent redirect
  }
  
  // Prevent redirect loops - never redirect from auth pages
  if (path === '/sign-in' || path.startsWith('/sign-in') || 
      path === '/sign-up' || path.startsWith('/sign-up') ||
      path.startsWith('/auth/redirect')) {
    console.log('[MIDDLEWARE] On auth page, allowing access');
    return response;
  }
  
  // Protect dashboard routes
  if (!session && path.startsWith('/dashboard')) {
    console.log('[MIDDLEWARE] No auth session found, redirecting to sign-in');
    
    // Create redirect URL with reason parameter
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('reason', 'session-expired');
    
    // Only set 'from' if it wouldn't create a loop
    if (path !== '/sign-in' && !path.startsWith('/sign-in')) {
      redirectUrl.searchParams.set('from', path);
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  // NEW: Percy onboarding flow logic - IMPROVED for existing users
  if (session && path.startsWith('/dashboard')) {
    const user = session.user;
    
    // Check if user email is verified
    const isEmailVerified = user.email_confirmed_at != null;
    
    // IMPROVED: Also consider existing users as "verified" if they have:
    // 1. A valid session (they successfully logged in)
    // 2. Account created more than 24 hours ago (existing user, not new signup)
    const accountAge = user.created_at ? 
      Date.now() - new Date(user.created_at).getTime() : 0;
    const isExistingUser = accountAge > 24 * 60 * 60 * 1000; // 24 hours
    
    // Allow dashboard access if:
    // - Email is verified, OR
    // - User is an existing user with valid session, OR
    // - User has previously accessed dashboard (stored in user metadata)
    const allowDashboardAccess = isEmailVerified || isExistingUser || user.user_metadata?.dashboard_access;
    
    if (!allowDashboardAccess) {
      console.log('[MIDDLEWARE] New unverified user - allowing dashboard access (no silent redirect)');
      // Allow access; Dashboard page will handle any UI gating or messaging
      return response;
    }
    
    console.log('[MIDDLEWARE] User verified or existing, allowing dashboard access:', {
      email: user.email,
      isEmailVerified,
      isExistingUser,
      accountAge: Math.round(accountAge / (60 * 60 * 1000)) + ' hours'
    });
  }
  
  // Public API allowlist (no auth required) and Auth-required API allowlist
  const PUBLIC_API_PATHS = [
    '/api/auth/',
    '/api/public/',
    '/api/sports/intake',
    '/api/checkout',
    '/api/stripe/webhooks',
    '/api/analytics/percy',
    '/api/env-check',
    '/api/health',
    '/api/skillsmith'
  ];
  
  // Auth-required API paths that should not be blocked by middleware
  // (these require auth but should not trigger redirect loops)
  const AUTH_API_PATHS = [
    '/api/parent/'
  ];
  
  // Handle API routes without auth
  if (!session && path.startsWith('/api/') && 
      !PUBLIC_API_PATHS.some(publicPath => path.startsWith(publicPath)) &&
      !AUTH_API_PATHS.some(authPath => path.startsWith(authPath))) {
    
    console.log('[MIDDLEWARE] API request without auth:', path);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication required',
        code: 'auth_required'
      }, 
      { status: 401 }
    );
  }
  
  // Handle auth-required API routes - let them handle their own auth
  if (path.startsWith('/api/') && 
      AUTH_API_PATHS.some(authPath => path.startsWith(authPath))) {
    console.log('[MIDDLEWARE] Auth-required API request:', path, session ? 'with session' : 'without session');
    return response; // Let the API route handle auth validation
  }

  // If we get here, user is authenticated (or accessing allowed routes)
  console.log('[MIDDLEWARE] Request authorized for:', path);
  
  return response;
}
=======
export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api/stripe/webhooks).*)"],
};
>>>>>>> eec37664357c25a47c50c3909fad9cd7fe005d4c
