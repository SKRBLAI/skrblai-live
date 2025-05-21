import { NextRequest, NextResponse } from 'next/server';
import { triggerN8nWorkflow } from '@/lib/n8nClient';

export async function POST(req: NextRequest) {
  try {
    const { workflowId, ...payload } = await req.json();
    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'Missing workflowId' }, { status: 400 });
    }
    const result = await triggerN8nWorkflow(workflowId, payload);
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error || result.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[n8n/trigger] API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 