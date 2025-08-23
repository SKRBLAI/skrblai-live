// Minimal safe JSON API wrapper for Next.js API routes
import { NextRequest, NextResponse } from 'next/server';

export function withSafeJson(handler: Function) {
  return async function (...args: any[]) {
    try {
      return await handler(...args);
    } catch (error: any) {
      // Log error with stack for traceability
      console.error('[withSafeJson] API error:', error);
      return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  };
}
