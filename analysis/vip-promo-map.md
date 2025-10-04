# VIP/Promo/Access Levels Map

## Overview
Complete documentation of promo codes, VIP access, access levels, and how they gate features across the platform.

---

## Access Level System

### Three-Tier Access Model

| Level | Description | How Obtained | Features |
|-------|-------------|--------------|----------|
| **free** | Default tier | Sign-up without code | Basic platform access |
| **promo** | Promo code tier | Redeem promo code | Enhanced features, limited-time benefits |
| **vip** | VIP tier | Redeem VIP code OR recognition | Premium features, priority support, custom benefits |

### Source of Truth

**Database Table**: `user_dashboard_access`  
**Columns**:
- `user_id` (UUID)
- `email` (text)
- `access_level` ('free' | 'promo' | 'vip')
- `is_vip` (boolean)
- `benefits` (JSONB)
- `metadata` (JSONB)

**Detection Logic** (`lib/auth/dashboardAuth.ts`):
```typescript
export interface DashboardAuthResponse {
  success: boolean;
  user?: any;
  accessLevel?: 'free' | 'promo' | 'vip';  // ← Three levels
  promoRedeemed?: boolean;
  vipStatus?: any;
  benefits?: any;
}
```

---

## Promo Code System (Detailed)

### Code Types

**Two code types exist**:
1. **PROMO** - Standard promotional codes
2. **VIP** - VIP access codes (higher tier)

### Code Storage

**Database Table**: `promo_codes` OR `codes`  
(Two systems found - see "Multiple Code Systems" below)

**Schema 1** (`promo_codes` table):
```sql
- code (text, unique)
- type ('PROMO' | 'VIP')
- status ('active' | 'inactive')
- expires_at (timestamp)
- usage_limit (integer)
- current_usage (integer)
- benefits (JSONB)
```

**Schema 2** (`codes` table):
```sql
- code (text, unique)
- code_type ('promo' | 'vip')
- access_level_granted ('free' | 'promo' | 'vip')
- is_active (boolean)
- expires_at (timestamp)
- benefits (JSONB)
```

### Redemption Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT: User enters code during sign-up or sign-in         │
│  Form fields: email, password, [promoCode OR vipCode]       │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│  AUTH CONTEXT: signIn() or signUp()                         │
│  ├─ Authenticates user first                                │
│  ├─ If code provided: calls /api/auth/apply-code            │
│  └─ Updates local state with new access level               │
└──────────────────┬──────────────────────────────────────────┘
                   │ OR directly call API
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  API: /api/auth/apply-code                                  │
│  POST { code, codeType }                                     │
│  ├─ 1. Validates code from 'codes' table                    │
│  ├─ 2. Checks: is_active, expires_at, not already used      │
│  ├─ 3. Inserts into 'user_codes' table                      │
│  ├─ 4. Updates 'user_dashboard_access' with new level       │
│  └─ 5. Returns: { success, message }                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│  ALTERNATIVE: /api/promo/validate                            │
│  GET or POST { code, userEmail? }                           │
│  ├─ Validates code format                                    │
│  ├─ Checks against hardcoded VALID_PROMO_CODES              │
│  └─ Returns: { valid, discount?, tier?, message }           │
└─────────────────────────────────────────────────────────────┘
```

### ⚠️ Multiple Code Systems Detected!

#### System 1: Database-Driven (via `lib/auth/dashboardAuth.ts`)
**Location**: `lib/auth/dashboardAuth.ts:241-297`

**Function**: `validateAndRedeemCode(code, userId, email)`

**Database Tables**:
- `promo_codes` - Code definitions
- `user_codes` - Redemption records (via `/api/auth/apply-code`)
- `user_dashboard_access` - Access level storage

**Flow**:
```typescript
await supabase.rpc('redeem_promo_code', {
  p_code: code,
  p_user_id: userId,
  p_email: email
})
```

**Status**: ✅ **ACTIVE** - Used in production auth flows

#### System 2: Hardcoded Promo Codes (via `/api/promo/validate`)
**Location**: `app/api/promo/validate/route.ts:17-46`

**Hardcoded Codes**:
```typescript
const VALID_PROMO_CODES = {
  'VIP50': { discount: 50, tier: 'VIP50', expiresAt: '2025-12-31' },
  'PREMIUM25': { discount: 25, tier: 'PREMIUM25', expiresAt: '2025-06-30' },
  'LAUNCH10': { discount: 10, tier: 'LAUNCH10', expiresAt: '2025-03-31' },
  'SKRBLAI2025': { discount: 30, tier: 'PREMIUM25', expiresAt: '2025-02-28' }
};
```

**Status**: ⚠️ **UNCLEAR** - Not integrated with auth system, returns validation only (no redemption)

**Issue**: Two separate promo systems that don't talk to each other!

---

## VIP Recognition System

### VIP Status Detection

**Database Table**: `vip_users`  
**Columns**:
- `email` (text, primary key)
- `is_vip` (boolean)
- `vip_level` ('standard' | 'gold' | 'platinum' | ?)
- `vip_score` (integer)
- `company_name` (text)
- `recognition_count` (integer)

**Check Function** (`lib/auth/dashboardAuth.ts:302-338`):
```typescript
export async function checkVIPStatus(email: string) {
  const { data: vipData } = await supabase
    .from('vip_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (!vipData) {
    return { isVIP: false, vipLevel: 'standard' };
  }

  return {
    isVIP: vipData.is_vip || vipData.vip_level !== 'standard',
    vipLevel: vipData.vip_level,
    vipScore: vipData.vip_score,
    companyName: vipData.company_name,
    recognitionCount: vipData.recognition_count
  };
}
```

**When Checked**:
- Sign-in (`authenticateForDashboard()` - line 194)
- Sign-up (`registerUserForDashboard()` - line 673)
- Dashboard access check (`useAuth()` hook - lines 169-205)

### VIP API Endpoints

1. **`/api/vip/recognition`** - VIP recognition logic
2. **`/api/vip/proposal-automation`** - VIP-specific automation

**Status**: Not fully detailed in provided files

---

## How Access Levels are Determined

### Priority Order (Sign-Up)

From `lib/auth/dashboardAuth.ts:702-704`:
```typescript
const accessLevel = promoRedeemed 
  ? (request.vipCode ? 'vip' : 'promo')
  : (vipStatus?.isVIP ? 'vip' : 'free');
