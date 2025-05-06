import { db, collection, addDoc } from '@/utils/firebase';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

// Define input interface for Site Generation Agent
interface SiteGenInput extends BaseAgentInput {
  businessName: string;
  industry: string;
  pages: string[];
  design?: 'modern' | 'classic' | 'minimalist' | 'bold' | 'playful' | 'luxury';
  colorScheme?: string[];
  features?: string[];
  targetAudience?: string;
  logoUrl?: string;
  customInstructions?: string;
}

/**
 * Site Generation Agent - Creates website structure and content
 * @param input - Website generation parameters
 * @returns Promise with success status, message and optional data
 */
const runSiteGen = async (input: SiteGenInput) =>  {
  try {
    // Validate input
    if (!input.userId || !input.businessName || !input.industry || !input.pages || input.pages.length === 0) {
      throw new Error('Missing required fields: userId, businessName, industry, and pages');
    }

    // Set defaults for optional parameters
    const siteParams = {
      design: input.design || 'modern',
      colorScheme: input.colorScheme || ['#0078D7', '#50E6FF', '#FFD700', '#F2F2F2', '#333333'],
      features: input.features || ['responsive', 'contact-form', 'seo-optimized'],
      targetAudience: input.targetAudience || 'general',
      logoUrl: input.logoUrl || '',
      customInstructions: input.customInstructions || ''
    };

    // Generate website structure (simplified for this implementation)
    const websiteStructure = {
      businessName: input.businessName,
      industry: input.industry,
      pages: input.pages.map(page => ({
        name: page,
        slug: page.toLowerCase().replace(/\s+/g, '-'),
        sections: generatePageSections(page, input.businessName, input.industry)
      })),
      design: siteParams.design,
      colorScheme: siteParams.colorScheme,
      features: siteParams.features,
      navigation: {
        primary: input.pages.map(page => ({
          label: page,
          url: `/${page.toLowerCase().replace(/\s+/g, '-')}`
        })),
        footer: [
          { label: 'Privacy Policy', url: '/privacy-policy' },
          { label: 'Terms of Service', url: '/terms-of-service' },
          { label: 'Contact', url: '/contact' }
        ]
      },
      meta: {
        title: `${input.businessName} - ${input.industry}`,
        description: `${input.businessName} provides professional ${input.industry} services tailored for ${siteParams.targetAudience}.`,
        keywords: [input.businessName, input.industry, ...siteParams.features]
      }
    };

    // Log the website generation to Firestore
    await addDoc(collection(db, 'agent-logs'), {
      agent: 'sitegenAgent',
      input,
      businessName: input.businessName,
      industry: input.industry,
      timestamp: new Date().toISOString()
    });

    // Save the generated website structure to Firestore
    const websiteRef = await addDoc(collection(db, 'websites'), {
      userId: input.userId,
      businessName: input.businessName,
      industry: input.industry,
      structure: websiteStructure,
      params: siteParams,
      createdAt: new Date().toISOString(),
      status: 'completed',
      deploymentUrl: '',
      repositoryUrl: ''
    });

    return {
      success: true,
      message: `Website structure generated successfully for ${input.businessName}`,
      data: {
        websiteId: websiteRef.id,
        structure: websiteStructure,
        metadata: {
          businessName: input.businessName,
          industry: input.industry,
          pageCount: input.pages.length,
          design: siteParams.design
        }
      }
    };
  } catch (error) {
    console.error('Site generation agent failed:', error);
    return {
      success: false,
      message: `Site generation agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate sections for a page based on page name
 * @param pageName - Name of the page
 * @param businessName - Name of the business
 * @param industry - Business industry
 * @returns Array of page sections
 */
function generatePageSections(pageName: string, businessName: string, industry: string): any[] {
  const pageNameLower = pageName.toLowerCase();
  
  if (pageNameLower === 'home' || pageNameLower === 'homepage') {
    return [
      { type: 'hero', title: `Welcome to ${businessName}`, subtitle: `Your trusted partner in ${industry}` },
      { type: 'features', title: 'Our Services' },
      { type: 'testimonials', title: 'What Our Clients Say' },
      { type: 'cta', title: 'Ready to Get Started?', buttonText: 'Contact Us' }
    ];
  } else if (pageNameLower === 'about' || pageNameLower === 'about us') {
    return [
      { type: 'header', title: 'About Us' },
      { type: 'text', title: 'Our Story' },
      { type: 'team', title: 'Meet Our Team' },
      { type: 'values', title: 'Our Values' }
    ];
  } else if (pageNameLower === 'services' || pageNameLower === 'products') {
    return [
      { type: 'header', title: pageNameLower === 'services' ? 'Our Services' : 'Our Products' },
      { type: 'grid', title: '' },
      { type: 'pricing', title: 'Pricing' },
      { type: 'faq', title: 'Frequently Asked Questions' }
    ];
  } else if (pageNameLower === 'contact') {
    return [
      { type: 'header', title: 'Contact Us' },
      { type: 'contact-form', title: 'Get in Touch' },
      { type: 'map', title: 'Our Location' },
      { type: 'contact-info', title: 'Contact Information' }
    ];
  } else if (pageNameLower === 'blog' || pageNameLower === 'news') {
    return [
      { type: 'header', title: pageNameLower === 'blog' ? 'Our Blog' : 'Latest News' },
      { type: 'blog-grid', title: '' },
      { type: 'categories', title: 'Categories' },
      { type: 'newsletter', title: 'Subscribe to Our Newsletter' }
    ];
  } else {
    // Default sections for custom pages
    return [
      { type: 'header', title: pageName },
      { type: 'text', title: '' },
      { type: 'image', title: '' },
      { type: 'cta', title: 'Learn More', buttonText: 'Contact Us' }
    ];
  }
}

const sitegenAgent: Agent = {
  id: 'sitegen-agent',
  name: 'Site Generator',
  category: 'Web',
  description: 'AI-powered website structure and content generation',
  visible: true,
  config: {
    name: 'Site Generator',
    description: 'AI-powered website structure and content generation',
    capabilities: ['Page Structure', 'Content Generation', 'Design System', 'SEO Optimization']
  },
  runAgent: async (input: BaseAgentInput) => {
    // Cast the base input to site gen input with required fields
    const siteGenInput: SiteGenInput = {
      ...input,
      businessName: (input as any).businessName || '',
      industry: (input as any).industry || '',
      pages: (input as any).pages || ['home', 'about', 'contact']
    };
    return runSiteGen(siteGenInput);
  }
};

export { sitegenAgent };
export default sitegenAgent;