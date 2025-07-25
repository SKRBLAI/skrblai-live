import { NextRequest, NextResponse } from 'next/server';
import { marketingAutomation } from '../../../../lib/marketing/MarketingAutomationManager';
import { systemLog } from '../../../../utils/systemLog';
import { getErrorMessage } from '../../../../utils/errorHandling';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leadId,
      userId,
      activityType,
      activityValue,
      metadata = {}
    } = body;

    if (!leadId || !activityType) {
      return NextResponse.json({
        success: false,
        error: 'leadId and activityType are required'
      }, { status: 400 });
    }

    await marketingAutomation.recordLeadActivity({
      lead_id: leadId,
      user_id: userId,
      activity_type: activityType,
      activity_value: activityValue,
      score_change: 0,
      current_score: 0,
      metadata
    } as any);

    await systemLog({
      type: 'info',
      message: 'Lead activity recorded',
      meta: { leadId, activityType }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Lead Activity API] Error:', error);
    await systemLog({
      type: 'error',
      message: 'Lead activity API error',
      meta: { error: getErrorMessage(error) }
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 