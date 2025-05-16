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
