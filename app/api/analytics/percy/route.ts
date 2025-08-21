import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { withSafeJson } from '@/lib/api/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withSafeJson(async (req: Request) => {
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const event = await req.json();

  // Save to database for analytics (SERVER-SIDE ONLY)
  await supabase.from('percy_analytics').insert([
    {
      ...event,
      created_at: new Date().toISOString(),
    },
  ]);

  return NextResponse.json({ success: true });
});

export const GET = withSafeJson(async (req: Request) => {
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get('days') || '7');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('percy_analytics')
    .select('*')
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  // Calculate funnel metrics
  const totalStarts = data.filter((e) => e.event_type === 'conversation_start').length;
  const step1Completed = data.filter((e) => e.event_type === 'step_completed' && e.step_number === 1).length;
  const step2Completed = data.filter((e) => e.event_type === 'step_completed' && e.step_number === 2).length;
  const step3Completed = data.filter((e) => e.event_type === 'step_completed' && e.step_number === 3).length;
  const leadsCaptured = data.filter((e) => e.event_type === 'lead_captured').length;

  const metrics = {
    totalConversations: totalStarts,
    step1ConversionRate: totalStarts > 0 ? (step1Completed / totalStarts) * 100 : 0,
    step2ConversionRate: step1Completed > 0 ? (step2Completed / step1Completed) * 100 : 0,
    step3ConversionRate: step2Completed > 0 ? (step3Completed / step2Completed) * 100 : 0,
    leadConversionRate: totalStarts > 0 ? (leadsCaptured / totalStarts) * 100 : 0,
    dropOffPoints: {
      step1: totalStarts - step1Completed,
      step2: step1Completed - step2Completed,
      step3: step2Completed - step3Completed,
      leadForm: step3Completed - leadsCaptured,
    },
  };

  return NextResponse.json({ metrics });
});