# 🔧 ENV VARIABLES SETUP GUIDE

## 📋 **REQUIRED FOR PHASE 1 LAUNCH**

### **1. Feature Flags** ✅ (Already Configured)
```env
NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT=scan-first
NEXT_PUBLIC_ENABLE_BUNDLES=true
NEXT_PUBLIC_ENABLE_FREEMIUM=true
NEXT_PUBLIC_URGENCY_BANNERS=true
NEXT_PUBLIC_SHOW_PERCY_WIDGET=false
```

**What These Do**:
- `scan-first`: Enables new SplitHeroScanner component
- `ENABLE_BUNDLES`: Shows bundle pricing in scan results
- `ENABLE_FREEMIUM`: Activates 3 free scans → email capture flow
- `URGENCY_BANNERS`: Shows "🔥 LIVE: 247 businesses scanning now"
- `SHOW_PERCY_WIDGET`: Hides old floating Percy widget

---

### **2. Trial & Freemium Limits** ✅ (Configured)
```env
NEXT_PUBLIC_FREE_SCANS_GUEST=3
NEXT_PUBLIC_FREE_SCANS_EMAIL=5
NEXT_PUBLIC_TRIAL_DURATION_DAYS=3
NEXT_PUBLIC_DAILY_SCAN_LIMIT=10
```

**What These Do**:
- Guest users: 3 free scans
- Email captured users: 5 free scans
- Curiosity/Rookie trial: 3 days
- Paid users: 10 scans/day (prevent abuse)

---

### **3. N8N Workflows** ⚠️ (NEEDS YOUR INPUT)

**Current (Placeholder)**:
```env
N8N_BUSINESS_ONBOARDING_URL=https://your-n8n-instance.com/webhook/business-onboarding
N8N_WEBHOOK_FREE_SCAN=https://your-n8n-instance.com/webhook/free-scan
N8N_API_KEY=your_n8n_api_key_here
```

**What You Need to Provide**:
1. Your N8N instance URL (e.g., `https://n8n.skrblai.io`)
2. Webhook endpoints for:
   - Business onboarding (when user signs up)
   - Free scan completion (for lead nurturing)
3. N8N API key (for triggering workflows)

**How to Get These**:
1. Log into your N8N instance
2. Create workflows:
   - **Business Onboarding**: Triggered when user completes signup
   - **Free Scan**: Triggered when user completes scan
3. Copy webhook URLs from N8N workflow settings
4. Generate API key in N8N settings

**What These Enable**:
- Automated email sequences after scan
- CRM integration (add leads to your system)
- Slack notifications for new signups
- Analytics tracking

---

### **4. Twilio (SMS Verification)** ⚠️ (OPTIONAL - Phase 2)

**Current (Placeholder)**:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

**What You Need**:
1. Twilio account (free trial available)
2. Account SID + Auth Token
3. Twilio phone number

**What This Enables**:
- SMS verification for VIP users
- Phone-based 2FA
- SMS notifications for scan results

**Priority**: LOW (not needed for Phase 1)

---

### **5. IRA Agent Access** ⚠️ (NEEDS YOUR EMAIL)

**Current (Placeholder)**:
```env
IRA_ALLOWED_EMAILS=your-email@example.com,founder@skrblai.io
```

**What You Need**:
- Add YOUR email address
- Add any team members who should see IRA agent

**Example**:
```env
IRA_ALLOWED_EMAILS=rod@skrblai.io,admin@skrblai.io,founder@skrblai.io
```

---

### **6. Google Analytics** ⚠️ (RECOMMENDED)

