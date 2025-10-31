# 🔍 SKRBL AI Codebase Audit Report
**Generated:** 2025-10-31  
**Branch:** `cursor/codebase-audit-and-system-mapping-a06e`  
**Status:** Clean working tree

---

## 🧩 FEATURE FLAGS IN USE

### Core Feature Flags (Server-Side)
| Flag | Type | Default | Purpose | Impact |
|------|------|---------|---------|--------|
| `FF_N8N_NOOP` | Server | `true` | n8n NOOP mode - prevents n8n downtime from blocking user flows | **CRITICAL**: Blocks all n8n webhook calls when enabled |
| `FF_USE_BOOST_FOR_AUTH` | Server | `false` | Use Supabase Boost instance for auth | Switches between legacy and Boost Supabase |

### Client Feature Flags (NEXT_PUBLIC_*)
| Flag | Default | Purpose | Files Referenced | Build/Runtime Impact |
|------|---------|---------|------------------|---------------------|
| `NEXT_PUBLIC_FF_CLERK` | `false` | Clerk authentication toggle | `middleware.ts`, `requireUser.ts`, `ConditionalClerkProvider.tsx`, `sign-in/page.tsx`, `sign-up/page.tsx` | Switches auth system between Clerk and Supabase |
| `NEXT_PUBLIC_ENABLE_STRIPE` | `true` | Global Stripe payment toggle | `featureFlags.ts`, payment components | Disables all payment buttons when false |
| `NEXT_PUBLIC_ENABLE_BUNDLES` | `false` | Legacy bundle pricing system | `middleware.ts`, pricing pages | Redirects bundle routes to /sports when disabled |
| `NEXT_PUBLIC_HP_GUIDE_STAR` | `true` | Homepage guide star component | `featureFlags.ts`, homepage components | UI element visibility |
| `NEXT_PUBLIC_ENABLE_ORBIT` | `false` | Orbit League visualization | `featureFlags.ts`, agent components | 3D visualization toggle |
| `NEXT_PUBLIC_ENABLE_LEGACY` | `false` | Legacy system features | `featureFlags.ts` | Backward compatibility |
| `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS` | `false` | Use Stripe Payment Links vs Sessions | `featureFlags.ts`, checkout flow | Payment method selection |
| `NEXT_PUBLIC_SHOW_PERCY_WIDGET` | `false` | Percy widget visibility | `featureFlags.ts`, Percy components | Widget rendering |
| `NEXT_PUBLIC_USE_OPTIMIZED_PERCY` | `false` | Optimized Percy component | `featureFlags.ts`, Percy components | Performance optimization |
| `NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS` | `true` | Percy component animations | `featureFlags.ts`, Percy components | Animation toggle |
| `NEXT_PUBLIC_ENABLE_PERCY_AVATAR` | `true` | Percy avatar visibility | `featureFlags.ts`, Percy components | Avatar rendering |
| `NEXT_PUBLIC_ENABLE_PERCY_CHAT` | `true` | Percy chat functionality | `featureFlags.ts`, chat components | Chat feature toggle |
| `NEXT_PUBLIC_ENABLE_PERCY_SOCIAL_PROOF` | `true` | Percy social proof elements | `featureFlags.ts`, Percy components | Social proof display |
| `NEXT_PUBLIC_PERCY_PERFORMANCE_MONITORING` | `true` | Percy performance monitoring | `featureFlags.ts` | Performance tracking |
| `NEXT_PUBLIC_PERCY_AUTO_FALLBACK` | `true` | Percy auto fallback to legacy | `featureFlags.ts` | Error recovery |
| `NEXT_PUBLIC_PERCY_LOG_SWITCHES` | `true` | Log Percy component switches | `featureFlags.ts` | Debug logging |
| `NEXT_PUBLIC_AI_AUTOMATION_HOMEPAGE` | `true` | AI automation homepage features | `featureFlags.ts`, homepage | Homepage content |
| `NEXT_PUBLIC_ENHANCED_BUSINESS_SCAN` | `true` | Enhanced business scan | `featureFlags.ts`, scan pages | Scan functionality |
| `NEXT_PUBLIC_URGENCY_BANNERS` | `true` | Urgency banners/promos | `featureFlags.ts`, UI components | Marketing elements |
| `NEXT_PUBLIC_LIVE_METRICS` | `true` | Live metrics and counters | `featureFlags.ts`, dashboard | Real-time stats |
| `NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT` | `'scan-first'` | Homepage hero variant | `featureFlags.ts`, homepage | Hero component selection |

### Environment Variables (Infrastructure)

