# SKRBL AI 2.0 - QUICK START GUIDE

> **Get started with your 2.0 upgrade in 30 minutes**

This guide gets you from "I have a plan" to "I've shipped Week 1 code" as fast as possible.

---

## 🚀 DAY 1: PRE-FLIGHT (30 minutes)

### Step 1: Backup Everything (5 minutes)

```bash
# Create feature branch
git checkout -b feature/skrbl-ai-2.0

# Tag current state
git tag v1.0-pre-2.0
git push origin v1.0-pre-2.0

# Document current env vars
cp .env.local .env.backup
```

### Step 2: Verify Systems (10 minutes)

```bash
# Check build is clean
npm run preflight

# Should see:
# ✅ PREFLIGHT PASSED: All checks successful
```

If it fails, fix issues before continuing.

### Step 3: Create 2.0 Environment File (15 minutes)

Create `.env.2.0` with these variables:

```bash
# === CORE 4 FLAGS ===
FF_BOOST=1
FF_CLERK=1
FF_SITE_VERSION=legacy  # Start with legacy, flip to 'new' later
FF_N8N_NOOP=1

# === SUPABASE BOOST ===
NEXT_PUBLIC_SUPABASE_URL_BOOST=https://your-boost-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST=eyJ...
SUPABASE_SERVICE_ROLE_KEY_BOOST=eyJ...

# === CLERK ===
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# === STRIPE (use test mode) ===
STRIPE_SECRET_KEY=sk_test_...

# === PRICING MAP ===
NEXT_PUBLIC_PRICE_MAP_JSON='{"plans":{"rookie":{"monthly":"price_test_123"},"pro":{"monthly":"price_test_456"},"all_star":{"monthly":"price_test_789"}},"ntnt":{"jr_pack":"price_test_012","mstry_pack":"price_test_345"},"studio":{"avatar_basic":"price_test_678"}}'
```

**Action Items:**
- [ ] Get Boost Supabase project URL + keys
- [ ] Create Clerk test application
- [ ] Create Stripe test products (get price IDs)
- [ ] Update NEXT_PUBLIC_PRICE_MAP_JSON with your test price IDs

---

## 📅 WEEK 1: AUTH CONSOLIDATION (Days 2-5)

### Day 2: Clerk Integration (4 hours)

**Goal:** Make Clerk your primary auth system.

#### Task 1: Update Feature Flags (15 min)

```typescript
// lib/config/featureFlags.ts

export const FEATURE_FLAGS = {
  // Add these:
  FF_BOOST: readBooleanFlag('FF_BOOST', false),
  FF_CLERK: readBooleanFlag('FF_CLERK', false),
  FF_SITE_VERSION: process.env.FF_SITE_VERSION || 'legacy',
  FF_N8N_NOOP: readBooleanFlag('FF_N8N_NOOP', true),
  
  // Keep existing flags
  // ...
} as const;
```

#### Task 2: Enhance ConditionalClerkProvider (30 min)

```typescript
// components/providers/ConditionalClerkProvider.tsx

'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export function ConditionalClerkProvider({ children }: { children: ReactNode }) {
  // Read from environment
  const clerkEnabled = process.env.NEXT_PUBLIC_FF_CLERK === '1' || 
                       process.env.FF_CLERK === '1';

  if (!clerkEnabled) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#2dd4bf',
          colorBackground: '#0b1220',
          colorText: '#ffffff',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
```

#### Task 3: Create requireUser Helper (1 hour)

```typescript
// lib/auth/requireUserClerk.ts

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function requireUserClerk() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/auth2/sign-in');
  }
  
  return user;
}

// Create or update profile in Boost Supabase
export async function ensureUserProfile(clerkUser: User) {
  const supabase = getServerSupabaseAdmin('boost');
  if (!supabase) throw new Error('Boost Supabase not configured');
  
  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUser.id)
    .single();
  
  if (existing) return existing;
  
  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      clerk_user_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      avatar_url: clerkUser.imageUrl,
    })
    .select()
    .single();
  
  if (error) throw error;
  return newProfile;
}
```

