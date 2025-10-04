# Authentication Flow Documentation

This document shows the complete authentication flow from sign-in to dashboard, including the three Supabase helpers and health checks.

## Authentication Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  USER JOURNEY: Sign-In → Magic Link → Callback → Dashboard  │
└─────────────────────────────────────────────────────────────┘
```

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT: Sign-in form component                              │
│  (app/(auth)/sign-in/page.tsx)                              │
└──────────────────┬──────────────────────────────────────────┘
                   │ User enters email/password or clicks "Magic Link"
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  AUTH CONTEXT: components/context/AuthContext.tsx           │
│  Function: signIn() or signInWithOtp()                      │
│  ├─ 1. Gets supabase = getBrowserSupabase()                │
│  ├─ 2. Calls supabase.auth.signInWithPassword()            │
│  │   OR supabase.auth.signInWithOtp()                      │
│  ├─ 3. If promo/VIP code: POST /api/auth/apply-code        │
│  ├─ 4. Logs event to supabase.from('auth_events')          │
│  └─ 5. Updates local state (user, session)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ For magic link: User receives email
                   │ For password: Direct session creation
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  EMAIL: User receives Supabase confirmation email           │
│  Link: /auth/callback?code=...&type=signup                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ User clicks magic link
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  CALLBACK: app/auth/callback/page.tsx                        │
│  ├─ 1. Gets supabase = getServerSupabaseAdmin()            │
│  ├─ 2. Calls supabase.auth.exchangeCodeForSession(code)    │
│  ├─ 3. Gets user and role via getUserAndRole()              │
│  ├─ 4. Redirects based on role or 'from' parameter         │
│  └─ 5. Routes to appropriate dashboard                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ Redirects to role-based dashboard
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD: Role-based routing                               │
│  ├─ /dashboard/founder - For founders/creators             │
│  ├─ /dashboard/vip - For VIP users                         │
│  ├─ /dashboard/user - For regular users                    │
│  └─ /dashboard/heir - For heir role                        │
└─────────────────────────────────────────────────────────────┘
```

## Three Supabase Helpers

### 1. Browser Client (Client-Side Components)
```typescript
// lib/supabase/index.ts
export { getBrowserSupabase } from './client';

// Usage in components
import { getBrowserSupabase } from '@/lib/supabase';

const supabase = getBrowserSupabase();
if (!supabase) return; // Handle null case gracefully

// Use for client-side auth operations
await supabase.auth.signInWithPassword({ email, password });
```

**Characteristics**:
- Returns `SupabaseClient | null`
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Handles null case gracefully (no throw, no mock)
- Singleton pattern with caching
- Used in: AuthContext, sign-in/sign-up pages

### 2. Server Admin Client (API Routes - Admin Operations)
```typescript
// lib/supabase/index.ts
export { getServerSupabaseAdmin } from './server';

// Usage in API routes
import { getServerSupabaseAdmin } from '@/lib/supabase';

const supabase = getServerSupabaseAdmin();
if (!supabase) {
  return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
}

// Use for admin operations (bypasses RLS)
await supabase.from('users').select('*');
```

**Characteristics**:
- Returns `SupabaseClient | null`
- Uses `SUPABASE_SERVICE_ROLE_KEY` (admin key)
- Bypasses Row Level Security (RLS)
- Used in: Auth callbacks, webhooks, admin operations

### 3. Server Anon Client (API Routes - RLS-Respecting)
```typescript
// lib/supabase/index.ts
export { getServerSupabaseAnon } from './server';

// Usage in API routes
import { getServerSupabaseAnon } from '@/lib/supabase';

const supabase = getServerSupabaseAnon();
if (!supabase) {
  return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
}

// Use for operations that should respect RLS
await supabase.from('public_data').select('*');
```

**Characteristics**:
- Returns `SupabaseClient | null`
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Respects Row Level Security (RLS)
- Used in: Public API endpoints, health checks

## Health Check Endpoint

