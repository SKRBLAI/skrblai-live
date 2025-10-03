# Inline Deprecated Helpers - Codemods

This directory contains codemod patches for inlining small deprecated helper files into their consumers.

## Generated Codemods

Based on the dead-code analysis, the following files are candidates for inlining:

### Small Helper Files (≤40 lines, ≤2 exports, ≤1 consumer)

- `actions/sendEmail.ts` (8 lines) → inline into `components/percy/PercyWidget.tsx`
- `lib/agents/handoffSystem.ts` (239 B) → inline into consumer
- `components/home/Hero.tsx` (1.6 KB) → inline into consumer
- `components/home/Spotlight.tsx` (1.7 KB) → inline into consumer

## How to Apply Codemods

**⚠️ IMPORTANT: Do not apply these codemods automatically. Review each one manually first.**

1. Review the generated patches in this directory
2. Test each change individually
3. Verify imports are updated correctly
4. Run tests after each inline operation

## Manual Review Required

Some files marked for inlining may still have complex dependencies or be referenced in ways not detected by static analysis. Always verify:

1. The helper is truly only used by one consumer
2. No dynamic imports reference the helper
3. No string-based registries reference the helper
4. The inline doesn't create circular dependencies

## Example Inline Process

For `actions/sendEmail.ts` → `components/percy/PercyWidget.tsx`:

1. Copy the export from `actions/sendEmail.ts`
2. Paste it into `components/percy/PercyWidget.tsx`
3. Update the import in `PercyWidget.tsx` to use the local function
4. Remove the import statement for `actions/sendEmail.ts`
5. Test the component still works
6. Remove `actions/sendEmail.ts` if no other references exist

## Verification Commands

After each inline operation:

```bash
# Check for remaining references
grep -r "sendEmail" --include="*.ts" --include="*.tsx" .

# Type check
npm run type-check

# Build check
npm run build

# Test
npm run test
```