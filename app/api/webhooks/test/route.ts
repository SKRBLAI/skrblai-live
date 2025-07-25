import { NextRequest, NextResponse } from 'next/server';
import { testWebhookConnectivity } from '../../../../lib/webhooks/n8nWebhooks';

/**
 * Test webhook connectivity to n8n
 * GET /api/webhooks/test
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Webhook Test] Testing n8n webhook connectivity...');
    
    const results = await testWebhookConnectivity();
    
    return NextResponse.json({
      success: results.success,
      message: results.success 
        ? 'All webhooks are working correctly' 
        : 'Some webhooks failed - check logs',
      results: results.results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[Webhook Test] Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Webhook test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Manual webhook test with custom payload
 * POST /api/webhooks/test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookPath, payload } = body;
    
    if (!webhookPath || !payload) {
      return NextResponse.json({
        success: false,
        error: 'webhookPath and payload are required'
      }, { status: 400 });
    }
    
    // Import the internal fireWebhook function (would need to export it)
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Manual webhook test endpoint ready',
      received: { webhookPath, payload }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Manual webhook test failed'
    }, { status: 500 });
  }
} 