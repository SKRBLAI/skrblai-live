# Auth + Dashboard Access + Always-On Features Stabilization

**PR Title:** `chore: stabilize Supabase auth + dashboard access + always-on orbit (non-destructive)`

**Date:** October 2, 2025

## 🎯 Mission Accomplished

Made sign-in/sign-up work reliably (email/password + magic link + Google if enabled), ensured dashboards are accessible via correct roles, and guaranteed the latest UI features are visible (especially Agent Orbit on /agents) without deleting legacy code or changing pricing.

## 📋 Changes Summary

### A) Supabase Auth Wiring

#### 1. **Dual-Key Support** ✅
- **Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`
- **Changes:**
  - Added support for both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Uses `readEnvAny()` helper to accept either key
  - Client works with sbp_* (publishable) or standard anon keys
  
#### 2. **Always-Render Auth UI** ✅
- **File:** `app/(auth)/sign-in/page.tsx`
- **Changes:**
  - Removed early returns that caused blank screens
  - Progressive enhancement: UI always renders, shows inline status if Supabase unavailable
  - Added yellow warning banner when auth service is not configured
  - No more "waiting" screens - immediate UI render

#### 3. **Magic Link Support** ✅
- **Files:** `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`
- **Changes:**
  - Added mode toggle: "Password" vs "Magic Link"
  - Magic link sends OTP with proper `emailRedirectTo` callback
  - Shows success message: "Magic link sent! Check your email"
  - Password field conditionally hidden in magic link mode
  - Hint message explains magic link flow

#### 4. **Google OAuth (Conditional)** ✅
- **File:** `app/(auth)/sign-in/page.tsx`
- **Changes:**
  - Google button only appears if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` present
  - Uses `signInWithOAuth` with proper redirect URL
  - Graceful: no error if Google not configured, button simply doesn't render
  - Beautiful Google SVG logo included

#### 5. **Callback Flow** ✅
- **Files:** `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`, `app/auth/callback/page.tsx`
- **Changes:**
  - All auth methods set `emailRedirectTo: ${NEXT_PUBLIC_SITE_URL}/auth/callback`
  - Fallback to `window.location.origin` if SITE_URL not set
  - Callback exchanges code → session → role-based redirect
  - Preserves `from` parameter for post-auth deep linking

### B) Dashboard Access (RBAC + Routing)

#### 1. **Fixed Role Routes** ✅
- **File:** `lib/auth/roles.ts`
- **Changes:**
  - Fixed `routeForRole`: `founder → /dashboard/founder` (was `/dashboard/founders`)
  - Added `heir` to `AppRole` type
  - Updated priority order: founder > heir > vip > parent > user
  - Added documentation comment explaining relationship with `lib/founders/roles.ts`

#### 2. **Role Resolution** ✅
- **File:** `lib/auth/roles.ts`
- **Changes:**
  - `getUserAndRole()` checks `user_roles` table
  - Returns highest-priority role
  - Supports: founder, heir, vip, parent, user
  - Graceful fallback to 'user' if RLS fails

#### 3. **Post-Login Redirect** ✅
- **Files:** `app/auth/callback/page.tsx`, `app/auth/redirect/page.tsx`
- **Changes:**
  - After callback, routes by role using `routeForRole()`
  - Safe `from` parameter validation (no redirect loops)
  - Logs routing decisions for debugging

#### 4. **Middleware Notes** ✅
- **File:** `middleware.ts`
- **Changes:**
  - Added documentation: general auth is handled at page/layout level
  - Middleware focuses on: host canonicalization, legacy redirects, founder-role gates
  - References `lib/auth/roles.ts` for RBAC implementation

### C) Always-On Features (Orbit)

#### 1. **Orbit Placement** ✅
- **File:** `app/agents/page.tsx`
- **Status:** Already correctly implemented
- **Behavior:**
  - When `NEXT_PUBLIC_ENABLE_ORBIT='1'`: Orbit renders above grid
  - When flag not set: Grid renders normally
  - No gate & hide - progressive enhancement
  - Never blank screen

#### 2. **No Homepage Interference** ✅
- **Status:** Verified - no HP_GUIDE_STAR flags in /agents
- **Behavior:** Homepage flags don't affect /agents page

### D) Diagnostics & Health

#### 1. **Enhanced /api/env-check** ✅
- **File:** `app/api/env-check/route.ts`
- **Changes:**
  - **Supabase Diagnostics:**
    - Checks if URL ends with `.supabase.co`
    - Warns if custom auth domain detected (e.g., auth.skrblai.io)
    - Validates dual-key support (anon or publishable)
    - Checks service role key for server operations
  - **Google OAuth Detection:**
    - Reports if both CLIENT_ID and SECRET present
    - Shows partial config warnings
    - Optional status (no error if missing)
  - **Feature Flags:**
    - Reports Orbit status (enabled/disabled)
    - Links flag status to /agents behavior
  - **Actionable Notes:**
    - Uses emoji indicators: ✅ (good), ⚠️ (warning), ❌ (critical), ℹ️ (info)
    - Human-readable "what's wrong" explanations
    - No secrets in logs - only PRESENT/MISSING

#### 2. **README Health Checklist** ✅
- **File:** `README.md`
- **Changes:**
  - Added "60-SECOND PROD HEALTH CHECKLIST" section
  - 4-step manual test plan:
    1. Hit /api/env-check (15 sec)
    2. Test auth flow at /sign-in (20 sec)
    3. Verify Orbit at /agents (10 sec)
    4. Check dashboard routing (15 sec)
  - Common issues troubleshooting guide
  - Updated /api/env-check documentation with new features

## 🔧 Files Modified

