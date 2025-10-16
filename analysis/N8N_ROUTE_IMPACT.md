# N8N Route Impact Map

**Generated**: 2025-10-16  
**Purpose**: Map every n8n call to its Next.js entry point and user-facing route

---

## Route Impact Matrix

| Next.js Route | Entry Point | N8N Call Location | When User Hits It | Blocking? | Failure Impact |
|---------------|-------------|-------------------|-------------------|-----------|----------------|
| **POST /api/scan** | `app/api/scan/route.ts:POST` | Lines 209-235 | Free scan submission (landing page CTA) | ⚠️ **YES - 503** | 🔴 **CRITICAL**: Feature completely broken |
| **Supabase Function** | `post-payment-automation` | Lines 89-96, 147-154 | After Stripe checkout.session.completed webhook | Semi-blocking | 🔴 **CRITICAL**: Email sequences fail |
| **/auth/callback** | Auth callback → `lib/webhooks/n8nWebhooks.ts` | Lines 150-178 (signup/signin) | After OAuth redirect or sign-in | No (logs error) | 🟡 **HIGH**: Analytics gap, no onboarding emails |
| **POST /api/onboarding/business** | `app/api/onboarding/business/route.ts:POST` | Lines 34-62 | Business wizard completion | No (best-effort) | 🟢 **LOW**: Lead not tracked |
| **POST /api/scans/business** | `app/api/scans/business/route.ts:POST` | Lines 36-50 | Quick business scan | No (best-effort) | 🟢 **LOW**: Scan event not tracked |
| **POST /api/agents/[agentId]/launch** | `app/api/agents/[agentId]/launch/route.ts:POST` | Lines 78-102 | Agent launch (dashboard) | No (fire-forget) | 🟢 **LOW**: Workflow event not tracked |
| **POST /api/percy/scan** | `app/api/percy/scan/route.ts:POST` | Lines 580-607 | Percy scan submission | No (try/catch) | 🟢 **LOW**: Scan event not tracked |
| **POST /api/stripe/webhook** | `app/api/stripe/webhook/route.ts:POST` | Lines 153-168 | Stripe webhook (SkillSmith purchase) | No (optional) | 🟢 **LOW**: Purchase event not tracked |
| **(Any route calling email)** | `lib/email/n8nIntegration.ts` | Lines 49-87 | Email sequence trigger | No (returns error) | 🟡 **MEDIUM**: Email not sent |
| **(Health checks)** | `lib/maintenance/BackendHealthChecker.ts` | Lines 302-387 | Admin health check | No (monitoring) | 🟢 **LOW**: Monitoring alert |

---

## User Journey Impact Analysis

### 1. First-Time Visitor Journey (CRITICAL)

**Journey**: Landing page → Click "Try Free Scan" → Fill form → Submit  
**Route**: `POST /api/scan`  
**N8N Dependency**: `N8N_WEBHOOK_FREE_SCAN` env var  
**Current Behavior**: If n8n down → **503 Service Unavailable**  
**User Sees**: Error message, cannot try product  
**Business Impact**: **100% conversion loss on free scans**  

#### Flow Diagram
```
User → Landing Page CTA
  ↓
  Fill scan form (sport/skill details)
  ↓
POST /api/scan (line 209)
  ↓
if (!process.env.N8N_WEBHOOK_FREE_SCAN) → 503 ❌
  ↓
Forward to n8n with 30s timeout
  ↓
if (timeout) → 504 Gateway Timeout ❌
  ↓
Return n8n response to user
```

**Fix Required**: NOOP wrapper must intercept before 503 check.

---

### 2. Sign-Up Journey (HIGH)

**Journey**: Click "Sign Up" → OAuth or email → Auth callback  
**Route**: `/auth/callback` (triggers `lib/webhooks/n8nWebhooks.ts`)  
**N8N Dependency**: `N8N_WEBHOOK_BASE_URL` or `N8N_BASE_URL`  
**Current Behavior**: If n8n down → Logs warning, auth succeeds  
**User Sees**: Successful sign-in (no visible error)  
**Business Impact**: Missing onboarding emails, analytics gap  

#### Flow Diagram
```
User → Sign Up → Auth Provider
  ↓
/auth/callback (Next-Auth/Supabase)
  ↓
fireSignupWebhook() (lib/webhooks/n8nWebhooks.ts:150)
  ↓
if (!N8N_WEBHOOK_BASE) → return {success: false} (graceful) ✅
  ↓
3 retry attempts with exponential backoff
  ↓
if (all fail) → logWebhookError() to webhook_errors table
  ↓
Auth completes successfully
```

