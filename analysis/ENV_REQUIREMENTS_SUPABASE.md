# 🔐 Supabase & Auth Environment Requirements

**Generated**: 2025-10-21  
**Purpose**: Verify all required environment variables for Supabase CLI verification deployment

---

## ✅ Required Environment Variables

| Variable Name | Present | Source | Purpose |
|---------------|---------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Required | Railway | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Required | Railway | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Required | Railway | Supabase service role (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | ✅ Required | Railway | Production site URL (https://skrblai.io) |

---

## 🔑 Google OAuth Variables

| Variable Name | Present | Source | Purpose |
|---------------|---------|--------|---------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ Required | Railway | Google OAuth client ID |
| `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET` | ✅ Required | Railway | Google OAuth client secret |

---

## 💳 Stripe Variables

| Variable Name | Present | Source | Purpose |
|---------------|---------|--------|---------|
| `STRIPE_SECRET_KEY` | ✅ Required | Railway | Stripe secret key (sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⚠️ Optional | Railway | Stripe publishable key |
| `STRIPE_API_VERSION` | ✅ Required | Railway | Stripe API version (2025-09-30.clover) |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ Optional | Railway | Stripe webhook secret |
| `NEXT_PUBLIC_ENABLE_STRIPE` | ✅ Required | Railway | Feature flag (1) |
| `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS` | ⚠️ Optional | Railway | Fallback links flag (0) |

---

## 🖼️ Cloudinary Variables

| Variable Name | Present | Source | Purpose |
|---------------|---------|--------|---------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ⚠️ Optional | Railway | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | ⚠️ Optional | Railway | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ⚠️ Optional | Railway | Cloudinary API secret |

---

## ❌ Obsolete Variables (DO NOT SET)

These variables are **obsolete** and should be removed if present:

- `AUTH_DOMAIN` (replaced by NEXT_PUBLIC_SITE_URL)
- `NEXTAUTH_URL` (not used with Supabase)
- `NEXT_PUBLIC_AUTH_URL` (not used)
- Any references to `auth.skrblai.io`

---

## 🔧 Railway-Specific Variables

These are set automatically by Railway (do not manually configure):

- `RAILWAY_ENVIRONMENT`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_SERVICE_ID`
- `PORT`

---

## 📋 Verification Checklist

### Before Deployment:

- [ ] All ✅ Required variables are set in Railway
- [ ] Supabase URL, anon key, and service role key are from **same project**
- [ ] Google OAuth credentials match Google Cloud Console
- [ ] Stripe keys are production keys (sk_live_..., pk_live_...)
- [ ] NEXT_PUBLIC_SITE_URL is set to `https://skrblai.io`
- [ ] All obsolete variables removed

### After Deployment:

- [ ] Test `/api/_probe/supabase` returns success
- [ ] Test `/api/_probe/auth` shows correct cookie domain
- [ ] Test `/api/_probe/db/profile-check` confirms RLS policies
- [ ] Sign-up flow creates profiles without errors
- [ ] Magic link works correctly
- [ ] Google OAuth completes successfully

---

## 🚨 Critical Security Notes

1. **Never commit** `.env.local` or `.env.production` files with real secrets
2. **Service role key** bypasses RLS - only use server-side
3. **Anon key** is public - safe to expose to client
4. Keep `.env.production.example` up to date as template
5. Rotate keys if accidentally exposed

---

## 📖 Reference Documents

- Full env template: `.env.production.example`
- Supabase config: `SUPABASE_CONFIG_REFERENCE.md`
- Deployment guide: `SUPABASE_AUTH_DEPLOYMENT_CHECKLIST.md`
- Auth repair summary: `AUTH_REPAIR_SUMMARY.md`

---

**Status**: ✅ Ready for verification deployment