**Current (Placeholder)**:
```env
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

**What You Need**:
1. Create Google Analytics 4 property
2. Copy Measurement ID (starts with `G-`)
3. Paste here

**What This Enables**:
- Track scan completions
- Monitor conversion funnel
- Measure ROI of marketing campaigns

**Priority**: HIGH (needed for tracking Phase 1 success)

---

## 🚀 **RAILWAY DEPLOYMENT VARIABLES**

### **Copy These to Railway** (After filling in placeholders):

**Required**:
```
NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT=scan-first
NEXT_PUBLIC_ENABLE_BUNDLES=true
NEXT_PUBLIC_ENABLE_FREEMIUM=true
NEXT_PUBLIC_FREE_SCANS_GUEST=3
NEXT_PUBLIC_FREE_SCANS_EMAIL=5
NEXT_PUBLIC_TRIAL_DURATION_DAYS=3
NODE_ENV=production
```

**Supabase** (Already have these):
```
NEXT_PUBLIC_SUPABASE_URL=https://zpqavydsinrtaxhowmnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_key]
SUPABASE_SERVICE_ROLE_KEY=[your_key]
```

**Stripe** (Already have these):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your_key]
STRIPE_SECRET_KEY=[your_key]
STRIPE_WEBHOOK_SECRET=[your_secret]
```

**OpenAI** (Already have this):
```
OPENAI_API_KEY=[your_key]
OPENAI_MODEL=gpt-4-turbo
```

**Optional (Add when ready)**:
```
N8N_BUSINESS_ONBOARDING_URL=[your_webhook]
N8N_WEBHOOK_FREE_SCAN=[your_webhook]
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=[your_id]
IRA_ALLOWED_EMAILS=[your_emails]
```

---

## ✅ **VALIDATION CHECKLIST**

Before deploying to Railway, verify:

- [ ] All Stripe price IDs are correct (test in Stripe dashboard)
- [ ] Supabase connection works (test auth flow)
- [ ] OpenAI API key has credits (check usage dashboard)
- [ ] Feature flags are set correctly (scan-first enabled)
- [ ] Trial limits are configured (3 free scans for guests)
- [ ] Google Analytics ID is added (for tracking)
- [ ] N8N webhooks are tested (if using automation)
- [ ] IRA email allowlist includes your email

---

## 🔒 **SECURITY NOTES**

**Never Commit to Git**:
- ❌ `.env.local` (local development only)
- ❌ Any file with API keys

**Safe to Commit**:
- ✅ `.env.example` (template with placeholders)
- ✅ This guide (no actual keys)

**Railway Variables**:
- ✅ Encrypted at rest
- ✅ Only accessible to your project
- ✅ Can be updated without redeploying

---

## 📊 **MONITORING AFTER DEPLOYMENT**

### **Check These Metrics**:

1. **Supabase Dashboard**:
   - User signups
   - Trial activations
   - Database queries

2. **Stripe Dashboard**:
   - Subscription starts
   - Revenue (MRR)
   - Failed payments

3. **OpenAI Dashboard**:
   - API usage
   - Token consumption
   - Costs

4. **Google Analytics** (if configured):
   - Scan completions
   - Conversion rate
   - User flow

---

## 🆘 **TROUBLESHOOTING**

### **"Scan not working"**:
- Check OpenAI API key has credits
- Verify `OPENAI_MODEL` is valid (gpt-4-turbo or gpt-4)
- Check Supabase connection (trial tracking)

### **"Payment not processing"**:
- Verify Stripe webhook secret is correct
- Check Stripe price IDs match your products
- Ensure Stripe is in live mode (not test)

### **"Email not sending"**:
- Check Resend API key is valid
- Verify sender email is verified in Resend
- Check email templates exist

### **"Trial limit not working"**:
- Verify `NEXT_PUBLIC_FREE_SCANS_GUEST` is set
- Check Supabase `trial_usage` table exists
- Ensure TrialManager is imported correctly

---

## 📞 **NEED HELP?**

If you get stuck:
1. Check Railway logs: `railway logs`
2. Check browser console for errors
3. Verify all required env vars are set
4. Test locally first with `.env.local`

---

**Last Updated**: 2025-01-10  
**Phase**: Scan-First Homepage Launch  
**Status**: Ready for deployment after filling placeholders
