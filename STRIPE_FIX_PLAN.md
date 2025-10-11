# 💳 STRIPE FIX PLAN - Phase 2

**Date**: 2025-01-10  
**Status**: 🎯 **READY TO EXECUTE**

---

## 📊 **CURRENT STATE ANALYSIS**

### ✅ **What's Already Good**:
1. **Canonical helper exists**: `lib/stripe/stripe.ts` with `requireStripe()` and `getOptionalStripe()`
2. **Checkout route uses canonical helper**: `/api/checkout/route.ts` uses `requireStripe()`
3. **Webhook uses canonical helper**: `/api/stripe/webhook/route.ts` uses `requireStripe()`
4. **Price resolver working**: `lib/stripe/priceResolver.ts` handles SKU → Price ID resolution
5. **Sports page updated**: One-time purchases working (per memory)

### ❌ **What Needs Fixing**:
1. **Legacy file exists**: `utils/stripe.ts` with direct `new Stripe()` - **NOT USED ANYWHERE** ✅
2. **Env var documentation**: Need to verify which price IDs are actually set
3. **Testing needed**: Verify checkout flows work end-to-end

---

## 🎯 **FIX STRATEGY**

### **Step 1: Clean Up Legacy File** ✅
**Action**: Delete or refactor `utils/stripe.ts`  
**Reason**: File uses direct `new Stripe()` without null checking  
**Impact**: None - file is not imported anywhere  
**Decision**: **DELETE** the file to prevent future confusion

### **Step 2: Verify Environment Variables**
**Action**: Check which Stripe price IDs are actually configured  
**Files to check**:
- `.env.local` (if exists)
- Railway environment variables (production)
- Vercel environment variables (if using Vercel)

**Required Variables**:
```bash
# Core Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Feature Toggle (OPTIONAL - defaults to true)
NEXT_PUBLIC_ENABLE_STRIPE=true

# Price IDs (REQUIRED for each product you want to sell)
# Sports Plans (One-time purchases)
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_...

# Business Plans (Subscriptions)
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_...
```

### **Step 3: Test Checkout Flows**
**Action**: Verify each checkout flow works  
**Test Cases**:
1. Sports one-time purchase (Starter, Pro, Elite)
2. Business subscription (Starter, Pro, Elite)
3. Add-ons (if applicable)
4. Promo codes (if applicable)

---

## 📝 **EXECUTION CHECKLIST**

### **Phase 2A: Cleanup** (5 min)
- [ ] Delete `utils/stripe.ts` (not used anywhere)
- [ ] Verify no imports reference deleted file
- [ ] Document deletion in commit message

### **Phase 2B: Environment Verification** (10 min)
- [ ] Check local `.env.local` for Stripe vars
- [ ] Check Railway dashboard for production Stripe vars
- [ ] Verify all required price IDs are set
- [ ] Document missing price IDs (if any)

### **Phase 2C: Testing** (15 min)
- [ ] Test sports one-time purchase flow
- [ ] Test business subscription flow
- [ ] Verify webhook receives events
- [ ] Check success/cancel redirects work
- [ ] Verify metadata is captured correctly

### **Phase 2D: Documentation** (5 min)
- [ ] Update README with Stripe setup instructions
- [ ] Document required env vars
- [ ] Add troubleshooting guide

---

## 🚨 **POTENTIAL ISSUES & SOLUTIONS**

### **Issue 1: Missing Price IDs**
**Symptom**: Checkout button disabled or returns "Could not resolve price ID"  
**Solution**: 
1. Create products in Stripe Dashboard
2. Copy price IDs to environment variables
3. Restart dev server / redeploy

### **Issue 2: Webhook Not Receiving Events**
**Symptom**: Payments succeed but user doesn't get access  
**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` is set
2. Check webhook endpoint is registered in Stripe Dashboard
3. Verify webhook URL is `https://yourdomain.com/api/stripe/webhook`
4. Check webhook logs in Stripe Dashboard

### **Issue 3: Checkout Session Creation Fails**
**Symptom**: Error when clicking "Buy Now" button  
**Solution**:
1. Check browser console for errors
2. Check server logs for Stripe API errors
3. Verify `STRIPE_SECRET_KEY` is valid
4. Ensure price ID exists in Stripe

---

## 📈 **SUCCESS CRITERIA**

✅ **Phase 2 Complete When**:
1. Legacy `utils/stripe.ts` file deleted
2. All required Stripe env vars documented
3. At least one checkout flow tested successfully
4. Webhook receives and processes events
5. No Stripe-related errors in logs

---

## 🔄 **ROLLBACK PLAN**

If issues arise:
1. **Revert file deletion**: `git checkout utils/stripe.ts` (if needed)
2. **Check env vars**: Ensure no typos in variable names
3. **Use Stripe test mode**: Set test keys for debugging
4. **Check Stripe Dashboard**: Verify products/prices exist

---

## 📚 **REFERENCE LINKS**

- **Stripe Docs**: https://stripe.com/docs/api
- **Checkout Sessions**: https://stripe.com/docs/api/checkout/sessions
- **Webhooks**: https://stripe.com/docs/webhooks
- **Test Cards**: https://stripe.com/docs/testing

---

## 🎯 **NEXT STEPS AFTER PHASE 2**

1. **Phase 3**: Clean up feature flags
2. **Phase 4**: Add sports media (images/videos)
3. **Phase 5**: Final testing and deployment

---

**Ready to execute!** 🚀
