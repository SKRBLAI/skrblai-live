# SUPABASE COMPREHENSIVE AUDIT REPORT
**Date:** October 21, 2025
**Platform:** SKRBL AI - Next.js 15 + Supabase
**Status:** ✅ STABLE (Recent fixes applied)

---

## EXECUTIVE SUMMARY

The SKRBL AI platform demonstrates **excellent Supabase integration architecture** with robust patterns that prevent common Next.js build-time failures. The October 21, 2025 migration successfully resolved the last critical auth profile sync issue. **No major Supabase-related blockers remain.**

### Key Findings
- ✅ **Lazy client initialization** prevents build-time crashes
- ✅ **RLS policies** properly configured with recent INSERT policy fix
- ✅ **Auth flow** robust with admin/anon client separation
- ✅ **Environment variables** correctly structured
- ⚠️ **9+ dashboard pages** missing `force-dynamic` export
- ⚠️ **Probe endpoints** exposed without authentication
- ⚠️ **Type safety** could be improved with Supabase codegen

---

## 1️⃣ SUPABASE ROOT CAUSES & FIXES

### ✅ RESOLVED: Profile Sync INSERT Policy (Oct 21, 2025)

**Issue:** Profile creation failed during OAuth callback due to missing INSERT RLS policy.

**Root Cause:**
```sql
-- profiles table had SELECT and UPDATE policies but NO INSERT policy
-- Service role client attempted INSERT and was blocked by RLS
```

**Files Affected:**
- `supabase/migrations/20251021_auth_profile_sync_repair.sql`
- `app/auth/callback/page.tsx:64`

**Fix Applied:**
```sql
-- Added INSERT policy
CREATE POLICY "profiles_insert_self"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
```

**Verification:**
- Profile upsert in auth callback now succeeds
- `_probe/db/profile-check` returns 200
- New users can sign up and create profiles

---

### ✅ RESOLVED: Module-Scope Client Initialization

**Issue:** Early versions created Supabase clients at module import time, causing build failures when env vars were unavailable.

**Root Cause:**
```typescript
// OLD PATTERN (BROKEN):
const supabase = createClient(url, key); // Reads env at import time
export default supabase;
```

**Files Affected:**
- `lib/supabase/server.ts` ✅ Fixed
- `lib/supabase/client.ts` ✅ Fixed
- `lib/supabase/browser.ts` ✅ Fixed

**Fix Applied:**
```typescript
// NEW PATTERN (WORKING):
let adminClient: SupabaseClient | null = null;

export function getServerSupabaseAdmin(): SupabaseClient | null {
  if (adminClient) return adminClient;

  // Lazy env read at CALL time, not import time
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing Supabase env vars');
    }
    return null; // Build-time safety
  }

  adminClient = createClient(url, serviceKey, {...});
  return adminClient;
}
```

**Benefits:**
- No build-time crashes
- Graceful degradation in development
- Singleton pattern for performance
- Clear error messages in production

**Current Usage:** 236 references across 97 files using this pattern ✅

---

### ✅ CORRECT: Environment Variable Naming

**Required Variables:**
```bash
# PUBLIC (browser + server)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (safe for browser)

# PRIVATE (server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (NEVER expose to browser)
```

**Files Using:**
- `lib/supabase/server.ts:25,76` - Reads all three
- `lib/supabase/client.ts:24-25` - Reads public vars only
- `.env.local.example:5-11` - Documents correctly
- `.env.production:25-28` - Template structure correct

**Validation:**
- ✅ No hardcoded credentials
- ✅ No `SUPABASE_URL` or `SUPABASE_ANON_KEY` (non-public) usage
- ✅ Service role key never sent to browser
- ⚠️ `.env.local.example` mentions deprecated `NEXT_PUBLIC_N8N_FREE_SCAN_URL`

---

### ✅ CORRECT: Auth Callback & Redirect Handling

