import { supabase } from '@/utils/supabase';
import { validateAgentInput, callOpenAI, callOpenAIWithFallback } from '@/utils/agentUtils';

import type { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

// Define input interface for Branding Agent
interface BrandingInput extends BaseAgentInput {
  businessName: string;
  industry: string;
  targetAudience: string;
  brandValues?: string[];
  colorPreferences?: string[];
  competitorUrls?: string[];
  existingAssets?: {
    logo?: string;
    colors?: string[];
    fonts?: string[];
  };
  stylePreferences?: 'modern' | 'classic' | 'minimalist' | 'bold' | 'playful' | 'luxury';
  moodKeywords?: string[];
  customInstructions?: string;
}

/**
 * OpenAI Integration: Uses callOpenAI for brand identity generation. If OpenAI fails, falls back to static/template logic.
 * Fallback is always logged and gracefully handled.
 */

/**
 * Branding Agent - Generates brand identity assets and guidelines
 * @param input - Branding parameters
 * @returns Promise with success status, message and optional data
 */
const runBranding = async (input: BrandingInput) => {
  try {
    // Validate input
    if (!input.userId || !input.businessName || !input.industry || !input.targetAudience) {
      throw new Error('Missing required fields: userId, businessName, industry, and targetAudience');
    }

    // Set defaults for optional parameters
    const brandingParams = {
      brandValues: input.brandValues || ['professional', 'trustworthy', 'innovative'],
      colorPreferences: input.colorPreferences || [],
      competitorUrls: input.competitorUrls || [],
      existingAssets: input.existingAssets || {},
      stylePreferences: input.stylePreferences || 'modern',
      moodKeywords: input.moodKeywords || [],
      customInstructions: input.customInstructions || ''
    };

    // Generate brand identity
    const brandIdentity = await generateBrandIdentity(
      input.businessName,
      input.industry,
      input.targetAudience,
      brandingParams
    );

    // Log the branding creation to Supabase
    const { error: logError } = await supabase
      .from('agent-logs')
      .insert({
        agent: 'brandingAgent',
        input,
        businessName: input.businessName,
        industry: input.industry,
        timestamp: new Date().toISOString()
      });
    if (logError) throw logError;

    // Save the generated branding to Supabase
    const { data: brandingData, error: brandingError } = await supabase
      .from('branding')
      .insert({
        userId: input.userId,
        businessName: input.businessName,
        industry: input.industry,
        targetAudience: input.targetAudience,
        brandIdentity,
        params: brandingParams,
        createdAt: new Date().toISOString(),
        status: 'completed'
      })
      .select();
    if (brandingError) throw brandingError;

    return {
      success: true,
      message: `Brand identity created successfully for ${input.businessName}`,
      data: {
        brandingId: brandingData[0].id,
        brandIdentity,
        metadata: {
          businessName: input.businessName,
          industry: input.industry,
          targetAudience: input.targetAudience,
          style: brandingParams.stylePreferences
        }
      }
    };
  } catch (error) {
    console.error('Branding agent failed:', error);
    return {
      success: false,
      message: `Branding agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate brand identity based on business details and parameters
 * @param businessName - Name of the business
 * @param industry - Business industry
 * @param targetAudience - Target audience description
 * @param params - Additional branding parameters
 * @returns Generated brand identity
 */
async function generateBrandIdentity(
  businessName: string,
  industry: string,
  targetAudience: string,
  params: {
    brandValues: string[];
    colorPreferences: string[];
    competitorUrls: string[];
    existingAssets: {
      logo?: string;
      colors?: string[];
      fonts?: string[];
    };
    stylePreferences: string;
    moodKeywords: string[];
    customInstructions: string;
  }
): Promise<any> {
  // Generate brand identity with OpenAI and proper fallback
  const prompt = `Generate a brand identity for a business.\nBusiness Name: ${businessName}\nIndustry: ${industry}\nTarget Audience: ${targetAudience}\nBrand Values: ${params.brandValues.join(', ')}\nColor Preferences: ${params.colorPreferences.join(', ')}\nStyle: ${params.stylePreferences}\nMood: ${params.moodKeywords.join(', ')}\nInstructions: ${params.customInstructions}`;
  
  const colorPalette = generateColorPalette(industry, params.stylePreferences, params.colorPreferences);
  const typography = generateTypography(params.stylePreferences);
  const logoDescription = generateLogoDescription(businessName, industry, params.stylePreferences);
  const brandVoice = generateBrandVoice(targetAudience, params.brandValues);
  const brandGuidelines = generateBrandGuidelines(businessName, colorPalette, typography, params.brandValues);
    
  try {
    const aiBrandIdentity = await callOpenAIWithFallback<string>(
      prompt,
      { maxTokens: 800 },
      () => {
        // Return a fallback string representing a brand identity summary
        return `${businessName} is a ${params.stylePreferences} brand in the ${industry} industry targeting ${targetAudience}. The brand embodies the values of ${params.brandValues.join(', ')} with a color palette based on ${params.colorPreferences.join(', ')}. The typography is clean and ${params.stylePreferences}, and the logo represents the essence of ${industry} business.`;
      }
    );
    
    return {
      businessName,
      industry,
      targetAudience,
      aiBrandIdentity,
      colorPalette,
      typography,
      logoDescription,
      brandVoice,
      brandGuidelines,
      stylePreferences: params.stylePreferences,
      brandValues: params.brandValues
    };
  } catch (err) {
    console.error('Error generating brand identity with AI:', err);
    
    // Fallback to completely static logic if even the wrapper fails
    return {
      businessName,
      industry,
      targetAudience,
      colorPalette,
      typography,
      logoDescription,
      brandVoice,
      brandGuidelines,
      stylePreferences: params.stylePreferences,
      brandValues: params.brandValues
    };
  }
}

/**
 * Generate a color palette based on industry and style preferences
 * @param industry - Business industry
 * @param stylePreference - Preferred style
 * @param colorPreferences - Preferred colors
 * @returns Color palette
 */
function generateColorPalette(industry: string, stylePreference: string, colorPreferences: string[]): any {
  // Industry-based color suggestions
  const industryColors: Record<string, any> = {
    technology: {
      primary: '#0078D7',
      secondary: '#50E6FF',
      accent: '#FFD700',
      neutral: '#F2F2F2',
      dark: '#333333'
    },
    healthcare: {
      primary: '#00A3E0',
      secondary: '#44D62C',
      accent: '#FF6B6B',
      neutral: '#F5F5F5',
      dark: '#2C3E50'
    },
    finance: {
      primary: '#006D77',
      secondary: '#83C5BE',
      accent: '#EE6C4D',
      neutral: '#F8F8F8',
      dark: '#293241'
    },
    education: {
      primary: '#4A90E2',
      secondary: '#7ED321',
      accent: '#F5A623',
      neutral: '#F0F0F0',
      dark: '#4A4A4A'
    },
    food: {
      primary: '#FF6B6B',
      secondary: '#FFE66D',
      accent: '#4ECDC4',
      neutral: '#F7F7F7',
      dark: '#292F36'
    },
    retail: {
      primary: '#FF5A5F',
      secondary: '#00A699',
      accent: '#FC642D',
      neutral: '#F7F7F7',
      dark: '#484848'
    }
  };
  
  // Style-based adjustments
  const styleAdjustments: Record<string, any> = {
    modern: {
      saturation: 1.0,
      brightness: 1.0
    },
    classic: {
      saturation: 0.8,
      brightness: 0.9
    },
    minimalist: {
      saturation: 0.6,
      brightness: 1.1
    },
    bold: {
      saturation: 1.2,
      brightness: 1.0
    },
    playful: {
      saturation: 1.1,
      brightness: 1.1
    },
    luxury: {
      saturation: 0.9,
      brightness: 0.8
    }
  };
  
  // Get base colors for the industry or default to technology
  const baseColors = industryColors[industry.toLowerCase()] || industryColors.technology;
  
  // Apply style adjustments (in a real implementation, this would actually modify the colors)
  const styleAdjustment = styleAdjustments[stylePreference] || styleAdjustments.modern;
  
  // Incorporate color preferences if provided
  if (colorPreferences && colorPreferences.length > 0) {
    // In a real implementation, this would intelligently incorporate preferred colors
    baseColors.accent = colorPreferences[0] || baseColors.accent;
  }
  
  return {
    primary: baseColors.primary,
    secondary: baseColors.secondary,
    accent: baseColors.accent,
    neutral: baseColors.neutral,
    dark: baseColors.dark,
    palette: [
      baseColors.primary,
      baseColors.secondary,
      baseColors.accent,
      baseColors.neutral,
      baseColors.dark
    ],
    styleAdjustment
  };
}

/**
 * Generate typography recommendations based on style preference
 * @param stylePreference - Preferred style
 * @returns Typography recommendations
 */
function generateTypography(stylePreference: string): any {
  const typographyOptions: Record<string, any> = {
    modern: {
      headingFont: 'Montserrat',
      bodyFont: 'Open Sans',
      accentFont: 'Roboto',
      headingWeight: 700,
      bodyWeight: 400
    },
    classic: {
      headingFont: 'Playfair Display',
      bodyFont: 'Merriweather',
      accentFont: 'Georgia',
      headingWeight: 700,
      bodyWeight: 400
    },
    minimalist: {
      headingFont: 'Helvetica Neue',
      bodyFont: 'Helvetica',
      accentFont: 'Arial',
      headingWeight: 500,
      bodyWeight: 300
    },
    bold: {
      headingFont: 'Futura',
      bodyFont: 'Roboto',
      accentFont: 'Impact',
      headingWeight: 800,
      bodyWeight: 400
    },
    playful: {
      headingFont: 'Quicksand',
      bodyFont: 'Nunito',
      accentFont: 'Pacifico',
      headingWeight: 600,
      bodyWeight: 400
    },
    luxury: {
      headingFont: 'Didot',
      bodyFont: 'Garamond',
      accentFont: 'Baskerville',
      headingWeight: 700,
      bodyWeight: 400
    }
  };
  
  return typographyOptions[stylePreference] || typographyOptions.modern;
}

/**
 * Generate logo description based on business details
 * @param businessName - Name of the business
 * @param industry - Business industry
 * @param stylePreference - Preferred style
 * @returns Logo description
 */
function generateLogoDescription(businessName: string, industry: string, stylePreference: string): any {
  // Industry-based icon suggestions
  const industryIcons: Record<string, string[]> = {
    technology: ['circuit', 'chip', 'code', 'connection', 'network'],
    healthcare: ['heart', 'pulse', 'cross', 'shield', 'leaf'],
    finance: ['chart', 'graph', 'shield', 'coin', 'building'],
    education: ['book', 'graduation-cap', 'pencil', 'lightbulb', 'brain'],
    food: ['fork', 'spoon', 'plate', 'chef-hat', 'wheat'],
    retail: ['bag', 'tag', 'store', 'hanger', 'gift']
  };
  
  // Style-based logo characteristics
  const styleCharacteristics: Record<string, any> = {
    modern: {
      shape: 'geometric',
      complexity: 'simple',
      treatment: 'flat'
    },
    classic: {
      shape: 'shield or emblem',
      complexity: 'detailed',
      treatment: 'textured'
    },
    minimalist: {
      shape: 'abstract',
      complexity: 'very simple',
      treatment: 'monochrome'
    },
    bold: {
      shape: 'strong geometric',
      complexity: 'medium',
      treatment: 'bold lines'
    },
    playful: {
      shape: 'rounded',
      complexity: 'medium',
      treatment: 'colorful'
    },
    luxury: {
      shape: 'elegant',
      complexity: 'refined',
      treatment: 'metallic or gradient'
    }
  };
  
  // Get relevant icon suggestions for the industry
  const iconSuggestions = industryIcons[industry.toLowerCase()] || industryIcons.technology;
  const randomIcon = iconSuggestions[Math.floor(Math.random() * iconSuggestions.length)];
  
  // Get style characteristics
  const style = styleCharacteristics[stylePreference] || styleCharacteristics.modern;
  
  return {
    concept: `A ${style.complexity} ${style.shape} logo for ${businessName}, featuring a stylized ${randomIcon} element with a ${style.treatment} design treatment.`,
    iconSuggestions,
    styleCharacteristics: style,
    variations: [
      `Wordmark: ${businessName} in a custom typeface with a subtle ${randomIcon} integration`,
      `Icon + Wordmark: A ${style.shape} ${randomIcon} icon paired with ${businessName} in a complementary typeface`,
      `Abstract: A ${style.complexity} abstract representation of a ${randomIcon} that forms the initials of ${businessName}`
    ]
  };
}

/**
 * Generate brand voice guidelines based on target audience and brand values
 * @param targetAudience - Target audience description
 * @param brandValues - Core brand values
 * @returns Brand voice guidelines
 */
function generateBrandVoice(targetAudience: string, brandValues: string[]): any {
  // Tone suggestions based on brand values
  const valueTones: Record<string, any> = {
    professional: {
      tone: 'authoritative and knowledgeable',
      vocabulary: 'industry-specific terminology balanced with clarity',
      sentenceStructure: 'clear, direct, and well-structured'
    },
    trustworthy: {
      tone: 'reliable and consistent',
      vocabulary: 'straightforward and honest',
      sentenceStructure: 'balanced and measured'
    },
    innovative: {
      tone: 'forward-thinking and dynamic',
      vocabulary: 'cutting-edge terminology with explanations',
      sentenceStructure: 'varied and engaging'
    },
    friendly: {
      tone: 'warm and approachable',
      vocabulary: 'conversational and relatable',
      sentenceStructure: 'casual but clear'
    },
    luxury: {
      tone: 'sophisticated and exclusive',
      vocabulary: 'refined and elegant',
      sentenceStructure: 'sophisticated with rich descriptions'
    },
    playful: {
      tone: 'energetic and fun',
      vocabulary: 'casual with wordplay and humor',
      sentenceStructure: 'varied with occasional surprises'
    }
  };
  
  // Compile tone recommendations based on brand values
  const toneRecommendations = brandValues.map(value => 
    valueTones[value.toLowerCase()] || valueTones.professional
  );
  
  // Create a composite tone profile
  const toneProfile = {
    primaryTone: toneRecommendations[0]?.tone || 'professional and approachable',
    vocabulary: toneRecommendations[0]?.vocabulary || 'clear and accessible',
    sentenceStructure: toneRecommendations[0]?.sentenceStructure || 'well-structured and engaging'
  };
  
  return {
    overview: `The brand voice for ${targetAudience} should be ${toneProfile.primaryTone}, using ${toneProfile.vocabulary} with ${toneProfile.sentenceStructure} sentences.`,
    toneAttributes: brandValues.map(value => valueTones[value.toLowerCase()]?.tone || value),
    doList: [
      'Speak directly to the audience needs and pain points',
      `Emphasize ${brandValues.join(', ')} in all communications`,
      'Maintain consistency across all platforms and touchpoints',
      'Use active voice and present tense when possible'
    ],
    dontList: [
      'Use jargon without explanation',
      'Adopt a tone that contradicts core brand values',
      'Use overly complex language that alienates the audience',
      'Be inconsistent in messaging across different channels'
    ],
    examples: {
      headlines: [
        `Transform Your ${targetAudience} Experience`,
        `The Smarter Approach to ${targetAudience} Challenges`,
        `Discover What Makes Us Different for ${targetAudience}`
      ],
      shortCopy: `We understand the unique challenges that ${targetAudience} face. That's why we've developed solutions that are not only effective but also align with your values and goals.`,
      emailSignature: `Looking forward to partnering with you,\nThe Team`
    }
  };
}

/**
 * Generate brand guidelines document
 * @param businessName - Name of the business
 * @param colorPalette - Color palette
 * @param typography - Typography recommendations
 * @param brandValues - Core brand values
 * @returns Brand guidelines
 */
function generateBrandGuidelines(
  businessName: string,
  colorPalette: any,
  typography: any,
  brandValues: string[]
): any {
  return {
    title: `${businessName} Brand Guidelines`,
    introduction: `This document outlines the core elements of the ${businessName} brand identity. Consistent application of these guidelines will help maintain brand integrity across all touchpoints.`,
    sections: [
      {
        title: 'Brand Essence',
        content: `${businessName} is defined by its commitment to ${brandValues.join(', ')}. These values should be reflected in all brand expressions.`
      },
      {
        title: 'Logo Usage',
        content: 'The logo should always be used according to these specifications to maintain brand recognition and integrity.',
        specifications: [
          'Maintain clear space around the logo equal to the height of the logo mark',
          'Never distort, rotate, or alter the logo colors',
          'Minimum size for digital: 40px height; for print: 0.5 inches height',
          'Use the reversed (white) version on dark backgrounds'
        ]
      },
      {
        title: 'Color Palette',
        content: 'The brand colors should be used consistently across all materials.',
        colors: [
          {
            name: 'Primary',
            hex: colorPalette.primary,
            usage: 'Main brand color, use for primary elements and CTAs'
          },
          {
            name: 'Secondary',
            hex: colorPalette.secondary,
            usage: 'Supporting color, use for secondary elements and accents'
          },
          {
            name: 'Accent',
            hex: colorPalette.accent,
            usage: 'Highlight color, use sparingly for emphasis'
          },
          {
            name: 'Neutral',
            hex: colorPalette.neutral,
            usage: 'Background color and text areas'
          },
          {
            name: 'Dark',
            hex: colorPalette.dark,
            usage: 'Text color and dark elements'
          }
        ]
      },
      {
        title: 'Typography',
        content: 'Consistent typography helps maintain brand recognition.',
        fonts: [
          {
            name: typography.headingFont,
            usage: 'Headings and titles',
            weights: [typography.headingWeight]
          },
          {
            name: typography.bodyFont,
            usage: 'Body text and general content',
            weights: [typography.bodyWeight, 700]
          },
          {
            name: typography.accentFont,
            usage: 'Accent text, callouts, and special elements',
            weights: [400, 600]
          }
        ]
      },
      {
        title: 'Imagery Style',
        content: 'Images should reflect the brand personality and appeal to the target audience.',
        guidelines: [
          'Use high-quality, authentic imagery',
          'Maintain consistent color treatment across all images',
          'Prefer images that convey the brand values',
          'Avoid clichéd stock photography'
        ]
      }
    ],
    conclusion: `Consistent application of these guidelines will help build and maintain a strong brand identity for ${businessName}. For questions or additional guidance, please contact the brand team.`
  };
}

const brandingAgent: Agent = {
  id: 'branding-agent',
  name: 'Branding',
  category: 'Branding',
  description: 'AI-powered brand identity and guidelines generation',
  visible: true,
  agentCategory: ['branding'],
  config: {
    name: 'Branding',
    description: 'AI-powered brand identity and guidelines generation',
    capabilities: ['Brand Identity', 'Color Palette', 'Typography', 'Logo Design', 'Brand Voice']
  },
  capabilities: [
    'brand identity',
    'logo design',
    'color palette',
    'typography',
    'brand guidelines',
    'brand voice',
    'brand strategy',
    'visual branding',
    'brand assets'
  ],
  runAgent: async (input: BaseAgentInput) => {
    // Use the validator helper for cleaner, safer type handling
    const extendedInput = input as unknown as Record<string, any>;
    
    // Validate branding-specific fields
    const brandingFields = validateAgentInput(
      extendedInput,
      ['businessName', 'industry', 'targetAudience', 'brandValues', 'competitorBrands', 'colorPreferences', 'stylePreferences'],
      {
        // Type validation functions
        businessName: (val) => typeof val === 'string',
        industry: (val) => typeof val === 'string',
        targetAudience: (val) => typeof val === 'string',
        brandValues: (val) => Array.isArray(val),
        competitorBrands: (val) => Array.isArray(val),
        colorPreferences: (val) => Array.isArray(val),
        stylePreferences: (val) => typeof val === 'string'
      },
      {
        // Default values
        businessName: '',
        industry: '',
        targetAudience: '',
        brandValues: [],
        competitorBrands: [],
        colorPreferences: [],
        stylePreferences: 'modern'
      }
    );
    
    // Create the final input with both base and extended fields
    const brandingInput: BrandingInput = {
      userId: input.userId,
      goal: input.goal,
      content: input.content,
      context: input.context,
      options: input.options,
      ...brandingFields
    };
    
    return runBranding(brandingInput);
  },
  roleRequired: "any",
};

brandingAgent.usageCount = undefined;
brandingAgent.lastRun = undefined;
brandingAgent.performanceScore = undefined;

// Agent capabilities
const capabilities = 'Generates brand identity, color palette, typography, logo description, and brand guidelines.';

export function getCapabilities() {
  return capabilities;
}

// Test function for agent
export async function testBrandingAgent(simulateFailure = false) {
  // ✅ Type-safe mockInput block for testing
  const mockInput: {
    userId: string;
    goal: string;
    businessName: string;
    industry: string;
    targetAudience: string;
    brandValues: string[];
    colorPreferences: string[];
    stylePreferences: 'modern';
    moodKeywords: string[];
    customInstructions: string;
  } = {
    userId: 'test-user',
    goal: 'Branding',
    businessName: 'TestCo',
    industry: 'technology',
    targetAudience: 'startups',
    brandValues: ['innovative', 'trustworthy'],
    colorPreferences: ['#0078D7'],
    stylePreferences: 'modern', // valid literal
    moodKeywords: ['energetic'],
    customInstructions: 'Make it bold and modern.'
  };
  if (simulateFailure) {
    process.env.OPENAI_API_KEY = 'sk-invalid';
  }
  try {
    const result = await runBranding(mockInput);
    console.log('[BrandingAgent Test]', result);
  } catch (err) {
    console.error('[BrandingAgent Test] Fallback triggered:', err);
  }
}

export { brandingAgent };
export default brandingAgent;