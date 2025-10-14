# Live Probe Summary (Phase-2)

Artifacts are organized per timestamp under `analysis/probes/<DATE>/`.

- Local endpoints: failed to connect (dev not running)
- Production endpoints: site reachable; `_probe/*` return 404 (not deployed on prod build yet)
- Webhook/Checkout presence (prod): GET /api/stripe/webhook → 405 (present), HEAD/GET /api/checkout → 405 (present)

## Artifacts
- analysis/probes/2025-10-14T22-01-21/local/env.json
- analysis/probes/2025-10-14T22-01-21/local/supabase.json
- analysis/probes/2025-10-14T22-01-21/local/stripe.json
- analysis/probes/2025-10-14T22-01-21/local/auth.json
- analysis/probes/2025-10-14T22-01-21/local/flags.json
- analysis/probes/2025-10-14T22-01-21/prod/env.json
- analysis/probes/2025-10-14T22-01-21/prod/supabase.json
- analysis/probes/2025-10-14T22-01-21/prod/stripe.json
- analysis/probes/2025-10-14T22-01-21/prod/auth.json
- analysis/probes/2025-10-14T22-01-21/prod/flags.json

## Findings
- Supabase connectivity: Unknown (prod `_probe` missing); local not running
- Stripe keys presence: Unknown (prod `_probe` missing)
- SKU resolution: Unknown (prod `_probe` missing)
- Auth session cookie: Unknown (prod `_probe` missing)
- Feature flags: Unknown (prod `_probe` missing)
- Routes present on prod: `GET /api/stripe/webhook` → 405; `HEAD/GET /api/checkout` → 405

Note: Once this PR deploys, re-run `scripts/run-probes.mjs` to capture real prod runtime JSON.
