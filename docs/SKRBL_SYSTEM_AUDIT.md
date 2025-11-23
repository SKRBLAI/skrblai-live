# 🏗️ SKRBL AI System Architecture Audit
**Visual Code Map & Deprecation Analysis**

Generated: 2025-10-31  
Branch: `cursor/codebase-audit-and-system-mapping-a06e`  
Companion to: `CODEBASE_AUDIT_REPORT.md`

---

## 📊 VISUAL CODE MAP

### 1. Feature Flag Control Matrix

```mermaid
graph TB
    subgraph "Feature Flags Control Layer"
        FF[lib/config/featureFlags.ts<br/>23+ Feature Flags]
        
        FF --> AUTH_FLAGS[Auth Flags]
        FF --> PAYMENT_FLAGS[Payment Flags]
        FF --> PERCY_FLAGS[Percy Flags]
        FF --> N8N_FLAGS[Automation Flags]
        FF --> UI_FLAGS[UI Flags]
    end
    
    subgraph "Auth System Flags"
        AUTH_FLAGS --> CLERK[NEXT_PUBLIC_FF_CLERK=0<br/>Clerk Auth]
        AUTH_FLAGS --> BOOST[FF_USE_BOOST_FOR_AUTH=0<br/>Supabase Boost]
        
        CLERK -.->|when=1| CLERK_ROUTES[/auth2/sign-in<br/>/auth2/sign-up<br/>/udash]
        BOOST -.->|when=1| BOOST_ROUTES[/auth2/sign-in<br/>/auth2/sign-up<br/>/udash]
        
        CLERK -->|controlled by| MW[middleware.ts]
        BOOST -->|controlled by| MW
        MW -->|gates| REQ[lib/auth/requireUser.ts]
    end
    
    subgraph "Payment System Flags"
        PAYMENT_FLAGS --> STRIPE_ENABLE[NEXT_PUBLIC_ENABLE_STRIPE=1<br/>Global Stripe Toggle]
        PAYMENT_FLAGS --> STRIPE_LINKS[NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS=0<br/>Payment Links Mode]
        
        STRIPE_ENABLE -->|controls| CHECKOUT[/app/checkout<br/>/api/stripe/*]
        STRIPE_LINKS -->|switches| PAYMENT_MODE[Checkout Sessions vs<br/>Payment Links]
    end
    
    subgraph "Percy System Flags - 8 Flags"
        PERCY_FLAGS --> PERCY_WIDGET[NEXT_PUBLIC_SHOW_PERCY_WIDGET=0]
        PERCY_FLAGS --> PERCY_OPT[NEXT_PUBLIC_USE_OPTIMIZED_PERCY=0]
        PERCY_FLAGS --> PERCY_ANIM[NEXT_PUBLIC_ENABLE_PERCY_ANIMATIONS=1]
        PERCY_FLAGS --> PERCY_CHAT[NEXT_PUBLIC_ENABLE_PERCY_CHAT=1]
        PERCY_FLAGS --> PERCY_AVATAR[NEXT_PUBLIC_ENABLE_PERCY_AVATAR=1]
        
        PERCY_WIDGET -->|controls| WIDGET[components/percy/PercyWidget.tsx]
        PERCY_OPT -.->|when=1| OPT_COMP[PercyOnboardingRevolutionOptimized.tsx]
        PERCY_OPT -.->|when=0| LEGACY_COMP[PercyOnboardingRevolution.tsx<br/>⚠️ 2,827 lines]
        PERCY_CHAT -->|enables| CHAT_COMP[components/percy/UnifiedPercyChat.tsx]
    end
    
    subgraph "n8n Automation Flags"
        N8N_FLAGS --> N8N_NOOP[FF_N8N_NOOP=1<br/>🔇 NOOP Mode ACTIVE]
        
        N8N_NOOP -.->|when=1| NO_WEBHOOKS[❌ All n8n webhooks disabled<br/>✅ Returns success immediately]
        N8N_NOOP -.->|when=0| WEBHOOKS[✓ n8n webhooks active<br/>57 integration points]
        
        NO_WEBHOOKS -->|affects| N8N_ROUTES[/api/stripe/webhook<br/>/api/scan<br/>/api/agents/*/launch<br/>/api/percy/scan]
    end
    
    subgraph "UI Feature Flags"
        UI_FLAGS --> BUNDLES[NEXT_PUBLIC_ENABLE_BUNDLES=0]
        UI_FLAGS --> ORBIT[NEXT_PUBLIC_ENABLE_ORBIT=0]
        UI_FLAGS --> HERO[NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT=scan-first]
        
        BUNDLES -.->|when=0| BUNDLE_REDIRECT[/bundle/* → /sports#plans]
        ORBIT -.->|when=1| ORBIT_VIZ[AgentLeagueOrbit.tsx]
        HERO -->|controls| HERO_COMP[HomeHeroScanFirst vs<br/>HomeHeroSplit]
    end
    
    style FF fill:#ff6b6b,color:#fff
    style N8N_NOOP fill:#ffd93d,color:#000
    style PERCY_OPT fill:#6bcf7f,color:#fff
    style CLERK fill:#95e1d3,color:#000
    style BOOST fill:#95e1d3,color:#000
```

