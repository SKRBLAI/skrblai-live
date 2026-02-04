# 🏆 SKRBL AI → Youth Sports Performance + Wellness Platform
## Strategic Pivot Recommendation by CBA (Cursor Background Agent)

---

## 📊 EXECUTIVE SUMMARY

**Current State**: Business automation platform with 14 AI agents focused on content creation, marketing, and business operations.

**Proposed State**: Youth Sports Performance + Wellness platform maintaining SKRBL AI's premium cosmic aesthetic but pivoting messaging to serve athletes (ages 7-18), parents, and coaches.

**Core Principle**: Keep agent NAMES intact (Percy stays Percy). Shift their EXPERTISE and PRESENTATION to serve youth sports context.

**Conversion Goal**: Increase sign-up → first value → retention loop by creating clearer path differentiation and emotional resonance with youth sports families.

---

## 🔍 CURRENT STATE FINDINGS

### Navigation (Navbar.tsx)
**Desktop Links**: About | Sports | Features | Pricing  
**More Dropdown**: Agent League, Contact  
**Mobile**: All above + Dashboard CTA

**Issues**:
- 6 nav items + dropdown feels cluttered
- "Features" is business-focused (doesn't translate to sports well)
- "Contact" buried in dropdown
- No clear "Academy" or learning hub presence
- Dashboard only appears if logged in (low visibility for returning users)

### Homepage (page.tsx)
**Current Flow**:
1. Hero with scan-first approach
2. Agent League Preview
3. Metrics Strip
4. Footer CTAs

**Issues**:
- No clear path differentiation ("Level Up My Game" vs "Grow My Brand")
- Scan-first is good but doesn't guide user intent
- Agent League Preview shows business automation agents
- Missing sports-specific social proof

### Agents Page (/agents/page.tsx)
**Current Presentation**:
- "Meet Your AI Superhero League"
- 14 business automation agents
- Search, filter, sort by popularity
- Premium gating for non-authenticated users

**Issues**:
- Superhero theme works but messaging is business-focused
- No sports-specific agent categories visible
- "Agent League" name is great but positioning needs shift

### Sports HQ Page (/sports/page.tsx)
**Current Structure**:
- SkillSmith (video analysis)
- NTNTNS × MSTRY (mindset scoring) - mostly "coming soon"
- AIR Studio (avatar builder) - mostly "coming soon"
- Tab navigation between three modules

**Strengths**:
✅ Great tab structure (SkillSmith, NTNTNS, AIR)
✅ Parent Portal link present
✅ Upload flow exists
✅ Pricing integration ready

**Issues**:
- Too much "coming soon" creates vapor-ware perception
- Not enough connection to Agent League
- Should be the PRIMARY landing experience for sports users

### Academy Page (/academy/page.tsx)
**Current State**:
- Percy Academy with 4 missions
- Gamified badges
- Very light content (missions, rewards)

**Issues**:
- Not positioned as learning hub
- No agent instruction/mentorship framing
- Missed opportunity for content repository
- Not connected to sports use cases

### Pricing Page (/pricing/page.tsx)
**Current Structure**:
- 4 business tiers: Rookie, Pro, All Star, Franchise
- Add-ons section (includes sports add-ons like Nutrition)
- Business-focused messaging throughout

**Issues**:
- Sports add-ons buried
- No clear sports-specific pricing path
- Messaging is "business domination" not "youth performance"

### About Page (/about/page.tsx)
**Current Content**:
- Company story (2023-2025 milestones)
- "AI Revolution" messaging
- "Automation First" core values
- Enterprise/business focus

**Issues**:
- No youth sports mission
- No mention of athlete development
- Company story doesn't include sports pivot

### Contact Page (/contact/page.tsx)
**Current Approach**:
- Priority contact options (Enterprise, Partnership, Media, Investment)
- Live metrics (inquiries, response time)
- Complex form with business fields

**Issues**:
- No "parent inquiry" or "coach inquiry" option
- Business-focused urgency levels
- Missing youth sports safety/trust signals

---

## 🎯 PROPOSED NAVIGATION & INFORMATION ARCHITECTURE

### OPTION A: Academy-First (Recommended)
**Rationale**: Positions learning/growth at center. Agents become "instructors" inside Academy ecosystem.

**Desktop Nav** (5 clean tabs):
1. **About** → Youth sports mission, safety, trust
2. **Academy** → Learning hub with agent instructors
3. **Sports HQ** → SkillSmith, NTNTNS, AIR (tools)
4. **Store** → Plans + add-ons (combines pricing + merch future-ready)
5. **Dashboard** → Visible when logged in, otherwise "Start Free"

**Rationale for Store vs Pricing**:
- "Store" feels less transactional, more value-based
- Opens door for merch, gear, digital products later
- Sports families understand "store" better than "pricing tiers"
- Can house both subscriptions AND one-time purchases

**Footer/Dropdown**:
- Contact (moved to footer, always accessible)
- Agents (link to Agent League or redirect to Academy → Instructors)

**Conversion Flow**:
1. User lands on homepage
2. Chooses path: "Level Up My Game" (sports) or "Grow My Brand" (business/creator)
3. Sports path → /sports or /academy
4. Business path → /scan or /agents

---

### OPTION B: Sports HQ-First (Alternative)
**Rationale**: Makes sports tools the hero. Academy becomes subsection.

**Desktop Nav** (5 tabs):
1. **About** → Mission, safety, trust
2. **Sports HQ** → Primary hub (SkillSmith, NTNTNS, AIR)
3. **Agents** → Meet the League (coaches/mentors)
4. **Pricing** → Clear tier structure
5. **Dashboard** → Logged in visibility

**Academy Placement**: Inside Sports HQ as 4th tab OR inside Agents as "Training Center"

**Issues with This Approach**:
- "Pricing" feels more transactional
- Less room for future product expansion
- Academy feels secondary

---

## ✅ **RECOMMENDATION: OPTION A (Academy-First)**

**Why**:
1. **Learning > Tools**: Parents/coaches value education over features
2. **Agent Instructors**: Natural fit for agents as mentors inside Academy
3. **Store Flexibility**: Supports subscriptions, add-ons, AND future merch
4. **Clearer Hierarchy**: Academy = hub, Sports HQ = tools, Store = value
5. **Conversion Path**: Academy creates recurring engagement, Store monetizes

**Nav Structure**:
```
About | Academy | Sports HQ | Store | Dashboard
```

**Footer Always Visible**:
- Contact
- Help Center
- Parent Resources
- Coach Portal

---

## 🏠 NEW HOMEPAGE LAYOUT SPEC

### Section Order & Rationale

#### 1. **Hero: Path Differentiation**
**Goal**: Immediately let user self-select their journey

**Design**:
- Cosmic background (keep existing style)
- Percy avatar (visible, friendly)
- Headline: "Choose Your Path"
- Subhead: "Whether you're leveling up your game or growing your brand, we've got the AI coaches you need."

**Two Large Cards (side-by-side)**:

**Card 1: Level Up My Game** (Sports)
- Icon: 🏀⚽🏈 (rotating sports balls)
- Copy: "Athletes, parents, coaches"
- Subline: "Upload a clip. Build mental toughness. Create your identity."
- CTA: "Start Training" → `/sports?intent=athlete`
- Visual: SkillSmith athlete imagery

**Card 2: Grow My Brand** (Business/Creator)
- Icon: 🚀📈💼
- Copy: "Creators, entrepreneurs, businesses"
- Subline: "Automate content. Scale your reach. Dominate your market."
- CTA: "Start Creating" → `/scan?intent=creator` or `/agents`
- Visual: Business automation imagery

**Why This Works**:
- Clear segmentation (no confusion)
- Sets intent early (tracks via URL param + localStorage)
- Both paths feel premium (no B-tier experience)
- Allows dual-vertical strategy without confusing either audience

**Post-CTA Flow**:
- Intent stored: `localStorage.setItem('userIntent', 'athlete' | 'creator')`
- Redirects to appropriate first-win experience
- Intent persists through signup → dashboard personalization

---

#### 2. **Sports Agent Preview (Replaces Agent League Preview)**
**Goal**: Show agents as coaches/mentors

**Design**:
- Heading: "Meet Your AI Coaches"
- Subhead: "Percy and the League are here to guide your growth"
- Show 4-6 agents relevant to youth sports:
  - **Percy**: Cosmic Concierge → "Your AI Head Coach"
  - **SkillSmith**: Video analysis expert
  - **Moe**: Content creator → "Your Highlight Reel Director"
  - **Nova**: Strategy → "Your Game Plan Architect"
  - **Sage**: Wellness → "Your Mindset Coach"
  - **Ember**: Energy/motivation → "Your Hype Coach"

**Card Design**:
- Agent avatar
- Reframed title (e.g., "Percy - Head Coach")
- 1-line sports-specific value prop
- CTA: "Chat with [Agent]" or "Learn More"

**Link to Full League**: "See All Coaches →" links to `/academy` or `/agents`

---

#### 3. **Value Props (3-Column Grid)**
**Goal**: Build trust with sports families

**Column 1: Safe Space**
- Icon: 🛡️
- Headline: "Built for Youth Athletes"
- Copy: "Privacy-first. Age-appropriate. Parent-approved."
- Trust signals: COPPA compliant, encrypted data

**Column 2: Proven Results**
- Icon: 📈
- Headline: "See Progress, Fast"
- Copy: "Video analysis, mindset scores, and personalized plans in minutes."
- Social proof: "1,200+ athletes trained" (use real metrics)

**Column 3: Coach + Parent Support**
- Icon: 👨‍👩‍👦
- Headline: "We Support the Whole Team"
- Copy: "Parent portal. Coach insights. Shared progress tracking."
- CTA: "Parent Resources →"

---

#### 4. **How It Works (3-Step Process)**
**Goal**: Simplify the value delivery

**Step 1: Upload or Assess**
- Icon: 🎥
- "Upload a clip or take the NTNTNS mindset assessment"

**Step 2: Get Instant Feedback**
- Icon: 🤖
- "AI coaches analyze and create your personalized plan"

**Step 3: Train and Grow**
- Icon: 🏆
- "Follow your plan, track progress, unlock new levels"

---

#### 5. **Sports HQ Preview (Tabs Teaser)**
**Goal**: Show the ecosystem without overwhelming

**Design**:
- 3 cards (SkillSmith, NTNTNS, AIR)
- Each card shows key feature + screenshot/visual
- CTA: "Explore Sports HQ →" links to `/sports`

---

#### 6. **Pricing Teaser**
**Goal**: Show affordability + value

**Design**:
- Heading: "Plans for Every Athlete"
- Show 3 plans (Youth Starter, Rising Star, Elite Squad)
- Pricing highlights
- CTA: "See All Plans →" links to `/store` or `/pricing`

---

#### 7. **Social Proof + Testimonials**
**Goal**: Build credibility

**Design**:
- Rotating testimonials from parents, coaches, athletes
- Video testimonials (if available)
- Logos of partner organizations (if any)

---

#### 8. **Footer CTA (Keep Existing)**
**Goal**: Final conversion push

**Design**:
- Keep cosmic card style
- Headline: "Start Your Athlete Journey Today"
- Dual CTAs: "Upload Clip" + "See Plans"

---

## 📄 PAGE-BY-PAGE PIVOT RECOMMENDATIONS

### **About Page Transformation**

**New Structure**:
1. **Hero**: "The SKRBL AI Mission"
   - Headline: "Building Confident, Resilient Athletes"
   - Subhead: "We believe every young athlete deserves access to world-class coaching, mental toughness training, and tools to build their identity."

2. **Story Section**: 
   - Milestones reframed:
     - 2023: "The Vision" → Focus on democratizing youth sports coaching
     - 2024: "AI Coach League" → Assembled AI coaches for skill + mindset
     - 2024: "Sports Tech Launch" → SkillSmith, NTNTNS, AIR platform
     - 2025: "Youth Performance Revolution" → Serving families worldwide

3. **Core Values** (reframed):
   - "Athlete-First" (was: Automation First)
   - "Safe + Age-Appropriate" (NEW)
   - "Results You Can See" (was: Results Driven)
   - "Support the Whole Team" (parent/coach focus)

4. **Who We Serve**:
   - Athletes (7-18): Skills, confidence, identity
   - Parents: Peace of mind, progress tracking
   - Coaches: Efficient training insights

5. **Percy Introduction**:
   - "Meet Percy - Your AI Head Coach"
   - Image, backstory, personality
   - Chat invitation

6. **Team Section** (Optional):
   - Founder story
   - Advisor bios (sports professionals if any)

7. **Safety + Privacy**:
   - COPPA compliance
   - Data encryption
   - Parent controls

---

### **Academy Page Transformation**

**New Positioning**: "SKRBL Academy - Your Growth Hub"

**Structure**:

#### **Section 1: Welcome + Percy Guide**
- Percy avatar (large, friendly)
- "Welcome to SKRBL Academy - I'm Percy, your AI Head Coach"
- Value prop: "Learn, train, and grow with AI instructors who adapt to your needs"

#### **Section 2: Academy Modules** (2-5 core areas)

**Module 1: Skill Fundamentals**
- Instructors: SkillSmith, Nova
- Content: Video analysis basics, drill libraries, technique breakdowns
- Format: Video lessons, interactive guides, downloadable drills

**Module 2: Mental Toughness**
- Instructors: Sage, Percy
- Content: Focus techniques, confidence building, pre-game routines
- Format: NTNTNS assessments, guided exercises, progress tracking

**Module 3: Brand + Identity**
- Instructors: Moe, AIR Studio
- Content: Personal branding, highlight creation, AIR avatar building
- Format: Templates, examples, creation tools

**Module 4: Parent + Coach Corner**
- Instructors: Percy, Sage
- Content: Supporting young athletes, communication strategies, managing pressure
- Format: Articles, video guides, community forum

**Module 5: Training Plans** (Optional)
- Instructors: SkillSmith, Nova
- Content: Sport-specific training plans, progression paths
- Format: Downloadable plans, customizable templates

#### **Section 3: Agent Instructors**
- Grid of all agents reframed as instructors
- Each card shows:
  - Agent avatar
  - Name + Instructor Title (e.g., "SkillSmith - Video Analysis Coach")
  - Specialty
  - CTA: "Chat with [Agent]" or "Learn from [Agent]"

#### **Section 4: Progress Tracking**
- Gamification: badges, milestones, levels
- User dashboard integration
- Streak tracking, completion percentage

#### **Section 5: Academy CTA**
- "Ready to Start Training?"
- CTA: "Upload First Clip" or "Take NTNTNS Assessment"

**Implementation Notes**:
- Agents page either:
  - **Option A**: Redirects to Academy "Instructors" section
  - **Option B**: Remains separate but links to Academy
- Recommended: Keep Agents page as light showcase, Academy as deep learning hub

---

### **Sports HQ Page Enhancements**

**Current State**: Already excellent structure. Needs minor tweaks.

**Enhancements**:

1. **Hero Section**:
   - Adjust copy to emphasize "Your Training Command Center"
   - Add Percy welcome message

2. **Tab Content**:
   - **SkillSmith Tab**: 
     - Reduce "coming soon" perception
     - Show sample analysis (screenshot/video)
     - Add success stories
   
   - **NTNTNS Tab**:
     - Preview scorecard visual
     - Show example focus pack
     - Add "Why Mindset Matters" explainer
   
   - **AIR Tab**:
     - Show avatar examples (even if system not live)
     - Preview AIR card mockup
     - Connect to Academy module

3. **Plans Section**:
   - Keep SportsPricingGrid
   - Ensure messaging aligns with "Store" nav concept

4. **Bottom CTA**:
   - Emphasize "Start with one clip" flow
   - Link to Academy for learning path

---

### **Agents Page Options**

**Option A: Keep Separate (Recommended)**
- Keep existing `/agents/page.tsx`
- Update messaging to "Meet Your AI Coach League"
- Reframe agent descriptions to sports/wellness context
- Add filter: "Sports Coaches" vs "Creator Coaches" (allows dual vertical)
- Update hero copy to emphasize mentorship

**Option B: Redirect to Academy**
- `/agents` → redirects to `/academy#instructors`
- Agents become section within Academy
- Loses distinct "League" identity (not recommended)

**Option C: Hybrid**
- Keep `/agents` as showcase/discovery
- Deep dive into each agent links to `/academy/[agent]` pages
- Agents page = "Choose your character" game-like selection
- Academy pages = actual learning content per instructor

**Recommendation**: **Option A** (keep separate, reframe messaging)

**Rationale**:
- Agents as "League" has strong branding
- Allows for both sports + business agent discovery
- Search/filter supports dual vertical
- Less disruptive to existing code

---

### **Store Page (New or Pricing Rename)**

**Option A: Rename /pricing → /store**
- Update route: `app/store/page.tsx` (or keep pricing.tsx, update nav label)
- Structure:
  - **Hero**: "Fuel Your Athletic Journey"
  - **Subscriptions Section**: Youth plans (Starter, Rising Star, Elite)
  - **Add-ons Section**: Extra scans, nutrition, advanced analytics
  - **One-Time Products Section** (Future): Merch, downloadable content
  - **Business Plans Section**: Separate section or tab for creator plans

**Option B: Keep /pricing, add /store later**
- Less disruptive short-term
- `/pricing` remains for subscriptions
- `/store` launches later for merch

**Recommendation**: **Option A** (Rename to Store now)

**Rationale**:
- Single destination for all monetization
- "Store" feels less intimidating than "Pricing"
- Future-proof for product expansion

---

### **Contact Page Enhancements**

**Updates Needed**:

1. **Priority Options** (update urgency categories):
   - **Parent Inquiry** (replaces Enterprise): "Questions about youth safety, features, support"
   - **Coach Partnership** (replaces Partnership): "Team accounts, bulk access, custom training"
   - **Press/Media** (keep)
   - **Business Inquiries** (replaces Investment): "Creator/business vertical, partnerships"

2. **Form Fields**:
   - Add "I am a..." dropdown: Parent, Coach, Athlete, Business Owner, Press
   - Adjust follow-up questions based on selection

3. **Trust Signals**:
   - Add "We typically respond to parent inquiries within 2 hours"
   - Show COPPA compliance badge
   - Display testimonials from parents/coaches

---

## 🤖 WHAT TO DO WITH AGENTS

### Agent Positioning Strategy

**Core Principle**: Keep agent NAMES. Reframe their EXPERTISE.

**Reframing Examples**:

| Agent | Current Role | Sports Reframe | Backstory Pivot |
|-------|--------------|----------------|-----------------|
| **Percy** | Cosmic Concierge | AI Head Coach | "Percy the Pathfinder - guides athletes through their journey with wisdom and humor" |
| **SkillSmith** | (already sports) | Video Analysis Coach | Keep existing + expand backstory |
| **Moe** | Content Marketing | Highlight Reel Director | "Moe turns your best moments into shareable stories that inspire" |
| **Nova** | Strategy | Game Plan Architect | "Nova analyzes patterns and builds winning strategies" |
| **Sage** | Wellness/Research | Mindset Coach | "Sage teaches focus, confidence, and mental toughness" |
| **Ember** | Motivation/Energy | Hype Coach | "Ember brings the energy, celebrates wins, and pushes through tough moments" |
| **Athena** | Learning/Training | Skills Instructor | "Athena breaks down complex techniques into simple, repeatable steps" |
| **Lumen** | Creative Director | Brand Identity Coach | "Lumen helps athletes discover and express their unique identity" |

**Implementation**:
- Update `lib/agents/agentLeague.ts`:
  - Add `sportsRole` field to AgentConfiguration
  - Add `sportsDescription` field
  - Update `personality` backstories where needed
- Update `AgentLeagueCard` component to show sports role when `userIntent === 'athlete'`
- Keep original business role for business/creator intent users

**Dual Vertical Support**:
- User intent detection: 
  ```typescript
  const userIntent = localStorage.getItem('userIntent') || 'general';
  const agentRole = userIntent === 'athlete' ? agent.sportsRole : agent.businessRole;
  const agentDesc = userIntent === 'athlete' ? agent.sportsDescription : agent.description;
  ```

---

### Where to Place Agents

**Recommended Structure**:

1. **Primary Discovery**: `/agents` page
   - Showcases full league
   - Filter by vertical (Sports Coaches | Creator Coaches | All)
   - Search by capability
   - Link to individual agent pages

2. **Learning Hub**: `/academy` 
   - "Instructors" section shows agents in teaching context
   - Links to specific Academy modules
   - Shows agent specialties + available lessons

3. **Individual Pages**: `/agents/[agent]` 
   - Keep existing dynamic pages
   - Update content to show both sports + business capabilities (tabs?)
   - Chat interface
   - Backstory + personality

4. **Contextual Appearances**:
   - Percy: Appears on every page (PercyButton, inline chat)
   - SkillSmith: Featured on Sports HQ
   - Sage: Featured in NTNTNS section
   - Moe: Featured in AIR Studio

---

## 🎓 ACADEMY VISION DEEP DIVE

### What Should Be Inside Academy?

**Core Modules (5)**:

#### **Module 1: Video Analysis Mastery**
**Led by**: SkillSmith, Nova

**Content**:
- How to film practice footage (angles, lighting, setup)
- Understanding analysis reports
- Drill library (sport-specific)
- Technique breakdowns (sport-specific)
- Progress tracking tutorials

**Formats**:
- 10-15 video lessons (5-10 min each)
- Downloadable drill PDFs
- Interactive quizzes
- Chat with SkillSmith

**Outcome**: User can effectively use SkillSmith tool + understand feedback

---

#### **Module 2: Mental Toughness Training**
**Led by**: Sage, Percy

**Content**:
- What is NTNTNS (focus, confidence, composure, consistency)
- Taking your first mindset assessment
- Daily focus exercises (3-5 min routines)
- Pre-game mental prep
- Dealing with mistakes/setbacks
- Building confidence through self-talk

**Formats**:
- Video lessons
- Guided audio exercises (downloadable MP3s)
- Daily challenge prompts
- Progress journal templates
- Chat with Sage

**Outcome**: User develops mental toughness habits

---

#### **Module 3: Building Your Athlete Brand**
**Led by**: Moe, Lumen (AIR Studio)

**Content**:
- Why athlete identity matters
- Creating your personal brand story
- Building your AIR avatar
- Making highlight reels (with Moe)
- Social media for young athletes (safe practices)
- Creating shareable AIR cards

**Formats**:
- Video tutorials
- Templates (avatar builder, card templates)
- Example galleries
- Social media guides (parent-approved)
- Chat with Moe

**Outcome**: User has defined identity + shareable content

---

#### **Module 4: Parent + Coach Resource Center**
**Led by**: Percy, Sage

**Content**:
- Supporting young athletes (communication strategies)
- Understanding pressure + burnout
- Reading SKRBL reports (parent guides)
- Team account management (for coaches)
- Effective feedback techniques
- Building confidence without pressure
- Sport safety + injury prevention basics

**Formats**:
- Articles (blog-style)
- Video guides
- Community forum (future)
- FAQ
- Chat with Percy

**Outcome**: Parents/coaches feel empowered to support athletes

---

#### **Module 5: Training Plans + Progression**
**Led by**: SkillSmith, Nova

**Content**:
- Sport-specific training plan templates
- 4-week skill progression paths
- Off-season training guides
- Combining video feedback with training plans
- Setting goals + tracking milestones

**Formats**:
- Downloadable plan PDFs
- Interactive plan builder (future)
- Video walkthroughs
- Progress tracking dashboards

**Outcome**: User has structured training path

---

### How Academy Complements/Replaces Agent League Page

**Relationship**:

- **Agent League Page**: "Meet the team" (discovery, personality, capabilities)
- **Academy Page**: "Learn from the team" (instruction, content, progression)

**User Flow**:
1. User discovers agents on `/agents` → intrigued by personalities
2. User explores Academy → learns from agents in structured format
3. User returns to Sports HQ → uses tools with newfound knowledge
4. User chats with agents → asks specific questions, gets personalized guidance

**Academy Doesn't Replace Agents**:
- Agents page = character selection screen (game-like, fun, discovery)
- Academy = training ground (educational, structured, outcome-focused)
- Both serve distinct purposes

---

## 🛠️ IMPLEMENTATION GUIDANCE

### Key Files to Modify

#### **Navigation**

**File**: `components/layout/Navbar.tsx`

**Changes**:
- Update nav links (lines 78-82):
  ```typescript
  <NavLink href="/about">About</NavLink>
  <NavLink href="/academy">Academy</NavLink>
  <NavLink href="/sports">Sports HQ</NavLink>
  <NavLink href="/store">Store</NavLink> {/* was /pricing */}
  ```

- Update `MoreNavDropdown` (line 165-168):
  ```typescript
  const moreNavItems = [
    { href: "/agents", label: "Coach League" }, // was "Agent League"
    { href: "/contact", label: "Contact" },
  ];
  ```

- OR move Contact to footer entirely, remove dropdown

**Alternative**: Keep "Pricing" label short-term, update to "Store" later

---

#### **Homepage**

**File**: `app/page.tsx`

**Changes**:
- Keep `HomeHeroScanFirst` component but update it
- OR create new `HomeHeroPathChoice` component

**New Component**: `components/home/HomeHeroPathChoice.tsx`

**Structure**:
```typescript
export default function HomeHeroPathChoice() {
  const router = useRouter();
  
  const handlePathSelect = (intent: 'athlete' | 'creator') => {
    localStorage.setItem('userIntent', intent);
    
    if (intent === 'athlete') {
      router.push('/sports?intent=athlete');
    } else {
      router.push('/scan?intent=creator');
    }
  };
  
  return (
    <section className="hero">
      <h1>Choose Your Path</h1>
      <div className="path-cards">
        <PathCard
          title="Level Up My Game"
          subtitle="Athletes, parents, coaches"
          icon="🏀⚽🏈"
          onClick={() => handlePathSelect('athlete')}
        />
        <PathCard
          title="Grow My Brand"
          subtitle="Creators, entrepreneurs, businesses"
          icon="🚀📈💼"
          onClick={() => handlePathSelect('creator')}
        />
      </div>
    </section>
  );
}
```

**Integration**:
- Update `app/page.tsx` to use new hero
- Update `AgentLeaguePreview` to filter agents by intent
- Add intent detection to all agent-related components

---

#### **About Page**

**File**: `app/about/page.tsx`

**Changes** (lines 23-52 - storyMilestones):
```typescript
const storyMilestones = [
  {
    year: "2023",
    title: "The Vision",
    description: "Started with a mission: democratize world-class coaching for young athletes through AI.",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500"
  },
  {
    year: "2024", 
    title: "AI Coach League",
    description: "Assembled 14 AI coaches specializing in skill development, mental toughness, and athlete identity.",
    icon: <Users className="w-6 h-6" />,
    color: "from-blue-500 to-purple-500"
  },
  {
    year: "2024",
    title: "Sports Tech Launch", 
    description: "Launched SkillSmith, NTNTNS, and AIR Studio - the complete youth performance platform.",
    icon: <Rocket className="w-6 h-6" />,
    color: "from-green-500 to-teal-500"
  },
  {
    year: "2025",
    title: "Youth Performance Revolution",
    description: "Empowering thousands of young athletes and families worldwide to reach their potential.",
    icon: <Award className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500"
  }
];
```

**Changes** (lines 55-71 - coreValues):
```typescript
const coreValues = [
  {
    title: "Athlete-First",
    description: "Every feature built to help young athletes grow, not just perform.",
    icon: <Zap className="w-8 h-8" />
  },
  {
    title: "Safe + Age-Appropriate",
    description: "Privacy-first, COPPA compliant, parent-approved content and interactions.",
    icon: <Shield className="w-8 h-8" />
  },
  {
    title: "Results You Can See",
    description: "Measurable progress in skills, confidence, and mental toughness.",
    icon: <Target className="w-8 h-8" />
  }
];
```

**Hero Section** (lines 136-161):
- Update headline: "The AI Revolution → The Youth Performance Revolution"
- Update copy to focus on athlete development, safe space, family support
- Replace business metrics with sports metrics (athletes trained, progress improvements)

---

#### **Academy Page**

**File**: `app/academy/page.tsx`

**Major Overhaul Needed**:

**New Structure**:
```typescript
export default function AcademyPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  return (
    <PageLayout>
      {/* Hero: Percy Welcome */}
      <section>
        <PercyAvatar size="xl" />
        <h1>Welcome to SKRBL Academy</h1>
        <p>I'm Percy, your AI Head Coach. Ready to level up?</p>
      </section>
      
      {/* Academy Modules */}
      <section>
        <h2>Choose Your Training Path</h2>
        <ModuleGrid>
          <ModuleCard
            title="Video Analysis Mastery"
            instructor="SkillSmith"
            icon="🎥"
            lessonsCount={12}
            duration="2 hours"
            onClick={() => setActiveModule('video')}
          />
          <ModuleCard
            title="Mental Toughness Training"
            instructor="Sage"
            icon="🧠"
            lessonsCount={15}
            duration="3 hours"
          />
          <ModuleCard
            title="Build Your Brand"
            instructor="Moe"
            icon="🎨"
            lessonsCount={10}
            duration="90 min"
          />
          <ModuleCard
            title="Parent + Coach Corner"
            instructor="Percy"
            icon="👨‍👩‍👦"
            lessonsCount={8}
            duration="1 hour"
          />
          <ModuleCard
            title="Training Plans"
            instructor="Nova"
            icon="📋"
            lessonsCount={6}
            duration="1 hour"
          />
        </ModuleGrid>
      </section>
      
      {/* Agent Instructors Section */}
      <section>
        <h2>Meet Your Instructors</h2>
        <AgentInstructorGrid />
      </section>
      
      {/* Progress Tracking */}
      <section>
        <h2>Your Progress</h2>
        <ProgressDashboard />
      </section>
    </PageLayout>
  );
}
```

**New Components Needed**:
- `components/academy/ModuleCard.tsx`
- `components/academy/ModuleGrid.tsx`
- `components/academy/AgentInstructorGrid.tsx`
- `components/academy/ProgressDashboard.tsx`

**Content Strategy**:
- Phase 1: Module placeholders with "Coming Soon" but show structure
- Phase 2: Add 2-3 video lessons per module (real content)
- Phase 3: Full module rollout

**Avoid "Vaporware"**:
- Show real value immediately:
  - Module 1: Add 3 real SkillSmith video lessons (filming tips, reading reports, first drill)
  - Module 2: Add 2 real mindset exercises (breathing, pre-game routine)
  - Module 4: Add parent FAQ + 1 video guide
- Use "More Coming Soon" instead of "Coming Soon"

---

#### **Agents Page**

**File**: `app/agents/page.tsx`

**Changes**:

**Hero Section** (lines 245-256):
```typescript
<CosmicHeading className="text-4xl md:text-6xl lg:text-7xl mb-6">
  Meet Your AI
  <br />
  <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
    Coach League
  </span>
</CosmicHeading>

<p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
  14 AI coaches, each with <span className="text-cyan-400 font-bold">unique expertise</span> designed to develop skills, 
  build confidence, and <span className="text-purple-400 font-bold">unlock potential</span> in every athlete.
</p>
```

**Filter/Category** (lines 153-156):
- Add category filter: "Sports Coaches" | "Creator Coaches" | "All Coaches"
- Implement intent-based filtering

**Agent Descriptions**:
- Update in `lib/agents/agentLeague.ts` (add sportsRole, sportsDescription fields)
- Use conditional rendering based on userIntent

---

#### **Sports HQ Page**

**File**: `app/sports/page.tsx`

**Minimal Changes Needed** (Already excellent structure)

**Enhancements**:

**Hero** (lines 259-273):
- Update microline: "Built for athletes, parents, and coaches."

**SkillSmith Tab** (lines 317-396):
- Add sample analysis screenshot/preview
- Reduce "coming soon" perception
- Add success story testimonial

**NTNTNS Tab** (lines 455-533):
- Add scorecard preview visual (mockup is fine)
- Show focus pack example
- Add "Why Mindset Matters" explainer section

**AIR Tab** (lines 537-612):
- Show avatar gallery (even if builder not live)
- Preview AIR card template
- Link to Academy module

---

#### **Pricing/Store Page**

**File**: `app/pricing/page.tsx`

**Option 1: Rename route** (more disruptive)
- Create `app/store/page.tsx`
- Move content from pricing
- Update all internal links

**Option 2: Keep route, update content** (less disruptive, recommended short-term)
- Update nav label to "Store" in Navbar
- Keep file path as `app/pricing/page.tsx`
- Update page content

**Content Changes**:

**Hero** (lines 234-255):
- Update headline: "Choose Your AI Automation Tier → Choose Your Training Plan"
- Update copy to focus on youth sports value
- Replace "automation" with "performance" language

**Pricing Tiers** (lines 395-479):
- Keep BusinessPricingGrid for business plans
- Add SportsPricingGrid above (already exists in codebase)
- Create tab toggle: "Sports Plans" | "Business Plans"

**Add-ons Section** (lines 481-571):
- Already has sports add-ons (nutrition, scans)
- Add more prominence to sports add-ons
- Reorder to show sports add-ons first

---

#### **Contact Page**

**File**: `app/contact/page.tsx`

**Changes**:

**Priority Options** (lines 44-93):
```typescript
const urgentContactOptions = [
  {
    title: 'Parent Inquiry',
    description: 'Questions about youth safety, features, account setup, and support.',
    icon: <Users className="w-8 h-8" />,
    action: 'parent',
    urgency: '< 2 hours',
    valueProposition: 'Safe + trusted',
    color: 'from-blue-600 to-cyan-500',
    priority: 'HIGH',
  },
  {
    title: 'Coach Partnership',
    description: 'Team accounts, bulk access, custom training for your athletes.',
    icon: <Target className="w-8 h-8" />,
    action: 'coach',
    urgency: '< 4 hours', 
    valueProposition: 'Team discounts',
    color: 'from-green-600 to-emerald-500',
    priority: 'URGENT',
  },
  {
    title: 'Press & Media',
    description: 'Cover youth sports innovation and AI-powered athlete development.',
    icon: <Star className="w-8 h-8" />,
    action: 'media',
    urgency: '< 1 hour',
    valueProposition: 'Exclusive access',
    color: 'from-orange-600 to-red-500',
    priority: 'IMMEDIATE',
  },
  {
    title: 'Business Inquiries',
    description: 'Creator platform, business automation, partnerships, and investment.',
    icon: <DollarSign className="w-8 h-8" />,
    action: 'business',
    urgency: '< 4 hours',
    valueProposition: 'ROI-focused',
    color: 'from-purple-600 to-pink-500',
    priority: 'URGENT',
  }
];
```

**Form Fields** (lines 155-158, 623-637):
- Add "I am a..." dropdown before name field
- Options: Parent, Coach, Athlete, Business Owner, Media
- Adjust form flow based on selection

---

#### **Agent League Registry**

**File**: `lib/agents/agentLeague.ts`

**Changes**:

Add new fields to `AgentConfiguration` interface (around line 63):

```typescript
export interface AgentConfiguration {
  // ... existing fields ...
  
  // Dual Vertical Support
  sportsRole?: string; // e.g., "Video Analysis Coach"
  sportsDescription?: string; // sports-focused description
  businessRole?: string; // e.g., "Marketing Automation Expert"
  businessDescription?: string; // business-focused description
  
  // ... rest of fields ...
}
```

Update agent configs (example for Percy):

```typescript
{
  id: 'percy',
  name: 'Percy',
  category: 'Concierge',
  description: 'Your cosmic concierge orchestrating your entire AI automation empire.',
  
  // Dual roles
  sportsRole: 'Head Coach & Concierge',
  sportsDescription: 'Your AI guide through the SKRBL sports journey - connects you to the right coaches and tools.',
  businessRole: 'Cosmic Concierge',
  businessDescription: 'Orchestrates your entire AI automation empire across all agents.',
  
  // ... rest of config ...
}
```

---

### Routing Changes

**No Major Routing Changes Needed**

Existing routes are solid:
- `/about` ✅
- `/academy` ✅
- `/sports` ✅
- `/agents` ✅
- `/pricing` ✅ (optionally rename nav label to "Store")
- `/contact` ✅

**New Routes to Consider** (Future):
- `/academy/[module]` - Individual module pages
- `/academy/[module]/[lesson]` - Individual lesson pages
- `/store` - Dedicated store route (if renaming from pricing)

---

### Minimal-Change Plan

**Phase 1: Copy + Messaging** (No new files)
1. Update Navbar labels
2. Update About page content
3. Update Agents page hero + copy
4. Update Contact page priority options
5. Update pricing page headline + intro
6. Add userIntent localStorage detection utility

**Phase 2: Homepage + Academy** (2-3 new files)
1. Create `HomeHeroPathChoice` component
2. Update homepage to use new hero
3. Overhaul Academy page structure
4. Create 2-3 new Academy components

**Phase 3: Agent Integration** (1-2 new files)
1. Update agentLeague.ts with dual role support
2. Update AgentLeagueCard component
3. Create intent detection hook/utility

---

### What Will Break?

**Potential Issues**:

1. **SSR/Client-Side Rendering**:
   - `localStorage` only works client-side
   - Solution: Use `useEffect` + `useState` for intent detection
   - Graceful fallback if no intent set

2. **Route Changes** (if renaming /pricing):
   - Internal links need updating
   - External links (marketing, emails) break
   - Solution: Keep route, update nav label only

3. **Agent Backstories**:
   - Existing backstories are business-focused
   - Updating them affects LLM personality injection
   - Solution: Add sportsBackstory field, conditional injection

4. **Search/Filter**:
   - Current agent categories are business-focused
   - Sports categories don't exist yet
   - Solution: Add "vertical" field (sports/business/both) to agent config

5. **Analytics/Tracking**:
   - Current tracking assumes business user flow
   - Need separate funnels for sports vs business
   - Solution: Pass `userIntent` to all analytics events

6. **Auth/Dashboard**:
   - Dashboard currently assumes business features
   - Sports users need different dashboard
   - Solution: Conditional dashboard rendering based on user profile

---

## ⚠️ RISKS & GOTCHAS

### High Priority Risks

#### 1. **Dual Vertical Complexity**
**Risk**: Trying to serve two audiences (sports + business) creates confusion, dilutes messaging.

**Mitigation**:
- Clear path separation on homepage (choose your path)
- Intent-based personalization throughout
- Separate onboarding flows
- Analytics segmentation from day 1

**Decision Point**: Is dual vertical right, or should you fully pivot to sports?
- **Recommendation**: Start dual, monitor metrics, consider full pivot in 6 months if sports dominates

---

#### 2. **"Coming Soon" Perception**
**Risk**: Too much "coming soon" content creates vaporware perception, hurts trust.

**Mitigation**:
- Launch with real content in at least 2 Academy modules
- Show previews/mockups instead of blank "coming soon"
- Use "More Lessons Coming" instead of "Coming Soon"
- Prioritize SkillSmith (already works) + NTNTNS (can launch basic version)

**Academy Launch Checklist** (Must-have for Day 1):
- ✅ Module 1: 3 real video lessons (SkillSmith basics)
- ✅ Module 2: 2 real mindset exercises (breathing, pre-game routine)
- ✅ Module 4: Parent FAQ + 1 video guide
- ✅ Agent Instructors section (shows all agents, even if not all have content)
- ⏸️ Modules 3, 5: Show structure, mark "Building" or "Preview"

---

#### 3. **Agent Identity Crisis**
**Risk**: Changing agent positioning confuses existing users, dilutes brand equity.

**Mitigation**:
- Keep agent names identical (Percy stays Percy)
- Add sports roles alongside business roles (not replacing)
- Update gradually (business users won't see sports messaging if intent=creator)
- Internal documentation: Agent personality guide for dual context

**Agent Transition Plan**:
1. Add sportsRole to config (doesn't break anything)
2. Update frontend to show sportsRole when appropriate
3. Gradually add sports-specific lessons/content
4. Existing business users see no change

---

#### 4. **Parent Trust + Safety Concerns**
**Risk**: Parents hesitant to use AI tools with kids without trust signals.

**Mitigation**:
- Prominent COPPA compliance badge
- "How We Protect Your Athlete" page (add to About or Contact)
- Parent testimonials (video testimonials > text)
- Parent control panel (show what parents can see/control)
- Transparent data usage policy

**Trust-Building Checklist**:
- [ ] COPPA compliance statement (About page, footer)
- [ ] Privacy policy update (youth-specific language)
- [ ] Parent portal walkthrough video
- [ ] "Safe for Youth Athletes" badge (design + place on homepage)
- [ ] Testimonials from 5+ parents

---

#### 5. **Sports vs Business Agent Handoffs**
**Risk**: Cross-agent handoffs designed for business use cases don't translate to sports.

**Mitigation**:
- Review all handoff triggers in agentLeague.ts
- Add sportsHandoffs field (separate from business handoffs)
- Example: Business handoff: "content creation → social media boost"
  Sports handoff: "video analysis → training plan creation"

**Handoff Review Needed**:
- Percy → SkillSmith (sports) vs Percy → Moe (business)
- SkillSmith → Nova (training plan) vs SkillSmith → ? (no business equivalent)
- Sage → Percy (mindset → overall guidance) - works for both

---

### Medium Priority Risks

#### 6. **Navigation Too Complex**
**Risk**: 5 nav items still feels like too much for clean UX.

**Mitigation**:
- Test with users (5-second test: "Where would you go to...")
- Consider mega-menu for Sports HQ (hover shows SkillSmith, NTNTNS, AIR)
- Mobile optimization critical (test on actual devices)

**A/B Test Options**:
- A: Current 5-tab nav
- B: 4-tab nav (Sports HQ + Academy combined)
- Measure: time to first action, bounce rate

---

#### 7. **Pricing Confusion**
**Risk**: Sports families see business pricing, get confused. Business users see sports pricing, get confused.

**Mitigation**:
- Pricing page tabs: "Sports Plans" | "Business Plans"
- Homepage path choice sets default tab
- Clear labeling: "Youth Athletes" vs "Creators & Businesses"

**Pricing Page Structure**:
```
[Hero: Universal value prop]

[Tab Toggle: Sports Plans | Business Plans]

[Conditional Content: Shows selected tab]

[Add-ons: Labeled by vertical]

[FAQ: Separate sections for each vertical]
```

---

#### 8. **Content Maintenance Burden**
**Risk**: Dual vertical = 2x content creation, 2x updates, 2x maintenance.

**Mitigation**:
- Component reusability (DRY principle)
- CMS for content updates (consider future)
- Markdown-based content (easy to update)
- Community content (parent/coach submissions)

**Content Workflow**:
1. Sports content priority (launch phase)
2. Business content maintenance mode (no new business features short-term)
3. Community contributions (parents write guides, coaches submit drills)
4. AI-generated drafts (use Percy to draft content, human review)

---

#### 9. **SEO Implications**
**Risk**: Changing messaging affects search rankings, meta descriptions, keywords.

**Mitigation**:
- Update meta tags in app/layout.tsx
- New keywords: "youth sports performance", "AI sports coaching", "athlete mental toughness"
- Keep business keywords too (dual vertical)
- 301 redirects if changing any URLs
- Update sitemap.ts

**SEO Checklist**:
- [ ] Update root layout metadata (app/layout.tsx lines 15-80)
- [ ] Update About page metadata
- [ ] Update Sports page metadata
- [ ] Update Academy page metadata
- [ ] New keywords in content
- [ ] Schema markup for sports content
- [ ] Update robots.txt (if needed)

---

#### 10. **Mobile Experience**
**Risk**: Cosmic glassmorphism style + complex layouts don't work well on mobile.

**Mitigation**:
- Mobile-first testing (test on real devices, not just responsive mode)
- Simplify mobile nav (hamburger only)
- Larger tap targets (44x44px minimum)
- Test on older devices (iPhone 8, Android 10)

**Mobile UX Review**:
- Homepage path choice cards (side-by-side vs stacked)
- Sports HQ tabs (horizontal scroll vs dropdown)
- Academy modules (grid vs list)
- Agent cards (1-col on mobile)

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Week 1)
- [ ] Update Navbar labels (About, Academy, Sports HQ, Store, Dashboard)
- [ ] Update About page content (story, values, mission)
- [ ] Update Agents page hero + descriptions
- [ ] Update Contact page priority options
- [ ] Update Pricing/Store page headlines
- [ ] Add userIntent detection utility
- [ ] Update root layout metadata (SEO)

### Phase 2: Homepage + Intent (Week 2)
- [ ] Create HomeHeroPathChoice component
- [ ] Update homepage to use path choice
- [ ] Implement localStorage intent tracking
- [ ] Update AgentLeaguePreview to filter by intent
- [ ] Test intent flow: select → store → navigate → persist

### Phase 3: Academy Overhaul (Week 3-4)
- [ ] Redesign Academy page structure
- [ ] Create ModuleCard component
- [ ] Create AgentInstructorGrid component
- [ ] Create ProgressDashboard component (basic version)
- [ ] Add 3 real video lessons to Module 1
- [ ] Add 2 real exercises to Module 2
- [ ] Add parent FAQ to Module 4

### Phase 4: Agent Integration (Week 5)
- [ ] Update agentLeague.ts with dual role support
- [ ] Add sportsRole + sportsDescription to 8-10 agents
- [ ] Update AgentLeagueCard component (conditional rendering)
- [ ] Create intent detection hook
- [ ] Test agent discovery flow with intent

### Phase 5: Polish + Testing (Week 6)
- [ ] Mobile testing (5+ devices)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Performance testing (Lighthouse scores)
- [ ] Analytics integration (intent tracking)
- [ ] A/B test setup (path choice variations)

### Phase 6: Content + Launch (Week 7-8)
- [ ] Parent testimonials (video + text)
- [ ] Coach testimonials
- [ ] Athlete success stories
- [ ] Sample analysis screenshots/videos
- [ ] COPPA compliance documentation
- [ ] Launch announcement (blog, social, email)

---

## 🎯 SUCCESS METRICS

### Conversion Metrics
- **Homepage Intent Selection Rate**: >70% of visitors choose a path
- **Intent → Signup Rate**: >15% for sports, >10% for business
- **Signup → First Value**: >50% complete first action (upload clip or scan)
- **7-Day Retention**: >40% return within 7 days

### Engagement Metrics
- **Academy Visits**: >30% of users visit Academy within first session
- **Module Completion**: >20% complete at least 1 lesson
- **Agent Interaction**: >50% chat with at least 1 agent
- **Sports HQ Upload**: >40% upload a clip (sports intent users)

### Qualitative Metrics
- **Parent Trust**: Testimonial collection (target: 10+ parent testimonials month 1)
- **Feature Requests**: Track sports vs business feature requests (ratio insight)
- **Support Inquiries**: Sports inquiries > business inquiries = successful pivot

---

## 🚀 FINAL RECOMMENDATION SUMMARY

### ✅ DO THIS
1. **Implement Option A Navigation** (About, Academy, Sports HQ, Store, Dashboard)
2. **Launch Homepage Path Choice** (sports vs business intent separation)
3. **Overhaul Academy as Learning Hub** with agent instructors
4. **Add Sports Roles to Agents** (dual vertical support)
5. **Update About Page Mission** to youth sports focus
6. **Launch with Real Content** (avoid "coming soon" perception)
7. **Prioritize Trust Signals** (COPPA, parent testimonials, safety)

### ⚠️ DO NOT DO THIS
1. **Don't rename agent names** (keep Percy, SkillSmith, etc.)
2. **Don't remove business vertical** (keep dual vertical short-term)
3. **Don't launch Academy with all "coming soon"** (must have 5+ real lessons)
4. **Don't change too many routes** (keep /pricing, /agents, etc.)
5. **Don't ignore mobile UX** (test on real devices early)

### 🎯 PRIORITY ORDER
1. **Navigation + Messaging** (highest impact, lowest effort)
2. **Homepage Path Choice** (critical for conversion)
3. **Academy Foundation** (differentiator, retention driver)
4. **Agent Integration** (personalization, engagement)
5. **Content Creation** (trust, value delivery)

---

## 📞 NEXT STEPS

### Immediate Actions (Today)
1. Review this document with team
2. Decide: Option A (Academy-First) vs Option B (Sports HQ-First)
3. Decide: Full pivot vs Dual vertical
4. Prioritize Phase 1 tasks
5. Assign owners for each phase

### This Week
1. Create feature branch: `cursor/skrbl-ai-youth-pivot-a047`
2. Start Phase 1 (Navigation + Messaging updates)
3. Design HomeHeroPathChoice component (Figma/sketch)
4. Audit existing agents for sports role mapping
5. Plan content creation (videos, exercises, guides)

### This Month
1. Complete Phases 1-3 (Foundation, Homepage, Academy)
2. Launch beta to 10-20 parent testers
3. Collect feedback + iterate
4. Begin Phase 4 (Agent Integration)
5. Start content creation workflow

---

## 📝 NOTES FOR DEVELOPMENT

### Component Reuse Strategy
- Maximize use of existing components (CosmicCard, GlassmorphicCard, CosmicButton)
- Create minimal new components (ModuleCard extends CosmicCard)
- Conditional rendering > duplication (sportsRole vs businessRole)

### Data Layer Considerations
- User profile should store `preferredVertical` ('sports' | 'business' | 'both')
- Analytics events should include `vertical` dimension
- Agent chat history should be tagged with context (sports vs business)

### Future Considerations
- Community features (parent forum, coach network)
- Marketplace (gear, merch, training programs)
- Team accounts (coach manages multiple athletes)
- White-label for clubs/organizations

---

**Document Version**: 1.0  
**Date**: February 4, 2026  
**Author**: CBA (Cursor Background Agent)  
**Status**: Ready for Implementation  

---

**Let's build something AMAZING for youth athletes.** 🏆⚡🏀
