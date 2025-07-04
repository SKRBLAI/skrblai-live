/**
 * Mock LinkedIn Integration for Demo
 * This is a placeholder for future LinkedIn OAuth implementation
 */

export interface LinkedInProfile {
  id: string;
  name: string;
  headline: string;
  industry: string;
  location: string;
  connections: number;
  profilePicture?: string;
  currentPosition?: {
    title: string;
    company: string;
    duration: string;
  };
  skills?: string[];
  summary?: string;
}

export interface BusinessScanResult {
  strengths: string[];
  gaps: string[];
  suggestedAgents: string[];
  industryInsights: string;
  growthPotential: 'low' | 'medium' | 'high';
  competitorAnalysis?: string;
}

/**
 * Mock LinkedIn OAuth flow
 * In production, this would redirect to LinkedIn's OAuth endpoint
 */
export async function initiateLinkedInAuth(): Promise<void> {
  console.log('[LinkedIn Mock] Initiating OAuth flow...');
  
  // In production:
  // const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  // const redirectUri = `${window.location.origin}/api/auth/linkedin/callback`;
  // const state = generateRandomState();
  // const scope = 'r_liteprofile r_emailaddress w_member_social';
  // 
  // window.location.href = `https://www.linkedin.com/oauth/v2/authorization?` +
  //   `response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&` +
  //   `state=${state}&scope=${scope}`;
  
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Mock function to get LinkedIn profile data
 * In production, this would fetch from LinkedIn API
 */
export async function getLinkedInProfile(accessToken?: string): Promise<LinkedInProfile> {
  console.log('[LinkedIn Mock] Fetching profile data...');
  
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return {
    id: 'mock-linkedin-123',
    name: 'John Doe',
    headline: 'CEO & Founder at TechStartup Inc.',
    industry: 'Technology',
    location: 'San Francisco, CA',
    connections: 500,
    profilePicture: 'https://ui-avatars.com/api/?name=John+Doe&background=0077B5&color=fff',
    currentPosition: {
      title: 'CEO & Founder',
      company: 'TechStartup Inc.',
      duration: '2 years'
    },
    skills: ['Leadership', 'Strategic Planning', 'Digital Marketing', 'Product Development', 'AI/ML'],
    summary: 'Passionate entrepreneur building the future of AI-powered business automation.'
  };
}

/**
 * Mock business scan based on LinkedIn profile
 * In production, this would use AI to analyze the profile data
 */
export async function scanBusinessFromLinkedIn(profile: LinkedInProfile): Promise<BusinessScanResult> {
  console.log('[LinkedIn Mock] Analyzing business profile...');
  
  // Mock delay for analysis
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock insights based on profile
  const industryAgentMap: Record<string, string[]> = {
    'Technology': ['branding', 'site', 'analytics', 'contentcreation'],
    'Marketing': ['social', 'adcreative', 'analytics', 'contentcreation'],
    'Finance': ['analytics', 'proposal', 'biz'],
    'Healthcare': ['contentcreation', 'site', 'clientsuccess'],
    'Retail': ['adcreative', 'social', 'payment'],
    'default': ['contentcreation', 'branding', 'analytics']
  };
  
  const suggestedAgents = industryAgentMap[profile.industry] || industryAgentMap['default'];
  
  return {
    strengths: [
      'Strong leadership presence',
      'Established industry connections',
      'Clear value proposition',
      'Growth-oriented mindset'
    ],
    gaps: [
      'Digital marketing automation',
      'Content creation at scale',
      'Data-driven decision making',
      'Social media presence'
    ],
    suggestedAgents,
    industryInsights: `The ${profile.industry} industry is rapidly adopting AI automation. Your profile shows strong potential for leveraging our AI agents to scale operations and reach.`,
    growthPotential: 'high',
    competitorAnalysis: 'Competitors in your space are investing heavily in digital transformation. SKRBL AI can help you stay ahead.'
  };
}

/**
 * Mock website scanner
 * In production, this would use web scraping and AI analysis
 */
export async function scanWebsite(url: string): Promise<BusinessScanResult> {
  console.log(`[Website Mock] Scanning ${url}...`);
  
  // Validate URL
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch (error) {
    throw new Error('Invalid URL format');
  }
  
  // Mock delay for scanning
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Generate mock insights based on URL patterns
  let suggestedAgents = ['contentcreation', 'branding', 'analytics'];
  let industryGuess = 'General Business';
  
  if (url.includes('shop') || url.includes('store')) {
    suggestedAgents = ['adcreative', 'social', 'payment', 'analytics'];
    industryGuess = 'E-commerce';
  } else if (url.includes('blog') || url.includes('news')) {
    suggestedAgents = ['contentcreation', 'publishing', 'social'];
    industryGuess = 'Publishing/Media';
  } else if (url.includes('saas') || url.includes('app')) {
    suggestedAgents = ['site', 'contentcreation', 'analytics', 'proposal'];
    industryGuess = 'SaaS/Technology';
  }
  
  return {
    strengths: [
      'Professional web presence',
      'Mobile-responsive design',
      'Clear navigation structure',
      'Established brand identity'
    ],
    gaps: [
      'SEO optimization opportunities',
      'Content freshness',
      'Conversion rate optimization',
      'Marketing automation'
    ],
    suggestedAgents,
    industryInsights: `Your website shows characteristics of a ${industryGuess} business. There are significant opportunities to enhance your digital presence with AI automation.`,
    growthPotential: 'medium',
    competitorAnalysis: 'Based on industry standards, implementing AI-powered content and marketing automation could increase your conversion rates by 25-40%.'
  };
}

/**
 * Helper to format scan results for Percy's conversation
 */
export function formatScanResultsForPercy(results: BusinessScanResult, source: 'linkedin' | 'website'): string {
  const emoji = source === 'linkedin' ? '💼' : '🌐';
  
  let message = `${emoji} Cosmic scan complete! Here's what I discovered:\n\n`;
  
  message += `✨ **Strengths:**\n`;
  results.strengths.forEach(strength => {
    message += `• ${strength}\n`;
  });
  
  message += `\n🎯 **Growth Opportunities:**\n`;
  results.gaps.forEach(gap => {
    message += `• ${gap}\n`;
  });
  
  message += `\n📈 **Growth Potential:** ${results.growthPotential.toUpperCase()}\n`;
  message += `\n${results.industryInsights}`;
  
  return message;
} 