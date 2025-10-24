'use client';

interface AgentAvatarProps {
  agentId: string;
  agentName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Agent emoji/icon mapping
const AGENT_ICONS: Record<string, string> = {
  'percy': '🤖',
  'skillsmith': '🏅',
  'sync': '🔄',
  'analytics': '📊',
  'marketing': '📱',
  'content': '✍️',
  'seo': '🔍',
  'social': '📲',
  'email': '📧',
  'automation': '⚙️',
  'branding': '🎨',
  'research': '🔬',
  'strategy': '🎯',
  'development': '💻',
  'design': '🎨',
};

// Agent gradient backgrounds
const AGENT_GRADIENTS: Record<string, string> = {
  'percy': 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30',
  'skillsmith': 'from-orange-500/20 to-red-500/20 border-orange-400/30',
  'sync': 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
  'analytics': 'from-green-500/20 to-emerald-500/20 border-green-400/30',
  'marketing': 'from-pink-500/20 to-rose-500/20 border-pink-400/30',
  'content': 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30',
  'default': 'from-teal-500/20 to-cyan-500/20 border-teal-400/30'
};

export function AgentAvatar({ agentId, agentName, size = 'md', className = '' }: AgentAvatarProps) {
  const normalizedId = agentId.toLowerCase();
  const icon = AGENT_ICONS[normalizedId] || AGENT_ICONS[agentName?.toLowerCase() || ''] || agentName?.[0] || '?';
  const gradient = AGENT_GRADIENTS[normalizedId] || AGENT_GRADIENTS['default'];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        rounded-full bg-gradient-to-br ${gradient}
        flex items-center justify-center
        border backdrop-blur-sm
        transition-all duration-300
        hover:scale-110 hover:shadow-[0_0_16px_rgba(45,212,191,0.3)]
        ${className}
      `}
      title={agentName || agentId}
    >
      <span className="select-none">{icon}</span>
    </div>
  );
}