**Current Status**: Already graceful! But creates noise in logs.  
**Fix Required**: Feature flag to skip entirely.

---

### 3. Checkout Journey (CRITICAL)

**Journey**: Dashboard → Upgrade → Stripe Checkout → Payment success  
**Route**: Stripe webhook → Supabase Function `post-payment-automation`  
**N8N Dependency**: `N8N_WEBHOOK_BASE_URL`, `N8N_API_KEY`  
**Current Behavior**: If n8n down → Logs error, function continues, payment recorded  
**User Sees**: Payment success, subscription activated  
**Business Impact**: No welcome emails, no onboarding sequence  

#### Flow Diagram
```
User → Stripe Checkout → Payment Success
  ↓
Stripe webhook: checkout.session.completed
  ↓
app/api/stripe/webhook/route.ts (line 43)
  ↓
handleCheckoutCompleted()
  ↓
(Updates Supabase: profiles, subscriptions)
  ↓
(If SkillSmith) → Triggers Supabase Function:
  ↓
post-payment-automation/index.ts
  ↓
Fetch N8N_WEBHOOK_BASE_URL/payment-completed (line 89)
  ↓
if (!ok) → console.error() but DON'T FAIL ✅
  ↓
if (ok) → Trigger follow-up tasks (line 147)
  ↓
Fetch N8N_WEBHOOK_BASE_URL/schedule-task
  ↓
Return success to Stripe
```

