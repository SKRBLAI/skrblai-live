# Site Version Cutover (Phase A)

- **Scope**: Frontend only. No changes to env files, server auth, Supabase/Clerk, or unrelated APIs.
- **Goal**: Safely run `/legacy` and `/new` in parallel, with a root rewrite based on a canonical flag registry.

## Canonical Flag Registry
- Source: `lib/config/featureFlags.ts`
- Flags read (with deprecation support):
  - `FF_BOOST` (deprecated mirrors: `NEXT_PUBLIC_FF_USE_BOOST`)
  - `FF_CLERK` (deprecated mirrors: `NEXT_PUBLIC_FF_CLERK`)
  - `FF_N8N_NOOP` (deprecated mirrors: `NEXT_PUBLIC_FF_N8N`)
  - `FF_SITE_VERSION` ∈ `legacy | new` (deprecated mirrors: `NEXT_PUBLIC_SITE_VERSION`, `NEXT_PUBLIC_FF_SITE_VERSION`)
- Helpers:
  - `isBoost()`
  - `isClerk()`
  - `isN8nNoop()`
  - `siteVersion()`
- Dev-only updater: `__devSetFlags(patch)` (no env reads in components)

### Back-compat re-export
- `lib/flags/siteVersion.ts`
  - `export { siteVersion }` and `export type { SiteVersion }`

## Root Split Routing
- File: `middleware.ts`
- Config: `export const config = { matcher: ['/'] }`
- Logic:
  - If `pathname !== '/'` → pass-through
  - Else rewrite to `'/new'` when `siteVersion() === 'new'`, otherwise to `'/legacy'`

## Diagnostics (Dev Only)
- Hook: `lib/diag/usePlatformDiag.ts`
  - Reads `window.__PLATFORM_DIAG__` if present
  - Falls back to `GET /ops/diag` (dev-only route)
  - Optionally reflects hints into registry via `__devSetFlags()`
- Banner: Small fixed badge in `app/(legacy)/layout.tsx` and `app/(new)/layout.tsx`
  - Visible only when `NODE_ENV !== 'production'`
  - Shows: `DEV • {legacy|new}`

## Stripe Price Access
- Helper: `lib/pricing/getPriceId.ts`
  - Reads a single `NEXT_PUBLIC_PRICE_MAP_JSON`
  - Returns `string | undefined` in prod
  - Throws helpful errors in dev when map is missing/invalid or key not found
- All runtime UI lookups should call `getPriceId(key)` instead of `process.env.NEXT_PUBLIC_STRIPE_PRICE_*`.

## How to Flip Versions
- Set `FF_SITE_VERSION=legacy | new` (or use deprecated mirrors during transition)
- No component should read env directly; use helpers only

## Test Plan
- Root rewrite: visit `/` → confirm rewrite to `/legacy` or `/new` based on `FF_SITE_VERSION`
- Dev banner: visible in non-prod on both `/legacy` and `/new`
- Price lookup: pages/components should call `getPriceId()` (no direct `NEXT_PUBLIC_STRIPE_PRICE_*` reads)

## File Map
- `lib/config/featureFlags.ts` (registry + helpers)
- `lib/flags/siteVersion.ts` (re-export)
- `middleware.ts` (root-only rewrite)
- `lib/diag/usePlatformDiag.ts` (diagnostics)
- `app/(legacy)/**` and `app/(new)/**` (layouts + pages with dev badge)
- `lib/pricing/getPriceId.ts` (Stripe price helper)

## Notes
- No visual changes in production (banner is dev-only)
- Helpers are tiny and tree-shake friendly; no dynamic imports added
