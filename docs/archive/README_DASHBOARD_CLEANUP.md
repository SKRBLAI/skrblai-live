# Dashboard Cleanup - April 2025

This file documents the migration of any unique UI logic from /app/user-dashboard/ to /components/dashboard/ before deletion. If you need to restore any old UI, check your git history for the following files:

- analytics/page.tsx
- settings/page.tsx
- tasks/page.tsx
- uploads/page.tsx
- [id]/page.tsx

All dashboard UI should now be sourced from /components/dashboard/ and imported into /app/dashboard/page.tsx only.
