# 🔧 Stripe Variable Name Mismatch Fix

## 🚨 Problem Found

Your Stripe add-on variable names don't match what the code expects.

---

## 📊 Current vs Expected

### Sports Add-ons

**Your Current Variables:**
```bash
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_SCANS10=price_1SAcuyFxZMzukOVxHq2q5LNi
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO=price_1SAxoUFxZMzukOVxOe2FHjl9
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION=price_1SAxoUFxZMzukOVxMst6C8pF
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION=price_1SAxoVFxZMzukOVxQI6f80WM
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION=price_1SAxoWFxZMzukOVxUTxCcpCq
```

**What Code Expects (lib/stripe/priceResolver.ts:123):**
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_1SAcuyFxZMzukOVxHq2q5LNi
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_1SAxoUFxZMzukOVxOe2FHjl9
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION=price_1SAxoUFxZMzukOVxMst6C8pF
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_1SAxoVFxZMzukOVxQI6f80WM
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION=price_1SAxoWFxZMzukOVxUTxCcpCq
```

**Difference:** Remove `SPORTS_` from the middle!

---

## ✅ Solution Options

### Option 1: Rename Environment Variables (Recommended)

Update `.env.local`, `.env.development`, and Railway:

**Remove:**
```bash
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_SCANS10
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_VIDEO
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_EMOTION
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_NUTRITION
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_FOUNDATION
```

**Add:**
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_1SAcuyFxZMzukOVxHq2q5LNi
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_1SAxoUFxZMzukOVxOe2FHjl9
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION=price_1SAxoUFxZMzukOVxMst6C8pF
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_1SAxoVFxZMzukOVxQI6f80WM
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION=price_1SAxoWFxZMzukOVxUTxCcpCq
```

### Option 2: Update Code to Match Variables

Update `lib/stripe/priceResolver.ts` line 123:

**Change:**
```typescript
`NEXT_PUBLIC_STRIPE_PRICE_ADDON_${slugUpper}`,
```

**To:**
```typescript
`NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_${slugUpper}`,
```

---

## 🎯 Recommendation

**Use Option 1** (rename variables) because:
- ✅ Matches the documented pattern
- ✅ More consistent with code expectations
- ✅ Easier to maintain

---

## 📋 Status Summary

### ✅ Working (No Changes Needed)
- Sports Plans (STARTER, PRO, ELITE)
- Business Plans (BIZ_STARTER_M, BIZ_PRO_M, BIZ_ELITE_M)
- Business Add-ons (BIZ_ADDON_*)

### ⚠️ Needs Fix
- Sports Add-ons (need to remove SPORTS_ from variable names)

---

## 🔧 Quick Fix Commands

### Update .env.local
```bash
# Remove old variables
sed -i '/NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON/d' .env.local

# Add new variables
cat >> .env.local << EOF
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_1SAcuyFxZMzukOVxHq2q5LNi
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_1SAxoUFxZMzukOVxOe2FHjl9
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION=price_1SAxoUFxZMzukOVxMst6C8pF
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_1SAxoVFxZMzukOVxQI6f80WM
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION=price_1SAxoWFxZMzukOVxUTxCcpCq
EOF
```

### Update Railway
1. Go to Railway → Variables
2. Remove: `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ADDON_*`
3. Add: `NEXT_PUBLIC_STRIPE_PRICE_ADDON_*` (without SPORTS_)

---

**This will fix the sports add-on pricing!** 🚀
