import { NextResponse } from 'next/server';

/**
 * Dummy API endpoint that simulates handling file uploads
 * but doesn't actually save any files (used only for progress tracking).
 * 
 * Actual file uploads are handled by Supabase Storage.
 */
export async function POST() {
  // Simulate upload processing delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return success response
  return NextResponse.json({
    success: true,
    message: 'File upload simulation successful',
  });
}

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic'; 