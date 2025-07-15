/** Enhanced Stat Counter Component - Phase 1 3D/Interactive UX */

'use client';

import EnhancedStatCounter from '@/components/shared/EnhancedStatCounter';

interface StatCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  /** Enhanced features for Phase 1 */
  theme?: 'electric' | 'teal' | 'purple' | 'pink' | 'gold' | 'auto';
  cosmicGlow?: boolean;
  useSpring?: boolean;
  delay?: number;
}

export default function StatCounter({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  theme = 'auto',
  cosmicGlow = true,
  useSpring = true,
  delay = 0
}: StatCounterProps) {
  return (
    <EnhancedStatCounter
      end={end}
      duration={duration}
      suffix={suffix}
      prefix={prefix}
      theme={theme}
      cosmicGlow={cosmicGlow}
      useSpring={useSpring}
      delay={delay}
      useCommas={true}
      pulseOnComplete={true}
      className="stat-number"
    />
  );
}