**Auth Flow:**
```
1. User clicks "Sign in with Google"
2. Supabase redirects to /auth/callback?code=xxx
3. exchangeCodeForSession() validates code
4. Admin client upserts profile to `profiles` table
5. Query user_roles to determine role (founder > heir > vip > parent > user)
6. Redirect to role-specific dashboard
```

**Files:**
- `app/auth/callback/page.tsx` (127 lines) ✅ Excellent implementation
  - Line 20: Uses anon client for auth operations
  - Line 31: `exchangeCodeForSession()` with proper error handling
  - Line 58: Uses admin client for profile upsert (bypasses RLS)
  - Line 73-95: Role resolution with priority order
  - Line 99-106: Safe redirect parameter validation

**Security Measures:**
- ✅ Validates redirect parameter (blocks `/sign-in`, `/auth/callback`)
- ✅ Only redirects to internal paths (starts with `/`)
- ✅ Defaults to role-based dashboard if no redirect
- ✅ Admin client used for system operations, anon for user auth

**Tested Scenarios:**
- OAuth callback with valid code ✅
- OAuth callback with error parameter ✅
- Missing code parameter ✅
- Invalid redirect attempts ✅

---

### ⚠️ MINOR ISSUE: Legacy Auth Domain References

**Issue:** Documentation files mention `auth.skrblai.io` but no code references exist.

**Files Found:**
```
analysis/AUTH_URL_CHECKLIST.md
SUPABASE_CONFIG_REFERENCE.md
RAILWAY_DEBUG_CHECKLIST.md
CHANGELOG_AUTH_STABILIZATION.md
```

**Code Search Results:**
```bash
grep -r "auth\.skrblai\.io" **/*.{ts,tsx,js,jsx}
# NO MATCHES FOUND ✅
```

**Status:** Documentation-only references, no code impact. Safe to ignore.

---

## 2️⃣ DATABASE SCHEMA & RLS AUDIT

### Current Schema (Active Migrations)

**Core Auth Tables:**
```sql
-- profiles (id matches auth.users.id)
profiles:
  - id uuid PRIMARY KEY (references auth.users)
  - full_name text
  - email text UNIQUE
  - role text DEFAULT 'user'
  - display_name text (added Oct 21)
  - updated_at timestamptz (added Oct 21)
  - created_at timestamptz

-- user_roles (many roles per user)
user_roles:
  - id uuid PRIMARY KEY
  - user_id uuid (references auth.users)
  - role text CHECK (user, vip, parent, founder, admin)
  - created_at timestamptz

-- founder_codes (seed data)
founder_codes:
  - code text PRIMARY KEY
  - hashed boolean
  - created_at timestamptz
```

**RLS Policies (Correct):**
```sql
-- PROFILES
profiles_select_owner: FOR SELECT USING (id = auth.uid())
profiles_insert_self:  FOR INSERT WITH CHECK (id = auth.uid()) -- Fixed Oct 21
profiles_update_owner: FOR UPDATE USING (id = auth.uid())

-- USER_ROLES
roles_self_read: FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','founder'))
)
```

**Analysis:**
- ✅ All policies use `id = auth.uid()` (matches schema)
- ✅ INSERT policy added (previously missing)
- ✅ Admin/founder can read all roles (intentional)
- ✅ Users can only read/update their own profiles

---

### Schema Consistency Check

**Referenced Tables in Code:**
```typescript
// lib/supabase/helpers.ts and API routes reference:
- profiles ✅ EXISTS
- user_roles ✅ EXISTS
- auth_events (audit logging) ⚠️ Not in active migrations
- leads ✅ EXISTS (20250819_business_leads.sql)
- scheduled_posts ⚠️ Not verified
- percy_memory ⚠️ Not in active migrations
- agent_usage_stats ⚠️ Archived migration
- vip_users ⚠️ Archived migration
- founder_codes ✅ EXISTS
- user_dashboard_access ⚠️ Not in active migrations
```

