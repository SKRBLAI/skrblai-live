# Legacy Supabase Usage Analysis

## Executive Summary

**Total Offenders Found**: 38 files with legacy Supabase usage patterns
**Risk Level**: HIGH - Multiple files bypass canonical @/lib/supabase imports
**Impact**: Authentication, data access, and user management functionality

## Legacy Usage Patterns

### 1. utils/supabase Imports (38 files)

All files importing from `utils/supabase` instead of canonical `@/lib/supabase`:

#### High-Risk Files (Core Functionality)

**File**: `lib/trial/trialManager.ts`
- **Line**: 6
- **Code**: `import { supabase } from '../../utils/supabase';`
- **Context**: Server utility
- **Route Impact**: All dashboard pages requiring trial status
- **Flags**: None detected
- **Gate Type**: N/A - utility function

**File**: `lib/auth/checkUserRole.ts`
- **Line**: 1-2
- **Code**: 
```typescript
import { supabase } from '../../utils/supabase';
import { getCurrentUser } from '../../utils/supabase-helpers';
```
- **Context**: Server utility
- **Route Impact**: All protected routes
- **Flags**: None detected
- **Gate Type**: N/A - auth utility

**File**: `hooks/useUser.ts`
- **Line**: 2
- **Code**: `import { supabase } from '../utils/supabase';`
- **Context**: Client hook
- **Route Impact**: All pages using user context
- **Flags**: None detected
- **Gate Type**: N/A - global hook

**File**: `hooks/useTrial.ts`
- **Line**: 5
- **Code**: `import { getCurrentUser } from '../utils/supabase-helpers';`
- **Context**: Client hook
- **Route Impact**: Dashboard pages with trial gating
- **Flags**: None detected
- **Gate Type**: N/A - trial hook

#### Dashboard Pages (4 files)

**File**: `app/dashboard/website/page.tsx`
- **Line**: 13
- **Code**: `import { getCurrentUser } from '../../../utils/supabase-helpers';`
- **Context**: Server page
- **Route Impact**: `/dashboard/website`
- **Flags**: None detected
- **Gate Type**: N/A - page component

**File**: `app/dashboard/getting-started/page.tsx`
- **Line**: 11
- **Code**: `import { getCurrentUser } from '../../../utils/supabase-helpers';`
- **Context**: Server page
- **Route Impact**: `/dashboard/getting-started`
- **Flags**: None detected
- **Gate Type**: N/A - page component

#### Component Files (15+ files)

**File**: `components/ui/UniversalPromptBar.tsx`
- **Line**: 6-7
- **Code**: 
```typescript
import { uploadFileToStorage } from '../../utils/supabase-helpers';
import { supabase } from '../../utils/supabase';
```
- **Context**: Client component
- **Route Impact**: Multiple pages with prompt bar
- **Flags**: None detected
- **Gate Type**: N/A - UI component

**File**: `components/percy/PercyWidget.tsx`
- **Line**: 5, 9
- **Code**: 
```typescript
import { supabase } from '../../utils/supabase';
import { getCurrentUser } from '../../utils/supabase-helpers';
```
- **Context**: Client component
- **Route Impact**: Pages with Percy widget
- **Flags**: None detected
- **Gate Type**: N/A - widget component

### 2. Direct @supabase/supabase-js Imports (31 files)

Files importing directly from `@supabase/supabase-js`:

#### Canonical Files (Allowed)
- `lib/supabase/client.ts` - ✅ Canonical implementation
- `lib/supabase/browser.ts` - ✅ Canonical implementation  
- `lib/supabase/server.ts` - ✅ Canonical implementation

#### Legacy Files (Problematic)
- `utils/supabase-helpers.ts` - ❌ Should use canonical imports
- `lib/email/simpleAutomation.ts` - ❌ Direct createClient usage
- `supabase/functions/post-payment-automation/index.ts` - ⚠️ Edge function (acceptable)

### 3. createClient Calls Outside lib/supabase (17 files)

**File**: `supabase/functions/post-payment-automation/index.ts`
- **Line**: 30
- **Code**: `const supabase = createClient(supabaseUrl, supabaseAnonKey)`
- **Context**: Edge function
- **Route Impact**: `/api/stripe/webhook` automation
- **Flags**: None
- **Gate Type**: N/A - acceptable for edge functions

**File**: `scripts/create-marketing-promo-codes.js`
- **Line**: 25
- **Code**: `const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);`
- **Context**: Script
- **Route Impact**: None (script only)
- **Flags**: None
- **Gate Type**: N/A - script usage

## Route Impact Analysis

### Critical Routes Affected

1. **Authentication Routes**
   - `/auth/callback` - Uses legacy auth helpers
   - `/api/health/auth` - May use legacy patterns

2. **Dashboard Routes**
   - `/dashboard/website` - Direct legacy imports
   - `/dashboard/getting-started` - Direct legacy imports
   - All dashboard pages using trial/user hooks

3. **API Routes**
   - `/api/stripe/calculate-tax` - Uses `utils/supabase`

### User-Visible Impact

- **Authentication flows**: May fail if legacy client misconfigured
- **Dashboard functionality**: Trial status, user data loading
- **File uploads**: Storage operations via legacy helpers
- **Percy interactions**: Chat memory, user context

## Feature Flag Analysis

**No feature flags detected** that gate Supabase usage. All legacy imports are unconditional.

## Risk Assessment

### High Risk (Immediate Fix Required)
1. `lib/auth/checkUserRole.ts` - Core auth functionality
2. `lib/trial/trialManager.ts` - Trial system
3. `hooks/useUser.ts` - Global user state
4. `hooks/useTrial.ts` - Trial state management

### Medium Risk (Should Fix Soon)
1. Dashboard pages with direct imports
2. Percy components with legacy patterns
3. File upload components

### Low Risk (Can Wait)
1. Test files
2. Archive/backup files
3. Documentation files

## Recommended Fixes

### Phase 1: Core Infrastructure
```typescript
// lib/auth/checkUserRole.ts
- import { supabase } from '../../utils/supabase';
- import { getCurrentUser } from '../../utils/supabase-helpers';
+ import { getServerSupabaseAdmin } from '@/lib/supabase';
+ import { getCurrentUser } from '@/lib/supabase/helpers';
```

### Phase 2: Hooks and Components
```typescript
// hooks/useUser.ts
- import { supabase } from '../utils/supabase';
+ import { getBrowserSupabase } from '@/lib/supabase';
```

### Phase 3: Dashboard Pages
```typescript
// app/dashboard/*/page.tsx
- import { getCurrentUser } from '../../../utils/supabase-helpers';
+ import { getCurrentUser } from '@/lib/supabase/helpers';
```

## Verification Checklist

- [ ] All `utils/supabase` imports replaced with `@/lib/supabase`
- [ ] All `utils/supabase-helpers` imports replaced with canonical helpers
- [ ] No direct `@supabase/supabase-js` imports outside `lib/supabase/`
- [ ] No `createClient` calls outside `lib/supabase/`
- [ ] Authentication flows tested
- [ ] Dashboard functionality verified
- [ ] File upload operations tested