#### Task 4: Update Middleware (1.5 hours)

```typescript
// middleware.ts

import { authMiddleware } from '@clerk/nextjs';
import { NextResponse, NextRequest } from 'next/server';

const APEX = 'skrblai.io';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/legacy',
    '/new',
    '/about',
    '/contact',
    '/pricing',
    '/agents',
    '/agents/(.*)',
    '/sports',
    '/ntnt',
    '/studio',
    '/safe',
    '/api/health(.*)',
  ],
  afterAuth(auth, req) {
    // 1. Canonicalize host
    const host = req.headers.get('host') || '';
    if (host.startsWith('www.')) {
      const url = req.nextUrl.clone();
      url.hostname = APEX;
      url.port = '';
      return NextResponse.redirect(url, 308);
    }
    
    // 2. Site version routing
    if (req.nextUrl.pathname === '/') {
      const siteVersion = process.env.FF_SITE_VERSION || 'legacy';
      const targetPath = siteVersion === 'new' ? '/new' : '/legacy';
      return NextResponse.redirect(new URL(targetPath, req.url));
    }
    
    // 3. Protected routes (auth required)
    const isProtectedRoute = 
      req.nextUrl.pathname.startsWith('/udash') ||
      req.nextUrl.pathname.startsWith('/dashboard');
    
    if (isProtectedRoute && !auth.userId) {
      const signInUrl = new URL('/auth2/sign-in', req.url);
      signInUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### Task 5: Test Auth Flow (1 hour)

```bash
# Start dev server with 2.0 env
cp .env.2.0 .env.local
npm run dev

# Test:
# 1. Visit http://localhost:3000/auth2/sign-up
# 2. Create test account
# 3. Verify redirect to /
# 4. Check Boost Supabase for new profile row
# 5. Try accessing /udash (should work)
# 6. Sign out, try /udash again (should redirect to sign-in)
```

**Day 2 Checklist:**
- [ ] Feature flags updated
- [ ] Clerk provider configured
- [ ] requireUserClerk helper created
- [ ] Middleware updated
- [ ] Auth flow tested and working

### Day 3: Boost Supabase Schema (3 hours)

**Goal:** Create all tables needed for 2.0.

#### Task 1: Create Migration Files (1 hour)

```bash
mkdir -p migrations
```

**migrations/001_create_profiles.sql:**

```sql
-- Profiles table (enhanced)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'ROOKIE',
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = clerk_user_id);
```

**migrations/002_create_ntnt_tables.sql:**

```sql
-- NTNT scores table
CREATE TABLE IF NOT EXISTS ntnt_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('JR_NTNT', 'NTNT', 'NTNTNL')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  assessment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ntnt_scores_user_id ON ntnt_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ntnt_scores_created_at ON ntnt_scores(created_at DESC);

-- Video analyses table
CREATE TABLE IF NOT EXISTS video_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  video_url TEXT,
  sport TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_video_analyses_user_id ON video_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_status ON video_analyses(status);

-- RLS policies
ALTER TABLE ntnt_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own NTNT scores"
  ON ntnt_scores FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can view own video analyses"
  ON video_analyses FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text));
```

**migrations/003_create_studio_tables.sql:**

```sql
-- Avatars table
CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  avatar_config JSONB,
  air_card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);

-- AIR cards table
CREATE TABLE IF NOT EXISTS air_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE,
  template TEXT,
  overlay_data JSONB,
  card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_air_cards_avatar_id ON air_cards(avatar_id);

-- RLS policies
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own avatars"
  ON avatars FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can view own AIR cards"
  ON air_cards FOR SELECT
  USING (avatar_id IN (SELECT id FROM avatars WHERE user_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text)));
