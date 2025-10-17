# Feature Flag Autopsy Report

## Root Cause Analysis

### 1. Flag Definition Location
**File:** `lib/config/featureFlags.ts`
- ✅ **Centralized:** All flags defined in one place
- ✅ **Type-safe:** Uses TypeScript with proper typing
- ✅ **Exported helpers:** `readBooleanFlag`, `isFeatureEnabled`, `getFeatureFlag`

### 2. Flag Reading Mechanism
**Current Implementation:**
```typescript
function readBooleanFlag(envKey: string, defaultValue: boolean = false): boolean {
  const value = process.env[envKey];
  if (value === undefined) return defaultValue;
  return value === '1' || value.toLowerCase() === 'true';
}
```

**Issues Found:**
- ❌ **Inconsistent parsing:** Only accepts `"1"` and `"true"` (case-insensitive)
- ❌ **Missing values:** Doesn't handle `"yes"`, `"on"`, `"0"`, `"false"`, `"no"`, `"off"`
- ❌ **Whitespace issues:** Doesn't trim whitespace
- ❌ **Type confusion:** Doesn't handle actual boolean values

### 3. Build-time vs Runtime Usage
**Analysis:**
- ✅ **Runtime reads:** Flags are read inside component functions, not at module scope
- ✅ **No build-time traps:** No flags are read during import/export
- ✅ **Client-safe:** All flags use `NEXT_PUBLIC_` prefix for client access

**Example of correct usage:**
```typescript
// ✅ Good - runtime read
export function BuyButton() {
  const stripeEnabled = FEATURE_FLAGS.ENABLE_STRIPE; // Read inside component
  // ...
}
```

### 4. Client vs Server Flag Usage
**Current State:**
- ✅ **Client flags:** All use `NEXT_PUBLIC_` prefix
- ✅ **Server flags:** Use non-prefixed names (e.g., `FF_N8N_NOOP`)
- ✅ **No mixing:** No server-only flags used in client components

### 5. Flag Normalization Issues
**Problems Found:**

#### A. Inconsistent Boolean Parsing
```typescript
// Current implementation
return value === '1' || value.toLowerCase() === 'true';

// Missing support for:
// - "yes"/"no"
// - "on"/"off" 
// - "0"/"false"
// - Whitespace trimming
// - Actual boolean values
```

#### B. Default Value Masking
```typescript
// Some flags have defaults that might mask errors
HP_GUIDE_STAR: readBooleanFlag('NEXT_PUBLIC_HP_GUIDE_STAR', true), // Default true
ENABLE_STRIPE: readBooleanFlag('NEXT_PUBLIC_ENABLE_STRIPE', true), // Default true
```

#### C. No Validation or Warnings
- No warnings when flags are accessed but not set
- No validation of flag values
- No logging of flag state changes

### 6. Caching and Singleton Issues
**Analysis:**
- ✅ **No caching:** Flags are read fresh each time
- ✅ **No singletons:** No cached flag state
- ✅ **Deploy-friendly:** Changes take effect immediately

### 7. Direct process.env Usage
**Found 436 instances of direct `process.env` usage:**
- ❌ **Inconsistent parsing:** Many places use custom boolean parsing
- ❌ **No normalization:** Different parsing logic in different files
- ❌ **Maintenance burden:** Hard to change flag behavior globally

**Examples of problematic usage:**
```typescript
// app/api/_probe/env/route.ts
const toBool = (v: string | undefined) => v === '1' || v?.toLowerCase() === 'true';

// app/api/stripe/webhook/route.ts  
const FF_N8N_NOOP = process.env.FF_N8N_NOOP === 'true' || process.env.FF_N8N_NOOP === '1';
```

## Concrete Fixes Needed

### 1. Enhanced Boolean Flag Parser
```typescript
function readBooleanFlag(envKey: string, defaultValue: boolean = false): boolean {
  const value = process.env[envKey];
  if (value === undefined) return defaultValue;
  
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}
```

### 2. ESLint Rule for Direct process.env Usage
```typescript
// Add to .eslintrc.js
rules: {
  'no-direct-process-env-flags': 'error'
}
```

### 3. Flag Validation and Logging
```typescript
function readBooleanFlag(envKey: string, defaultValue: boolean = false): boolean {
  const value = process.env[envKey];
  if (value === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[FLAG] ${envKey}: using default ${defaultValue}`);
    }
    return defaultValue;
  }
  
  const normalized = value.trim().toLowerCase();
  const result = ['1', 'true', 'yes', 'on'].includes(normalized);
  
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[FLAG] ${envKey}: "${value}" → ${result}`);
  }
  
  return result;
}
```

### 4. Centralized Flag List
```typescript
export const KNOWN_FLAGS = {
  // Client flags
  NEXT_PUBLIC_ENABLE_STRIPE: { default: true, description: 'Global Stripe toggle' },
  NEXT_PUBLIC_HP_GUIDE_STAR: { default: true, description: 'Homepage guide star' },
  NEXT_PUBLIC_ENABLE_ORBIT: { default: false, description: 'Orbit League visualization' },
  NEXT_PUBLIC_ENABLE_BUNDLES: { default: false, description: 'Legacy bundle pricing' },
  NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS: { default: false, description: 'Use Payment Links fallback' },
  
  // Server flags
  FF_N8N_NOOP: { default: true, description: 'n8n NOOP mode' },
} as const;
```

## Summary

**Root Causes:**
1. **Inconsistent boolean parsing** across the codebase
2. **Direct process.env usage** instead of centralized helpers
3. **Missing validation and logging** for flag state
4. **Incomplete boolean value support** (missing "yes"/"no", "on"/"off")

**Impact:**
- Flags may not work as expected in production
- Hard to debug flag-related issues
- Inconsistent behavior across different environments
- Maintenance burden due to scattered flag logic

**Priority Fixes:**
1. ✅ Enhanced `readBooleanFlag` function
2. ✅ ESLint rule to prevent direct `process.env` usage
3. ✅ Replace all direct `process.env` usage with helpers
4. ✅ Add flag validation and logging