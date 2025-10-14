# 🔍 Environment Variables Audit Report

**Date**: 2025-01-12  
**Status**: ⚠️ NEEDS CLEANUP

---

## ✅ What's Correct

### Supabase (Perfect!)
```env
✅ NEXT_PUBLIC_SUPABASE_URL=https://zpqavydsinrtaxhowmnb.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe Core Keys (Perfect!)
```env
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51R19D9FxZMzukOVx...
✅ STRIPE_SECRET_KEY=sk_live_51R19D9FxZMzukOVx...
✅ STRIPE_WEBHOOK_SECRET=whsec_Gc6OcWZLrt2KC4alRy7Ohu4RSVlFgPvH
```

### Feature Flags (Good!)
```env
✅ NEXT_PUBLIC_HP_GUIDE_STAR=1
✅ NEXT_PUBLIC_ENABLE_STRIPE=1
✅ NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT=scan-first
✅ NEXT_PUBLIC_ENABLE_BUNDLES=true
```

---

## ⚠️ Issues Found

### Issue #1: Duplicate Addon Price IDs
You have the same addon prices listed twice:
- Lines 52-56: With `SPORTS_ADDON_` prefix
- Lines 137-141: With just `ADDON_` prefix

**Problem**: This creates confusion. Which one is used?

### Issue #2: Missing Generic Addon Mappings
Your code might expect generic addon names like:
- `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10`
- But you also have `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_SCANS10`

### Issue #3: N8N Placeholders
```env
❌ N8N_BUSINESS_ONBOARDING_URL=https://your-n8n-instance.com/webhook/business-onboarding
❌ N8N_WEBHOOK_FREE_SCAN=https://your-n8n-instance.com/webhook/free-scan
❌ N8N_API_KEY=your_n8n_api_key_here
```
These are placeholders and will cause errors if used.

### Issue #4: Analytics Placeholder
```env
❌ NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Issue #5: Hostinger Placeholder
```env
❌ HOSTINGER_API_TOKEN=your_hostinger_token_here
```

---

## 🎯 Recommended Stripe Price Structure

Based on your current setup, here's what you should have:

### Sports Products (One-Time Purchases)
```env
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER=price_1SAcuvFxZMzukOVxd5q8vMst
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO=price_1SAcuwFxZMzukOVxE3mEWud6
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE=price_1SAcuxFxZMzukOVxxaKD6KrD
```

### Sports Add-ons (One-Time Purchases)
```env
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_SCANS10=price_1SAcuyFxZMzukOVxHq2q5LNi
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO=price_1SAxoUFxZMzukOVxOe2FHjl9
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION=price_1SAxoUFxZMzukOVxMst6C8pF
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION=price_1SAxoVFxZMzukOVxQI6f80WM
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION=price_1SAxoWFxZMzukOVxUTxCcpCq
```

### Business Products (Monthly Subscriptions)
```env
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M=price_1SAe1NFxZMzukOVxmMutCUZ0
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M=price_1SAe1OFxZMzukOVxqO9xiMpz
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M=price_1SAe1PFxZMzukOVxF9HAHXHT
```

### Business Add-ons (Monthly)
```env
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS=price_1SAe1QFxZMzukOVxQ2LSK2Du
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION=price_1SAe1RFxZMzukOVx86GVaI6w
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT=price_1SAe1SFxZMzukOVxKtqEg9Dl
```

---

## 🔧 Cleanup Actions Required

### Action 1: Remove Duplicate Addon Entries
**Delete lines 137-141** (the duplicate addon entries without SPORTS_ prefix)

### Action 2: Disable or Configure N8N
Either:
- **Option A**: Set real N8N webhook URLs
- **Option B**: Remove these variables (not critical for core functionality)

### Action 3: Analytics
Either:
- Add real Google Analytics ID
- Or remove the variable (not critical)

### Action 4: Verify Stripe Price IDs
Run this in your Stripe Dashboard to verify all price IDs exist:
1. Go to https://dashboard.stripe.com/test/products
2. Check each product
3. Verify the price IDs match your .env.local

---

## 🎯 Next Steps

1. **Clean up .env.local** (remove duplicates)
2. **Verify Stripe products exist** in Stripe Dashboard
3. **Test checkout flow** with cleaned config
4. **Add to production** (Railway/Vercel) once working locally

---

## 📋 Questions to Answer

1. **Do you use N8N workflows?** If no, we can remove those variables.
2. **Do you want Google Analytics?** If no, we can remove that.
3. **Are all your Stripe products live?** Or are some test mode?
4. **Do you need the generic ADDON_ price IDs?** Or just SPORTS_ADDON_?

Let me know and I'll create a cleaned-up .env.local file for you!
