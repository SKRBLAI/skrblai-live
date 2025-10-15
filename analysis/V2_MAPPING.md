## V1 → V2 mapping

| v2 file/route | mimics v1 (current) | final replace target |
| --- | --- | --- |
| `app/v2/page.tsx` | `app/page.tsx` + `components/home/*` (hero/league) | `/` |
| `components/v2/AgentGrid.tsx` | `components/home/AgentLeaguePreview.tsx` | homepage agents block |
| `app/v2/pricing/page.tsx` | `app/pricing/page.tsx` + `components/pricing/*` | `/pricing` |
| `app/api/v2/checkout/route.ts` | `app/api/checkout/route.ts` | `/api/checkout` |
| `app/api/v2/stripe/webhook/route.ts` | `app/api/stripe/webhook/route.ts` | `/api/stripe/webhook` |
| `app/v2/auth/sign-in/page.tsx` | `app/(auth)/sign-in/page.tsx` | `/auth/sign-in` |
| `app/v2/auth/callback/route.ts` | `app/auth/callback/page.tsx` | `/auth/callback` |
| `app/v2/dashboard/page.tsx` | `app/dashboard/page.tsx` (entry) | `/dashboard` |
| `app/api/_probe/v2/*` | `app/api/_probe/*` (if any) | replace probes after flip |