**Current Status**: Semi-graceful (doesn't fail payment)  
**Fix Required**: Feature flag to skip n8n calls entirely.

---

### 4. Agent Launch Journey (LOW)

**Journey**: Dashboard → Select agent → "Launch" button  
**Route**: `POST /api/agents/[agentId]/launch`  
**N8N Dependency**: `N8N_AGENT_LAUNCH_WEBHOOK_URL`  
**Current Behavior**: If n8n down → Logs to DB, agent launch succeeds  
**User Sees**: Agent launches successfully  
**Business Impact**: Analytics gap (no webhook event)  

#### Flow Diagram
```
User → Agent Page → Click "Launch"
  ↓
POST /api/agents/percy/launch
  ↓
runAgentWorkflow(agentId, payload) → runs successfully
  ↓
if (result.status === 'success' && N8N_WEBHOOK_URL):
  ↓
  Fire-and-forget: fetch(N8N_WEBHOOK_URL)
  ↓
  .catch() → Update agent_launches table with 'webhook_failed'
  ↓
Return success to user immediately
```

**Current Status**: Already fire-and-forget, no UX impact  
**Fix Required**: Feature flag to skip entirely (save DB write).

---

## Critical Routes That Block User Flow

### 🔴 Priority 1: `/api/scan` (Free Scan)
**Why Critical**: First touchpoint for new users  
**Current Blocking**: Returns 503 if N8N_WEBHOOK_FREE_SCAN not set  
**Lines**: `app/api/scan/route.ts:209-215`  
**Fix Strategy**: 
1. Add feature flag check before env var check
2. If `FF_N8N_NOOP === true`, skip to local processing
3. Return mock success response

**NOOP Implementation**:
```typescript
// BEFORE:
const webhookUrl = process.env.N8N_WEBHOOK_FREE_SCAN;
if (!webhookUrl) {
  console.error('N8N_WEBHOOK_FREE_SCAN environment variable not configured');
  return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
}

// AFTER (with feature flag):
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

const webhookUrl = process.env.N8N_WEBHOOK_FREE_SCAN;
if (!webhookUrl || FEATURE_FLAGS.FF_N8N_NOOP) {
  // MMM: n8n noop shim. Replace with AgentKit or queues later.
  console.log('[NOOP] Skipping n8n free scan webhook (FF_N8N_NOOP=true)');
  return NextResponse.json({
    ok: true,
    message: 'Scan queued for processing',
    scanId: `noop_${Date.now()}`,
    timestamp: new Date().toISOString()
  });
}
```

---

### 🔴 Priority 2: Supabase `post-payment-automation`
**Why Critical**: Runs after every payment  
**Current Blocking**: Semi (logs error but continues)  
**Lines**: `supabase/functions/post-payment-automation/index.ts:89-96`  
**Fix Strategy**: 
1. Check feature flag before n8n calls
2. If enabled, log and skip
3. Still update Supabase tables (payment, subscriptions)

**NOOP Implementation**:
```typescript
// BEFORE:
const n8nResponse = await fetch(`${n8nWebhookUrl}/payment-completed`, { ... });
if (!n8nResponse.ok) {
  console.error('Failed to trigger n8n workflow:', await n8nResponse.text());
}

// AFTER:
const FF_N8N_NOOP = Deno.env.get('FF_N8N_NOOP') === 'true';

if (FF_N8N_NOOP) {
  // MMM: n8n noop shim. Replace with AgentKit or queues later.
  console.log('[NOOP] Skipping n8n payment webhook (FF_N8N_NOOP=true)');
  const n8nResponse = { ok: true }; // Mock success
} else {
  const n8nResponse = await fetch(`${n8nWebhookUrl}/payment-completed`, { ... });
}

// Rest of code uses n8nResponse.ok, so it works with mock
```

---

### 🟡 Priority 3: `/auth/callback` (Sign-in/Sign-up)
**Why High Priority**: Every user hits this on login  
**Current Blocking**: No (already graceful)  
**Lines**: `lib/webhooks/n8nWebhooks.ts:50-52`  
**Fix Strategy**: Early return if feature flag enabled

**NOOP Implementation**:
```typescript
// BEFORE:
async function fireWebhook(webhookPath: string, payload: WebhookPayload, retries = 2) {
  if (!N8N_WEBHOOK_BASE) {
    console.warn('[N8N Webhook] Base URL not configured, skipping webhook');
    return { success: false, error: 'N8N webhook base URL not configured' };
  }
  // ... actual webhook call
}

// AFTER:
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

async function fireWebhook(webhookPath: string, payload: WebhookPayload, retries = 2) {
  if (FEATURE_FLAGS.FF_N8N_NOOP) {
    // MMM: n8n noop shim. Replace with AgentKit or queues later.
    console.log('[NOOP] Skipping n8n webhook:', webhookPath, '(FF_N8N_NOOP=true)');
    return { success: true, executionId: `noop_${Date.now()}` };
  }
  
  if (!N8N_WEBHOOK_BASE) {
    console.warn('[N8N Webhook] Base URL not configured, skipping webhook');
    return { success: false, error: 'N8N webhook base URL not configured' };
  }
  // ... actual webhook call
}
```

---

## Non-Critical Routes (Best-Effort)

These routes already handle n8n failure gracefully. Feature flag recommended to reduce log noise.

| Route | Current Behavior | Needs Fix? |
|-------|------------------|------------|
| POST /api/onboarding/business | try/catch, always returns success | ✅ Add FF check |
| POST /api/scans/business | try/catch, always returns success | ✅ Add FF check |
| POST /api/agents/*/launch | Fire-and-forget, logs to DB | ✅ Add FF check |
| POST /api/percy/scan | try/catch, scan succeeds | ✅ Add FF check |
| POST /api/stripe/webhook | try/catch within try/catch | ✅ Add FF check |

---

## Testing Strategy

### Test 1: Free Scan with n8n NOOP
```bash
# Enable NOOP flag
export FF_N8N_NOOP=true

# Test free scan (should succeed even if N8N_WEBHOOK_FREE_SCAN not set)
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"input": "Test scan", "type": "free-scan"}'

# Expected: 200 OK with mock response
# Logs should show: "[NOOP] Skipping n8n free scan webhook"
```

### Test 2: Sign-In with n8n NOOP
```bash
# Enable NOOP flag
export FF_N8N_NOOP=true

# Sign in (via browser or API)
# Expected: Auth succeeds, no webhook errors in logs
# Logs should show: "[NOOP] Skipping n8n webhook: skrbl-signin"
```

### Test 3: Stripe Checkout with n8n NOOP
```bash
# Enable NOOP flag in Supabase Function
# Set: FF_N8N_NOOP=true in Supabase Dashboard → Edge Functions → Secrets

# Complete a test payment
# Expected: Payment succeeds, subscription activated, no webhook errors
# Logs should show: "[NOOP] Skipping n8n payment webhook"
```

---

## Acceptance Criteria

✅ **AC1**: `/sign-in` and `/auth/callback` succeed even if n8n is down  
✅ **AC2**: `POST /api/scan` returns 200 even if `N8N_WEBHOOK_FREE_SCAN` not set  
✅ **AC3**: Stripe payment succeeds and records subscription even if n8n unreachable  
✅ **AC4**: No network calls to n8n domains when `FF_N8N_NOOP=true`  
✅ **AC5**: All NOOP logs include comment: `MMM: n8n noop shim. Replace with AgentKit or queues later.`  

---

## Rollback Plan

If NOOP breaks something:
1. Set `FF_N8N_NOOP=false` in env
2. Restart Next.js server
3. For Supabase Function: Update secret in dashboard, function auto-reloads

No code changes needed to revert.

---

**End of N8N Route Impact Map**