### 2. Active Routes → Components Map

```mermaid
graph LR
    subgraph "Public Routes"
        HOME[/ Homepage]
        FEATURES[/features]
        PRICING[/pricing]
        AGENTS[/agents]
        CONTACT[/contact]
    end
    
    subgraph "Auth Routes"
        SIGNIN[/auth2/sign-in]
        SIGNUP[/auth2/sign-up]
        CALLBACK[/auth2/callback]
        LEGACY_SIGNIN[/auth/sign-in]
    end
    
    subgraph "Protected Routes"
        DASHBOARD[/dashboard]
        UDASH[/udash Universal Dashboard]
        ADMIN[/admin/*]
        FOUNDER[/dashboard/founder]
    end
    
    subgraph "Homepage Components"
        HOME --> HERO_SCAN[HomeHeroScanFirst.tsx]
        HOME --> PERCY_FIG[PercyFigure.tsx]
        HOME --> AGENT_PREVIEW[AgentLeaguePreview.tsx]
        HOME --> FOOTER_CTA[FooterCTAs.tsx]
    end
    
    subgraph "Agent System"
        AGENTS --> AGENT_GRID[AgentGrid.tsx]
        AGENTS --> AGENT_LEAGUE[AgentLeagueDashboard.tsx]
        AGENTS --> AGENT_ORBIT[AgentLeagueOrbit.tsx]
        AGENT_GRID --> AGENT_CARD[AgentCard.tsx<br/>293 lines with hotspot]
    end
    
    subgraph "Auth Components"
        SIGNIN --> AUTH_CHECK{middleware.ts<br/>Auth Flag Check}
        AUTH_CHECK -->|CLERK=1| CLERK_SIGNIN[ConditionalClerkProvider]
        AUTH_CHECK -->|BOOST=1| BOOST_SIGNIN[Boost Auth Flow]
        AUTH_CHECK -->|default| LEGACY_SIGNIN_COMP[Legacy Supabase Auth]
    end
    
    subgraph "Dashboard Components"
        DASHBOARD --> DASH_HOME[DashboardHome.tsx]
        DASHBOARD --> DASH_CLIENT[DashboardClient.tsx]
        DASHBOARD --> NOTIFICATIONS[Notifications.tsx]
        DASHBOARD --> PERCY_WIDGET_DASH[PercyWidget.tsx]
        DASHBOARD --> QUICK_LAUNCH[QuickLaunchPanel.tsx]
    end
    
    subgraph "Protected Middleware"
        DASHBOARD -->|protected by| REQ_USER[requireUser.ts]
        UDASH -->|protected by| REQ_USER
        ADMIN -->|protected by| REQ_USER
        FOUNDER -->|additional gate| FOUNDER_CHECK[hasFounderAccess<br/>cookie check]
    end
    
    style HOME fill:#a8e6cf
    style AGENTS fill:#ffd3b6
    style DASHBOARD fill:#ffaaa5
    style ADMIN fill:#ff8b94
    style UDASH fill:#95e1d3
```

### 3. External Integrations Map

