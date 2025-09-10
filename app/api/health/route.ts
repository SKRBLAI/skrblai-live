import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(
      { 
        ok: true, 
        ts: new Date().toISOString(),
        service: 'SKRBL AI',
        version: process.env.npm_package_version || '1.0.0'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        ts: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';