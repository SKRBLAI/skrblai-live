import { NextResponse } from 'next/server';

/**
 * Dummy endpoint for file uploads used only for progress tracking
 * This endpoint doesn't actually save files but just returns a success response
 * The actual file uploads are handled directly by Supabase Storage
 */
export async function POST() {
  // Simulate a short delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return NextResponse.json({ success: true }, { status: 200 });
}

export const dynamic = 'force-dynamic'; 