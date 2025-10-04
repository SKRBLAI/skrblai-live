# Supabase Helpers & Auth Flows Report

## Overview
Complete inventory of all Supabase client factories, auth flows, and the AuthContext anomaly. Includes consolidation recommendations.

---

## ⚠️ AuthContext Anomaly (From Screenshot)

### The Issue
**File**: `components/context/AuthContext.tsx:5`

```typescript
import { getBrowserSupabase } from '@/lib/supabase/client';
```

**Finding**: AuthContext imports `getBrowserSupabase` from `@/lib/supabase/client`.

**Why This Matters**:
- `getBrowserSupabase()` is a client factory that returns `SupabaseClient | null`
- Must handle null case gracefully
- Differs from other Supabase helpers that throw or return mocks

**Actual Implementation** (from `lib/supabase/client.ts:12-49`):
```typescript
export function getBrowserSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = readEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  const anonKey = readEnvAny(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 
    'SUPABASE_ANON_KEY'
  );

  if (!url || !anonKey) {
    // Only warn in development
    if (process.env.NODE_ENV === 'development') {
      console.warn("[supabase] Missing environment variables");
    }
    return null;
  }

  supabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return supabase;
}
```

**How AuthContext Handles It** (`components/context/AuthContext.tsx:41`):
```typescript
const supabase = getBrowserSupabase();

// Lines 118-126: Graceful null handling
if (!supabase || !supabase.auth || typeof supabase.auth.onAuthStateChange !== "function") {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[Auth] Supabase auth not available");
  }
  setIsLoading(false);
  return;
}
```

**Verdict**: ✅ **Handled Correctly** - AuthContext gracefully handles null case

---

## Supabase Client Factories (All Variants)

### 1. **Browser Clients** (2 factories)

#### Factory 1: `getBrowserSupabase()` 
**Location**: `lib/supabase/client.ts:12-49`  
**Returns**: `SupabaseClient | null`  
**Used In**:
- ✅ `components/context/AuthContext.tsx:41` (Primary usage)
- Potentially other files

**Key Features**:
- Singleton pattern (caches client)
- Dual-key support: `NEXT_PUBLIC_SUPABASE_ANON_KEY` OR `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Returns `null` if env vars missing (no throw, no mock)
- Only warns in development

**Configuration**:
```typescript
createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
```

#### Factory 2: `createBrowserSupabaseClient()`
**Location**: `lib/supabase/browser.ts:7-59`  
**Returns**: `SupabaseClient` (or mock)  
**Used In**: Unknown (not found in provided files)

**Key Features**:
- Dual-key support: `NEXT_PUBLIC_SUPABASE_ANON_KEY` OR `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Returns **mock client** if env vars missing or placeholder
- Adds `'X-Client-Source': 'browser'` header

**Mock Client** (when env vars missing):
```typescript
return {
  from: () => ({ select: () => Promise.resolve({ data: null, error: ... }) }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: ... }),
    signOut: () => Promise.resolve({ error: ... }),
    // ... more mock methods
  },
  storage: { /* mock */ }
} as any;
```

**Difference from Factory 1**: Returns mock instead of null

---

### 2. **Server Clients** (2 factories + 1 legacy)

#### Factory 1: `getServerSupabaseAdmin()`
**Location**: `lib/supabase/server.ts:16-49`  
**Returns**: `SupabaseClient | null`  
**Permissions**: **SERVICE ROLE** (bypasses RLS)  
**Used In**:
- `lib/auth/dashboardAuth.ts`
- `app/api/stripe/webhook/route.ts`
- Many other API routes

**Key Features**:
- Uses `SUPABASE_SERVICE_ROLE_KEY` (admin key)
- Singleton pattern
- Adds `'Authorization': Bearer ${serviceKey}` header
- Adds `'X-Client-Source': 'server-admin'` header

**⚠️ Security**: Never expose to browser!

#### Factory 2: `getServerSupabaseAnon()`
**Location**: `lib/supabase/server.ts:55-91`  
**Returns**: `SupabaseClient | null`  
**Permissions**: **ANON KEY** (respects RLS)  
**Used In**: Less common (safer for public operations)