```mermaid
graph TB
    subgraph "External Services"
        CLERK_EXT[Clerk<br/>Auth Service]
        SUPABASE_LEGACY[Supabase Legacy<br/>Original Instance]
        SUPABASE_BOOST[Supabase Boost<br/>New Instance]
        N8N[n8n Cloud<br/>Workflow Automation]
        STRIPE[Stripe<br/>Payments]
        OPENAI[OpenAI API<br/>GPT-4]
        PINECONE[Pinecone<br/>Vector DB]
        RESEND[Resend<br/>Email]
        TWILIO[Twilio<br/>SMS]
    end
    
    subgraph "SKRBL Application"
        APP[Next.js App]
        
        subgraph "Auth Layer"
            MW[middleware.ts]
            REQ[requireUser.ts]
            COND_CLERK[ConditionalClerkProvider.tsx]
        end
        
        subgraph "Database Layer"
            SUPABASE_CLIENT[lib/supabase/client.ts]
            SUPABASE_SERVER[lib/supabase/server.ts]
            SUPABASE_BROWSER[lib/supabase/browser.ts]
        end
        
        subgraph "Integration Layer"
            N8N_CLIENT[lib/n8nClient.ts<br/>57 files reference]
            N8N_WEBHOOKS[lib/webhooks/n8nWebhooks.ts]
            STRIPE_CLIENT[lib/stripe/stripe.ts]
            STRIPE_RESOLVER[lib/stripe/priceResolver.ts]
            EMAIL_INT[lib/email/n8nIntegration.ts]
        end
        
        subgraph "AI Layer"
            PERCY_AGENT[ai-agents/percyAgent.ts]
            AGENT_UTILS[utils/agentUtils.ts]
            RAG_ENGINE[lib/rag/knowledgeBase.ts]
            POWER_ENGINE[lib/agents/powerEngine.ts]
        end
    end
    
    CLERK_EXT -.->|when FF_CLERK=1| COND_CLERK
    COND_CLERK --> MW
    MW --> REQ
    
    SUPABASE_LEGACY -->|default| SUPABASE_SERVER
    SUPABASE_BOOST -.->|when FF_USE_BOOST=1| SUPABASE_SERVER
    SUPABASE_SERVER --> REQ
    SUPABASE_SERVER -->|service role| ADMIN_OPS[Admin Operations]
    
    N8N -->|webhooks| N8N_WEBHOOKS
    N8N_WEBHOOKS -->|FF_N8N_NOOP check| N8N_CLIENT
    N8N_CLIENT -->|triggers| WORKFLOWS[Publishing<br/>Proposals<br/>Content Sync<br/>Onboarding]
    
    STRIPE -->|API| STRIPE_CLIENT
    STRIPE_CLIENT -->|webhook handler| WEBHOOK_ROUTE[/api/stripe/webhook]
    WEBHOOK_ROUTE -.->|forwards to| N8N
    STRIPE_RESOLVER -->|resolves 50+ price IDs| CHECKOUT_FLOW[Checkout Flow]
    
    OPENAI -->|API| AGENT_UTILS
    OPENAI -->|chat completions| PERCY_AGENT
    AGENT_UTILS --> POWER_ENGINE
    
    PINECONE -->|vector search| RAG_ENGINE
    RAG_ENGINE --> PERCY_AGENT
    
    RESEND -->|send email| EMAIL_INT
    EMAIL_INT -.->|sequences via| N8N
    
    TWILIO -->|SMS API| SMS_UTILS[utils/twilioSms.ts]
    SMS_UTILS -->|verification| SMS_ROUTES[/api/sms/*]
    
    style N8N fill:#ffd93d,color:#000
    style SUPABASE_BOOST fill:#95e1d3,color:#000
    style CLERK_EXT fill:#95e1d3,color:#000
    style N8N_CLIENT fill:#ffd93d,color:#000
```

---

## 🗑️ DEPRECATION LIST

### Deleted Files (Last 14 Commits)