#### Supabase (Primary)
- `NEXT_PUBLIC_SUPABASE_URL` - Main Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key

#### Supabase Boost (Secondary Instance)
- `NEXT_PUBLIC_SUPABASE_URL_BOOST` - Boost instance URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST` - Boost public key
- `SUPABASE_SERVICE_ROLE_KEY_BOOST` - Boost admin key

#### Stripe
- `STRIPE_SECRET_KEY` - Stripe API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side key
- `STRIPE_WEBHOOK_SECRET` - Webhook verification
- `NEXT_PUBLIC_STRIPE_PRICE_*` - 50+ price ID variables for plans/addons
- `NEXT_PUBLIC_STRIPE_LINK_*` - Payment link URLs

#### n8n Integration
- `N8N_BASE_URL` / `N8N_WEBHOOK_BASE_URL` - n8n instance URL
- `N8N_API_KEY` - API authentication
- `N8N_WORKFLOW_*` - Workflow IDs (publish, proposal, sync, onboard)
- `N8N_DAILY_LIMIT` - Rate limiting (default: 1000)
- `N8N_MONTHLY_LIMIT` - Rate limiting (default: 10000)
- `N8N_CONCURRENT_LIMIT` - Concurrency (default: 5)
- `N8N_STRIPE_WEBHOOK_URL` - Stripe event forwarding

#### External Services
- `OPENAI_API_KEY` - OpenAI API
- `PINECONE_API_KEY` - Vector DB
- `PINECONE_CONTROLLER_HOST_URL` - Pinecone endpoint
- `RESEND_API_KEY` - Email service
- `TWILIO_ACCOUNT_SID` - SMS
- `TWILIO_AUTH_TOKEN` - SMS auth
- `TWILIO_PHONE_NUMBER` - SMS sender

#### Monitoring & Analytics
- `NEXT_PUBLIC_SENTRY_DSN` - Client-side Sentry
- `SENTRY_DSN` - Server-side Sentry
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` - GA tracking
- `GOOGLE_SITE_VERIFICATION` - SEO

#### Misc
- `NEXT_PUBLIC_BASE_URL` - Site URL
- `NODE_ENV` - Environment (production/development)
- `IRA_ALLOWED_EMAILS` - Whitelist for IRA agent access
- `CREATOR_EMAILS` - Creator role emails
- `VIP_SMS_WHITELIST` - VIP SMS access list

---

## 🔥 DELETED/RENAMED FILES (Last 14 Commits)

### Recent Deletions (Lean Pass 2 - e5acce9c)
**Purpose:** Dead code cleanup and bundle size reduction

1. **`app/api/debug/runtime-env/route.ts`**  
   - Purpose: Debug endpoint for runtime environment inspection
   - Reason: Debug/dev tool, not needed in production

2. **`app/api/dummy-upload/route.ts`**  
   - Purpose: Test upload endpoint
   - Reason: Dev/test utility, no longer needed

3. **`app/api/webhooks/test/route.ts`**  
   - Purpose: Test webhook receiver
   - Reason: Dev/test utility, replaced by proper webhook handlers

4. **`components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx`**  
   - Purpose: Legacy Percy onboarding component (2,827 lines)
   - Reason: Replaced by optimized version, moved to archive

### Earlier Deletions

5. **`components/activity/ActivityDetailsModal.tsx`** (c48b67fa)  
   - Purpose: Modal for activity detail views
   - Reason: UX simplification, details now shown inline

6. **`app/(auth)/sign-in/debug/page.tsx`** (b56474f2)  
   - Purpose: Auth debug page
   - Reason: Dev tool, not needed

7. **`.env.example`** (1096ee3b)  
   - Purpose: Environment variable template
   - Reason: Removed during build unblocking (consider restoring for dev onboarding)

### Archived Migrations (7d7d094e)
**Moved to `supabase/migrations/_archive_old/`**

Archived 25+ migration files from 2024-2025:
- `20240715_create_agent_handoffs_table.sql`
- `20250103_analytics_tables.sql`
- `20250103_email_automation.sql`
- `20250106_agent_workflow_logging.sql`
- `20250112_*` (8 RLS policy iterations)
- `20250114_optimize_rls_policies.sql`
- `20250117_*` (multi-model orchestration, SMS, VIP, agent knowledge)
- `20250122_leads_table.sql`
- `20250124_skillsmith_tables.sql`

**Impact:** These migrations have been applied to production. Archive prevents re-runs.

---

## 🌐 ACTIVE ROUTES

### Pages (48 total)