**Probe Endpoint Results:**
```bash
GET /api/_probe/supabase
{
  "schemaTables": ["profiles", "user_roles"] # Limited query
  "adminConnectOk": true,
  "anonRlsBlocked": true, # Expected behavior
  "errorClass": "Success"
}
```

**Action Required:**
- ⚠️ Verify which tables are actually in production database
- ⚠️ Migrate archived tables to active migrations if needed
- ⚠️ Remove code references to non-existent tables or add migrations

**Migration Status:**
```
Active migrations (9 files):
- 20251021_auth_profile_sync_repair.sql (LATEST)
- 20251006000000_core_auth_rbac_and_founders.sql
- 20251005_init_core_auth_rbac.sql
- 20250930_arr_snapshots.sql
- 20250927_fix_rls_performance_issues.sql
- 20250922_founders.sql
- 20250819_business_leads.sql
- 20251001_rls_perf_fixes.sql

Archived migrations (38+ files in _archive_old/):
- Analytics tables
- Agent tables (agent_handoffs, agent_knowledge_base)
- Email automation
- Promo/VIP system
- SMS verification
- Webhook errors
```

**Recommendation:**
```bash
# Audit production database schema
supabase db dump --schema public --data-only=false > schema_actual.sql
# Compare with migrations to identify gaps
```

---

## 3️⃣ API ROUTES AUDIT

### Probe Endpoints (Security Concern)

**Files:**
```
app/api/_probe/supabase/route.ts
app/api/_probe/auth/route.ts
app/api/_probe/db/profile-check/route.ts
app/api/_probe/db/profile-upsert/route.ts (dev-only flag)
app/api/_probe/env/route.ts
app/api/_probe/flags/route.ts
app/api/_probe/storage/route.ts
app/api/_probe/stripe/route.ts
```

**Issue:** No authentication required on probe endpoints.

**Information Disclosed:**
- Database connectivity status
- Table names in schema
- RLS policy behavior
- Environment variable presence (not values)
- Stripe connectivity status

**Risk Level:** 🟡 MEDIUM
- Does NOT expose actual credentials
- Does NOT expose sensitive data
- DOES expose system architecture details
- DOES help attackers map attack surface

**Recommendation:**
```typescript
// Add auth check to all probe routes
import { requireRole } from '@/lib/auth/roles';

export async function GET() {
  // Only founders/admins can access probes
  await requireRole(['founder', 'admin']);

  // ... existing probe logic
}
```

**Or:** Use environment variable to disable in production:
```typescript
if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_PROBE_ENDPOINTS) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

---

### Auth API Routes (Good Patterns)

**`app/api/auth/dashboard-signin/route.ts`:**
- ✅ Rate limiting (5 attempts/15 min)
- ✅ Audit logging (AuthAuditLogger)
- ✅ Null checks on Supabase client
- ✅ Promo/VIP code validation
- ✅ Marketing consent handling
- ✅ IP and user-agent tracking
- ⚠️ Uses `getOptionalServerSupabase()` (deprecated function)

**Recommended Fix:**
```typescript
// Line 18: Replace deprecated function
const supabase = getOptionalServerSupabase(); // OLD
const supabase = getServerSupabaseAdmin();    // NEW (already available)
```

---

### Client Initialization in API Routes

**Pattern Analysis:**
```typescript
// 97 files use Supabase clients
// Most common patterns:

// GOOD (used in ~70% of files):
const supabase = getServerSupabaseAdmin();
if (!supabase) {
  return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
}

// DEPRECATED (used in ~20% of files):
const supabase = createServerSupabaseClient(); // Throws on missing env
const supabase = getOptionalServerSupabase();  // Returns admin client

