## v2 funnel (clean, flagless)

- Routes:
  - /v2
  - /v2/pricing
  - /v2/checkout
  - /v2/auth/sign-in
  - /v2/auth/callback
  - /v2/dashboard
- APIs:
  - /api/v2/checkout
  - /api/v2/stripe/webhook
  - /api/_probe/v2/env
  - /api/_probe/v2/supabase
  - /api/_probe/v2/stripe
  - /api/_probe/v2/auth

### Notes
- Only canonical modules are used: `@/lib/supabase`, `@/lib/stripe/stripe`, `@/lib/stripe/priceResolver`.
- Fails loudly on missing env.
- Hero and Agent grid are always visible, no feature flags.

### cURL examples

```bash
# env probe
curl -sS "$BASE/api/_probe/v2/env" | jq

# supabase admin probe
curl -sS "$BASE/api/_probe/v2/supabase" | jq

# stripe probe
curl -sS "$BASE/api/_probe/v2/stripe" | jq

# auth probe (expects cookie if signed in)
curl -sS "$BASE/api/_probe/v2/auth" | jq

# checkout
curl -sS -X POST "$BASE/api/v2/checkout" \
  -H 'content-type: application/json' \
  -d '{"sku":"sports_plan_starter"}' | jq
```

### Flip plan
- When probes pass in prod and sign-in + checkout + webhook work, add a Next.js rewrite to map `/` → `/v2`.
