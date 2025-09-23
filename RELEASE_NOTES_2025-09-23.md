# Release Notes - 2025-09-23

## 🚀 Unified Pricing + Business Seeder + Founders + Analytics + Routing

This release consolidates multiple feature branches into a single deployment, implementing major platform enhancements while preserving all existing functionality.

### 📦 **Merged Branches**
- `fix/revenue-blockers-today` - SkillSmith chat, Percy free scan, AgentLeague routing/images fixes
- `cursor/analyze-documentation-code-and-live-site-alignment-f9fb` - Documentation analysis report
- `cursor/implement-unified-pricing-with-stripe-seeding-f8d5` - Unified pricing structure
- `chore/seed-business-pricing` - Business pricing seeder with canonical ENV keys
- `cursor/enhance-interactive-onboarding-and-core-features-f029` - Enhanced onboarding and dashboard
- `cursor/refactor-pricing-add-ons-popups-and-analytics-4dbe` - Unified pricing, add-ons, popups, analytics
- `cursor/implement-founder-codes-roles-and-unlocks-370b` - Founder roles and access system

### ✨ **Key Features Added**

#### **Business Pricing Seeder**
- ✅ New `scripts/seed-stripe-business.js` seeder
- ✅ Creates Business Starter ($19.99), Pro ($39.99), Elite ($59.99) plans
- ✅ Creates Business add-ons: Advanced Analytics ($29), Automation Workflows ($49), Team Seat ($13)
- ✅ Prints canonical ENV keys for Railway deployment
- ✅ Validation for STRIPE_SECRET_KEY format

#### **Unified Pricing System**
- ✅ New `lib/pricing/catalogShared.ts` with unified PricingItem interface
- ✅ Consolidated business and sports pricing data structures
- ✅ Enhanced pricing grids with proper type safety
- ✅ Support for promotional pricing and add-ons

#### **Founders System**
- ✅ Founder codes and role-based access control
- ✅ New API endpoints: `/api/founders/me`, `/api/founders/redeem`, `/api/founders/admin/overview`
- ✅ Dashboard pages: `/dashboard/founder`, `/dashboard/heir`
- ✅ Supabase migration for founders table
- ✅ bcryptjs integration for secure code hashing

#### **Analytics & Tracking**
- ✅ Enhanced analytics pipeline with `lib/analytics/track.ts`
- ✅ New analytics endpoints: `/api/analytics/addons`, `/api/analytics/popups`, `/api/analytics/quick-wins`
- ✅ Lead capture improvements with metadata tracking
- ✅ Exit intent modal with analytics integration

#### **Agent Routing Consolidation**
- ✅ Centralized agent routing in `utils/agentRouting.ts`
- ✅ Consistent agent path resolution across components
- ✅ Preserved existing `/agents/*` routing structure

#### **UI/UX Enhancements**
- ✅ Enhanced Percy onboarding with reset functionality
- ✅ Improved dashboard redirects and agent chat configurations
- ✅ Modal providers for global popup management
- ✅ Better mobile responsiveness and accessibility

### 🔧 **Technical Improvements**

#### **Type Safety**
- ✅ Resolved TypeScript conflicts across pricing components
- ✅ Updated PricingItem interface usage throughout codebase
- ✅ Added proper type overloads for shared utility functions

#### **Dependencies**
- ✅ Added `bcryptjs` and `@types/bcryptjs` for founders system
- ✅ Updated `dotenv` for business seeder compatibility

#### **Database**
- ✅ New leads table migration with JSONB metadata support
- ✅ Founders table with role-based access control
- ✅ Enhanced RLS policies for security

### 🛡️ **Preserved Functionality**
- ✅ All existing Sports pricing keys and logic maintained
- ✅ Existing agent routing and backstory paths preserved
- ✅ APP_BASE_URL usage maintained in checkout flow
- ✅ Canonical SKU resolver functionality intact
- ✅ No UI changes outside touched files

### 📋 **Post-Merge Checklist**

#### **Environment Variables to Add**
After running the business seeder, add these to Railway:
```bash
# Business Plans
NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE=price_...

# Business Add-Ons
NEXT_PUBLIC_STRIPE_PRICE_ADDON_BIZ_ANALYTICS=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_BIZ_AUTOMATIONS=price_...
NEXT_PUBLIC_STRIPE_PRICE_ADDON_BIZ_TEAM_SEAT=price_...
```

#### **Verification Steps**
1. ✅ `npm run build` passes cleanly
2. ✅ Both seeders validate STRIPE_SECRET_KEY properly
3. ✅ API routes exist: `/api/stripe/webhooks`, `/api/leads/submit`, `/api/analytics/*`
4. ✅ Agent routing utility exists and functions
5. ✅ Founders system files properly installed

#### **Deployment Instructions**
1. **Merge this PR** to trigger Railway deployment
2. **Run business seeder**: `STRIPE_SECRET_KEY=sk_test_XXX node scripts/seed-stripe-business.js`
3. **Copy ENV variables** to Railway Variables
4. **Test key endpoints**: `/api/health/auth`, `/sports`, `/pricing`, Percy scan, checkout
5. **Verify founders system** (if using founder codes)

### 🎯 **Impact Summary**
- **16 commits** merged across 7 feature branches
- **22 new files** added (seeders, founders system, analytics, routing)
- **Multiple TypeScript conflicts** resolved with proper type safety
- **Zero breaking changes** to existing functionality
- **Single Railway deploy** ready for production

---

**🚀 Status**: Ready for merge and single Railway deploy  
**💰 Business Impact**: Complete pricing system with Business + Sports verticals  
**🔒 Security**: Enhanced with founder roles and proper access control  
**📊 Analytics**: Comprehensive tracking and lead management system

*Generated: September 23, 2025*