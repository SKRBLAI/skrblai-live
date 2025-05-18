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