```

**migrations/004_create_usage_logs.sql:**

```sql
-- Usage logs table (unified tracking)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  vertical TEXT CHECK (vertical IN ('biz', 'ntnt', 'studio')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_vertical ON usage_logs(vertical);

-- RLS policy
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs"
  ON usage_logs FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text));
```

#### Task 2: Run Migrations (30 min)

```bash
# Option 1: Using Supabase CLI (recommended)
# Install: npm install -g supabase
supabase db push

# Option 2: Manual via SQL Editor
# Go to Supabase dashboard → SQL Editor
# Copy/paste each migration file
# Run one by one
```

#### Task 3: Verify Tables (30 min)

```bash
# Test profile creation
# 1. Sign up via /auth2/sign-up
# 2. Check Boost Supabase → profiles table
# 3. Verify clerk_user_id matches Clerk user ID

# Test RLS policies
# 1. Try querying profiles table with anon key (should fail)
# 2. Query with authenticated user (should work)
```

#### Task 4: Create Storage Buckets (1 hour)

```bash
# In Supabase dashboard → Storage
# Create buckets:
# 1. video-analyses (for NTNT video uploads)
# 2. avatars (for Studio avatar images)
# 3. air-cards (for generated AIR cards)

# Set up RLS policies for each bucket
```

**Day 3 Checklist:**
- [ ] All 4 migration files created
- [ ] Migrations run successfully
- [ ] Tables visible in Supabase dashboard
- [ ] RLS policies tested
- [ ] Storage buckets created

### Day 4: Price Map Migration (3 hours)

**Goal:** Replace all hardcoded price IDs with price map lookups.

#### Task 1: Create Price Map Helper (30 min)

```typescript
// lib/pricing/priceMap.ts

export function getPriceId(path: string): string | null {
  const priceMapJson = process.env.NEXT_PUBLIC_PRICE_MAP_JSON;
  if (!priceMapJson) {
    console.error('NEXT_PUBLIC_PRICE_MAP_JSON not set');
    return null;
  }
  
  try {
    const priceMap = JSON.parse(priceMapJson);
    const parts = path.split('.');
    let current: any = priceMap;
    
    for (const part of parts) {
      if (!current[part]) {
        console.warn(`Price map path not found: ${path}`);
        return null;
      }
      current = current[part];
    }
    
    if (typeof current !== 'string') {
      console.warn(`Price map path is not a price ID: ${path}`);
      return null;
    }
    
    return current;
  } catch (error) {
    console.error('Failed to parse NEXT_PUBLIC_PRICE_MAP_JSON:', error);
    return null;
  }
}

// Usage examples:
// getPriceId('plans.rookie.monthly') → 'price_test_123'
// getPriceId('ntnt.jr_pack') → 'price_test_012'
// getPriceId('studio.avatar_basic') → 'price_test_678'
```

#### Task 2: Update Pricing Components (1.5 hours)

```typescript
// components/pricing/BuyButton.tsx

'use client';

import { getPriceId } from '@/lib/pricing/priceMap';

interface BuyButtonProps {
  pricePath: string; // e.g., 'plans.rookie.monthly'
  label?: string;
}

export default function BuyButton({ pricePath, label = 'Buy Now' }: BuyButtonProps) {
  const handleClick = async () => {
    const priceId = getPriceId(pricePath);
    
    if (!priceId) {
      alert('Price not found. Please contact support.');
      return;
    }
    
    // Call checkout API
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        mode: pricePath.includes('plans') ? 'subscription' : 'payment',
        successPath: '/checkout/success',
        cancelPath: '/pricing',
      }),
    });
    
    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  };
  
  return (
    <button onClick={handleClick} className="buy-button">
      {label}
    </button>
  );
}
```

#### Task 3: Update Checkout API (1 hour)

```typescript
// app/api/checkout/route.ts

