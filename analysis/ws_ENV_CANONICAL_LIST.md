# 🔑 Canonical Environment Variables List

**Generated**: 2025-10-08  
**Status**: ✅ **AUTHORITATIVE - FROM ACTUAL CODE**

---

## 📊 Executive Summary

**Total Variables**: 67 identified  
**Categories**:
- Supabase: 5 keys (3 required, 2 aliases)
- Stripe Core: 4 keys (3 required, 1 toggle)
- Stripe Catalog: 45+ price IDs
- Feature Flags: 19 flags
- Other Services: 13 keys

---

## 🗄️ Supabase Configuration

### **Required Keys**

| Env Variable | Type | Required By | Referenced In | Notes |
|-------------|------|-------------|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Browser + Server | `lib/supabase/client.ts:16`<br>`lib/supabase/server.ts:20,59` | **PRIMARY** - First choice for URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key | Browser + Server | `lib/supabase/client.ts:19`<br>`lib/supabase/server.ts:60` | **PRIMARY** - First choice for anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Key | Server Only | `lib/supabase/server.ts:21` | **ADMIN** - Bypasses RLS |

### **Accepted Aliases** (Fallbacks)

| Env Variable | Fallback For | Referenced In | Notes |
|-------------|--------------|---------------|-------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts:16`<br>`lib/supabase/server.ts:20,59` | **FALLBACK** - Second choice |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts:20`<br>`lib/supabase/server.ts:61` | **FALLBACK** - Second choice |
| `SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts:22`<br>`lib/supabase/server.ts:63` | **FALLBACK** - Third choice |

### **Dual-Key Lookup Logic**

```typescript
// From lib/supabase/client.ts and lib/supabase/server.ts
const url = readEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
const anonKey = readEnvAny(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 
  'SUPABASE_ANON_KEY'
);
```

**Recommendation**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as primary keys.

---

## 💳 Stripe Core Configuration

### **Required Keys**

| Env Variable | Type | Required By | Referenced In | Notes |
|-------------|------|-------------|---------------|-------|
| `STRIPE_SECRET_KEY` | Secret | Server | `lib/stripe/stripe.ts:7`<br>`utils/stripe.ts:12` | **REQUIRED** - Server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Browser | `utils/stripe.ts:7` | **REQUIRED** - Client-side Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | Secret | Webhook | `app/api/stripe/webhook/route.ts:16` | **REQUIRED** - Webhook signature verification |

### **Feature Toggle**

| Env Variable | Type | Default | Referenced In | Notes |
|-------------|------|---------|---------------|-------|
| `NEXT_PUBLIC_ENABLE_STRIPE` | Boolean | `true` | `lib/config/featureFlags.ts:30`<br>`components/pricing/BuyButton.tsx:27` | **TOGGLE** - Disables all Stripe features |

---

## 💰 Stripe Price IDs (Catalog)

### **Sports Plans** (Canonical → Legacy Fallbacks)

#### Starter Plan
| Env Variable | Priority | Referenced In | Notes |
|-------------|----------|---------------|-------|
| `NEXT_PUBLIC_STRIPE_PRICE_STARTER` | 1st (Canonical) | `lib/stripe/priceResolver.ts:27` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:28` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE` | 3rd (Legacy) | `lib/stripe/priceResolver.ts:29` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_STARTER_M` | 4th (Legacy) | `lib/stripe/priceResolver.ts:30` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER_M` | 5th (Legacy) | `lib/stripe/priceResolver.ts:31` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M` | 6th (Legacy) | `lib/stripe/priceResolver.ts:32` | Fallback |

#### Pro Plan
| Env Variable | Priority | Referenced In | Notes |
|-------------|----------|---------------|-------|
| `NEXT_PUBLIC_STRIPE_PRICE_PRO` | 1st (Canonical) | `lib/stripe/priceResolver.ts:40` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:41` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_M` | 3rd (Legacy) | `lib/stripe/priceResolver.ts:42` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO_M` | 4th (Legacy) | `lib/stripe/priceResolver.ts:43` | Fallback |

