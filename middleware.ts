// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/:path*'],
};

export async function middleware(request: NextRequest) {
  // Declare once; avoid shadowing
  const currentUrl = request.nextUrl.clone();
  const path = currentUrl.pathname.toLowerCase();

  // 1) Remove dead "bundle" routes → /sports#plans
  if (
    path.startsWith('/bundle') ||
    path.startsWith('/bundles') ||
    path.includes('/bundle')
  ) {
    currentUrl.pathname = '/sports';
    currentUrl.hash = '#plans';
    return NextResponse.redirect(currentUrl);
  }

  // 2) Canonicalize legacy agent routes to /agents/[slug]
  const legacyAgent = path.match(/^\/(?:agentbackstory|services)\/([^/]+).*$/);
  const legacyBackstory = path.match(/^\/agents\/([^/]+)\/backstory\/?$/);

  if (legacyAgent) {
    const slug = legacyAgent[1];
    currentUrl.pathname = `/agents/${slug}`;
    currentUrl.search = '';
    return NextResponse.redirect(currentUrl, 308);
  }

  if (legacyBackstory) {
    const slug = legacyBackstory[1];
    currentUrl.pathname = `/agents/${slug}`;
    currentUrl.search = '';
    return NextResponse.redirect(currentUrl, 308);
  }

  // 3) Proceed
  return NextResponse.next();
}