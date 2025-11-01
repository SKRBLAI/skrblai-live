import { NextResponse } from 'next/server';
import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Check for variant parameter (boost or legacy)
    const url = new URL(request.url);
    const variant = url.searchParams.get('variant') as 'boost' | 'legacy' | null;
    
    // Get the authenticated user from cookies using anon client
    const anon = getServerSupabaseAnon(variant || 'legacy');
    if (!anon) {
      return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { data: { user }, error: userError } = await anon.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'no-user' }, { status: 401 });
    }

    // Use service role client to bypass RLS and create/update profile
    const admin = getServerSupabaseAdmin(variant || 'legacy');
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'Admin client not available' }, { status: 503 });
    }

    const email = user.email ?? null;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || null;

    // Upsert profile (using 'id' to match production schema)
    const { error: upsertProfile } = await admin
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email,
        display_name: displayName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    // Upsert user role (default to 'user' if not exists)
    const { error: upsertRole } = await admin
      .from('user_roles')
      .upsert({ 
        user_id: user.id, 
        role: 'user' 
      }, { onConflict: 'user_id' });

    if (upsertProfile || upsertRole) {
      return NextResponse.json({ 
        ok: false, 
        upsertProfile: upsertProfile?.message, 
        upsertRole: upsertRole?.message 
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user_id: user.id });
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: String(e?.message ?? e) 
    }, { status: 500 });
  }
}
