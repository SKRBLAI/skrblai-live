# Runtime Environment Variable Diff

**Generated**: 2025-10-16  
**Branch**: `feat/runtime-verify-and-hotfix`  
**Purpose**: Document which environment variables are read at runtime (values redacted)

---

## Canonical Environment Variables (Single-Source)

### Supabase Configuration

| Variable | Usage | Required | Notes |
|----------|-------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | ✅ Yes | Custom domain or project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | ✅ Yes | eyJ... anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | ✅ Yes | Service role key (secret) |

**Removed Fallbacks**: 
- ❌ `SUPABASE_URL` (duplicate of NEXT_PUBLIC_SUPABASE_URL)
- ❌ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (use NEXT_PUBLIC_SUPABASE_ANON_KEY)
- ❌ `SUPABASE_ANON_KEY` (use NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Stripe Configuration

| Variable | Usage | Required | Notes |
|----------|-------|----------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | ✅ Yes | pk_test_... or pk_live_... |
| `STRIPE_SECRET_KEY` | Server only | ✅ Yes | sk_test_... or sk_live_... |
| `STRIPE_WEBHOOK_SECRET` | Server only | ✅ Yes | whsec_... |

### Site Configuration

| Variable | Usage | Required | Notes |
|----------|-------|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | Client + Server | ⚠️ Recommended | Base URL for redirects |

### Feature Flags

| Variable | Usage | Default | Type |
|----------|-------|---------|------|
| `NEXT_PUBLIC_ENABLE_STRIPE` | Global Stripe toggle | `1` | boolean |
| `NEXT_PUBLIC_HP_GUIDE_STAR` | Homepage guide star | `1` | boolean |
| `NEXT_PUBLIC_ENABLE_ORBIT` | Orbit League viz | `0` | boolean |
| `NEXT_PUBLIC_ENABLE_BUNDLES` | Legacy bundle pricing | `0` | boolean |
| `NEXT_PUBLIC_SHOW_PERCY_WIDGET` | Percy widget visibility | `0` | boolean |
| `FF_N8N_NOOP` | n8n noop mode (safe default) | `1` | boolean |

**Boolean Resolution**: Supports `"1"/"0"` and `"true"/"false"` (case-insensitive)

---

## Runtime Checks

### Probes

The following probes verify runtime environment configuration:

1. **GET /api/_probe/env** - Shows presence (PRESENT/MISSING) of all env vars
2. **GET /api/_probe/supabase** - Tests Supabase connectivity with URL fingerprint
3. **GET /api/_probe/stripe** - Tests Stripe connectivity with account.retrieve()
4. **GET /api/_probe/auth** - Tests auth flow with getUser()
5. **GET /api/_probe/flags** - Shows resolved boolean flag values
6. **GET /api/_probe/storage** - Verifies storage bucket existence

---

## Changes in This Branch

### Single-Source Env Reads

**Before**:
```typescript
// lib/supabase/client.ts (old)
const url = readEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
const anonKey = readEnvAny(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 
  'SUPABASE_ANON_KEY'
);
```

**After**:
```typescript
// lib/supabase/client.ts (new)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(`Missing required environment variables`);
}
```

### Stripe API Version Lock

**Before**:
```typescript
// app/api/_probe/stripe/route.ts (old)
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
```

**After**:
```typescript
// app/api/_probe/stripe/route.ts (new)
import { requireStripe } from '@/lib/stripe/stripe';
const stripe = requireStripe({ apiVersion: '2023-10-16' });
```

### Feature Flag Normalization

**Before**:
```typescript
// lib/config/featureFlags.ts (old)
return value === '1' || value === 'true';
```

**After**:
```typescript
// lib/config/featureFlags.ts (new)
return value === '1' || value.toLowerCase() === 'true';
```

### N8N Noop Guards

Added `FF_N8N_NOOP` guards to:
- `lib/n8nClient.ts` - `triggerN8nWorkflow()`
- `lib/email/n8nIntegration.ts` - `triggerEmailSequence()`
- `lib/webhooks/n8nWebhooks.ts` - `fireWebhook()` (already had it)

---

## ESLint Guardrails

Added import restrictions in `.eslintrc.json`:

```json
{
  "patterns": [
    {
      "group": ["stripe"],
      "importNames": ["default", "Stripe"],
      "message": "Direct Stripe imports are not allowed outside of lib/stripe/**"
    }
  ]
}
```

Exceptions for:
- `lib/supabase/**/*.{ts,tsx}`
- `lib/stripe/**/*.{ts,tsx}`

---

## Deployment Checklist

Before deploying, ensure these variables are set in Railway/Vercel:

### Production (Live Mode)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` → https://auth.skrblai.io or project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → eyJ... (live project)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` → eyJ... (live project, secret)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → pk_live_...
- ✅ `STRIPE_SECRET_KEY` → sk_live_...
- ✅ `STRIPE_WEBHOOK_SECRET` → whsec_... (live mode)
- ✅ `NEXT_PUBLIC_SITE_URL` → https://skrblai.io

### Optional Flags
- `NEXT_PUBLIC_ENABLE_STRIPE=1` (default)
- `FF_N8N_NOOP=1` (default, recommended)

---

## Verification

After deployment, run:

```bash
node scripts/run-probes.mjs
```

This will:
1. Hit all 6 probe endpoints in production
2. Save JSON artifacts to `analysis/probes/<timestamp>/prod/*.json`
3. Generate a summary with PASS/FAIL status

Review the generated `analysis/probes/<timestamp>/summary.json` for any failures.

---

**Last Updated**: 2025-10-16  
**Author**: Cursor Background Agent (Phase 3 Runtime Verification)
