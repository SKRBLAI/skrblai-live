# 🗑️ SKRBL AI Deprecation & Cleanup Checklist

**Purpose:** Track legacy features, deleted files, and cleanup actions  
**Status:** Active - Update as migrations complete  
**Last Updated:** 2025-10-31

---

## ⚠️ CRITICAL ACTIONS REQUIRED

### 1. Restore Deleted Critical Files

- [ ] **URGENT: Restore `.env.example`** (deleted in commit 1096ee3b)
  - **Why:** Critical for developer onboarding
  - **Action:** Create comprehensive `.env.example` with all required vars
  - **Owner:** DevOps Lead
  - **Timeline:** 1 day

- [ ] **Fix Git Repository Corruption**
  - **Issue:** Promisor remote errors in git log
  - **Action:** Run `git fetch --refetch origin`
  - **Owner:** DevOps Lead
  - **Timeline:** 1 hour

---

## 🔴 HIGH PRIORITY DEPRECATIONS

### 2. Percy Performance Migration

**Status:** ⚠️ Legacy Active (2,827 lines causing performance issues)

- [ ] Set `NEXT_PUBLIC_USE_OPTIMIZED_PERCY=true` in staging
- [ ] A/B test optimized vs legacy (1 week)
- [ ] Monitor performance metrics:
  - [ ] Time to Interactive (TTI)
  - [ ] CPU usage
  - [ ] Memory consumption
  - [ ] useState hook count
- [ ] Deploy optimized to production
- [ ] **DELETE** `components/percy/PercyOnboardingRevolution.tsx` (legacy)
- [ ] **KEEP** `components/percy/PercyOnboardingRevolutionOptimized.tsx`
- [ ] Update Percy imports across 151 files
- [ ] Archive old component to `/archive`

**Expected Outcome:** Reduce Percy-related files from 151 → ~50

**Files to Delete After Migration:**
```
components/percy/PercyOnboardingRevolution.tsx (2,827 lines)
components/percy/PercyAnimations.tsx (if unused)
utils/percyHelpers.ts (consolidate into optimized version)
```

**Timeline:** 1-2 weeks  
**Owner:** Frontend Team

---

### 3. Auth System Consolidation

**Status:** 🟡 3 systems active (Clerk, Boost, Legacy)

#### Option A: Migrate to Supabase Boost
- [ ] Set `FF_USE_BOOST_FOR_AUTH=1` in staging
- [ ] Test all auth flows:
  - [ ] Sign-up
  - [ ] Sign-in
  - [ ] Password reset
  - [ ] OAuth (if applicable)
  - [ ] Session management
- [ ] Plan user migration (or dual-run temporarily)
- [ ] Deploy to production
- [ ] **DELETE** legacy Supabase auth code:
  - [ ] Remove legacy client from `lib/supabase/server.ts`
  - [ ] Delete `/(auth)/sign-in` routes
  - [ ] Delete `/(auth)/sign-up` routes
  - [ ] Remove legacy auth from `requireUser.ts`

#### Option B: Migrate to Clerk
- [ ] Complete Clerk implementation in `requireUser.ts`
- [ ] Set `NEXT_PUBLIC_FF_CLERK=1` in staging
- [ ] Test all auth flows
- [ ] Migrate users from Supabase
- [ ] Deploy to production
- [ ] **DELETE** Supabase auth code:
  - [ ] Remove Supabase clients
  - [ ] Delete all Supabase auth routes
  - [ ] Remove `ConditionalClerkProvider` wrapper logic

**Decision Required:** Choose Option A or B by [DATE]

**Files to Delete After Migration:**
```
# If migrating to Boost:
lib/supabase/client.ts (legacy parts)
app/(auth)/sign-in/page.tsx
app/(auth)/sign-up/page.tsx
app/auth/callback/page.tsx

# If migrating to Clerk:
lib/supabase/client.ts (all auth parts)
lib/supabase/server.ts (auth functions)
app/(auth)/sign-in/page.tsx
app/(auth)/sign-up/page.tsx
app/auth2/sign-in/page.tsx
app/auth2/sign-up/page.tsx
```