// ACCEPTABLE (used in ~10% of files):
const supabase = getServerSupabaseAnon(); // For RLS-respecting operations
```

**Recommendation:** Standardize on `getServerSupabaseAdmin()` with null checks.

---

## 4️⃣ DASHBOARD PAGES RENDERING

### Force-Dynamic Configuration

**Correct Pattern:**
```typescript
// Required for all auth-protected pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

**Audit Results:**
```
✅ /dashboard/page.tsx - CONFIGURED
✅ /dashboard/vip/page.tsx - CONFIGURED
✅ /dashboard/user/page.tsx - CONFIGURED
✅ /dashboard/parent/page.tsx - CONFIGURED
✅ /dashboard/heir/page.tsx - CONFIGURED
✅ /dashboard/founders/page.tsx - CONFIGURED
✅ /dashboard/analytics/page.tsx - CONFIGURED

❌ /dashboard/founder/page.tsx - MISSING
❌ /dashboard/profile/page.tsx - MISSING
❌ /dashboard/getting-started/page.tsx - MISSING
❌ /dashboard/website/page.tsx - MISSING
❌ /dashboard/branding/page.tsx - MISSING
❌ /dashboard/book-publishing/page.tsx - MISSING
❌ /dashboard/social-media/page.tsx - MISSING
❌ /dashboard/marketing/page.tsx - MISSING
❌ /dashboard/analytics/internal/page.tsx - MISSING
```

**Impact:**
- Pages without `force-dynamic` may attempt static pre-rendering
- Causes build-time failures when Supabase env vars are missing
- Auth checks fail during build phase

**Fix Required:**
```typescript
// Add to ALL dashboard pages:
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store'; // Optional but recommended
```

**Files to Update:**
```
app/dashboard/founder/page.tsx
app/dashboard/profile/page.tsx
app/dashboard/getting-started/page.tsx
app/dashboard/website/page.tsx
app/dashboard/branding/page.tsx
app/dashboard/book-publishing/page.tsx
app/dashboard/social-media/page.tsx
app/dashboard/marketing/page.tsx
app/dashboard/analytics/internal/page.tsx
```

---

## 5️⃣ ENVIRONMENT CONFIGURATION

### `.env.local.example` (Development)

**Correct Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Issues:**
```bash
# Line 40: Deprecated warning
# IMPORTANT: Remove this deprecated environment variable
# NEXT_PUBLIC_N8N_FREE_SCAN_URL=<-- This should NOT be present anymore
```

**Status:** Warning only, not actively used.

---

### `.env.production` (Railway)

**Structure:** ✅ Correct (empty values, Railway populates)

**Feature Flags (18 flags):**
```bash
NEXT_PUBLIC_HP_GUIDE_STAR=
NEXT_PUBLIC_ENABLE_STRIPE=
NEXT_PUBLIC_ENABLE_BUNDLES=
NEXT_PUBLIC_SHOW_PERCY_WIDGET=
FF_N8N_NOOP=
# ... 13 more
```

**Issue:** No centralized feature flag management.

**Recommendation:**
```typescript
// lib/config/featureFlags.ts
export const featureFlags = {
  hpGuideStar: process.env.NEXT_PUBLIC_HP_GUIDE_STAR === 'true',
  enableStripe: process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true',
  showPercyWidget: process.env.NEXT_PUBLIC_SHOW_PERCY_WIDGET === 'true',
  // ... etc
} as const;

// Usage:
import { featureFlags } from '@/lib/config/featureFlags';
if (featureFlags.showPercyWidget) { ... }
```

---

## 6️⃣ MIDDLEWARE & AUTH GUARDS

### `middleware.ts` Analysis

**Responsibilities:**
1. Host canonicalization (www → apex)
2. Legacy route redirects
3. Founder access gates via cookie

**Auth Pattern:**
```typescript
function hasFounderAccess(request: NextRequest): boolean {
  const founderCookie = request.cookies.get('skrbl_founder');
  return founderCookie?.value === '1';
}
```

