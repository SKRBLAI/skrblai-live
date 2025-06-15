import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/user-dashboard/:path*',
    '/api/:path*'
  ],
  runtime: 'experimental-edge' // Setting back based on build error
};

export function middleware(request: NextRequest) {
  // Get URL info
  const url = request.nextUrl.clone();
  const path = url.pathname;
  
  // Detect Supabase auth cookie (sb-<project>-auth-token) – key starts with 'sb' and ends with '-auth-token'
  const authCookie = request.cookies.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('auth-token'));
  
  // Debug logging for authentication issues
  console.log('[MIDDLEWARE] Path:', path, 'Auth Cookie:', authCookie ? 'Present' : 'Missing');
  
  // Protect dashboard routes
  if (!authCookie && 
      (path.startsWith('/dashboard') || 
       path.startsWith('/user-dashboard'))) {
    
    console.log('[MIDDLEWARE] No auth cookie found, redirecting to sign-in');
    
    // Create redirect URL with reason parameter
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('reason', 'session-expired');
    redirectUrl.searchParams.set('from', path);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // Handle API routes without auth
  if (!authCookie && path.startsWith('/api/') && 
      !path.startsWith('/api/auth/') && 
      !path.startsWith('/api/public/')) {
    
    console.log('[MIDDLEWARE] API request without auth cookie:', path);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication required',
        code: 'auth_required'
      }, 
      { status: 401 }
    );
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}