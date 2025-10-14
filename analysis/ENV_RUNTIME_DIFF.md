# ENV Runtime Diff (Phase-2)

Purpose: compare what runtime sees (via `/api/_probe/env`) vs expected variable names in `.env.*` samples.

Current status:
- Local runtime: server not running; no data captured.
- Production runtime: `_probe` routes not yet deployed in prod, 404 returned by site. Cannot capture fingerprints.

Action once deployed:
1) Re-run `node scripts/run-probes.mjs`.
2) Open `analysis/probes/<DATE>/prod/env.json`.
3) For any missing keys in `supabase|stripe|site`, add variables in Railway/hosting:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_SITE_URL

Note: Never paste secrets in docs. Use boolean presence and fingerprints only.