#### Public Pages
- `/` - Homepage (hero variant controlled by flag)
- `/about` - About page
- `/features` - Features overview
- `/pricing` - Pricing page
- `/contact` - Contact form
- `/academy` - Academy/training content
- `/content-automation` - Content automation landing

#### Sports Vertical
- `/sports` - Sports main page
- `/sports/upload` - Sports file upload

#### Agent System
- `/agents` - Agent marketplace/league
- `/agents/[agent]` - Individual agent page
- `/agents/[agent]/backstory` - Agent backstory
- `/agents/ira` - IRA (premium agent)
- `/agents/not-found` - Agent 404

#### Percy Chat
- `/percy-chat` - Percy chat interface
- `/test-percy-chat` - Percy chat test page

#### Authentication
- `/auth/callback` - Auth callback (legacy)
- `/auth/redirect` - Auth redirect handler
- `/auth2/sign-in` - Sign-in page (Boost/Clerk)
- `/auth2/sign-up` - Sign-up page (Boost/Clerk)
- `/auth2/callback` - Auth2 callback
- `/(auth)/sign-in` - Legacy sign-in
- `/(auth)/sign-up` - Legacy sign-up

#### Checkout Flow
- `/checkout` - Checkout page
- `/checkout/success` - Success page
- `/checkout/cancel` - Cancel page

#### Dashboard (Protected Routes)
- `/dashboard` - Main dashboard
- `/dashboard/getting-started` - Onboarding
- `/dashboard/profile` - User profile
- `/dashboard/user` - User settings
- `/dashboard/analytics` - Analytics
- `/dashboard/analytics/internal` - Internal analytics
- `/dashboard/marketing` - Marketing dashboard
- `/dashboard/social-media` - Social media tools
- `/dashboard/website` - Website tools
- `/dashboard/branding` - Branding tools
- `/dashboard/book-publishing` - Publishing tools
- `/dashboard/vip` - VIP portal
- `/dashboard/founder` - Founder dashboard
- `/dashboard/founders` - Founders list
- `/dashboard/heir` - Heir access
- `/dashboard/parent` - Parent dashboard

#### Universal Dashboard (Boost)
- `/udash` - Universal dashboard (new Boost-powered)

#### Admin (Protected)
- `/admin/logs` - Admin logs
- `/admin/percy` - Percy admin

#### Debug Pages
- `/debug-auth` - Auth debugger (dev only)
- `/debug-env` - Environment debugger
- `/test` - Test page

### Layouts (10 total)
- `app/layout.tsx` - Root layout (includes ConditionalClerkProvider)
- `app/about/layout.tsx`
- `app/agents/layout.tsx`
- `app/contact/layout.tsx`
- `app/content-automation/layout.tsx`
- `app/dashboard/layout.tsx` - Dashboard shell
- `app/dashboard/profile/layout.tsx`
- `app/features/layout.tsx`
- `app/pricing/layout.tsx`
- `app/sports/layout.tsx`

### API Routes (92 total)

#### Authentication & User
- `/api/auth/dashboard-signin` - Dashboard SSO
- `/api/auth/integration-support` - Integration status
- `/api/auth/analytics` - Auth analytics
- `/api/auth/apply-code` - Promo code application
- `/api/user/profile-sync` - Profile sync
- `/api/user/achievements` - Achievement tracking
- `/api/user/update-profile` - Profile updates

#### Agent System (14 routes)
- `/api/agents` - Agent list
- `/api/agents/league` - Agent league data
- `/api/agents/debug` - Agent debugging
- `/api/agents/assets-check` - Asset verification
- `/api/agents/workflow/[agentId]` - Workflow status
- `/api/agents/chat/[agentId]` - Agent chat
- `/api/agents/[agentId]/launch` - Launch agent
- `/api/agents/[agentId]/trigger` - Manual trigger
- `/api/agents/[agentId]/trigger-n8n` - n8n trigger
- `/api/agents/ira/chat` - IRA chat
- `/api/agents/ira/is-allowed` - IRA access check

#### Percy System (5 routes)
- `/api/percy/chat` - Percy chat API
- `/api/percy/contact` - Percy contact form
- `/api/percy/test-contact` - Contact test
- `/api/percy/scan` - Percy scan

#### Stripe/Payments (5 routes)
- `/api/stripe/create-checkout-session` - Checkout
- `/api/stripe/create-session` - Session creation
- `/api/stripe/calculate-tax` - Tax calculation
- `/api/stripe/webhook` - Stripe webhooks

