import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { marketingAutomation } from '@/lib/marketing/MarketingAutomationManager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
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

    // Record initial form submit activity for scoring
    await marketingAutomation.recordLeadActivity({
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
        await marketingAutomation.enrollUserInDripCampaign(
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