import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL_ALLOWLIST = (process.env.IRA_ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

const ENV_CATEGORIES: Record<string, string[]> = {
  FEATURE_FLAGS: ["NEXT_PUBLIC_HP_GUIDE_STAR"],
  SUPABASE_PUBLIC: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  SUPABASE_SERVER: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  AUTH: ["NEXTAUTH_URL", "NEXTAUTH_SECRET"],
  STRIPE: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  OPENAI: ["OPENAI_API_KEY"],
  N8N: ["N8N_BUSINESS_ONBOARDING_URL"],
  ANALYTICS: ["NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"],
  OPTIONAL: ["NEXT_PUBLIC_SITE_URL", "IRA_ALLOWED_EMAILS"],
};

function getEnvPresence() {
  const result: Record<string, Record<string, boolean>> = {};
  for (const [group, keys] of Object.entries(ENV_CATEGORIES)) {
    result[group] = {};
    for (const key of keys) {
      result[group][key] = Boolean(process.env[key]);
    }
  }
  // Add PRICE_* keys if present
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('PRICE_')) {
      if (!result.PRICING) result.PRICING = {};
      result.PRICING[key] = true;
    }
  });
  return result;
}

async function isAllowed(req: NextRequest): Promise<boolean> {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey && process.env.ADMIN_ENV_READ_KEY && adminKey === process.env.ADMIN_ENV_READ_KEY) {
    return true;
  }
  // If using NextAuth, check session user email (pseudo, replace with real session check)
  // const session = await getServerSession(authOptions); // Uncomment and implement if NextAuth is in use
  // if (session?.user?.email && ADMIN_EMAIL_ALLOWLIST.includes(session.user.email.toLowerCase())) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = getEnvPresence();
  return NextResponse.json(result);
}
