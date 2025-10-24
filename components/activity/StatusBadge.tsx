'use client';

import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

export type ActivityStatus = 'running' | 'success' | 'failed' | 'pending';

interface StatusBadgeProps {
  status: ActivityStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const configs = {
    running: {
      icon: Loader2,
      label: 'Running',
      emoji: '⚡',
      containerClass: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
      iconClass: 'animate-spin text-green-600 dark:text-green-400',
      glowClass: 'shadow-[0_0_12px_rgba(34,197,94,0.3)]'
    },
    success: {
      icon: CheckCircle2,
      label: 'Complete',
      emoji: '✅',
      containerClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      glowClass: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]'
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      emoji: '❌',
      containerClass: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
      iconClass: 'text-red-600 dark:text-red-400',
      glowClass: 'shadow-[0_0_8px_rgba(239,68,68,0.2)]'
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      emoji: '⏳',
      containerClass: 'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-400',
      iconClass: 'text-gray-600 dark:text-gray-400',
      glowClass: ''
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full border
        backdrop-blur-sm transition-all duration-300
        ${config.containerClass}
        ${config.glowClass}
        ${className}
      `}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}
