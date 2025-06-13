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
  // Detect Supabase auth cookie (sb-<project>-auth-token) – key starts with 'sb' and ends with '-auth-token'
  const authCookie = request.cookies.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('auth-token'));
  
  // Protect both dashboard routes
  if (!authCookie && 
      (request.nextUrl.pathname.startsWith('/dashboard') || 
       request.nextUrl.pathname.startsWith('/user-dashboard'))) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}