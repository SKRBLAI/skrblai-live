import { NextRequest, NextResponse } from 'next/server';
import { triggerN8nWorkflow } from '@/lib/n8nClient';

export async function POST(req: NextRequest) {
  try {
    const { workflowId, agentId, agentAction, chained, ...payload } = await req.json();
    
    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'Missing workflowId' }, { status: 400 });
    }

    // Enhanced payload for agent chaining
    const enhancedPayload = {
      ...payload,
      agentId,
      agentAction,
      chained: chained || false,
      timestamp: new Date().toISOString(),
      source: 'skrbl-ai-platform'
    };

    const result = await triggerN8nWorkflow(workflowId, enhancedPayload);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        data: result.data,
        workflowId,
        agentId,
        executionId: (result as any).executionId || `exec_${Date.now()}`
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || result.message,
        workflowId,
        agentId 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[n8n/trigger] API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for webhook health check
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    service: 'n8n-agent-trigger',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
} 