**Timeline:** 2-3 weeks  
**Owner:** Backend Team + Product

---

### 4. n8n Automation Re-enablement

**Status:** 🔇 NOOP Mode (disabled, 57 integration points)

- [ ] Verify n8n Cloud instance stability
- [ ] Review all 57 n8n integration points
- [ ] Set `FF_N8N_NOOP=false` in staging
- [ ] Test critical workflows:
  - [ ] Publishing automation
  - [ ] Proposal sending
  - [ ] Content sync
  - [ ] Onboarding flows
  - [ ] Post-payment automation
  - [ ] Email sequences
- [ ] Monitor webhook success rates (target: >95%)
- [ ] Monitor error rates
- [ ] Deploy to production
- [ ] Update documentation

**Files to Update:**
```
lib/config/featureFlags.ts (set default to false)
All 57 files with n8n references (test each)
```

**Timeline:** 1-2 weeks  
**Owner:** Integration Team

---

## 🟡 MEDIUM PRIORITY DEPRECATIONS

### 5. Debug Routes in Production

**Status:** ⚠️ Exposed in production

**Routes to Gate or Delete:**

- [ ] `/debug-env` - Env var inspector
  - **Action:** Add `if (process.env.NODE_ENV === 'production') notFound()`
  - **File:** `app/debug-env/page.tsx`
  
- [ ] `/debug-auth` - Auth debugger
  - **Status:** Already has env check, verify it works
  - **File:** `app/debug-auth/page.tsx`
  
- [ ] `/test` - Test page
  - **Action:** DELETE or add auth protection
  - **File:** `app/test/page.tsx`
  
- [ ] `/test-percy-chat` - Percy chat test
  - **Action:** DELETE or add auth protection
  - **File:** `app/test-percy-chat/page.tsx`

**Decision for `/_probe/*` routes (7 routes):**
- [ ] Keep as-is (standard health checks) OR
- [ ] Add basic auth token OR
- [ ] Gate behind admin role

**Timeline:** 1 week  
**Owner:** Security Team

---

### 6. Bundle Pricing System

**Status:** 🔴 Disabled (redirects active)

**Current State:**
- Feature flag: `NEXT_PUBLIC_ENABLE_BUNDLES=0`
- Middleware redirects `/bundle/*` → `/sports#plans`

**Decision Required:**
- [ ] **Option A: Delete** if confirmed never re-enabling
- [ ] **Option B: Keep** if future feature

**Files to Delete if Option A:**
```
components/pricing/BundleCard.tsx (if exists)
lib/pricing/bundles.ts (if exists)
All bundle-related Stripe price IDs from env
Middleware bundle redirect logic (keep redirect for 6 months)
```

**Timeline:** 2 weeks (after confirmation)  
**Owner:** Product Team

---

### 7. Orbit 3D Visualization

**Status:** 🔴 Disabled

**Current State:**
- Feature flag: `NEXT_PUBLIC_ENABLE_ORBIT=0`
- Component: `AgentLeagueOrbit.tsx`
- Large bundle impact (3D libraries)

**Decision Required:**
- [ ] **Option A: Delete** to reduce bundle size
- [ ] **Option B: Keep** if future feature
- [ ] **Option C: Lazy load** to reduce initial bundle

**Timeline:** 1 week  
**Owner:** Frontend Team + Product

---

### 8. Stripe Price ID Refactor

**Status:** ⚠️ 50+ env vars (maintenance burden)

**Current State:**
- 50+ price IDs as individual env vars
- Complex resolver logic in `lib/stripe/priceResolver.ts`

**Proposed Solutions:**
- [ ] **Option A:** Load from Supabase table
  - Create `stripe_prices` table
  - Migrate env vars to database
  - Update resolver to query DB
  
- [ ] **Option B:** Use Stripe Product metadata
  - Add metadata to Stripe products
  - Query Stripe API at runtime
  - Cache results
  
- [ ] **Option C:** Hybrid approach
  - Keep 5-10 critical IDs in env
  - Load rest from Supabase

**Decision Required:** Choose option by [DATE]

**Timeline:** 2-3 weeks  
**Owner:** Backend Team

---

