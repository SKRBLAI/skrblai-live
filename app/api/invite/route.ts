/*
BACKUP OF ORIGINAL /api/invite LOGIC (restore when ready):

import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

function generateInviteCode(length = 8) {
  return randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length).toUpperCase();
}

export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
// Auth: get user from Supabase JWT
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  // Fetch all invites where user is inviter or invitee
  const { data: invites, error } = await supabase
    .from('invites')
    .select('*')
    .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, invites });
}

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
// Auth: get user from Supabase JWT
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  // Check if user already has a pending invite code
  const { data: existing, error: existingError } = await supabase
    .from('invites')
    .select('*')
    .eq('inviter_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ success: true, code: existing.code, invite: existing });
  }
  // Generate a new unique code
  let code;
  let tries = 0;
  while (tries < 5) {
    code = generateInviteCode(8);
    const { data: codeCheck } = await supabase.from('invites').select('id').eq('code', code).maybeSingle();
    if (!codeCheck) break;
    tries++;
  }
  if (!code) {
    return NextResponse.json({ success: false, error: 'Failed to generate unique code' }, { status: 500 });
  }
  // Insert invite
  const { data: invite, error } = await supabase
    .from('invites')
    .insert({ code, inviter_id: user.id, status: 'pending', bonus_granted: false })
    .select()
    .maybeSingle();
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, code, invite });
}
*/

// Placeholder handler for all HTTP methods
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
return NextResponse.json({ message: 'Invite API coming soon.' });
}

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
return NextResponse.json({ message: 'Invite API coming soon.' });
}

export async function PUT(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
return NextResponse.json({ message: 'Invite API coming soon.' });
}

export async function DELETE(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
return NextResponse.json({ message: 'Invite API coming soon.' });
}

export async function PATCH(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
return NextResponse.json({ message: 'Invite API coming soon.' });
}