import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { MarketingAutomationManager } from '../../../../lib/marketing/MarketingAutomationManager';

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const leadData = await req.json();
    
    // Server-side lead submission with service key
    const { data: insertedLead, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const leadId = insertedLead.id;

    const marketingManager = new MarketingAutomationManager();

    // Record initial form submit activity for scoring
    await marketingManager.recordLeadActivity({
      lead_id: leadId,
      user_id: insertedLead.user_id || null,
      activity_type: 'form_submit' as any,
      activity_value: 'lead_form',
      score_change: 0,
      current_score: 0,
      metadata: {}
    } as any);

    // Optionally enroll lead/user in default onboarding drip campaign if exists
    try {
      if (insertedLead.user_id) {
        await marketingManager.enrollUserInDripCampaign(
          'welcome-sequence',
          insertedLead.user_id,
          leadId
        );
      }
    } catch (dripError) {
      console.warn('[Lead Submit] Drip enroll failed:', dripError);
    }

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error('Lead submission failed:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
} 