#### Elite Plan
| Env Variable | Priority | Referenced In | Notes |
|-------------|----------|---------------|-------|
| `NEXT_PUBLIC_STRIPE_PRICE_ELITE` | 1st (Canonical) | `lib/stripe/priceResolver.ts:51` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:52` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR` | 3rd (Legacy) | `lib/stripe/priceResolver.ts:53` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ELITE_M` | 4th (Legacy) | `lib/stripe/priceResolver.ts:54` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE_M` | 5th (Legacy) | `lib/stripe/priceResolver.ts:55` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M` | 6th (Legacy) | `lib/stripe/priceResolver.ts:56` | Fallback |

---

### **Business Plans** (Canonical → Legacy Fallbacks)

| Env Variable | Priority | Referenced In | Notes |
|-------------|----------|---------------|-------|
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER` | 1st (Canonical) | `lib/stripe/priceResolver.ts:64` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:65` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO` | 1st (Canonical) | `lib/stripe/priceResolver.ts:72` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:73` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE` | 1st (Canonical) | `lib/stripe/priceResolver.ts:80` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:81` | Fallback |

---

### **Sports Add-ons** (Neutral Naming)

| Env Variable | Priority | Referenced In | Notes |
|-------------|----------|---------------|-------|
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10` | 1st (Canonical) | `lib/stripe/priceResolver.ts:121` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:122` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO` | 1st (Canonical) | `lib/stripe/priceResolver.ts:121` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:122` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION` | 1st (Canonical) | `lib/stripe/priceResolver.ts:121` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:122` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION` | 1st (Canonical) | `lib/stripe/priceResolver.ts:121` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:122` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION` | 1st (Canonical) | `lib/stripe/priceResolver.ts:121` | **USE THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION_M` | 2nd (Legacy) | `lib/stripe/priceResolver.ts:122` | Fallback |

---

### **Business Add-ons** (Neutral → Category-Specific Fallbacks)

| Env Variable | Priority | Referenced In | Notes |
|-------------|----------|---------------|-------|
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS` | 1st (Neutral) | `lib/stripe/priceResolver.ts:128` | **PREFER THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS` | 2nd (Category) | `lib/stripe/priceResolver.ts:128` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS_M` | 3rd (Legacy) | `lib/stripe/priceResolver.ts:128` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION` | 1st (Neutral) | `lib/stripe/priceResolver.ts:128` | **PREFER THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION` | 2nd (Category) | `lib/stripe/priceResolver.ts:128` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION_M` | 3rd (Legacy) | `lib/stripe/priceResolver.ts:128` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT` | 1st (Neutral) | `lib/stripe/priceResolver.ts:128` | **PREFER THIS** |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT` | 2nd (Category) | `lib/stripe/priceResolver.ts:128` | Fallback |
| `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT_M` | 3rd (Legacy) | `lib/stripe/priceResolver.ts:128` | Fallback |

---

## 🚩 Feature Flags (19 Total)

| Env Variable | Type | Default | Referenced In | Purpose |
|-------------|------|---------|---------------|---------|
| `NEXT_PUBLIC_HP_GUIDE_STAR` | Boolean | `true` | `lib/config/featureFlags.ts:22` | Homepage guide star animation |
| `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | String | `'scan-first'` | `lib/config/featureFlags.ts:23` | Hero variant: scan-first\|split\|legacy |
| `NEXT_PUBLIC_ENABLE_ORBIT` | Boolean | `false` | `lib/config/featureFlags.ts:26` | Orbit animation on /agents |
| `NEXT_PUBLIC_ENABLE_ARR_DASH` | Boolean | `false` | `lib/config/featureFlags.ts:27` | ARR dashboard features |
| `NEXT_PUBLIC_ENABLE_STRIPE` | Boolean | `true` | `lib/config/featureFlags.ts:30` | Global Stripe toggle |
| `NEXT_PUBLIC_ENABLE_LEGACY` | Boolean | `false` | `lib/config/featureFlags.ts:33` | Legacy code paths |
| `NEXT_PUBLIC_ENABLE_BUNDLES` | Boolean | `false` | `lib/config/featureFlags.ts:34` | Bundle pricing |
| `NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE` | Boolean | `true` | `lib/config/featureFlags.ts:39` | AI automation homepage |
| `NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN` | Boolean | `true` | `lib/config/featureFlags.ts:40` | Enhanced business scan |
| `NEXT_PUBLIC_URGENCY_BANNERS` | Boolean | `true` | `lib/config/featureFlags.ts:41` | Urgency banners |
| `NEXT_PUBLIC_LIVE_METRICS` | Boolean | `true` | `lib/config/featureFlags.ts:42` | Live metrics |
| `NEXT_PUBLIC_USE_OPTIMIZED_PERCY` | Boolean | `false` | `lib/config/featureFlags.ts:45` | Optimized Percy component |
| `NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS` | Boolean | `true` | `lib/config/featureFlags.ts:46` | Percy animations |
| `NEXT_PUBLIC_ENABLE_PERCY_AVATAR` | Boolean | `true` | `lib/config/featureFlags.ts:47` | Percy avatar |
| `NEXT_PUBLIC_ENABLE_PERCY_CHAT` | Boolean | `true` | `lib/config/featureFlags.ts:48` | Percy chat |
| `NEXT_PUBLIC_ENABLE_PERCY_SOCIAL_PROOF` | Boolean | `true` | `lib/config/featureFlags.ts:49` | Percy social proof |
| `NEXT_PUBLIC_PERCY_PERFORMANCE_MONITORING` | Boolean | `true` | `lib/config/featureFlags.ts:50` | Percy performance monitoring |
| `NEXT_PUBLIC_PERCY_AUTO_FALLBACK` | Boolean | `true` | `lib/config/featureFlags.ts:51` | Percy auto fallback |
| `NEXT_PUBLIC_PERCY_LOG_SWITCHES` | Boolean | `true` | `lib/config/featureFlags.ts:52` | Percy switch logging |

