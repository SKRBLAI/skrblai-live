# Environment Variable Parity Analysis

## Summary
- **Variables in .env.development**: 6
- **Variables referenced in code**: 67+
- **Core required variables present**: 6/7 (86%)
- **Missing critical variables**: 1 (SUPABASE_SERVICE_ROLE_KEY)
- **Price ID variables referenced**: 58+
- **Price ID variables present**: 0

## Core Required Variables

| Variable | Present in .env.development | Present in Railway | Referenced in Code | Status |
|----------|----------------------------|-------------------|-------------------|---------|
| `NEXT_PUBLIC_SITE_URL` | ❌ Missing | 🔍 Unknown | ✅ Yes | ⚠️ **Missing** |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Present | 🔍 Unknown | ✅ Yes | ✅ **OK** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Present | 🔍 Unknown | ✅ Yes | ✅ **OK** |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Missing | 🔍 Unknown | ✅ Yes | ⚠️ **Missing** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Present | 🔍 Unknown | ✅ Yes | ✅ **OK** |
| `STRIPE_SECRET_KEY` | ✅ Present | 🔍 Unknown | ✅ Yes | ✅ **OK** |
| `STRIPE_WEBHOOK_SECRET` | ✅ Present | 🔍 Unknown | ✅ Yes | ✅ **OK** |

## All Referenced Environment Variables

### ✅ Present in .env.development (6 variables)

| Variable | Value Type | Usage Context |
|----------|------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Supabase client initialization |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT Token | Supabase anon client authentication |
| `STRIPE_SECRET_KEY` | Secret Key | Server-side Stripe operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public Key | Client-side Stripe.js initialization |
| `STRIPE_WEBHOOK_SECRET` | Secret Key | Webhook signature verification |

### ❌ Missing from .env.development (61+ variables)

#### **Critical Missing Variables**
| Variable | Usage Context | Impact |
|----------|---------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Supabase operations | ⚠️ **High** - Admin routes will fail |
| `NEXT_PUBLIC_SITE_URL` | Base URL generation | ⚠️ **Medium** - Fallbacks to localhost |

#### **Stripe Price ID Variables (58+ missing)**
All price ID variables are missing from .env.development:

**Sports Plans (16 variables)**
```bash
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_ROOKIE=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPORTS_ELITE=price_...
NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR=price_...
# ... plus _M variants
```

**Business Plans (6 variables)**
```bash
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_...
# ... plus _M variants
```

**Add-ons (20+ variables)**
```bash
NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT=price_...
# ... plus _PROMO and _M variants
```

#### **Integration Variables (16+ missing)**
| Variable | Usage Context | Impact |
|----------|---------------|--------|
| `N8N_BASE_URL` | Workflow automation | Medium - Automation features disabled |
| `N8N_API_KEY` | N8N authentication | Medium - Workflow triggers fail |
| `RESEND_API_KEY` | Email sending | Medium - Email notifications disabled |
| `TWILIO_ACCOUNT_SID` | SMS functionality | Low - SMS features disabled |
| `TWILIO_AUTH_TOKEN` | SMS authentication | Low - SMS features disabled |
| `TWILIO_PHONE_NUMBER` | SMS sender ID | Low - SMS features disabled |
| `OPENAI_API_KEY` | AI functionality | High - AI agents may fail |
| `CLOUDINARY_CLOUD_NAME` | Image processing | Medium - Image optimization disabled |
| `CLOUDINARY_API_KEY` | Cloudinary auth | Medium - Image uploads may fail |
| `CLOUDINARY_API_SECRET` | Cloudinary auth | Medium - Image processing disabled |

#### **Feature Flag Variables (7+ missing)**
| Variable | Default | Impact |
|----------|---------|--------|
| `NEXT_PUBLIC_HP_GUIDE_STAR` | `true` | Homepage enhancements |
| `NEXT_PUBLIC_ENABLE_ORBIT` | `false` | Agent animations |
| `NEXT_PUBLIC_ENABLE_STRIPE` | `true` | Payment system toggle |
| `NEXT_PUBLIC_ENABLE_LEGACY` | `false` | Legacy code access |
| `NEXT_PUBLIC_ENABLE_BUNDLES` | `false` | Bundle pricing |
| `NEXT_PUBLIC_ENABLE_ARR_DASH` | `false` | Revenue analytics |
| `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | `'scan-first'` | Homepage layout |

#### **Optional/Development Variables (10+ missing)**
| Variable | Usage Context | Impact |
|----------|---------------|--------|
| `GOOGLE_SITE_VERIFICATION` | SEO verification | Low - SEO only |
| `SENTRY_DSN` | Error tracking | Medium - No error monitoring |
| `NEXT_PUBLIC_SENTRY_DSN` | Client error tracking | Medium - No client monitoring |
| `HCAPTCHA_SECRET` | Captcha verification | Low - Captcha disabled |
| `SENDGRID_API_KEY` | Alternative email | Low - Fallback email disabled |

## Code Usage Analysis

### **High Usage Variables (10+ references)**
| Variable | Reference Count | Critical Path |
|----------|----------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 15+ | Database connectivity |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 15+ | Database authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | 12+ | Admin operations |
| `STRIPE_SECRET_KEY` | 8+ | Payment processing |
| `NODE_ENV` | 25+ | Environment detection |

### **Medium Usage Variables (3-9 references)**
| Variable | Reference Count | Usage Pattern |
|----------|----------------|---------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 3+ | Client Stripe initialization |
| `STRIPE_WEBHOOK_SECRET` | 2+ | Webhook verification |
| `N8N_BASE_URL` | 5+ | Workflow automation |
| `OPENAI_API_KEY` | 4+ | AI functionality |

### **Low Usage Variables (1-2 references)**
Most price ID variables, integration keys, and feature flags have 1-2 references each.

## Railway Environment Status

**Note**: Railway environment variables cannot be directly inspected from this analysis. The following variables should be verified in Railway dashboard:

### **Must Be Present in Railway**
1. `NEXT_PUBLIC_SITE_URL` - Set to production domain
2. `SUPABASE_SERVICE_ROLE_KEY` - Required for admin operations
3. All Stripe price ID variables for active SKUs
4. `OPENAI_API_KEY` - Required for AI functionality
5. Integration keys for active features (N8N, Resend, etc.)

### **Should Match .env.development**
1. `NEXT_PUBLIC_SUPABASE_URL` - Same Supabase project or production instance
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Matching anon key
3. `STRIPE_SECRET_KEY` - Production or test key matching environment
4. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Matching publishable key
5. `STRIPE_WEBHOOK_SECRET` - Matching webhook endpoint secret

## Recommendations

### 🔥 **Immediate Actions**
1. **Add missing core variables to .env.development**:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=sb_service_role_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. **Verify Railway has all core variables**:
   - All 7 core required variables
   - At least basic price IDs for primary SKUs
   - OPENAI_API_KEY for AI functionality

### 🟡 **Medium Priority**
1. **Add price ID variables for active SKUs**
2. **Configure integration variables** (N8N, Resend, etc.)
3. **Set up monitoring variables** (Sentry DSNs)

### 🟢 **Low Priority**
1. **Add all price ID variants** (_M, _PROMO)
2. **Configure optional integrations** (Twilio, Cloudinary)
3. **Set up development-only variables**

## Environment Validation Script

To validate environment completeness:

```bash
# Check core variables
node -e "
const required = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.log('❌ Missing:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All core variables present');
}
"
```