import { NextRequest, NextResponse } from 'next/server';
import { MarketingAutomationManager } from '../../../../lib/marketing/MarketingAutomationManager';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    const marketingManager = new MarketingAutomationManager();
    const analytics = await marketingManager.getMarketingAnalytics();

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('[Marketing Analytics API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 