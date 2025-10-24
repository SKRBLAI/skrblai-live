'use client';

import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { PercyRecommendsBadge } from '@/components/percy/PercyRecommendsBadge';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface PercyRecommendationsWidgetProps {
  onRecommendationClick?: (recommendation: any) => void;
}

export function PercyRecommendationsWidget({ onRecommendationClick }: PercyRecommendationsWidgetProps) {
  const { recommendation, loading, getRecommendationSet } = usePercyRecommendation();
  const router = useRouter();

  useEffect(() => {
    getRecommendationSet(
      {
        businessType: 'saas', // TODO: Get from user profile
        urgencyLevel: 'medium'
      },
      3
    );
  }, [getRecommendationSet]);

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
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Percy Recommends</h2>
        </div>
        <button
          onClick={() => router.push('/agents')}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All →
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {recommendation.percyMessage.confidence}
      </p>

      <div className="space-y-3">
        {recommendations.slice(0, 3).map((rec, idx) => (
          <RecommendationItem 
            key={idx} 
            recommendation={rec} 
            rank={idx + 1}
            onClick={() => {
              onRecommendationClick?.(rec);
              // Navigate to agent page
              if (rec.agentHandoff?.agentId) {
                router.push(`/agents/${rec.agentHandoff.agentId}`);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface RecommendationItemProps {
  recommendation: any;
  rank: number;
  onClick?: () => void;
}

function RecommendationItem({ recommendation, rank, onClick }: RecommendationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer group"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
        {rank}
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
          {recommendation.service.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">
          {recommendation.reasoning}
        </p>
      </div>

      <PercyRecommendsBadge
        confidence={recommendation.confidence}
        variant="inline"
      />

      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
      <div className="h-6 w-40 bg-gray-800 rounded mb-4"></div>
      <div className="h-4 w-3/4 bg-gray-800 rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