**Key Features**:
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Singleton pattern
- Adds `'X-Client-Source': 'server-anon'` header

#### Legacy: `getOptionalServerSupabase()`
**Location**: `lib/supabase/server.ts:97-99`  
**Status**: 🕰️ **DEPRECATED** but still used  
**Returns**: Alias for `getServerSupabaseAdmin()`

```typescript
export function getOptionalServerSupabase(): SupabaseClient | null {
  return getServerSupabaseAdmin();
}
```

**Used In**:
- `app/api/stripe/webhook/route.ts:37`
- `lib/auth/dashboardAuth.ts`
- Many other places

**Recommendation**: Migrate to `getServerSupabaseAdmin()` directly

---

### 3. **Legacy/Mock Factories**

#### `createSafeSupabaseClient()`
**Location**: `lib/supabase/client.ts:52-80`  
**Returns**: `SupabaseClient` (or mock)  
**Status**: 🕰️ **LEGACY** - For backward compatibility

**Key Features**:
- Calls `getBrowserSupabase()`
- If null, returns mock client (similar to `browser.ts`)
- Prevents build errors when Supabase not configured

**Recommendation**: Migrate consumers to `getBrowserSupabase()` with null handling

#### `createServerSupabaseClient()`
**Location**: `lib/supabase/server.ts:113-119`  
**Returns**: `SupabaseClient` (throws if missing)  
**Status**: 🕰️ **DEPRECATED**

```typescript
export function createServerSupabaseClient(): SupabaseClient {
  const client = getServerSupabaseAdmin();
  if (!client) {
    throw new Error('Failed to create server Supabase client');
  }
  return client;
}
```

**Recommendation**: Migrate to `getServerSupabaseAdmin()` with null handling

---

## Environment Variable Support

### Dual-Key System

All Supabase helpers support **dual keys** for flexibility:

**For Browser Clients**:
- Primary: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Fallback: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Legacy: `SUPABASE_ANON_KEY` (some factories)

**For Server Clients**:
- Admin: `SUPABASE_SERVICE_ROLE_KEY` (required for admin operations)
- Anon: Same as browser (for RLS-respecting server operations)

**URL**:
- Primary: `NEXT_PUBLIC_SUPABASE_URL`
- Fallback: `SUPABASE_URL`

### Resolution Helper
All factories use `readEnvAny()` from `lib/env/readEnvAny.ts` to try multiple key names.

---

## Auth Flow Mapping

### Sign-In Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT: Sign-in form component                              │
│  (app/(auth)/sign-in/page.tsx)                              │
└──────────────────┬──────────────────────────────────────────┘
                   │ Calls: signIn(email, password, options)
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  AUTH CONTEXT: components/context/AuthContext.tsx           │
│  Function: signIn() (lines 207-305)                         │
│  ├─ 1. Gets supabase = getBrowserSupabase()                │
│  ├─ 2. Calls supabase.auth.signInWithPassword()            │
│  ├─ 3. If promo/VIP code: POST /api/auth/apply-code        │
│  ├─ 4. Logs event to supabase.from('auth_events')          │
│  └─ 5. Updates local state (user, session)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ Optional: Dashboard access check
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  API: /api/auth/dashboard-signin (optional)                 │
│  POST with: { email, password, promoCode?, vipCode? }       │
│  ├─ Authenticates user                                       │
│  ├─ Validates + redeems promo/VIP codes                     │
│  ├─ Determines access level (free/promo/vip)                │
│  └─ Returns: { success, user, accessLevel, vipStatus }      │
└─────────────────────────────────────────────────────────────┘
```

### Sign-Up Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT: Sign-up form component                              │
│  (app/(auth)/sign-up/page.tsx)                              │
└──────────────────┬──────────────────────────────────────────┘
                   │ Calls: signUp(email, password, options)
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  AUTH CONTEXT: components/context/AuthContext.tsx           │
│  Function: signUp() (lines 369-454)                         │
│  ├─ 1. Gets supabase = getBrowserSupabase()                │
│  ├─ 2. Calls supabase.auth.signUp()                         │
│  ├─ 3. If session exists (no email confirm):                │
│  │     POST /api/auth/dashboard-signin (mode=signup)        │
│  ├─ 4. Applies promo/VIP code if provided                   │
│  └─ 5. Returns { success, needsEmailConfirmation }          │
└──────────────────┬──────────────────────────────────────────┘
                   │ If needsEmailConfirmation=true
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  EMAIL: User receives Supabase confirmation email           │
│  Link: /auth/callback?code=...&type=signup                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ User clicks link
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  CALLBACK: app/auth/callback/page.tsx                        │
│  ├─ Exchanges code for session                              │
│  ├─ Updates AuthContext state                                │
│  └─ Redirects to /dashboard                                  │
└─────────────────────────────────────────────────────────────┘
```

