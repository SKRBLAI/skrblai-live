// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only run on real app routes (skip static assets & webhook)
export const config = {
  matcher: [
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api/stripe/webhooks).*)",
  ],
};

export function middleware(request: NextRequest) {
  // 1) Host canonicalization: strip "www."
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const currentUrl = request.nextUrl.clone();
    currentUrl.hostname = host.slice(4); // remove "www."
    return NextResponse.redirect(currentUrl, 308);
  }

  // 2) Bundle routes → /sports#plans
  const path = request.nextUrl.pathname.toLowerCase();
  if (
    path.startsWith("/bundle") ||
    path.startsWith("/bundles") ||
    path.includes("/bundle")
  ) {
    const currentUrl = request.nextUrl.clone();
    currentUrl.pathname = "/sports";
    currentUrl.hash = "#plans";
    return NextResponse.redirect(currentUrl, 301);
  }

  // Otherwise continue
  return NextResponse.next();
}
