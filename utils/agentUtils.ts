import path from 'path';
import fs from 'fs';
import agentRegistry from '@/lib/agents/agentRegistry';
import type { Agent } from '@/types/agent';

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
 * 
 * @param input - The input object to validate (usually from BaseAgentInput)
 * @param fields - Array of field names to validate and extract
 * @param typeChecks - Optional object with type validation functions for each field
 * @param defaults - Optional object with default values for each field
 * @returns Record with validated fields
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
import OpenAI from 'openai';

export async function callOpenAI(prompt: string, options?: { maxTokens?: number; temperature?: number; model?: string }): Promise<string> {
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
 * @param prompt - The prompt to send to OpenAI
 * @param options - Configuration options for the API call
 * @param fallback - Optional fallback function or value if OpenAI call fails
 * @returns Promise resolving to either the OpenAI response or fallback value
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

  // Attempt OpenAI call with retries
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI attempt ${attempt}/${retries} for prompt: ${prompt.substring(0, 50)}...`);
      
      const response = await callOpenAI(prompt, { 
        maxTokens, 
        temperature, 
        model
      });
      
      // Validate response
      if (typeof response !== 'string' || response.trim().length === 0) {
        throw new Error('Invalid or empty response from OpenAI');
      }
      
      return response as unknown as T;
    } catch (error) {
      lastError = error as Error;
      console.warn(`OpenAI attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All retries failed, use fallback if provided
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

  // No fallback provided
  console.error('OpenAI call failed and no fallback provided');
  throw lastError || new Error('OpenAI call failed');
}

// Percy Smart Agent Matching: Capability-based agent suggestion

/**
 * Returns the best matching agents for a given prompt or intent, using capability-based matching.
 * @param prompt - User's prompt or intent
 * @returns Top 2–3 most relevant agents
 */
export function getBestAgents(prompt: string): any[] {
  if (!prompt || typeof prompt !== 'string') return [];
  const lowerPrompt = prompt.toLowerCase();
  const promptWords = lowerPrompt.split(/\W+/).filter(Boolean);

  // Score each agent by number of capability matches
  const scored = agentRegistry.map(agent => {
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

  // Sort by score descending, then by agent name
  scored.sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name));
  const top = scored.filter(s => s.score > 0).slice(0, 3).map(s => s.agent);
  return top;
}

// --- Percy Smart Agent Matching Test Block ---
if (process.env.NODE_ENV === 'development') {
  const testPrompt = "I need help with publishing my children's ebook";
  const best = getBestAgents(testPrompt);
  console.debug('[PercyMatch][Test] For prompt:', testPrompt);
  best.forEach(agent => {
    console.debug(`[PercyMatch][Test] Suggested agent: ${agent.name} (Capabilities: ${agent.capabilities.join(', ')})`);
  });
}

export function getAgentImageSlug(agent: Agent): string {
  return agent.id.replace(/-agent$/, '').replace(/Agent$/, '').toLowerCase();
}

if (process.env.NODE_ENV === 'development') {
  const missingImages: string[] = [];
  const agentsWithoutCapabilities: string[] = [];

  agentRegistry.forEach(agent => {
    const slug = getAgentImageSlug(agent);
    const imagePath = path.join(process.cwd(), 'public', 'images', `agents-${slug}-skrblai.png`);

    if (!fs.existsSync(imagePath)) {
      console.warn(`❌ Missing avatar image for agent: ${agent.name} → slug: ${slug}`);
      missingImages.push(agent.name);
    }

    if (!agent.capabilities || agent.capabilities.length === 0) {
      agentsWithoutCapabilities.push(agent.name);
    }
  });

  if (missingImages.length > 0) {
    console.log(`🟡 Missing avatars for ${missingImages.length} agents:`, missingImages);
  } else {
    console.log('✅ All agent avatars are correctly named and located');
  }

  if (agentsWithoutCapabilities.length > 0) {
    console.warn(`⚠️ ${agentsWithoutCapabilities.length} agents have no capabilities defined:`, agentsWithoutCapabilities);
  }
}

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

// Helper to get normalized agent image path
export function getAgentImagePath(agent: Agent, variant?: 'waistUp' | 'full'): string {
  const slug = agent.imageSlug || agent.id.replace(/-agent$/, '').replace(/Agent$/, '').toLowerCase();
  // Always use the same format regardless of variant parameter
  return `/images/agents-${slug}-skrblai.png`;
}