### OAuth Flow (Google)

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT: Sign-in/up form                                     │
│  Calls: signInWithOAuth('google')                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│  AUTH CONTEXT: signInWithOAuth() (lines 307-336)            │
│  ├─ Calls supabase.auth.signInWithOAuth({ provider })      │
│  └─ Sets redirectTo: window.location.origin + '/dashboard'  │
└──────────────────┬──────────────────────────────────────────┘
                   │ Redirects to Google OAuth
                   │ User authorizes
                   │ Google redirects to /auth/callback
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  CALLBACK: app/auth/callback/page.tsx                        │
│  (Same as email confirmation flow)                          │
└─────────────────────────────────────────────────────────────┘
```

### Magic Link (OTP) Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT: Magic link option                                   │
│  Calls: signInWithOtp(email)                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│  AUTH CONTEXT: signInWithOtp() (lines 338-367)              │
│  ├─ Calls supabase.auth.signInWithOtp({ email })           │
│  └─ Sets emailRedirectTo: '/auth/callback'                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ User receives email with magic link
                   │ Clicks link → /auth/callback
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  CALLBACK: app/auth/callback/page.tsx                        │
│  (Same flow as other auth methods)                          │
└─────────────────────────────────────────────────────────────┘
```

### Auth Callback Routes

**Two callback routes found**:

1. **Primary**: `app/auth/callback/page.tsx`
   - Handles OAuth callbacks
   - Handles email confirmation callbacks
   - Exchanges code for session
   
2. **Secondary**: `app/auth/redirect/page.tsx`
   - Purpose: Unclear (potentially redundant)
   - May be legacy or alternative callback

**Recommendation**: Audit if both are needed, consolidate if redundant

---

## Email Redirect URL Composition

### Where Configured

**AuthContext Sign-Up** (line 389):
```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`
```

**AuthContext Magic Link** (line 351):
```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`
```

**AuthContext OAuth** (line 320):
```typescript
redirectTo: `${window.location.origin}/dashboard`
```

**Inconsistency**: OAuth goes to `/dashboard`, email methods go to `/auth/callback`

**Recommendation**: Standardize all to `/auth/callback`, then redirect from there

---

## Captcha Usage

### Supabase Captcha (hCaptcha)

**Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (enables Supabase-level protection)

**Finding**: No explicit hCaptcha widget implementation found in:
- `app/(auth)/sign-in/page.tsx`
- `app/(auth)/sign-up/page.tsx`
- `components/context/AuthContext.tsx`

**Supabase Default**: If captcha enabled in Supabase dashboard:
- Supabase Auth API handles captcha server-side
- No widget needed in UI (unless custom implementation)

**Verification**: Check Supabase project settings → Authentication → Captcha Protection

---

## Consolidation Plan

### Recommended Client Structure

**Browser (Client-Side)**:
```typescript
// Single canonical browser client
export function getBrowserSupabase(): SupabaseClient | null {
  // Existing implementation in lib/supabase/client.ts
  // ✅ Keep as-is
}
```