## 🟢 LOW PRIORITY DEPRECATIONS

### 9. Test & Script Files

**Files to Archive or Organize:**

- [ ] Move to `/archive` if migration complete:
  ```
  convert_all_imports.js
  convert_all_windows.js
  convert_imports.js
  convert_remaining.js
  final_convert.js
  ```

- [ ] Move to `/scripts/test`:
  ```
  test-stripe-resolver.js
  scripts/test-*.ts
  ```

- [ ] Delete if unused:
  ```
  commit.ps1
  commit2.ps1
  commit3.ps1
  ```

**Timeline:** 1 week  
**Owner:** DevOps

---

### 10. Legacy Clerk Placeholder Code

**Status:** 🔴 Prepared but not implemented

**If NOT migrating to Clerk:**

- [ ] Remove `ConditionalClerkProvider.tsx` (or simplify wrapper)
- [ ] Remove Clerk placeholder from `requireUser.ts`
- [ ] Remove `NEXT_PUBLIC_FF_CLERK` flag
- [ ] Remove Clerk npm packages
- [ ] Remove Clerk-specific routes/logic

**Timeline:** 1 week (after auth decision)  
**Owner:** Backend Team

---

## 📊 DEPRECATION METRICS

### Files Deleted (Last 30 Days)
- ✅ 3 test/debug API routes
- ✅ 1 legacy Percy component (archived)
- ✅ 1 activity modal component
- ✅ 25 archived migrations

### Files to Delete (Next 30 Days)
- 🎯 Target: Legacy Percy component (2,827 lines)
- 🎯 Target: Debug pages (4 routes)
- 🎯 Target: Auth system code (after migration)
- 🎯 Target: Bundle pricing code (pending decision)

### Bundle Size Goals
- **Current:** Unknown (measure with `@next/bundle-analyzer`)
- **Target After Percy:** -15% reduction
- **Target After Auth Migration:** -10% reduction
- **Target After Orbit Removal:** -8% reduction

---

## 🔄 MIGRATION PROGRESS TRACKER

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix git corruption
- [ ] Restore `.env.example`
- [ ] Gate debug routes

### Phase 2: Performance (Weeks 2-3)
- [ ] Migrate to optimized Percy
- [ ] Delete legacy Percy component
- [ ] Reduce Percy coupling

### Phase 3: Auth Consolidation (Weeks 4-6)
- [ ] Choose auth strategy
- [ ] Migrate users
- [ ] Delete unused auth code

### Phase 4: Integration Cleanup (Weeks 7-8)
- [ ] Re-enable n8n workflows
- [ ] Test all integrations
- [ ] Update documentation

### Phase 5: Final Cleanup (Weeks 9-10)
- [ ] Delete debug routes
- [ ] Archive test files
- [ ] Remove unused features
- [ ] Bundle size optimization

---

## 📋 APPROVAL & SIGN-OFF

### Critical Deprecations (Require Product Approval)
- [ ] Percy migration (Frontend Lead + Product)
- [ ] Auth system choice (Backend Lead + Product + Security)
- [ ] Bundle pricing deletion (Product + Finance)
- [ ] Orbit deletion (Product + UX)

### Technical Deprecations (Require Tech Lead Approval)
- [ ] n8n re-enablement (Backend Lead + DevOps)
- [ ] Stripe price refactor (Backend Lead)
- [ ] Debug route removal (Security + DevOps)

---

## 🚨 ROLLBACK PROCEDURES

### If Percy Migration Fails
1. Set `NEXT_PUBLIC_USE_OPTIMIZED_PERCY=false`
2. Restore legacy component from git history
3. Deploy rollback
4. Investigate issues

### If Auth Migration Fails
1. Revert feature flag to previous value
2. Restore deleted auth code from git
3. Communicate to users
4. Plan retry with fixes

### If n8n Re-enablement Fails
1. Set `FF_N8N_NOOP=true`
2. All integrations return success immediately
3. No user impact (graceful degradation)
4. Fix n8n issues offline

---

**Maintained By:** Engineering Team  
**Review Frequency:** Weekly during active cleanup, monthly after  
**Next Review:** [DATE]
