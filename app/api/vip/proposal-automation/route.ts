import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import jsPDF from 'jspdf';
import puppeteer from 'puppeteer';

// Initialize Supabase client
interface ProposalTemplate {
  id: string;
  name: string;
  industry: string;
  sections: {
    executiveSummary: string;
    scopeOfWork: string[];
    timeline: { phase: string; duration: string; deliverables: string[] }[];
    investment: { item: string; cost: number; description: string }[];
    terms: string[];
  };
}

// VIP Proposal Templates based on industry and company size
const VIP_PROPOSAL_TEMPLATES: Record<string, ProposalTemplate> = {
  'enterprise-tech': {
    id: 'enterprise-tech',
    name: 'Enterprise Technology Transformation',
    industry: 'technology',
    sections: {
      executiveSummary: `This proposal outlines a comprehensive AI automation strategy designed to transform your enterprise operations, increase efficiency by 40-60%, and provide measurable ROI within 90 days.`,
      scopeOfWork: [
        'AI Agent Infrastructure Setup & Integration',
        'Custom Workflow Automation Development',
        'Data Analytics & Business Intelligence Implementation',
        'Team Training & Change Management',
        'Performance Monitoring & Optimization'
      ],
      timeline: [
        {
          phase: 'Discovery & Planning',
          duration: '2 weeks',
          deliverables: ['Technical Assessment', 'Custom Agent Configuration', 'Integration Plan']
        },
        {
          phase: 'Implementation Phase 1',
          duration: '4 weeks',
          deliverables: ['Core Agent Deployment', 'Initial Workflow Automation', 'Team Training']
        },
        {
          phase: 'Advanced Implementation',
          duration: '6 weeks',
          deliverables: ['Advanced Analytics', 'Custom Integrations', 'Performance Optimization']
        },
        {
          phase: 'Launch & Support',
          duration: '2 weeks',
          deliverables: ['Go-Live Support', 'Documentation', 'Success Metrics Dashboard']
        }
      ],
      investment: [
        { item: 'Enterprise AI Agent Suite', cost: 4999, description: 'Full access to 50+ premium AI agents' },
        { item: 'Custom Development', cost: 15000, description: 'Tailored workflows and integrations' },
        { item: 'Dedicated Success Manager', cost: 3000, description: '3 months of dedicated support' },
        { item: 'Team Training Program', cost: 2500, description: 'Comprehensive training for up to 20 users' }
      ],
      terms: [
        '30-day money-back guarantee',
        'Dedicated 1-hour priority support',
        'Quarterly business reviews',
        'Custom SLA with 99.9% uptime guarantee',
        'White-label options available'
      ]
    }
  },
  'consulting-firm': {
    id: 'consulting-firm',
    name: 'Professional Services AI Enhancement',
    industry: 'consulting',
    sections: {
      executiveSummary: `Transform your consulting practice with AI-powered proposal generation, client management, and thought leadership content creation. Increase proposal win rate by 35% and reduce administrative overhead by 50%.`,
      scopeOfWork: [
        'Automated Proposal Generation System',
        'Client Success & Relationship Management',
        'Thought Leadership Content Creation',
        'Business Analytics & Reporting',
        'Client Communication Automation'
      ],
      timeline: [
        {
          phase: 'Assessment & Setup',
          duration: '1 week',
          deliverables: ['Current Process Analysis', 'AI Agent Configuration', 'Template Customization']
        },
        {
          phase: 'Core Implementation',
          duration: '3 weeks',
          deliverables: ['Proposal Automation', 'Client Management System', 'Content Generation Setup']
        },
        {
          phase: 'Advanced Features',
          duration: '2 weeks',
          deliverables: ['Analytics Dashboard', 'Communication Automation', 'Brand Integration']
        }
      ],
      investment: [
        { item: 'Consulting AI Agent Squad', cost: 1999, description: 'Specialized agents for consulting firms' },
        { item: 'Proposal Automation Setup', cost: 3500, description: 'Custom proposal templates and automation' },
        { item: 'Content Creation Engine', cost: 2000, description: 'Thought leadership and marketing content' },
        { item: 'Training & Support', cost: 1500, description: '2 months of dedicated onboarding' }
      ],
      terms: [
        '14-day free trial',
        'Priority support (4-hour response)',
        'Monthly strategy sessions',
        'Custom branding included',
        'Proposal template library'
      ]
    }
  },
  'high-growth-startup': {
    id: 'high-growth-startup',
    name: 'Startup Growth Acceleration',
    industry: 'startup',
    sections: {
      executiveSummary: `Accelerate your startup growth with AI-powered marketing, customer acquisition, and operational automation. Scale efficiently while maintaining lean operations and maximizing runway.`,
      scopeOfWork: [
        'Marketing Automation & Content Creation',
        'Customer Acquisition & Conversion Optimization',
        'Product Marketing & Positioning',
        'Analytics & Growth Tracking',
        'Operational Efficiency Enhancement'
      ],
      timeline: [
        {
          phase: 'Quick Start Setup',
          duration: '1 week',
          deliverables: ['Agent Configuration', 'Marketing Automation', 'Analytics Setup']
        },
        {
          phase: 'Growth Implementation',
          duration: '2 weeks',
          deliverables: ['Content Creation Pipeline', 'Lead Generation', 'Conversion Optimization']
        },
        {
          phase: 'Scale & Optimize',
          duration: '1 week',
          deliverables: ['Performance Tuning', 'Advanced Analytics', 'Growth Strategy']
        }
      ],
      investment: [
        { item: 'Growth AI Agent Pack', cost: 999, description: 'Essential agents for startup growth' },
        { item: 'Marketing Automation', cost: 1500, description: 'Content creation and distribution' },
        { item: 'Analytics & Optimization', cost: 1000, description: 'Growth tracking and optimization' },
        { item: 'Startup Support Program', cost: 500, description: '1 month of dedicated support' }
      ],
      terms: [
        '7-day free trial',
        'Startup-friendly pricing',
        'Monthly growth reviews',
        'Scaling assistance included',
        '6-month growth guarantee'
      ]
    }
  }
};

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const { 
      email, 
      companyName, 
      templateId, 
      customRequirements,
      generatePDF = true,
      deliveryMethod = 'email' // 'email', 'download', 'both'
    } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required for proposal generation' },
        { status: 400 }
      );
    }

    // Get VIP user data
    const { data: vipUser, error: vipError } = await supabase
      .from('vip_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (vipError || !vipUser) {
      return NextResponse.json(
        { success: false, error: 'VIP recognition required for automated proposals' },
        { status: 404 }
      );
    }

    // Determine appropriate template
    const selectedTemplate = await selectProposalTemplate(vipUser, templateId);
    
    // Generate personalized proposal content
    const proposalContent = await generatePersonalizedProposal(vipUser, selectedTemplate, customRequirements);
    
    // Save proposal to database
    const proposalId = await saveProposalToDatabase(supabase, vipUser, proposalContent, selectedTemplate);

    // Generate PDF if requested
    let pdfUrl = null;
    if (generatePDF) {
      pdfUrl = await generateProposalPDF(proposalContent, proposalId);
    }

    // Handle delivery
    if (deliveryMethod === 'email' || deliveryMethod === 'both') {
      await sendProposalEmail(vipUser, proposalContent, pdfUrl);
    }

    // Log the proposal generation
    await logProposalActivity(supabase, vipUser.email, 'proposal_generated', {
      templateId: selectedTemplate.id,
      vipLevel: vipUser.vip_level,
      hasPDF: !!pdfUrl,
      deliveryMethod
    });

    console.log(`[VIP Proposal Automation] Generated proposal for ${email} - Template: ${selectedTemplate.id}, PDF: ${!!pdfUrl}`);

    return NextResponse.json({
      success: true,
      proposalGeneration: {
        proposalId,
        templateUsed: selectedTemplate.id,
        vipLevel: vipUser.vip_level,
        pdfGenerated: !!pdfUrl,
        pdfUrl,
        estimatedValue: calculateProposalValue(proposalContent),
        deliveryMethod,
        proposalContent: deliveryMethod !== 'email' ? proposalContent : undefined // Include content for download/both
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[VIP Proposal Automation] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate automated proposal',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const proposalId = searchParams.get('proposalId');

    if (!email && !proposalId) {
      return NextResponse.json(
        { success: false, error: 'Email or proposal ID required' },
        { status: 400 }
      );
    }

    let query = supabase.from('vip_proposals').select('*');

    if (proposalId) {
      query = query.eq('id', proposalId);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    const { data: proposals, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[VIP Proposal Automation] Failed to fetch proposals:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch proposals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      proposals: proposals || [],
      count: proposals?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[VIP Proposal Automation] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get proposals',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper Functions

async function selectProposalTemplate(vipUser: any, templateId?: string): Promise<ProposalTemplate> {
  if (templateId && VIP_PROPOSAL_TEMPLATES[templateId]) {
    return VIP_PROPOSAL_TEMPLATES[templateId];
  }

  // Auto-select based on VIP data
  const industry = vipUser.industry?.toLowerCase() || '';
  const companySize = vipUser.company_size?.toLowerCase() || '';
  const revenue = vipUser.revenue || 0;

  // Enterprise tech template for tech companies or large enterprises
  if (industry.includes('tech') || industry.includes('software') || 
      companySize.includes('1000+') || companySize.includes('enterprise') ||
      revenue > 50000000) {
    return VIP_PROPOSAL_TEMPLATES['enterprise-tech'];
  }

  // Consulting template for consulting/professional services
  if (industry.includes('consulting') || industry.includes('professional') ||
      vipUser.user_title?.toLowerCase().includes('consultant')) {
    return VIP_PROPOSAL_TEMPLATES['consulting-firm'];
  }

  // Startup template for smaller companies or startups
  if (industry.includes('startup') || companySize.includes('small') ||
      companySize.includes('50') || revenue < 5000000) {
    return VIP_PROPOSAL_TEMPLATES['high-growth-startup'];
  }

  // Default to consulting firm template
  return VIP_PROPOSAL_TEMPLATES['consulting-firm'];
}

async function generatePersonalizedProposal(vipUser: any, template: ProposalTemplate, customRequirements?: string) {
  const companyName = vipUser.company_name || 'Your Company';
  const userName = vipUser.user_title ? `${vipUser.user_title}` : 'Decision Maker';
  const recommendedSquad = JSON.parse(vipUser.recommended_squad || '{}');
  const personalizedPlan = JSON.parse(vipUser.personalized_plan || '{}');

  // Customize investment based on VIP level
  const vipMultiplier = getVIPPriceMultiplier(vipUser.vip_level);
  const customizedInvestment = template.sections.investment.map(item => ({
    ...item,
    cost: Math.round(item.cost * vipMultiplier)
  }));

  return {
    id: `proposal_${Date.now()}_${vipUser.email.split('@')[0]}`,
    companyName,
    userName,
    vipLevel: vipUser.vip_level,
    templateUsed: template.id,
    generatedDate: new Date().toISOString(),
    sections: {
      ...template.sections,
      executiveSummary: template.sections.executiveSummary
        .replace(/your enterprise/g, companyName)
        .replace(/your organization/g, companyName)
        .replace(/your company/g, companyName)
        .replace(/your practice/g, `${companyName}'s operations`)
        .replace(/your startup/g, companyName),
      investment: customizedInvestment,
      customRequirements: customRequirements || null
    },
    recommendedSquad,
    personalizedPlan,
    totalInvestment: customizedInvestment.reduce((sum, item) => sum + item.cost, 0),
    estimatedROI: calculateEstimatedROI(vipUser, customizedInvestment)
  };
}

function getVIPPriceMultiplier(vipLevel: string): number {
  const multipliers = {
    'enterprise': 1.5,
    'platinum': 1.2,
    'gold': 1.0,
    'silver': 0.8,
    'standard': 0.6
  };
  return multipliers[vipLevel as keyof typeof multipliers] || 1.0;
}

function calculateEstimatedROI(vipUser: any, investment: any[]): string {
  const totalInvestment = investment.reduce((sum, item) => sum + item.cost, 0);
  const annualSavings = totalInvestment * 3; // Conservative 3x ROI estimate
  const monthsToBreakeven = Math.ceil(totalInvestment / (annualSavings / 12));
  
  return `Estimated ${Math.round(annualSavings / totalInvestment * 100)}% annual ROI with breakeven in ${monthsToBreakeven} months`;
}

async function saveProposalToDatabase(supabase: any, vipUser: any, proposalContent: any, template: ProposalTemplate) {
  const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const { error } = await supabase.from('vip_proposals').insert({
    id: proposalId,
    email: vipUser.email,
    company_name: vipUser.company_name,
    vip_level: vipUser.vip_level,
    template_id: template.id,
    proposal_content: JSON.stringify(proposalContent),
    total_value: proposalContent.totalInvestment,
    status: 'generated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error('[VIP Proposal] Database save error:', error);
    throw new Error('Failed to save proposal to database');
  }

  return proposalId;
}

async function generateProposalPDF(proposalContent: any, proposalId: string): Promise<string> {
  try {
    // Generate HTML content for PDF
    const htmlContent = generateProposalHTML(proposalContent);
    
    // For production, use Puppeteer to generate high-quality PDF
    if (process.env.NODE_ENV === 'production') {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' }
      });
      
      await browser.close();
      
      // Save PDF to storage (implement your preferred storage solution)
      const pdfUrl = await uploadPDFToStorage(Buffer.from(pdfBuffer), proposalId);
      return pdfUrl;
    } else {
      // Development fallback - return mock URL
      return `https://mock-storage.com/proposals/${proposalId}.pdf`;
    }
  } catch (error) {
    console.error('[VIP Proposal] PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}

function generateProposalHTML(proposalContent: any): string {
  const { sections, companyName, userName, vipLevel, totalInvestment, estimatedROI } = proposalContent;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>SKRBL AI Proposal - ${companyName}</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .header { background: linear-gradient(135deg, #0EA5E9, #06B6D4); color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .vip-badge { background: #FFD700; color: #000; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        h1 { color: #0EA5E9; border-bottom: 2px solid #06B6D4; padding-bottom: 10px; }
        h2 { color: #0891B2; }
        .section { margin-bottom: 30px; padding: 20px; background: #F8FAFC; border-left: 4px solid #0EA5E9; }
        .timeline-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .investment-item { display: flex; justify-content: between; padding: 10px; border-bottom: 1px solid #E5E7EB; }
        .total-investment { background: #0EA5E9; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; background: #F1F5F9; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🚀 SKRBL AI</div>
        <h1>AI Automation Proposal</h1>
        <p>For ${companyName}</p>
        <span class="vip-badge">${vipLevel.toUpperCase()} VIP</span>
      </div>

      <div class="section">
        <h1>Executive Summary</h1>
        <p>${sections.executiveSummary}</p>
        <p><strong>Estimated ROI:</strong> ${estimatedROI}</p>
      </div>

      <div class="section">
        <h1>Scope of Work</h1>
        <ul>
          ${sections.scopeOfWork.map((item: string) => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h1>Project Timeline</h1>
        ${sections.timeline.map((phase: any) => `
          <div class="timeline-item">
            <h3>${phase.phase} (${phase.duration})</h3>
            <ul>
              ${phase.deliverables.map((deliverable: string) => `<li>${deliverable}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h1>Investment Breakdown</h1>
        ${sections.investment.map((item: any) => `
          <div class="investment-item">
            <div>
              <strong>${item.item}</strong><br>
              <small>${item.description}</small>
            </div>
            <div style="text-align: right;">
              <strong>$${item.cost.toLocaleString()}</strong>
            </div>
          </div>
        `).join('')}
        <div class="total-investment">
          Total Investment: $${totalInvestment.toLocaleString()}
        </div>
      </div>

      <div class="section">
        <h1>Terms & Benefits</h1>
        <ul>
          ${sections.terms.map((term: string) => `<li>${term}</li>`).join('')}
        </ul>
      </div>

      <div class="footer">
        <p><strong>Ready to transform your business with AI?</strong></p>
        <p>Contact us at proposals@skrbl.ai or schedule a call at skrbl.ai/vip-consultation</p>
        <p>Generated on ${new Date().toLocaleDateString()} | SKRBL AI VIP Proposal System</p>
      </div>
    </body>
    </html>
  `;
}

async function uploadPDFToStorage(pdfBuffer: Buffer, proposalId: string): Promise<string> {
  // Implement your preferred storage solution (AWS S3, Google Cloud Storage, etc.)
  // For now, return a mock URL
  return `https://storage.skrbl.ai/proposals/${proposalId}.pdf`;
}

function calculateProposalValue(proposalContent: any): number {
  return proposalContent.totalInvestment || 0;
}

async function sendProposalEmail(vipUser: any, proposalContent: any, pdfUrl?: string | null) {
  // Implement email sending logic (SendGrid, AWS SES, etc.)
  console.log(`[VIP Proposal] Email would be sent to ${vipUser.email} with proposal content and PDF: ${pdfUrl}`);
  // In production, implement actual email sending
}

async function logProposalActivity(supabase: any, email: string, action: string, metadata: any) {
  try {
    await supabase.from('vip_proposal_activity').insert({
      email,
      action,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[VIP Proposal] Failed to log activity:', error);
  }
} 