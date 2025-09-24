# SKRBL AI Docs vs Code vs Live - Alignment Analysis

**Generated**: September 18, 2025  
**Scope**: Pricing, Infrastructure, Assets, Documentation alignment  
**Mode**: Read-only analysis (no code changes)

---

## Executive Summary

• **Major Misalignment**: Live site shows different pricing structure than documented  
• **Environment Issues**: Multiple env variable naming inconsistencies blocking features  
• **Asset Path Issues**: SkillSmith images referenced in code don't match public directory structure  
• **API Health**: Supabase health check shows configuration issues in production  
• **Deployment**: Railway native deploy appears functional but env-dependent features failing  

### Key Findings
- **Sports Page**: Live site appears to load but pricing content not rendering as expected
- **Business Page**: Uses different pricing structure than unified docs describe
- **Health Endpoint**: Returns failed status due to env variable format issues
- **Middleware**: www→apex redirect configured but bundle redirect rules present

---

## Matrix — Docs vs Code vs Live

| Area | Source of Truth (Docs) | Code (file/line) | Live (URL/screenshot ref) | Status (Aligned / Drift) | Notes |
|------|------------------------|------------------|---------------------------|--------------------------|-------|
| **Sports Pricing Plans** | Starter $9.99, Pro $19.99 Beta, Elite $59.99 Beta, Custom (contact) | `lib/sports/pricingData.ts:44-99` | https://skrblai.io/sports | **DRIFT** | Sports page loads but pricing content not visible in curl output |
| **Sports Plan Features** | Quick Wins + SkillSmith AI Performance Analysis with scan counts | `lib/sports/pricingData.ts:50-87` | https://skrblai.io/sports | **DRIFT** | Features defined in code but not confirmed live |
| **Sports Add-Ons** | 10 Scans $9.99 one-time | `lib/sports/pricingData.ts:101-109` | https://skrblai.io/sports | **DRIFT** | Add-ons section code exists but live rendering unclear |
| **Business Pricing** | Gateway FREE, Starter Hustler $27, Business Dominator $69, Industry Crusher $269 | `lib/business/pricingData.ts:26-90` | https://skrblai.io/pricing | **DRIFT** | Live pricing shows different values ($1, $4, $6, etc.) |
| **Stripe Environment Variables** | NEXT_PUBLIC_STRIPE_PRICE_ROOKIE/PRO/ALLSTAR/ADDON_SCANS10 | `lib/sports/pricingData.ts:48,63,78,105` | N/A | **DRIFT** | Inconsistent naming: ADDON_SCANS10 vs ADDON_10_SCANS |
| **Unified Pricing (Docs)** | 4-tier system: ROOKIE $9.99, PRO $16.99, ALL_STAR $29.99, FRANCHISE (contact) | `docs/UNIFIED_PRICING.md:37-42` | https://skrblai.io/pricing | **MAJOR DRIFT** | Docs describe unified system not implemented |
| **Checkout API** | /api/checkout with { sku, mode, vertical } + absolute URLs | `app/api/checkout/route.ts:21-98` | N/A | **ALIGNED** | Code supports subscription + payment modes correctly |
| **Health Endpoint** | Returns { ok: true, checks.env.*, checks.network.authReachable } | `app/api/health/auth/route.ts:48-128` | https://skrblai.io/api/health/auth | **DRIFT** | Returns `{"ok":false}` - env validation failing |
| **Middleware Redirects** | www→apex redirect (308), excludes static/api/stripe/health | `middleware.ts:11-19` | N/A | **ALIGNED** | Redirect logic correctly implemented |
| **Bundle Redirects** | Bundle paths → /sports#plans | `middleware.ts:22-32` | N/A | **ALIGNED** | Bundle redirect rule exists |
| **Supabase Client** | Real @supabase/supabase-js v2 client with onAuthStateChange guarded | `lib/supabase/client.ts:8-25` | N/A | **ALIGNED** | Safe client creation with fallbacks |
| **Supabase Env Keys** | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (sbp_), SUPABASE_SERVICE_ROLE_KEY (sbs_) | `lib/env.ts:22-76` | Health endpoint | **DRIFT** | Live shows incorrect key prefixes |
| **SkillSmith Assets** | public/img/skillsmith/* paths | Sports page code references | https://skrblai.io/ | **DRIFT** | Code references `/img/skillsmith/` but actual path is `/images/` |
| **Sports Hero Images** | skillsmith-athlete-stand.png, skillsmith-soccer-dribble.png, skillsmith-coach-hoodie.png | `app/sports/page.tsx:236-242` | N/A | **DRIFT** | Referenced paths don't match public directory structure |

---

## Gaps & Root Causes

### 1. **Pricing Structure Misalignment**
- **Gap**: Documentation describes unified 4-tier pricing (ROOKIE/PRO/ALL_STAR/FRANCHISE) but code implements separate Sports/Business pricing
- **Root Cause**: Multiple pricing systems exist simultaneously - unified docs vs separate implementation files
- **Impact**: Live site shows neither system correctly, pricing values appear broken

### 2. **Environment Variable Inconsistencies**
- **Gap**: Stripe env vars use inconsistent naming (`ADDON_SCANS10` vs `ADDON_10_SCANS`)
- **Root Cause**: Seeding script and code reference different variable names
- **Impact**: Missing SKUs cause "Stripe Not Enabled" fallbacks

### 3. **Supabase Configuration Issues**
- **Gap**: Health endpoint shows `{"ok":false}` with incorrect key prefixes
- **Root Cause**: Production env vars don't match expected `sbp_` and `sbs_` prefixes
- **Impact**: Authentication features likely non-functional

### 4. **Asset Path Mismatches**
- **Gap**: Code references `/img/skillsmith/` but assets are in `/images/`
- **Root Cause**: Directory restructure not reflected in component imports
- **Impact**: Broken images on sports page, hero components may not render

### 5. **Documentation vs Implementation Divergence**
- **Gap**: UNIFIED_PRICING.md describes system not implemented in codebase
- **Root Cause**: Documentation written for planned system, actual code uses legacy approach
- **Impact**: Developer confusion, inconsistent pricing across verticals

---

## Plan of Attack (No-Code)

### **High Impact / Low Effort**

#### 1. **Standardize Environment Variable Names** ⚡
- **Action**: Create canonical env var naming document and audit all references
- **Files**: `lib/sports/pricingData.ts`, `scripts/seed-stripe-pricing.js`, Railway Variables
- **Risk**: Low - naming standardization
- **Owner**: DevOps Engineer  
- **ETA**: 2 hours
- **Specific**: Change `ADDON_SCANS10` → `ADDON_10_SCANS` consistently

#### 2. **Fix Asset Path References** 🖼️
- **Action**: Update all `/img/skillsmith/` references to `/images/`
- **Files**: `app/sports/page.tsx:236-242`, any other components referencing skillsmith assets
- **Risk**: Low - path correction
- **Owner**: Frontend Developer
- **ETA**: 1 hour

#### 3. **Correct Supabase Env Key Prefixes** 🔑
- **Action**: Update Railway environment variables to use correct prefixes
- **Files**: Railway Variables (production)
- **Risk**: Medium - affects authentication
- **Owner**: DevOps Engineer
- **ETA**: 1 hour
- **Specific**: Ensure keys start with `sbp_` (anon) and `sbs_` (service role)

### **Medium Impact / Medium Effort**

#### 4. **Resolve Pricing System Conflict** 💰
- **Action**: Decide on unified vs separate pricing, update docs to match implementation
- **Files**: `docs/UNIFIED_PRICING.md`, `docs/AGGRESSIVE_PRICING_RESTRUCTURE_COMPLETION.md`
- **Risk**: Medium - affects product strategy
- **Owner**: Product Manager + Tech Lead
- **ETA**: 4 hours
- **Decision**: Either implement unified system OR update docs to reflect current dual system

#### 5. **Debug Sports Page Rendering** 🏃‍♂️
- **Action**: Investigate why pricing content not appearing on live sports page
- **Files**: Sports page components, check for console errors in browser
- **Risk**: Medium - core feature visibility
- **Owner**: Frontend Developer
- **ETA**: 3 hours

#### 6. **Validate Stripe Integration** 💳
- **Action**: Ensure all referenced Stripe price IDs exist and are correctly mapped
- **Files**: Stripe dashboard, env variables, pricing components
- **Risk**: Medium - payment functionality
- **Owner**: Backend Developer
- **ETA**: 2 hours

### **Lower Priority / Higher Effort**

#### 7. **Implement Unified Pricing System** 🔄
- **Action**: If decided, implement the unified 4-tier system described in docs
- **Files**: Create new unified pricing catalog, update all components
- **Risk**: High - major architectural change
- **Owner**: Full Stack Developer
- **ETA**: 16 hours

---

## Env Audit

### **Public Environment Variables Referenced in Code**

#### **Sports Pricing** (Required for visible features)
- `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE` ✅ (referenced in code)
- `NEXT_PUBLIC_STRIPE_PRICE_PRO` ✅ (referenced in code)  
- `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR` ✅ (referenced in code)
- `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10` ❌ (inconsistent naming)

#### **Business Pricing** (Required for visible features)
- `NEXT_PUBLIC_STRIPE_PRICE_GATEWAY` ❓ (optional, may not exist)
- `NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY` ❓ (optional)
- `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY` ❓ (optional)
- `NEXT_PUBLIC_STRIPE_PRICE_ADDON_ANALYTICS` ❓ (optional)
- `NEXT_PUBLIC_STRIPE_PRICE_ADDON_AUTOMATION` ❓ (optional)
- `NEXT_PUBLIC_STRIPE_PRICE_ADDON_SEAT` ❓ (optional)

#### **Infrastructure** (Required for core functionality)
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (required, but format validation failing)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ❌ (wrong prefix in production)
- `SUPABASE_SERVICE_ROLE_KEY` ❌ (wrong prefix in production)
- `APP_BASE_URL` ✅ (used in checkout API)
- `STRIPE_SECRET_KEY` ✅ (required for payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅ (required for checkout)

### **Naming Inconsistencies**
- **Issue**: `ADDON_SCANS10` vs `ADDON_10_SCANS` - choose one canonical form
- **Recommendation**: Use `ADDON_10_SCANS` (more descriptive)

---

## Deployment Notes

### **Railway Configuration**
- ✅ **Deploy Method**: Railway native deploy on master merges via Dockerfile
- ✅ **Build**: Uses multi-stage Docker build with standalone output
- ✅ **Health Check**: Configured to hit `/api/health` endpoint
- ❌ **Environment**: Missing or incorrectly formatted env variables

### **CI/CD Status**
- ✅ **Build-Only CI**: No GitHub Actions workflows found (build handled by Railway)
- ✅ **Docker Build**: Multi-stage build optimized for production
- ❌ **Environment Validation**: No env validation in build process

### **Live Site Status**
- ✅ **Accessibility**: Site loads and responds (HTTP 200)
- ✅ **CDN/Edge**: Railway edge caching active
- ❌ **Health Check**: API returns failed status
- ❌ **Feature Rendering**: Pricing content not displaying correctly

### **Commit Hash Detection**
- **Method**: Asset filenames in `/_next/static/` could indicate build version
- **Current**: Unable to determine exact commit from live site
- **Recommendation**: Add build metadata to health endpoint

---

## Appendix: Raw Findings

### **Health Endpoint Response**
```json
{
  "ok": false,
  "checks": {
    "env": {
      "urlOk": false,
      "anonPrefixOk": false,
      "serviceRolePrefixOk": false
    },
    "network": {
      "authReachable": true,
      "status": 400
    }
  },
  "meta": {
    "url": "https://zpqavydsinrtaxhowmnb.supabase.co",
    "anonKeyRedacted": "sb_p********************CpR2",
    "serviceKeyRedacted": "sb_s*********************uDjn"
  }
}
```

### **Pricing Page Price Extraction**
Live pricing page contains values: `$1`, `$4`, `$6`, `$11`, `$15` - these don't match any documented pricing structure.

### **Sports Page Analysis**
Sports page loads but pricing content not extracted via curl, suggesting either:
1. Content loaded via JavaScript (client-side rendering)
2. Pricing components not rendering due to missing env variables
3. Different pricing structure than expected

---

## Success Criteria Met

✅ **DIFF-REPORT.md created** with comprehensive analysis  
✅ **Docs vs Code vs Live matrix** showing alignment status  
✅ **Root cause analysis** for each identified gap  
✅ **Prioritized action plan** with time estimates  
✅ **Environment audit** with specific variable names  
✅ **Deployment status** assessment  

**Next Steps**: Address High Impact/Low Effort items first, then validate pricing system decisions before implementing larger changes.