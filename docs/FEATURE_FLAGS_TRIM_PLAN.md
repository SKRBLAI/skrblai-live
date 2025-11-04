# Feature Flags Trim Plan

Generated: 2025-11-02

## Target End State
- **Retain** `FF_BOOST`, `FF_CLERK`, `FF_SITE_VERSION`, `FF_N8N_NOOP` as the canonical platform flags.
- **Fold or remove** all other application flags into these four pillars or static configuration.
- **Document** any temporary overrides in deployment runbooks instead of new env keys.

## Legacy Flag Review
| Flag | Proposed Action | Rationale | Effort | Risk |
| --- | --- | --- | --- | --- |
| `FF_USE_BOOST_FOR_AUTH` | Fold → `FF_BOOST` | Duplicates Boost auth toggle; ensure boost helper uses `FF_BOOST` only | S | Low |
| `NEXT_PUBLIC_FF_CLERK` | Fold → `FF_CLERK` | Mirror of server flag; convert client code to call registry helper | M | Medium |
| `NEXT_PUBLIC_ENABLE_STRIPE` | Defer | Acts as kill-switch for payments; keep until Stripe parity confirmed | S | High |
| `NEXT_PUBLIC_HP_GUIDE_STAR` | Remove | Marketing-only toggle; use content config instead | S | Low |
| `NEXT_PUBLIC_ENABLE_ORBIT` | Remove | Legacy Orbit experiment; no active usage | S | Low |
| `NEXT_PUBLIC_ENABLE_BUNDLES` | Fold → `FF_SITE_VERSION` | Legacy pricing routes go behind legacy shell | M | Medium |
| `NEXT_PUBLIC_ENABLE_LEGACY` | Fold → `FF_SITE_VERSION` | Consolidate legacy UI gates under site version | M | Medium |
| `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS` | Fold → `FF_BOOST` | Payment fallback tied to Boost pipeline readiness | M | Medium |
| `NEXT_PUBLIC_SHOW_PERCY_WIDGET` | Remove | Marketing CTA; convert to CMS flag | S | Low |
| `NEXT_PUBLIC_USE_OPTIMIZED_PERCY` | Remove | Optimized variant now default; keep telemetry only | S | Low |
| `NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS` | Remove | Non-critical animation toggle | S | Low |
| `NEXT_PUBLIC_ENABLE_PERCY_AVATAR` | Remove | Visual polish toggle; move to design tokens | S | Low |
| `NEXT_PUBLIC_ENABLE_PERCY_CHAT` | Fold → `FF_SITE_VERSION` | Chat experience should align with site shell | M | Medium |
| `NEXT_PUBLIC_ENABLE_PERCY_SOCIAL_PROOF` | Remove | Replace with CMS-driven slotting | S | Low |
| `NEXT_PUBLIC_PERCY_PERFORMANCE_MONITORING` | Remove | Convert to observability setting, not feature flag | M | Medium |
| `NEXT_PUBLIC_PERCY_AUTO_FALLBACK` | Remove | Legacy guard; ensure new shell graceful before deletion | S | Low |
| `NEXT_PUBLIC_PERCY_LOG_SWITCHES` | Remove | Logging should rely on structured telemetry | S | Low |
| `NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE` | Fold → `FF_SITE_VERSION` | Homepage variant shipped with new site shell | M | Medium |
| `NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN` | Remove | Product baseline now includes enhancement | S | Low |
| `NEXT_PUBLIC_URGENCY_BANNERS` | Remove | Marketing handles via CMS scheduling | S | Low |
| `NEXT_PUBLIC_LIVE_METRICS` | Remove | Replace with analytics-driven rendering rules | M | Medium |
| `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | Fold → `FF_SITE_VERSION` | Hero variant maps to site version; keep for transition then delete | M | Medium |
| `NEXT_PUBLIC_SUPABASE_URL_BOOST` | Defer | Required for Boost env; confirm before consolidation | S | High |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST` | Defer | See above | S | High |
| `SUPABASE_SERVICE_ROLE_KEY_BOOST` | Defer | Required for Boost admin access | S | High |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Fold → `FF_CLERK` | Only read when Clerk enabled; guard via registry helper | M | Medium |
| `CLERK_SECRET_KEY` | Fold → `FF_CLERK` | Server secret should only be consumed when Clerk flag is on | M | Medium |
| `NEXT_PUBLIC_PRICE_MAP_JSON` | Fold → `FF_SITE_VERSION` | Pricing map used by new shell only; load based on site version | M | Medium |

Effort key: **S**mall (≤0.5 day), **M**edium (1-2 days), **L**arge (>2 days).

## Migration Notes
- Update all imports to use `@/lib/config/featureFlags` helpers before flag deletions.
- Add regression checks to `/api/ops/diag` to ensure required env keys exist when flags are enabled.
- Document removed flags in release notes and clean up CI/CD secrets after rollout.

## Parallel Run Checklist
1. Set `FF_SITE_VERSION=legacy` in production until new site passes smoke tests.
2. Enable `FF_BOOST=1` and related Supabase credentials in staging, confirm `/api/ops/diag` health before flipping production.
3. Keep `FF_CLERK=0` in production while clerk routes shadow traffic; toggle to `1` only after end-to-end auth tests succeed.
4. Maintain `FF_N8N_NOOP=1` for parallel launch; disable (set to `0`) only after verifying n8n workflows in both site versions.
5. Remove legacy `NEXT_PUBLIC_ENABLE_*` toggles once the new site is default (`FF_SITE_VERSION=new`) and Percy/marketing audits sign off.

## Decommission Timeline
- **Week 1:** Migrate high-impact flags (auth/payment) to registry helpers, remove duplicate Boost/Clerk toggles.
- **Week 2:** Delete Percy/UI marketing flags after QA sign-off; archive corresponding CMS/config updates.
- **Week 3:** Remove legacy site flags and update deployment docs; prune unused env vars from secret stores.
- **Week 4:** Final audit via `npm run audit:flags`, update docs and rerun `/api/ops/diag` to confirm clean state.
