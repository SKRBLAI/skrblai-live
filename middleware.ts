// middleware.ts
// Note: General auth protection (user logged in) is handled at page/layout level via server components.
// This middleware focuses on: 1) host canonicalization, 2) legacy redirects, 3) founder-role gates, 4) dual auth routing.
// See app/dashboard/*/page.tsx and lib/auth/roles.ts for user authentication + RBAC.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { siteVersion } from '@/lib/flags/siteVersion';
const APEX = "skrblai.io";

export const config = { matcher: ['/'] };

/**
 * Check if user has founder access via cookie
 * This is a lightweight check - full validation happens server-side
 */
function hasFounderAccess(request: NextRequest): boolean {
  const founderCookie = request.cookies.get('skrbl_founder');
  return founderCookie?.value === '1';
}

/**
 * Check if path requires founder access
 */
function requiresFounderAccess(pathname: string): boolean {
  const founderPaths = [
    '/dashboard/founder',
    '/dashboard/heir',
    '/dashboard/creator',
    '/agents/premium',
    '/agents/exclusive'
  ];
  
  return founderPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if path is a premium feature that founders get free access to
 */
function isPremiumPath(pathname: string): boolean {
  const premiumPaths = [
    '/dashboard',
    '/agents',
    '/pricing'
  ];
  
  return premiumPaths.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname.toLowerCase();

  // 0) Root split routing: rewrite only '/'
  if (path === '/') {
    const dest = request.nextUrl.clone();
    dest.pathname = siteVersion() === 'new' ? '/new' : '/legacy';
    return NextResponse.rewrite(dest);
  }
  
  // 1) Canonicalize host: www → apex
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const currentUrl = request.nextUrl.clone();
    currentUrl.hostname = APEX; // strip www
    currentUrl.port = "";       // avoid :8080 etc.
    return NextResponse.redirect(currentUrl, 308);
  }

  // 2) Bundle routes → /sports#plans (legacy bundles gated off)
  if (process.env.NEXT_PUBLIC_ENABLE_BUNDLES !== '1' && (
    path.startsWith("/bundle") ||
    path.startsWith("/bundles") ||
    path.includes("/bundle")
  )) {
    const currentUrl = request.nextUrl.clone();
    currentUrl.pathname = "/sports";
    currentUrl.hash = "#plans";
    return NextResponse.redirect(currentUrl, 301);
  }

  // 3) Dual auth routing based on feature flags
  const useClerk = process.env.NEXT_PUBLIC_FF_CLERK === '1';
  const useBoost = process.env.FF_USE_BOOST_FOR_AUTH === '1';
  
  // Check if this is a protected route that needs auth
  const isProtectedRoute = path.startsWith('/dashboard/') || 
                          path.startsWith('/admin/') || 
                          (useBoost && path.startsWith('/udash/'));
  
  if (isProtectedRoute) {
    // Determine which auth system to use
    if (useClerk) {
      // Clerk auth - redirect to auth2 routes
      if (path.startsWith('/udash/')) {
        // /udash routes should use Clerk auth
        // This will be handled by Clerk middleware when implemented
        return NextResponse.next();
      } else {
        // Legacy routes redirect to auth2
        const currentUrl = request.nextUrl.clone();
        currentUrl.pathname = '/auth2/sign-in';
        currentUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(currentUrl, 302);
      }
    } else if (useBoost) {
      // Boost Supabase auth - redirect to auth2 routes
      if (path.startsWith('/udash/')) {
        // /udash routes should use Boost auth
        return NextResponse.next();
      } else {
        // Legacy routes redirect to auth2
        const currentUrl = request.nextUrl.clone();
        currentUrl.pathname = '/auth2/sign-in';
        currentUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(currentUrl, 302);
      }
    }
    // Legacy Supabase auth - continue with existing logic
  }

  // 4) Founder access gates (non-breaking)
  const response = NextResponse.next();
  
  // Check if this is a founder-specific route
  if (requiresFounderAccess(path)) {
    if (!hasFounderAccess(request)) {
      // Redirect to main dashboard if no founder access
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl, 302);
    }
  }
  
  // For premium paths, add founder access header for downstream components
  if (isPremiumPath(path)) {
    const hasAccess = hasFounderAccess(request);
    if (hasAccess) {
      response.headers.set('x-founder-access', '1');
      const founderRole = request.cookies.get('skrbl_founder_role');
      if (founderRole?.value) {
        response.headers.set('x-founder-role', founderRole.value);
      }
    }
  }

  return response;
}
