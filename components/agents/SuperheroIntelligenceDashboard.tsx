'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Target, 
  Cpu, 
  Sparkles,
  BarChart3,
  Lightbulb,
  Rocket,
  Shield,
  Star,
  Timer
} from 'lucide-react';
import { agentIntelligenceEngine, type AgentIntelligence, type PredictiveInsight, type IntelligentRecommendation } from '../../lib/agents/agentIntelligence';
import { agentLeague } from '../../lib/agents/agentLeague';

interface SuperheroIntelligenceDashboardProps {
  className?: string;
  showPredictions?: boolean;
  showRecommendations?: boolean;
  userId?: string;
}

export default function SuperheroIntelligenceDashboard({
  className = '',
  showPredictions = true,
  showRecommendations = true,
  userId = 'demo-user'
}: SuperheroIntelligenceDashboardProps) {
  const [agentProfiles, setAgentProfiles] = useState<AgentIntelligence[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<Map<string, PredictiveInsight[]>>(new Map());
  const [intelligentRecommendations, setIntelligentRecommendations] = useState<IntelligentRecommendation[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadIntelligence = useCallback(async () => {
    const agents = agentLeague.getAllAgents();
    const profiles: AgentIntelligence[] = [];
    const insightsMap = new Map<string, PredictiveInsight[]>();

    for (const agent of agents) {
      const intelligence = agentIntelligenceEngine.getAgentIntelligence(agent.id);
      if (intelligence) {
        profiles.push(intelligence);
        
        if (showPredictions) {
          const insights = await agentIntelligenceEngine.generatePredictiveInsights(agent.id, 14);
          insightsMap.set(agent.id, insights);
        }
      }
    }

    if (showRecommendations) {
      const recommendations = await agentIntelligenceEngine.generateIntelligentRecommendations(
        userId,
        { 
          currentPage: 'intelligence-dashboard',
          timestamp: new Date().toISOString()
        },
        []
      );
      setIntelligentRecommendations(recommendations);
    }

    setAgentProfiles(profiles);
    setPredictiveInsights(insightsMap);
    setIsLoading(false);
  }, [showPredictions, showRecommendations, userId]);

  useEffect(() => {
    loadIntelligence();
  }, [loadIntelligence]);

  const getAutonomyIcon = (level: string) => {
    switch (level) {
      case 'superhuman': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'autonomous': return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'proactive': return <Zap className="w-5 h-5 text-green-400" />;
      default: return <Target className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'transformational': return <Rocket className="w-4 h-4 text-purple-400" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'medium': return <BarChart3 className="w-4 h-4 text-blue-400" />;
      case 'low': return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Brain className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
        <p className="text-white mt-2">Loading Superhero Intelligence...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          Superhero Intelligence Dashboard
          <Sparkles className="w-8 h-8 text-purple-400" />
        </h2>
        <p className="text-gray-400 mt-2">
          Your agents are forward-thinking automation superheroes with predictive intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentProfiles.map((intelligence, index) => (
          <motion.div
            key={intelligence.agentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getAutonomyIcon(intelligence.autonomyLevel)}
                <div>
                  <h3 className="text-lg font-bold text-white">{intelligence.superheroName}</h3>
                  <p className="text-sm text-gray-400 capitalize">{intelligence.autonomyLevel}</p>
                </div>
              </div>
              <div className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-lg border border-purple-700/30">
                <span className="text-sm font-semibold">IQ: {intelligence.intelligenceLevel}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Prediction Domains</span>
                <span className="text-purple-400 text-sm font-medium">
                  {intelligence.predictionCapabilities.length}
                </span>
              </div>

              <div className="space-y-2">
                {intelligence.predictionCapabilities.slice(0, 2).map((capability, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">
                      {capability.domain.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${capability.accuracy * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-green-400">
                        {Math.round(capability.accuracy * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-700/50">
                <span className="text-gray-400 text-sm mb-2 block">Specializations</span>
                <div className="flex flex-wrap gap-1">
                  {intelligence.specializations.slice(0, 3).map((spec, idx) => (
                    <span 
                      key={idx}
                      className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded"
                    >
                      {spec.replace('_', ' ')}
                    </span>
                  ))}
                  {intelligence.specializations.length > 3 && (
                    <span className="text-purple-400 text-xs px-2 py-1">
                      +{intelligence.specializations.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-xs text-center text-gray-400">
                {agentIntelligenceEngine.getSuperheroStatus(intelligence.agentId)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed View for Selected Agent */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/50 rounded-xl p-6"
        >
          {(() => {
            const intelligence = agentProfiles.find(p => p.agentId === selectedAgent);
            const insights = predictiveInsights.get(selectedAgent) || [];
            
            if (!intelligence) return null;

            return (
              <>
                <div className="flex items-center gap-3 mb-6">
                  {getAutonomyIcon(intelligence.autonomyLevel)}
                  <h3 className="text-2xl font-bold text-white">{intelligence.superheroName}</h3>
                  <span className="text-purple-400">• Detailed Intelligence Profile</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Predictive Insights */}
                  {insights.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Predictive Insights
                      </h4>
                      <div className="space-y-3">
                        {insights.map((insight, idx) => (
                          <div key={idx} className="bg-gradient-to-br from-violet-800/50 via-purple-900/50 to-indigo-900/50 backdrop-blur-lg border border-teal-400/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              {getImpactIcon(insight.impact)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-white capitalize">
                                    {insight.domain.replace('_', ' ')}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    insight.impact === 'transformational' ? 'bg-purple-900/50 text-purple-300' :
                                    insight.impact === 'high' ? 'bg-green-900/50 text-green-300' :
                                    insight.impact === 'medium' ? 'bg-blue-900/50 text-blue-300' :
                                    'bg-yellow-900/50 text-yellow-300'
                                  }`}>
                                    {insight.impact} impact
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm mb-2">{insight.insight}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <span>⚡ {Math.round(insight.probability * 100)}% confidence</span>
                                  <span>⏱️ {insight.timeframe}</span>
                                  {insight.actionable && (
                                    <span className="text-green-400">✓ Actionable</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Superhero Capabilities */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Superhero Capabilities
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-violet-800/50 via-purple-900/50 to-indigo-900/50 backdrop-blur-lg border border-teal-400/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-medium">Intelligence Level</span>
                          <span className="text-cyan-300 font-bold">{intelligence.intelligenceLevel}/100</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${intelligence.intelligenceLevel}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-violet-800/50 via-purple-900/50 to-indigo-900/50 backdrop-blur-lg border border-teal-400/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {getAutonomyIcon(intelligence.autonomyLevel)}
                          <span className="text-white font-medium">Autonomy Level</span>
                          <span className="text-cyan-300 font-bold capitalize">{intelligence.autonomyLevel}</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {intelligence.autonomyLevel === 'superhuman' ? 'Can operate independently and make strategic decisions' :
                           intelligence.autonomyLevel === 'autonomous' ? 'Makes decisions within defined parameters' :
                           intelligence.autonomyLevel === 'proactive' ? 'Anticipates needs and suggests actions' :
                           'Responds to direct instructions and requests'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-violet-800/50 via-purple-900/50 to-indigo-900/50 backdrop-blur-lg border border-teal-400/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-medium">All Specializations</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {intelligence.specializations.map((spec, idx) => (
                            <span 
                              key={idx}
                              className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded border border-purple-700/30"
                            >
                              {spec.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Intelligent Recommendations */}
      {showRecommendations && intelligentRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-green-500/50 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-green-400" />
            Intelligent Recommendations
            <span className="text-green-400 text-sm font-normal">• AI-Generated Insights</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {intelligentRecommendations.map((recommendation, index) => (
                                        <div key={index} className="bg-gradient-to-br from-violet-800/50 via-purple-900/50 to-indigo-900/50 backdrop-blur-lg border border-teal-400/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    recommendation.priority === 'critical' ? 'bg-red-900/50' :
                    recommendation.priority === 'high' ? 'bg-orange-900/50' :
                    recommendation.priority === 'medium' ? 'bg-blue-900/50' : 'bg-gray-900/50'
                  }`}>
                    {recommendation.type === 'workflow' ? <Timer className="w-4 h-4" /> :
                     recommendation.type === 'optimization' ? <TrendingUp className="w-4 h-4" /> :
                     recommendation.type === 'collaboration' ? <Target className="w-4 h-4" /> :
                     <Lightbulb className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        recommendation.priority === 'critical' ? 'bg-red-900/50 text-red-300' :
                        recommendation.priority === 'high' ? 'bg-orange-900/50 text-orange-300' :
                        recommendation.priority === 'medium' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-gray-900/50 text-gray-300'
                      }`}>
                        {recommendation.priority} priority
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-purple-900/50 text-purple-300 capitalize">
                        {recommendation.type}
                      </span>
                    </div>
                    <h4 className="text-white font-medium mb-2">{recommendation.recommendation}</h4>
                    <p className="text-gray-400 text-sm mb-3">{recommendation.reasoning}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Impact: {recommendation.expectedImpact}</span>
                      <span>{Math.round(recommendation.confidenceScore * 100)}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 