#### Analytics (9 routes)
- `/api/analytics/dashboard` - Dashboard analytics
- `/api/analytics/arr` - ARR metrics
- `/api/analytics/arr/snapshot` - ARR snapshot
- `/api/analytics/agents` - Agent analytics
- `/api/analytics/agent-usage` - Agent usage
- `/api/analytics/percy` - Percy analytics
- `/api/analytics/addons` - Add-on analytics
- `/api/analytics/popups` - Popup analytics
- `/api/analytics/quick-wins` - Quick win tracking
- `/api/analytics/export-audit` - Export audit logs

#### Business/Marketing
- `/api/marketing/lead-activity` - Lead tracking
- `/api/marketing/analytics` - Marketing analytics
- `/api/marketing-consent` - GDPR consent
- `/api/analysis/business-scan` - Business scans
- `/api/scans/business` - Business scan processor
- `/api/scan` - Generic scan endpoint

#### SMS & Notifications
- `/api/sms/send-message` - Send SMS
- `/api/sms/send-verification` - Verification codes
- `/api/sms/verify-code` - Code verification
- `/api/sms/percy` - Percy SMS
- `/api/sms/skillsmith` - SkillSmith SMS

#### n8n Integration
- `/api/n8n/usage-summary` - n8n usage stats

#### VIP & Founder System
- `/api/vip/proposal-automation` - VIP proposals
- `/api/vip/recognition` - VIP recognition
- `/api/founders/redeem` - Founder code redemption
- `/api/founders/me` - Current founder info
- `/api/founders/admin/overview` - Founder admin

#### Promo & Codes
- `/api/codes/resolve` - Code resolution
- `/api/promo/validate` - Promo validation
- `/api/invite/route` - Invite system
- `/api/invite/redeem` - Invite redemption

#### Email & Automation
- `/api/email/send` - Email sending
- `/api/cron/process-drip` - Drip campaigns

#### Health & Monitoring (7 _probe routes)
- `/api/health` - Overall health
- `/api/health/auth` - Auth health
- `/api/_probe/env` - Environment check
- `/api/_probe/flags` - Feature flags
- `/api/_probe/supabase` - Supabase status
- `/api/_probe/stripe` - Stripe status
- `/api/_probe/storage` - Storage status
- `/api/_probe/auth` - Auth status
- `/api/_probe/db/profile-check` - Profile check
- `/api/_probe/db/profile-upsert` - Profile upsert test

#### Admin
- `/api/admin/env-check` - Environment audit
- `/api/admin/promo-management` - Promo management
- `/api/admin/leads/export` - Lead export

#### Misc
- `/api/contact/submit` - Contact form
- `/api/leads/submit` - Lead capture
- `/api/trial/status` - Trial status
- `/api/env-check` - Env diagnostics
- `/api/skillsmith` - SkillSmith integration
- `/api/sports/intake` - Sports intake
- `/api/parent/provision` - Parent provisioning
- `/api/onboarding/business` - Business onboarding
- `/api/system/agent-audit` - Agent audit
- `/api/social-proof/live-feed` - Social proof feed
- `/api/activity/live-feed` - Activity feed
- `/api/services/demo-preview` - Demo preview
- `/api/services/live-stats` - Live stats
- `/api/services/percy-recommend` - Percy recommendations
- `/api/mobile/performance` - Mobile perf tracking
- `/api/recaptcha/verify` - reCAPTCHA
- `/api/founder-dashboard` - Founder data
- `/api/images/cdn-automation` - CDN automation

### SSR-Protected Routes
Routes using `requireUser()` for server-side auth:
- All `/dashboard/*` pages
- All `/admin/*` pages
- `/udash` (when Boost enabled)
- Agent trigger/chat endpoints
- VIP/Founder endpoints
- Analytics endpoints

---

## ⚙️ CONNECTED SYSTEMS

### 🦜 Percy AI Assistant
**Status:** ✅ Active (Core Feature)

**Components:** 151 files
- `components/percy/PercyWidget.tsx` - Main widget
- `components/percy/UnifiedPercyChat.tsx` - Chat interface
- `components/percy/StreamingPercyChat.tsx` - Streaming chat
- `components/assistant/FloatingPercy.tsx` - Floating assistant
- `lib/percy/recommendationEngine.ts` - Recommendation logic
- `ai-agents/percyAgent.ts` - Percy agent definition
- `ai-agents/percySyncAgent.ts` - Percy sync agent

**Feature Flags:**
- `NEXT_PUBLIC_SHOW_PERCY_WIDGET` (default: false)
- `NEXT_PUBLIC_USE_OPTIMIZED_PERCY` (default: false)
- 6 additional Percy-specific flags (see flags section)

**API Endpoints:**
- `/api/percy/chat` - Chat API
- `/api/percy/contact` - Contact form
- `/api/percy/scan` - Scan functionality