### `/api/health/auth` - Authentication System Health
```typescript
// app/api/health/auth/route.ts
export async function GET(request: NextRequest) {
  // 1. Validate environment variables
  const validation = validateEnvSafe();
  
  // 2. Test Supabase connectivity
  const supabase = getServerSupabaseAnon();
  let supabaseOk = false;
  if (supabase) {
    try {
      const { error } = await supabase.rpc('now');
      supabaseOk = !error;
    } catch (error) {
      supabaseOk = false;
    }
  }
  
  // 3. Test network connectivity
  const networkCheck = await testSupabaseConnectivity(url, anonKey);
  
  // 4. Return comprehensive health status
  return NextResponse.json({
    ok: overallOk,
    checks: {
      env: { urlOk, anonPrefixOk, serviceRolePrefixOk },
      network: { authReachable: true, status: 200 },
      supabase: { connected: supabaseOk }
    },
    meta: { url, anonKeyRedacted, serviceKeyRedacted }
  });
}
```

**Response Format**:
```json
{
  "ok": true,
  "checks": {
    "env": {
      "urlOk": true,
      "anonPrefixOk": true,
      "serviceRolePrefixOk": true
    },
    "network": {
      "authReachable": true,
      "status": 200
    },
    "supabase": {
      "connected": true
    }
  },
  "meta": {
    "url": "https://your-project.supabase.co",
    "anonKeyRedacted": "eyJ...****",
    "serviceKeyRedacted": "eyJ...****"
  }
}
```

## Environment Variables

### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Alternative key names (supported for flexibility)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...your-anon-key  # Alias for ANON_KEY
SUPABASE_URL=https://your-project.supabase.co             # Alias for NEXT_PUBLIC_SUPABASE_URL
SUPABASE_ANON_KEY=eyJ...your-anon-key                     # Alias for NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Authentication Methods

### 1. Password Authentication
```typescript
// AuthContext.tsx
const signIn = async (email: string, password: string) => {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};
```

### 2. Magic Link (OTP) Authentication
```typescript
// AuthContext.tsx
const signInWithOtp = async (email: string) => {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};
```

### 3. OAuth Authentication (Google)
```typescript
// AuthContext.tsx
const signInWithOAuth = async (provider: 'google') => {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  if (error) throw error;
  return data;
};
```

## Role-Based Routing

### Dashboard Routing Logic
```typescript
// lib/auth/roles.ts
export const routeForRole = (role: string): string => {
  switch (role) {
    case 'founder': return '/dashboard/founder';
    case 'vip': return '/dashboard/vip';
    case 'heir': return '/dashboard/heir';
    default: return '/dashboard/user';
  }
};
```

### Auth Callback Implementation
```typescript
// app/auth/callback/page.tsx
export default async function AuthCallbackPage({ searchParams }) {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) return redirect('/sign-in');
  
  // Exchange code for session
  if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    if (error) return redirect('/sign-in?error=callback_failed');
  }
  
  // Get user and role
  const { user, role } = await getUserAndRole(supabase);
  if (!user) return redirect('/sign-in');
  
  // Redirect based on role
  const roleRoute = routeForRole(role);
  return redirect(roleRoute);
}
```

## Error Handling

### Common Error Scenarios
1. **Supabase Not Configured**: Returns null, handled gracefully
2. **Network Issues**: Caught in try/catch blocks
3. **Invalid Credentials**: Handled by Supabase auth
4. **Callback Failures**: Redirected to sign-in with error parameter

### Error Response Format
```typescript
// API routes
if (!supabase) {
  return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
}

// Components
const supabase = getBrowserSupabase();
if (!supabase) {
  console.warn('Supabase not configured');
  return;
}
```

## Security Considerations

1. **Service Role Key**: Never exposed to browser, only used server-side
2. **RLS Respect**: Use appropriate client for operation type
3. **Environment Variables**: Properly configured and validated
4. **Error Handling**: No sensitive information leaked in errors
5. **Health Checks**: Comprehensive monitoring of auth system

## Testing the Auth Flow

### Manual Testing Steps
1. Visit `/sign-in`
2. Enter email and click "Magic Link"
3. Check email for confirmation link
4. Click link → should redirect to `/auth/callback`
5. Should end up at appropriate dashboard based on role

### Health Check Testing
```bash
curl https://your-domain.com/api/health/auth
# Should return 200 with comprehensive health status
```

### Environment Validation
```bash
curl https://your-domain.com/api/env-check
# Should validate all required environment variables
```