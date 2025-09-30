# ARR Telemetry Feature — Sports vs Business

This feature adds Annual Recurring Revenue (ARR) tracking split by vertical (sports vs business) with dashboard visualization and snapshot capabilities.

## Overview

The ARR telemetry system:
1. Calculates real-time ARR from Stripe active subscriptions
2. Classifies subscriptions by vertical (sports/business) based on price IDs
3. Exposes data via REST API
4. Displays ARR metrics on the internal analytics dashboard (flag-gated)
5. Supports daily snapshot storage for historical tracking

## Files Created

### Core Library
- **`lib/analytics/arr.ts`** - ARR calculation logic
  - `calculateARR()` - Main function that queries Stripe and calculates ARR
  - Handles pagination for large subscription lists
  - Gracefully returns error states when Stripe is unavailable
  - Uses `readEnvAny()` for price ID resolution with fallback support

### API Endpoints
- **`app/api/analytics/arr/route.ts`** - GET endpoint for real-time ARR data
  - Returns JSON: `{ ok, sportsARR, businessARR, totalARR, counts }`
  - Returns 503 with `{ ok: false, reason }` on errors

- **`app/api/analytics/arr/snapshot/route.ts`** - POST endpoint to save ARR snapshot
  - Inserts current ARR data into `arr_snapshots` table
  - Gracefully handles missing Supabase configuration

### Database Migration
- **`supabase/migrations/20250930_arr_snapshots.sql`**
  - Creates `arr_snapshots` table with columns:
    - `id` (bigserial primary key)
    - `captured_at` (timestamptz, default now())
    - `sports_arr` (numeric)
    - `business_arr` (numeric)
    - `total_arr` (numeric)
  - Includes index on `captured_at` for time-based queries
  - RLS enabled (no policies, service role access only)

### Dashboard Integration
- **`app/dashboard/analytics/internal/page.tsx`** - Updated to include ARR cards
  - Three cards displaying Sports ARR, Business ARR, and Total ARR
  - Shows active subscription counts per vertical
  - Flag-gated behind `NEXT_PUBLIC_ENABLE_ARR_DASH=1`
  - Displays graceful error message if Stripe unavailable

### Development Tools
- **`scripts/smoke-arr.ts`** - Quick smoke test script
  - Fetches `/api/analytics/arr` and logs results
  - Run via `npm run smoke:arr`

### Package Updates
- **`package.json`** - Added `smoke:arr` script

## Environment Variables

### Required for ARR Calculation
- `STRIPE_SECRET_KEY` - Stripe secret key (server-side)

### Sports Plan Price IDs (canonical and fallback)
- `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE` or `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M`
- `NEXT_PUBLIC_STRIPE_PRICE_PRO` or `NEXT_PUBLIC_STRIPE_PRICE_PRO_M`
- `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR` or `NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR_M`

### Business Plan Price IDs (canonical and fallback)
- `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER` or `NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M`
- `NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO` or `NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M`
- `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE` or `NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M`

### Feature Flags
- `NEXT_PUBLIC_ENABLE_ARR_DASH=1` - Enable ARR cards on internal analytics dashboard

### Optional (for snapshots)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## API Reference

### GET /api/analytics/arr

Calculates and returns current ARR split by vertical.

**Response (success):**
```json
{
  "ok": true,
  "sportsARR": 12000,
  "businessARR": 24000,
  "totalARR": 36000,
  "counts": {
    "sportsSubs": 10,
    "businessSubs": 20,
    "unknownSubs": 2
  }
}
```

**Response (error):**
```json
{
  "ok": false,
  "reason": "stripe_unavailable"
}
```

**Possible error reasons:**
- `stripe_unavailable` - `STRIPE_SECRET_KEY` not configured
- `internal_error` - Unexpected error during calculation

### POST /api/analytics/arr/snapshot

Saves a snapshot of current ARR to the database.

**Response (success):**
```json
{
  "ok": true,
  "snapshot": {
    "id": 123,
    "captured_at": "2025-09-30T12:00:00Z",
    "sports_arr": 12000,
    "business_arr": 24000,
    "total_arr": 36000
  }
}
```

**Response (error):**
```json
{
  "ok": false,
  "reason": "supabase_unavailable"
}
```

**Possible error reasons:**
- `stripe_unavailable` - `STRIPE_SECRET_KEY` not configured
- `supabase_unavailable` - Supabase not configured
- `insert_failed` - Database insert error
- `internal_error` - Unexpected error

