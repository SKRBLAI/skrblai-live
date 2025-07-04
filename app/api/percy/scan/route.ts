import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import { TrialManager } from '@/lib/trial/trialManager';

interface ScanRequest {
  type: 'website' | 'linkedin' | 'youtube';
  url: string;
  userId?: string;
  sessionId?: string;
}

interface ScanResult {
  success: boolean;
  type: string;
  url: string;
  analysis: {
    title?: string;
    description?: string;
    industry?: string;
    businessType?: string;
    keyFeatures?: string[];
    challenges?: string[];
    opportunities?: string[];
    content_focus?: string;
  };
  agentRecommendations: Array<{
    agentId: string;
    superheroName: string;
    reason: string;
    confidence: number;
    capabilities: string[];
    catchphrase: string;
  }>;
  upsellSuggestions: Array<{
    feature: string;
    benefit: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  scanId: string;
  timestamp: string;
}

/**
 * POST /api/percy/scan
 * Instant scan functionality for websites, LinkedIn profiles, and YouTube videos
 */
export async function POST(request: NextRequest) {
  try {
    const body: ScanRequest = await request.json();
    const { type, url, userId, sessionId } = body;

    console.log(`[Percy Scan] Starting ${type} scan for URL: ${url}`);

    // Validate input
    if (!type || !url) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type and url'
      }, { status: 400 });
    }

    // Validate URL format based on type
    const isValidUrl = validateUrlByType(url, type);
    if (!isValidUrl) {
      return NextResponse.json({
        success: false,
        error: `Invalid ${type} URL format`
      }, { status: 400 });
    }

    // Check trial limits using new TrialManager
    if (userId) {
      const canScanResult = await TrialManager.canPerformScan(userId);
      if (!canScanResult.canAccess) {
        return NextResponse.json({
          success: false,
          error: canScanResult.reason === 'trial_expired' 
            ? 'Your 3-day free trial has expired. Upgrade to continue using scans.'
            : 'Daily scan limit reached (3 per day). Upgrade for unlimited scans.',
          requiresUpgrade: true,
          upgradePrompt: canScanResult.upgradePrompt
        }, { status: 403 });
      }
    } else {
      // For non-logged in users, use legacy check
      const canScan = await checkTrialLimits(userId, sessionId);
      if (!canScan) {
        return NextResponse.json({
          success: false,
          error: 'Trial scan limit reached (3 per day). Sign up for unlimited scans.',
          requiresUpgrade: true
        }, { status: 403 });
      }
    }

    // Generate scan ID
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Perform the scan based on type
    let analysis;
    try {
      switch (type) {
        case 'website':
          analysis = await scanWebsite(url);
          break;
        case 'linkedin':
          analysis = await scanLinkedInProfile(url);
          break;
        case 'youtube':
          analysis = await scanYouTubeVideo(url);
          break;
        default:
          throw new Error('Invalid scan type');
      }
    } catch (scanError) {
      console.error(`[Percy Scan] ${type} scan failed:`, scanError);
      analysis = getDefaultAnalysis(type);
    }

    // Generate agent recommendations based on analysis
    const agentRecommendations = generateAgentRecommendations(analysis, type);

    // Generate upsell suggestions
    const upsellSuggestions = generateUpsellSuggestions(analysis, type, !!userId);

    // Log scan activity
    await logScanActivity({
      scanId,
      userId,
      sessionId,
      type,
      url,
      analysis,
      agentRecommendations,
      upsellSuggestions,
      timestamp: new Date().toISOString()
    });

    // Record trial usage if user is on trial
    if (userId) {
      await TrialManager.recordUsage(userId, 'scan', undefined, `scan_${type}`);
    }

    // Trigger N8N workflow if available
    try {
      await triggerN8nBusinessScan({
        scanId,
        type,
        url,
        analysis,
        userId,
        agentRecommendations
      });
    } catch (n8nError) {
      console.warn('[Percy Scan] N8N business scan workflow failed:', n8nError);
      // Don't fail the request if N8N fails
    }

    const result: ScanResult = {
      success: true,
      type,
      url,
      analysis,
      agentRecommendations,
      upsellSuggestions,
      scanId,
      timestamp: new Date().toISOString()
    };

    console.log(`[Percy Scan] Scan completed successfully - ID: ${scanId}`);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Percy Scan] Scan failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Scan failed'
    }, { status: 500 });
  }
}

