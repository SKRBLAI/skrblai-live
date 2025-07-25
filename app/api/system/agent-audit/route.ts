import { NextRequest, NextResponse } from 'next/server';
import agentRegistry, { agentDashboardList } from '../../../../lib/agents/agentRegistry';
import { agentBackstories } from '../../../../lib/agents/agentBackstories';
import { getAgentImagePath } from '../../../../utils/agentUtils';

interface AuditIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'image' | 'metadata' | 'backstory' | 'n8n' | 'duplicate';
  agent: string;
  field: string;
  issue: string;
  current?: any;
  expected?: any;
}

export async function GET(req: NextRequest) {
  const issues: AuditIssue[] = [];
  const stats = {
    totalAgents: agentRegistry.length,
    visibleAgents: agentRegistry.filter(a => a.visible !== false).length,
    agentsWithImages: 0,
    agentsWithBackstories: 0,
    agentsWithN8nConfig: 0,
    duplicateIds: [] as string[],
    missingImageFormat: [] as string[],
    missingBackstoryFields: [] as string[],
    missingN8nConfig: [] as string[]
  };

  // Check for duplicate agent IDs
  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();
  
  agentRegistry.forEach(agent => {
    if (seenIds.has(agent.id)) {
      duplicateIds.add(agent.id);
      issues.push({
        severity: 'error',
        category: 'duplicate',
        agent: agent.id,
        field: 'id',
        issue: 'Duplicate agent ID found',
        current: agent.id
      });
    }
    seenIds.add(agent.id);
  });
  
  stats.duplicateIds = Array.from(duplicateIds);

  // Audit each agent
  agentRegistry.forEach(agent => {
    const agentName = agent.name || agent.id;
    
    // 1. IMAGE AUDIT
    // Check imageSlug format
    if (!agent.imageSlug) {
      issues.push({
        severity: 'error',
        category: 'image',
        agent: agent.id,
        field: 'imageSlug',
        issue: 'Missing imageSlug',
        current: undefined,
        expected: 'agents-{slug}-nobg-skrblai'
      });
    } else {
      stats.agentsWithImages++;
      
      // Check if imageSlug follows the -nobg-skrblai convention
      if (!agent.imageSlug.includes('-nobg-skrblai')) {
        stats.missingImageFormat.push(agent.id);
        issues.push({
          severity: 'warning',
          category: 'image',
          agent: agent.id,
          field: 'imageSlug',
          issue: 'Image slug does not follow -nobg-skrblai convention',
          current: agent.imageSlug,
          expected: agent.imageSlug.replace(/(-nobg)?(-skrblai)?$/, '-nobg-skrblai')
        });
      }
      
      // Check if image path can be resolved
      try {
        const imagePath = getAgentImagePath(agent);
        if (!imagePath.includes('-nobg-skrblai.png')) {
          issues.push({
            severity: 'warning',
            category: 'image',
            agent: agent.id,
            field: 'imagePath',
            issue: 'Resolved image path does not follow naming convention',
            current: imagePath,
            expected: imagePath.replace(/\.png$/, '-nobg-skrblai.png')
          });
        }
      } catch (error) {
        issues.push({
          severity: 'error',
          category: 'image',
          agent: agent.id,
          field: 'imagePath',
          issue: 'Failed to resolve image path',
          current: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 2. METADATA AUDIT
    // Check required fields
    const requiredFields = ['name', 'description', 'category', 'capabilities'];
    requiredFields.forEach(field => {
      const value = (agent as any)[field];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        issues.push({
          severity: 'error',
          category: 'metadata',
          agent: agent.id,
          field,
          issue: `Missing required field: ${field}`,
          current: value
        });
      }
    });

    // Check agentCategory format
    if (!agent.agentCategory || !Array.isArray(agent.agentCategory)) {
      issues.push({
        severity: 'warning',
        category: 'metadata',
        agent: agent.id,
        field: 'agentCategory',
        issue: 'Missing or invalid agentCategory array',
        current: agent.agentCategory,
        expected: Array.isArray(agent.agentCategory) ? agent.agentCategory : [agent.category?.toLowerCase()]
      });
    }

    // Check gender normalization
    if (!agent.gender || !['male', 'female', 'neutral'].includes(agent.gender)) {
      issues.push({
        severity: 'info',
        category: 'metadata',
        agent: agent.id,
        field: 'gender',
        issue: 'Invalid or missing gender field',
        current: agent.gender,
        expected: 'male | female | neutral'
      });
    }

    // 3. SUPERHERO BACKSTORY AUDIT
    const backstoryKey = agent.id.replace('-agent', '');
    const backstory = agentBackstories[agent.id] || agentBackstories[backstoryKey];
    
    if (backstory) {
      stats.agentsWithBackstories++;
      
      // Check all required backstory fields
      const backstoryFields = ['superheroName', 'origin', 'powers', 'weakness', 'catchphrase', 'nemesis', 'backstory'];
      backstoryFields.forEach(field => {
        const value = backstory[field as keyof typeof backstory];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          stats.missingBackstoryFields.push(`${agent.id}.${field}`);
          issues.push({
            severity: 'warning',
            category: 'backstory',
            agent: agent.id,
            field,
            issue: `Missing backstory field: ${field}`,
            current: value
          });
        }
      });
      
      // Check if agent has backstory fields populated
      if (!agent.superheroName || !agent.powers || !agent.catchphrase) {
        issues.push({
          severity: 'warning',
          category: 'backstory',
          agent: agent.id,
          field: 'backstory_integration',
          issue: 'Backstory exists but not fully integrated into agent object',
          current: {
            superheroName: agent.superheroName,
            powers: agent.powers,
            catchphrase: agent.catchphrase
          }
        });
      }
    } else {
      issues.push({
        severity: 'error',
        category: 'backstory',
        agent: agent.id,
        field: 'backstory',
        issue: 'No backstory found in agentBackstories',
        expected: `Entry needed in agentBackstories['${agent.id}'] or agentBackstories['${backstoryKey}']`
      });
    }

    // 4. N8N INTEGRATION AUDIT
    if (agent.n8nWorkflowId) {
      stats.agentsWithN8nConfig++;
      
      // Check if primary capability and output are defined
      if (!agent.primaryCapability) {
        issues.push({
          severity: 'warning',
          category: 'n8n',
          agent: agent.id,
          field: 'primaryCapability',
          issue: 'N8N workflow configured but missing primaryCapability',
          current: agent.primaryCapability
        });
      }
      
      if (!agent.primaryOutput) {
        issues.push({
          severity: 'warning',
          category: 'n8n',
          agent: agent.id,
          field: 'primaryOutput',
          issue: 'N8N workflow configured but missing primaryOutput',
          current: agent.primaryOutput
        });
      }
    } else {
      stats.missingN8nConfig.push(agent.id);
      issues.push({
        severity: 'info',
        category: 'n8n',
        agent: agent.id,
        field: 'n8nWorkflowId',
        issue: 'No N8N workflow configured',
        current: undefined,
        expected: 'workflow-id-string'
      });
    }
  });

  // Calculate summary metrics
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return NextResponse.json({
    success: true,
    audit: {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        errors: errorCount,
        warnings: warningCount,
        info: infoCount,
        overallHealth: errorCount === 0 ? (warningCount === 0 ? 'excellent' : 'good') : 'needs_attention'
      },
      stats,
      issues: issues.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      recommendations: [
        errorCount > 0 ? 'Fix all error-level issues immediately' : null,
        stats.missingImageFormat.length > 0 ? 'Update image slugs to use -nobg-skrblai convention' : null,
        stats.missingBackstoryFields.length > 0 ? 'Complete all superhero backstory fields' : null,
        stats.missingN8nConfig.length > 0 ? 'Consider adding N8N workflow integration for remaining agents' : null
      ].filter(Boolean)
    }
  });
}

// POST endpoint for fixing common issues
export async function POST(req: NextRequest) {
  const { action, agents } = await req.json();
  
  if (action === 'fix_image_format') {
    // This would update image slugs to proper format
    return NextResponse.json({
      success: true,
      message: 'Image format fixes would be applied here',
      note: 'This is a placeholder for bulk image format corrections'
    });
  }
  
  return NextResponse.json({
    success: false,
    error: 'Unknown action or not implemented'
  }, { status: 400 });
} 