## Usage

### View ARR on Dashboard

1. Set environment variable: `NEXT_PUBLIC_ENABLE_ARR_DASH=1`
2. Ensure Stripe is configured with valid price IDs
3. Navigate to `/dashboard/analytics/internal`
4. ARR cards will appear below the key metrics

### Smoke Test

```bash
npm run smoke:arr
```

### Create ARR Snapshot (manual)

```bash
curl -X POST http://localhost:3000/api/analytics/arr/snapshot
```

### Schedule Daily Snapshots (optional)

You can set up a cron job or scheduled function to POST to `/api/analytics/arr/snapshot` daily. This creates a time-series dataset for ARR trends.

Example cron (daily at midnight):
```bash
0 0 * * * curl -X POST https://your-domain.com/api/analytics/arr/snapshot
```

## Architecture Notes

### Price ID Resolution Strategy

The system uses `readEnvAny()` to support both canonical and `_M` suffixed environment variables. This provides flexibility for different deployment environments:

- **Canonical**: `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE`
- **Fallback**: `NEXT_PUBLIC_STRIPE_PRICE_ROOKIE_M`

The function checks canonical first, then falls back to `_M` variant.

### Subscription Classification

Subscriptions are classified as sports or business based on their price ID:

1. Fetch all active subscriptions from Stripe
2. Extract the first item's price ID from each subscription
3. Compare against resolved sports/business price ID sets
4. Sum MRR × 12 for each vertical
5. Count unknown subscriptions (those not matching any known price ID)

### Error Handling

The system follows a "graceful degradation" pattern:

- **Missing Stripe key**: Returns `{ ok: false, reason: "stripe_unavailable" }` (never crashes)
- **Missing Supabase**: Returns `{ ok: false, reason: "supabase_unavailable" }` for snapshots
- **Dashboard flag off**: ARR cards simply don't render
- **API errors**: Caught and returned as `{ ok: false, reason: "internal_error" }`

No secrets are ever logged.

### Performance Considerations

- Stripe subscriptions are fetched with pagination (100 per page)
- Results are not cached; each API call fetches fresh data
- Consider adding Redis caching for high-traffic scenarios
- Snapshot table has an index on `captured_at` for efficient historical queries

## Testing Checklist

- [ ] Set `STRIPE_SECRET_KEY` in environment
- [ ] Verify all price ID environment variables are set
- [ ] Run `npm run smoke:arr` → should return `{ ok: true }` with numbers
- [ ] Set `NEXT_PUBLIC_ENABLE_ARR_DASH=1`
- [ ] Visit `/dashboard/analytics/internal` → see ARR cards
- [ ] Test snapshot endpoint: `curl -X POST /api/analytics/arr/snapshot`
- [ ] Verify snapshot appears in `arr_snapshots` table
- [ ] Test with missing Stripe key → should gracefully show error reason
- [ ] Test with flag disabled → ARR cards should not appear

## Future Enhancements

Potential improvements:
- Add ARR trend chart using snapshot history
- Implement caching layer (Redis) for better performance
- Add ARR growth rate calculation (MoM, QoQ)
- Support filtering by date range for historical snapshots
- Add webhook listener for real-time ARR updates on subscription changes
- Export ARR data to CSV/Excel
- Add ARR forecasting based on historical trends

## Maintenance

### Adding New Plan Tiers

If new plan tiers are added:

1. Add environment variable for the new price ID
2. Update `resolvedPriceIds()` in `lib/analytics/arr.ts` to include new price IDs
3. Update this documentation with the new environment variables

### Debugging

Enable detailed logging by adding console statements to `calculateARR()`:

```typescript
console.log('[ARR] Resolved sports prices:', Array.from(sportsSet));
console.log('[ARR] Resolved business prices:', Array.from(bizSet));
console.log('[ARR] Processing subscription:', sub.id, 'with price:', priceId);
```

Remember to remove logging before committing (no secrets in logs).

## Security Notes

- Server-side only: `STRIPE_SECRET_KEY` never exposed to client
- RLS enabled on `arr_snapshots` table (service role access only)
- No user input accepted by calculation logic
- All API errors sanitized (no stack traces in responses)
- Price IDs are public metadata (safe to log)

---

**Last Updated**: September 30, 2025  
**Feature Status**: ✅ Backend Complete | ⏳ Dashboard Integration (flag-gated)  
**Dependencies**: Stripe SDK, Supabase (optional for snapshots)