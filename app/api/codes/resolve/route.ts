import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getServerSupabaseAdmin } from '@/lib/supabase';
import { getUserRoleInfo, getHighestRole, type UserRole } from '@/lib/founders/roles';
import { track } from '@/lib/analytics/track';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ResolveResult = {
  ok: boolean;
  kind?: 'founder' | 'heir' | 'vip' | 'promo' | 'stripe_coupon' | 'unknown';
  nextUrl?: string;
  message?: string;
};

async function tryFounderRedeem(code: string, userId: string): Promise<ResolveResult | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/founders/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.ok) return null;
    const role = (json.role as 'founder' | 'heir') || 'founder';
    return {
      ok: true,
      kind: role,
      nextUrl: role === 'heir' ? '/dashboard/heir' : '/dashboard/founder'
    };
  } catch {
    return null;
  }
}

async function tryVipPromo(code: string): Promise<ResolveResult | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/auth/apply-code/route`, {
      // Note: direct import is not trivial across route boundaries; proxy through internal handler path
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, codeType: 'vip' })
    });

    if (res.ok) {
      return { ok: true, kind: 'vip', nextUrl: '/dashboard/vip' };
    }

    const resPromo = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/auth/apply-code/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, codeType: 'promo' })
    });
    if (resPromo.ok) {
      return { ok: true, kind: 'promo', nextUrl: '/dashboard/vip' };
    }
    return null;
  } catch {
    return null;
  }
}

async function tryStripeCoupon(code: string): Promise<ResolveResult | null> {
  // We don't validate with Stripe here. Instead, set a short-lived cookie so checkout can apply a promotion code.
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!code || code.length < 3) return null;
  const response = NextResponse.json({ ok: true });
  response.cookies.set('skrbl_stripe_coupon', code, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 2
  });
  // But since we need to return JSON from POST, we will not return this early.
  return { ok: true, kind: 'stripe_coupon', nextUrl: '/pricing' };
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const { code, source } = await req.json().catch(() => ({ code: '', source: 'unknown' }));

  // Basic validation
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ ok: false, kind: 'unknown', message: 'Please enter a code.' } satisfies ResolveResult, { status: 400 });
  }

  // Track entry
  try { await track({ event_type: 'code.entered', metadata: { source } }); } catch {}

  // If user is logged in, check their highest role and never downgrade
  let highestRole: UserRole | null = null;
  if (session?.user?.id) {
    const info = await getUserRoleInfo(session.user.id);
    highestRole = info?.highestRole || null;
  }

  // 1) Founders first
  if (session?.user?.id) {
    const founder = await tryFounderRedeem(code, session.user.id);
    if (founder?.ok) {
      try { await track({ event_type: 'code.resolved', metadata: { kind: founder.kind } }); } catch {}
      // Respect precedence: founder/heir outranks VIP
      return NextResponse.json(founder satisfies ResolveResult);
    }
  }

  // 2) VIP/Promo
  if (session?.user?.id) {
    const vip = await tryVipPromo(code);
    if (vip?.ok) {
      // If user already has higher role, keep it and route accordingly
      if (highestRole && getHighestRole([highestRole, 'vip']) !== 'vip') {
        const nextUrl = highestRole === 'heir' ? '/dashboard/heir' : highestRole === 'founder' ? '/dashboard/founder' : '/dashboard';
        return NextResponse.json({ ok: true, kind: vip.kind, nextUrl } satisfies ResolveResult);
      }
      try { await track({ event_type: 'code.resolved', metadata: { kind: vip.kind } }); } catch {}
      return NextResponse.json(vip satisfies ResolveResult);
    }
  }

  // 3) Stripe coupon (optional, cookie hint for checkout)
  const stripe = await tryStripeCoupon(code);
  if (stripe?.ok) {
    try { await track({ event_type: 'code.resolved', metadata: { kind: 'stripe_coupon' } }); } catch {}
    return NextResponse.json(stripe satisfies ResolveResult);
  }

  // 4) Unknown
  try { await track({ event_type: 'code.failed', metadata: { reason: 'unknown' } }); } catch {}
  return NextResponse.json({ ok: false, kind: 'unknown', message: "We couldn’t verify this code." } satisfies ResolveResult, { status: 404 });
}

