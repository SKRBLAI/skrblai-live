## v2 acceptance checklist

- [ ] Probes PASS in prod (`/api/_probe/v2/*` return ok:true)
- [ ] Sign-in roundtrip via magic link: `/v2/auth/sign-in` → `/v2/auth/callback` → `/v2/dashboard`
- [ ] Checkout session created via `/api/v2/checkout` and redirects to Stripe
- [ ] Webhook receives event (`checkout.session.completed` or `customer.subscription.*`) and stores a record in `billing_events`
- [ ] Pricing page shows 6 plans; buttons enabled only when price IDs exist
- [ ] No imports from legacy/archived/utils/feature flags in any `app/v2/**`
- [ ] Single rewrite can map `/` → `/v2` to switch traffic