```

**Logic**:
1. If VIP code redeemed → **vip**
2. Else if promo code redeemed → **promo**
3. Else if email in `vip_users` table → **vip**
4. Else → **free**

### Priority Order (Sign-In)

Similar logic, but also checks existing `user_dashboard_access` table.

---

## Where Access Levels are Used

### 1. **Dashboard Routing** (`app/dashboard/page.tsx`)

**Lines 82-160**: Complex role-based routing logic

```typescript
const { user, accessLevel, vipStatus } = useAuth();

// Founder check (via sessionStorage or API)
if (founderAccess) {
  router.push('/dashboard/founder');
} 
// VIP check
else if (accessLevel === 'vip' || vipStatus?.isVIP) {
  router.push('/dashboard/vip');
}
// Regular users
else if (accessLevel === 'promo' || accessLevel === 'free') {
  router.push('/dashboard/user');
}
```

**Access Hierarchy**:
1. Founder role → `/dashboard/founder`
2. Heir role → `/dashboard/heir`
3. VIP level → `/dashboard/vip`
4. Promo/Free → `/dashboard/user`

### 2. **AuthContext** (`components/context/AuthContext.tsx`)

**State Variables** (lines 9-14):
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  accessLevel?: 'free' | 'promo' | 'vip';  // ← Exposed to all components
  vipStatus?: any;
  benefits?: any;
  // ... auth methods
}
```

**Consumers**: Any component using `useAuth()` can check `accessLevel` and `vipStatus`

### 3. **API Route Protection**

**Example**: `/api/agents/ira/is-allowed`  
(Not detailed in provided files, but likely checks access level)

### 4. **Feature Gating** (Inferred)

Components can conditionally render based on:
```typescript
const { accessLevel } = useAuth();

{accessLevel === 'vip' && (
  <VIPFeature />
)}

{accessLevel !== 'free' && (
  <PremiumFeature />
)}
```

**Finding**: No explicit feature gates found in provided code. Access levels primarily used for dashboard routing.

---

## Founder System (Parallel Access System)

### Founder Roles

**Three roles detected**:
1. **founder** or **creator** - Full founder access
2. **heir** - Heir role (inheritor?)
3. **parent** - Parent portal (sports-related?)

### Founder Detection

**Sources**:
1. **SessionStorage** (temporary):
   - `founder_role` - Role name
   - `founder_access` - Boolean flag

2. **API Check** (`/api/founders/me`):
   ```typescript
   fetch('/api/founders/me')
     .then(data => {
       if (data.founderAccess) {
         // Route based on isCreator, isFounder, isHeir
       }
     })
   ```

3. **Email Domain** (`app/dashboard/page.tsx:137`):
   ```typescript
   if (user.email?.includes('@skrbl.ai') || vipStatus?.vipLevel === 'founder') {
     router.push('/dashboard/founder');
   }
   ```

### Founder Code Redemption

**API**: `/api/founders/redeem`  
**Table**: Likely `founder_codes` or similar

**Status**: Not fully detailed in provided files

---

## All Code-Related Routes

| Route | Purpose | Code Type | Status |
|-------|---------|-----------|--------|
| `/api/auth/apply-code` | Apply promo/VIP code to user | PROMO or VIP | ✅ ACTIVE |
| `/api/promo/validate` | Validate promo code (no redemption) | PROMO | ⚠️ UNCLEAR |
| `/api/codes/resolve` | Resolve code details | ? | ❓ NOT DETAILED |
| `/api/founders/redeem` | Redeem founder code | FOUNDER | ✅ ACTIVE |
| `/api/vip/recognition` | VIP recognition logic | VIP | ✅ ACTIVE |

---

