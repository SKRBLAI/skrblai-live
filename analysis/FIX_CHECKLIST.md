# Human Verification Checklist - Legacy Usage Fixes

## Overview

This checklist provides file-by-file fixes for all legacy Supabase and Stripe usage, ordered by risk level. Each item includes the specific changes needed and verification steps.

## 🚨 CRITICAL FIXES (Fix Immediately)

### 1. Core Authentication Infrastructure

#### `lib/auth/checkUserRole.ts` - Core Auth Functionality
**Risk**: HIGH - Affects all protected routes
**Current Issue**: Uses legacy Supabase client
**Fix Required**:
```typescript
// ❌ BEFORE (Lines 1-2):
import { supabase } from '../../utils/supabase';
import { getCurrentUser } from '../../utils/supabase-helpers';

// ✅ AFTER:
import { getServerSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase/helpers'; // Create canonical helper
```
**Verification**: 
- [ ] All protected routes still authenticate correctly
- [ ] Role detection works for free/premium users
- [ ] No TypeScript errors

#### `hooks/useUser.ts` - Global User State
**Risk**: HIGH - Affects all pages using user context
**Current Issue**: Uses legacy Supabase client
**Fix Required**:
```typescript
// ❌ BEFORE (Line 2):
import { supabase } from '../utils/supabase';

// ✅ AFTER:
import { getBrowserSupabase } from '@/lib/supabase';

// Update usage in hook:
const supabase = getBrowserSupabase();
```
**Verification**:
- [ ] User state loads correctly on all pages
- [ ] Authentication status updates properly
- [ ] No console errors in browser

#### `hooks/useTrial.ts` - Trial System
**Risk**: HIGH - Affects dashboard trial gating
**Current Issue**: Uses legacy helper
**Fix Required**:
```typescript
// ❌ BEFORE (Line 5):
import { getCurrentUser } from '../utils/supabase-helpers';

// ✅ AFTER:
import { getCurrentUser } from '@/lib/supabase/helpers'; // Create canonical helper
```
**Verification**:
- [ ] Trial status displays correctly
- [ ] Upgrade prompts work
- [ ] Trial expiration handling works

#### `lib/trial/trialManager.ts` - Trial Management
**Risk**: HIGH - Core trial functionality
**Current Issue**: Uses legacy Supabase client
**Fix Required**:
```typescript
// ❌ BEFORE (Line 6):
import { supabase } from '../../utils/supabase';

// ✅ AFTER:
import { getServerSupabaseAdmin } from '@/lib/supabase';

// Update function calls to use canonical client
```
**Verification**:
- [ ] Trial creation works
- [ ] Trial status checks work
- [ ] Database operations succeed

### 2. Legacy Helper Migration

#### `utils/supabase-helpers.ts` - Helper Functions Bridge
**Risk**: HIGH - Used by 38+ files across the codebase
**Current Issue**: Re-exports from legacy client
**Fix Required**:
```typescript
// ❌ BEFORE (Line 1):
import { supabase } from './supabase';

// ✅ AFTER:
import { getBrowserSupabase, getServerSupabaseAdmin } from '@/lib/supabase';

// Update all functions to use appropriate canonical client:
export async function getCurrentUser() {
  const supabase = getBrowserSupabase(); // or getServerSupabaseAdmin() for server-side
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Repeat for all exported functions...
```
**Verification**:
- [ ] All helper functions work with canonical clients
- [ ] No breaking changes to function signatures
- [ ] All 38+ dependent files continue working

## 🔥 HIGH PRIORITY FIXES (Fix This Week)

### 3. Dashboard Pages

#### `app/dashboard/website/page.tsx` - Website Dashboard
**Risk**: MEDIUM - User data loading issues
**Fix Required**:
```typescript
// ❌ BEFORE (Line 13):
import { getCurrentUser } from '../../../utils/supabase-helpers';

// ✅ AFTER:
import { getCurrentUser } from '@/lib/supabase/helpers';
```
**Verification**:
- [ ] Dashboard loads user data correctly
- [ ] Website management features work
- [ ] No authentication errors

#### `app/dashboard/getting-started/page.tsx` - Getting Started Dashboard  
**Risk**: MEDIUM - Onboarding flow issues
**Fix Required**: Same pattern as website dashboard
**Verification**:
- [ ] Getting started flow works
- [ ] User progress tracking works
- [ ] Onboarding steps display correctly

### 4. Stripe Legacy Usage