**Dependencies:**
- OpenAI API (`OPENAI_API_KEY`)
- Pinecone for RAG (`PINECONE_API_KEY`)
- n8n for automation workflows

**Known Issues:**
- Legacy Percy component is 2,827 lines with 25+ useState hooks
- Performance warning system tracks overheating potential
- Optimized version available but not default

### 🔐 Authentication System (Dual Stack)
**Status:** ⚠️ In Transition (3 systems supported)

#### 1. **Supabase Legacy** (Original)
**Status:** ✅ Active (Default)
- Files: `lib/supabase/client.ts`, `lib/supabase/server.ts`
- Routes: `/auth/callback`, `/(auth)/sign-in`, `/(auth)/sign-up`
- Feature Flag: None (default when others disabled)
- Env Vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

#### 2. **Supabase Boost** (New Instance)
**Status:** ✅ Ready (Opt-in)
- Files: `lib/supabase/server.ts` (variant: 'boost')
- Routes: `/auth2/sign-in`, `/auth2/sign-up`, `/auth2/callback`, `/udash`
- Feature Flag: `FF_USE_BOOST_FOR_AUTH` (default: false)
- Env Vars: `NEXT_PUBLIC_SUPABASE_URL_BOOST`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST`, `SUPABASE_SERVICE_ROLE_KEY_BOOST`
- Implements: Fresh Supabase instance with cleaner schema

#### 3. **Clerk** (Future)
**Status:** 🚧 Prepared (Not Implemented)
- Files: `components/providers/ConditionalClerkProvider.tsx`, `lib/auth/requireUser.ts`
- Feature Flag: `NEXT_PUBLIC_FF_CLERK` (default: false)
- Implementation: Placeholder code exists, redirects to auth2 pages
- Note: ConditionalClerkProvider wraps app but only activates when flag=1

**Unified Interface:**
- `lib/auth/requireUser.ts` - Normalizes user object across all 3 systems
- `middleware.ts` - Routes traffic based on feature flags
- All auth systems return `NormalizedUser` type

**Migration Path:**
1. Legacy Supabase → Boost Supabase (set `FF_USE_BOOST_FOR_AUTH=1`)
2. Boost Supabase → Clerk (set `NEXT_PUBLIC_FF_CLERK=1`, implement Clerk)

### 🔄 n8n Workflow Automation
**Status:** 🔇 NOOP Mode (Disabled by Default)

**Feature Flag:** `FF_N8N_NOOP` (default: **true**)

**Integration Points:** 57 files
- `lib/n8nClient.ts` - Client library
- `lib/webhooks/n8nWebhooks.ts` - Webhook sender
- `lib/email/n8nIntegration.ts` - Email sequences
- `utils/agentAutomation.ts` - Agent automation

**Workflow IDs:**
- `N8N_WORKFLOW_PUBLISH_BOOK` - Publishing automation
- `N8N_WORKFLOW_SEND_PROPOSAL` - Proposal sending
- `N8N_WORKFLOW_SYNC_CONTENT` - Content sync (Percy)
- `N8N_WORKFLOW_ONBOARD_USER` - User onboarding

**Webhook Endpoints:**
- Business scan webhook
- Stripe payment webhook forwarding
- Agent launch webhooks
- Percy scan webhooks
- Email sequence triggers

**Rate Limiting:**
- Daily: 1000 calls (configurable)
- Monthly: 10,000 calls (configurable)
- Concurrent: 5 (configurable)

**NOOP Behavior:**
When `FF_N8N_NOOP=true`:
- All n8n calls are logged but NOT executed
- Returns success responses immediately
- Prevents n8n downtime from blocking user flows
- Console logs show `[NOOP]` prefix

**Referenced In:**
- `/api/stripe/webhook/route.ts` - Payment automation
- `/api/scans/business/route.ts` - Business scans
- `/api/scan/route.ts` - Free scans
- `/api/onboarding/business/route.ts` - Onboarding
- `/api/percy/scan/route.ts` - Percy scans
- `/api/agents/[agentId]/launch/route.ts` - Agent launches
- `supabase/functions/post-payment-automation/index.ts` - Post-payment

### 💳 Stripe Payment System
**Status:** ✅ Active

**Feature Flags:**
- `NEXT_PUBLIC_ENABLE_STRIPE` (default: true) - Global toggle
- `NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS` (default: false) - Use Payment Links

**Components:**
- `lib/stripe/stripe.ts` - Stripe client
- `lib/stripe/priceResolver.ts` - Price ID resolution
- `lib/stripe/paymentLinks.ts` - Payment Links
- `lib/pricing/catalog.ts` - Product catalog

**API Routes:**
- `/api/stripe/create-checkout-session` - Checkout
- `/api/stripe/webhook` - Webhook handler
- `/api/stripe/calculate-tax` - Tax calculation

**Price IDs (50+ env vars):**
- Base plans: `NEXT_PUBLIC_STRIPE_PRICE_[TIER]_[M]`
  - Tiers: STARTER, PRO, ELITE, BIZ_STARTER, BIZ_PRO, BIZ_ELITE, SPORTS_*
  - `_M` suffix for monthly vs one-time
- Add-ons: `NEXT_PUBLIC_STRIPE_PRICE_[BIZ|SPORTS]_ADDON_[SLUG]`
  - Business: ADV_ANALYTICS, AUTOMATION, TEAM_SEAT
  - Sports: VIDEO, EMOTION, NUTRITION, FOUNDATION
- Promo variants: `*_PROMO` suffix

**Webhooks:**
- Handles: `checkout.session.completed`, payment events
- Forwards to n8n (if `FF_N8N_NOOP=false`)
- Updates Supabase profiles/subscriptions

### 🗄️ Supabase Database
**Status:** ✅ Active (Dual Instances)

**Instances:**
1. **Legacy** - Original production DB
2. **Boost** - New clean instance (opt-in via `FF_USE_BOOST_FOR_AUTH`)

**Client Files:**
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server admin/anon clients
- `lib/supabase/browser.ts` - Browser helpers
- `lib/supabase/helpers.ts` - Utility functions
- `lib/supabase/onboarding.ts` - Onboarding flows

**Key Tables (Inferred from migrations):**
- `profiles` - User profiles
- `agent_handoffs` - Agent workflow tracking
- `agent_workflow_logs` - Agent execution logs
- `email_automation` - Email sequences
- `marketing_consent` - GDPR compliance
- `promo_codes` - Promo/VIP system
- `vip_status` - VIP user tracking
- `sms_verification` - SMS verification codes
- `leads` - Lead capture
- `skillsmith_*` - SkillSmith data
- `analytics_*` - Analytics tables
- `webhook_errors` - Webhook error logging
- `auth_audit_logs` - Auth audit trail

**Active Migrations:** 8 files in `/migrations`
**Archived Migrations:** 25+ files in `/migrations/_archive_old`

**Health Checks:**
- `/api/_probe/supabase` - Connection test
- `/api/_probe/db/profile-check` - Profile access
- `/api/_probe/db/profile-upsert` - Write test

### 📧 Email & Communication
**Status:** ✅ Active

**Services:**
- **Resend** - Primary email service (`RESEND_API_KEY`)
  - `server/email/sendWorkflowResult.ts`
  - `lib/email/cronJobs.ts`
  - `lib/email/sequences.ts`
  
- **Twilio** - SMS service
  - `utils/twilioSms.ts`
  - Vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
  - Whitelist: `VIP_SMS_WHITELIST`

**Integration:**
- n8n email sequences (when NOOP disabled)
- Direct Resend API calls
- SMS verification system

### 🤖 OpenAI & Vector Search
**Status:** ✅ Active

**OpenAI:**
- Key: `OPENAI_API_KEY`
- Used in: Agent chat, Percy chat, content generation
- Files: `utils/agentUtils.ts`, `lib/rag/knowledgeBase.ts`

**Pinecone (Vector DB):**
- Key: `PINECONE_API_KEY`
- Host: `PINECONE_CONTROLLER_HOST_URL`
- Environment: `PINECONE_ENVIRONMENT` (default: gcp-starter)
- Used for: RAG, knowledge base, semantic search

### 📊 Monitoring & Analytics
**Status:** ✅ Active

**Sentry:**
- Client DSN: `NEXT_PUBLIC_SENTRY_DSN`
- Server DSN: `SENTRY_DSN`
- Config: `sentry.client.config.ts`, `sentry.server.config.ts`
- Sample rates: 10% prod, 100% dev

**Google Analytics:**
- ID: `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
- SEO verification: `GOOGLE_SITE_VERIFICATION`