## Bundled Products (VIP Context)

### Bundle Detection in Catalog

**From `lib/pricing/catalog.ts:18`**:
```typescript
KEY_ALIASES = {
  'BUNDLE_ALL_ACCESS': 'ALL_STAR',
  'sports_all_star_one_time': 'ALL_STAR',
  // ...
}
```

**Bundle Product** (`lib/pricing/catalog.ts:410-423`):
```typescript
BUNDLE_ALL_ACCESS: {
  one_time: {
    name: 'All Access Bundle',
    blurb: 'Unlock every tool & agent',
    currency: 'USD',
    interval: 'one_time',
    amountCents: 9900,
    amount: 99,
    features: ['Everything included', 'Lifetime updates']
  }
}
```

**Status**: Legacy bundle product, aliased to ALL_STAR tier

---

## Upgrade Paths

### From Free to Promo
- Redeem promo code via sign-in/sign-up or `/api/auth/apply-code`

### From Promo to VIP
- Redeem VIP code
- Get recognized in `vip_users` table

### From Free/Promo to Founder
- Redeem founder code via `/api/founders/redeem`
- Or be added to founder list

### Downgrade?
**Finding**: No explicit downgrade logic found. Access levels can be manually updated in database.

---

## Conflicts with Feature Flags

### No Direct Conflicts Found

**Finding**: Access levels (`free`/`promo`/`vip`) and feature flags (`HP_GUIDE_STAR`, `ENABLE_ORBIT`, etc.) operate independently.

**Potential Conflict**: If a feature is:
- Gated by flag (e.g., `ENABLE_ORBIT=false`)
- AND promised in VIP benefits

Result: VIP users still won't see feature if flag is off.

**Recommendation**: Document which features are:
- Flag-gated (experimental)
- Access-level-gated (paid)
- Both (experimental + paid)

---

## Historical Code Systems (Oldest to Newest)

### 1. **Hardcoded Validation** (Old)
**Location**: `/api/promo/validate/route.ts`  
**Era**: Early implementation  
**Status**: 🕰️ May be legacy or separate from main system

### 2. **Database-Driven Codes** (Current)
**Location**: `lib/auth/dashboardAuth.ts` + `/api/auth/apply-code`  
**Tables**: `promo_codes` OR `codes`, `user_codes`, `user_dashboard_access`  
**Era**: Current production system  
**Status**: ✅ **ACTIVE**

### 3. **Founder Codes** (Parallel)
**Location**: `/api/founders/redeem`  
**Era**: Founder program implementation  
**Status**: ✅ **ACTIVE** (separate from promo/VIP)

### 4. **VIP Recognition** (Parallel)
**Location**: `vip_users` table + `/api/vip/recognition`  
**Era**: VIP program implementation  
**Status**: ✅ **ACTIVE** (can grant VIP without code)

**Total Systems**: 4 different wiring setups for access control!

---

## Summary Table

| System | Grants | Table(s) | API Route(s) | Status |
|--------|--------|----------|--------------|--------|
| **Promo Codes** | `promo` access | `promo_codes` OR `codes`, `user_codes` | `/api/auth/apply-code` | ✅ ACTIVE |
| **VIP Codes** | `vip` access | `promo_codes` OR `codes`, `user_codes` | `/api/auth/apply-code` | ✅ ACTIVE |
| **VIP Recognition** | `vip` access | `vip_users` | `/api/vip/recognition` | ✅ ACTIVE |
| **Founder Codes** | Founder role | (unknown) | `/api/founders/redeem` | ✅ ACTIVE |
| **Hardcoded Promos** | None (validation only) | N/A (hardcoded) | `/api/promo/validate` | ⚠️ UNCLEAR |

---

## Recommendations

### 1. **Consolidate Promo Systems**
- Decide: Database-driven (`/api/auth/apply-code`) OR hardcoded (`/api/promo/validate`)?
- If database-driven is canonical, remove hardcoded promo validation
- If hardcoded is for special campaigns, rename to `/api/promo/validate-campaign`

### 2. **Document Access Hierarchy**
```
Founder Role (highest)
  ↓
VIP Access Level
  ↓
Promo Access Level
  ↓
Free Access Level (default)
```

### 3. **Clarify Code Table Schema**
- Are `promo_codes` and `codes` tables the same? Different?
- Standardize on one table name

### 4. **Feature-Flag vs Access-Level Matrix**
Create matrix showing which features require:
- Feature flag enabled
- Specific access level
- Both

### 5. **Audit VIP Benefits**
- What features do VIP users actually get?
- Are they properly gated?
- Do flags override VIP benefits?

---

## Fix It Steps

1. **Map all code types**: `SELECT DISTINCT code_type FROM codes;`
2. **Audit tables**: Confirm `promo_codes` vs `codes` table usage
3. **Test redemption**: Redeem promo code, VIP code, founder code - verify flow
4. **Document benefits**: List concrete benefits for each access level
5. **Remove hardcoded**: If `/api/promo/validate` is unused, archive it
6. **Create access matrix**: Document all access-gated features
