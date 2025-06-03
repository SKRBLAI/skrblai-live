import type { Agent } from '@/types/agent';
import OpenAI from 'openai';

// Helper function to get emoji based on agent category
export function getAgentEmoji(category: string): string {
  const categoryEmojis: Record<string, string> = {
    'content': '✍️',
    'branding': '🎨',
    'social': '📱',
    'analytics': '📊',
    'video': '🎥',
    'assistant': '🤖',
    'publishing': '📚',
    'business': '💼',
    'website': '🌐',
  };
  return categoryEmojis[category.toLowerCase()] || '🤖';
}

// Get gradient colors based on agent category
export function getAgentGradient(category: string): string {
  const gradients: Record<string, string> = {
    'content': 'from-purple-400 to-blue-500',
    'branding': 'from-pink-500 to-rose-500',
    'social': 'from-sky-400 to-blue-600',
    'analytics': 'from-emerald-400 to-teal-600',
    'video': 'from-red-400 to-pink-600',
    'default': 'from-blue-400 to-indigo-600',
  };
  return gradients[category.toLowerCase()] || gradients.default;
}

// Format agent name with proper capitalization
export function formatAgentName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Safely validates and extracts specific fields from an input object
 * Use this to handle extended fields from AgentInput that aren't in the base type
 */
export function validateAgentInput<T extends string>(
  input: Record<string, any>, 
  fields: T[],
  typeChecks?: Partial<Record<T, (val: any) => boolean>>,
  defaults?: Partial<Record<T, any>>
): Record<T, any> {
  return fields.reduce((acc, field) => {
    // Get the value, possibly undefined
    const value = input?.[field];
    // Determine if valid using custom type check or just check if defined
    const isValid = typeChecks?.[field] ? typeChecks[field]!(value) : value !== undefined;
    // Use the value if valid, or the default (which can be undefined)
    acc[field] = isValid ? value : defaults?.[field];
    return acc;
  }, {} as Record<T, any>);
}

// Utility to call OpenAI API (shared by all agents)
export async function callOpenAI(
  prompt: string, 
  options?: { maxTokens?: number; temperature?: number; model?: string }
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || (typeof window === 'undefined' && (global as any).process?.env?.OPENAI_API_KEY);
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY in environment variables');
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: options?.maxTokens || 512,
    temperature: options?.temperature ?? 0.7,
  });
  return response.choices[0]?.message?.content?.trim() || '';
}

/**
 * Enhanced OpenAI API call utility with retry logic, error handling, and fallback support
 */
export async function callOpenAIWithFallback<T = string>(
  prompt: string, 
  options: { 
    maxTokens?: number; 
    temperature?: number; 
    model?: string;
    retries?: number;
    retryDelay?: number;
  } = {},
  fallback?: (() => Promise<T> | T) | T
): Promise<T> {
  const {
    maxTokens = 512,
    temperature = 0.7,
    model = 'gpt-3.5-turbo',
    retries = 3,
    retryDelay = 1000
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI attempt ${attempt}/${retries} for prompt: ${prompt.substring(0, 50)}...`);
      const response = await callOpenAI(prompt, { maxTokens, temperature, model });
      if (typeof response !== 'string' || response.trim().length === 0) {
        throw new Error('Invalid or empty response from OpenAI');
      }
      return response as unknown as T;
    } catch (error) {
      lastError = error as Error;
      console.warn(`OpenAI attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  if (fallback !== undefined) {
    console.log('Using fallback for OpenAI call');
    try {
      if (typeof fallback === 'function') {
        return await (fallback as () => Promise<T> | T)();
      } else {
        return fallback as T;
      }
    } catch (fallbackError) {
      console.error('Fallback function also failed:', fallbackError);
      throw lastError || new Error('OpenAI call failed and fallback also failed');
    }
  }
  console.error('OpenAI call failed and no fallback provided');
  throw lastError || new Error('OpenAI call failed');
}

// --- NEW: Agent grouping utility for constellation UI ---
/**
 * Utility to split a list of agents into groups of N for constellation reveals or UI.
 * Example: getAgentSets(agents, 3) => [[agent1,agent2,agent3],[agent4,agent5,agent6],...]
 */
export function getAgentSets<T = any>(agents: T[], groupSize: number): T[][] {
  const sets: T[][] = [];
  for (let i = 0; i < agents.length; i += groupSize) {
    sets.push(agents.slice(i, i + groupSize));
  }
  return sets;
}

// Percy Smart Agent Matching: Capability-based agent suggestion
export function getBestAgents(prompt: string, agents?: any[]): any[] {
  if (!prompt || typeof prompt !== 'string' || !agents) return [];
  const lowerPrompt = prompt.toLowerCase();
  const promptWords = lowerPrompt.split(/\W+/).filter(Boolean);
  const scored = agents.map(agent => {
    let score = 0;
    let matchedCapabilities: string[] = [];
    if (Array.isArray(agent.capabilities)) {
      for (const cap of agent.capabilities) {
        const capLower = cap.toLowerCase();
        for (const word of promptWords) {
          if (capLower.includes(word)) {
            score++;
            matchedCapabilities.push(cap);
          }
        }
      }
    }
    if (score > 0) {
      console.debug(`[PercyMatch] Matched agent '${agent.name}' with capabilities: [${matchedCapabilities.join(', ')}] for prompt: '${prompt}'`);
    }
    return { agent, score, matchedCapabilities };
  });
  scored.sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name));
  const top = scored.filter(s => s.score > 0).slice(0, 3).map(s => s.agent);
  return top;
}

