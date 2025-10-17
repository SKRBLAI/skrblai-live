# Feature Flags Configuration Checklist

## How to Set Values in Railway/Vercel

### Environment Variable Format
All feature flags accept these values (case-insensitive):
- **True values:** `"1"`, `"true"`, `"yes"`, `"on"`
- **False values:** `"0"`, `"false"`, `"no"`, `"off"`
- **Whitespace:** Automatically trimmed

### Examples with 0/1 and true/false

```bash
# Using 0/1 format
NEXT_PUBLIC_ENABLE_STRIPE=1
NEXT_PUBLIC_HP_GUIDE_STAR=1
NEXT_PUBLIC_ENABLE_ORBIT=0
NEXT_PUBLIC_ENABLE_BUNDLES=0
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=0
FF_N8N_NOOP=1

# Using true/false format
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_HP_GUIDE_STAR=true
NEXT_PUBLIC_ENABLE_ORBIT=false
NEXT_PUBLIC_ENABLE_BUNDLES=false
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=false
FF_N8N_NOOP=true
```

## Critical Flags for Production

### Required (Must be set)
- `NEXT_PUBLIC_ENABLE_STRIPE=1` - Enables payment buttons
- `NEXT_PUBLIC_HP_GUIDE_STAR=1` - Enables homepage guide star

### Optional (Have sensible defaults)
- `NEXT_PUBLIC_ENABLE_ORBIT=0` - Orbit League visualization
- `NEXT_PUBLIC_ENABLE_BUNDLES=0` - Legacy bundle pricing
- `NEXT_PUBLIC_ENABLE_LEGACY=0` - Legacy system features
- `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=0` - Payment Links fallback
- `NEXT_PUBLIC_SHOW_PERCY_WIDGET=0` - Percy widget visibility
- `FF_N8N_NOOP=1` - n8n NOOP mode (recommended)

## Emergency Fallback Configuration

### If Stripe Checkout Fails
```bash
# Enable Payment Links fallback
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=1

# Configure Payment Links (create in Stripe Dashboard first)
NEXT_PUBLIC_STRIPE_LINK_BIZ_ROOKIE=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BIZ_PRO=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BIZ_ALL_STAR=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_STARTER=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_PRO=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_SPORTS_ELITE=https://buy.stripe.com/...
```

### If n8n is Down
```bash
# Enable NOOP mode (already default)
FF_N8N_NOOP=1
```

## Verification Commands

### Check Flag Status
```bash
# Check all flags
curl https://skrblai.io/api/_probe/flags | jq

# Check specific flag
curl https://skrblai.io/api/_probe/flags | jq '.flags.NEXT_PUBLIC_ENABLE_STRIPE'
```

### Test Payment Flow
```bash
# Test checkout endpoint
curl -X POST https://skrblai.io/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"sku":"biz_rookie","mode":"subscription","vertical":"business"}'
```

## Common Issues and Solutions

### "Stripe Disabled" Button
**Cause:** `NEXT_PUBLIC_ENABLE_STRIPE` is `false` or missing
**Fix:** Set `NEXT_PUBLIC_ENABLE_STRIPE=1`

### "Could not resolve price ID"
**Cause:** Missing Stripe price ID environment variables
**Fix:** Set all required `NEXT_PUBLIC_STRIPE_PRICE_*` variables

### Flags Not Updating After Deploy
**Cause:** `NEXT_PUBLIC_*` variables are embedded at build time
**Fix:** Trigger a new deployment after changing flags

### Payment Links Not Working
**Cause:** `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=1` but no Payment Links configured
**Fix:** Create Payment Links in Stripe Dashboard and set corresponding env vars

## Flag Priority Order

1. **Environment variable value** (if set)
2. **Default value** (from code)
3. **Fallback behavior** (graceful degradation)

## Monitoring

### Health Check Endpoints
- `/api/_probe/flags` - Flag status and warnings
- `/api/_probe/stripe` - Stripe configuration
- `/api/_probe/supabase` - Database connectivity

### Logs to Watch
- `[FLAG]` - Flag value changes (dev only)
- `[BuyButton]` - Payment mode selection (dev only)
- `[NOOP]` - n8n webhook skips (production)