| File | Commit | Purpose | Status | Action Taken |
|------|--------|---------|--------|--------------|
| `app/api/debug/runtime-env/route.ts` | e5acce9c | Debug endpoint for runtime env inspection | ✅ Deleted | Removed in lean pass 2 |
| `app/api/dummy-upload/route.ts` | e5acce9c | Test upload endpoint | ✅ Deleted | Removed in lean pass 2 |
| `app/api/webhooks/test/route.ts` | e5acce9c | Test webhook receiver | ✅ Deleted | Removed in lean pass 2 |
| `components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx` | e5acce9c | Legacy Percy onboarding (2,827 lines) | ✅ Archived | Moved to archive folder |
| `components/activity/ActivityDetailsModal.tsx` | c48b67fa | Activity detail modal | ✅ Deleted | UX simplified to inline details |
| `app/(auth)/sign-in/debug/page.tsx` | b56474f2 | Auth debug page | ✅ Deleted | Dev tool no longer needed |
| `.env.example` | 1096ee3b | Environment template | ⚠️ RESTORE | **Critical: Restore for dev onboarding** |

### Legacy/Inactive Features

| Feature | Status | Files Affected | Feature Flag | Recommendation |
|---------|--------|----------------|--------------|----------------|
| **Legacy Percy Component** | 🟡 Active (default) | `components/percy/PercyOnboardingRevolution.tsx` (2,827 lines) | `NEXT_PUBLIC_USE_OPTIMIZED_PERCY=0` | **Replace**: Set flag to `1`, test optimized version, delete legacy |
| **Bundle Pricing System** | 🔴 Inactive | Pricing components, `/bundle/*` routes | `NEXT_PUBLIC_ENABLE_BUNDLES=0` | **Delete**: Remove bundle-related code if confirmed unused |
| **Orbit 3D Visualization** | 🔴 Inactive | `AgentLeagueOrbit.tsx`, 3D components | `NEXT_PUBLIC_ENABLE_ORBIT=0` | **Evaluate**: Keep if future feature, or remove to reduce bundle |
| **Legacy Auth System** | 🟡 Active (default) | `/(auth)/sign-in`, `/(auth)/sign-up`, legacy Supabase | None (default) | **Migrate**: Plan migration to Boost or Clerk, then remove |
| **Clerk Auth** | 🔴 Prepared (not implemented) | `ConditionalClerkProvider.tsx`, `requireUser.ts` (placeholder) | `NEXT_PUBLIC_FF_CLERK=0` | **Decision**: Implement fully or remove placeholder code |
| **n8n Automation** | 🟡 NOOP Mode | 57 files with n8n references | `FF_N8N_NOOP=1` | **Re-enable**: Test in staging, then set to `0` in prod |

### Archived Migrations (25+ files)

| Category | Count | Location | Status | Recommendation |
|----------|-------|----------|--------|----------------|
| Agent System | 3 | `supabase/migrations/_archive_old/2024*_agent_*.sql` | ✅ Applied | Keep archived |
| Analytics Tables | 2 | `supabase/migrations/_archive_old/2025*_analytics_*.sql` | ✅ Applied | Keep archived |
| Email Automation | 3 | `supabase/migrations/_archive_old/2025*_email_*.sql` | ✅ Applied | Keep archived |
| RLS Policy Iterations | 8 | `supabase/migrations/_archive_old/20250112_*.sql` | ✅ Applied | Consider squashing |
| VIP/Promo System | 2 | `supabase/migrations/_archive_old/2025*_vip_*.sql` | ✅ Applied | Keep archived |
| Multi-model/SMS/Knowledge | 4 | `supabase/migrations/_archive_old/20250117_*.sql` | ✅ Applied | Keep archived |
| Leads/SkillSmith | 2 | `supabase/migrations/_archive_old/2025*_leads_*.sql` | ✅ Applied | Keep archived |

**Total Archived:** 25 migration files (safely stored, no action needed)

### Debug Routes (Production Exposure Risk)

| Route | File | Purpose | Status | Recommendation |
|-------|------|---------|--------|----------------|
| `/debug-env` | `app/debug-env/page.tsx` | Env var inspector | 🟡 Active | **Gate**: Add `NODE_ENV !== 'production'` check |
| `/debug-auth` | `app/debug-auth/page.tsx` | Auth debugger | 🟡 Active | **Gate**: Already has `NODE_ENV` check, verify |
| `/test` | `app/test/page.tsx` | Test page | 🟡 Active | **Delete**: Remove if unused |
| `/test-percy-chat` | `app/test-percy-chat/page.tsx` | Percy chat test | 🟡 Active | **Delete**: Remove or gate with auth |
| `/api/_probe/*` | 7 routes in `app/api/_probe/` | Health checks | 🟡 Active | **Consider**: Add auth or leave (standard health checks) |

