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
    
    // 1. Validate the code from 'codes' table
    const { data: codeDetails, error: codeValidationError } = await supabase
      .from('codes')
      .select('access_level_granted, benefits, is_active, expires_at') // Select necessary fields from 'codes' table
      .eq('code', code)
      .eq('code_type', codeType) // Ensure code_type also matches
      .single(); // Expect a single code
    
    if (codeValidationError || !codeDetails) {
      console.error(`[AUTH] Apply Code: Invalid code '${code}' or DB error:`, codeValidationError?.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid code. Please check and try again.' 
      }, { status: 400 });
    }

    // Check if code is active
    if (!codeDetails.is_active) {
      console.warn(`[AUTH] Apply Code: Code '${code}' is not active.`);
      return NextResponse.json({ success: false, error: 'This code is no longer active.' }, { status: 400 });
    }

    // Check if code has expired
    if (codeDetails.expires_at && new Date(codeDetails.expires_at) < new Date()) {
      console.warn(`[AUTH] Apply Code: Code '${code}' has expired.`);
      return NextResponse.json({ success: false, error: 'This code has expired.' }, { status: 400 });
    }
    
    // 2. Check if code is already used by this user in 'user_codes'
    const { data: existingUserCode, error: existingUserCodeError } = await supabase
      .from('user_codes')
      .select('code') // Only need to check for existence
      .eq('user_id', session.user.id)
      .eq('code', code)
      .maybeSingle(); // Use maybeSingle to not error if no record found
      
    // PGRST116: "Searched for a single row, but found no rows" - this is OK, means code not used by user.
    if (existingUserCodeError && existingUserCodeError.code !== 'PGRST116') { 
        console.error(`[AUTH] Apply Code: Error checking existing user code for user ${session.user.id}, code '${code}':`, existingUserCodeError.message);
        return NextResponse.json({ success: false, error: 'Error validating code. Please try again.' }, { status: 500 });
    }

    if (existingUserCode) {
      console.warn(`[AUTH] Apply Code: Code '${code}' already applied by user ${session.user.id}.`);
      return NextResponse.json({ 
        success: false, 
        error: 'This code has already been applied to your account.' 
      }, { status: 400 });
    }
    
    // 3. Apply the code by inserting into 'user_codes'
    const { error: applyUserCodeError } = await supabase
      .from('user_codes')
      .insert({
        user_id: session.user.id,
        code: code,
        code_type: codeType, 
        applied_at: new Date().toISOString(),
      });
    
    if (applyUserCodeError) {
      console.error(`[AUTH] Apply Code: Error applying code to user_codes for user ${session.user.id}, code '${code}':`, applyUserCodeError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to record code usage. Please try again later.' 
      }, { status: 500 });
    }

    // 4. Update 'user_dashboard_access' with new access level and benefits
    // The trigger has already created a record, so we UPDATE it.
    const newAccessLevel = codeDetails.access_level_granted;
    const newBenefits = codeDetails.benefits;
    const newIsVip = typeof newAccessLevel === 'string' && newAccessLevel.toLowerCase().includes('vip');

    // Fetch current metadata so we can merge with new values in JS
    const { data: currentAccess, error: fetchAccessError } = await supabase
      .from('user_dashboard_access')
      .select('metadata')
      .eq('user_id', session.user.id)
      .single();

    if (fetchAccessError) {
      console.error(`[AUTH] Apply Code: Error fetching current metadata for user ${session.user.id}:`, fetchAccessError.message);
      // Proceed with empty metadata if fetch fails – metadata updates are non-critical.
    }

    const currentMetadata = (currentAccess?.metadata as Record<string, any>) ?? {};

    const mergedMetadata = {
      ...currentMetadata,
      last_applied_code: code,
      last_applied_code_type: codeType,
      last_code_applied_at: new Date().toISOString(),
      updated_by_api_apply_code: true,
    };

    const { error: updateAccessError } = await supabase
      .from('user_dashboard_access')
      .update({
        access_level: newAccessLevel,
        benefits: newBenefits,
        is_vip: newIsVip,
        updated_at: new Date().toISOString(),
        metadata: mergedMetadata,
      })
      .eq('user_id', session.user.id);

    if (updateAccessError) {
      console.error(`[AUTH] Apply Code: CRITICAL - Error updating user_dashboard_access for user ${session.user.id} with code '${code}':`, updateAccessError.message);
      // Consider rollback or specific logging for manual intervention
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update account access with code benefits. Please contact support.' 
      }, { status: 500 });
    }
    
    // 5. Log the event to 'user_events'
    await supabase
      .from('user_events')
      .insert({
        user_id: session.user.id,
        event_type: `${codeType}_code_applied_successfully`,
        details: { 
            code, 
            access_granted: newAccessLevel,
            benefits_applied: newBenefits 
        }
      });
    
    console.log(`[AUTH] Apply Code: Successfully applied code '${code}' for user ${session.user.id}. New access: ${newAccessLevel}`);
    return NextResponse.json({ 
      success: true,
      message: `${codeType.toUpperCase()} code applied successfully! Your access has been updated.`
    });
    
  } catch (error: any) {
    console.error('[AUTH] Apply Code: Unexpected error:', error.message, error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred while applying the code.' 
    }, { status: 500 });
  }
}