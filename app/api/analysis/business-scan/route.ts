import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '../../../../utils/agentUtils';

interface AnalysisRequest {
  businessInput: string;
  analysisType: string;
  userEmail?: string;
}

interface AnalysisResult {
  analysis: string;
  opportunities: string[];
  quickWins: string[];
  recommendedAgents: Array<{
    id: string;
    name: string;
    reason: string;
    priority: number;
  }>;
  confidence: number;
}

export async function POST(req: NextRequest) {
  try {
    const { businessInput, analysisType, userEmail }: AnalysisRequest = await req.json();

    if (!businessInput || !analysisType) {
      return NextResponse.json(
        { error: 'Missing required parameters: businessInput, analysisType' },
        { status: 400 }
      );
    }

    console.log('[Business Scan] Starting analysis:', { analysisType, inputLength: businessInput.length });

    // Generate AI analysis based on type
    const analysis = await generateBusinessAnalysis(businessInput, analysisType);
    
    // Generate agent recommendations
    const recommendedAgents = getRecommendedAgents(analysisType, businessInput);

    const result: AnalysisResult = {
      analysis: analysis.analysis,
      opportunities: analysis.opportunities,
      quickWins: analysis.quickWins,
      recommendedAgents,
      confidence: analysis.confidence
    };

    console.log('[Business Scan] Analysis complete:', { 
      analysisLength: result.analysis.length,
      agentCount: result.recommendedAgents.length 
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[Business Scan] Analysis failed:', error);
    
    // Fallback analysis if OpenAI fails
    const fallbackResult = generateFallbackAnalysis(req);
    
    return NextResponse.json({ 
      result: fallbackResult,
      fallback: true 
    });
  }
}

async function generateBusinessAnalysis(businessInput: string, analysisType: string): Promise<{
  analysis: string;
  opportunities: string[];
  quickWins: string[];
  confidence: number;
}> {
  
  const analysisPrompts: Record<string, string> = {
    'analyze-website': `Analyze this business website/description for SEO and conversion opportunities: "${businessInput}"`,
    'analyze-content-strategy': `Analyze this content creator's presence for growth opportunities: "${businessInput}"`,
    'analyze-publishing-strategy': `Analyze this author/publisher's strategy for book marketing opportunities: "${businessInput}"`,
    'analyze-business-automation': `Analyze this business for automation and efficiency opportunities: "${businessInput}"`,
    'analyze-brand-presence': `Analyze this professional's brand presence for LinkedIn/networking opportunities: "${businessInput}"`,
    'analyze-custom-needs': `Analyze this business description for general improvement opportunities: "${businessInput}"`
  };

  const prompt = `${analysisPrompts[analysisType] || analysisPrompts['analyze-custom-needs']}

Provide a comprehensive business analysis in this exact format:

ANALYSIS: [Write 1-2 paragraphs of competitive analysis highlighting what they're missing compared to top performers in their industry]

OPPORTUNITIES: [List 3-4 specific opportunities as bullet points starting with •]

QUICK_WINS: [List 2-3 immediate actionable items they can implement this week, as bullet points starting with •]

Be specific, actionable, and focus on competitive advantages. Use an authoritative, confident tone that shows expertise.`;

  try {
    const response = await callOpenAI(prompt, {
      maxTokens: 500,
      temperature: 0.7,
      model: 'gpt-4'
    });

    // Parse the structured response
    const sections = response.split('\n\n');
    const analysisMatch = response.match(/ANALYSIS:\s*(.*?)(?=OPPORTUNITIES:|$)/s);
    const opportunitiesMatch = response.match(/OPPORTUNITIES:\s*(.*?)(?=QUICK_WINS:|$)/s);
    const quickWinsMatch = response.match(/QUICK_WINS:\s*(.*?)$/s);

    const analysis = analysisMatch?.[1]?.trim() || response.substring(0, 300);
    const opportunities = opportunitiesMatch?.[1]?.split('•').filter(Boolean).map(s => s.trim()) || [
      'Optimize conversion funnel',
      'Implement automation systems',
      'Enhance competitive positioning'
    ];
    const quickWins = quickWinsMatch?.[1]?.split('•').filter(Boolean).map(s => s.trim()) || [
      'Audit current performance',
      'Set up basic analytics',
      'Launch competitive research'
    ];

    return {
      analysis,
      opportunities,
      quickWins,
      confidence: 0.85
    };
  } catch (error) {
    console.error('[Business Analysis] OpenAI call failed:', error);
    throw error;
  }
}

function getRecommendedAgents(analysisType: string, businessInput: string): Array<{
  id: string;
  name: string;
  reason: string;
  priority: number;
}> {
  const agentMappings: Record<string, Array<{id: string, name: string, reason: string, priority: number}>> = {
    'analyze-website': [
      { id: 'seo', name: 'SEO Dominator', reason: 'Optimize your website for search rankings and traffic', priority: 1 },
      { id: 'contentcreation', name: 'Content Creator', reason: 'Generate high-converting website content', priority: 2 }
    ],
    'analyze-content-strategy': [
      { id: 'contentcreation', name: 'Content Creator', reason: 'Scale your content production with AI automation', priority: 1 },
      { id: 'social', name: 'Social Nino', reason: 'Amplify your content across social media platforms', priority: 2 }
    ],
    'analyze-publishing-strategy': [
      { id: 'publish', name: 'Book Publisher', reason: 'Optimize your book marketing and sales strategy', priority: 1 },
      { id: 'contentcreation', name: 'Content Creator', reason: 'Build author platform with content marketing', priority: 2 }
    ],
    'analyze-business-automation': [
      { id: 'biz', name: 'Business Automator', reason: 'Implement comprehensive business automation', priority: 1 },
      { id: 'analytics', name: 'Analytics Agent', reason: 'Track and optimize your automation performance', priority: 2 }
    ],
    'analyze-brand-presence': [
      { id: 'branding', name: 'Brand Strategist', reason: 'Build and strengthen your professional brand', priority: 1 },
      { id: 'social', name: 'Social Nino', reason: 'Grow your LinkedIn and professional network', priority: 2 }
    ],
    'analyze-custom-needs': [
      { id: 'biz', name: 'Business Automator', reason: 'Identify and implement custom automation solutions', priority: 1 },
      { id: 'analytics', name: 'Analytics Agent', reason: 'Monitor and optimize business performance', priority: 2 }
    ]
  };

  return agentMappings[analysisType] || agentMappings['analyze-custom-needs'];
}

function generateFallbackAnalysis(req: NextRequest): AnalysisResult {
  return {
    analysis: "I've identified several key opportunities to give you a competitive advantage. Your business has strong potential, but there are untapped areas for growth and automation that your competitors haven't fully exploited yet.",
    opportunities: [
      "Implement AI-driven automation to reduce manual work",
      "Optimize conversion funnels for better customer acquisition", 
      "Develop content strategy for market authority",
      "Enhance competitive intelligence gathering"
    ],
    quickWins: [
      "Set up basic automation workflows",
      "Audit current performance metrics",
      "Research competitor strategies"
    ],
    recommendedAgents: [
      { id: 'biz', name: 'Business Automator', reason: 'Perfect for implementing comprehensive automation', priority: 1 },
      { id: 'analytics', name: 'Analytics Agent', reason: 'Track and optimize your performance', priority: 2 }
    ],
    confidence: 0.75
  };
}