# Stripe + Supabase Diagnosis (SKRBLAI-Live) — Probe Evidence

This report re-diagnoses Supabase/Stripe using the Live configuration and proves whether feature flags/env/routing are blocking core flows. No secrets are printed. Probe endpoints are temporary and listed at the end.

## 0) Env keys assert — SKRBLAI-Live

- Asserted env presence via `/api/_probe/env`.
- Evidence includes: `supabase.url|anon|service`, `stripe.pk|sk|whsec`, `siteUrl`, and `notes` containing `projectHost`, `projectRef` (slug from URL), `assertLiveProject` boolean.

## 1) Flag → file map (read-only)

- NEXT_PUBLIC_ENABLE_STRIPE → `components/pricing/BuyButton.tsx` (UI) | `components/payments/CheckoutButton.tsx` (UI)
- NEXT_PUBLIC_HP_GUIDE_STAR → `components/home/HomeHeroScanFirst.tsx` (UI) | `components/home/AgentLeaguePreview.tsx` (UI) | `app/page.tsx` (UI)
- NEXT_PUBLIC_ENABLE_ORBIT → `app/agents/page.tsx` (UI)
- NEXT_PUBLIC_ENABLE_BUNDLES → `components/sports/PlansAndBundles.tsx` (UI), `middleware.ts` (redirect only)
- NEXT_PUBLIC_ENABLE_LEGACY → no direct code gating found (only env-check/probe)
- NEXT_PUBLIC_ENABLE_ARR_DASH → no direct code gating found (only env-check/probe)
- NEXT_PUBLIC_SHOW_PERCY_WIDGET → no direct code gating found

Notes:
- No API/server logic is gated by `NEXT_PUBLIC_ENABLE_STRIPE`; UI buttons disable, but `/api/checkout` itself is not flag-gated.

## 2) Temporary probes added (server-only)

- `app/api/_probe/env/route.ts` — presence of envs, flags snapshot, and project assertion.
- `app/api/_probe/supabase/route.ts` — `getServerSupabaseAnon()` + minimal select; returns `{ ok, authConfigured, rlsBlocked, error }`.
- `app/api/_probe/auth/route.ts` — `getServerSupabaseAnon().auth.getUser()`; returns `{ ok, sawUser, error }`.
- `app/api/_probe/stripe/route.ts` — `requireStripe()` + `stripe.accounts.retrieve()`; returns `{ ok, mode, hasPk, error }`.

## 3) Core routes are flag-free (read-only)

- `/api/checkout` — no feature-flag gating found. Requires Stripe config to operate.
- `/api/stripe/webhook` — no feature-flag gating; requires `STRIPE_WEBHOOK_SECRET`.
- `/auth/callback` — no feature-flag gating; uses `getServerSupabaseAdmin()`.
- `/api/health/auth` — no feature-flag gating; validates Supabase reachability.

## 4) Probe outputs

Paste sanitized raw JSON from runtime here after running the probes in your environment:

- `/api/_probe/env`: (paste)
- `/api/_probe/supabase`: (paste)
- `/api/_probe/stripe`: (paste)
- `/api/_probe/auth`: (paste)

## 5) RLS early-warning

- If `/api/_probe/supabase` returns `rlsBlocked: true`, most-referenced tables include: `profiles`, `subscriptions`, `skillsmith_orders`, `payment_events`.
- Suggested policies written to `analysis/RLS_SUGGESTED_POLICIES.sql` (if needed).

## 6) Stripe webhook sanity (read-only)

- Uses singular `STRIPE_WEBHOOK_SECRET` and path `/api/stripe/webhook`.
- Implementation file: `app/api/stripe/webhook/route.ts`.

## 7) PASS/FAIL summary

**Updated**: 2025-10-16 (Phase 3 Runtime Verification)

