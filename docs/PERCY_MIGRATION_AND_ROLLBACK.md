# 🔄 Percy Component Migration & Rollback Guide

## 📋 Overview

This document provides complete instructions for managing the Percy component migration from the legacy 2,827-line version to the new optimized modular architecture.

## 🏗️ Current Architecture

### Legacy Version (DEPRECATED)
- **File**: `components/home/PercyOnboardingRevolution.tsx` (2,827 lines)
- **Backup**: `components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx`
- **Status**: ⚠️ Deprecated but functional
- **Issues**: CPU overheating, memory leaks, excessive re-renders

### Optimized Version (NEW)
- **Main Container**: `components/percy/PercyContainer.tsx`
- **Components**: 
  - `PercyAvatar.tsx` (mood system)
  - `PercyChat.tsx` (conversation interface)
  - `PercySocialProof.tsx` (social proof rotation)
  - `PercyAnimations.tsx` (performance-optimized effects)
- **Wrapper**: `components/percy/PercyOnboardingRevolutionOptimized.tsx`
- **Status**: ✅ Ready for testing

## 🚦 Feature Flag Control

### Main Toggle Location
```typescript
// File: lib/config/percyFeatureFlags.ts
export const PERCY_FEATURE_FLAGS = {
  USE_OPTIMIZED_PERCY: false, // 🚨 MAIN SWITCH
  // ... other flags
};
```

### How to Switch Versions

#### Switch to Optimized Percy:
```typescript
// In lib/config/percyFeatureFlags.ts
USE_OPTIMIZED_PERCY: true
```

#### Revert to Legacy Percy:
```typescript
// In lib/config/percyFeatureFlags.ts
USE_OPTIMIZED_PERCY: false
```

#### Environment Variable Override:
```bash
# .env.local
NEXT_PUBLIC_USE_OPTIMIZED_PERCY=true  # Use optimized
NEXT_PUBLIC_USE_OPTIMIZED_PERCY=false # Use legacy
```

## 📖 Integration Instructions

### Current Homepage Integration
```typescript
// In app/page.tsx (currently disabled for performance)
import PercyWrapper from '../components/percy/PercyWrapper';

// Replace the old component call with:
<PercyWrapper 
  onAnalysisComplete={handleAnalysisComplete}
  onAgentSelection={handleAgentSelection}
/>
```

### Force-Test Specific Version
```typescript
// Test optimized version only
<PercyWrapper forceVersion="optimized" />

// Test legacy version only  
<PercyWrapper forceVersion="legacy" />
```

## 🔄 Safe Rollback Procedures

### Emergency Rollback (Under 1 Minute)
1. **Set feature flag to false**:
   ```typescript
   // lib/config/percyFeatureFlags.ts
   USE_OPTIMIZED_PERCY: false
   ```

2. **Or set environment variable**:
   ```bash
   NEXT_PUBLIC_USE_OPTIMIZED_PERCY=false
   ```

3. **Restart development server**:
   ```bash
   npm run dev
   ```

### Complete Rollback to Original State
1. **Remove optimized components**:
   ```bash
   rm -rf components/percy/
   ```

2. **Restore original import in homepage**:
   ```typescript
   // app/page.tsx
   import PercyOnboardingRevolution from '../components/home/PercyOnboardingRevolution';
   ```

3. **Remove deprecation warnings**:
   - Remove the deprecation header block (lines 3-24)
   - Remove the `showPerformanceWarning()` import and call

### Partial Rollback (Individual Components)
```typescript
// In lib/config/percyFeatureFlags.ts
export const PERCY_FEATURE_FLAGS = {
  USE_OPTIMIZED_PERCY: true,
  
  // Disable specific components if they have issues
  ENABLE_PERCY_AVATAR: false,        // Fallback for avatar
  ENABLE_PERCY_CHAT: false,          // Fallback for chat
  ENABLE_PERCY_SOCIAL_PROOF: false,  // Fallback for social proof
  ENABLE_PERCY_ANIMATIONS: false,    // Fallback for animations
};
```

## 📊 Monitoring & Testing

### Performance Monitoring
```typescript
// Check console for performance warnings
console.log('Percy performance metrics');

// Memory usage
console.log('Memory:', performance.memory?.usedJSHeapSize);

// Active intervals count
console.log('Intervals:', /* monitor active setInterval calls */);
```

### Testing Checklist
- [ ] Homepage loads without white screen
- [ ] Percy avatar displays and animates
- [ ] Chat interface responds to input
- [ ] Social proof rotates (every 30s)
- [ ] No CPU overheating after 5 minutes
- [ ] Navigation to other pages works
- [ ] Browser dev tools show no memory leaks

## 🗂️ File Management Strategy

### What to Keep
- ✅ **Archive folder**: `components/percy/archive/` (backup safety)
- ✅ **Feature flags**: `lib/config/percyFeatureFlags.ts` (control system)
- ✅ **Legacy component**: `components/home/PercyOnboardingRevolution.tsx` (marked deprecated)
- ✅ **New components**: `components/percy/*.tsx` (optimized versions)

### What's Safe to Remove (WITH APPROVAL ONLY)
- ⚠️ **Legacy component** after 30 days of successful optimized usage
- ⚠️ **Archive folder** after confirming no rollback needed
- ⚠️ **Feature flags** after permanent migration

### DO NOT DELETE
- 🚫 Never delete backup files without explicit approval
- 🚫 Don't remove feature flags until migration is 100% confirmed
- 🚫 Keep migration documentation for future reference

## 🛠️ Development Tools

### Version Toggle (Development Only)
When `NODE_ENV=development`, the Percy wrapper shows:
- Version indicator badge
- Quick toggle button
- Performance metrics in console

### Debug Commands
```bash
# Check current version being used
grep -r "USE_OPTIMIZED_PERCY" lib/config/

# Find Percy imports across codebase
grep -r "PercyOnboarding" app/ components/

# Monitor memory usage
node --inspect npm run dev
```

## 📞 Emergency Contacts & Documentation

### Quick Reference Links
- **Feature Flags**: `lib/config/percyFeatureFlags.ts`
- **Legacy Backup**: `components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx`
- **New Wrapper**: `components/percy/PercyWrapper.tsx`
- **Integration Point**: `app/page.tsx`

### Troubleshooting
1. **White screen**: Set `USE_OPTIMIZED_PERCY: false`
2. **CPU overheating**: Disable animations or revert to legacy
3. **Import errors**: Check file paths and make sure all Percy components exist
4. **Performance issues**: Enable performance monitoring flags

---

## ⚠️ IMPORTANT REMINDERS

1. **Always test changes locally** before deploying
2. **Keep backups until migration is 100% confirmed**
3. **Monitor performance metrics** for at least 1 week
4. **Document any issues** encountered during migration
5. **Get approval before deleting any legacy code**

Last updated: January 2025
Migration status: Ready for testing
Risk level: Low (full rollback capability maintained)