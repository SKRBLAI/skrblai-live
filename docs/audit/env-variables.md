# SKRBL AI Environment Variables

## Supabase Configuration

| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | lib/supabase/client.ts, lib/env.ts | HTTPS URL ending with .supabase.co | https://your-project.supabase.co | Required, must be valid HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | lib/supabase/client.ts, lib/env.ts | String starting with "sbp_" or "sb_publishable_" | sbp_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Required for client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | lib/supabase/server.ts, lib/env.ts | String starting with "sbs_" or "sb_secret_" | sbs_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Required for server-side Supabase operations |

## Stripe Configuration

| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | components/payments/CheckoutButton.tsx | String starting with "pk_" | pk_test_123456789 | Required for client-side Stripe checkout |
| `STRIPE_SECRET_KEY` | Server | lib/stripe/client.ts | String starting with "sk_" | sk_test_123456789 | Required for server-side Stripe operations |
| `STRIPE_WEBHOOK_SECRET` | Server | app/api/stripe/webhook/route.ts | String starting with "whsec_" | whsec_123456789 | Required for webhook validation |

## Twilio Configuration

| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| `TWILIO_ACCOUNT_SID` | Server | lib/sms/client.ts | String starting with "AC" | AC123456789 | Required for Twilio SMS service |
| `TWILIO_API_KEY_SID` | Server | lib/sms/client.ts | String starting with "SK" | SK123456789 | Required for Twilio API authentication |
| `TWILIO_API_KEY_SECRET` | Server | lib/sms/client.ts | String | 123456789 | Required for Twilio API authentication |

## n8n Configuration

| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| `N8N_WEBHOOK_URL` | Server | lib/n8n/client.ts | HTTPS URL | https://your-n8n-instance.com/webhook | Required for n8n workflow triggers |

## Hostinger Configuration

| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| `HOSTINGER_API_TOKEN` | Server | lib/hostinger/client.ts | String | abc123xyz | Required for Hostinger API access |

## App URLs

| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| `NEXT_PUBLIC_SITE_URL` | Client | lib/url.ts | URL | https://skrblai.io | Used for link generation |
| `NEXT_PUBLIC_BASE_URL` | Client | lib/url.ts | URL | https://skrblai.io | Used for link generation |
| `APP_BASE_URL` | Server | lib/url.ts | URL | https://skrblai.io | Server-side URL generation |

## Feature Flags

| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| `NEXT_PUBLIC_HP_GUIDE_STAR` | Client | app/page.tsx | '1' or '0' | '1' | Controls AgentLeaguePreview display |
| `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | Client | app/page.tsx | 'scan-first' or 'split' | 'scan-first' | Controls homepage hero component |
| `NEXT_PUBLIC_ENABLE_STRIPE` | Client | components/payments/CheckoutButton.tsx | '1' or '0' | '1' | Enables/disables Stripe integration |

## Validation Endpoint

The `/api/env-check` endpoint can be used to validate environment variable configuration. It checks:
- Supabase URL and keys
- Stripe keys
- Twilio configuration
- n8n webhook URL
- Hostinger API token

## Multi-Key Resolver Strategy

The application uses a multi-key resolver pattern for environment variables, allowing for both legacy and new format keys to be accepted. This is particularly used for Supabase keys where both `sbp_` and `sb_publishable_` prefixes are accepted for the anon key, and both `sbs_` and `sb_secret_` prefixes are accepted for the service role key.