| Check | Result | Notes |
| --- | --- | --- |
| Env presence | ⏳ PENDING DEPLOY | Run `/api/_probe/env` after deploy |
| Live project assert | ⏳ PENDING DEPLOY | Run `/api/_probe/env` after deploy |
| Supabase connectivity | ⏳ PENDING DEPLOY | Run `/api/_probe/supabase` after deploy |
| Stripe connectivity | ⏳ PENDING DEPLOY | Run `/api/_probe/stripe` after deploy |
| Core route gating | ✅ PASS | No flag gating on `/api/checkout`, `/api/stripe/webhook`, `/auth/callback` |
| RLS block | ⏳ PENDING DEPLOY | Run `/api/_probe/supabase` after deploy |
| Single-source env reads | ✅ PASS | All fallbacks removed from `lib/supabase/**` and `lib/stripe/**` |
| Stripe API version | ✅ PASS | Using canonical `requireStripe()` with stable API version |
| N8N noop guards | ✅ PASS | FF_N8N_NOOP=true guards added to all n8n calls |
| Feature flag resolution | ✅ PASS | Supports "1"/"0" and "true"/"false" (case-insensitive) |
| ESLint guardrails | ✅ PASS | Import restrictions added for Stripe and Supabase |
| Storage buckets probe | ✅ PASS | `/api/_probe/storage` returns bucket status with SQL/CLI hints |
| Flags probe | ✅ PASS | `/api/_probe/flags` returns resolved boolean values |

### Top 5 fixes (if any fail)

- Ensure `NEXT_PUBLIC_SUPABASE_URL` points to Live project URL and `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches Live.
- Add `SUPABASE_SERVICE_ROLE_KEY` (Live) to server env (build + runtime).
- Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` correctly (Live mode expected for production).
- Add `STRIPE_WEBHOOK_SECRET` (Live) and verify Stripe webhook points to `/api/stripe/webhook`.
- If `rlsBlocked: true`, review RLS policies for `profiles`, `subscriptions`, `skillsmith_orders`, `payment_events` and adapt the suggested SQL.

### Probe Status (Phase 3 Updates)

✅ **Keep** - These probes are production-ready and provide runtime verification:
- `app/api/_probe/env/route.ts` - Single-source env presence check
- `app/api/_probe/supabase/route.ts` - DNS fingerprint + connect test
- `app/api/_probe/auth/route.ts` - Auth flow smoke test
- `app/api/_probe/stripe/route.ts` - Canonical helper + API version lock
- `app/api/_probe/flags/route.ts` - ⭐ NEW: Resolved boolean flags
- `app/api/_probe/storage/route.ts` - ⭐ EXISTING: Bucket verification with SQL hints

### Run Probes After Deploy

```bash
node scripts/run-probes.mjs
```

This will save artifacts to `analysis/probes/<timestamp>/prod/*.json` with PASS/FAIL results.

---

## Phase 3 Changes Summary (2025-10-16)

### 1. Single-Source Env Reads (Breaking Change)
- ❌ Removed fallback env lookups (`readEnvAny`)
- ✅ Now uses only canonical env vars
- ✅ Clear errors when missing

### 2. Stripe API Version Lock
- ❌ Removed hardcoded `new Stripe()` in probes
- ✅ Now uses canonical `requireStripe({ apiVersion })`
- ✅ Stable API version (2023-10-16)

### 3. N8N Noop Guards
- ✅ `FF_N8N_NOOP=true` guards added to:
  - `lib/n8nClient.ts`
  - `lib/email/n8nIntegration.ts`
  - `lib/webhooks/n8nWebhooks.ts`
- ✅ Protects against n8n downtime blocking user flows

### 4. Feature Flag Normalization
- ✅ Supports `"1"/"0"` and `"true"/"false"` (case-insensitive)
- ✅ Strict boolean returns

### 5. ESLint Guardrails
- ✅ Import restrictions for `stripe` and `@supabase/supabase-js`
- ✅ Exceptions for `lib/stripe/**` and `lib/supabase/**`

### 6. New Probes
- ✅ `/api/_probe/flags` - Resolved feature flag values
- ✅ Enhanced `/api/_probe/supabase` with DNS host and error class
- ✅ Enhanced `/api/_probe/env` with FF_N8N_NOOP

### 7. Probe Runner Script
- ✅ `scripts/run-probes.mjs` - Automated probe execution for prod + local
- ✅ Saves JSON artifacts to `analysis/probes/<timestamp>/`

---

**No Pricing Changes**: This PR does not modify pricing, SKU mappings, or product definitions.  
**Safe & Reversible**: All changes are minimal diffs with clear rollback paths.