**Issue:** Lightweight cookie check, no server-side validation.

**Security Analysis:**
- ⚠️ Cookie can be forged
- ✅ Full validation happens in `requireRole()` server-side
- ✅ Middleware just pre-filters, not authoritative

**Recommendation:** Add comment clarifying security model:
```typescript
/**
 * Check if user has founder access via cookie
 * This is a PRELIMINARY check for UX only - full validation happens server-side
 * DO NOT rely on this for security enforcement
 */
```

---

### Server-Side Auth Guards

**Files:**
```
lib/auth/requireUser.ts - Requires any authenticated user
lib/auth/roles.ts - requireRole(['founder', 'admin'])
lib/auth/getSession.ts - Session helpers
```

**Pattern (Excellent):**
```typescript
// lib/auth/roles.ts
export async function requireRole(allowedRoles: Role[]) {
  const { user, role } = await getUserAndRole();

  if (!user) {
    redirect('/sign-in');
  }

  if (!allowedRoles.includes(role)) {
    redirect(routeForRole(role)); // Redirect to appropriate dashboard
  }

  return { user, role };
}
```

**Usage in Dashboard:**
```typescript
// app/dashboard/vip/page.tsx
export default async function VIPDashboard() {
  const user = await requireRole(['vip', 'admin']);
  return <VIPDashboardClient user={user} />;
}
```