**Internal Analytics:**
- 9 analytics API routes (see API Routes section)
- Real-time activity feed
- ARR tracking
- Agent usage metrics
- Percy analytics

### 🛠️ MCP Server
**Status:** ✅ Active (Separate Service)

**Location:** `/mcp-server/`
**Files:** 11,880 files (TypeScript monorepo)

**Configuration:**
- Port: `PORT` (default: 3001)
- Rate limiting: 100 req/window (prod), 1000 (dev)
- CORS: `ALLOWED_ORIGINS` (default: localhost:3000)

**Purpose:** Orchestration service for multi-agent coordination

---

## 🧱 CODE HEALTH SUMMARY

### ✅ Strengths

1. **Feature Flag Architecture**
   - Centralized in `lib/config/featureFlags.ts`
   - Well-documented with purpose and defaults
   - Progressive enhancement approach
   - Strong typing with TypeScript

2. **Dual Auth Support**
   - Clean abstraction with `requireUser()` normalization
   - Seamless switching between auth systems
   - Minimal code duplication

3. **API Organization**
   - 92 well-organized API routes
   - Health check endpoints (`/_probe/*`)
   - Consistent error handling

4. **Component Structure**
   - 199 TSX components
   - Clean separation of concerns
   - Reusable UI components

5. **Safe n8n Integration**
   - NOOP mode prevents downtime impact
   - Comprehensive logging
   - Rate limiting configured