---

## 🌐 Other Services

| Env Variable | Type | Required By | Referenced In | Notes |
|-------------|------|-------------|---------------|-------|
| `NEXT_PUBLIC_SITE_URL` | URL | Various | `app/api/env-check/route.ts:69` | Primary site URL |
| `NEXT_PUBLIC_BASE_URL` | URL | Various | `app/api/env-check/route.ts:69` | Fallback site URL |
| `APP_BASE_URL` | URL | Various | `app/api/env-check/route.ts:69` | Fallback site URL |
| `NEXT_PUBLIC_HCAPTCHA_SITEKEY` | Key | hCaptcha | `app/api/env-check/route.ts:80` | Optional - hCaptcha site key |
| `HCAPTCHA_SECRET` | Secret | hCaptcha | `app/api/env-check/route.ts:81` | Optional - hCaptcha secret |
| `N8N_WEBHOOK_BASE_URL` | URL | n8n | `lib/webhooks/n8nWebhooks.ts:39` | Optional - n8n webhooks |
| `N8N_BASE_URL` | URL | n8n | `lib/webhooks/n8nWebhooks.ts:39` | Optional - n8n fallback |
| `N8N_STRIPE_WEBHOOK_URL` | URL | n8n | `app/api/stripe/webhook/route.ts:153` | Optional - n8n Stripe webhook |
| `NEXT_DISABLE_IMAGE_OPTIMIZATION` | Boolean | Next.js | `app/api/env-check/route.ts:72` | Optional - disable image optimization |

---

## 📋 Minimum Required Configuration

### **For Core Functionality**:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_ENABLE_STRIPE=1

# Site URL (Required for auth callbacks)
NEXT_PUBLIC_SITE_URL=https://skrblai.io

# At least one price ID per tier (example for Sports Starter)
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
```

### **For Full Functionality** (Add pricing for all tiers):

```bash
# Sports Plans
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_...

# Business Plans
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_...

# Sports Add-ons
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION=price_...

# Business Add-ons
NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT=price_...
```

---

## 🚨 Common Misconfigurations

### **1. Using Legacy Keys Only**
```bash
# ❌ WRONG (no fallback if these are missing)
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO=price_...

# ✅ CORRECT (canonical keys with fallbacks)
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
```

### **2. Missing Dual-Key Support**
```bash
# ❌ WRONG (only one key, no fallback)
NEXT_PUBLIC_SUPABASE_URL=...

# ✅ CORRECT (primary key set, fallback available if needed)
NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_URL=... (optional fallback)
```

### **3. Mixing Category-Specific and Neutral Add-ons**
```bash
# ⚠️ CONFUSING (both set for same add-on)
NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS=price_123
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS=price_456

# ✅ CORRECT (use neutral only)
NEXT_PUBLIC_STRIPE_PRICE_ADDON_ADV_ANALYTICS=price_123
```

---

## 🎯 Recommendations

### **Immediate**:
1. **Set canonical keys** (STARTER, PRO, ELITE, ADDON_*)
2. **Keep legacy fallbacks** for gradual migration
3. **Document which keys are active** in your deployment

### **Long-term**:
1. **Deprecate legacy keys** after confirming canonical keys work
2. **Consolidate add-on naming** (use neutral ADDON_* everywhere)
3. **Add env validation** at build time

---

## 📊 Summary Table

| Category | Required | Optional | Total |
|----------|----------|----------|-------|
| Supabase | 3 | 2 | 5 |
| Stripe Core | 3 | 1 | 4 |
| Stripe Catalog | 15 (min) | 30+ (fallbacks) | 45+ |
| Feature Flags | 0 | 19 | 19 |
| Other Services | 1 | 8 | 9 |
| **TOTAL** | **22** | **60+** | **82+** |

---

## 🔍 Verification Commands

```bash
# Check which Supabase keys are set
env | grep SUPABASE

# Check which Stripe keys are set
env | grep STRIPE

# Check feature flags
env | grep NEXT_PUBLIC_ENABLE

# Verify all required keys
node scripts/verifyEnv.ts
```

---

## 🎯 Conclusion

**67+ environment variables identified** from actual code. The resolver provides excellent fallback support, but canonical keys should be used as primary configuration. Legacy keys exist for backward compatibility but should be phased out.

**Critical Keys** (Must Set):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- At least one price ID per tier you want to offer
