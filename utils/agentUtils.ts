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
