import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get request body
    const { code, codeType } = await request.json();
    
    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Code is required' 
      }, { status: 400 });
    }
    
    if (!codeType || !['promo', 'vip'].includes(codeType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid code type. Must be "promo" or "vip"' 
      }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }
    
    // First check if code is valid
    const { data: codeData, error: codeError } = await supabase
      .from('codes')
      .select('*')
      .eq('code', code)
      .eq('code_type', codeType)
      .single();
    
    if (codeError || !codeData) {
      console.error('[AUTH] Invalid code:', code, codeError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid code. Please check and try again.' 
      }, { status: 400 });
    }
    
    // Check if code is already used
    const { data: existingCode, error: existingError } = await supabase
      .from('user_codes')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('code', code)
      .single();
    
    if (existingCode) {
      return NextResponse.json({ 
        success: false, 
        error: 'This code has already been applied to your account' 
      }, { status: 400 });
    }
    
    // Apply the code
    const { error: applyError } = await supabase
      .from('user_codes')
      .insert({
        user_id: session.user.id,
        code: code,
        code_type: codeType,
        applied_at: new Date().toISOString()
      });
    
    if (applyError) {
      console.error('[AUTH] Error applying code:', applyError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to apply code. Please try again later.' 
      }, { status: 500 });
    }
    
    // Log the event
    await supabase
      .from('user_events')
      .insert({
        user_id: session.user.id,
        event_type: `${codeType}_code_applied`,
        details: { code }
      });
    
    return NextResponse.json({ 
      success: true,
      message: `${codeType.toUpperCase()} code applied successfully!`
    });
    
  } catch (error) {
    console.error('[AUTH] Code application error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 