#### `lib/analytics/arr.ts` - ARR Analytics
**Risk**: MEDIUM - Different error handling than canonical Stripe
**Fix Required**:
```typescript
// ❌ BEFORE (Lines 8-12):
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith("sk_")) return null;
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

// ✅ AFTER:
import { requireStripe } from '@/lib/stripe/stripe';

function getStripe(): Stripe | null {
  return requireStripe();
}
```
**Verification**:
- [ ] ARR analytics still load correctly
- [ ] Error handling is consistent with other Stripe operations
- [ ] Revenue calculations are accurate

### 5. Feature Flag Hard Gates

#### `app/dashboard/analytics/internal/page.tsx` - ARR Dashboard Hard Gate
**Risk**: MEDIUM - Users see blank page when feature disabled
**Fix Required**:
```typescript
// ❌ BEFORE (Inferred):
if (!FEATURE_FLAGS.ENABLE_ARR_DASH) {
  return null;
}

// ✅ AFTER:
if (!FEATURE_FLAGS.ENABLE_ARR_DASH) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">ARR Dashboard</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800 mb-2">This feature is currently disabled.</p>
        <p className="text-blue-600 text-sm">Contact your administrator to enable ARR analytics.</p>
      </div>
    </div>
  );
}
```
**Verification**:
- [ ] Disabled state shows informative message
- [ ] Enabled state works normally
- [ ] No blank pages for users

## ⚠️ MEDIUM PRIORITY FIXES (Fix Next Week)

### 6. Percy Components

#### `components/percy/PercyWidget.tsx` - Percy AI Widget
**Fix Required**:
```typescript
// ❌ BEFORE (Lines 5, 9):
import { supabase } from '../../utils/supabase';
import { getCurrentUser } from '../../utils/supabase-helpers';

// ✅ AFTER:
import { getBrowserSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase/helpers';
```
**Verification**:
- [ ] Percy chat memory saves correctly
- [ ] User context is maintained
- [ ] No chat functionality breaks

#### `components/percy/PercyIntakeForm.tsx` - Lead Capture Form
**Fix Required**: Same pattern as PercyWidget
**Verification**:
- [ ] Lead capture works
- [ ] Form submissions save to database
- [ ] User data is properly stored

#### `components/assistant/FloatingPercy.tsx` - Floating Assistant
**Fix Required**: Same pattern as PercyWidget  
**Verification**:
- [ ] Floating Percy appears correctly
- [ ] User interactions work
- [ ] Context is maintained across pages

### 7. File Upload Components

#### `components/dashboard/FileUploadCard.tsx` - File Upload UI
**Fix Required**:
```typescript
// ❌ BEFORE (Lines 6-7):
import { uploadFileToStorage } from '../../utils/supabase-helpers';
import { supabase } from '../../utils/supabase';

// ✅ AFTER:
import { uploadFileToStorage } from '@/lib/supabase/helpers';
import { getBrowserSupabase } from '@/lib/supabase';
```
**Verification**:
- [ ] File uploads work correctly
- [ ] Progress indicators function
- [ ] Error handling is proper

#### `components/dashboard/FileUpload.tsx` - Basic File Upload
**Fix Required**: Same pattern as FileUploadCard
**Verification**:
- [ ] File selection works
- [ ] Upload progress is shown
- [ ] Success/error states display correctly

### 8. Agent System Components

#### `hooks/useAgentStats.ts` - Agent Statistics
**Fix Required**:
```typescript
// ❌ BEFORE (Line 2):
import { supabase } from '../utils/supabase';

// ✅ AFTER:
import { getBrowserSupabase } from '@/lib/supabase';
```
**Verification**:
- [ ] Agent stats load correctly
- [ ] Performance metrics display
- [ ] Real-time updates work

#### `hooks/useAgentLeague.ts` - Agent League Data
**Fix Required**:
```typescript
// ❌ BEFORE (Line 218):
const { supabase } = await import('@/utils/supabase');

// ✅ AFTER:
import { getBrowserSupabase } from '@/lib/supabase';
const supabase = getBrowserSupabase();
```
**Verification**:
- [ ] Agent league data loads
- [ ] Rankings display correctly
- [ ] API calls work properly

## 📋 ALWAYS-ON ROUTE VERIFICATION

### Critical Routes That Must Always Work

#### Authentication Routes
- [ ] **`/auth/callback`** - Magic link and OAuth callbacks work
  - Test: Complete sign-in flow with magic link
  - Test: OAuth provider sign-in (if configured)
  - Verify: No legacy Supabase client issues

