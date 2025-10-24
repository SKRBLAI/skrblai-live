/**
 * Activity Logger
 * Real-time activity tracking for agent launches and workflow executions
 * Populates tables consumed by the live-feed SSE endpoint
 */

import { createClient } from '@/lib/supabase/server';

export interface AgentLaunchParams {
  agentId: string;
  agentName: string;
  userId: string;
  source?: 'dashboard' | 'percy' | 'api' | 'skillsmith';
  metadata?: Record<string, any>;
}

export interface AgentCompleteParams {
  launchId: string;
  status: 'success' | 'failed';
  result?: Record<string, any>;
  errorMessage?: string;
}

export interface WorkflowExecutionParams {
  executionId: string;
  workflowId: string;
  workflowName: string;
  agentId: string;
  userId: string;
  chained?: boolean;
  triggerData?: Record<string, any>;
}

export interface WorkflowCompleteParams {
  executionId: string;
  status: 'success' | 'failed';
  resultData?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Log agent launch to activity feed
 * Returns the launch ID for tracking completion
 */
export async function logAgentLaunch(params: AgentLaunchParams): Promise<string | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('agent_launches')
      .insert({
        agent_id: params.agentId,
        agent_name: params.agentName,
        user_id: params.userId,
        source: params.source || 'dashboard',
        status: 'running',
        metadata: params.metadata || {},
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Activity Logger] Failed to log agent launch:', error);
      return null;
    }

    console.log(`[Activity Logger] Agent launch logged: ${params.agentId} (${data.id})`);
    return data.id;
  } catch (error) {
    console.error('[Activity Logger] Exception logging agent launch:', error);
    return null;
  }
}

/**
 * Complete agent launch with result or error
 */
export async function logAgentComplete(params: AgentCompleteParams): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('agent_launches')
      .update({
        status: params.status,
        result: params.result || null,
        error_message: params.errorMessage || null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.launchId);

    if (error) {
      console.error('[Activity Logger] Failed to complete agent launch:', error);
      return false;
    }

    console.log(`[Activity Logger] Agent launch completed: ${params.launchId} (${params.status})`);
    return true;
  } catch (error) {
    console.error('[Activity Logger] Exception completing agent launch:', error);
    return false;
  }
}

/**
 * Log N8N workflow execution
 */
export async function logWorkflowExecution(params: WorkflowExecutionParams): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('n8n_executions')
      .insert({
        execution_id: params.executionId,
        workflow_id: params.workflowId,
        workflow_name: params.workflowName,
        agent_id: params.agentId,
        user_id: params.userId,
        status: 'running',
        chained: params.chained || false,
        trigger_data: params.triggerData || null,
        started_at: new Date().toISOString()
      });

    if (error) {
      console.error('[Activity Logger] Failed to log workflow execution:', error);
      return false;
    }

    console.log(`[Activity Logger] Workflow execution logged: ${params.executionId}`);
    return true;
  } catch (error) {
    console.error('[Activity Logger] Exception logging workflow execution:', error);
    return false;
  }
}

/**
 * Complete workflow execution
 */
export async function logWorkflowComplete(params: WorkflowCompleteParams): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('n8n_executions')
      .update({
        status: params.status,
        result_data: params.resultData || null,
        error_message: params.errorMessage || null,
        completed_at: new Date().toISOString()
      })
      .eq('execution_id', params.executionId);

    if (error) {
      console.error('[Activity Logger] Failed to complete workflow execution:', error);
      return false;
    }

    console.log(`[Activity Logger] Workflow execution completed: ${params.executionId} (${params.status})`);
    return true;
  } catch (error) {
    console.error('[Activity Logger] Exception completing workflow execution:', error);
    return false;
  }
}

/**
 * Log system health event
 */
export async function logSystemHealth(
  status: 'healthy' | 'degraded' | 'critical' | 'unknown',
  score: number,
  criticalIssues: string[] = [],
  warnings: string[] = [],
  componentStatuses: Record<string, any> = {}
): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('system_health_logs')
      .insert({
        overall_status: status,
        overall_score: score,
        critical_issues: criticalIssues,
        warnings: warnings,
        component_statuses: componentStatuses,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('[Activity Logger] Failed to log system health:', error);
      return false;
    }

    console.log(`[Activity Logger] System health logged: ${status} (${score})`);
    return true;
  } catch (error) {
    console.error('[Activity Logger] Exception logging system health:', error);
    return false;
  }
}

/**
 * Helper: Track agent execution with automatic logging
 * Wraps an async function with launch/complete logging
 */
export async function trackAgentExecution<T>(
  params: AgentLaunchParams,
  executionFn: () => Promise<T>
): Promise<T> {
  const launchId = await logAgentLaunch(params);

  try {
    const result = await executionFn();

    if (launchId) {
      await logAgentComplete({
        launchId,
        status: 'success',
        result: { data: result }
      });
    }

    return result;
  } catch (error: any) {
    if (launchId) {
      await logAgentComplete({
        launchId,
        status: 'failed',
        errorMessage: error?.message || 'Unknown error'
      });
    }

    throw error;
  }
}
