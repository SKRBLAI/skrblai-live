import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Waitlist API Route
 * Accepts email submissions and stores them in Supabase
 */

interface WaitlistRequest {
  email: string;
  name?: string;
  intent?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Service configuration error. Please contact support.' 
        },
        { status: 500 }
      );
    }

    // 2. Parse request body
    let body: WaitlistRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, name, intent } = body;

    // 3. Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // 4. Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 5. Insert into waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        intent: intent?.trim() || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Check for duplicate email (unique constraint violation)
      if (error.code === '23505') {
        return NextResponse.json(
          { ok: false, error: 'Email already registered on waitlist' },
          { status: 409 }
        );
      }

      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to add to waitlist' },
        { status: 500 }
      );
    }

    // 6. Success response
    return NextResponse.json({ 
      ok: true, 
      message: 'Successfully added to waitlist',
      id: data.id 
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if email exists on waitlist (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { ok: false, error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabase
      .from('waitlist')
      .select('email, created_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json({ ok: true, exists: false });
      }

      console.error('Supabase query error:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to check waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      exists: true,
      created_at: data.created_at
    });

  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
