import axios from 'axios';

const N8N_API_BASE_URL = process.env.N8N_API_BASE_URL || '';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

const n8nClient = axios.create({
  baseURL: N8N_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY }),
  },
});

export interface N8nWorkflowResult {
  success: boolean;
  executionId?: string;
  status?: 'running' | 'success' | 'error' | 'waiting' | 'queued';
  data?: any;
  error?: string;
  message?: string;
  quotaStatus?: {
    used: number;
    limit: number;
    remaining: number;
    resetDate?: string;
  };
}

interface N8nQuotaStatus {
  dailyExecutions: number;
  monthlyExecutions: number;
  dailyLimit: number;
  monthlyLimit: number;
  concurrentLimit: number;
  currentConcurrent: number;
  resetDate: string;
}

// In-memory tracking for execution quotas (should be replaced with Redis in production)
let quotaCache: N8nQuotaStatus = {
  dailyExecutions: 0,
  monthlyExecutions: 0,
  dailyLimit: parseInt(process.env.N8N_DAILY_LIMIT || '1000'),
  monthlyLimit: parseInt(process.env.N8N_MONTHLY_LIMIT || '10000'),
  concurrentLimit: parseInt(process.env.N8N_CONCURRENT_LIMIT || '5'),
  currentConcurrent: 0,
  resetDate: new Date().toISOString()
};

// Track active executions for concurrency limits
const activeExecutions = new Set<string>();

/**
 * Check if we can execute a workflow based on quota limits
 */
export async function checkWorkflowQuota(): Promise<{ allowed: boolean; reason?: string; quotaStatus: N8nQuotaStatus }> {
  // Reset daily counter if needed
  const now = new Date();
  const resetDate = new Date(quotaCache.resetDate);
  if (now.getDate() !== resetDate.getDate()) {
    quotaCache.dailyExecutions = 0;
    quotaCache.resetDate = now.toISOString();
  }

  // Reset monthly counter if needed
  if (now.getMonth() !== resetDate.getMonth()) {
    quotaCache.monthlyExecutions = 0;
  }

  // Check concurrent executions
  quotaCache.currentConcurrent = activeExecutions.size;

  // Check all limits
  if (quotaCache.currentConcurrent >= quotaCache.concurrentLimit) {
    return {
      allowed: false,
      reason: `Concurrent execution limit reached (${quotaCache.concurrentLimit})`,
      quotaStatus: quotaCache
    };
  }

  if (quotaCache.dailyExecutions >= quotaCache.dailyLimit) {
    return {
      allowed: false,
      reason: `Daily execution limit reached (${quotaCache.dailyLimit})`,
      quotaStatus: quotaCache
    };
  }

  if (quotaCache.monthlyExecutions >= quotaCache.monthlyLimit) {
    return {
      allowed: false,
      reason: `Monthly execution limit reached (${quotaCache.monthlyLimit})`,
      quotaStatus: quotaCache
    };
  }

  return { allowed: true, quotaStatus: quotaCache };
}

/**
 * Get current quota status for monitoring
 */
export function getQuotaStatus(): N8nQuotaStatus {
  return { ...quotaCache, currentConcurrent: activeExecutions.size };
}

