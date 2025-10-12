# Legacy Supabase/Stripe Usage Scan - Complete Analysis Index

## 📋 Executive Summary

**Scan Completed**: 2025-10-12  
**Scope**: app/**, components/**, lib/**, utils/**, pages/**, server/**, scripts/**, middleware.ts, next.config.js, analysis/**

**Overall Status**: 🔴 **CRITICAL ISSUES FOUND**
- **Supabase Legacy Usage**: 38 files bypassing canonical @/lib/supabase imports
- **Stripe Legacy Usage**: 1 file bypassing canonical @/lib/stripe helpers  
- **Feature Flag Issues**: 2 hard gates that return null instead of fallback UI
- **MMM Compliance**: 65% - Significant work needed for full canonical adoption

## 🎯 Top 10 Critical Offenders

| Rank | File | Issue | Impact | Risk |
|------|------|-------|--------|------|
| 1 | `utils/supabase-helpers.ts` | Legacy bridge used by 38+ files | ALL Supabase operations | 🔴 CRITICAL |
| 2 | `lib/auth/checkUserRole.ts` | Core auth uses legacy client | ALL protected routes | 🔴 CRITICAL |
| 3 | `hooks/useUser.ts` | Global user state uses legacy client | ALL pages with user context | 🔴 CRITICAL |
| 4 | `hooks/useTrial.ts` | Trial system uses legacy helpers | Dashboard trial gating | 🔴 CRITICAL |
| 5 | `lib/trial/trialManager.ts` | Trial management uses legacy client | Trial functionality | 🔴 CRITICAL |
| 6 | `app/dashboard/analytics/internal/page.tsx` | Hard gate returns null | ARR dashboard disappears | 🟡 HIGH |
| 7 | `lib/analytics/arr.ts` | Direct Stripe instantiation | ARR analytics error handling | 🟡 HIGH |
| 8 | `app/dashboard/website/page.tsx` | Legacy helper imports | Website dashboard data | 🟡 HIGH |
| 9 | `app/dashboard/getting-started/page.tsx` | Legacy helper imports | Onboarding flow | 🟡 HIGH |
| 10 | `components/percy/PercyWidget.tsx` | Legacy Supabase usage | Percy chat functionality | 🟡 MEDIUM |

## 📊 Analysis Artifacts

### Core Reports

#### 1. [LEGACY_SUPABASE_LIST.md](./LEGACY_SUPABASE_LIST.md)
**38 files with legacy Supabase usage patterns**
- Complete list of utils/supabase imports
- Direct @supabase/supabase-js usage outside canonical files  
- createClient calls outside lib/supabase/
- Route impact analysis for each file
- Risk assessment and recommended fixes

**Key Findings**:
- 38 files bypassing canonical @/lib/supabase imports
- Core auth infrastructure heavily affected
- All dashboard pages using legacy patterns
- Percy components with legacy Supabase usage

#### 2. [LEGACY_STRIPE_LIST.md](./LEGACY_STRIPE_LIST.md)  
**6 files with legacy Stripe usage patterns (mostly cleaned up)**
- Legacy utils/stripe imports (resolved - file deleted)
- Direct new Stripe() calls outside allowed locations
- Direct price environment variable access
- Feature flag integration analysis

**Key Findings**:
- 95% Stripe compliance achieved
- Only 1 remaining legacy file: `lib/analytics/arr.ts`
- All checkout flows using canonical patterns
- Price resolution fully canonical

#### 3. [FLAG_GATES_SUPABASE_STRIPE.md](./FLAG_GATES_SUPABASE_STRIPE.md)
**11 feature flags affecting auth/pricing/checkout/dashboards**
- Hard gates that return null (problematic)
- Progressive enhancement patterns (good)
- Core route impact analysis
- Always-on route verification

**Key Findings**:
- 2 hard gates need conversion to progressive enhancement
- 9 flags using proper fallback patterns  
- 4 core routes always accessible
- ARR dashboard hard-gated (problematic)

#### 4. [ROUTE_IMPACT_MAP.md](./ROUTE_IMPACT_MAP.md)
**Complete tracing from legacy files to user-facing routes**
- Import chains showing how legacy usage affects routes
- User-visible impact analysis
- Mermaid diagrams showing dependency flows
- Risk assessment by route

**Key Findings**:
- All dashboard routes affected by legacy Supabase usage
- Authentication flows use legacy patterns
- File upload functionality at risk
- Percy interactions may lose context/memory

#### 5. [MMM_COMPLIANCE_REPORT.md](./MMM_COMPLIANCE_REPORT.md)
**Canonical import verification and compliance scoring**
- 65% overall MMM compliance
- Supabase: 35% compliant (major issues)
- Stripe: 95% compliant (nearly complete)
- Migration priority and phases

**Key Findings**:
- 38 files need Supabase migration to canonical imports
- 1 file needs Stripe migration to canonical helper
- Core infrastructure most affected
- utils/supabase-helpers.ts acts as "legacy bridge"

#### 6. [FIX_CHECKLIST.md](./FIX_CHECKLIST.md)
**File-by-file fixes ordered by risk with verification steps**
- Critical fixes (fix immediately)
- High priority fixes (fix this week)  
- Medium priority fixes (fix next week)
- Always-on route verification
- Automated testing commands

**Key Sections**:
- 🚨 Critical: Core auth infrastructure (5 files)
- 🔥 High Priority: Dashboard pages and ARR analytics (4 files)
- ⚠️ Medium Priority: Percy and file upload components (10+ files)

### Supporting Data

#### CSV Exports
- [LEGACY_SUPABASE_LIST.csv](./LEGACY_SUPABASE_LIST.csv) - Machine-readable Supabase offenders
- [LEGACY_STRIPE_LIST.csv](./LEGACY_STRIPE_LIST.csv) - Machine-readable Stripe offenders

#### JSON Data
- [FLAG_GATES_SUPABASE_STRIPE.json](./FLAG_GATES_SUPABASE_STRIPE.json) - Structured flag analysis data

## 🚨 Critical Issues Summary

### Immediate Action Required

#### 1. Supabase Legacy Usage Crisis
- **38 files** bypassing canonical @/lib/supabase imports
- **Core auth infrastructure** using legacy patterns
- **All dashboard functionality** at risk
- **User data operations** may fail unpredictably

#### 2. Feature Flag Hard Gates  
- **ARR dashboard** returns null when disabled (blank page)
- **Legacy components** return null instead of migration notices
- **Users see broken experiences** instead of informative messages

#### 3. MMM Compliance Gaps
- **65% compliance** - significant work needed
- **Supabase integration** only 35% canonical
- **Core infrastructure** needs complete migration

### User-Visible Impact

#### Authentication Issues
- Login/logout may fail unpredictably
- User role detection may be incorrect
- Session management inconsistent
- Protected routes may not work properly

#### Dashboard Functionality
- User data may not load
- File uploads may fail silently
- Trial status may be incorrect
- Premium features may not work

#### Percy AI Assistant  
- Chat memory may not save
- User context may be lost
- Conversations may not persist
- Personalization may fail

## 📈 Compliance Metrics

### Current Status
```
Supabase Canonical Usage:  ████████░░ 35%
Stripe Canonical Usage:    ███████████████████░ 95%  
Overall MMM Compliance:    █████████████░░░░░░░ 65%
Feature Flag Compliance:   ████████████████████ 82%
Always-On Route Status:    ████████████████████ 100%
```

### Target Goals
```
Supabase Canonical Usage:  ████████████████████ 100%
Stripe Canonical Usage:    ████████████████████ 100%  
Overall MMM Compliance:    ████████████████████ 100%
Feature Flag Compliance:   ████████████████████ 100%
Always-On Route Status:    ████████████████████ 100%
```

## 🛠 Recommended Action Plan

### Phase 1: Critical Infrastructure (Week 1)
**Priority**: 🔴 CRITICAL - Fix immediately
**Files**: 5 core infrastructure files
**Impact**: Fixes authentication and user management for entire app

1. Migrate `utils/supabase-helpers.ts` to use canonical clients
2. Update `lib/auth/checkUserRole.ts` to canonical auth patterns
3. Convert `hooks/useUser.ts` to canonical browser client
4. Update `hooks/useTrial.ts` to canonical helpers
5. Migrate `lib/trial/trialManager.ts` to canonical server client

### Phase 2: Dashboard & High-Impact (Week 2)  
**Priority**: 🟡 HIGH - Fix this week
**Files**: 8 dashboard and component files
**Impact**: Fixes user-facing dashboard functionality

1. Update all dashboard pages to canonical imports
2. Convert ARR dashboard hard gate to progressive enhancement
3. Migrate `lib/analytics/arr.ts` to canonical Stripe helper
4. Fix Percy components with legacy Supabase usage

### Phase 3: Remaining Components (Week 3)
**Priority**: 🟢 MEDIUM - Fix next week  
**Files**: 25+ remaining component files
**Impact**: Completes migration and ensures full compliance

1. Migrate all remaining Percy components
2. Update file upload components
3. Convert agent system hooks
4. Final verification and testing

## 🔍 Verification Commands

### Quick Health Check
```bash
# Count remaining legacy imports (should be 0 when complete)
echo "Legacy Supabase imports:"
grep -r "utils/supabase" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/ | wc -l

echo "Legacy Stripe usage:"  
grep -r "new Stripe(" --include="*.ts" --include="*.tsx" --exclude-dir=lib/stripe app/ components/ | wc -l

echo "Hard gates found:"
grep -r "return null" --include="*.tsx" app/ | grep -i "flag\|enable" | wc -l
```

### Canonical Usage Verification
```bash
# Should show increasing numbers as migration progresses
echo "Canonical Supabase imports:"
grep -r "from '@/lib/supabase'" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/ | wc -l

echo "Canonical Stripe imports:"
grep -r "from '@/lib/stripe'" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/ | wc -l
```

## 📞 Next Steps

### Immediate Actions (Today)
1. **Review this analysis** with development team
2. **Prioritize Phase 1 fixes** - critical infrastructure
3. **Set up testing environment** for migration verification
4. **Create backup branch** before starting migrations

### This Week  
1. **Execute Phase 1 fixes** - core infrastructure migration
2. **Test authentication flows** thoroughly after each fix
3. **Monitor for regressions** in user-facing functionality
4. **Begin Phase 2 planning** - dashboard components

### Next Week
1. **Complete Phase 2 fixes** - dashboard and high-impact files
2. **Convert hard gates** to progressive enhancement
3. **Verify always-on routes** remain functional
4. **Plan Phase 3 execution** - remaining components

## 📋 Success Criteria

### ✅ Migration Complete When:
- [ ] Zero legacy Supabase imports detected
- [ ] Zero legacy Stripe usage detected  
- [ ] Zero hard gates returning null
- [ ] 100% MMM compliance achieved
- [ ] All always-on routes verified functional
- [ ] All user-facing functionality tested and working
- [ ] Performance maintained or improved
- [ ] Error handling consistent across all operations

**Estimated Completion**: 3 weeks with dedicated development effort  
**Risk Level**: Medium - Well-documented changes with clear verification steps  
**Business Impact**: High - Improves reliability, maintainability, and user experience