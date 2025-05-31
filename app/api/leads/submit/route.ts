import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const leadData = await req.json();
    
    // Server-side lead submission with service key
    const { error } = await supabase
      .from('leads')
      .insert([leadData]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead submission failed:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
} 