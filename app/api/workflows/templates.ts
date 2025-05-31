import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTemplatesForRole, getTemplatesByCategory, WORKFLOW_TEMPLATES } from '@/lib/automation/workflowQueue';
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
    const category = url.searchParams.get('category');
    
    let templates = getTemplatesForRole(userRole);
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    // Add access metadata to each template
    const templatesWithAccess = templates.map(template => ({
      ...template,
      hasAccess: !template.requiredRole || checkPremiumAccess(userRole, 'advanced-automation'),
      upgradeRequired: template.requiredRole && !checkPremiumAccess(userRole, 'advanced-automation') 
        ? template.requiredRole 
        : null
    }));

    return NextResponse.json({
      templates: templatesWithAccess,
      userRole,
      categories: ['content', 'automation', 'analysis', 'integration']
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 