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
  status?: 'running' | 'success' | 'error' | 'waiting';
  data?: any;
  error?: string;
  message?: string;
}

export async function triggerN8nWorkflow(workflowId: string, payload: Record<string, any>): Promise<N8nWorkflowResult> {
  if (!N8N_API_BASE_URL) {
    console.warn('[n8nClient] N8N_API_BASE_URL not set. Using mock/fallback.');
    return { 
      success: false, 
      message: 'n8n not connected (mock mode)',
      status: 'error'
    };
  }

  try {
    // Enhanced payload with tracking data
    const enhancedPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
      platform: 'skrbl-ai',
      version: '1.0.0'
    };

    const response = await n8nClient.post(`/webhook/${workflowId}`, enhancedPayload);
    const responseData = response.data as any;
    
    console.log('[n8nClient] Workflow triggered successfully:', {
      workflowId,
      status: response.status,
      executionId: responseData?.executionId
    });

    return {
      success: true,
      executionId: responseData?.executionId || `exec_${Date.now()}_${workflowId}`,
      status: responseData?.status || 'running',
      data: response.data
    };

  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error.message;
    const errorStatus = error?.response?.status;
    
    console.error('[n8nClient] Workflow trigger failed:', {
      workflowId,
      error: errorMessage,
      status: errorStatus,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: errorMessage,
      status: 'error',
      message: `N8N workflow ${workflowId} failed: ${errorMessage}`
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
    
    return {
      success: true,
      executionId,
      status: responseData?.finished ? 'success' : 'running',
      data: response.data
    };

  } catch (error: any) {
    console.error('[n8nClient] Status check failed:', error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data || error.message,
      status: 'error'
    };
  }
}

export default n8nClient; 