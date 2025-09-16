// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const APEX = "skrblai.io";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // Exclusions (matcher also excludes)
  if (
    path.startsWith("/_next") ||
    path.startsWith("/images") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path.startsWith("/api/stripe/webhooks") ||
    path.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  // Optional: bundle paths → sports plans
  if (path.startsWith("/bundle") || path.startsWith("/bundles")) {
    return NextResponse.redirect(new URL("/sports#plans", url), 308);
  }

  // Canonicalize www → apex
  const host = req.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const to = new URL(url);
    to.hostname = APEX;   // strip www
    to.port = "";         // avoid :8080 in public URLs
    return NextResponse.redirect(to, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|images/|favicon.ico|robots.txt|sitemap.xml|api/stripe/webhooks|api/health).*)",
  ],
};
