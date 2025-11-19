# SKRBL AI 2.0 - MASTER IMPLEMENTATION PLAN

> **Your north star document for upgrading SKRBL AI from prototype to platform**

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [The 2.0 Vision](#the-2-0-vision)
4. [Technical Architecture](#technical-architecture)
5. [The Four Pillars](#the-four-pillars)
6. [Infrastructure & Standards](#infrastructure--standards)
7. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
8. [Critical Path & Timeline](#critical-path--timeline)
9. [Risk Mitigation](#risk-mitigation)
10. [Success Metrics](#success-metrics)

---

## 🎯 EXECUTIVE SUMMARY

### What We're Building

SKRBL AI 2.0 transforms your current "one shell trying to be everything" into **three focused verticals sharing one backbone**:

- **SKRBL AI Biz** → Automation + AI agents for entrepreneurs/creators
- **NTNT × MSTRY** → Athletic & mindset performance system  
- **Studio / AIR** → Identity, avatars, and storytelling across both
- **S.A.F.E** → Social impact arm (K-2 + Special Ed)

### Why This Matters

**Today's Pain Points:**
- Mixed auth systems (Legacy Supabase + Boost + Clerk partially wired)
- Scattered pricing logic (100+ env vars)
- Sports and Studio are "half-real" (strong narrative, partial code, missing plumbing)
- No clear separation between legacy and future features

**2.0 Benefits:**
- Clean separation: `/legacy` → stable current experience, `/new` → future SKRBL AI
- One auth story (Clerk + Supabase Boost)
- One pricing system (price map JSON)
- Minimal feature flags (4 core flags)
- Investor-ready platform feel

### Implementation Approach

**6 Major Phases** over **8-12 weeks** (aggressive) or **12-16 weeks** (sustainable):

1. **Foundation** (Week 1-2): Auth, flags, routing split
2. **Biz 2.0 MVP** (Week 3-4): Percy Intake v2, Agent League 2.0
3. **NTNT × MSTRY** (Week 5-6): NTNT intake, SkillSmith integration
4. **Studio/AIR + S.A.F.E** (Week 7-8): Studio hub, S.A.F.E page
5. **Integration & Polish** (Week 9-10): Cross-vertical features, UX polish
6. **Launch Prep** (Week 11-12): Testing, documentation, cutover

---

## 📊 CURRENT STATE ANALYSIS

### Codebase Snapshot

```
✅ Strong Foundations (Keep & Build On):
├── Next.js 15 App Router
├── Agent Registry (16+ agents in ai-agents/)
├── Percy onboarding flows
├── Sports page (/sports) with SkillSmith
├── Supabase Boost helpers exist
├── Pricing validation scripts
└── Feature flag infrastructure started

⚠️ Needs Work (2.0 Focus Areas):
├── Auth is fragmented (Legacy + Boost + Clerk partial)
├── Pricing uses 100+ NEXT_PUBLIC_STRIPE_PRICE_* vars
├── No /new or /legacy route split yet
├── FF_SITE_VERSION flag not implemented
├── NTNT backend systems not fully wired
├── Studio/AIR has no routes yet
└── S.A.F.E is concept only

🔧 Technical Debt to Address:
├── Consolidate auth to Clerk + Boost only
├── Migrate all pricing to NEXT_PUBLIC_PRICE_MAP_JSON
├── Deprecate 100+ old feature flags
├── Wire n8n or equivalent for automations
└── Create unified dashboard experience
```

### Current File Structure

```
/workspace/
├── app/
│   ├── page.tsx              # Current homepage (will become /legacy)
│   ├── sports/               # NTNT foundation ✅
│   ├── agents/               # Agent registry ✅
│   ├── pricing/              # Needs migration to price map
│   ├── auth2/                # Boost auth routes ✅
│   ├── udash/                # Boost dashboard ✅
│   └── (no /new yet)         # ⚠️ Needs creation
│
├── ai-agents/                # Agent definitions ✅
├── components/
│   ├── pricing/              # Needs price map integration
│   ├── sports/               # NTNT components ✅
│   └── home/                 # Will need 2.0 variants
│
├── lib/
│   ├── config/
│   │   ├── featureFlags.ts   # ✅ Good structure
│   │   └── flags.ts          # ✅ Flag helpers exist
│   ├── pricing/
│   │   ├── catalog.ts        # ✅ Unified pricing exists
│   │   └── sportsPricing.ts  # ✅ Sports pricing ready
│   ├── auth/                 # ⚠️ Needs consolidation
│   └── supabase/
│       └── server.ts         # ✅ Boost support exists
│
├── scripts/
│   ├── preflight.mjs         # ✅ Build validation
│   ├── validate-env.mjs      # ✅ Env validation
│   └── validate-pricing.mjs  # ✅ Pricing validation
│
└── middleware.ts             # ⚠️ Needs FF_SITE_VERSION routing
```

### Current Feature Flags

**Existing (Good):**
- `FF_N8N_NOOP` - n8n mode control ✅
- `NEXT_PUBLIC_ENABLE_STRIPE` - Stripe toggle ✅
- `NEXT_PUBLIC_HP_GUIDE_STAR` - Homepage features ✅

**Partial (Needs Work):**
- `NEXT_PUBLIC_FF_CLERK` - Clerk auth (not primary yet) ⚠️
- `FF_USE_BOOST_FOR_AUTH` - Boost auth (not enforced) ⚠️

**Missing (Need to Add):**
- `FF_BOOST` - Master Boost flag
- `FF_CLERK` - Master Clerk flag (rename from NEXT_PUBLIC_FF_CLERK)
- `FF_SITE_VERSION` - Controls `/` routing to `/legacy` or `/new`

### Auth Status

| System | Status | 2.0 Role |
|--------|--------|----------|
| **Legacy Supabase** | Active, used by old dashboard | ❌ Deprecate |
| **Boost Supabase** | Partially wired, helpers exist | ✅ Primary DB |
| **Clerk** | Provider exists but not enforced | ✅ Primary Auth |

---

## 🚀 THE 2.0 VISION

### The Three Verticals

```
┌─────────────────────────────────────────────────────────┐
│                    SKRBL AI 2.0                         │
│                  (Unified Platform)                      │
└─────────────────────────────────────────────────────────┘
              │
              ├─────────────────────────────────┬─────────────────────────────────┬─────────────────────────
              │                                 │                                 │
    ┌─────────▼────────┐              ┌────────▼────────┐              ┌────────▼────────┐
    │   SKRBL AI Biz   │              │  NTNT × MSTRY   │              │  Studio / AIR   │
    │   (Business)     │              │   (Sports)      │              │   (Identity)    │
    └──────────────────┘              └─────────────────┘              └─────────────────┘
    │ Entry: /new      │              │ Entry: /ntnt    │              │ Entry: /studio  │
    │ • Percy Intake   │              │ • NTNT Intake   │              │ • Avatar Builder│
    │ • Agent League   │              │ • SkillSmith    │              │ • AIR Cards     │
    │ • Biz Products   │              │ • Video Upload  │              │ • Story Hub     │
    └──────────────────┘              └─────────────────┘              └─────────────────┘
              │                                 │                                 │
              └─────────────────────────────────┴─────────────────────────────────┘
                                           │
                               ┌───────────▼───────────┐
                               │    S.A.F.E            │
                               │  (Social Impact)      │
                               │  Entry: /safe         │
                               └───────────────────────┘
```

### User Journey Map

#### **New Visitor Flow**

```
1. Land on Homepage (/)
   ↓
2. FF_SITE_VERSION = 'new' → redirect to /new
   ↓
3. See Percy Intake v2 Hero
   - "What are you trying to build?"
   - Optional URL scan or file upload
   ↓
4. Percy analyzes and recommends:
   └─→ Biz focus → Stay on /new, show agents
   └─→ Sports focus → Route to /ntnt
   └─→ Studio focus → Route to /studio
   ↓
5. User picks path:
   └─→ Biz: See agent cards, pricing, checkout
   └─→ NTNT: Take NTNT intake, upload video, get results
   └─→ Studio: Create avatar, design cards
```

#### **Returning User Flow**

```
1. User signs in (Clerk)
   ↓
2. System checks profile in Boost Supabase:
   - Has active subscription? → Dashboard
   - Has NTNT data? → /ntnt dashboard
   - Has Studio projects? → /studio dashboard
   ↓
3. Unified dashboard shows:
   - Active projects across all verticals
   - Usage stats (scans, uploads, credits)
   - Recommended next actions
```

---

## 🏗️ TECHNICAL ARCHITECTURE

### Route Structure (2.0)

```
/                          → Middleware checks FF_SITE_VERSION
├── /legacy               → Current experience (stable, minimal changes)
│   ├── Same structure as current /
│   └── Flag: FF_SITE_VERSION='legacy'
│
├── /new                  → 2.0 Biz Experience ⭐
│   ├── page.tsx          → Percy Intake v2 Hero
│   ├── agents/           → Agent League 2.0
│   ├── pricing/          → New pricing (uses price map)
│   └── checkout/         → Unified checkout
│
├── /ntnt                 → NTNT × MSTRY Vertical ⭐
│   ├── page.tsx          → NTNT Hub
│   ├── intake/           → NTNT Quick Intake (25Q max)
│   ├── upload/           → Video upload (SkillSmith)
│   ├── results/          → NTNT score + analysis
│   ├── parent/           → Parent portal
│   └── coach/            → Coach portal (future)
│
├── /studio               → Studio / AIR Vertical ⭐
│   ├── page.tsx          → Studio Hub
│   ├── avatar/           → Avatar builder
│   ├── cards/            → AIR card gallery
│   └── story/            → Story highlights
│
├── /safe                 → S.A.F.E Page ⭐
│   ├── page.tsx          → Foundation info
│   ├── programs/         → K-2, Special Ed programs
│   └── impact/           → Social impact metrics
│
├── /auth2                → Auth routes (Clerk) ✅
├── /udash                → Unified Dashboard ⭐
│   ├── page.tsx          → Overview (all verticals)
│   ├── biz/              → Biz projects
│   ├── ntnt/             → NTNT/sports data
│   └── studio/           → Studio projects
│
└── /api                  → API routes
    ├── checkout/         → Unified checkout (uses price map)
    ├── percy/            → Percy scan endpoints
    ├── ntnt/             → NTNT intake endpoints
    ├── skillsmith/       → Video analysis endpoints
    └── studio/           → Avatar/AIR endpoints
```

### Database Schema (Supabase Boost)

**Priority Tables to Create/Update:**

```sql
-- Core user table (enhanced)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT, -- 'ROOKIE', 'PRO', 'ALL_STAR', 'FRANCHISE'
  subscription_status TEXT, -- 'active', 'canceled', 'past_due'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NTNT scoring system
CREATE TABLE ntnt_scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  tier TEXT NOT NULL, -- 'JR_NTNT', 'NTNT', 'NTNTNL'
  score INTEGER, -- 0-100
  assessment_data JSONB, -- Full intake responses
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video analysis jobs (SkillSmith)
CREATE TABLE video_analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  video_url TEXT,
  sport TEXT, -- 'baseball', 'basketball', etc.
  status TEXT, -- 'pending', 'processing', 'completed', 'failed'
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Studio/AIR avatars
CREATE TABLE avatars (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  avatar_data JSONB, -- Avatar configuration
  air_card_url TEXT, -- Generated card image
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- S.A.F.E program enrollments
CREATE TABLE safe_enrollments (
  id UUID PRIMARY KEY,
  student_name TEXT,
  grade_level TEXT,
  program_type TEXT, -- 'k2', 'special_ed'
  parent_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (unified)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action_type TEXT, -- 'biz_scan', 'video_upload', 'avatar_create'
  vertical TEXT, -- 'biz', 'ntnt', 'studio'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Pricing System (Price Map JSON)

**Environment Variable Structure:**

```json
{
  "legacy": {
    "fusion": "price_legacy_fusion"
  },
  "early": {
    "fusion": {
      "monthly": "price_early_fusion_m",
      "annual": "price_early_fusion_y"
    }
  },
  "plans": {
    "rookie": {
      "monthly": "price_rookie_m",
      "annual": "price_rookie_y"
    },
    "pro": {
      "monthly": "price_pro_m",
      "annual": "price_pro_y"
    },
    "all_star": {
      "monthly": "price_all_star_m",
      "annual": "price_all_star_y"
    }
  },
  "ntnt": {
    "jr_pack": "price_ntnt_jr",
    "mstry_pack": "price_ntnt_mstry",
    "team_tier": "price_ntnt_team"
  },
  "studio": {
    "avatar_basic": "price_air_basic",
    "avatar_pro": "price_air_pro",
    "card_prints": "price_air_prints"
  }
}
```

**Helper Function:**

```typescript
// lib/pricing/priceMap.ts
export function getPriceId(path: string): string | null {
  const priceMapJson = process.env.NEXT_PUBLIC_PRICE_MAP_JSON;
  if (!priceMapJson) return null;
  
  try {
    const priceMap = JSON.parse(priceMapJson);
    const parts = path.split('.');
    let current = priceMap;
    
    for (const part of parts) {
      if (!current[part]) return null;
      current = current[part];
    }
    
    return typeof current === 'string' ? current : null;
  } catch (error) {
    console.error('Failed to parse price map:', error);
    return null;
  }
}

// Usage:
// getPriceId('plans.rookie.monthly') → 'price_rookie_m'
// getPriceId('ntnt.jr_pack') → 'price_ntnt_jr'
```

---

## 🎨 THE FOUR PILLARS

### Pillar 1: SKRBL AI Biz

**What Changes in 2.0:**

```diff
Current:
- Hero flips between Percy variants via flags
- Agent League shows all agents
- Pricing pulls from 100+ env vars
- Percy onboarding scattered

2.0 (/new):
+ Percy Intake v2 Hero (unified, smart)
+ Agent League 2.0 (categorized, video-game cards)
+ Pricing from NEXT_PUBLIC_PRICE_MAP_JSON
+ Clear entry points to NTNT and Studio
```

**Percy Intake v2 Flow:**

```typescript
// components/home/PercyIntakeV2.tsx

export default function PercyIntakeV2() {
  const [step, setStep] = useState<'question' | 'scan' | 'results'>('question');
  const [userInput, setUserInput] = useState('');
  const [scanData, setScanData] = useState(null);

  const handleSubmit = async () => {
    // Step 1: Ask what they want
    setStep('scan');
    
    // Step 2: Optional URL scan or file upload
    const scanResult = await fetch('/api/percy/scan', {
      method: 'POST',
      body: JSON.stringify({ input: userInput, url: optionalUrl })
    });
    
    setScanData(await scanResult.json());
    setStep('results');
  };

  return (
    <div className="percy-intake-v2">
      {step === 'question' && (
        <>
          <h1>What are you trying to build?</h1>
          <UniversalPromptBar onSubmit={handleSubmit} />
          <QuickOptions>
            <button onClick={() => route('/ntnt')}>Train like a champion</button>
            <button onClick={() => route('/studio')}>Create your AIR Avatar</button>
          </QuickOptions>
        </>
      )}
      
      {step === 'scan' && <ScanningAnimation />}
      
      {step === 'results' && (
        <ResultsPanel>
          <h2>Here's what we see:</h2>
          <GapAnalysis data={scanData.gaps} />
          <RecommendedAgents agents={scanData.recommendedAgents} />
          <RecommendedPlan plan={scanData.recommendedPlan} />
        </ResultsPanel>
      )}
    </div>
  );
}
```

**Agent League 2.0 Structure:**

```typescript
// ai-agents/index.ts (enhanced)

export interface Agent {
  id: string;
  name: string;
  category: 'biz' | 'ntnt' | 'studio' | 'hybrid';
  badge: 'pro' | 'jr' | 'dual-role' | null;
  archetype: 'athlete' | 'creator' | 'strategist' | 'analyst';
  // ... existing fields
}

// Example categorization:
export const agents: Agent[] = [
  {
    id: 'percy',
    category: 'biz',
    badge: 'pro',
    archetype: 'strategist'
  },
  {
    id: 'skillsmith',
    category: 'ntnt',
    badge: 'pro',
    archetype: 'athlete'
  },
  // ... more agents
];
```

**Biz Products (2.0 SKUs):**

| Product | Description | Monthly | Annual | Includes |
|---------|-------------|---------|--------|----------|
| **Fusion** | All-in-one Biz stack | $49 | $490 | Percy + all biz agents |
| **Content Studio** | Content & publishing only | $29 | $290 | Content agents only |
| **Launch Pad** | Idea → Brand → Launch | $39 | $390 | Brand + launch agents |
| **Legacy Fusion** | For existing users | $39 | $390 | Current feature set |
| **Early Fusion** | New 2.0 discount | $39 | $390 | Full 2.0 access, discounted |

### Pillar 2: NTNT × MSTRY

**Route Structure:**

```
/ntnt/
├── page.tsx              → NTNT Hub (overview)
├── intake/
│   └── page.tsx          → Quick NTNT Intake (25Q max)
├── upload/
│   └── page.tsx          → SkillSmith Video Upload
├── results/[id]/
│   └── page.tsx          → NTNT Score + Analysis
├── parent/
│   └── page.tsx          → Parent Portal
└── coach/
    └── page.tsx          → Coach Portal (future)
```

**NTNT Quick Intake (25Q Max):**

```typescript
// app/ntnt/intake/page.tsx

export default function NTNTIntake() {
  const questions = [
    // Focus & Mental
    { id: 1, text: "How do you handle pressure in competition?", category: "mental" },
    { id: 2, text: "Can you stay focused when you're losing?", category: "mental" },
    
    // Work Ethic
    { id: 3, text: "How often do you practice outside of team time?", category: "work_ethic" },
    { id: 4, text: "Do you set personal training goals?", category: "work_ethic" },
    
    // Response to Adversity
    { id: 5, text: "When you make a mistake, what do you do next?", category: "adversity" },
    { id: 6, text: "How do you respond to coaching feedback?", category: "adversity" },
    
    // Emotions in Games
    { id: 7, text: "Can you control your emotions during tough games?", category: "emotions" },
    { id: 8, text: "How do you celebrate success?", category: "emotions" },
    
    // ... up to 25 questions
  ];

  const calculateNTNTTier = (responses: Response[]): 'JR_NTNT' | 'NTNT' | 'NTNTNL' => {
    const score = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
    
    if (score >= 80) return 'NTNTNL'; // Pro tier
    if (score >= 50) return 'NTNT';   // Mid tier
    return 'JR_NTNT';                 // Junior tier
  };

  return (
    <IntakeFlow
      questions={questions}
      onComplete={async (responses) => {
        const tier = calculateNTNTTier(responses);
        const result = await saveNTNTScore(userId, tier, responses);
        router.push(`/ntnt/results/${result.id}`);
      }}
    />
  );
}
```

**SkillSmith Video Analysis Flow:**

```typescript
// app/ntnt/upload/page.tsx

export default function SkillSmithUpload() {
  const handleUpload = async (file: File, metadata: VideoMetadata) => {
    // 1. Upload to Supabase storage
    const { data: uploadData } = await supabase.storage
      .from('video-analyses')
      .upload(`${userId}/${Date.now()}_${file.name}`, file);
    
    // 2. Create analysis job
    const { data: job } = await supabase
      .from('video_analyses')
      .insert({
        user_id: userId,
        video_url: uploadData.path,
        sport: metadata.sport,
        status: 'pending'
      })
      .select()
      .single();
    
    // 3. Trigger analysis (n8n or direct AI)
    if (process.env.FF_N8N_NOOP !== '1') {
      await fetch('/api/n8n/skillsmith-analysis', {
        method: 'POST',
        body: JSON.stringify({ jobId: job.id })
      });
    }
    
    // 4. Redirect to pending state
    router.push(`/ntnt/results/${job.id}?status=pending`);
  };

  return (
    <VideoUploadFlow
      onUpload={handleUpload}
      acceptedFormats={['mp4', 'mov', 'avi']}
      maxSize={100 * 1024 * 1024} // 100MB
      metadata={{
        sport: ['baseball', 'basketball', 'football', 'soccer', 'golf', 'softball'],
        position: string,
        age: number,
        skill_level: ['beginner', 'intermediate', 'advanced', 'expert']
      }}
    />
  );
}
```

**Parent & Coach Portals:**

```typescript
// app/ntnt/parent/page.tsx

export default function ParentPortal() {
  const { children } = useParentAccount();
  
  return (
    <DashboardLayout title="Parent Portal">
      {children.map(child => (
        <ChildCard key={child.id}>
          <h3>{child.name}</h3>
          <NTNTScoreBadge tier={child.latestNTNTTier} score={child.latestScore} />
          <VideoHistory videos={child.analyses.slice(0, 5)} />
          <NextSteps recommendations={child.recommendedActions} />
        </ChildCard>
      ))}
      
      <UpgradePrompt>
        <h4>Want more detailed insights?</h4>
        <button onClick={() => router.push('/pricing?vertical=ntnt')}>
          Upgrade to MSTRY Pack
        </button>
      </UpgradePrompt>
    </DashboardLayout>
  );
}
```

**NTNT Products:**

| Product | Price | Billing | Includes |
|---------|-------|---------|----------|
| **JR Pack** | $19 | One-time | JR NTNT intake + 1 video analysis |
| **MSTRY Pack** | $39 | Monthly | NTNTNL + 3 analyses/month + parent portal |
| **Team Tier** | $199 | Monthly | 10 athletes + coach portal + team analytics |

### Pillar 3: Studio / AIR

**Route Structure:**

```
/studio/
├── page.tsx              → Studio Hub (overview)
├── avatar/
│   ├── page.tsx          → Avatar Builder
│   └── [id]/page.tsx     → Edit existing avatar
├── cards/
│   └── page.tsx          → AIR Card Gallery
└── story/
    └── page.tsx          → Story Highlights
```

**Studio Hub (Phase 1):**

```typescript
// app/studio/page.tsx

export default function StudioHub() {
  return (
    <PageLayout>
      <HeroSection>
        <h1>Create Your AIR Avatar</h1>
        <p>Your digital identity across SKRBL AI</p>
      </HeroSection>
      
      <QuickActions>
        <ActionCard href="/studio/avatar">
          <Icon name="user-plus" />
          <h3>Create Avatar</h3>
          <p>Design your digital identity</p>
        </ActionCard>
        
        <ActionCard href="/studio/cards">
          <Icon name="id-card" />
          <h3>Player Cards</h3>
          <p>View AIR card gallery</p>
        </ActionCard>
        
        <ActionCard href="/studio/story">
          <Icon name="book" />
          <h3>Story Highlights</h3>
          <p>Showcase your journey</p>
        </ActionCard>
      </QuickActions>
      
      <IntegrationSection>
        <h2>Connect Your Data</h2>
        <ConnectionCard type="ntnt">
          <p>Link NTNT scores for performance overlays</p>
        </ConnectionCard>
        <ConnectionCard type="biz">
          <p>Connect Biz profile for founder avatars</p>
        </ConnectionCard>
      </IntegrationSection>
    </PageLayout>
  );
}
```

**Avatar Builder (Phase 2):**

```typescript
// app/studio/avatar/page.tsx

export default function AvatarBuilder() {
  const [avatar, setAvatar] = useState<Avatar>({
    base: 'athletic', // or 'founder', 'creator'
    style: 'realistic', // or 'illustrated', 'minimal'
    colors: { primary: '#FF6B35', secondary: '#004E89' },
    pose: 'standing',
    accessories: [],
    background: 'gradient'
  });

  const generateAIRCard = async () => {
    const response = await fetch('/api/studio/generate-card', {
      method: 'POST',
      body: JSON.stringify({ avatar, userId })
    });
    
    const { cardUrl } = await response.json();
    return cardUrl;
  };

  return (
    <BuilderLayout>
      <EditorPanel>
        <AvatarPreview avatar={avatar} />
        <StyleControls
          avatar={avatar}
          onChange={setAvatar}
        />
      </EditorPanel>
      
      <OptionsPanel>
        <TabGroup>
          <Tab name="Base">
            <BaseSelector value={avatar.base} onChange={(base) => setAvatar({...avatar, base})} />
          </Tab>
          <Tab name="Style">
            <StyleSelector value={avatar.style} onChange={(style) => setAvatar({...avatar, style})} />
          </Tab>
          <Tab name="Colors">
            <ColorPicker colors={avatar.colors} onChange={(colors) => setAvatar({...avatar, colors})} />
          </Tab>
        </TabGroup>
      </OptionsPanel>
      
      <ActionBar>
        <button onClick={saveAvatar}>Save Avatar</button>
        <button onClick={generateAIRCard}>Generate AIR Card</button>
      </ActionBar>
    </BuilderLayout>
  );
}
```

**Database Schema (Studio):**

```sql
CREATE TABLE avatars (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  avatar_config JSONB, -- Full avatar configuration
  air_card_url TEXT,   -- Generated card image
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE air_cards (
  id UUID PRIMARY KEY,
  avatar_id UUID REFERENCES avatars(id),
  template TEXT, -- 'athlete', 'founder', 'creator'
  overlay_data JSONB, -- NTNT scores, biz metrics, etc.
  card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Studio Products:**

| Product | Price | Billing | Includes |
|---------|-------|---------|----------|
| **Avatar Basic** | $9 | One-time | 1 avatar + basic customization |
| **Avatar Pro** | $19 | Monthly | Unlimited avatars + advanced features |
| **Card Prints** | $29 | One-time | Physical AIR card prints (10 pack) |
| **Studio Bundle** | $39 | Monthly | Everything + priority support |

### Pillar 4: S.A.F.E

**Simple Page (Phase 1):**

```typescript
// app/safe/page.tsx

export default function SAFEPage() {
  return (
    <PageLayout>
      <HeroSection className="safe-hero">
        <h1>S.A.F.E</h1>
        <h2>SKRBL AI Foundation of Excellence</h2>
        <p>Empowering K-2 and Special Education students with intentional learning</p>
      </HeroSection>
      
      <MissionSection>
        <h3>Our Mission</h3>
        <p>
          S.A.F.E provides free and low-cost tools for K-2 and Special Education 
          students, focusing on intentional learning, tech literacy, and healthy minds.
        </p>
      </MissionSection>
      
      <ProgramsSection>
        <ProgramCard type="k2">
          <h4>K-2 Intentional Learning</h4>
          <ul>
            <li>Interactive NTNT Jr tools</li>
            <li>Digital literacy games</li>
            <li>Growth mindset activities</li>
          </ul>
        </ProgramCard>
        
        <ProgramCard type="special-ed">
          <h4>Special Education Support</h4>
          <ul>
            <li>Adaptive learning tools</li>
            <li>Sensory-friendly interfaces</li>
            <li>Parent/teacher resources</li>
          </ul>
        </ProgramCard>
      </ProgramsSection>
      
      <ImpactSection>
        <h3>Our Impact</h3>
        <MetricCard>
          <h4>0</h4> {/* Will update as program launches */}
          <p>Students served</p>
        </MetricCard>
        <MetricCard>
          <h4>0</h4>
          <p>Schools partnered</p>
        </MetricCard>
      </ImpactSection>
      
      <CTASection>
        <h3>Get Involved</h3>
        <button onClick={() => router.push('/safe/enroll')}>
          Enroll Your Student
        </button>
        <button onClick={() => router.push('/safe/partner')}>
          Partner With Us
        </button>
      </CTASection>
    </PageLayout>
  );
}
```

---

## ⚙️ INFRASTRUCTURE & STANDARDS

### Feature Flags (Final 4)

**Core Flags (Must Have):**

```typescript
// lib/config/featureFlags.ts (updated)

export const FEATURE_FLAGS = {
  // === THE CORE 4 ===
  FF_BOOST: readBooleanFlag('FF_BOOST', false), 
  // Controls: Use Supabase Boost everywhere for data
  
  FF_CLERK: readBooleanFlag('FF_CLERK', false),
  // Controls: Use Clerk as primary auth layer
  
  FF_SITE_VERSION: process.env.FF_SITE_VERSION || 'legacy',
  // Controls: 'legacy' or 'new' (/ routes to /legacy or /new)
  
  FF_N8N_NOOP: readBooleanFlag('FF_N8N_NOOP', true),
  // Controls: Whether automations call n8n or just log
  
  // === LEGACY (Keep for backward compat, deprecate later) ===
  ENABLE_STRIPE: readBooleanFlag('NEXT_PUBLIC_ENABLE_STRIPE', true),
  // ... other legacy flags
} as const;
```

**Middleware Enhancement:**

```typescript
// middleware.ts (updated)

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 1. Site version routing
  if (path === '/') {
    const siteVersion = process.env.FF_SITE_VERSION || 'legacy';
    
    if (siteVersion === 'new') {
      return NextResponse.redirect(new URL('/new', request.url));
    } else {
      return NextResponse.redirect(new URL('/legacy', request.url));
    }
  }
  
  // 2. Auth routing (if Clerk enabled)
  const clerkEnabled = process.env.FF_CLERK === '1';
  if (clerkEnabled) {
    // Use Clerk middleware for protected routes
    // ... existing auth logic
  }
  
  // 3. Existing logic (canonicalization, etc.)
  // ... existing middleware logic
  
  return NextResponse.next();
}
```

### Environment Variables (2.0 Standard)

**Required Variables:**

```bash
# === CORE FLAGS ===
FF_BOOST=1                      # Use Boost Supabase
FF_CLERK=1                      # Use Clerk auth
FF_SITE_VERSION=new             # Route / to /new
FF_N8N_NOOP=1                   # n8n mode

# === SUPABASE BOOST ===
NEXT_PUBLIC_SUPABASE_URL_BOOST=https://your-boost-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST=eyJ...
SUPABASE_SERVICE_ROLE_KEY_BOOST=eyJ...

# === CLERK ===
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# === STRIPE ===
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# === PRICING (Single source of truth) ===
NEXT_PUBLIC_PRICE_MAP_JSON='{
  "plans": {
    "rookie": {"monthly": "price_1234", "annual": "price_5678"},
    "pro": {"monthly": "price_9012", "annual": "price_3456"},
    "all_star": {"monthly": "price_7890", "annual": "price_1234"}
  },
  "ntnt": {
    "jr_pack": "price_5678",
    "mstry_pack": "price_9012",
    "team_tier": "price_3456"
  },
  "studio": {
    "avatar_basic": "price_7890",
    "avatar_pro": "price_1234",
    "card_prints": "price_5678"
  }
}'

# === OPTIONAL ===
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
```

**Preflight Validation (Enhanced):**

```javascript
// scripts/validate-env.mjs (updated)

const REQUIRED_ENV_VARS = [
  // Core flags
  'FF_BOOST',
  'FF_CLERK',
  'FF_SITE_VERSION',
  'FF_N8N_NOOP',
  
  // Pricing
  'NEXT_PUBLIC_PRICE_MAP_JSON',
  
  // Supabase Boost
  'NEXT_PUBLIC_SUPABASE_URL_BOOST',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST',
  'SUPABASE_SERVICE_ROLE_KEY_BOOST',
  
  // Clerk
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  
  // Stripe
  'STRIPE_SECRET_KEY',
];

// Additional validation:
// 1. Verify NEXT_PUBLIC_PRICE_MAP_JSON is valid JSON
// 2. Verify all required price IDs exist in price map
// 3. Verify Supabase URL is reachable
// 4. Verify Clerk keys are valid format
```

### Unified Dashboard

**Route:** `/udash`

**Purpose:** Single dashboard that shows all user activity across Biz, NTNT, and Studio.

```typescript
// app/udash/page.tsx

export default async function UnifiedDashboard() {
  const user = await requireUser(); // Clerk + Boost
  
  // Fetch data from all verticals
  const [bizData, ntntData, studioData] = await Promise.all([
    getUserBizData(user.id),
    getUserNTNTData(user.id),
    getUserStudioData(user.id)
  ]);
  
  return (
    <DashboardLayout user={user}>
      <OverviewSection>
        <WelcomeCard user={user} />
        <QuickStats
          scansThisMonth={bizData.scansThisMonth}
          uploadsThisMonth={ntntData.uploadsThisMonth}
          avatarsCreated={studioData.avatarCount}
        />
      </OverviewSection>
      
      <VerticalSection title="Business">
        <RecentScans scans={bizData.recentScans} />
        <ActiveProjects projects={bizData.projects} />
      </VerticalSection>
      
      <VerticalSection title="NTNT × MSTRY">
        <LatestNTNTScore score={ntntData.latestScore} />
        <RecentAnalyses analyses={ntntData.recentAnalyses} />
      </VerticalSection>
      
      <VerticalSection title="Studio / AIR">
        <AvatarGallery avatars={studioData.avatars} />
        <RecentCards cards={studioData.recentCards} />
      </VerticalSection>
      
      <RecommendationsSection>
        <h3>Recommended Actions</h3>
        {generateRecommendations(bizData, ntntData, studioData).map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </RecommendationsSection>
    </DashboardLayout>
  );
}
```

---

## 📅 PHASE-BY-PHASE IMPLEMENTATION

### Phase 0: Pre-Flight (Week 0)

**Goal:** Ensure environment is stable and ready for 2.0 work.

**Tasks:**

1. ✅ **Backup Everything**
   - Create git branch: `feature/skrbl-ai-2.0`
   - Tag current main: `v1.0-pre-2.0`
   - Backup Supabase databases (legacy + boost)
   - Document current env vars

2. ✅ **Verify Core Systems**
   - Run `npm run preflight` (should pass)
   - Verify Boost Supabase is accessible
   - Verify Clerk test environment works
   - Test Stripe test mode checkout

3. ✅ **Set Up 2.0 Environment**
   - Create `.env.2.0` with all required vars
   - Create Stripe test products for 2.0 SKUs
   - Set up Boost Supabase tables (use migrations)
   - Configure Clerk application settings

**Acceptance Criteria:**
- [ ] All preflight checks pass
- [ ] 2.0 environment file is complete
- [ ] Boost Supabase tables created
- [ ] Stripe test products exist

---

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Core infrastructure for 2.0 - auth, flags, routing split.

#### Week 1: Auth Consolidation

**Tasks:**

1. **Clerk Integration (Primary Auth)**
   ```bash
   # File changes:
   - middleware.ts (add Clerk middleware)
   - app/layout.tsx (ensure ClerkProvider is active when FF_CLERK=1)
   - lib/auth/requireUser.ts (create Clerk version)
   ```

2. **Boost Supabase Migration**
   ```bash
   # Create migrations:
   - migrations/001_create_profiles.sql
   - migrations/002_create_ntnt_tables.sql
   - migrations/003_create_studio_tables.sql
   
   # Run migrations:
   npx supabase db push
   ```

3. **Auth Testing**
   - Sign up flow (Clerk → Boost profile creation)
   - Sign in flow (Clerk → Boost data fetch)
   - Protected routes (middleware enforcement)

**Deliverables:**
- [ ] Clerk is primary auth (FF_CLERK=1 works)
- [ ] Boost Supabase stores all user data
- [ ] Sign up/in flows work end-to-end
- [ ] Middleware protects routes correctly

#### Week 2: Feature Flags & Routing

**Tasks:**

1. **FF_SITE_VERSION Implementation**
   ```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     if (request.nextUrl.pathname === '/') {
       const version = process.env.FF_SITE_VERSION || 'legacy';
       const targetPath = version === 'new' ? '/new' : '/legacy';
       return NextResponse.redirect(new URL(targetPath, request.url));
     }
     // ... rest of middleware
   }
   ```

2. **Create /legacy Route**
   ```bash
   mkdir -p app/legacy
   cp app/page.tsx app/legacy/page.tsx
   cp app/layout.tsx app/legacy/layout.tsx
   # Copy all homepage components to legacy/
   ```

3. **Create /new Shell**
   ```bash
   mkdir -p app/new
   # Create new page.tsx with Percy Intake v2 placeholder
   ```

4. **Price Map Migration**
   ```bash
   # Update all pricing components to use getPriceId()
   - components/pricing/PricingCard.tsx
   - components/pricing/BuyButton.tsx
   - app/checkout/page.tsx
   ```

**Deliverables:**
- [ ] FF_SITE_VERSION works (/ routes correctly)
- [ ] /legacy is stable (exact copy of current)
- [ ] /new exists (basic shell)
- [ ] All pricing uses NEXT_PUBLIC_PRICE_MAP_JSON

---

### Phase 2: Biz 2.0 MVP (Weeks 3-4)

**Goal:** Build /new experience with Percy Intake v2 and Agent League 2.0.

#### Week 3: Percy Intake v2

**Tasks:**

1. **Universal Prompt Bar (Enhanced)**
   ```typescript
   // components/home/UniversalPromptBar.tsx
   export default function UniversalPromptBar({ onSubmit }) {
     const [input, setInput] = useState('');
     const [scanning, setScanning] = useState(false);
     
     const handleSubmit = async () => {
       setScanning(true);
       const result = await fetch('/api/percy/scan', {
         method: 'POST',
         body: JSON.stringify({ query: input })
       }).then(r => r.json());
       
       onSubmit(result);
       setScanning(false);
     };
     
     return (
       <PromptBarUI
         value={input}
         onChange={setInput}
         onSubmit={handleSubmit}
         scanning={scanning}
       />
     );
   }
   ```

2. **Percy Scan API**
   ```typescript
   // app/api/percy/scan/route.ts
   export async function POST(request: Request) {
     const { query, url } = await request.json();
     
     // Analyze query to determine intent
     const intent = await analyzeIntent(query);
     
     // If URL provided, scan it
     let scanData = null;
     if (url) {
       scanData = await performURLScan(url);
     }
     
     // Recommend agents and plan
     const recommendations = await generateRecommendations(intent, scanData);
     
     return Response.json({
       intent,
       scanData,
       recommendations: {
         agents: recommendations.agents,
         plan: recommendations.plan,
         vertical: recommendations.vertical // 'biz', 'ntnt', 'studio'
       }
     });
   }
   ```

3. **Results Panel**
   ```typescript
   // components/home/PercyResultsPanel.tsx
   export default function PercyResultsPanel({ results }) {
     return (
       <div className="results-panel">
         <GapAnalysis gaps={results.scanData?.gaps} />
         
         <RecommendedAgents>
           {results.recommendations.agents.map(agent => (
             <AgentCard key={agent.id} agent={agent} />
           ))}
         </RecommendedAgents>
         
         <RecommendedPlan plan={results.recommendations.plan} />
         
         <AlternativeVerticals>
           {results.recommendations.vertical !== 'ntnt' && (
             <button onClick={() => router.push('/ntnt')}>
               Or explore NTNT × MSTRY →
             </button>
           )}
         </AlternativeVerticals>
       </div>
     );
   }
   ```

**Deliverables:**
- [ ] Percy Intake v2 works on /new
- [ ] Scan API returns recommendations
- [ ] Results panel shows agents and plans

#### Week 4: Agent League 2.0

**Tasks:**

1. **Categorize Agents**
   ```typescript
   // ai-agents/index.ts (update)
   export const agents: Agent[] = [
     {
       id: 'percy',
       category: 'biz',
       tags: ['assistant', 'strategist'],
       badge: 'pro'
     },
     {
       id: 'skillsmith',
       category: 'ntnt',
       tags: ['sports', 'training'],
       badge: 'pro'
     },
     // ... categorize all 16+ agents
   ];
   ```

2. **Video Game Card UI**
   ```typescript
   // components/agents/AgentCardV2.tsx
   export default function AgentCardV2({ agent }) {
     const [slide, setSlide] = useState<'art' | 'spec' | 'cta'>('art');
     
     return (
       <Card className="agent-card-v2">
         {slide === 'art' && (
           <AgentArtSlide agent={agent} onNext={() => setSlide('spec')} />
         )}
         {slide === 'spec' && (
           <SpecializationSlide agent={agent} onNext={() => setSlide('cta')} />
         )}
         {slide === 'cta' && (
           <CTASlide 
             agent={agent} 
             onSelect={() => handleAgentSelect(agent)}
           />
         )}
       </Card>
     );
   }
   ```

3. **Agent Detail Panel**
   ```typescript
   // components/agents/AgentDetailPanel.tsx
   export default function AgentDetailPanel({ agent }) {
     return (
       <SidePanel>
         <AgentHeader agent={agent} />
         
         <WhatTheyDo>
           {agent.description}
         </WhatTheyDo>
         
         <ProblemsTheySolve>
           {agent.solves.map(problem => (
             <ProblemCard key={problem.id} problem={problem} />
           ))}
         </ProblemsTheySolve>
         
         <RecommendedUse>
           <UsageExample vertical="biz" />
           {agent.category === 'hybrid' && (
             <UsageExample vertical="ntnt" />
           )}
         </RecommendedUse>
         
         <CTAButton agent={agent} />
       </SidePanel>
     );
   }
   ```

**Deliverables:**
- [ ] All agents categorized (biz/ntnt/studio/hybrid)
- [ ] Agent cards use video game UI
- [ ] Agent detail panel shows full info
- [ ] "Try this agent" entrypoint works

---

### Phase 3: NTNT × MSTRY (Weeks 5-6)

**Goal:** Build /ntnt vertical with intake, upload, and results.

#### Week 5: NTNT Intake & Core

**Tasks:**

1. **NTNT Hub Page**
   ```bash
   mkdir -p app/ntnt
   touch app/ntnt/page.tsx
   touch app/ntnt/layout.tsx
   ```

2. **NTNT Quick Intake**
   ```typescript
   // app/ntnt/intake/page.tsx
   const NTNT_QUESTIONS = [
     // 25 questions across 4 categories
     { id: 1, category: 'mental', text: '...' },
     // ...
   ];
   
   export default function NTNTIntakePage() {
     return (
       <IntakeFlow
         questions={NTNT_QUESTIONS}
         onComplete={async (responses) => {
           const tier = calculateNTNTTier(responses);
           await saveNTNTScore(user.id, tier, responses);
           router.push('/ntnt/results');
         }}
       />
     );
   }
   ```

3. **NTNT Results Page**
   ```typescript
   // app/ntnt/results/page.tsx
   export default async function NTNTResultsPage() {
     const score = await getLatestNTNTScore(user.id);
     
     return (
       <ResultsLayout>
         <NTNTBadge tier={score.tier} score={score.score} />
         <CoachingNotes notes={score.coachingNotes} />
         <RecommendedBundle bundle={getRecommendedBundle(score.tier)} />
         <NextSteps actions={generateNextSteps(score)} />
       </ResultsLayout>
     );
   }
   ```

**Deliverables:**
- [ ] /ntnt hub page exists
- [ ] NTNT intake (25Q) works
- [ ] Results page shows tier and score
- [ ] Database stores NTNT data

#### Week 6: SkillSmith Video Analysis

**Tasks:**

1. **Video Upload Flow**
   ```typescript
   // app/ntnt/upload/page.tsx
   export default function SkillSmithUploadPage() {
     const handleUpload = async (file: File, metadata: VideoMetadata) => {
       // Upload to Supabase Storage
       const videoPath = await uploadVideoToSupabase(file);
       
       // Create analysis job
       const job = await createAnalysisJob(user.id, videoPath, metadata);
       
       // Trigger analysis (if not in NOOP mode)
       if (process.env.FF_N8N_NOOP !== '1') {
         await triggerSkillSmithAnalysis(job.id);
       } else {
         // Mock analysis for now
         await mockAnalysisCompletion(job.id);
       }
       
       router.push(`/ntnt/results/${job.id}`);
     };
     
     return <VideoUploadUI onUpload={handleUpload} />;
   }
   ```

2. **Analysis Results**
   ```typescript
   // app/ntnt/results/[id]/page.tsx
   export default async function AnalysisResultsPage({ params }) {
     const analysis = await getVideoAnalysis(params.id);
     
     if (analysis.status === 'pending' || analysis.status === 'processing') {
       return <ProcessingState jobId={params.id} />;
     }
     
     return (
       <ResultsLayout>
         <VideoPlayer url={analysis.video_url} />
         <AnalysisSummary result={analysis.result} />
         <QuickWins wins={analysis.result.quickWins} />
         <UpgradePrompt />
       </ResultsLayout>
     );
   }
   ```

3. **Parent Portal (Basic)**
   ```typescript
   // app/ntnt/parent/page.tsx
   export default async function ParentPortalPage() {
     const children = await getParentChildren(user.id);
     
     return (
       <PortalLayout>
         {children.map(child => (
           <ChildDashboard
             key={child.id}
             child={child}
             ntntScores={child.ntntScores}
             analyses={child.videoAnalyses}
           />
         ))}
       </PortalLayout>
     );
   }
   ```

**Deliverables:**
- [ ] Video upload to Supabase works
- [ ] Analysis job creation works
- [ ] Results page shows analysis (mock OK)
- [ ] Parent portal shows basic info

---

### Phase 4: Studio/AIR + S.A.F.E (Weeks 7-8)

**Goal:** Create Studio hub and S.A.F.E page (can be basic).

#### Week 7: Studio Hub

**Tasks:**

1. **Studio Hub Page**
   ```bash
   mkdir -p app/studio
   touch app/studio/page.tsx
   ```

2. **Avatar Placeholder**
   ```typescript
   // app/studio/avatar/page.tsx
   export default function AvatarBuilderPage() {
     return (
       <PageLayout>
         <h1>Avatar Builder</h1>
         <p>Coming soon - Create your AIR Avatar</p>
         <WaitlistForm />
       </PageLayout>
     );
   }
   ```

3. **AIR Card Gallery**
   ```typescript
   // app/studio/cards/page.tsx
   export default async function AIRCardGalleryPage() {
     const exampleCards = [
       { id: 1, name: 'Gabe\'s AIR Card', imageUrl: '/images/gabe-air-card.png' },
       // ... more examples
     ];
     
     return (
       <GalleryLayout>
         {exampleCards.map(card => (
           <CardPreview key={card.id} card={card} />
         ))}
       </GalleryLayout>
     );
   }
   ```

**Deliverables:**
- [ ] /studio hub exists
- [ ] Avatar builder page (placeholder OK)
- [ ] AIR card gallery (example cards OK)

#### Week 8: S.A.F.E Page

**Tasks:**

1. **S.A.F.E Page**
   ```bash
   mkdir -p app/safe
   touch app/safe/page.tsx
   ```

2. **Content**
   ```typescript
   // app/safe/page.tsx
   export default function SAFEPage() {
     return (
       <PageLayout>
         <Hero>
           <h1>S.A.F.E</h1>
           <h2>SKRBL AI Foundation of Excellence</h2>
         </Hero>
         
         <Mission />
         <Programs />
         <ImpactMetrics />
         <GetInvolved />
       </PageLayout>
     );
   }
   ```

**Deliverables:**
- [ ] /safe page exists
- [ ] Content describes K-2 and Special Ed programs
- [ ] "Get Involved" CTAs present

---

### Phase 5: Integration & Polish (Weeks 9-10)

**Goal:** Connect all verticals, polish UX, ensure consistency.

#### Week 9: Cross-Vertical Features

**Tasks:**

1. **Unified Dashboard**
   ```typescript
   // app/udash/page.tsx (full implementation)
   // Shows data from all three verticals
   ```

2. **Navigation Enhancement**
   ```typescript
   // components/layout/Navigation.tsx
   export default function Navigation() {
     return (
       <nav>
         <NavLink href="/new">Business</NavLink>
         <NavLink href="/ntnt">NTNT × MSTRY</NavLink>
         <NavLink href="/studio">Studio</NavLink>
         <NavLink href="/safe">S.A.F.E</NavLink>
       </nav>
     );
   }
   ```

3. **Cross-Vertical Recommendations**
   ```typescript
   // lib/recommendations/crossVertical.ts
   export function generateCrossVerticalRecommendations(userData) {
     const recommendations = [];
     
     // If user has NTNT data, suggest Studio avatar
     if (userData.ntnt?.latestScore) {
       recommendations.push({
         type: 'studio',
         reason: 'Create an AIR card with your NTNT score'
       });
     }
     
     // If user has Biz projects, suggest NTNT for founder mindset
     if (userData.biz?.projects.length > 0) {
       recommendations.push({
         type: 'ntnt',
         reason: 'Train your founder mindset like an athlete'
       });
     }
     
     return recommendations;
   }
   ```

**Deliverables:**
- [ ] Unified dashboard shows all verticals
- [ ] Navigation links all areas
- [ ] Cross-vertical recommendations work

#### Week 10: UX Polish

**Tasks:**

1. **Responsive Design Audit**
   - Test all new pages on mobile/tablet/desktop
   - Fix any layout issues
   - Ensure touch targets are adequate

2. **Loading States**
   - Add skeleton loaders for all async content
   - Implement optimistic UI updates
   - Add error boundaries

3. **Consistency Pass**
   - Ensure all buttons use same styles
   - Verify color palette consistency
   - Check typography hierarchy

**Deliverables:**
- [ ] All pages responsive
- [ ] Loading states present
- [ ] UI consistency verified

---

### Phase 6: Launch Prep (Weeks 11-12)

**Goal:** Test everything, document, prepare for cutover.

#### Week 11: Testing & QA

**Tasks:**

1. **E2E Testing**
   ```bash
   # Test scenarios:
   - New user sign up → Percy intake → checkout
   - NTNT intake → video upload → results
   - Studio avatar creation (when ready)
   - Cross-vertical navigation
   ```

2. **Load Testing**
   ```bash
   # Test with realistic data volumes
   - 100 concurrent users
   - 50 video uploads per hour
   - Database query performance
   ```

3. **Security Audit**
   ```bash
   # Verify:
   - Clerk auth is enforced
   - RLS policies work (Supabase)
   - API endpoints are protected
   - Environment variables secure
   ```

**Deliverables:**
- [ ] All E2E tests pass
- [ ] Load testing shows acceptable performance
- [ ] Security audit complete

#### Week 12: Documentation & Cutover

**Tasks:**

1. **Documentation**
   ```bash
   # Create docs:
   - docs/2.0/USER_GUIDE.md
   - docs/2.0/ADMIN_GUIDE.md
   - docs/2.0/TROUBLESHOOTING.md
   - docs/2.0/API_REFERENCE.md
   ```

2. **Cutover Plan**
   ```bash
   # Prepare:
   - Migration checklist
   - Rollback procedure
   - Communication plan
   - Monitoring dashboard
   ```

3. **Soft Launch**
   ```bash
   # Steps:
   1. Deploy to staging
   2. Invite beta users (10-20)
   3. Collect feedback
   4. Fix critical issues
   5. Deploy to production (FF_SITE_VERSION=legacy still)
   6. Gradually flip FF_SITE_VERSION=new for cohorts
   ```

**Deliverables:**
- [ ] All documentation complete
- [ ] Cutover plan finalized
- [ ] Soft launch successful
- [ ] Production deployment ready

---

## 🗓️ CRITICAL PATH & TIMELINE

### High-Level Timeline

```
┌─────────────────────────────────────────────────────────────┐
│  SKRBL AI 2.0 - 12 Week Implementation Timeline             │
└─────────────────────────────────────────────────────────────┘

Week 0:  [Pre-Flight]
         ├─ Backup & branch
         ├─ Verify systems
         └─ Set up 2.0 env

Weeks 1-2: [Phase 1: Foundation]
         ├─ Auth consolidation (Clerk + Boost)
         ├─ Feature flags (FF_SITE_VERSION)
         ├─ Routing split (/legacy, /new)
         └─ Price map migration

Weeks 3-4: [Phase 2: Biz 2.0 MVP]
         ├─ Percy Intake v2
         ├─ Agent League 2.0
         └─ New pricing pages

Weeks 5-6: [Phase 3: NTNT × MSTRY]
         ├─ NTNT intake (25Q)
         ├─ SkillSmith video upload
         ├─ Results & parent portal
         └─ NTNT pricing

Weeks 7-8: [Phase 4: Studio/AIR + S.A.F.E]
         ├─ Studio hub
         ├─ Avatar builder (placeholder)
         ├─ AIR card gallery
         └─ S.A.F.E page

Weeks 9-10: [Phase 5: Integration & Polish]
         ├─ Unified dashboard
         ├─ Cross-vertical features
         ├─ UX polish
         └─ Responsive design

Weeks 11-12: [Phase 6: Launch Prep]
         ├─ E2E testing
         ├─ Load testing
         ├─ Documentation
         ├─ Soft launch
         └─ Production cutover

         🚀 LAUNCH 🚀
```

### Critical Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│  What Blocks What                                           │
└─────────────────────────────────────────────────────────────┘

Auth Consolidation (Week 1)
  ↓
  ├─→ All protected routes (Weeks 2+)
  ├─→ Unified dashboard (Week 9)
  └─→ User data storage (all phases)

Routing Split (Week 2)
  ↓
  ├─→ /new development (Weeks 3+)
  ├─→ Percy Intake v2 (Week 3)
  └─→ All new verticals (Weeks 5+)

Price Map Migration (Week 2)
  ↓
  ├─→ New pricing pages (Week 4)
  ├─→ NTNT pricing (Week 6)
  └─→ Studio pricing (Week 8)

Percy Intake v2 (Week 3)
  ↓
  └─→ Cross-vertical recommendations (Week 9)

NTNT Intake (Week 5)
  ↓
  └─→ Studio AIR card overlays (Week 8)
```

### Risk Mitigation

**High-Risk Items:**

1. **Auth Migration (Week 1)**
   - **Risk:** Breaking existing user sessions
   - **Mitigation:** 
     - Keep legacy auth running in parallel initially
     - Create migration script for user data
     - Test extensively in staging
     - Gradual rollout with feature flag

2. **Price Map Migration (Week 2)**
   - **Risk:** Breaking existing checkout flows
   - **Mitigation:**
     - Keep old price env vars as fallback initially
     - Extensive checkout testing
     - Monitor Stripe webhooks closely
     - Have rollback plan ready

3. **n8n Dependency (Ongoing)**
   - **Risk:** n8n downtime blocks user flows
   - **Mitigation:**
     - FF_N8N_NOOP=1 by default (already planned)
     - Mock responses for testing
     - Queue-based processing (future enhancement)
     - Clear user messaging when in NOOP mode

4. **Database Performance (Week 11)**
   - **Risk:** Slow queries under load
   - **Mitigation:**
     - Proper indexing (plan in migrations)
     - Connection pooling configured
     - Load testing before launch
     - Query optimization budget

---

## 📈 SUCCESS METRICS

### Technical Metrics

**Infrastructure Health:**
- [ ] All 4 core feature flags working (FF_BOOST, FF_CLERK, FF_SITE_VERSION, FF_N8N_NOOP)
- [ ] 100% of pricing uses NEXT_PUBLIC_PRICE_MAP_JSON (0 hardcoded price IDs)
- [ ] Auth consolidation: 100% Clerk + Boost (0% legacy Supabase)
- [ ] Build time: < 3 minutes
- [ ] Page load time: < 2 seconds (p95)
- [ ] Lighthouse score: > 90 (mobile + desktop)

**User Experience:**
- [ ] Percy Intake v2: < 30 seconds to get recommendations
- [ ] NTNT intake: < 5 minutes to complete
- [ ] Video upload: < 2 minutes to process (or clear queue status)
- [ ] Checkout: < 3 clicks from product → success

### Business Metrics (Post-Launch)

**Conversion Funnels:**
- Homepage → Percy Intake → Agent Selection → Checkout
  - Target: > 5% conversion
  
- NTNT Landing → Intake → Results → Upgrade
  - Target: > 10% conversion
  
- Studio Landing → Avatar Creation → Paid Feature
  - Target: > 3% conversion

**Engagement:**
- DAU (Daily Active Users) - Target: +50% over 3 months
- WAU (Weekly Active Users) - Target: +40% over 3 months
- Session duration - Target: +30% over baseline

**Revenue:**
- MRR (Monthly Recurring Revenue) - Target: +100% over 6 months
- ARPU (Average Revenue Per User) - Target: +25% over 6 months
- Churn rate - Target: < 5% monthly

---

## 🎯 NEXT STEPS: START HERE

### Immediate Actions (This Week)

1. **Review & Approve This Plan**
   - Read through entire document
   - Identify any missing pieces
   - Adjust timeline if needed (12 weeks aggressive, 16 sustainable)

2. **Set Up Project Management**
   - Create GitHub project board (or your preferred tool)
   - Break phases into issues/tickets
   - Assign tasks (if team, otherwise prioritize)

3. **Pre-Flight Checklist**
   - [ ] Create `feature/skrbl-ai-2.0` branch
   - [ ] Tag current main as `v1.0-pre-2.0`
   - [ ] Back up Supabase databases
   - [ ] Create `.env.2.0` file with all required vars
   - [ ] Run existing preflight checks (`npm run preflight`)

4. **Kick Off Phase 1**
   - Start Week 1 tasks (Auth consolidation)
   - Set up daily standups (even solo - track progress)
   - Begin migration of first Clerk integration

### Weekly Check-Ins

**Every Monday:**
- Review last week's deliverables
- Check if phase is on track
- Adjust timeline if blocked
- Plan current week's tasks

**Every Friday:**
- Demo completed features (even to yourself)
- Update this document if plans change
- Commit all code with clear messages
- Push to remote for safety

### Communication Plan

**For Investors/Stakeholders:**
- **Week 0:** Share this plan, set expectations
- **Week 4:** Demo Percy Intake v2 + Agent League 2.0
- **Week 8:** Demo all three verticals (even if basic)
- **Week 12:** Soft launch invite
- **Week 13+:** Production rollout + metrics

**For Users (When Ready):**
- **Soft Launch Email:** "You're invited to try SKRBL AI 2.0 early"
- **Migration Guide:** "What's new and how to find your features"
- **Support:** Dedicated 2.0 support channel during rollout

---

## 📚 APPENDIX

### File Structure (Complete)

```
/workspace/
├── app/
│   ├── (auth)/                    # Auth routes (Clerk)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── legacy/                    # ⭐ Legacy experience
│   │   ├── page.tsx
│   │   └── ... (copy of current structure)
│   ├── new/                       # ⭐ 2.0 Biz experience
│   │   ├── page.tsx               # Percy Intake v2
│   │   ├── agents/                # Agent League 2.0
│   │   ├── pricing/               # New pricing
│   │   └── checkout/
│   ├── ntnt/                      # ⭐ NTNT × MSTRY vertical
│   │   ├── page.tsx               # NTNT Hub
│   │   ├── intake/                # NTNT intake (25Q)
│   │   ├── upload/                # Video upload
│   │   ├── results/               # Results + analysis
│   │   ├── parent/                # Parent portal
│   │   └── coach/                 # Coach portal (future)
│   ├── studio/                    # ⭐ Studio / AIR vertical
│   │   ├── page.tsx               # Studio Hub
│   │   ├── avatar/                # Avatar builder
│   │   ├── cards/                 # AIR card gallery
│   │   └── story/                 # Story highlights
│   ├── safe/                      # ⭐ S.A.F.E page
│   │   ├── page.tsx
│   │   ├── programs/
│   │   └── impact/
│   ├── udash/                     # ⭐ Unified dashboard
│   │   ├── page.tsx               # Overview
│   │   ├── biz/                   # Biz projects
│   │   ├── ntnt/                  # NTNT data
│   │   └── studio/                # Studio projects
│   ├── api/
│   │   ├── percy/scan/            # Percy Intake v2 API
│   │   ├── ntnt/intake/           # NTNT intake API
│   │   ├── skillsmith/analyze/    # Video analysis API
│   │   ├── studio/avatar/         # Avatar creation API
│   │   └── checkout/              # Unified checkout API
│   └── layout.tsx                 # Root layout (ClerkProvider when FF_CLERK=1)
│
├── lib/
│   ├── config/
│   │   ├── featureFlags.ts        # ⭐ Updated with 4 core flags
│   │   └── flags.ts
│   ├── auth/
│   │   ├── requireUser.ts         # ⭐ Clerk + Boost version
│   │   └── roles.ts
│   ├── pricing/
│   │   ├── priceMap.ts            # ⭐ New price map helper
│   │   ├── catalog.ts             # Updated catalog
│   │   └── sportsPricing.ts
│   ├── supabase/
│   │   └── server.ts              # ⭐ Boost as default (FF_BOOST=1)
│   ├── recommendations/
│   │   └── crossVertical.ts       # ⭐ New cross-vertical recs
│   └── ntnt/
│       ├── scoring.ts             # ⭐ New NTNT scoring logic
│       └── tiers.ts               # ⭐ New tier definitions
│
├── components/
│   ├── home/
│   │   ├── PercyIntakeV2.tsx      # ⭐ New Percy Intake
│   │   ├── UniversalPromptBar.tsx # Enhanced prompt bar
│   │   └── PercyResultsPanel.tsx  # ⭐ New results panel
│   ├── agents/
│   │   ├── AgentCardV2.tsx        # ⭐ Video game card UI
│   │   └── AgentDetailPanel.tsx   # ⭐ New detail panel
│   ├── ntnt/
│   │   ├── NTNTIntakeFlow.tsx     # ⭐ New intake component
│   │   ├── VideoUploadFlow.tsx    # Enhanced upload
│   │   └── AnalysisResults.tsx    # Results display
│   ├── studio/
│   │   ├── AvatarBuilder.tsx      # ⭐ New avatar builder
│   │   └── AIRCardGallery.tsx     # ⭐ New card gallery
│   └── layout/
│       ├── Navigation.tsx         # ⭐ Updated with all verticals
│       └── UnifiedDashboard.tsx   # ⭐ New dashboard layout
│
├── migrations/
│   ├── 001_create_profiles.sql    # ⭐ New migration
│   ├── 002_create_ntnt_tables.sql # ⭐ New migration
│   └── 003_create_studio_tables.sql # ⭐ New migration
│
├── scripts/
│   ├── preflight.mjs              # Enhanced for 2.0
│   ├── validate-env.mjs           # ⭐ Updated with 4 core flags
│   └── validate-pricing.mjs       # ⭐ Updated for price map
│
├── middleware.ts                  # ⭐ FF_SITE_VERSION routing
├── .env.2.0                       # ⭐ New env file
└── SKRBL_AI_2_0_MASTER_PLAN.md   # ⭐ This document
```

### Key Decisions Log

**Architecture Decisions:**

1. **Why Clerk for auth?**
   - Modern, maintained, better DX than legacy Supabase auth
   - Built-in user management UI
   - Better SSO/OAuth support for future

2. **Why Supabase Boost for data?**
   - Need separate database from legacy
   - Clean slate for 2.0 schema
   - Allows gradual migration without breaking old system

3. **Why price map JSON?**
   - Single source of truth
   - Easy to update (no code changes)
   - No more 100+ env vars
   - Stripe can change prices without deploy

4. **Why /legacy and /new split?**
   - Allows existing users to stay on stable version
   - Gradual rollout of 2.0 to cohorts
   - Easy rollback if issues found
   - No "big bang" migration risk

5. **Why 4 core flags only?**
   - Simplicity and maintainability
   - Clear on/off switches for major features
   - Easier to reason about system state
   - Reduces flag sprawl and confusion

### Resources & References

**Documentation:**
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)

**Internal Docs:**
- `/docs/BOOST_VERIFICATION_SUMMARY.md` - Boost Supabase setup
- `/analysis/BOOST_MIGRATION_PLAN.md` - Original migration plan
- `/lib/config/featureFlags.ts` - Feature flags reference

**Support:**
- GitHub Issues (for bugs)
- Discord/Slack (for questions)
- Weekly standups (for blockers)

---

## ✅ FINAL CHECKLIST

Before starting implementation, verify:

- [ ] I understand the 2.0 vision (three verticals + S.A.F.E)
- [ ] I understand the technical architecture (Clerk + Boost + Price Map)
- [ ] I understand the 4 core feature flags
- [ ] I understand the phase-by-phase plan
- [ ] I understand the timeline (12 weeks aggressive, 16 sustainable)
- [ ] I understand the risk mitigation strategies
- [ ] I have all necessary environment access (Clerk, Supabase, Stripe)
- [ ] I have backed up current codebase
- [ ] I have created `.env.2.0` with all required vars
- [ ] I have reviewed and agree with the critical path
- [ ] I am ready to commit to this plan

---

**Document Version:** 1.0  
**Created:** 2025-11-19  
**Last Updated:** 2025-11-19  
**Status:** Draft → Review → **Approved** → In Progress  

---

🎉 **You're ready to build SKRBL AI 2.0!** 🎉

Start with Phase 0 (Pre-Flight), then Phase 1 (Foundation). Take it one phase at a time, and you'll have a platform-ready SKRBL AI in 12 weeks.

Good luck! 🚀
