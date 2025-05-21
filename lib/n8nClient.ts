import axios from 'axios';

const N8N_API_BASE_URL = process.env.N8N_API_BASE_URL || '';

const n8nClient = axios.create({
  baseURL: N8N_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function triggerN8nWorkflow(workflowId: string, payload: Record<string, any>) {
  if (!N8N_API_BASE_URL) {
    console.warn('[n8nClient] N8N_API_BASE_URL not set. Using mock/fallback.');
    return { success: false, message: 'n8n not connected (mock mode)' };
  }
  try {
    const res = await n8nClient.post(`/webhook/${workflowId}`, payload);
    console.log('[n8nClient] Workflow triggered:', res.data);
    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('[n8nClient] Error triggering workflow:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message };
  }
}

export default n8nClient; 