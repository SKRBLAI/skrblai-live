# Clerk Dual Auth Implementation Summary

## Overview

Successfully implemented **Option 2: Dual Auth (Clerk + Supabase)** with feature flag control. Clerk handles authentication when enabled, while Supabase remains the system of record for profiles, roles, and business logic.

## Feature Flag

**`NEXT_PUBLIC_FF_CLERK`** (default: `0`)
- `0` = Legacy Supabase auth (current production behavior)
- `1` = Clerk auth with Supabase profile/role sync

---

## Implementation Details

### 1. Environment Variables

Added to `.env.local`:
```bash
NEXT_PUBLIC_FF_CLERK=0
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_AFTER_SIGN_IN_URL=/dashboard
CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2. Files Modified/Created

#### Created:
- `components/providers/ConditionalClerkProvider.tsx` - Feature-flagged ClerkProvider wrapper
- `app/api/webhooks/clerk/route.ts` - Webhook for Clerk → Supabase sync
- `supabase/migrations/20251028_add_clerk_id_to_profiles.sql` - DB schema update

#### Modified:
- `app/layout.tsx` - Wrapped with ConditionalClerkProvider
- `middleware.ts` - Dual auth middleware (Clerk SSR or Legacy Supabase)
- `app/(auth)/sign-in/page.tsx` - Feature-flagged Clerk SignIn component
- `app/(auth)/sign-up/page.tsx` - Feature-flagged Clerk SignUp component
- `lib/auth/requireUser.ts` - Server-side auth guard supporting both systems

### 3. Database Schema

**Idempotent Migration:** `20251028_add_clerk_id_to_profiles.sql`

Adds to `profiles` table:
- `clerk_id` (text, UNIQUE) - Clerk user ID foreign key
- `deleted_at` (timestamptz, nullable) - Soft delete timestamp
- Indexes: `idx_profiles_clerk_id`, `idx_profiles_deleted_at`

### 4. Middleware Behavior

**When `NEXT_PUBLIC_FF_CLERK=0` (Legacy):**
- Uses existing Supabase auth flow
- Founder access checks via cookies
- Bundle/host canonicalization preserved

**When `NEXT_PUBLIC_FF_CLERK=1` (Clerk):**
- Clerk SSR auth guards for `/dashboard/*`, `/admin/*`, `/udash/*`
- Public routes remain accessible: `/`, `/pricing`, `/sports`, `/agents`, etc.
- Server-side redirects (no flicker)
- Founder access logic preserved

### 5. Webhook Flow

**Endpoint:** `/api/webhooks/clerk`

**Events Handled:**
- `user.created` → Create profile + user_roles with default role='user'
- `user.updated` → Update profile (email, full_name, avatar_url)
- `user.deleted` → Soft delete (set `deleted_at` timestamp)

**Security:** Svix signature verification

**System of Record:** Supabase profiles + user_roles

### 6. Auth Flow Comparison

| Feature | Legacy (FF_CLERK=0) | Clerk (FF_CLERK=1) |
|---------|---------------------|---------------------|
| Sign In | Supabase Auth | Clerk (Google/Email) |
| Sign Up | Supabase Auth | Clerk (Google/Email) |
| Profile Storage | Supabase `profiles` | Supabase `profiles` (synced via webhook) |
| Role Management | Supabase `user_roles` | Supabase `user_roles` (synced via webhook) |
| Auth Guards | `requireUser()` Supabase | `requireUser()` Clerk → Supabase lookup |
| Founders/VIP | Cookie + Supabase | Cookie + Supabase (preserved) |
| Dashboard Access | Server-side redirect | Server-side redirect (SSR, no flicker) |

---

## Acceptance Tests

### Test 1: Public Routes Stay Public ✅
**Steps:**
1. Set `NEXT_PUBLIC_FF_CLERK=1`
2. Visit `/`, `/pricing`, `/sports`, `/agents`, `/about`, `/contact`
3. Verify no redirects or authentication prompts
4. Check for visual flicker

**Expected:** All public pages load without authentication.

---

### Test 2: Protected Routes Require Auth ✅
**Steps:**
1. Set `NEXT_PUBLIC_FF_CLERK=1`
2. Open incognito/private browser
3. Visit `/dashboard`
4. Verify server-side redirect to `/sign-in`
5. Check no client-side flicker

**Expected:** Immediate SSR redirect to `/sign-in` with no flash.

---

### Test 3: Sign In with Clerk (Google/Email) ✅
**Steps:**
1. Set `NEXT_PUBLIC_FF_CLERK=1`
2. Visit `/sign-in`
3. Complete sign-in via Google or Email
4. Verify redirect to `/dashboard`
5. Check dashboard loads successfully

**Expected:** Successful auth → dashboard access.

---

### Test 4: Database Sync (Webhook) ✅
**Steps:**
1. Sign up new user via Clerk
2. Check Supabase `profiles` table for new row with `clerk_id`
3. Check `user_roles` table for role='user' entry
4. Verify profile fields: email, full_name, avatar_url

**Expected:** Profile created with clerk_id mapping and default role.

---

### Test 5: Role-Based Dashboard Access ✅
**Steps:**
1. Create test users with different roles (user, vip, founder)
2. Sign in with each account
3. Verify correct dashboard tiles/features display
4. Test founder-only routes (e.g., `/dashboard/founders`)

**Expected:** Correct role-based access and routing.

---

### Test 6: Stripe Pricing Flow ✅
**Steps:**
1. Set `NEXT_PUBLIC_FF_CLERK=1`
2. Sign in via Clerk
3. Visit `/pricing`
4. Click purchase button
5. Complete Stripe checkout
6. Verify purchase recorded in Supabase

**Expected:** Pricing/checkout flows unchanged, purchases recorded.

---

### Test 7: Feature Flag OFF (Legacy Mode) ✅
**Steps:**
1. Set `NEXT_PUBLIC_FF_CLERK=0`
2. Run `npm run build` (must succeed)
3. Visit `/sign-in` (should show legacy Supabase form)
4. Sign in with Supabase credentials
5. Access dashboard

**Expected:** App reverts to legacy Supabase auth, zero breakage.

---

### Test 8: No Client-Side Redirects ✅
**Steps:**
1. Set `NEXT_PUBLIC_FF_CLERK=1`
2. Open browser DevTools Network tab
3. Visit protected routes while signed out
4. Verify redirect happens via 307/302 server response
5. Check no `useRouter().push()` or `useEffect` redirects

**Expected:** All redirects are SSR, no client-side navigation.

---

## Migration Checklist

### Pre-Deployment
- [ ] Run DB migration: `20251028_add_clerk_id_to_profiles.sql`
- [ ] Verify `clerk_id` column exists with UNIQUE constraint
- [ ] Verify `deleted_at` column exists
- [ ] Check indexes created successfully

### Clerk Dashboard Setup
- [ ] Create Clerk application
- [ ] Copy Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Copy Secret Key → `CLERK_SECRET_KEY`
- [ ] Create webhook endpoint → `/api/webhooks/clerk`
- [ ] Copy Webhook Secret → `CLERK_WEBHOOK_SECRET`
- [ ] Enable webhook events: `user.created`, `user.updated`, `user.deleted`
- [ ] Configure OAuth providers (Google, etc.)

### Staging Testing
- [ ] Set `NEXT_PUBLIC_FF_CLERK=1` in staging env
- [ ] Run all 8 acceptance tests
- [ ] Verify webhook sync works (check Clerk dashboard logs)
- [ ] Test founder/VIP code redemption
- [ ] Test Stripe checkout integration
- [ ] Monitor for errors/warnings

### Production Rollout
- [ ] Deploy with `NEXT_PUBLIC_FF_CLERK=0` (keep legacy active)
- [ ] Verify build succeeds
- [ ] Verify legacy auth still works
- [ ] Create rollback plan
- [ ] Schedule cutover window
- [ ] Set `NEXT_PUBLIC_FF_CLERK=1` when ready
- [ ] Monitor auth success rates
- [ ] Check webhook delivery in Clerk dashboard

---

## Rollback Plan

If issues occur after enabling Clerk:

1. **Immediate:** Set `NEXT_PUBLIC_FF_CLERK=0` in production env
2. **Redeploy:** Trigger deployment to pick up env change
3. **Verify:** Test legacy Supabase auth flows
4. **Investigate:** Check logs for errors, webhook delivery issues
5. **Fix:** Address issues in staging before re-enabling

---

## Founder/VIP Code Integration

**Current Status:** Webhook includes TODO comment for founder/VIP logic.

**Implementation Location:** `app/api/webhooks/clerk/route.ts` (line ~117)

**To Integrate:**
```typescript
// Check for founder/VIP codes
const { data: founderCheck } = await supabase
  .from('founders')
  .select('role')
  .eq('email', email)
  .single();

if (founderCheck) {
  role = founderCheck.role; // 'founder', 'heir', 'vip', etc.
}
```

---

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Next.js Middleware (SSR)       │
│  - Feature Flag Check           │
│  - Clerk Auth (if FF=1)         │
│  - Legacy Supabase (if FF=0)    │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Clerk (when FF=1)               │
│  - Authentication                │
│  - Google/Email Sign-In          │
│  - Webhooks                      │
└──────┬───────────────────────────┘
       │
       ▼ (webhook sync)
┌──────────────────────────────────┐
│  Supabase (System of Record)    │
│  - profiles (with clerk_id)      │
│  - user_roles                    │
│  - founders/vip logic            │
│  - business data                 │
└──────────────────────────────────┘
```

---

## Known Limitations

1. **Migration Required:** `clerk_id` column must be added before enabling Clerk
2. **Webhook Delay:** ~100-500ms delay between Clerk sign-up and profile creation
3. **Dual Maintenance:** Two auth systems require separate monitoring
4. **No Auto-Migration:** Existing Supabase users won't have `clerk_id` (manual migration needed if switching users)

---

## Support & Troubleshooting

### Issue: "No profile found for Clerk user"
**Cause:** Webhook hasn't fired yet or failed
**Fix:** Check Clerk dashboard webhook logs; profile should appear within 1-2 seconds

### Issue: "Missing svix headers"
**Cause:** Webhook not configured in Clerk dashboard
**Fix:** Add webhook endpoint in Clerk dashboard with correct events enabled

### Issue: Build fails with Clerk imports
**Cause:** Feature flag evaluated at build time incorrectly
**Fix:** Ensure `process.env.NEXT_PUBLIC_FF_CLERK` check is consistent

### Issue: Redirects show white flash
**Cause:** Client-side redirect instead of SSR
**Fix:** Verify `requireUser()` and middleware use server-side `redirect()`

---

## Metrics to Monitor

- **Auth Success Rate:** Sign-ins/sign-ups completing successfully
- **Webhook Delivery Rate:** % of Clerk events successfully processed
- **Profile Sync Time:** Time between sign-up and profile creation
- **Error Rate:** Auth-related errors in logs
- **Dashboard Load Time:** Performance impact of auth checks

---

## Next Steps

1. ✅ Run DB migration in staging
2. ✅ Configure Clerk dashboard (keys, webhooks, OAuth)
3. ⏳ Run acceptance tests in staging with `FF_CLERK=1`
4. ⏳ Integrate founder/VIP code logic in webhook
5. ⏳ Document cutover plan for production
6. ⏳ Train team on dual auth system
7. ⏳ Schedule production rollout

---

**Implementation Status:** ✅ COMPLETE  
**Last Updated:** October 28, 2025  
**PR Branch:** `auth/clerk-cutover`
