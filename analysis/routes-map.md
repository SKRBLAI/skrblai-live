# Routes & Entrypoints Map

## Overview
Complete inventory of all Next.js routes (pages, layouts, API endpoints) in the SKRBL AI platform.

---

## Page Routes (39 total)

| Route | File | Top-Level Imports | Notes |
|-------|------|------------------|-------|
| `/` | `app/page.tsx` | MetricsStrip, FooterCTAs, AgentLeaguePreview, WizardLauncher, PercyOnboardingRevolution | **Dynamic hero variant** based on `FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT` (scan-first/split/legacy) |
| `/agents` | `app/agents/page.tsx` | AgentLeagueCard, AgentLeagueOrbit, agentLeague, AuthContext | **Orbit gated** by `NEXT_PUBLIC_ENABLE_ORBIT` flag |
| `/agents/[agent]` | `app/agents/[agent]/page.tsx` | Dynamic agent pages | Individual agent detail pages |
| `/agents/[agent]/backstory` | `app/agents/[agent]/backstory/page.tsx` | Backstory content | Agent backstory narratives |
| `/agents/ira` | `app/agents/ira/page.tsx` | IRA-specific page | Special trading mentor agent |
| `/agents/not-found` | `app/agents/not-found/page.tsx` | Not found fallback | Agent 404 page |
| `/dashboard` | `app/dashboard/page.tsx` | AuthContext, CardShell, PageLayout | **Central routing hub** - redirects to role-based dashboards (founder/vip/user) |
| `/dashboard/user` | `app/dashboard/user/page.tsx` | User-specific dashboard | Regular user dashboard |
| `/dashboard/vip` | `app/dashboard/vip/page.tsx` | VIP-specific dashboard | VIP users dashboard |
| `/dashboard/founder` | `app/dashboard/founder/page.tsx` | Founder-specific dashboard | Founder role dashboard |
| `/dashboard/heir` | `app/dashboard/heir/page.tsx` | Heir-specific dashboard | Heir role dashboard |
| `/dashboard/parent` | `app/dashboard/parent/page.tsx` | Parent portal | Sports parent tracking |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | Profile management | User profile editor |
| `/dashboard/social-media` | `app/dashboard/social-media/page.tsx` | Social media management | Social tools |
| `/dashboard/website` | `app/dashboard/website/page.tsx` | Website management | Website tools |
| `/dashboard/branding` | `app/dashboard/branding/page.tsx` | Branding tools | Brand identity tools |
| `/dashboard/book-publishing` | `app/dashboard/book-publishing/page.tsx` | Book publishing tools | Publishing workflows |
| `/dashboard/getting-started` | `app/dashboard/getting-started/page.tsx` | Onboarding guide | First-time user guide |
| `/dashboard/founders` | `app/dashboard/founders/page.tsx` | Founders dashboard | Legacy founder page |
| `/dashboard/marketing` | `app/dashboard/marketing/page.tsx` | Marketing tools | Marketing automation |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | Analytics dashboard | Analytics overview |
| `/dashboard/analytics/internal` | `app/dashboard/analytics/internal/page.tsx` | Internal analytics | Admin analytics |
| `/pricing` | `app/pricing/page.tsx` | PricingCard, CheckoutButton, BillingToggle, PRICING_CATALOG | **Unified pricing** - Business + Sports + Add-ons |
| `/sports` | `app/sports/page.tsx` | UnifiedSportsHero, SportsPricingGrid, MetricsStrip, EncouragementFooter | **SkillSmith standalone** experience |
| `/sports/upload` | `app/sports/upload/page.tsx` | Video upload interface | Sports video analysis upload |
| `/features` | `app/features/page.tsx` | Features overview | Product features page |
| `/about` | `app/about/page.tsx` | About page | Company/product info |
| `/contact` | `app/contact/page.tsx` | Contact form | Contact/support page |
| `/checkout` | `app/checkout/page.tsx` | Checkout flow | Checkout landing |
| `/checkout/success` | `app/checkout/success/page.tsx` | Success confirmation | Post-purchase success |
| `/checkout/cancel` | `app/checkout/cancel/page.tsx` | Cancellation page | Checkout cancelled |
| `/content-automation` | `app/content-automation/page.tsx` | Content automation tools | Content creation tools |
| `/academy` | `app/academy/page.tsx` | Academy/learning | Training resources |
| `/(auth)/sign-in` | `app/(auth)/sign-in/page.tsx` | Sign-in form | Authentication sign-in |
| `/(auth)/sign-up` | `app/(auth)/sign-up/page.tsx` | Sign-up form | Authentication sign-up |
| `/auth/callback` | `app/auth/callback/page.tsx` | OAuth callback handler | Auth redirect handler |
| `/auth/redirect` | `app/auth/redirect/page.tsx` | Auth redirect handler | Secondary auth redirect |
| `/admin/logs` | `app/admin/logs/page.tsx` | Admin log viewer | Admin logging |
| `/admin/percy` | `app/admin/percy/page.tsx` | Percy admin tools | Percy configuration |

