# SKRBL AI Feature Flags

## Inventory

| Name | Default Value | Type | Where Read | What It Gates | How to Flip |
|------|---------------|------|------------|---------------|------------|
| `FEATURE_FLAGS.AI_AUTOMATION_HOMEPAGE` | true | Server | app/page.tsx | Homepage hero variant selection | Set in lib/config/featureFlags.ts |

## Detailed Analysis

### FEATURE_FLAGS.AI_AUTOMATION_HOMEPAGE

- **Location**: `lib/config/featureFlags.ts`
- **Default Value**: `true`
- **Type**: Server-side flag
- **Usage**: Controls which hero component is displayed on the homepage
- **Gated Components**: 
  - HomeHeroScanFirst (when true)
  - HomeHeroSplit (when false)
- **How to Flip**: Modify the default value in `lib/config/featureFlags.ts`

## Hardcoded Flags

After scanning the codebase, no feature flags appear to be hardcoded with values that override environment variables.

## Flag Reading Pattern

Feature flags are read through a centralized configuration system in `lib/config/featureFlags.ts` which provides a consistent interface for accessing flag values throughout the application.
