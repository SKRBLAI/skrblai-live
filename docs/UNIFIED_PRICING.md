# Unified Pricing v1 Documentation

## Overview

This document describes the unified pricing system that consolidates Business and Sports pricing into 4 shared tiers with optional add-ons. The system is catalog-driven, supports both monthly subscriptions and add-on purchases, and includes a Parent Portal flow for sports users.

## Architecture

### Core Components

1. **Catalog System** (`lib/pricing/catalog.ts`)
   - Unified 4-tier pricing structure
   - Add-on definitions
   - Legacy compatibility layer

2. **Entitlements** (`lib/entitlements.ts`)
   - Plan capabilities mapping
   - Add-on entitlements
   - Helper functions for calculating total entitlements

3. **Checkout System** (`components/payments/CheckoutButton.tsx`, `app/api/checkout/route.ts`)
   - Unified checkout flow
   - Support for plan + add-ons in single session
   - Metadata tracking for analytics

4. **Parent Portal** (`app/dashboard/parent/page.tsx`, `app/api/parent/provision/route.ts`)
   - Dedicated parent dashboard
   - Child progress tracking
   - Provision API for profile setup

## Unified Pricing Tiers

### Plan Structure

All plans are monthly subscriptions with the following keys:

| Plan Key | Name | Price | Description |
|----------|------|-------|-------------|
| `ROOKIE` | Rookie | $9.99/mo | Essential tools for individuals and small teams |
| `PRO` | Pro | $16.99/mo | Advanced features for growing teams |
| `ALL_STAR` | All-Star | $29.99/mo | Complete access for serious users |
| `FRANCHISE` | Franchise | Contact | Custom solution for large organizations |

### Plan Features

#### ROOKIE
- 5 scans per month
- 1 project workspace
- Basic AI agents access
- Community support
- 1 seat

#### PRO (Most Popular)
- 25 scans per month
- 5 project workspaces
- Advanced AI agents
- Priority support
- 3 seats

#### ALL_STAR
- 100 scans per month
- Unlimited projects
- All AI agents & tools
- Dedicated support
- 10 seats

#### FRANCHISE
- Custom scan limits
- White-label options
- Custom integrations
- Dedicated success manager
- Unlimited seats

## Add-ons

Monthly recurring add-ons that enhance any base plan:

| Add-on Key | Name | Price | Description | Verticals |
|------------|------|-------|-------------|-----------|
| `ADDON_SCANS_10` | +10 Scans | $5.00/mo | Additional scans per month | Business, Sports |
| `ADDON_MOE` | Mastery of Emotion (MOE) | $9.00/mo | Mental performance training | Sports |
| `ADDON_NUTRITION` | Nutrition Guidance | $7.00/mo | Personalized nutrition plans | Sports |
| `ADDON_ADV_ANALYTICS` | Advanced Analytics | $9.00/mo | Deep performance insights | Business, Sports |
| `ADDON_AUTOMATION` | Automation Suite | $19.00/mo | Advanced workflow automation | Business |
| `ADDON_SEAT` | Additional Seat | $3.00/mo | Per additional team member | Business, Sports |

## Stripe Integration

### Lookup Keys

The system uses Stripe lookup keys for easy price resolution:

- **Plans**: `plan.{PLAN_KEY}.monthly` (e.g., `plan.ROOKIE.monthly`)
- **Add-ons**: `addon.{ADDON_NAME}.monthly` (e.g., `addon.MOE.monthly`)

### Checkout Flow

1. User selects plan and optional add-ons
2. `CheckoutButton` sends request to `/api/checkout`
3. API resolves plan + add-on prices via lookup keys
4. Creates Stripe session with multiple line items
5. Metadata includes vertical, plan, and add-ons for analytics

Example checkout request:
```json
{
  "sku": "PRO",
  "mode": "subscription",
  "vertical": "sports",
  "addons": ["ADDON_MOE", "ADDON_NUTRITION"],
  "metadata": {
    "source": "sports_page",
    "campaign": "unified_pricing_v1"
  }
}
```

## Parent Portal

### Flow

1. **CTA on Sports Page**: Parent Portal button in `SportsHero` component
2. **Authentication Check**: 
   - Not authenticated → `/sign-in?from=/dashboard/parent`
   - Authenticated → Call `/api/parent/provision`
3. **Profile Provision**: API creates `parent_profiles` record
4. **Dashboard Access**: Redirect to `/dashboard/parent`

### Features

- Child progress tracking
- Scan usage monitoring
- Training insights
- Quick actions (upload video, upgrade plan, support)

### Database Schema

```sql
-- Parent profiles table
CREATE TABLE parent_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own parent profile" ON parent_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own parent profile" ON parent_profiles FOR UPDATE USING (auth.uid() = user_id);
```

