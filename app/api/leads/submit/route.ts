import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/supabase/server";
import { withLogging } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LeadSubmission {
  email: string;
  name?: string;
  source: string; // exit_intent, pricing_modal, percy_scan, etc.
  page_path?: string;
  vertical?: 'business' | 'sports';
  offer_type?: string; // launch40, exit_capture, free_scan, etc.
  campaign?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

async function handleLeadSubmission(req: NextRequest) {
  try {
    const body = await req.json() as LeadSubmission;
    
    // Validate required fields
    if (!body.email || !body.source) {
      return NextResponse.json(
        { ok: false, error: 'Email and source are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseAdmin();
    
    if (!supabase) {
      return NextResponse.json(
        { ok: false, reason: "supabase_unavailable" },
        { status: 503 }
      );
    }
    
    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, status, created_at, metadata')
      .eq('email', body.email)
      .eq('source', body.source)
      .single();

    if (existingLead) {
      // Update existing lead with new interaction
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({
          page_path: body.page_path,
          offer_type: body.offer_type,
          campaign: body.campaign,
          referrer: body.referrer,
          metadata: {
            ...existingLead.metadata,
            ...body.metadata,
            last_interaction: new Date().toISOString(),
            interaction_count: (existingLead.metadata?.interaction_count || 0) + 1
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating lead:', updateError);
        return NextResponse.json(
          { ok: false, error: 'Failed to update lead' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        lead_id: updatedLead.id,
        status: 'updated',
        message: 'Lead updated successfully'
      });
    }

    // Create new lead
    const leadData = {
      email: body.email,
      name: body.name,
      source: body.source,
      page_path: body.page_path,
      vertical: body.vertical,
      offer_type: body.offer_type,
      campaign: body.campaign,
      referrer: body.referrer,
      status: 'new',
      score: calculateLeadScore(body),
      metadata: {
        ...body.metadata,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        created_source: body.source,
        interaction_count: 1
      }
    };

    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating lead:', insertError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Track lead creation in analytics
    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'lead.created',
          page_path: body.page_path,
          vertical: body.vertical,
          metadata: {
            lead_id: newLead.id,
            email: body.email,
            source: body.source,
            score: leadData.score
          },
          timestamp: new Date().toISOString()
        })
      });
    } catch (analyticsError) {
      console.warn('Analytics tracking failed:', analyticsError);
      // Don't fail the lead creation if analytics fails
    }

    return NextResponse.json({
      ok: true,
      lead_id: newLead.id,
      status: 'created',
      score: leadData.score,
      message: 'Lead created successfully'
    });

  } catch (error: any) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate lead score based on submission data
 */
function calculateLeadScore(lead: LeadSubmission): number {
  let score = 0;

  // Base score for email submission
  score += 10;

  // Source scoring
  const sourceScores: Record<string, number> = {
    'exit_intent': 15,
    'pricing_modal': 25,
    'percy_scan': 30,
    'skillsmith_scan': 30,
    'agent_league': 20,
    'free_trial': 35,
    'contact_form': 40
  };
  score += sourceScores[lead.source] || 10;

  // Vertical scoring
  if (lead.vertical) {
    score += 5;
  }

  // Page path scoring (higher intent pages)
  if (lead.page_path) {
    if (lead.page_path.includes('/pricing')) score += 20;
    if (lead.page_path.includes('/agents')) score += 15;
    if (lead.page_path.includes('/contact')) score += 25;
    if (lead.page_path === '/') score += 5;
  }

  // Offer type scoring
  const offerScores: Record<string, number> = {
    'free_trial': 20,
    'free_scan': 15,
    'launch40': 25,
    'exit_capture': 10
  };
  if (lead.offer_type) {
    score += offerScores[lead.offer_type] || 5;
  }

  // Name provided bonus
  if (lead.name && lead.name.trim().length > 0) {
    score += 10;
  }

  // Cap score at 100
  return Math.min(score, 100);
}

export const POST = withLogging(handleLeadSubmission);