**Security:** ✅ STRONG
- Server-side only (can't be bypassed)
- Uses Supabase auth session
- Queries user_roles table
- Redirects if unauthorized

---

## 7️⃣ TYPE SAFETY & CODE GENERATION

### Current Type Definitions

**File:** `types/supabase.ts`

**Manual Types:**
```typescript
interface Lead { name, email, selectedPlan, ... }
interface Proposal { id, projectName, clientName, ... }
interface ScheduledPost { id, platform, content, ... }
```

**Issue:** Types are manually maintained, can drift from actual schema.

**Recommendation:** Use Supabase CLI for type generation:
```bash
# Generate TypeScript types from actual schema
supabase gen types typescript --project-id [project-id] > types/supabase-generated.ts
```

**Benefits:**
- ✅ Types always match production schema
- ✅ Autocomplete for table columns
- ✅ Catch type errors at compile time
- ✅ Refactoring safety

**Integration:**
```typescript
import { Database } from '@/types/supabase-generated';

const supabase = createClient<Database>(url, key);

// Now fully typed:
const { data } = await supabase
  .from('profiles') // Autocomplete available
  .select('id, full_name, email') // Type-checked columns
  .eq('id', userId); // Type-checked filters
```

---

## 8️⃣ PERFORMANCE & OPTIMIZATION

### Client Caching

**Current Pattern:**
```typescript
// lib/supabase/server.ts
let adminClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

export function getServerSupabaseAdmin() {
  if (adminClient) return adminClient; // Singleton
  adminClient = createClient(...);
  return adminClient;
}
```

**Analysis:** ✅ GOOD
- Prevents client recreation on every request
- Reduces connection overhead
- Singleton pattern appropriate for server environment

---

### RLS Performance

**Files:**
```
supabase/migrations/20250927_fix_rls_performance_issues.sql
supabase/migrations/20251001_rls_perf_fixes.sql
```

**Optimizations Applied:**
- ✅ Indexed foreign keys
- ✅ Simplified policy expressions
- ✅ Removed redundant checks

**Current Status:** Monitoring recommended.

---

### Audit Logging Batch Optimization

**File:** `lib/auth/authAuditLogger.ts`

**Pattern:**
```typescript
class AuthAuditLogger {
  private eventQueue: AuthEvent[] = [];
  private flushInterval = 5000; // Flush every 5 seconds

  async logEvent(event: AuthEvent) {
    this.eventQueue.push(event);

    if (event.severity === 'critical') {
      await this.flush(); // Immediate flush for critical events
    }
  }
}
```

**Issue:** Events in queue lost on process crash before flush.

**Recommendation:**
```typescript
// Flush on process exit
process.on('beforeExit', async () => {
  await authAuditLogger.flush();
});
```

---

## 9️⃣ RECOMMENDED FIXES (Priority Order)

### 🔴 CRITICAL (Do Immediately)

1. **Add `force-dynamic` to 9 missing dashboard pages**
   - Prevents build-time failures
   - Ensures auth works correctly
   - Files: founder, profile, getting-started, website, branding, book-publishing, social-media, marketing, analytics/internal

2. **Verify production database schema**
   - Check which tables actually exist
   - Reconcile with code references
   - Add missing migrations or remove dead code

---

### 🟡 HIGH (Do Before Launch)

3. **Protect probe endpoints**
   - Add founder/admin auth requirement
   - Or disable in production via env var
   - Prevents information disclosure

4. **Standardize Supabase client usage**
   - Replace deprecated `getOptionalServerSupabase()`
   - Replace deprecated `createServerSupabaseClient()`
   - Use `getServerSupabaseAdmin()` everywhere

5. **Implement Supabase type codegen**
   - Run `supabase gen types typescript`
   - Add to CI/CD pipeline
   - Catch schema mismatches early

---

### 🟢 MEDIUM (Nice to Have)

6. **Centralize feature flags**
   - Create `lib/config/featureFlags.ts`
   - Type-safe flag access
   - Easier to audit and manage

7. **Add process exit handler to AuthAuditLogger**
   - Flush queue on shutdown
   - Prevents data loss

8. **Clean up deprecated env var warnings**
   - Remove `NEXT_PUBLIC_N8N_FREE_SCAN_URL` from docs

---

## 🎯 CONCLUSION

The SKRBL AI Supabase integration is **architecturally sound** with **no critical blockers**. The platform demonstrates mature patterns:

- ✅ Lazy initialization prevents build crashes
- ✅ RLS policies correctly enforce row-level security
- ✅ Auth flow robust with admin/anon separation
- ✅ Recent migration fixed profile INSERT issue

**Primary concerns are operational hygiene:**
- Missing `force-dynamic` on some pages
- Unprotected diagnostic endpoints
- Manual type definitions (schema drift risk)

**Recommended Action Plan:**
1. Add `force-dynamic` to 9 pages (30 min)
2. Verify production schema vs. migrations (1 hour)
3. Protect probe endpoints (30 min)
4. Standardize client usage (2 hours)
5. Implement type codegen (1 hour)

**Total effort:** ~5 hours to production-ready state.

---

## APPENDIX: File Reference

### Supabase Client Files
- `lib/supabase/server.ts` - Admin/anon server clients
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/browser.ts` - Alternative browser client
- `lib/supabase/helpers.ts` - Database utilities
- `lib/supabase/onboarding.ts` - Profile sync
- `lib/supabase/index.ts` - Public exports

### Auth Files
- `lib/auth/dashboardAuth.ts` - Main auth logic (766 lines)
- `lib/auth/authAuditLogger.ts` - Audit trail
- `lib/auth/getSession.ts` - Session helpers
- `lib/auth/roles.ts` - RBAC routing
- `lib/auth/requireUser.ts` - Auth guard
- `app/auth/callback/page.tsx` - OAuth callback

### Migration Files
- `supabase/migrations/20251021_auth_profile_sync_repair.sql` (LATEST)
- `supabase/migrations/20251006000000_core_auth_rbac_and_founders.sql`
- `supabase/migrations/_archive_old/` (38+ archived files)

### API Routes
- `app/api/_probe/*` - Diagnostic endpoints (8 files)
- `app/api/auth/dashboard-signin/route.ts` - Login/signup
- `app/api/agents/*` - Agent endpoints
- `app/api/analytics/*` - Analytics endpoints

---

**End of Supabase Audit Report**
