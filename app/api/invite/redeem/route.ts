import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Auth: get user from Supabase JWT
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { code } = await req.json();
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing invite code' }, { status: 400 });
  }
  // Find invite by code
  const { data: invite, error } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code)
    .maybeSingle();
  if (error || !invite) {
    return NextResponse.json({ success: false, error: 'Invalid invite code' }, { status: 404 });
  }
  if (invite.status !== 'pending') {
    return NextResponse.json({ success: false, error: 'Invite code already redeemed or expired' }, { status: 400 });
  }
  if (invite.inviter_id === user.id) {
    return NextResponse.json({ success: false, error: 'You cannot redeem your own invite code' }, { status: 400 });
  }
  // Check if user has already redeemed an invite
  const { data: alreadyRedeemed } = await supabase
    .from('invites')
    .select('id')
    .eq('invitee_id', user.id)
    .maybeSingle();
  if (alreadyRedeemed) {
    return NextResponse.json({ success: false, error: 'You have already redeemed an invite code' }, { status: 400 });
  }
  // Mark invite as redeemed, link invitee, set bonus_granted, set redeemed_at
  const { data: updated, error: updateError } = await supabase
    .from('invites')
    .update({
      invitee_id: user.id,
      status: 'redeemed',
      bonus_granted: true,
      redeemed_at: new Date().toISOString(),
    })
    .eq('id', invite.id)
    .select()
    .maybeSingle();
  if (updateError || !updated) {
    return NextResponse.json({ success: false, error: updateError?.message || 'Failed to redeem invite' }, { status: 500 });
  }
  // TODO: Grant bonus to both inviter and invitee (e.g., update user_roles, add trial days, etc.)
  // For now, just return success and inviter info
  const { data: inviter } = await supabase
    .from('auth.users')
    .select('id, email')
    .eq('id', invite.inviter_id)
    .maybeSingle();
  return NextResponse.json({ success: true, inviter, bonusGranted: true, invite: updated });
} 