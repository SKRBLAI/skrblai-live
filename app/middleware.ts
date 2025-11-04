import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { siteVersion } from '@/lib/flags/siteVersion';

export const config = {
  matcher: ['/'],
};

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next();
  }

  const version = siteVersion();
  const destination = request.nextUrl.clone();
  destination.pathname = version === 'new' ? '/new' : '/legacy';

  return NextResponse.rewrite(destination);
}
