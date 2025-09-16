// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
const APEX = "skrblai.io";
export const config = {
  matcher: [
    "/((?!_next|images|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api/stripe/webhooks|api/health).*)",
  ],
};

export function middleware(request: NextRequest) {
  // 1) Canonicalize host: www → apex
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const currentUrl = request.nextUrl.clone();
    currentUrl.hostname = APEX; // strip www
    currentUrl.port = "";       // avoid :8080 etc.
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

  // 3) Continue
  return NextResponse.next();
}
