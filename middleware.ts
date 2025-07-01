import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
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

  // Add security headers with Next.js-compatible CSP
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Fix CSP to allow Next.js while maintaining security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com *.cloudflare.com *.stripe.com", 
    "style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com",
    "img-src 'self' data: blob: *.googleapis.com *.gstatic.com *.supabase.co *.cloudflare.com *.stripe.com",
    "font-src 'self' *.googleapis.com *.gstatic.com",
    "connect-src 'self' *.supabase.co *.stripe.com *.n8n.io",
    "frame-src 'self' *.stripe.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}