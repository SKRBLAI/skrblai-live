'use client';

import { useEffect } from 'react';
import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { PercyRecommendsBadge } from '@/components/percy/PercyRecommendsBadge';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

interface PercyRecommendationsSectionProps {
  userContext?: {
    businessType?: string;
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export function PercyRecommendationsSection({ userContext }: PercyRecommendationsSectionProps) {
  const { recommendation, loading, getRecommendationSet } = usePercyRecommendation();

  useEffect(() => {
    getRecommendationSet(
      {
        businessType: userContext?.businessType || 'general',
        urgencyLevel: userContext?.urgencyLevel || 'medium'
      },
      3 // Get 3 recommendations
    );
  }, [userContext, getRecommendationSet]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!recommendation) {
    return null;
  }

  const recommendations = Array.isArray(recommendation.recommendation)
    ? recommendation.recommendation
    : [recommendation.recommendation];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Percy Recommends for You</h2>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        {recommendation.percyMessage.greeting} {recommendation.percyMessage.confidence}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((rec, idx) => (
          <RecommendationCard key={idx} recommendation={rec} rank={idx + 1} />
        ))}
      </div>
    </motion.div>
  );
}

function RecommendationCard({ recommendation, rank }: { recommendation: any; rank: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: rank * 0.1 }}
      className="p-4 bg-black/40 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">#{rank}</span>
        <PercyRecommendsBadge
          confidence={recommendation.confidence}
          variant="inline"
        />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        {recommendation.service.name}
      </h3>

      <p className="text-sm text-gray-400 mb-3">
        {recommendation.reasoning}
      </p>

      {recommendation.agentHandoff && (
        <div className="flex items-center gap-2 text-xs text-blue-400">
          <TrendingUp className="w-3 h-3" />
          <span>Handled by {recommendation.agentHandoff.agentName}</span>
        </div>
      )}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mb-8 p-6 bg-gray-800/20 rounded-xl animate-pulse">
      <div className="h-6 w-48 bg-gray-700/30 rounded mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-700/20 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}
