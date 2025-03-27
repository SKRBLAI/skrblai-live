import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/utils/firebase';

export function middleware(request: NextRequest) {
  const currentUser = auth.currentUser;
  if (!currentUser && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}