### Core Auth
- `lib/supabase/client.ts` - Dual-key support
- `lib/supabase/server.ts` - Dual-key support (anon client)
- `app/(auth)/sign-in/page.tsx` - Magic link + Google + always-render
- `app/(auth)/sign-up/page.tsx` - SITE_URL for emailRedirectTo

### RBAC
- `lib/auth/roles.ts` - Fixed routes, added heir, documentation

### Infrastructure
- `middleware.ts` - Added auth documentation
- `app/api/env-check/route.ts` - Enhanced diagnostics

### Documentation
- `README.md` - Added 60-second health checklist
- `CHANGELOG_AUTH_STABILIZATION.md` - This file

## 🧪 Manual Test Plan

### 1. Environment Check
```bash
curl https://your-domain.com/api/env-check
```
**Expected:**
- `"ok": true`
- Notes show ✅ for valid Supabase URL
- Notes show ✅ for dual-key support
- Notes explain Google OAuth status
- Notes report Orbit flag status

### 2. Sign-In Page
**Test:** Visit `/sign-in`
**Expected:**
- ✅ Form renders immediately (no blank screen, no loading forever)
- ✅ See two tabs: "Password" and "Magic Link"
- ✅ Toggle switches between modes
- ✅ Password mode shows email + password fields
- ✅ Magic link mode shows only email + hint message
- ✅ Google button appears if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set
- ✅ If Supabase not configured: yellow warning banner shows, but form still renders

**Test Cases:**
1. **Password sign-in:** Enter email/password → submit → redirects to dashboard by role
2. **Magic link:** Toggle to magic link → enter email → see green success message
3. **Google OAuth:** Click Google button → redirects to Google consent screen
4. **Missing config:** Remove Supabase URL → page still renders with warning banner

### 3. Sign-Up Page
**Test:** Visit `/sign-up`
**Expected:**
- ✅ Form renders with email, password, confirm password
- ✅ Uses `NEXT_PUBLIC_SITE_URL` for emailRedirectTo
- ✅ On success: either redirects (instant confirm) or shows "check email" message

### 4. Auth Callback
**Test:** Complete magic link or OAuth flow
**Expected:**
- ✅ `/auth/callback` exchanges code for session
- ✅ Redirects based on role:
  - Founder → `/dashboard/founder`
  - Heir → `/dashboard/heir`
  - VIP → `/dashboard/vip`
  - Parent → `/dashboard/parent`
  - User → `/dashboard`
- ✅ Preserves `from` parameter for deep links
- ✅ Logs decisions to console

### 5. Agent Orbit
**Test:** Visit `/agents` with `NEXT_PUBLIC_ENABLE_ORBIT=1`
**Expected:**
- ✅ Orbit displays above grid
- ✅ Grid still renders below
- ✅ Never blank screen

**Test:** Visit `/agents` without flag or flag=0
**Expected:**
- ✅ Only grid displays
- ✅ No errors
- ✅ Never blank screen

### 6. Dashboard Routing
**Test:** Sign in as different role types
**Expected:**
- ✅ Each role lands on correct dashboard path
- ✅ No redirect loops
- ✅ Console logs show role detection

## 🚀 Deployment Checklist

### Pre-Deploy
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` to `https://<PROJECT>.supabase.co`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` OR `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` for server operations
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain (required for magic links)
- [ ] Optional: Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` for OAuth
- [ ] Optional: Set `NEXT_PUBLIC_ENABLE_ORBIT=1` to show orbit on /agents

### Post-Deploy
1. Run 60-second health check (see README.md)
2. Test sign-in with email/password
3. Test magic link flow (check email delivery)
4. Test Google OAuth (if configured)
5. Verify dashboard routing for each role
6. Check /agents shows Orbit (if flag=1) or grid (if flag=0)

## 📝 Notes

### Non-Destructive Guardrails
- ✅ No files deleted or renamed
- ✅ No pricing changes
- ✅ No Stripe product ID modifications
- ✅ No secrets in logs (only PRESENT/MISSING)
- ✅ Progressive enhancement over gate & hide
- ✅ Legacy code marked with `// @deprecated` comments where appropriate

### Key Design Decisions

1. **Progressive Enhancement:** Auth UI always renders. If Supabase unavailable, show inline warning instead of blank screen.

2. **Dual-Key Support:** Accept either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to support both legacy (anon) and new (sbp_*) key formats.

3. **Magic Link Priority:** Magic links require `NEXT_PUBLIC_SITE_URL` to match production domain. Falls back to `window.location.origin` for dev.

4. **Orbit Fallback:** When `NEXT_PUBLIC_ENABLE_ORBIT` not set, /agents shows grid only. No blank screens, no errors.

5. **Role System Separation:** 
   - `lib/auth/roles.ts` - Lightweight, used for auth callback routing
   - `lib/founders/roles.ts` - Comprehensive, used for founder-specific features
   - Both coexist, documented to avoid confusion

### Known Limitations

1. **RLS Policies:** Not modified in this PR. Supabase Linter warnings may exist but are functionally unchanged.

2. **Middleware Auth:** General auth (is user logged in?) is handled at page/layout level, not middleware. Middleware only gates founder-specific routes.

3. **Google OAuth:** Requires Supabase provider to be enabled in dashboard. This PR only wires the UI.

## 🔗 Related Documentation

- Auth Flow: See `app/(auth)/sign-in/page.tsx` for implementation
- Role System: See `lib/auth/roles.ts` for routing logic
- Diagnostics: See `app/api/env-check/route.ts` for health checks
- Manual Testing: See README.md "60-SECOND PROD HEALTH CHECKLIST"

---

**Non-Destructive ✅ | Zero Deletions ✅ | Progressive Enhancement ✅ | Clear Diagnostics ✅**