6. **Database Migrations**
   - Clean archive system
   - 8 active migrations
   - Historical preservation

### ⚠️ Concerns

1. **Percy Performance**
   - Legacy component: 2,827 lines, 25+ useState hooks
   - Potential CPU overheating with multiple intervals
   - Optimized version exists but not default
   - 151 files reference Percy (high coupling)

2. **Auth System Fragmentation**
   - 3 auth systems supported simultaneously
   - Clerk prepared but not implemented
   - Potential confusion in routing logic
   - Need clear migration timeline

3. **Environment Variable Sprawl**
   - 50+ Stripe price IDs as env vars
   - 3 separate Supabase configs (legacy + boost)
   - Missing `.env.example` (deleted in cleanup)
   - Complex configuration for new developers

4. **n8n Dependency**
   - 57 files reference n8n
   - Currently in NOOP mode (disabled)
   - Unclear when it will be re-enabled
   - Webhooks scattered across codebase

5. **Feature Flag Proliferation**
   - 23+ feature flags in active use
   - Some overlap (e.g., multiple Percy flags)
   - Need periodic audit of unused flags

6. **Debug/Test Routes in Production**
   - `/debug-env`, `/debug-auth`, `/test`, `/test-percy-chat` pages
   - `/api/_probe/*` endpoints (7 routes)
   - Should be gated by environment or removed

7. **Git Repository Issues**
   - Partial repo corruption detected (promisor remote errors)
   - Some commits unreachable in object database
   - May need `git fetch --refetch` to repair

### 🔍 Code Metrics

- **Total API Routes:** 92
- **Total Pages:** 48
- **Total Components:** 199 (TSX only)
- **AI Agents:** 17 TypeScript files
- **Percy-related Files:** 151
- **n8n Integration Files:** 57
- **Feature Flags:** 23+
- **Environment Variables:** 100+ (estimated)

### 📦 Bundle Concerns

From recent "lean pass 2" cleanup:
- Removed: 2,827-line Percy legacy component (archived)
- Removed: 3 test/debug API routes
- Removed: 1 activity modal component
- Archived: 25+ old migrations

**Next Optimization Targets:**
- Percy: Use optimized version by default
- 3D components: Lazy load orbit visualization
- Auth: Consolidate to single system
- Stripe: Consider dynamic price ID loading

### 🔒 Security Notes

1. **Auth Audit Logging:**
   - `lib/auth/authAuditLogger.ts` tracks auth events
   - Logs to Supabase `auth_audit_logs` table
   - Includes environment context

2. **Role-Based Access:**
   - Founder/VIP system with cookie checks
   - Middleware enforces premium routes
   - IRA agent has email whitelist (`IRA_ALLOWED_EMAILS`)

3. **Webhook Security:**
   - Stripe webhook secret verification
   - n8n API key authentication
   - Rate limiting on MCP server

4. **Sensitive Data Handling:**
   - Service role keys server-side only
   - Proper NEXT_PUBLIC_ prefix for client vars
   - Redaction in diagnostic outputs

---

## 🎯 NEXT STEPS

### High Priority (Do First)

1. **🔧 Fix Git Repository Corruption**
   ```bash
   git fetch --refetch origin
   ```
   - Repair promisor remote issues
   - Verify all commits accessible

2. **📝 Restore `.env.example`**
   - Critical for developer onboarding
   - Document all required variables
   - Include feature flag defaults
   - Add comments for each section

3. **🚨 Gate Debug Routes**
   - Move `/debug-*` and `/test-*` pages behind auth or env check
   - Or delete if no longer needed
   - Consider removing `/_probe/*` in production (or add auth)

