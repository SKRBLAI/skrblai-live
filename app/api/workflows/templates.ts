import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getTemplatesForRole, 
  getTemplatesByCategory, 
  getTemplatesByIndustry,
  getAvailableIndustries,
  generateTemplateRecommendations,
  getTemplateAnalytics,
  executeTemplateDemo,
  WORKFLOW_TEMPLATES 
} from '@/lib/automation/workflowQueue';
import { checkPremiumAccess } from '@/lib/premiumGating';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();
    
    const userRole = userRoleData?.role || 'client';
    
    const url = new URL(req.url);
    const category = url.searchParams.get('category') as any;
    const industry = url.searchParams.get('industry');
    const search = url.searchParams.get('search');
    const includeDemo = url.searchParams.get('includeDemo') === 'true';
    const includeAnalytics = url.searchParams.get('includeAnalytics') === 'true';
    const action = url.searchParams.get('action');

    // Handle different actions
    switch (action) {
      case 'industries':
        return NextResponse.json({
          industries: getAvailableIndustries(),
          userRole
        });

      case 'recommendations':
        if (!search) {
          return NextResponse.json({ error: 'Search query required for recommendations' }, { status: 400 });
        }
        const recommendations = generateTemplateRecommendations(search, industry || undefined, userRole);
        return NextResponse.json({
          recommendations: recommendations.map(template => enhanceTemplateData(template, userRole, includeDemo, includeAnalytics)),
          userRole,
          searchQuery: search,
          industry
        });

      default:
        // Standard template listing with enhanced filtering
        let templates = getTemplatesForRole(userRole);
        
        if (category) {
          templates = templates.filter(t => t.category === category);
        }
        
        if (industry) {
          templates = getTemplatesByIndustry(industry, userRole);
        }

        // Add enhanced metadata to each template
        const enhancedTemplates = templates.map(template => 
          enhanceTemplateData(template, userRole, includeDemo, includeAnalytics)
        );

        return NextResponse.json({
          templates: enhancedTemplates,
          userRole,
          categories: ['content', 'automation', 'analysis', 'integration'],
          industries: getAvailableIndustries(),
          filters: {
            category,
            industry,
            search
          }
        });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/workflows/templates
 * Execute template demo or create new workflow from template
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, action, sampleInput, payload } = await req.json();

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    switch (action) {
      case 'demo':
        try {
          const demoResult = await executeTemplateDemo(templateId, sampleInput);
          
          // Track demo execution
          await supabase
            .from('workflow_template_demos')
            .insert({
              template_id: templateId,
              user_id: user.id,
              sample_input: sampleInput || template.demoPreview?.sampleInput,
              execution_time: demoResult.executionTime,
              success: demoResult.success,
              created_at: new Date().toISOString()
            });

          return NextResponse.json({
            success: true,
            demo: demoResult,
            template: {
              id: templateId,
              name: template.name,
              description: template.description
            }
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: error.message || 'Demo execution failed'
          }, { status: 500 });
        }

      case 'execute':
        // TODO: Implement actual template execution
        return NextResponse.json({
          success: true,
          message: 'Template execution started',
          executionId: `exec_${Date.now()}_${templateId}`,
          estimatedCompletion: new Date(Date.now() + template.estimatedDuration * 60000).toISOString()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Request failed'
    }, { status: 500 });
  }
}

/**
 * Enhance template data with access metadata, analytics, and demo info
 */
function enhanceTemplateData(
  template: any, 
  userRole: string, 
  includeDemo: boolean = false, 
  includeAnalytics: boolean = false
) {
  const hasAccess = !template.requiredRole || checkPremiumAccess(userRole, 'advanced-automation');
  const upgradeRequired = template.requiredRole && !hasAccess ? template.requiredRole : null;
  
  const enhanced = {
    ...template,
    hasAccess,
    upgradeRequired,
    userRole
  };

  if (includeDemo && template.demoPreview?.enabled) {
    enhanced.demoPreview = template.demoPreview;
  }

  if (includeAnalytics) {
    enhanced.analytics = getTemplateAnalytics(template.id);
  }

  return enhanced;
} 