### Test/Script Files (Cleanup Candidates)

| File | Purpose | Status | Recommendation |
|------|---------|--------|----------------|
| `test-stripe-resolver.js` | Stripe price resolver test | Keep | Move to `/tests` or `/scripts/test` |
| `scripts/test-*.ts` | Various test scripts | Keep | Ensure not imported in prod code |
| `convert_*.js` | Import conversion scripts | Archive | Move to `/archive` if migration complete |
| `commit*.ps1` | PowerShell commit scripts | Archive | Remove if unused |

---

## 🎯 CORE SYSTEMS MAP

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SKRBL AI Platform                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           1. ENTRY & AUTH LAYER                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Browser Request
         │
         ▼
    ┌──────────────┐
    │ middleware.ts│  ← Feature Flag Router
    └──────┬───────┘
           │
     ┌─────┴─────────────┬─────────────────┬────────────────┐
     │                   │                 │                │
     ▼                   ▼                 ▼                ▼
[FF_CLERK=1]      [FF_USE_BOOST=1]   [default]      [/bundle/* blocked]
     │                   │                 │                │
     ▼                   ▼                 ▼                │
┌─────────┐      ┌─────────────┐   ┌─────────────┐        │
│ Clerk   │      │  Supabase   │   │  Supabase   │        │
│(future) │      │    Boost    │   │   Legacy    │        │
└────┬────┘      └──────┬──────┘   └──────┬──────┘        │
     │                  │                  │               │
     │                  │                  │               │
     └──────────────────┴──────────────────┴───────────────┘
                            │
                            ▼
                ┌────────────────────────┐
                │  requireUser.ts        │  ← Normalizes user object
                │  Returns: NormalizedUser│  ← Supports all 3 auth systems
                └───────────┬────────────┘
                            │
                            ▼
                    [Protected Routes]

┌─────────────────────────────────────────────────────────────────────────────┐
│                        2. DATABASE & STATE LAYER                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────────────────────────────────────────────┐
    │               lib/supabase/server.ts                      │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
    │  │ Legacy Admin │  │ Boost Admin  │  │ Anon Clients │   │
    │  │   Client     │  │    Client    │  │ (browser)    │   │
    │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
    └─────────┼──────────────────┼──────────────────┼───────────┘
              │                  │                  │
              ▼                  ▼                  ▼
    ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Supabase      │  │  Supabase    │  │   Browser    │
    │   Legacy DB     │  │  Boost DB    │  │   Queries    │
    └─────────────────┘  └──────────────┘  └──────────────┘
              │                  │                  │
              └──────────────────┴──────────────────┘
                            │
                Tables: profiles, agent_workflow_logs,
                        promo_codes, vip_status, leads,
                        analytics_*, auth_audit_logs

┌─────────────────────────────────────────────────────────────────────────────┐
│                    3. APPLICATION & ROUTING LAYER                           │
└─────────────────────────────────────────────────────────────────────────────┘

    Homepage (/)                     Dashboard                    Admin
         │                                │                          │
         ▼                                ▼                          ▼
┌──────────────────┐          ┌──────────────────┐        ┌────────────────┐
│ HomeHeroScanFirst│          │ DashboardHome    │        │ AdminLogsClient│
│ PercyFigure      │          │ DashboardClient  │        │ /admin/percy   │
│ AgentLeaguePreview│         │ QuickLaunchPanel │        └────────────────┘
│ FooterCTAs       │          │ PercyWidget      │                │
└──────────────────┘          │ Notifications    │                │
         │                    └──────────────────┘                │
         │                            │                            │
         └────────────────────────────┴────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌────────────┐
            │ Percy System │  │Agent System  │  │ Analytics  │
            └──────────────┘  └──────────────┘  └────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        4. PERCY AI SYSTEM (151 files)                       │
└─────────────────────────────────────────────────────────────────────────────┘

    User Interaction
         │
         ▼
    ┌──────────────────────┐
    │ PercyWidget.tsx      │  ← Main entry point
    │ (573 lines)          │
    └──────┬───────────────┘
           │
     ┌─────┴──────────────────────────────┐
     │ Feature Flag Check:                │
     │ NEXT_PUBLIC_USE_OPTIMIZED_PERCY    │
     └─────┬──────────────────────────────┘
           │
    ┌──────┴───────┬─────────────────────────┐
    │ flag=0       │ flag=1                  │
    ▼              ▼                         │
┌─────────────────────────────┐  ┌──────────────────────────┐
│ PercyOnboardingRevolution   │  │ PercyOnboarding          │
│ (LEGACY - 2,827 lines)      │  │ RevolutionOptimized      │
│ ⚠️ 25+ useState hooks       │  │ (Clean refactor)         │
│ ⚠️ Multiple intervals       │  │ ✓ Better performance     │
└──────────┬──────────────────┘  └───────────┬──────────────┘
           │                                  │
           └──────────────┬───────────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │ UnifiedPercyChat.tsx   │
              │ StreamingPercyChat.tsx │
              └────────┬───────────────┘
                       │
                       ▼
              ┌────────────────────────┐
              │ /api/percy/chat        │  ← API endpoint
              └────────┬───────────────┘
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
        ┌──────────────┐  ┌──────────────┐
        │   OpenAI     │  │   Pinecone   │
        │   GPT-4      │  │  Vector DB   │
        └──────────────┘  └──────────────┘
                │             │
                └──────┬──────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ ai-agents/           │
            │ percyAgent.ts        │
            │ percySyncAgent.ts    │
            └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                   5. AGENT SYSTEM & WORKFLOW ENGINE                         │
└─────────────────────────────────────────────────────────────────────────────┘

    User Triggers Agent
         │
         ▼
    ┌──────────────────────────────┐
    │ /agents/[agent]/page.tsx     │
    │ AgentCard.tsx                │  ← 293 lines with button hotspot
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ /api/agents/[agentId]/launch │  ← Launch API
    └──────────┬───────────────────┘
               │
        ┌──────┴───────┐
        │              │
        ▼              ▼
    ┌─────────┐   ┌──────────────────┐
    │ Supabase│   │ n8n Webhook      │  ← FF_N8N_NOOP check
    │ Logging │   │ (if enabled)     │
    └─────────┘   └────────┬─────────┘
                           │
                     ┌─────┴──────┐
                     │ NOOP=1?    │
                     └─────┬──────┘
                           │
                  ┌────────┴─────────┐
                  │ YES              │ NO
                  ▼                  ▼
           [Log & Return]     [Trigger n8n Workflow]
                                     │
                         ┌───────────┴────────────┬──────────────┐
                         │                        │              │
                         ▼                        ▼              ▼
                  Publishing Agent        Proposal Agent    Content Sync
                  (N8N_WORKFLOW_         (N8N_WORKFLOW_    (N8N_WORKFLOW_
                   PUBLISH_BOOK)          SEND_PROPOSAL)    SYNC_CONTENT)

┌─────────────────────────────────────────────────────────────────────────────┐
│                       6. PAYMENT & CHECKOUT FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

    User Clicks Buy
         │
         ▼
    ┌──────────────────────────────┐
    │ components/pricing/          │
    │ BuyButton.tsx                │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ lib/stripe/priceResolver.ts  │  ← Resolves 50+ price IDs
    │                              │     from env vars
    └──────────┬───────────────────┘
               │
        ┌──────┴──────────┐
        │ Feature Flag?   │
        │ FF_STRIPE_      │
        │ FALLBACK_LINKS  │
        └──────┬──────────┘
               │
    ┌──────────┴────────────┐
    │ flag=0                │ flag=1
    ▼                       ▼
┌─────────────────┐  ┌─────────────────┐
│ Checkout        │  │ Payment Links   │
│ Sessions API    │  │ (redirect)      │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Stripe Processing    │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ /api/stripe/webhook  │  ← Webhook handler
         └──────────┬───────────┘
                    │
            ┌───────┴────────┐
            │                │
            ▼                ▼
    ┌──────────────┐  ┌──────────────┐
    │ Update       │  │ Forward to   │  ← If FF_N8N_NOOP=0
    │ Supabase     │  │ n8n          │
    │ Profile      │  └──────────────┘
    └──────────────┘         │
                             ▼
                  ┌────────────────────┐
                  │ Post-Payment       │
                  │ Automation         │
                  │ (email sequences,  │
                  │  onboarding flows) │
                  └────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         7. ANALYTICS & MONITORING                           │
└─────────────────────────────────────────────────────────────────────────────┘

    Platform Events
         │
         ├──────────────────┬───────────────────┬──────────────────┐
         │                  │                   │                  │
         ▼                  ▼                   ▼                  ▼
    ┌─────────┐      ┌──────────┐       ┌──────────┐      ┌─────────────┐
    │ Sentry  │      │ Activity │       │ Analytics│      │ Health      │
    │ Errors  │      │ Logger   │       │ APIs     │      │ Probes      │
    └────┬────┘      └────┬─────┘       └────┬─────┘      └──────┬──────┘
         │                │                   │                   │
         ▼                ▼                   ▼                   ▼
    Client/Server   Supabase Logs     Internal Dashboard   /_probe/* routes
    Error Tracking  Activity Feed     ARR, Agent Usage     env, flags, auth,
    (10% sampling)  (live updates)    Percy analytics      db, supabase, stripe
```

### Key File Responsibilities

| Component | Primary Files | Purpose |
|-----------|--------------|---------|
| **Auth Router** | `middleware.ts` (147 lines) | Feature flag-based routing, founder gates, bundle blocks |
| **Auth Normalizer** | `lib/auth/requireUser.ts` (103 lines) | Unifies Clerk, Boost, Legacy auth → `NormalizedUser` |
| **Clerk Wrapper** | `components/providers/ConditionalClerkProvider.tsx` | Activates ClerkProvider only when `FF_CLERK=1` |
| **Supabase Client Factory** | `lib/supabase/server.ts` (363 lines) | Creates admin/anon clients for both instances |
| **Feature Flag Registry** | `lib/config/featureFlags.ts` (200 lines) | Single source of truth for all 23+ flags |
| **n8n Orchestrator** | `lib/n8nClient.ts` | n8n webhook triggers, NOOP mode handling |
| **n8n Webhook Sender** | `lib/webhooks/n8nWebhooks.ts` | Sends webhooks to n8n workflows |
| **Percy Agent Core** | `ai-agents/percyAgent.ts` | Percy AI agent definition |
| **Percy Widget** | `components/percy/PercyWidget.tsx` (573 lines) | Main Percy UI component |
| **Percy Chat** | `components/percy/UnifiedPercyChat.tsx` | Unified chat interface |
| **Agent Card** | `components/ui/AgentCard.tsx` (293 lines) | Agent display with interactive hotspot |
| **Agent Launch API** | `app/api/agents/[agentId]/launch/route.ts` | Agent workflow trigger endpoint |
| **Stripe Price Resolver** | `lib/stripe/priceResolver.ts` | Resolves 50+ price IDs from env vars |
| **Stripe Webhook** | `app/api/stripe/webhook/route.ts` | Handles Stripe events, forwards to n8n |
| **Publishing Agent UI** | `components/book-publishing/PublishingAssistantPanel.tsx` | Book publishing interface |
| **Dashboard Home** | `components/dashboard/DashboardHome.tsx` | Main dashboard component |
| **Universal Dashboard** | `app/udash/page.tsx` | New Boost-powered dashboard |

---

## 📐 SYSTEM DEPENDENCIES

### Integration Dependency Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│                     SYSTEM DEPENDENCIES                            │
└────────────────────────────────────────────────────────────────────┘

External Service      → Required By                    → Fallback
─────────────────────────────────────────────────────────────────────
Supabase Legacy       → Default auth, all dashboards   → None (critical)
Supabase Boost        → /udash, new auth flow         → None (opt-in)
Clerk                 → Future auth (prepared)         → Not implemented
n8n Cloud             → 57 files, automations         → NOOP mode ✓
Stripe                → /checkout, all payments        → None (critical)
OpenAI API            → Percy, agent chat             → Degrades gracefully
Pinecone              → Percy RAG, semantic search    → Falls back to non-RAG
Resend                → Email sending                  → Logs error, continues
Twilio                → SMS verification              → Logs error, continues
Sentry                → Error monitoring              → Silent failure OK
```

### Critical Path Services (Cannot Fail)

1. **Supabase (Legacy or Boost)** - Auth, profiles, data storage
2. **Stripe** - Payment processing (no alternative)
3. **Next.js Runtime** - Core application

### Degradable Services (Can Fail Gracefully)

1. **n8n** - NOOP mode prevents blocking (✓ active)
2. **OpenAI** - Chat features degrade, app continues
3. **Pinecone** - Falls back to non-semantic search
4. **Resend** - Email fails, logs error, user flow continues
5. **Twilio** - SMS fails, logs error, alternative paths exist
6. **Sentry** - Monitoring fails silently

---

## 🔄 MIGRATION PATHS

### Recommended Migration Sequence

```
Current State (Multi-Auth)
         │
         ▼
┌────────────────────────────────────────┐
│ Phase 1: Auth Consolidation           │
│ Timeline: 2-3 weeks                    │
└────────────────────────────────────────┘
         │
         ├─ Option A: Migrate to Boost
         │  1. Set FF_USE_BOOST_FOR_AUTH=1 in staging
         │  2. Test all auth flows
         │  3. Migrate users (or dual-run)
         │  4. Set flag=1 in production
         │  5. Remove legacy Supabase code
         │
         └─ Option B: Migrate to Clerk
            1. Complete Clerk implementation
            2. Set NEXT_PUBLIC_FF_CLERK=1 in staging
            3. Test all auth flows
            4. Migrate users
            5. Remove Supabase auth code
         │
         ▼
┌────────────────────────────────────────┐
│ Phase 2: Percy Optimization            │
│ Timeline: 1 week                       │
└────────────────────────────────────────┘
         │
         1. Set NEXT_PUBLIC_USE_OPTIMIZED_PERCY=1
         2. A/B test for 1 week
         3. Monitor performance metrics
         4. Remove legacy Percy component
         5. Reduce Percy files from 151 → ~50
         │
         ▼
┌────────────────────────────────────────┐
│ Phase 3: n8n Re-enablement             │
│ Timeline: 1-2 weeks                    │
└────────────────────────────────────────┘
         │
         1. Verify n8n instance stability
         2. Set FF_N8N_NOOP=0 in staging
         3. Test all webhook integrations
         4. Monitor success rates
         5. Roll out to production
         │
         ▼
┌────────────────────────────────────────┐
│ Phase 4: Code Cleanup                  │
│ Timeline: 2-3 weeks                    │
└────────────────────────────────────────┘
         │
         1. Remove unused auth code
         2. Delete debug routes
         3. Consolidate Stripe price IDs
         4. Remove bundle pricing code
         5. Archive unused integrations
         │
         ▼
    Simplified Architecture ✓
```

---

## 📋 SUMMARY METRICS

### System Health Score: 🟡 72/100

**Breakdown:**
- ✅ **Architecture:** 18/20 (clean separation, good patterns)
- ⚠️ **Technical Debt:** 12/20 (auth fragmentation, Percy legacy)
- ✅ **Security:** 18/20 (audit logs, proper env handling)
- ⚠️ **Performance:** 14/20 (Percy bottleneck, large bundles)
- ✅ **Maintainability:** 10/20 (good docs, but complex flags)

### Priority Actions (Next 30 Days)

1. **🔴 CRITICAL** - Fix git repo corruption
2. **🔴 CRITICAL** - Restore `.env.example`
3. **🟡 HIGH** - Choose auth migration path (Boost or Clerk)
4. **🟡 HIGH** - Enable optimized Percy (set flag=1)
5. **🟡 HIGH** - Gate debug routes in production
6. **🟢 MEDIUM** - Re-enable n8n workflows (staging first)
7. **🟢 MEDIUM** - Consolidate Stripe price IDs

### Files Requiring Immediate Attention

1. `.env.example` - **RESTORE** (deleted, critical for onboarding)
2. `middleware.ts` - Review auth routing complexity
3. `components/percy/PercyOnboardingRevolution.tsx` - **REPLACE** with optimized
4. `lib/stripe/priceResolver.ts` - Refactor 50+ env var lookups
5. `lib/config/featureFlags.ts` - Audit and consolidate flags
6. Debug pages (`/debug-*`, `/test-*`) - Gate or delete

---

**Report Created By:** Visual Design Agent  
**Source Data:** CODEBASE_AUDIT_REPORT.md  
**Visual Diagrams:** Mermaid (render at [mermaid.live](https://mermaid.live) or GitHub)  
**Next Review:** After Phase 1 migration completion
