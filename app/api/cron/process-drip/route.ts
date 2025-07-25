import { NextRequest, NextResponse } from 'next/server';
import { marketingAutomation } from '../../../../lib/marketing/MarketingAutomationManager';
import { systemLog } from '../../../../utils/systemLog';

export async function POST(req: NextRequest) {
  try {
    // Optional secret header for security
    const secretHeader = req.headers.get('x-cron-secret');
    if (process.env.CRON_SECRET && secretHeader !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pending = await marketingAutomation.getPendingDripActions();

    for (const enrollment of pending) {
      await marketingAutomation.processDripCampaignStep(enrollment.id);
    }

    await systemLog({
      type: 'info',
      message: 'Processed drip campaign actions',
      meta: { processed: pending.length }
    });

    return NextResponse.json({ success: true, processed: pending.length });
  } catch (error) {
    console.error('[Cron] Drip processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 