4. **🦜 Percy Performance Migration**
   - Set `NEXT_PUBLIC_USE_OPTIMIZED_PERCY=true` as default
   - A/B test optimized vs legacy
   - Remove legacy once validated
   - Target: Reduce Percy from 151 files to ~50

5. **🔐 Auth Consolidation Decision**
   - Choose: Legacy Supabase → Boost → Clerk (or skip Clerk?)
   - Set migration timeline
   - Remove unused auth code after migration
   - Update docs with single auth flow

### Medium Priority (Next Sprint)

6. **🔄 Re-enable n8n Workflows**
   - Verify n8n instance stability
   - Set `FF_N8N_NOOP=false` in staging
   - Monitor webhook success rates
   - Roll out to production if stable

7. **🧹 Feature Flag Cleanup**
   - Audit unused/outdated flags
   - Remove deprecated flags
   - Consolidate Percy flags (too many)
   - Document flag lifecycle policy

8. **💳 Stripe Price ID Refactor**
   - Consider: Load price IDs from Supabase/database
   - Or: Use Stripe Product metadata
   - Reduce from 50+ env vars to ~5-10
   - Keep legacy vars during transition

9. **📊 Analytics Consolidation**
   - 9 analytics routes - check for duplication
   - Consider single `/api/analytics` with query params
   - Improve caching for expensive queries

10. **🧪 Test Coverage**
    - Add tests for auth switching logic
    - Test n8n NOOP mode fallbacks
    - Percy component unit tests
    - API route integration tests

### Low Priority (Technical Debt)

11. **📦 Bundle Size Optimization**
    - Lazy load 3D orbit components
    - Code split Percy by feature
    - Tree-shake unused Stripe components
    - Analyze with `@next/bundle-analyzer`

12. **🗄️ Database Migration Audit**
    - Review archived migrations
    - Document current schema
    - Consider squashing old migrations
    - Update RLS policies documentation

13. **🔍 Dependency Audit**
    - Check for unused npm packages
    - Update outdated dependencies
    - Playwright dependency recently updated (good!)
    - Consider removing unused integrations

14. **📚 Documentation**
    - API route documentation (OpenAPI?)
    - Component storybook
    - Architecture decision records (ADRs)
    - Onboarding guide for new devs

15. **🎨 UI Consistency**
    - Audit for design system compliance
    - Consolidate duplicate components
    - Standardize loading states
    - Accessibility audit

### Code Cleanup Candidates

**Files to Consider Removing:**
- `/app/test/page.tsx` - Test page
- `/app/test-percy-chat/page.tsx` - Percy test
- Legacy auth routes after migration
- Old Percy components in `/components/percy/archive/`

**Reduce Coupling:**
- Percy: 151 files reference it - consider dependency injection
- n8n: 57 files - consolidate webhook logic
- Supabase: Abstract database calls behind repository pattern

**Refactor Opportunities:**
- `/utils/agentUtils.ts` - 397 lines, likely doing too much
- `/lib/stripe/priceResolver.ts` - Complex price ID logic
- `/lib/agents/powerEngine.ts` - Agent execution engine
- `/middleware.ts` - 147 lines, could be split

---

## 📋 SUMMARY

**Current State:** The SKRBL AI codebase is in a **transitional phase** with a clean working tree but multiple systems operating in parallel. The recent "lean pass 2" cleanup removed dead code and archived legacy components.

**Key Findings:**
- ✅ **23+ feature flags** provide flexible system control
- ⚠️ **3 auth systems** (Supabase legacy, Boost, Clerk placeholder) - need consolidation
- 🔇 **n8n automation disabled** via NOOP mode (safe default)
- 🦜 **Percy performance concerns** - optimized version available but not default
- 📈 **92 API routes**, 48 pages, 199 components - healthy but needs pruning
- 🗄️ **Dual Supabase instances** - migration in progress
- 🐛 **Git repo corruption** - minor, fixable with refetch

**Health Status:** 🟡 **Stable with Technical Debt**
- Production-ready but needs optimization
- Auth migration path unclear
- Performance bottlenecks identified (Percy)
- Good architectural patterns in place

**Immediate Action Required:**
1. Fix git repository corruption
2. Restore `.env.example` for dev onboarding
3. Gate/remove debug routes
4. Make Percy optimization default
5. Choose auth system migration path

**Timeline Estimate:**
- Critical fixes: 1-2 days
- Percy optimization: 1 week
- Auth consolidation: 2-3 weeks
- Full cleanup: 4-6 weeks

---

**Report Generated by:** Cursor Codebase Audit Agent  
**Next Audit Recommended:** After auth migration completion or in 30 days
