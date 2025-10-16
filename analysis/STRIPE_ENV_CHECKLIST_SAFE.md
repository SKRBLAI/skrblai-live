# Stripe Environment Variables Checklist

**Purpose**: Complete list of Stripe environment variables needed for Railway deployment  
**Date**: 2025-10-16

---

## 🔑 Core Stripe Configuration (REQUIRED)

These are **mandatory** for any Stripe functionality to work:

```bash
# Backend API Key (get from Stripe Dashboard)
STRIPE_SECRET_KEY=<your_stripe_secret_key_here>

# Frontend Publishable Key (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key_here>

# API Version (optional, has fallback)
STRIPE_API_VERSION=2025-09-30.clover
```

**How to get these:**
1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. For **production**: Use **live mode** keys (start with `sk_live_` and `pk_live_`)
3. For **testing**: Use **test mode** keys (start with `sk_test_` and `pk_test_`)

---

## 💰 Business Vertical - Price IDs

Required for `/pricing` page business plans and add-ons:

### Base Plans
```bash
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M=price_xxxxx
```

### Business Add-Ons
```bash
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT=price_xxxxx
```

---

## ⚽ Sports Vertical - Price IDs

Required for `/sports` vertical pricing:

### Base Plans
```bash
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR=price_xxxxx
```

### Sports Add-Ons
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION=price_xxxxx
```

---

## 🎚️ Feature Flags (Optional - Have Defaults)

These control Stripe behavior but have sensible defaults:

```bash
# Global Stripe toggle (default: true)
NEXT_PUBLIC_ENABLE_STRIPE=true

# Use Stripe Payment Links instead of Checkout Sessions (default: false)
NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=false
```

---

## 🛠️ How to Get Price IDs from Stripe

1. **Go to**: [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. **For each product**:
   - Click on the product name
   - Find the pricing table
   - Copy the **Price ID** (starts with `price_`)
3. **Match to env var**:
   - Business Starter Monthly → `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M`
   - Sports Rookie Monthly → `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE`
   - etc.

---

## ✅ Verification Steps

After adding these to Railway:

### 1. Check Environment Variables Are Set
Visit: `https://your-app.railway.app/api/debug/runtime-env`

### 2. Test Checkout Flow
1. Visit `/pricing`
2. Click any "Get Started" button
3. Should redirect to Stripe checkout
4. Complete test purchase

### 3. Check Logs for Errors
```bash
railway logs

# Look for:
# ✅ [checkout] Session created successfully
# ❌ STRIPE_SECRET_KEY missing
# ❌ Could not resolve price ID
```

---

## 🚨 Common Issues

### "Stripe Disabled" Button
**Cause**: `NEXT_PUBLIC_ENABLE_STRIPE` is set to `false` or missing  
**Fix**: Set `NEXT_PUBLIC_ENABLE_STRIPE=true` or remove it (defaults to true)

### "Could not resolve price ID"
**Cause**: Missing or incorrect price ID environment variables  
**Fix**: Double-check spelling and that price IDs exist in Stripe dashboard

### "No such price"
**Cause**: Using test price IDs in live mode (or vice versa)  
**Fix**: Ensure price IDs match the Stripe key mode (test vs live)

### "STRIPE_SECRET_KEY missing"
**Cause**: Backend API key not set  
**Fix**: Add `STRIPE_SECRET_KEY` to Railway (get from Stripe Dashboard)

---

## 📝 Current Status

Based on diagnostics:

| Variable | Current Status | Priority |
|----------|--------|----------|
| `STRIPE_SECRET_KEY` | ❌ Check Railway | 🔴 Critical |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ❌ Check Railway | 🔴 Critical |
| Price IDs (Business) | ⚠️ Check Railway | 🟡 High |
| Price IDs (Sports) | ⚠️ Check Railway | 🟡 High |
| `NEXT_PUBLIC_ENABLE_STRIPE` | ✅ Defaults to true | 🟢 Optional |

---

**Next Action**: Add core Stripe keys to Railway and redeploy.

