# N8N Usage Map - Complete Inventory

**Generated**: 2025-10-16  
**Purpose**: Document every n8n HTTP call, environment variable, and integration point in SKRBL AI

---

## Executive Summary

**Total n8n Integration Points Found**: 12 active code paths  
**Critical Paths (block user flow)**: 3  
**Best-Effort Paths (non-blocking)**: 7  
**Fire-and-Forget Paths**: 2  

**Environment Variables Required**:
- `N8N_WEBHOOK_BASE_URL` / `N8N_BASE_URL`
- `N8N_API_KEY`
- `N8N_WEBHOOK_FREE_SCAN`
- `N8N_BUSINESS_ONBOARDING_URL`
- `N8N_BUSINESS_SCAN_URL`
- `N8N_AGENT_LAUNCH_WEBHOOK_URL`
- `N8N_STRIPE_WEBHOOK_URL`
- Various workflow-specific env vars (N8N_WORKFLOW_*)

---

## 1. CRITICAL PATH: Supabase Post-Payment Automation

**File**: `supabase/functions/post-payment-automation/index.ts`  
**Lines**: 7-8, 76-101, 143-159  
**When it runs**: Immediately after successful Stripe payment  
**Blocking**: Semi-blocking (logs error but doesn't fail function)

### Code Snippet
```typescript
const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_BASE_URL')!
const n8nApiKey = Deno.env.get('N8N_API_KEY')!

// Line 89-96: Main payment webhook
const n8nResponse = await fetch(`${n8nWebhookUrl}/payment-completed`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': n8nApiKey
  },
  body: JSON.stringify(n8nPayload)
})

if (!n8nResponse.ok) {
  console.error('Failed to trigger n8n workflow:', await n8nResponse.text())
  // Don't fail the function for n8n errors, but log them
}

// Line 147-154: Schedule follow-up tasks
if (n8nResponse.ok) {
  for (const task of followUpTasks) {
    await fetch(`${n8nWebhookUrl}/schedule-task`, { /* ... */ })
  }
}
```

### Failure Mode
- **If 404/timeout**: Payment still succeeds, but no email sequences or follow-ups triggered
- **User Impact**: Customer receives payment confirmation but misses onboarding emails
- **Data Loss**: No record in n8n of payment event

---

## 2. CRITICAL PATH: Auth Webhook (Sign-in/Sign-up)

**File**: `lib/webhooks/n8nWebhooks.ts`  
**Lines**: 39-111, 150-178  
**When it runs**: On every user signup and signin via auth callbacks  
**Blocking**: Non-blocking (logs error and returns failure, but doesn't block auth)

### Code Snippet
```typescript
const N8N_WEBHOOK_BASE = process.env.N8N_WEBHOOK_BASE_URL || process.env.N8N_BASE_URL;

async function fireWebhook(webhookPath: string, payload: WebhookPayload, retries = 2) {
  if (!N8N_WEBHOOK_BASE) {
    console.warn('[N8N Webhook] Base URL not configured, skipping webhook');
    return { success: false, error: 'N8N webhook base URL not configured' };
  }

  const webhookUrl = `${N8N_WEBHOOK_BASE}/webhook/${webhookPath}`;
  
  // Retries with exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'SKRBL-AI-Webhook/1.0' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
  }
}

// Three webhook types:
export async function fireSignupWebhook(...)  // webhook path: 'skrbl-signup'
export async function fireSigninWebhook(...)  // webhook path: 'skrbl-signin'
export async function fireAgentLaunchWebhook(...) // webhook path: 'skrbl-agent-launch'
```

### Failure Mode
- **If 404/timeout**: Auth succeeds, but n8n workflows don't track user activity
- **User Impact**: No automated onboarding emails, analytics miss the event
- **Data Loss**: `webhook_errors` table logs the failure

---

## 3. CRITICAL PATH: Free Scan Endpoint

**File**: `app/api/scan/route.ts`  
**Lines**: 209-235  
**When it runs**: When user submits a free sports/skill scan  
**Blocking**: **YES - Returns 503 if N8N_WEBHOOK_FREE_SCAN not configured**

### Code Snippet
```typescript
const webhookUrl = process.env.N8N_WEBHOOK_FREE_SCAN;
if (!webhookUrl) {
  console.error('N8N_WEBHOOK_FREE_SCAN environment variable not configured');
  return NextResponse.json(
    { error: 'Service temporarily unavailable' }, 
    { status: 503 }
  );
}

// Forward request to n8n
const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.N8N_API_KEY ? `Bearer ${process.env.N8N_API_KEY}` : ''
  },
  body: JSON.stringify(forwardedBody),
  signal: AbortSignal.timeout(30000) // 30s timeout
});
```

### Failure Mode
- **If not configured**: Route returns 503, free scan feature completely broken
- **If timeout**: User waits 30s then sees error
- **User Impact**: **CRITICAL** - First-time users cannot try the product

---

## 4. BEST-EFFORT: Business Onboarding Webhook

**File**: `app/api/onboarding/business/route.ts`  
**Lines**: 32-66  
**When it runs**: After business onboarding wizard submission  
**Blocking**: Non-blocking (try/catch, always returns success to user)

### Code Snippet
```typescript
try {
  const n8nUrl = process.env.N8N_BUSINESS_ONBOARDING_URL;
  if (n8nUrl) {
    const response = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nPayload),
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
  }
} catch (error) {
  console.warn("[Business Onboarding] N8N webhook error (non-blocking):", error);
  // Don't throw - this is best-effort
}

// Always return success to user
return NextResponse.json({ ok: true, ... });
```

### Failure Mode
- **If 404/timeout**: Onboarding flow succeeds, but no lead notification
- **User Impact**: None (UX unaffected)
- **Data Loss**: Business lead not tracked in n8n

---

## 5. BEST-EFFORT: Business Scan Webhook

**File**: `app/api/scans/business/route.ts`  
**Lines**: 35-53  
**When it runs**: After quick business scan submission  
**Blocking**: Non-blocking (best-effort try/catch)

### Code Snippet
```typescript
try {
  const url = process.env.N8N_BUSINESS_SCAN_URL;
  if (url) {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "business_scan_started", ... })
    });
  }
} catch (e) {
  console.error("n8n_forward_failed", e);
}

return NextResponse.json({ ok: true, quickWins, ... });
```

### Failure Mode
- **If 404/timeout**: Scan completes, quick wins shown, no notification
- **User Impact**: None
- **Data Loss**: Scan event not tracked in n8n

---

## 6. FIRE-AND-FORGET: Agent Launch Webhook

**File**: `app/api/agents/[agentId]/launch/route.ts`  
**Lines**: 78-102  
**When it runs**: After successful agent workflow execution  
**Blocking**: Fire-and-forget (doesn't await result)

### Code Snippet
```typescript
const N8N_WEBHOOK_URL = process.env.N8N_AGENT_LAUNCH_WEBHOOK_URL;
if (result.status === 'success' && N8N_WEBHOOK_URL) {
  // Fire-and-forget the webhook
  fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload),
  }).catch(async (error) => {
    console.error('n8n webhook trigger failed:', error);
    await supabase.from('agent_launches').update({ 
      status: 'webhook_failed', 
      error_message: 'n8n trigger failed: ' + error.message 
    }).eq('id', launchId);
  });
}
```

### Failure Mode
- **If 404/timeout**: Agent launch succeeds, webhook failure logged to DB
- **User Impact**: None (UX unaffected)
- **Data Loss**: n8n doesn't receive agent launch event

---

## 7. OPTIONAL: Percy Scan N8N Trigger

**File**: `app/api/percy/scan/route.ts`  
**Lines**: 580-607  
**When it runs**: After successful Percy business scan  
**Blocking**: Non-blocking (try/catch, doesn't affect scan result)

### Code Snippet
```typescript
async function triggerN8nBusinessScan(scanData: any) {
  if (!process.env.N8N_BASE_URL) {
    throw new Error('N8N not configured');
  }

  const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/business-scan-analysis`;
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_API_KEY || ''}`
    },
    body: JSON.stringify({ ...scanData, source: 'percy_scan_api' })
  });
}

// Called with try/catch:
try {
  await triggerN8nBusinessScan({ scanId, type, url, analysis, userId, agentRecommendations });
} catch (n8nError) {
  console.warn('[Percy Scan] N8N business scan workflow failed:', n8nError);
  // Don't fail the request if N8N fails
}
```

### Failure Mode
- **If 404/timeout**: Scan completes normally, no n8n notification
- **User Impact**: None
- **Data Loss**: Scan not tracked in n8n workflow

---

## 8. OPTIONAL: Stripe Webhook Forward

**File**: `app/api/stripe/webhook/route.ts`  
**Lines**: 152-169  
**When it runs**: After SkillSmith purchase recorded in Supabase  
**Blocking**: Non-blocking (try/catch within try/catch)

### Code Snippet
```typescript
// optional: forward to n8n
if (process.env.N8N_STRIPE_WEBHOOK_URL) {
  try {
    const r = await fetch(process.env.N8N_STRIPE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'skillsmith_purchase',
        session,
        order: orderData,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!r.ok) console.warn('N8N webhook failed:', r.status, r.statusText);
  } catch (e) {
    console.warn('Error forwarding to n8n:', e);
  }
}
```

### Failure Mode
- **If 404/timeout**: Stripe webhook succeeds, payment recorded, no n8n notification
- **User Impact**: None
- **Data Loss**: Purchase event not in n8n

---

## 9. N8N Email Automation

**File**: `lib/email/n8nIntegration.ts`  
**Lines**: 23-87  
**When it runs**: When email sequences are triggered  
**Blocking**: Non-blocking (returns error object)

### Code Snippet
```typescript
function getN8nBase(): string {
  const raw = (process.env.N8N_WEBHOOK_BASE_URL || process.env.N8N_BASE_URL || '').trim();
  return raw.replace(/\/+$/, '').replace(/\/webhook$/i, '');
}

export class N8nEmailAutomation {
  private workflows: N8nWorkflow[] = [
    {
      id: 'welcome-sequence',
      webhookUrl: `${getN8nBase()}/webhook/welcome-sequence`,
      active: true
    },
    {
      id: 'upgrade-nurture',
      webhookUrl: `${getN8nBase()}/webhook/upgrade-nurture`,
      active: true
    }
  ];

  async triggerEmailSequence(sequenceId: string, payload: EmailTriggerPayload) {
    const workflow = this.workflows.find(w => w.id === sequenceId);
    if (!workflow?.active || !getN8nBase()) {
      return { success: false, error: 'N8N base URL not configured' };
    }

    const response = await fetch(workflow.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000) // 15s timeout
    });
  }
}
```

### Failure Mode
- **If 404/timeout**: Email sequence doesn't trigger, returns error
- **User Impact**: Depends on caller - if critical, caller should handle
- **Data Loss**: Email event not tracked

---

## 10. N8N Generic Client

**File**: `lib/n8nClient.ts`  
**Lines**: 3-4, 109-215  
**When it runs**: When triggerN8nWorkflow() is called  
**Blocking**: Non-blocking (returns error result)

### Code Snippet
```typescript
const N8N_API_BASE_URL = process.env.N8N_API_BASE_URL || '';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

export async function triggerN8nWorkflow(workflowId: string, payload: Record<string, any>) {
  if (!N8N_API_BASE_URL) {
    console.warn('[n8nClient] N8N_API_BASE_URL not set. Using mock/fallback.');
    return { 
      success: false, 
      message: 'n8n not connected (mock mode)',
      status: 'error'
    };
  }

  const response = await n8nClient.post(`/webhook/${workflowId}`, enhancedPayload);
  // ... quota tracking, error handling
}
```

### Failure Mode
- **If not configured**: Returns mock error, caller must handle
- **User Impact**: Depends on caller
- **Data Loss**: Workflow not executed

---

## 11. Agent Automation Workflow Mapper

**File**: `utils/agentAutomation.ts`  
**Lines**: 2-14  
**When it runs**: Helper function to map agent tasks to n8n workflow IDs  
**Blocking**: N/A (utility function)

### Code Snippet
```typescript
export function getWorkflowIdForAgentTask(agentId: string, task: string): string | undefined {
  const envKey = `N8N_WORKFLOW_${agentId.toUpperCase()}_${task.toUpperCase()}`;
  if (process.env[envKey]) return process.env[envKey] as string;
  
  const map: Record<string, string> = {
    'publishing:publish': process.env.N8N_WORKFLOW_PUBLISH_BOOK || '',
    'proposal:send_proposal': process.env.N8N_WORKFLOW_SEND_PROPOSAL || '',
    'percy:sync_content': process.env.N8N_WORKFLOW_SYNC_CONTENT || '',
    'onboarding-agent:onboard': process.env.N8N_WORKFLOW_ONBOARD_USER || '',
  };
  return map[`${agentId}:${task}`] || undefined;
}
```

### Failure Mode
- **If not configured**: Returns undefined, caller must handle
- **User Impact**: Agent task cannot trigger n8n workflow
- **Data Loss**: Workflow not executed

---

## 12. Backend Health Checker

**File**: `lib/maintenance/BackendHealthChecker.ts`  
**Lines**: 302-387  
**When it runs**: During health check scans  
**Blocking**: Non-blocking (logs warnings)

### Code Snippet
```typescript
private async checkN8NConnections(): Promise<HealthCheckResult> {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nUrl) {
    issues.push({
      severity: 'medium',
      category: 'functionality',
      description: 'N8N webhook URL not configured',
      impact: 'Agent workflows cannot be triggered',
      resolution: 'Configure N8N_WEBHOOK_URL environment variable',
      autoFixable: false,
      estimatedFixTime: 10
    });
  } else {
    const response = await fetch(`${n8nUrl}/health`, { method: 'GET', signal: controller.signal });
    // ... health check logic
  }
}
```

### Failure Mode
- **If 404/timeout**: Health check reports n8n as unhealthy
- **User Impact**: None (monitoring only)
- **Data Loss**: None

---

## Summary: Critical Paths That MUST Be Neutralized

| File | Route/Function | Blocking? | Priority | Runs During |
|------|----------------|-----------|----------|-------------|
| `app/api/scan/route.ts` | POST /api/scan | **YES (503)** | 🔴 CRITICAL | Free scan (first-time user) |
| `supabase/functions/post-payment-automation/index.ts` | Supabase Function | Semi | 🔴 CRITICAL | Stripe payment success |
| `lib/webhooks/n8nWebhooks.ts` | fireSignupWebhook, fireSigninWebhook | No (logs error) | 🟡 HIGH | Auth callback |
| `app/api/onboarding/business/route.ts` | POST /api/onboarding/business | No | 🟢 LOW | Business wizard |
| `app/api/scans/business/route.ts` | POST /api/scans/business | No | 🟢 LOW | Business scan |
| `app/api/agents/[agentId]/launch/route.ts` | POST /api/agents/*/launch | No (fire-forget) | 🟢 LOW | Agent launch |
| `app/api/percy/scan/route.ts` | triggerN8nBusinessScan | No (try/catch) | 🟢 LOW | Percy scan |
| `app/api/stripe/webhook/route.ts` | Stripe webhook handler | No (optional) | 🟢 LOW | Stripe webhook |

---

## Recommended Action Plan

1. **Add Feature Flag**: `FF_N8N_NOOP` (default: `true` for safety)
2. **Neutralize Critical Paths**:
   - `/api/scan` → Return mock success immediately
   - `post-payment-automation` → Log and continue
   - Auth webhooks → Log and continue (already graceful)
3. **Add NOOP Wrappers**:
   - `lib/n8n/noopWrapper.ts` → Intercepts all n8n calls
   - Logs attempt, returns `{ok: true}` immediately
4. **Optional**: Create `/api/v2/n8n/*` routes that return success (for testing)

---

**End of N8N Usage Map**
