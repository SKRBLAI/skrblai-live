# 🚀 Quick Start - Auth & Import Fixes

## ✅ What's Ready

1. **Supabase Barrel Export** - `lib/supabase/index.ts` created
2. **MMM Verification** - All 20 modals documented and verified
3. **Migration Script** - Ready to update 59 files
4. **Auth Configured** - JWT tokens in `.env.local` and Railway
5. **Security Audit** - Passed (9.5/10)

---

## 🎯 Run This Now

### Option 1: Auto-Migrate Supabase Imports (Recommended)
```powershell
# Run migration script
powershell -ExecutionPolicy Bypass -File scripts\migrate-supabase-imports.ps1

# Verify build
npm run build

# If build passes, commit
git add .
git commit -m "feat: migrate to Supabase barrel export + MMM verification"
git push origin master
```

### Option 2: Manual Testing First
```bash
# Test auth health
curl http://localhost:3000/api/health/auth

# Test sign-in
# Visit: http://localhost:3000/dashboard
# Try signing in

# If working, run migration script
```

---

## 📊 Expected Results

### After Migration Script:
```
🔄 Migrating Supabase imports to barrel export...
📁 Found 59 TypeScript files to check

  Updated client import in: route.ts
  Updated server import in: page.tsx
  ...

✅ Migration Complete!
   Files changed: 59
   Total replacements: 59

🔍 Next steps:
   1. Run: npm run build
   2. Test auth flows
   3. Commit changes
```

### Build Should Show:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (70/70)
```

---

## 🔍 Quick Diagnostics

### Check Auth Status:
```bash
# Local
curl http://localhost:3000/api/health/auth | jq

# Production
curl https://skrblai.io/api/health/auth | jq
```

### Check Environment Variables:
```bash
# Local
curl http://localhost:3000/api/env-check | jq

# Production
curl https://skrblai.io/api/env-check | jq
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `lib/supabase/index.ts` | Barrel export (canonical imports) |
| `analysis/MMM-VERIFICATION.md` | Modal verification report |
| `scripts/migrate-supabase-imports.ps1` | Import migration script |
| `REPAIR_SUMMARY.md` | Complete repair documentation |
| `SECURITY_AUDIT_REPORT.md` | Security audit results |

---

## 🆘 If Something Breaks

### Build Fails:
```bash
# Clean and rebuild
Remove-Item -Recurse -Force .next
npm run build
```

### Auth Fails:
1. Check `.env.local` has JWT tokens (start with `eyJ`)
2. Verify Railway has same JWT tokens
3. Check `/api/health/auth` for specific errors

### Import Errors:
1. Verify `lib/supabase/index.ts` exists
2. Check imports use `@/lib/supabase` (not `/client` or `/server`)
3. Run TypeScript check: `npx tsc --noEmit`

---

## ✅ Acceptance Checklist

- [ ] Migration script ran successfully
- [ ] Build passes (`npm run build`)
- [ ] Auth works locally (`/dashboard` sign-in)
- [ ] Auth works on Railway (production)
- [ ] No console errors
- [ ] All tests pass (if applicable)
- [ ] Changes committed and pushed

---

**Status:** Ready to run migration! 🚀

**Next Command:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\migrate-supabase-imports.ps1
```
