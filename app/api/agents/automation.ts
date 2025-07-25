import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowIdForAgentTask } from '../../../utils/agentAutomation';
import { triggerN8nWorkflow } from '../../../lib/n8nClient';
import { systemLog } from '../../../utils/systemLog';
import { createClient } from '@supabase/supabase-js';
import agentRegistry from '../../../lib/agents/agentRegistry';
import { runAgentWorkflow } from '../../../lib/agents/runAgentWorkflow';
import { checkFeatureAccess, getUserLimits, PREMIUM_FEATURES, checkPremiumAccess } from '../../../lib/premiumGating';
import { workflowQueue, getWorkflowTemplate } from '../../../lib/automation/workflowQueue';
import { getErrorMessage } from '../../../utils/errorHandling';

// --- Simple in-memory rate limiter (per IP) ---
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    entry = { count: 1, reset: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count++;
  return false;
}

// Add usage tracking (simple in-memory for now, could be Redis/database)
const usageTracker = new Map<string, { daily: number, monthly: number, lastReset: Date }>();

function checkUsageLimits(userId: string, userRole: string): { allowed: boolean; reason?: string } {
  const limits = getUserLimits(userRole);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let userUsage = usageTracker.get(userId);
  if (!userUsage || userUsage.lastReset < today) {
    userUsage = { daily: 0, monthly: 0, lastReset: today };
    usageTracker.set(userId, userUsage);
  }
  
  // Check daily limit
  if (limits.dailyAutomations !== -1 && userUsage.daily >= limits.dailyAutomations) {
    return {
      allowed: false,
      reason: `Daily automation limit reached (${limits.dailyAutomations}). Upgrade to Pro for unlimited usage.`
    };
  }
  
  return { allowed: true };
}

function incrementUsage(userId: string): void {
  const userUsage = usageTracker.get(userId);
  if (userUsage) {
    userUsage.daily++;
    userUsage.monthly++;
  }
}

/**
 * POST /api/agents/automation
 * Triggers agent automation (n8n/webhook or internal workflow)
 * Body: { agentId: string, task: string, payload: object, featureType?: string, useQueue?: boolean, workflowTemplate?: string }
 * Returns: { success: boolean, result: string, status: string }
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    await systemLog({ type: 'warning', message: 'Rate limit exceeded on /api/agents/automation', meta: { ip } });
    return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  try {
    const { agentId, task, payload, featureType, useQueue = true, workflowTemplate } = await req.json();
    if (!agentId || !task) {
      return NextResponse.json({ success: false, error: 'Missing agentId or task' }, { status: 400 });
    }
    // --- Fetch user and role for premium gating ---
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      await systemLog({ type: 'warning', message: 'Unauthorized automation attempt', meta: { ip } });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
    const userRole = userRoleData?.role || 'client';

    // Check usage limits first
    const usageCheck = checkUsageLimits(user.id, userRole);
    if (!usageCheck.allowed) {
      await systemLog({ 
        type: 'warning', 
        message: 'Usage limit exceeded', 
        meta: { agentId, userId: user.id, userRole, reason: usageCheck.reason } 
      });
      return NextResponse.json({ 
        success: false, 
        error: usageCheck.reason,
        upgradeRequired: userRole === 'client' ? 'pro' : 'enterprise'
      }, { status: 403 });
    }

    // Check premium feature access
    if (featureType) {
      const accessCheck = checkFeatureAccess(userRole, featureType);
      if (!accessCheck.allowed) {
        await systemLog({ 
          type: 'warning', 
          message: 'Premium feature access denied', 
          meta: { agentId, featureType, userId: user.id, userRole } 
        });
        return NextResponse.json({ 
          success: false, 
          error: accessCheck.reason,
          upgradeRequired: accessCheck.upgradeRequired,
          feature: accessCheck.feature
        }, { status: 403 });
      }
    }

    // NEW: Handle workflow templates
    if (workflowTemplate) {
      const template = getWorkflowTemplate(workflowTemplate);
      if (!template) {
        return NextResponse.json({ success: false, error: 'Workflow template not found' }, { status: 404 });
      }

      // Check template access
      if (template.requiredRole && !checkPremiumAccess(userRole, 'advanced-automation')) {
        return NextResponse.json({ 
          success: false, 
          error: `Workflow template requires ${template.requiredRole} subscription`,
          upgradeRequired: template.requiredRole 
        }, { status: 403 });
      }

      // Queue the template workflow
      const jobId = await workflowQueue.addJob(
        template.agentId, 
        'workflow_template', 
        { ...payload, template }, 
        user.id, 
        userRole,
        { 
          priority: userRole === 'enterprise' ? 'high' : 'normal',
          featureType: 'advanced-automation'
        }
      );

      incrementUsage(user.id);
      await systemLog({ type: 'info', message: 'Workflow template queued', meta: { templateId: workflowTemplate, jobId, userId: user.id } });
      
      return NextResponse.json({ 
        success: true, 
        jobId,
        template: template.name,
        estimatedCompletion: new Date(Date.now() + template.estimatedDuration * 60000).toISOString(),
        status: 'queued'
      });
    }

    // NEW: Queue-based execution for better reliability
    if (useQueue) {
      const priority = userRole === 'enterprise' ? 'high' : 
                     userRole === 'pro' ? 'normal' : 'low';

      const jobId = await workflowQueue.addJob(
        agentId, 
        task, 
        payload, 
        user.id, 
        userRole,
        { priority, featureType }
      );

      incrementUsage(user.id);
      await systemLog({ type: 'info', message: 'Agent automation queued', meta: { agentId, task, jobId, userId: user.id } });
      
      return NextResponse.json({ 
        success: true, 
        jobId,
        status: 'queued',
        message: 'Automation job queued successfully'
      });
    }

    // FALLBACK: Direct execution (existing code)
    const result = await runAgentWorkflow(agentId, { ...payload, task }, userRole);
    
    if (result.status === 'success') {
      incrementUsage(user.id);
    }

    await systemLog({ type: 'info', message: 'Agent automation executed directly', meta: { agentId, task, userId: user.id } });
    return NextResponse.json({ success: true, result: result.result, status: result.status });
    
  } catch (error) {
    await systemLog({ type: 'error', message: 'Automation API error', meta: { error: getErrorMessage(error) } });
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

// NEW: Add job status endpoint
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
  }

  try {
    const job = await workflowQueue.getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify user owns this job
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user || job.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.status === 'completed' ? 100 : 
               job.status === 'running' ? 50 : 
               job.status === 'failed' ? 0 : 10,
      result: job.result,
      error: job.error,
      attempts: job.attempts,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 