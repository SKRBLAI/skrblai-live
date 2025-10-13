# SKRBL AI Infrastructure Interlink Diagnostic Report (Corrected)

## 🧩 Interlink Map Summary (Supabase ↔ Stripe ↔ Flags)

| System | Client Created | Env Present | UI Responding | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Supabase** | ✅ | 🔴 | 🔴 | Fails at runtime if server-only keys are missing. `getServerSupabaseAdmin` requires `SUPABASE_SERVICE_ROLE_KEY`, which is a common point of failure. |
| **Stripe** | ✅ | 🔴 | 🔴 | Fails at runtime if `STRIPE_SECRET_KEY` is missing or if specific Price ID envs are not set, breaking checkout. |
| **Feature Flags** | ✅ | 🟡 | 🟡 | UI components are hidden due to `false` or missing flags. Parsing of `true` vs `1` can lead to inconsistencies. |

## ⚙️ Detected Breakpoints

### Supabase
- **🔴 Critical Security Risk in Configuration**: The `getServerSupabaseAdmin` client requires the `SUPABASE_SERVICE_ROLE_KEY`. This key is a secret and must only be available on the server. The `getBrowserSupabase` client uses public keys (`NEXT_PUBLIC_*`). Any attempt to unify them would expose the service role key, creating a major security vulnerability.
- **🔴 Failing Server-Side Operations**: Any API route or server component that relies on `getServerSupabaseAdmin` will fail if the `SUPABASE_SERVICE_ROLE_KEY` is not set in the production environment. This affects numerous critical paths, including most AI agent functions and authentication helpers.

### Stripe
- **🔴 Checkout Failures due to Missing Price IDs**: The `/api/checkout` route depends on `resolvePriceIdFromSku`, which resolves product SKUs to Stripe Price IDs using environment variables (e.g., `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER`). If these variables are not set in the production environment, the checkout process will fail with a 422 error.
- **🔴 Webhook Failures**: The `/api/stripe/webhook` route will fail with a 503 error if the `STRIPE_WEBHOOK_SECRET` is not configured, preventing the application from receiving critical updates about payments and subscriptions.

### Feature Flags
- **🔴 Hard-Gated Routes**: The `app/dashboard/analytics/internal/page.tsx` component is hard-gated by the `FEATURE_FLAGS.ENABLE_ARR_DASH` flag. If this flag is `false`, the component returns a 404, completely hiding the route instead of gracefully disabling features.
- **🟡 Hidden UI Components**: Several components are hidden or disabled based on feature flags, which may be the reason they don't appear in production:
    - The **Orbit animation** on `/agents/page.tsx` is hidden if `FEATURE_FLAGS.ENABLE_ORBIT` is `false`.
    - **Pricing bundles** on `/sports/page.tsx` are not displayed if `FEATURE_FLAGS.ENABLE_BUNDLES` is `false`.
    - **All Stripe payment buttons** (e.g., `components/pricing/BuyButton.tsx`) are disabled if `FEATURE_FLAGS.ENABLE_STRIPE` is `false`.
- **🟡 Inconsistent Boolean Parsing**: The `readBooleanFlag` function parses environment variables as `"true"` or `"1"`. Production environments might set these as `true` (without quotes), which would be incorrectly parsed as `false`.

## 🩺 Likely Root Causes

- **Incorrect Environment Variable Management**: The primary root cause is a discrepancy between the environment variables defined in local `.env` files and those set in the production environment (e.g., Railway, Vercel). Server-only secrets like `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are likely missing or incorrect in the production server environment.
- **Incomplete Feature Flag Configuration**: UI elements and even entire routes are missing because the corresponding feature flags (e.g., `NEXT_PUBLIC_ENABLE_ARR_DASH`, `NEXT_PUBLIC_ENABLE_ORBIT`) are not enabled in the production environment.
- **Brittle Configuration Parsing**: The system is not robust enough to handle variations in how boolean values (`true` vs `"true"`) are set in different environments.

## 🧠 Recommended Fix Order (1–5)

1.  **Correctly Configure Supabase Environment Variables**: **DO NOT** unify the environment variables. The `getServerSupabaseAdmin` client **must** use the `SUPABASE_SERVICE_ROLE_KEY` on the server, and this key must **NEVER** be exposed to the client. The `getBrowserSupabase` client **must** use the public `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The fix is to ensure that these distinct variables are correctly set in their respective environments (e.g., Railway for server-side, Vercel for client-side).
2.  **Add Missing Stripe Price ID Variables**: Audit all SKUs in the `getSupportedSkus()` function from `lib/stripe/priceResolver.ts` and ensure that a corresponding `NEXT_PUBLIC_STRIPE_PRICE_*` environment variable is set in the production environment for each one.
3.  **Adjust `readBooleanFlag` for Robust Parsing**: Modify the `readBooleanFlag` function in `lib/config/featureFlags.ts` to correctly handle more boolean variations. It should be updated to accept `'true'`, `'1'`, `true`, and `1` as affirmative values.
4.  **Enable Required Feature Flags in Production**: Review the list of feature flags and enable the ones necessary for production functionality, such as `NEXT_PUBLIC_ENABLE_STRIPE`, `NEXT_PUBLIC_ENABLE_ORBIT`, and `NEXT_PUBLIC_HP_GUIDE_STAR`, by setting them to `true` in the production environment configuration.
5.  **Remove Hard Gate on Analytics Route**: Refactor `app/dashboard/analytics/internal/page.tsx` to show a disabled or "coming soon" state if the `FEATURE_FLAGS.ENABLE_ARR_DASH` is `false`, instead of returning a 404. This provides a better user experience.
