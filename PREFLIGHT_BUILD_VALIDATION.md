# SKRBL AI - Preflight Build Validation

## Overview
Local "CI" validation system that fails fast on Railway before attempting to build with missing/invalid environment variables or pricing configuration.

## Implementation Summary

### Files Created
1. **scripts/preflight.mjs** - Orchestrator that runs all validation checks
2. **scripts/validate-env.mjs** - Validates required environment variables (Boost-first)
3. **scripts/validate-pricing.mjs** - Validates pricing configuration and checks for hardcoded references

### package.json Changes
```json
"scripts": {
  "preflight": "node scripts/preflight.mjs",
  "build": "npm run preflight && cross-env NODE_OPTIONS=--max-old-space-size=4096 next build"
}
```

## Validation Checks

### Environment Variables (validate-env.mjs)
**Required:**
- `FF_BOOST` - Feature flag for Boost mode
- `FF_CLERK` - Feature flag for Clerk auth
- `FF_SITE_VERSION` - Site version feature flag
- `FF_N8N_NOOP` - N8N no-op feature flag
- `NEXT_PUBLIC_PRICE_MAP_JSON` - JSON price map configuration
- `NEXT_PUBLIC_SUPABASE_URL_BOOST` - Supabase URL (Boost)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST` - Supabase anon key (Boost)
- `SUPABASE_SERVICE_ROLE_KEY_BOOST` - Supabase service role key (Boost)
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `STRIPE_SECRET_KEY` - Stripe secret key

**Optional:**
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (logged if present)

**Additional Validation:**
- Parses `NEXT_PUBLIC_PRICE_MAP_JSON` to ensure it's valid JSON

### Pricing Configuration (validate-pricing.mjs)
**Deny-list Check:**
- Greps through `app/`, `components/`, `lib/`, `contexts/`, `hooks/` directories
- Fails if any hardcoded `NEXT_PUBLIC_STRIPE_PRICE_` references are found
- Ensures all pricing uses the centralized `NEXT_PUBLIC_PRICE_MAP_JSON`

**Required Price Keys:**
- `legacy.fusion` - Legacy Fusion price ID
- `early.fusion.monthly` - Early Fusion monthly price ID
- `early.fusion.annual` - Early Fusion annual price ID

## Usage

### Run Preflight Check Only
```bash
npm run preflight
```

### Run Build (includes preflight)
```bash
npm run build
```

## Behavior

### Success Case
```
🚀 SKRBL AI - Preflight Build Validation

============================================================
  Environment Variables
============================================================

🔍 Validating environment variables...

✅ NEXT_PUBLIC_PRICE_MAP_JSON is valid JSON
✅ PASS: All 11 required environment variables present

============================================================
  Pricing Configuration
============================================================

🔍 Checking for hardcoded STRIPE_PRICE_ references...

✅ No hardcoded STRIPE_PRICE_ references found

🔍 Validating NEXT_PUBLIC_PRICE_MAP_JSON structure...

✅ PASS: All required price keys present:
   - legacy.fusion: price_xxxxx
   - early.fusion.monthly: price_yyyyy
   - early.fusion.annual: price_zzzzz

============================================================
✅ PREFLIGHT PASSED: All checks successful
============================================================
```

### Failure Case
```
🚀 SKRBL AI - Preflight Build Validation

============================================================
  Environment Variables
============================================================

🔍 Validating environment variables...

❌ FAIL: Missing required environment variables:

   - FF_BOOST
   - CLERK_SECRET_KEY
   - STRIPE_SECRET_KEY

============================================================
❌ PREFLIGHT FAILED: Fix issues above before building
============================================================

# Exit code: 1
```

## Railway Integration

When Railway runs `npm run build`:
1. Preflight checks run first
2. If any check fails, build stops immediately with exit code 1
3. Railway deployment fails fast without wasting build time
4. Clear error messages show exactly what's missing

## Benefits

✅ **Fast Failure** - Catches configuration issues before Next.js build starts
✅ **Clear Errors** - Explicit messages about what's wrong
✅ **No GitHub Actions** - Pure Node.js scripts, works anywhere
✅ **Cost Effective** - Fails in seconds vs. minutes of build time
✅ **Maintainable** - Easy to add new validation rules

## Testing

The implementation has been verified to:
- ✅ Fail correctly when environment variables are missing
- ✅ Integrate properly with the build script
- ✅ Provide clear, actionable error messages
- ✅ Support both standalone and build-integrated execution

## Date
Implemented: 2025-11-04
Branch: cursor/local-preflight-build-validation-4877