---

## Layout Routes (10 total)

| Route | File | Purpose | Notes |
|-------|------|---------|-------|
| Root | `app/layout.tsx` | App-wide layout | Metadata, fonts, global styles, ClientLayout wrapper |
| Features | `app/features/layout.tsx` | Features section layout | Feature pages wrapper |
| Sports | `app/sports/layout.tsx` | Sports section layout | SkillSmith branding |
| Dashboard | `app/dashboard/layout.tsx` | Dashboard layout | Protected area layout |
| Dashboard Profile | `app/dashboard/profile/layout.tsx` | Profile section layout | Profile pages wrapper |
| Pricing | `app/pricing/layout.tsx` | Pricing layout | Pricing pages wrapper |
| Content Automation | `app/content-automation/layout.tsx` | Content tools layout | Content section wrapper |
| Contact | `app/contact/layout.tsx` | Contact layout | Contact pages wrapper |
| About | `app/about/layout.tsx` | About layout | About pages wrapper |
| Agents | `app/agents/layout.tsx` | Agents section layout | Agent pages wrapper |

---

## API Routes (84 total)

### Authentication & User Management
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/auth/apply-code` | Apply promo/VIP codes | POST - Code redemption |
| `/api/auth/dashboard-signin` | Dashboard authentication | POST - Enhanced auth with promo/VIP |
| `/api/auth/analytics` | Auth analytics | Auth event tracking |
| `/api/auth/integration-support` | Integration auth support | Third-party integrations |

### Stripe & Payments
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/checkout` | **Unified checkout** | POST - Main checkout endpoint |
| `/api/stripe/webhook` | **Stripe webhook handler** | POST - Single webhook endpoint |
| `/api/stripe/create-checkout-session` | Legacy checkout session | Older checkout API |
| `/api/stripe/create-session` | Legacy session creation | Older session API |
| `/api/stripe/calculate-tax` | Tax calculation | Stripe Tax API |

### Agents
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/agents` | Agent list | GET - All agents |
| `/api/agents/league` | Agent league data | GET - League info |
| `/api/agents/assets-check` | Asset availability check | GET - Images/backstories |
| `/api/agents/debug` | Agent debugging | Debug tools |
| `/api/agents/[agentId]/launch` | Launch agent | POST - Start agent |
| `/api/agents/[agentId]/trigger` | Trigger agent workflow | POST - Execute agent |
| `/api/agents/[agentId]/trigger-n8n` | N8N workflow trigger | POST - N8N integration |
| `/api/agents/chat/[agentId]` | Agent chat | POST - Chat with agent |
| `/api/agents/workflow/[agentId]` | Agent workflow | Workflow management |
| `/api/agents/ira/chat` | IRA agent chat | Trading mentor chat |
| `/api/agents/ira/is-allowed` | IRA access check | GET - Permission check |

### Sports & SkillSmith
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/skillsmith` | SkillSmith API | Sports analysis |
| `/api/sports/intake` | Sports intake form | POST - Athlete intake |
| `/api/sms/skillsmith` | SkillSmith SMS | SMS notifications |

