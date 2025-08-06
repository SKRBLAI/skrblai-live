'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PercyContainer from './PercyContainer';
import { useAuth } from '../context/AuthContext';
import { usePercyContext } from '../../contexts/PercyContext';

interface PercyOnboardingRevolutionOptimizedProps {
  className?: string;
  onAnalysisComplete?: (results: any) => void;
  onAgentSelection?: (agentId: string) => void;
}

const PercyOnboardingRevolutionOptimized: React.FC<PercyOnboardingRevolutionOptimizedProps> = ({
  className = '',
  onAnalysisComplete,
  onAgentSelection
}) => {
  const { user } = useAuth();
  const { trackBehavior } = usePercyContext();

  // Handle analysis completion
  const handleAnalysisComplete = (results: any) => {
    trackBehavior('analysis_completed', { results });
    onAnalysisComplete?.(results);
  };

  // Handle agent launch
  const handleAgentLaunch = (agentId: string) => {
    trackBehavior('agent_launched', { agentId });
    onAgentSelection?.(agentId);
  };

  return (
    <motion.div
      className={`w-full max-w-4xl mx-auto px-4 relative ${className}`}
      data-percy-onboarding
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Main Percy Interface */}
      <PercyContainer
        onAnalysisComplete={handleAnalysisComplete}
        onAgentLaunch={handleAgentLaunch}
        className="w-full"
      />
      
      {/* Optional: Quick Stats or User Info */}
      {user && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-cyan-300/70">
            Welcome back, {(user as any)?.name || user.email?.split('@')[0] || 'friend'}! 👋
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PercyOnboardingRevolutionOptimized;