/**
 * GET /api/percy/scan?scanId=xxx
 * Retrieve scan results by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get('scanId');

    if (!scanId) {
      return NextResponse.json({
        success: false,
        error: 'Missing scanId parameter'
      }, { status: 400 });
    }

    const { data: scan, error } = await supabase
      .from('percy_scans')
      .select('*')
      .eq('scan_id', scanId)
      .single();

    if (error || !scan) {
      return NextResponse.json({
        success: false,
        error: 'Scan not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      scan
    });

  } catch (error: any) {
    console.error('[Percy Scan] Get scan error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to retrieve scan'
    }, { status: 500 });
  }
}

// Helper Functions

function validateUrlByType(url: string, type: string): boolean {
  try {
    const urlObj = new URL(url);
    
    switch (type) {
      case 'website':
        return true; // Any valid URL
      case 'linkedin':
        return urlObj.hostname.includes('linkedin.com');
      case 'youtube':
        return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
      default:
        return false;
    }
  } catch {
    return false;
  }
}

async function isTrialUser(userId: string): Promise<boolean> {
  if (!userId) return true; // No user = trial
  
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, trial_end_date')
      .eq('id', userId)
      .single();

    if (!profile) return true;
    
    // Check if trial expired
    if (profile.trial_end_date && new Date(profile.trial_end_date) < new Date()) {
      return false; // Trial expired, needs upgrade
    }
    
    return profile.subscription_status !== 'active';
  } catch {
    return true; // Default to trial if error
  }
}

async function checkTrialLimits(userId?: string, sessionId?: string): Promise<boolean> {
  const identifier = userId || sessionId || 'anonymous';
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data: scans } = await supabase
      .from('percy_scans')
      .select('scan_id')
      .or(`user_id.eq.${identifier},session_id.eq.${identifier}`)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    // Trial limit: 3 scans per day
    return (scans?.length || 0) < 3;
  } catch {
    return true; // Allow scan if error checking limits
  }
}

async function scanWebsite(url: string) {
  try {
    console.log(`[Percy Scan] Fetching website: ${url}`);
    
    // Fetch webpage metadata with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SKRBL-AI-Scanner/1.0 (https://skrbl.ai)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract basic metadata
    const title = extractMetaTag(html, 'title') || extractTag(html, 'title') || 'Website Analysis';
    const description = extractMetaTag(html, 'description') || 'Professional website analysis';
    
    // Simple business analysis based on content
    const businessType = inferBusinessType(html, url);
    const industry = inferIndustry(html, title, description);
    const keyFeatures = extractKeyFeatures(html);
    
    return {
      title: title.slice(0, 100), // Limit length
      description: description.slice(0, 200),
      industry,
      businessType,
      keyFeatures,
      challenges: generateChallenges(businessType, industry),
      opportunities: generateOpportunities(businessType, industry)
    };
  } catch (error) {
    console.error('[Percy Scan] Website scan error:', error);
    return getDefaultAnalysis('website');
  }
}

async function scanLinkedInProfile(url: string) {
  // LinkedIn scanning is limited due to their API restrictions
  // We'll provide generic LinkedIn-based recommendations
  const profileType = url.includes('/company/') ? 'company' : 'personal';
  
  return {
    title: `LinkedIn ${profileType === 'company' ? 'Company' : 'Professional'} Profile`,
    description: `Analyzing ${profileType} LinkedIn presence for optimization opportunities`,
    industry: 'Professional Services',
    businessType: profileType === 'company' ? 'Business' : 'Professional',
    keyFeatures: ['LinkedIn presence', 'Professional networking', 'Digital credibility'],
    challenges: ['LinkedIn optimization', 'Professional branding', 'Network engagement'],
    opportunities: ['Enhanced LinkedIn strategy', 'Professional content creation', 'Thought leadership']
  };
}

async function scanYouTubeVideo(url: string) {
  try {
    // Extract video ID from URL
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    // For production, you'd use YouTube API here
    // For now, provide generic YouTube analysis based on URL patterns
    return {
      title: 'YouTube Content Analysis',
      description: 'Analyzing YouTube video content and optimization opportunities',
      industry: 'Content Creation',
      businessType: 'Creator/Influencer',
      content_focus: 'Video Content',
      keyFeatures: ['Video content', 'YouTube presence', 'Audience engagement'],
      challenges: ['Video optimization', 'Content consistency', 'Audience growth'],
      opportunities: ['Video marketing strategy', 'Content amplification', 'Multi-platform distribution']
    };
  } catch (error) {
    console.error('[Percy Scan] YouTube scan error:', error);
    return getDefaultAnalysis('youtube');
  }
}

function getDefaultAnalysis(type: string) {
  const defaults = {
    website: {
      title: 'Website Analysis',
      description: 'Professional website analysis and optimization recommendations',
      industry: 'Business',
      businessType: 'Website',
      keyFeatures: ['Web presence'],
      challenges: ['Website optimization needed'],
      opportunities: ['Improve online presence']
    },
    linkedin: {
      title: 'LinkedIn Profile Analysis',
      description: 'Professional LinkedIn presence analysis',
      industry: 'Professional Services',
      businessType: 'Professional',
      keyFeatures: ['LinkedIn presence'],
      challenges: ['Profile optimization needed'],
      opportunities: ['Enhanced professional branding']
    },
    youtube: {
      title: 'YouTube Content Analysis',
      description: 'Video content strategy analysis',
      industry: 'Content Creation',
      businessType: 'Creator',
      keyFeatures: ['Video content'],
      challenges: ['Content strategy needed'],
      opportunities: ['Video optimization']
    }
  };
  
  return defaults[type as keyof typeof defaults] || defaults.website;
}

function generateAgentRecommendations(analysis: any, scanType: string) {
  const recommendations = [];
  
  // Always recommend Percy first
  recommendations.push({
    agentId: 'percy',
    superheroName: agentBackstories['percy'].superheroName,
    reason: 'Perfect starting point to coordinate your entire strategy',
    confidence: 95,
    capabilities: ['Strategy Coordination', 'Agent Orchestration', 'Task Management'],
    catchphrase: agentBackstories['percy'].catchphrase
  });

  // Add specific recommendations based on scan type and analysis
  if (scanType === 'website' || analysis.businessType?.includes('Business')) {
    recommendations.push({
      agentId: 'branding',
      superheroName: agentBackstories['branding'].superheroName,
      reason: 'Enhance your brand identity and visual presence',
      confidence: 88,
      capabilities: ['Brand Identity', 'Visual Design', 'Logo Creation'],
      catchphrase: agentBackstories['branding'].catchphrase
    });

    recommendations.push({
      agentId: 'site',
      superheroName: agentBackstories['site'].superheroName,
      reason: 'Optimize your website for better performance and conversions',
      confidence: 85,
      capabilities: ['Website Optimization', 'SEO', 'User Experience'],
      catchphrase: agentBackstories['site'].catchphrase
    });
  }

  if (scanType === 'youtube' || analysis.content_focus) {
    recommendations.push({
      agentId: 'videocontent',
      superheroName: agentBackstories['videocontent'].superheroName,
      reason: 'Create compelling video content that engages your audience',
      confidence: 92,
      capabilities: ['Video Creation', 'Content Strategy', 'Audience Engagement'],
      catchphrase: agentBackstories['videocontent'].catchphrase
    });

    recommendations.push({
      agentId: 'social',
      superheroName: agentBackstories['social'].superheroName,
      reason: 'Amplify your content across all social media platforms',
      confidence: 87,
      capabilities: ['Social Media Strategy', 'Content Distribution', 'Engagement'],
      catchphrase: agentBackstories['social'].catchphrase
    });
  }

  if (scanType === 'linkedin' || analysis.businessType?.includes('Professional')) {
    recommendations.push({
      agentId: 'contentcreation',
      superheroName: agentBackstories['contentcreation'].superheroName,
      reason: 'Create professional content that establishes thought leadership',
      confidence: 89,
      capabilities: ['Professional Content', 'Thought Leadership', 'LinkedIn Strategy'],
      catchphrase: agentBackstories['contentcreation'].catchphrase
    });
  }

  // Always suggest analytics for business insights
  recommendations.push({
    agentId: 'analytics',
    superheroName: agentBackstories['analytics'].superheroName,
    reason: 'Track performance and optimize your strategy with data insights',
    confidence: 83,
    capabilities: ['Performance Analytics', 'Data Insights', 'ROI Tracking'],
    catchphrase: agentBackstories['analytics'].catchphrase
  });

  return recommendations.slice(0, 4); // Limit to top 4 recommendations
}

function generateUpsellSuggestions(analysis: any, scanType: string, isLoggedIn: boolean) {
  const suggestions = [];

  if (!isLoggedIn) {
    suggestions.push({
      feature: 'Create Free Account',
      benefit: 'Unlimited scans, agent access, and premium features',
      priority: 'high' as const
    });
  }

  suggestions.push({
    feature: 'Advanced Analytics Dashboard',
    benefit: 'Deep insights and performance tracking across all your assets',
    priority: 'high' as const
  });

  if (scanType === 'website') {
    suggestions.push({
      feature: 'SEO Optimization Suite',
      benefit: 'Comprehensive SEO analysis and optimization recommendations',
      priority: 'medium' as const
    });
  }

  if (scanType === 'youtube' || scanType === 'linkedin') {
    suggestions.push({
      feature: 'Content Strategy Automation',
      benefit: 'Automated content calendar and cross-platform distribution',
      priority: 'medium' as const
    });
  }

  suggestions.push({
    feature: 'White-label Agency Access',
    benefit: 'Resell SKRBL AI services to your clients with custom branding',
    priority: 'low' as const
  });

  return suggestions.slice(0, 3);
}

async function logScanActivity(scanData: any) {
  try {
    const { error } = await supabase
      .from('percy_scans')
      .insert({
        scan_id: scanData.scanId,
        user_id: scanData.userId,
        session_id: scanData.sessionId,
        scan_type: scanData.type,
        scanned_url: scanData.url,
        analysis_result: scanData.analysis,
        agent_recommendations: scanData.agentRecommendations,
        upsell_suggestions: scanData.upsellSuggestions,
        created_at: scanData.timestamp
      });

    if (error) {
      console.error('[Percy Scan] Failed to log scan activity:', error);
    } else {
      console.log(`[Percy Scan] Logged scan activity: ${scanData.scanId}`);
    }
  } catch (error) {
    console.error('[Percy Scan] Log scan activity error:', error);
    // Don't throw - logging failure shouldn't break the scan
  }
}

async function triggerN8nBusinessScan(scanData: any) {
  if (!process.env.N8N_BASE_URL) {
    throw new Error('N8N not configured');
  }

  const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/business-scan-analysis`;
  
  console.log('[Percy Scan] Triggering N8N business scan workflow');
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_API_KEY || ''}`
    },
    body: JSON.stringify({
      ...scanData,
      timestamp: new Date().toISOString(),
      source: 'percy_scan_api'
    })
  });

  if (!response.ok) {
    throw new Error(`N8N workflow failed: ${response.status}`);
  }

  console.log('[Percy Scan] N8N workflow triggered successfully');
}

// Utility functions for content analysis
function extractMetaTag(html: string, name: string): string | null {
  const regex = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractTag(html: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function inferBusinessType(html: string, url: string): string {
  const content = html.toLowerCase();
  
  if (content.includes('shop') || content.includes('buy') || content.includes('cart') || content.includes('ecommerce')) {
    return 'E-commerce';
  }
  if (content.includes('service') || content.includes('consulting') || content.includes('agency')) {
    return 'Service Business';
  }
  if (content.includes('blog') || content.includes('news') || content.includes('article')) {
    return 'Content/Media';
  }
  if (content.includes('portfolio') || content.includes('freelance') || content.includes('designer')) {
    return 'Portfolio/Freelance';
  }
  
  return 'Business Website';
}

function inferIndustry(html: string, title: string, description: string): string {
  const content = `${html} ${title} ${description}`.toLowerCase();
  
  const industries = {
    'Technology': ['tech', 'software', 'app', 'digital', 'ai', 'saas'],
    'Healthcare': ['health', 'medical', 'doctor', 'clinic', 'pharmacy'],
    'Finance': ['finance', 'bank', 'investment', 'insurance', 'accounting'],
    'Education': ['education', 'school', 'university', 'course', 'learning'],
    'Retail': ['retail', 'store', 'shop', 'fashion', 'clothing'],
    'Real Estate': ['real estate', 'property', 'homes', 'realtor'],
    'Food & Beverage': ['restaurant', 'food', 'cafe', 'catering', 'delivery'],
    'Marketing': ['marketing', 'advertising', 'seo', 'social media', 'branding']
  };

  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return industry;
    }
  }
  
  return 'General Business';
}

function extractKeyFeatures(html: string): string[] {
  const features = [];
  const content = html.toLowerCase();
  
  const featureMap = {
    'E-commerce Platform': ['shop', 'store', 'cart', 'buy'],
    'Contact Forms': ['contact', 'form', 'email'],
    'Blog/Content': ['blog', 'articles', 'news'],
    'Social Media Integration': ['facebook', 'twitter', 'instagram', 'linkedin'],
    'Mobile Responsive': ['mobile', 'responsive'],
    'SEO Optimized': ['meta description', 'title tag', 'keywords']
  };

  for (const [feature, keywords] of Object.entries(featureMap)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      features.push(feature);
    }
  }
  
  return features.length > 0 ? features : ['Web Presence'];
}

function generateChallenges(businessType: string, industry: string): string[] {
  const baseChallenges = [
    'Increase online visibility',
    'Improve conversion rates',
    'Enhance user experience',
    'Build brand awareness',
    'Generate more leads'
  ];
  
  const typeSpecific = {
    'E-commerce': ['Optimize product pages', 'Reduce cart abandonment', 'Improve product discovery'],
    'Service Business': ['Showcase expertise', 'Build trust', 'Generate qualified leads'],
    'Content/Media': ['Increase engagement', 'Grow audience', 'Monetize content'],
    'Portfolio/Freelance': ['Showcase work', 'Build credibility', 'Attract clients']
  };
  
  const industrySpecific = {
    'Technology': ['Technical content creation', 'Developer community engagement'],
    'Healthcare': ['Build patient trust', 'Comply with regulations'],
    'Finance': ['Establish credibility', 'Ensure security'],
    'Education': ['Engage students', 'Showcase programs']
  };
  
  let challenges = [...baseChallenges];
  
  if (typeSpecific[businessType as keyof typeof typeSpecific]) {
    challenges.push(...typeSpecific[businessType as keyof typeof typeSpecific]);
  }
  
  if (industrySpecific[industry as keyof typeof industrySpecific]) {
    challenges.push(...industrySpecific[industry as keyof typeof industrySpecific]);
  }
  
  return challenges.slice(0, 3);
}

function generateOpportunities(businessType: string, industry: string): string[] {
  const baseOpportunities = [
    'SEO optimization',
    'Content marketing strategy',
    'Social media presence',
    'Email marketing automation',
    'Analytics implementation'
  ];
  
  const typeSpecific = {
    'E-commerce': ['Product recommendation engine', 'Abandoned cart recovery', 'Upselling automation'],
    'Service Business': ['Client testimonials', 'Case studies', 'Service automation'],
    'Content/Media': ['Content distribution', 'Audience segmentation', 'Monetization strategies'],
    'Portfolio/Freelance': ['Portfolio optimization', 'Client acquisition', 'Personal branding']
  };
  
  const industrySpecific = {
    'Technology': ['Technical blog content', 'Developer documentation', 'Product demos'],
    'Healthcare': ['Patient education', 'Telehealth integration', 'Trust building'],
    'Finance': ['Educational content', 'Security showcasing', 'Client portals'],
    'Education': ['Course marketing', 'Student engagement', 'Alumni networks']
  };
  
  let opportunities = [...baseOpportunities];
  
  if (typeSpecific[businessType as keyof typeof typeSpecific]) {
    opportunities.push(...typeSpecific[businessType as keyof typeof typeSpecific]);
  }
  
  if (industrySpecific[industry as keyof typeof industrySpecific]) {
    opportunities.push(...industrySpecific[industry as keyof typeof industrySpecific]);
  }
  
  return opportunities.slice(0, 3);
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
} 