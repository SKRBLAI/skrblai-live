import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST() {
  try {
    const client = admin();

    // Get current user from auth cookie via getUser() using the anon client if you have middleware,
    // or pass user info from client in body. Simple server-side check using service role:
    // NOTE: In many setups you read the JWT from auth cookies; if not present just no-op gracefully.

    // Example minimal: upsert based on the authenticated user returned by auth.getUser()
    // (If your setup reads cookies differently, keep your existing pattern.)
    const { data: { users }, error: usersErr } =
      await client.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (usersErr) { /* not fatal; continue */ }

    // Replace with your actual user resolution logic (e.g., pull from request cookies or headers)
    // For safety, no-op if we cannot resolve a user:
    const user = users?.[0];
    if (!user) return NextResponse.json({ ok: false, reason: 'no-user' });

    const { id, email } = user;

    const { error: upsertErr } = await client
      .from('profiles')
      .upsert({ user_id: id, email }, { onConflict: 'user_id' });

    if (upsertErr) {
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