import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { requireUserClerk } from '@/lib/auth/requireUserClerk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserClerk();
    const { priceId, mode, successPath, cancelPath } = await request.json();
    
    if (!priceId) {
      return Response.json({ error: 'Price ID required' }, { status: 400 });
    }
    
    const session = await stripe.checkout.sessions.create({
      mode: mode || 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}${successPath || '/checkout/success'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}${cancelPath || '/pricing'}`,
      customer_email: user.emailAddresses[0]?.emailAddress,
      metadata: {
        clerk_user_id: user.id,
      },
    });
    
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

**Day 4 Checklist:**
- [ ] getPriceId helper created
- [ ] BuyButton component updated
- [ ] Checkout API uses price map
- [ ] Test checkout flow works

### Day 5: Testing & Documentation (2 hours)

**Goal:** Verify Week 1 deliverables and document progress.

#### Task 1: E2E Test (1 hour)

Test these flows:

1. **Sign Up Flow**
   ```bash
   # Visit /auth2/sign-up
   # Create account
   # Verify redirect to /
   # Check Boost Supabase for profile row
   ```

2. **Sign In Flow**
   ```bash
   # Visit /auth2/sign-in
   # Sign in with test account
   # Verify redirect to /
   # Try /udash (should work)
   ```

3. **Checkout Flow**
   ```bash
   # Visit /pricing
   # Click "Buy Now" on any plan
   # Verify Stripe checkout opens
   # Use test card: 4242 4242 4242 4242
   # Verify redirect to success page
   ```

#### Task 2: Update Progress Doc (1 hour)

```markdown
# Week 1 Progress Report

## Completed ✅
- Clerk is primary auth (FF_CLERK=1)
- Boost Supabase stores all user data
- 4 core feature flags implemented
- Price map migration complete
- All E2E tests passing

## Blockers ❌
- None

## Next Week
- Create /legacy and /new route split
- Build Percy Intake v2 shell
- Begin Agent League 2.0 categorization

## Metrics
- Auth conversion: 100% (test accounts)
- Checkout success: 100% (test mode)
- Build time: 2m 30s
```

**Day 5 Checklist:**
- [ ] All E2E tests pass
- [ ] Progress documented
- [ ] Code committed to feature branch
- [ ] Ready for Week 2

---

## 📅 WEEK 2: ROUTING SPLIT (Days 6-10)

### Day 6: Create /legacy Route (2 hours)

```bash
# Copy current homepage to /legacy
mkdir -p app/legacy
cp app/page.tsx app/legacy/page.tsx

# Copy all homepage components
cp -r components/home components/legacy-home

# Update imports in app/legacy/page.tsx
# Replace '@/components/home' with '@/components/legacy-home'
```

Test: Visit `/legacy` - should look identical to current `/`

### Day 7: Create /new Shell (3 hours)

```bash
mkdir -p app/new
```

**app/new/page.tsx:**

```typescript
'use client';

export default function NewHomePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">SKRBL AI 2.0</h1>
        <p className="text-xl mb-8">Welcome to the future of SKRBL AI</p>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-2xl mb-4">Percy Intake v2</h2>
          <p className="mb-4">What are you trying to build?</p>
          
          <input 
            type="text" 
            placeholder="e.g., I need help with my social media strategy"
            className="w-full p-3 rounded bg-white/10 border border-white/20 mb-4"
          />
          
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded">
            Scan & Analyze
          </button>
        </div>
        
        <div className="mt-8 grid grid-cols-3 gap-4">
          <a href="/ntnt" className="p-4 bg-white/5 border border-white/10 rounded hover:bg-white/10">
            <h3 className="font-bold">NTNT × MSTRY</h3>
            <p className="text-sm">Train like a champion</p>
          </a>
          <a href="/studio" className="p-4 bg-white/5 border border-white/10 rounded hover:bg-white/10">
            <h3 className="font-bold">Studio / AIR</h3>
            <p className="text-sm">Create your avatar</p>
          </a>
          <a href="/safe" className="p-4 bg-white/5 border border-white/10 rounded hover:bg-white/10">
            <h3 className="font-bold">S.A.F.E</h3>
            <p className="text-sm">Social impact</p>
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Day 8: Update Middleware for Routing (2 hours)

Already done in Day 2! Just verify it works:

```bash
# Test with FF_SITE_VERSION=legacy
# Visit / → should redirect to /legacy

# Test with FF_SITE_VERSION=new
# Visit / → should redirect to /new
```

### Day 9: Update Navigation (2 hours)

```typescript
// components/layout/Navigation.tsx

export default function Navigation() {
  const siteVersion = process.env.NEXT_PUBLIC_SITE_VERSION || 'legacy';
  
  if (siteVersion === 'new') {
    return (
      <nav>
        <a href="/new">Business</a>
        <a href="/ntnt">NTNT × MSTRY</a>
        <a href="/studio">Studio</a>
        <a href="/safe">S.A.F.E</a>
      </nav>
    );
  }
  
  // Legacy navigation
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/agents">Agents</a>
      <a href="/pricing">Pricing</a>
      <a href="/sports">Sports</a>
    </nav>
  );
}
```

### Day 10: Week 2 Testing (2 hours)

Test these scenarios:

1. **Legacy Mode** (FF_SITE_VERSION=legacy)
   - `/` → redirects to `/legacy`
   - `/legacy` loads correctly
   - All current features still work

2. **New Mode** (FF_SITE_VERSION=new)
   - `/` → redirects to `/new`
   - `/new` shows 2.0 shell
   - Links to `/ntnt`, `/studio`, `/safe` work (even if 404 for now)

3. **Pricing Still Works**
   - `/pricing` → loads with price map
   - Checkout buttons work
   - Stripe checkout opens

**Week 2 Complete! 🎉**

You now have:
- ✅ Clerk auth working
- ✅ Boost Supabase schema ready
- ✅ Price map migration done
- ✅ /legacy and /new route split working
- ✅ FF_SITE_VERSION controlling routing

**Ready for Week 3:** Building Percy Intake v2 and Agent League 2.0!

---

## 🎯 NEXT STEPS

After completing Week 1-2 (Foundation):

**Week 3-4: Biz 2.0 MVP**
- Build Percy Intake v2 (with URL scan)
- Create Agent League 2.0 (categorized cards)
- Update pricing pages for 2.0 products

**Week 5-6: NTNT × MSTRY**
- Build NTNT intake (25 questions)
- Create video upload flow
- Build results pages

**Week 7-8: Studio/AIR + S.A.F.E**
- Create Studio hub
- Build S.A.F.E page
- Add avatar builder placeholder

**Week 9-10: Integration & Polish**
- Connect all verticals
- Build unified dashboard
- UX polish pass

**Week 11-12: Launch Prep**
- E2E testing
- Documentation
- Soft launch
- Production cutover

---

## 📚 RESOURCES

**Full Plan:** See `SKRBL_AI_2_0_MASTER_PLAN.md` for complete details.

**Documentation:**
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)

**Support:**
- Review the Master Plan for architecture decisions
- Check `/lib/config/featureFlags.ts` for flag reference
- Check `/lib/pricing/priceMap.ts` for pricing logic

---

## ✅ WEEK 1-2 CHECKLIST

Before moving to Week 3, verify:

- [ ] Clerk auth works (sign up, sign in, sign out)
- [ ] Boost Supabase has all tables
- [ ] Price map is used everywhere (no hardcoded price IDs)
- [ ] /legacy route works (current homepage)
- [ ] /new route exists (2.0 shell)
- [ ] FF_SITE_VERSION controls routing
- [ ] All E2E tests pass
- [ ] Code committed to feature branch

**If all checked ✅ → You're ready for Week 3!**

If not, debug and fix issues before continuing. A solid foundation prevents problems later.

---

Good luck! 🚀