### Analytics & Metrics
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/analytics/dashboard` | Dashboard analytics | Analytics overview |
| `/api/analytics/arr` | ARR metrics | Revenue tracking |
| `/api/analytics/arr/snapshot` | ARR snapshot | Point-in-time ARR |
| `/api/analytics/agents` | Agent analytics | Agent usage stats |
| `/api/analytics/agent-usage` | Agent usage tracking | Detailed usage |
| `/api/analytics/percy` | Percy analytics | Percy-specific |
| `/api/analytics/addons` | Add-ons analytics | Add-on usage |
| `/api/analytics/quick-wins` | Quick wins tracking | Quick win analytics |
| `/api/analytics/popups` | Popup analytics | Popup engagement |
| `/api/analytics/export-audit` | Export audit logs | Audit log export |

### VIP & Promo
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/promo/validate` | Promo code validation | GET/POST - Validate codes |
| `/api/vip/proposal-automation` | VIP proposal automation | VIP-specific |
| `/api/vip/recognition` | VIP recognition | VIP status |
| `/api/codes/resolve` | Code resolution | Resolve code details |

### Founders
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/founders/me` | Current founder info | GET - Founder data |
| `/api/founders/redeem` | Founder code redemption | POST - Redeem founder code |
| `/api/founders/admin/overview` | Founder admin | Admin overview |

### Miscellaneous
| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/health` | Health check | GET - System health |
| `/api/health/auth` | Auth health check | Auth system health |
| `/api/env-check` | Environment check | Verify env vars |
| `/api/scan` | Business scan | Percy scan API |
| `/api/percy/scan` | Percy scan | Percy analysis |
| `/api/percy/contact` | Percy contact | Contact via Percy |
| `/api/dummy-upload` | Test upload | Upload testing |
| `/api/contact/submit` | Contact form | POST - Contact form |
| `/api/email/send` | Email sending | Email API |
| `/api/sms/*` | SMS routes | SMS notifications |
| `/api/marketing/*` | Marketing routes | Marketing tools |
| `/api/user/*` | User routes | User management |
| `/api/trial/*` | Trial routes | Trial management |

---

## Key Observations

### 1. **Homepage Variants (3 options)**
The homepage (`/`) dynamically loads one of three hero variants based on `FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT`:
- `scan-first` → `@/components/home/HomeHeroScanFirst` (**default**)
- `split` → `@/components/home/HomeHeroSplit`
- `legacy` → `@/components/home/Hero`

### 2. **Dashboard Role-Based Routing**
The main `/dashboard` page acts as a routing hub that redirects users to:
- `/dashboard/founder` - For founders/creators
- `/dashboard/heir` - For heir role
- `/dashboard/vip` - For VIP users
- `/dashboard/user` - For regular users

### 3. **Unified Checkout**
`/api/checkout` is the **primary checkout endpoint** that handles both:
- Subscription mode (plans)
- Payment mode (one-time purchases/add-ons)
- Supports both Business and Sports verticals

### 4. **Single Webhook Path**
`/api/stripe/webhook` is the **canonical webhook endpoint**. Uses `STRIPE_WEBHOOK_SECRET` env var.

### 5. **Agent System**
Complex agent routing with:
- Generic agent pages: `/agents/[agent]`
- Backstory pages: `/agents/[agent]/backstory`
- Special IRA agent with access gating

### 6. **Sports Standalone**
`/sports` provides a complete standalone experience with its own:
- Hero component
- Pricing grid
- Video upload flow
- Separate from main Business platform

---

## Next Steps

1. **Homepage Consolidation**: Decide on one hero variant and deprecate others
2. **Checkout Migration**: Migrate any remaining legacy checkout endpoints to unified `/api/checkout`
3. **Dashboard Simplification**: Consider flatter dashboard structure vs. role-based redirects
4. **API Cleanup**: Archive unused API endpoints (especially legacy stripe endpoints)