**Server (API Routes)**:
```typescript
// Two server clients for different use cases

// 1. Admin operations (bypass RLS)
export function getServerSupabaseAdmin(): SupabaseClient | null {
  // Existing implementation in lib/supabase/server.ts
  // ✅ Keep as-is
}

// 2. RLS-respecting operations
export function getServerSupabaseAnon(): SupabaseClient | null {
  // Existing implementation in lib/supabase/server.ts
  // ✅ Keep as-is
}
```

### Deprecate/Remove

1. ❌ `createSafeSupabaseClient()` - Migrate to `getBrowserSupabase()` with null handling
2. ❌ `createBrowserSupabaseClient()` - Duplicate of `getBrowserSupabase()`
3. ❌ `getOptionalServerSupabase()` - Migrate to `getServerSupabaseAdmin()`
4. ❌ `createServerSupabaseClient()` - Migrate to `getServerSupabaseAdmin()`

### Migration Steps

**Step 1**: Find all usages of deprecated functions
```bash
grep -r "createSafeSupabaseClient\|createBrowserSupabaseClient\|getOptionalServerSupabase\|createServerSupabaseClient" --include="*.ts" --include="*.tsx"
```

**Step 2**: Update to canonical factories
```typescript
// Before
const supabase = createSafeSupabaseClient();
supabase.from('table').select(); // Always works (mock if missing)

// After
const supabase = getBrowserSupabase();
if (!supabase) {
  // Handle gracefully
  return;
}
supabase.from('table').select(); // Only if configured
```

**Step 3**: Remove deprecated exports from:
- `lib/supabase/client.ts`
- `lib/supabase/browser.ts` (entire file?)
- `lib/supabase/server.ts`

---

## Summary

### ✅ What's Working

1. **AuthContext** properly handles null supabase client
2. **Dual-key support** provides flexibility
3. **Separation** of browser vs. server clients
4. **Security** - Service role key never exposed to browser

### ⚠️ Issues Found

1. **Too many factories** - 7 different ways to get Supabase client
2. **Inconsistent patterns** - Some return null, some throw, some return mocks
3. **Deprecated functions** still widely used
4. **Two callback routes** - May be redundant
5. **OAuth redirect inconsistency** - `/dashboard` vs `/auth/callback`

### 🎯 Priority Actions

1. **Consolidate factories** - Keep 3 canonical: `getBrowserSupabase`, `getServerSupabaseAdmin`, `getServerSupabaseAnon`
2. **Migrate deprecated** - Update all usages to canonical factories
3. **Standardize redirects** - All auth flows → `/auth/callback` → redirect logic
4. **Audit callback routes** - Determine if both `/auth/callback` and `/auth/redirect` needed
5. **Document** - Add JSDoc comments explaining when to use each factory

---

## One Canonical Client of Each Type

### ✅ **Browser Client** (Keep)
**Function**: `getBrowserSupabase()`  
**File**: `lib/supabase/client.ts`  
**Returns**: `SupabaseClient | null`

### ✅ **Server Admin Client** (Keep)
**Function**: `getServerSupabaseAdmin()`  
**File**: `lib/supabase/server.ts`  
**Returns**: `SupabaseClient | null`  
**Use When**: Need to bypass RLS (admin operations)

### ✅ **Server Anon Client** (Keep)
**Function**: `getServerSupabaseAnon()`  
**File**: `lib/supabase/server.ts`  
**Returns**: `SupabaseClient | null`  
**Use When**: Server-side but should respect RLS

---

## Fix It Steps

1. **Audit usages**: `grep -r "createSafe\|createBrowser\|getOptional\|createServer" --include="*.ts*"`
2. **Create migration guide**: Document pattern for migrating to canonical factories
3. **Update AuthContext**: Add comment explaining `getBrowserSupabase()` choice
4. **Migrate API routes**: Update all to use `getServerSupabaseAdmin()` or `getServerSupabaseAnon()`
5. **Remove deprecated**: After migration, delete old factory functions
6. **Update docs**: Create `lib/supabase/README.md` explaining the three canonical clients