// --- Percy Smart Agent Matching Test Block ---
// Removed to prevent client-side crashes from agentRegistry import

export function getAgentImageSlug(agent: Agent): string {
  return agent.id.replace(/-agent$/, '').replace(/Agent$/, '').toLowerCase();
}

/**
 * Get the image path for an agent with CDN optimization
 * Supports both local images and Cloudinary-hosted images
 * @param agent - The agent object
 * @param options - Image optimization options
 */
export function getAgentImagePath(agent: any, options: {
  webp?: boolean;
  quality?: number;
  size?: string;
  cdn?: boolean;
  useCloudinary?: boolean;
  cloudinaryTransformation?: string;
  fallbackToLocal?: boolean;
} = {}): string {
  const {
    webp = false,
    quality = 85,
    size = 'original',
    cdn = true,
    useCloudinary = false,
    cloudinaryTransformation = '',
    fallbackToLocal = true
  } = options;

  // Use agent's imageSlug or generate from agent data
  const imageSlug = agent?.imageSlug || getAgentImageSlug(agent);
  
  if (!imageSlug) {
    console.warn(`No image slug found for agent:`, agent?.name || agent?.id);
    return '/images/default-agent.png';
  }

  // Check if agent has a direct cloudinaryUrl property
  if (useCloudinary && agent?.cloudinaryUrl) {
    // Direct URL provided - use as is or with transformations
    let cloudinaryUrl = agent.cloudinaryUrl;
    
    // Add transformations if not already present and requested
    if (cloudinaryUrl && cloudinaryTransformation && !cloudinaryUrl.includes('/upload/')) {
      // Extract the base URL up to /upload/ and add transformations
      const baseUrlParts = cloudinaryUrl.match(/(.*\/upload\/)(.*)/);
      if (baseUrlParts && baseUrlParts.length >= 3) {
        cloudinaryUrl = `${baseUrlParts[1]}${cloudinaryTransformation}/${baseUrlParts[2]}`;
      }
    }
    
    return cloudinaryUrl;
  }

  // If Cloudinary is requested but no direct URL exists, construct a Cloudinary URL
  if (useCloudinary) {
    try {
      // Get Cloudinary cloud name from env or use default
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'skrblai';
      
      // Format: https://res.cloudinary.com/cloudName/image/upload/transformations/folder/filename
      let transformations = [];
      
      // Add size transformation if specified
      if (size !== 'original') {
        transformations.push(`w_${getSizePixels(size)}`);  
      }
      
      // Add quality transformation if specified
      if (quality < 100) {
        transformations.push(`q_${quality}`);
      }
      
      // Add format transformation if specified
      if (webp) {
        transformations.push('f_webp');
      }
      
      // Add custom transformations if provided
      if (cloudinaryTransformation) {
        transformations.push(cloudinaryTransformation);
      }
      
      // Construct the transformation string
      const transformationString = transformations.length > 0 
        ? transformations.join(',') + '/' 
        : '';
      
      // Construct the Cloudinary URL
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}skrblai/agents/${imageSlug}-nobg.png`;
    } catch (error) {
      console.error('Error constructing Cloudinary URL:', error);
      // Fall back to local image if specified
      if (!fallbackToLocal) {
        return '/images/default-agent.png';
      }
      // Otherwise continue to local image construction below
    }
  }

  // Build base image path using existing format (local image)
  let imagePath = `/images/agents-${imageSlug}-nobg-skrblai.png`;
  
  // Use WebP if supported and requested
  if (webp) {
    imagePath = `/images/agents-${imageSlug}-nobg-skrblai.webp`;
  }

  // Add CDN query parameters for optimization
  if (cdn) {
    const params = new URLSearchParams();
    
    // Quality optimization
    if (quality < 100) {
      params.append('q', quality.toString());
    }
    
    // Size optimization
    if (size !== 'original') {
      params.append('w', getSizePixels(size).toString());
    }
    
    // Format optimization
    if (webp) {
      params.append('fm', 'webp');
    }
    
    // Auto-optimization
    params.append('auto', 'compress,format');
    
    // Add cache busting for updates
    params.append('v', '2.0');
    
    if (params.toString()) {
      imagePath += `?${params.toString()}`;
    }
  }

  return imagePath;
}

/**
 * Convert size string to pixels
 */
function getSizePixels(size: string): number {
  const sizeMap: Record<string, number> = {
    'thumb': 64,
    'small': 128,
    'medium': 256,
    'large': 512,
    'xl': 1024
  };
  
  return sizeMap[size] || 256;
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(agent: any, context: string = 'default') {
  const isWebPSupported = supportsWebP();
  
  // Context-specific optimizations
  const contextSettings = {
    constellation: { quality: 80, size: 'medium' },
    carousel: { quality: 85, size: 'medium' },
    card: { quality: 90, size: 'large' },
    hero: { quality: 95, size: 'xl' },
    mobile: { quality: 75, size: 'small' },
    default: { quality: 85, size: 'medium' }
  };
  
  const settings = contextSettings[context as keyof typeof contextSettings] || contextSettings.default;
  
  return {
    src: getAgentImagePath(agent, {
      webp: isWebPSupported,
      quality: settings.quality,
      size: settings.size
    }),
    alt: agent?.role || agent?.name || 'AI Agent',
    loading: context === 'hero' ? 'eager' as const : 'lazy' as const,
    priority: context === 'hero',
    quality: settings.quality,
    sizes: getResponsiveSizes(context)
  };
}

/**
 * Get responsive sizes for different contexts
 */
function getResponsiveSizes(context: string): string {
  const sizesMap: Record<string, string> = {
    constellation: '(max-width: 768px) 64px, 96px',
    carousel: '(max-width: 768px) 128px, 256px',
    card: '(max-width: 768px) 256px, 512px',
    hero: '(max-width: 768px) 256px, 512px',
    mobile: '64px',
    default: '(max-width: 768px) 128px, 256px'
  };
  
  return sizesMap[context] || sizesMap.default;
}

// Development validation moved to server-side only to prevent client-side crashes
// Original code used fs and path modules which are not available in browser

export function getDefaultOrbitParams(index: number): { radius: number; speed: number; angle: number } {
  // Example: spread agents in a circle, vary speed slightly
  const baseRadius = 200;
  const baseSpeed = 0.02;
  return {
    radius: baseRadius + (index * 30),
    speed: baseSpeed + (index * 0.002),
    angle: (index * (360 / 12)) % 360
  };
}

// New: Validate agents metadata in development
export function validateAgents(agents: Agent[]): void {
  agents.forEach(agent => {
    const issues: string[] = [];
    if (!agent.id) issues.push('missing id');
    if (!agent.name) issues.push('missing name');
    if (!agent.description) issues.push('missing description');
    if (!agent.category) issues.push('missing category');
    if (!['male', 'female', 'neutral'].includes(agent.gender || '')) {
      issues.push(`invalid gender: ${agent.gender}`);
    }
    if (!agent.capabilities || agent.capabilities.length === 0) {
      issues.push('no capabilities');
    }
    if (!agent.imageSlug) issues.push('missing imageSlug');
    if (!agent.route) issues.push('missing route');
    if (!agent.orbit) issues.push('missing orbit config');
    if (!agent.hoverSummary) issues.push('missing hoverSummary');

    if (issues.length > 0) {
      console.warn(`⚠️ Agent [${agent.name || agent.id}] has issues:`, issues);
    }
  });
  console.log('✅ Agent validation completed.');
}

// Validator for duplicate taglines or prompt bars in production
export function validateHomepageUI() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  // Check for multiple taglines
  const taglineEls = document.querySelectorAll('[data-testid="skrbl-tagline"]');
  if (taglineEls.length > 1) {
    console.warn(`⚠️ Multiple taglines detected: ${taglineEls.length}`);
  }
  // Check for multiple prompt bars
  const promptBarEls = document.querySelectorAll('[data-testid="universal-prompt-bar"]');
  if (promptBarEls.length > 1) {
    console.warn(`⚠️ Multiple UniversalPromptBar components detected: ${promptBarEls.length}`);
  }
}

// Validate agents displayed in orbit
export function validateOrbitAgentAvatars(agents: Agent[]): void {
  // Just perform a basic check that displayInOrbit agents are properly configured
  agents.forEach(agent => {
    if (agent.displayInOrbit && agent.visible !== false) {
      // Ensure the agent has an imageSlug or id that can be used for the image
      if (!agent.imageSlug && !agent.id) {
        console.warn(`⚠️ Agent [${agent.name}] is set to displayInOrbit but has no imageSlug or id`);
      }
    }
  });
}
