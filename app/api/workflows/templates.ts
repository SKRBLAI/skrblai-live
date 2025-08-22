// app/api/workflows/templates/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import {
  getTemplatesForRole,
  getTemplatesByCategory,
  getTemplatesByIndustry,
  getAvailableIndustries,
  generateTemplateRecommendations,
  getTemplateAnalytics,
  executeTemplateDemo,
  WORKFLOW_TEMPLATES,
} from '@/lib/automation/workflowQueue';
import { checkPremiumAccess } from '@/lib/premiumGating';

// GET /api/workflows/templates
export async function GET(req: Request) {
  try {
    const token = getBearer(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      console.warn('[workflows/templates GET] Supabase not configured – 503');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    // Verify user from token
    const { data: { user }, error: uerr } = await supabase.auth.getUser(token);
    if (uerr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const category = url.searchParams.get('category') as string | null;
    const industry = url.searchParams.get('industry') as string | null;
    const search = url.searchParams.get('search') as string | null;
    const includeDemo = url.searchParams.get('includeDemo') === 'true';
    const includeAnalytics = url.searchParams.get('includeAnalytics') === 'true';
    const action = url.searchParams.get('action');

    // Resolve user role (graceful fallback)
    let userRole = 'client';
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
    if (roleRow?.role) userRole = roleRow.role;

    if (action === 'industries') {
      return NextResponse.json({ industries: getAvailableIndustries(), userRole });
    }

    if (action === 'recommendations') {
      if (!search) return NextResponse.json({ error: 'Search query required' }, { status: 400 });
      const recs = generateTemplateRecommendations(search, industry ?? undefined, userRole);
      return NextResponse.json({
        recommendations: recs.map(t => enhanceTemplateData(t, userRole, includeDemo, includeAnalytics)),
        userRole,
        searchQuery: search,
        industry,
      });
    }

    // Standard listing
    let templates = getTemplatesForRole(userRole);
    if (category) templates = templates.filter(t => t.category === category);
    if (industry) templates = getTemplatesByIndustry(industry, userRole);

    const enhanced = templates.map(t => enhanceTemplateData(t, userRole, includeDemo, includeAnalytics));
    return NextResponse.json({
      templates: enhanced,
      userRole,
      categories: ['content', 'automation', 'analysis', 'integration'],
      industries: getAvailableIndustries(),
      filters: { category, industry, search },
    });
  } catch (e: any) {
    console.error('[workflows/templates GET] error:', e?.message || e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workflows/templates (demo/execute)
export async function POST(req: Request) {
  try {
    const token = getBearer(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      console.warn('[workflows/templates POST] Supabase not configured – 503');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { data: { user }, error: uerr } = await supabase.auth.getUser(token);
    if (uerr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { templateId, action, sampleInput, payload } = await req.json();
    if (!templateId) return NextResponse.json({ error: 'Template ID required' }, { status: 400 });

    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    if (action === 'demo') {
      try {
        const demo = await executeTemplateDemo(templateId, sampleInput);
        // Track demo (best-effort)
        await supabase.from('workflow_template_demos').insert({
          template_id: templateId,
          user_id: user.id,
          sample_input: sampleInput ?? template.demoPreview?.sampleInput,
          execution_time: demo.executionTime,
          success: demo.success,
          created_at: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          demo,
          template: { id: templateId, name: template.name, description: template.description },
        });
      } catch (err: any) {
        console.error('[workflows/templates POST demo] error:', err?.message || err);
        return NextResponse.json({ success: false, error: err?.message || 'Demo failed' }, { status: 500 });
      }
    }

    if (action === 'execute') {
      // TODO: real execution path
      return NextResponse.json({
        success: true,
        message: 'Template execution started',
        executionId: `exec_${Date.now()}_${templateId}`,
        estimatedCompletion: new Date(Date.now() + (template.estimatedDuration ?? 1) * 60000).toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    console.error('[workflows/templates POST] error:', e?.message || e);
    return NextResponse.json({ success: false, error: e?.message || 'Request failed' }, { status: 500 });
  }
}

function getBearer(req: Request) {
  const h = new Headers(req.headers);
  const auth = h.get('authorization');
  return auth?.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
}

function enhanceTemplateData(
  template: any,
  userRole: string,
  includeDemo = false,
  includeAnalytics = false
) {
  const hasAccess = !template.requiredRole || checkPremiumAccess(userRole, 'advanced-automation');
  const upgradeRequired = template.requiredRole && !hasAccess ? template.requiredRole : null;

  const enhanced: any = { ...template, hasAccess, upgradeRequired, userRole };
  if (includeDemo && template.demoPreview?.enabled) enhanced.demoPreview = template.demoPreview;
  if (includeAnalytics) enhanced.analytics = getTemplateAnalytics(template.id);
  return enhanced;
}