- [ ] **`/api/health/auth`** - Authentication health check responds
  - Test: GET request returns proper status
  - Verify: Health check reflects canonical auth state
  - Check: Response time is reasonable

#### Checkout Routes  
- [ ] **`/api/checkout`** - Stripe checkout creation works
  - Test: Create checkout session for each plan type
  - Verify: Uses canonical `requireStripe()` helper
  - Check: Error handling is consistent

- [ ] **`/api/stripe/webhook`** - Webhook processing works
  - Test: Webhook signature validation
  - Verify: Payment processing completes
  - Check: Database updates occur correctly

### Route-Specific Verification Steps

#### Dashboard Routes
- [ ] `/dashboard/website` loads without errors
- [ ] `/dashboard/getting-started` shows proper onboarding
- [ ] `/dashboard/analytics/internal` shows fallback UI when disabled

#### Public Routes
- [ ] `/` (homepage) works with all flag combinations
- [ ] `/agents` displays agent grid correctly
- [ ] `/sports` shows pricing with proper Stripe integration

## 🔧 VERIFICATION COMMANDS

### Automated Checks
```bash
# Check for remaining legacy imports
grep -r "utils/supabase" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/
grep -r "utils/supabase-helpers" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/

# Check for direct Stripe usage outside canonical files
grep -r "new Stripe(" --include="*.ts" --include="*.tsx" --exclude-dir=lib/stripe app/ components/

# Verify canonical imports are used
grep -r "from '@/lib/supabase'" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/
grep -r "from '@/lib/stripe'" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/
```

### Manual Testing Checklist

#### Authentication Flow
- [ ] Sign up with email/password
- [ ] Sign in with magic link  
- [ ] Sign out and sign back in
- [ ] Access protected dashboard routes
- [ ] Verify user role detection (free/premium)

#### Payment Flow
- [ ] View pricing on `/sports` page
- [ ] Click "Buy Now" button
- [ ] Complete Stripe checkout
- [ ] Verify webhook processing
- [ ] Check subscription status in dashboard

#### Dashboard Functionality  
- [ ] Upload files in dashboard
- [ ] Interact with Percy assistant
- [ ] View agent statistics
- [ ] Check trial status and upgrade prompts
- [ ] Access ARR analytics (if enabled)

#### Feature Flag Testing
- [ ] Test with `ENABLE_STRIPE=false` - buttons show disabled state
- [ ] Test with `HP_GUIDE_STAR=false` - homepage works without guide star
- [ ] Test with `ENABLE_ARR_DASH=false` - dashboard shows fallback UI
- [ ] Test with `ENABLE_ORBIT=false` - agents page works without orbit

## 📊 COMPLETION TRACKING

### Phase 1: Critical Infrastructure (Week 1)
- [ ] `lib/auth/checkUserRole.ts` migrated and tested
- [ ] `hooks/useUser.ts` migrated and tested  
- [ ] `hooks/useTrial.ts` migrated and tested
- [ ] `lib/trial/trialManager.ts` migrated and tested
- [ ] `utils/supabase-helpers.ts` migrated and tested

### Phase 2: Dashboard & Components (Week 2)  
- [ ] All dashboard pages migrated
- [ ] Percy components migrated
- [ ] File upload components migrated
- [ ] `lib/analytics/arr.ts` migrated
- [ ] Hard gates converted to progressive enhancement

### Phase 3: Remaining Components (Week 3)
- [ ] Agent system hooks migrated
- [ ] Remaining utility components migrated
- [ ] All verification tests passing
- [ ] Documentation updated

## ✅ SUCCESS CRITERIA

### Zero Legacy Usage
- [ ] No imports from `utils/supabase`
- [ ] No imports from `utils/supabase-helpers`
- [ ] No `@supabase/supabase-js` imports outside `lib/supabase/`
- [ ] No `new Stripe()` calls outside `lib/stripe/`
- [ ] No direct Stripe env var access outside resolver

### Functional Verification
- [ ] All authentication flows work
- [ ] All payment flows work  
- [ ] All dashboard functionality works
- [ ] All feature flags work as expected
- [ ] No user-visible regressions

### Performance & Error Handling
- [ ] Error handling is consistent across all operations
- [ ] No performance regressions
- [ ] Proper fallback UI for disabled features
- [ ] Clean console logs (no legacy client warnings)

**Estimated Total Effort**: 3 weeks with 1-2 developers
**Risk Mitigation**: Test each phase thoroughly before proceeding to next phase