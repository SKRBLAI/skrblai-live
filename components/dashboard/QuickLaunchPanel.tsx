'use client';

import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function QuickLaunchPanel() {
  const { recommendation, loading, getRecommendationSet } = usePercyRecommendation();
  const router = useRouter();

  useEffect(() => {
    // Get a quick recommendation for the top agent
    getRecommendationSet(
      {
        businessType: 'saas',
        urgencyLevel: 'high'
      },
      1
    );
  }, [getRecommendationSet]);

  if (loading || !recommendation) {
    return null;
  }

  const primaryRec = Array.isArray(recommendation.recommendation)
    ? recommendation.recommendation[0]
    : recommendation.recommendation;

  const agentId = primaryRec.agentHandoff?.agentId;
  const agentName = primaryRec.agentHandoff?.agentName || primaryRec.service?.name;

  if (!agentId && !primaryRec.service?.id) return null;

  const targetRoute = agentId ? `/agents/${agentId}` : `/agents`;

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">
            Ready to get started?
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Percy thinks <span className="text-blue-400 font-semibold">{agentName}</span> is perfect for you right now
          </p>
        </div>
        <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0" />
      </div>

      <button
        onClick={() => router.push(targetRoute)}
        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
      >
        Launch {agentName} →
      </button>
    </div>
  );
}

