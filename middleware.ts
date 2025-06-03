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
  // Check for auth cookie instead of firebase directly
  const authCookie = request.cookies.get('auth');
  
  // Protect both dashboard routes
  if (!authCookie && 
      (request.nextUrl.pathname.startsWith('/dashboard') || 
       request.nextUrl.pathname.startsWith('/user-dashboard'))) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}