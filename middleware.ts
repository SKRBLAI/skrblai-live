import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ],
  runtime: 'experimental-edge'
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get URL info
  const url = request.nextUrl.clone();
  const path = url.pathname;
  
  // Protect dashboard routes
  if (!session && path.startsWith('/dashboard')) {
    console.log('[MIDDLEWARE] No auth session found, redirecting to sign-in');
    
    // Create redirect URL with reason parameter
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('reason', 'session-expired');
    redirectUrl.searchParams.set('from', path);
    
    return NextResponse.redirect(redirectUrl);
  }

  // NEW: Percy onboarding flow logic
  if (session && path.startsWith('/dashboard')) {
    const user = session.user;
    
    // Check if user email is verified
    const isEmailVerified = user.email_confirmed_at != null;
    
    if (!isEmailVerified) {
      console.log('[MIDDLEWARE] User not verified, redirecting to onboarding');
      
      // Redirect unverified users to homepage for Percy onboarding
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('reason', 'email-not-verified');
      
      return NextResponse.redirect(homeUrl);
    }
    
    console.log('[MIDDLEWARE] User is verified, allowing dashboard access');
  }
  
  // Handle API routes without auth
  if (!session && path.startsWith('/api/') && 
      !path.startsWith('/api/auth/') && 
      !path.startsWith('/api/public/')) {
    
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

  // If we get here, user is authenticated (or accessing allowed routes)
  console.log('[MIDDLEWARE] Request authorized for:', path);
  
  return res;
}