export async function triggerN8nWorkflow(workflowId: string, payload: Record<string, any>): Promise<N8nWorkflowResult> {
  // MMM: n8n noop shim - protects against n8n downtime
  const FF_N8N_NOOP = process.env.FF_N8N_NOOP === 'true' || process.env.FF_N8N_NOOP === '1';
  
  if (FF_N8N_NOOP) {
    console.log(`[NOOP] Skipping n8n workflow: ${workflowId} (FF_N8N_NOOP=true)`);
    return {
      success: true,
      message: 'n8n noop mode active',
      status: 'success',
      executionId: `noop_${Date.now()}_${workflowId}_${Math.random().toString(36).substr(2, 6)}`
    };
  }

  // Check quota before execution
  const quotaCheck = await checkWorkflowQuota();
  if (!quotaCheck.allowed) {
    console.warn('[n8nClient] Quota limit reached:', quotaCheck.reason);
    return {
      success: false,
      message: quotaCheck.reason || 'Quota limit reached',
      status: 'error',
      quotaStatus: {
        used: quotaCheck.quotaStatus.dailyExecutions,
        limit: quotaCheck.quotaStatus.dailyLimit,
        remaining: quotaCheck.quotaStatus.dailyLimit - quotaCheck.quotaStatus.dailyExecutions,
        resetDate: quotaCheck.quotaStatus.resetDate
      }
    };
  }

  if (!N8N_API_BASE_URL) {
    console.warn('[n8nClient] N8N_API_BASE_URL not set. Using mock/fallback.');
    return { 
      success: false, 
      message: 'n8n not connected (mock mode)',
      status: 'error'
    };
  }

  const executionId = `exec_${Date.now()}_${workflowId}_${Math.random().toString(36).substr(2, 6)}`;
  activeExecutions.add(executionId);

  try {
    // Enhanced payload with tracking data and execution metadata
    const enhancedPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
      platform: 'skrbl-ai',
      version: '2.0.0',
      executionId,
      quotaInfo: {
        dailyUsage: quotaCache.dailyExecutions + 1,
        monthlyUsage: quotaCache.monthlyExecutions + 1,
        concurrentCount: activeExecutions.size
      }
    };

    const response = await n8nClient.post(`/webhook/${workflowId}`, enhancedPayload);
    const responseData = response.data as any;
    
    // Update quota counters
    quotaCache.dailyExecutions++;
    quotaCache.monthlyExecutions++;
    
    console.log('[n8nClient] Workflow triggered successfully:', {
      workflowId,
      status: response.status,
      executionId,
      quotaUsed: `${quotaCache.dailyExecutions}/${quotaCache.dailyLimit} daily`
    });

    // Schedule execution cleanup (remove from active set after timeout)
    setTimeout(() => {
      activeExecutions.delete(executionId);
    }, 300000); // 5 minutes timeout

    return {
      success: true,
      executionId,
      status: responseData?.status || 'running',
      data: response.data,
      quotaStatus: {
        used: quotaCache.dailyExecutions,
        limit: quotaCache.dailyLimit,
        remaining: quotaCache.dailyLimit - quotaCache.dailyExecutions,
        resetDate: quotaCache.resetDate
      }
    };

  } catch (error: any) {
    // Remove from active executions on error
    activeExecutions.delete(executionId);
    
    const errorMessage = error?.response?.data?.message || error.message;
    const errorStatus = error?.response?.status;
    
    console.error('[n8nClient] Workflow trigger failed:', {
      workflowId,
      executionId,
      error: errorMessage,
      status: errorStatus,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: errorMessage,
      status: 'error',
      message: `N8N workflow ${workflowId} failed: ${errorMessage}`,
      executionId,
      quotaStatus: {
        used: quotaCache.dailyExecutions,
        limit: quotaCache.dailyLimit,
        remaining: quotaCache.dailyLimit - quotaCache.dailyExecutions,
        resetDate: quotaCache.resetDate
      }
    };
  }
}

export async function getWorkflowStatus(executionId: string): Promise<N8nWorkflowResult> {
  if (!N8N_API_BASE_URL) {
    return { 
      success: false, 
      message: 'n8n not connected (mock mode)',
      status: 'error'
    };
  }

  try {
    const response = await n8nClient.get(`/executions/${executionId}`);
    const responseData = response.data as any;
    
    // Mark execution as completed if finished
    if (responseData?.finished) {
      activeExecutions.delete(executionId);
    }
    
    return {
      success: true,
      executionId,
      status: responseData?.finished ? 'success' : 'running',
      data: response.data
    };

  } catch (error: any) {
    console.error('[n8nClient] Status check failed:', error?.response?.data || error.message);
    // Remove from active executions on error
    activeExecutions.delete(executionId);
    
    return {
      success: false,
      error: error?.response?.data || error.message,
      status: 'error'
    };
  }
}

export default n8nClient; 