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

## 7) Live Probe Results – 2025-10-14

| Check | Local | Prod | Notes |
| --- | --- | --- | --- |
| Supabase connectivity | FAIL | FAIL | Prod `_probe` 404; local dev not running |
| Stripe keys presence | FAIL | FAIL | Prod `_probe` 404; cannot assess keys |
| SKU resolution | FAIL | FAIL | Prod `_probe` 404; unresolved due to missing probe |
| Auth session cookie | FAIL | FAIL | Prod `_probe` 404; local dev not running |
| Feature flags | FAIL | FAIL | Prod `_probe` 404; local dev not running |
| Core routes present | n/a | PASS | GET /api/stripe/webhook → 405; HEAD/GET /api/checkout → 405 |

Artifacts: see `analysis/PROBE_SUMMARY.md` for JSON paths.

### Top 5 fixes (if any fail)

- Ensure `NEXT_PUBLIC_SUPABASE_URL` points to Live project URL and `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches Live.
- Add `SUPABASE_SERVICE_ROLE_KEY` (Live) to server env (build + runtime).
- Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` correctly (Live mode expected for production).
- Add `STRIPE_WEBHOOK_SECRET` (Live) and verify Stripe webhook points to `/api/stripe/webhook`.
- If `rlsBlocked: true`, review RLS policies for `profiles`, `subscriptions`, `skillsmith_orders`, `payment_events` and adapt the suggested SQL.

### Remove me later (temporary probes)

- `app/api/_probe/env/route.ts`
- `app/api/_probe/supabase/route.ts`
- `app/api/_probe/auth/route.ts`
- `app/api/_probe/stripe/route.ts`