## Legacy Compatibility

### Key Aliases

The system maintains backward compatibility through key aliases:

```typescript
const KEY_ALIASES: Record<string, string> = {
  'SPORTS_STARTER': 'ROOKIE',
  'BUS_STARTER': 'ROOKIE',
  'starter': 'ROOKIE',
  'SPORTS_PRO': 'PRO',
  'BUS_PRO': 'PRO',
  'star': 'PRO',
  'SPORTS_ELITE': 'ALL_STAR',
  'BUS_ELITE': 'ALL_STAR',
  'crusher': 'ALL_STAR',
  'BUNDLE_ALL_ACCESS': 'ALL_STAR',
  // ... more aliases
};
```

### Safe Accessors

All pricing lookups use `getDisplayPlanOrNull()` which:
- Returns `null` for missing plans (no throws)
- Logs warnings in development
- Allows UI to gracefully handle missing data

## Implementation Guidelines

### UI Components

1. **Always use safe accessors**: `getDisplayPlanOrNull()` instead of `getDisplayPlan()`
2. **Handle null gracefully**: Show "—" or "Coming Soon" for missing plans
3. **Disable broken CTAs**: Don't show checkout buttons for null plans
4. **Log warnings**: Console.warn once for missing plans in development

### API Routes

1. **Use Node.js runtime**: `export const runtime = 'nodejs'`
2. **Force dynamic**: `export const dynamic = 'force-dynamic'`
3. **Validate inputs**: Check for required fields before processing
4. **Include metadata**: Track vertical, source, and add-ons for analytics

### Checkout Flow

1. **Support add-ons**: Accept `addons` array in checkout requests
2. **Resolve all prices**: Convert SKUs to Stripe price IDs
3. **Create line items**: One for plan, additional for each add-on
4. **Include metadata**: Plan, add-ons, vertical, source for tracking

## Testing Checklist

- [ ] `/pricing` shows 4 cards with features & prices from catalog
- [ ] `/sports` shows same 4 cards (no legacy bundles) + keeps scan/intake
- [ ] Clicking plan cards starts checkout with correct metadata
- [ ] Franchise plan shows "Contact Us" CTA → `/contact`
- [ ] Parent Portal button on `/sports`:
  - [ ] Unauth: goes to `/sign-in?from=/dashboard/parent`
  - [ ] Auth: provisions profile and lands on `/dashboard/parent`
- [ ] No crashes on null catalog lookups
- [ ] All prices display correctly (no "—" unless truly missing)
- [ ] Add-ons section shows on pricing page
- [ ] Stripe sessions include plan + add-on line items
- [ ] Metadata includes vertical and add-ons list

## Deployment Notes

### Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Database Migration

If using migrations folder, add:

```sql
-- migrations/20250901_parent_profiles.sql
CREATE TABLE parent_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parent profile" 
  ON parent_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own parent profile" 
  ON parent_profiles FOR UPDATE 
  USING (auth.uid() = user_id);
```

### Stripe Configuration

Ensure Stripe has lookup keys configured for all plans and add-ons:
- `plan.ROOKIE.monthly`
- `plan.PRO.monthly`
- `plan.ALL_STAR.monthly`
- `addon.SCANS_10.monthly`
- `addon.MOE.monthly`
- etc.

## Analytics & Tracking

### Metadata Structure

Checkout sessions include metadata for tracking:

```json
{
  "source": "web",
  "vertical": "sports|business",
  "plan": "PRO",
  "addons": "ADDON_MOE,ADDON_NUTRITION",
  "campaign": "unified_pricing_v1"
}
```

### Key Metrics

- Plan distribution (ROOKIE vs PRO vs ALL_STAR)
- Add-on attachment rates
- Vertical performance (business vs sports)
- Parent Portal adoption
- Conversion from legacy to unified pricing

## Future Enhancements

1. **Annual Pricing**: Add annual options with discounts
2. **Add-on Toggles**: UI for selecting add-ons during checkout
3. **Usage-based Billing**: Overage charges for scan limits
4. **Team Management**: Seat management UI
5. **Custom Plans**: Enterprise plan builder
6. **A/B Testing**: Price testing framework
7. **Localization**: Multi-currency support

## Support & Troubleshooting

### Common Issues

1. **Missing Plan Error**: Check `KEY_ALIASES` mapping
2. **Checkout Fails**: Verify Stripe lookup keys exist
3. **Parent Portal 401**: Check middleware `AUTH_API_PATHS`
4. **UI Shows "—"**: Plan not found in catalog, check console warnings

### Debug Tools

- Console warnings for missing catalog entries
- Metadata tracking in Stripe dashboard
- Parent provision API logs
- Checkout session metadata

---

*Last updated: January 2025*
*Version: 1.0.0*