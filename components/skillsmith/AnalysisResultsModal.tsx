'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Star, Trophy, Target, Zap, Gift, ExternalLink, CheckCircle } from 'lucide-react';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import CosmicButton from '../shared/CosmicButton';

interface AnalysisResult {
  feedback: string;
  score: number;
  improvements: string[];
  quickWins: QuickWin[];
  sport: string;
  ageGroup: 'youth' | 'teen' | 'adult' | 'senior';
}

interface QuickWin {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  category: 'technique' | 'training' | 'nutrition' | 'mental';
}

interface AnalysisResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  userType: 'guest' | 'auth' | 'platform';
  onUpgradeClick?: () => void;
  onQuickWinDownload?: (quickWin: QuickWin) => void;
}

export default function AnalysisResultsModal({
  isOpen,
  onClose,
  result,
  userType,
  onUpgradeClick,
  onQuickWinDownload
}: AnalysisResultsModalProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { canUseQuickWins, useQuickWin: triggerQuickWin, quickWinsRemaining, usageStats } = useSkillSmithGuest();

  if (!isOpen || !result) return null;

  const scoreColor = result.score >= 85 ? 'text-green-400' : 
                    result.score >= 70 ? 'text-yellow-400' : 'text-orange-400';

  const scoreRing = result.score >= 85 ? 'text-green-400' : 
                   result.score >= 70 ? 'text-yellow-400' : 'text-orange-400';

  const maxQuickWins = userType === 'guest' ? 2 : userType === 'auth' ? 10 : 999;
  const availableQuickWins = result.quickWins.slice(0, maxQuickWins);

  const handleQuickWinDownload = async (quickWin: QuickWin) => {
    if (userType === 'guest' && !canUseQuickWins) {
      // Show upgrade prompt
      onUpgradeClick?.();
      return;
    }

    setDownloadingId(quickWin.id);
    
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (userType === 'guest') {
        triggerQuickWin();
      }
      
      onQuickWinDownload?.(quickWin);
    } finally {
      setDownloadingId(null);
    }
  };

  const categoryIcons = {
    technique: Target,
    training: Zap,
    nutrition: Star,
    mental: Trophy
  };

  const categoryColors = {
    technique: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    training: 'text-orange-400 border-orange-500/30 bg-orange-500/10', 
    nutrition: 'text-green-400 border-green-500/30 bg-green-500/10',
    mental: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-orange-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Performance Analysis Complete
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Score & Feedback */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Score */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.score / 100)}`}
                      className={scoreRing}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-3xl font-bold ${scoreColor}`}>{result.score}</span>
                    <span className="text-gray-400 text-sm">/ 100</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mt-4 capitalize">
                  {result.sport} Analysis
                </h3>
              </div>

              {/* Feedback */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">AI Feedback</h3>
                <p className="text-gray-300 mb-4">{result.feedback}</p>
                
                <div>
                  <h4 className="text-md font-semibold text-orange-400 mb-2">Key Improvements</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Quick Wins</h3>
                {userType === 'guest' && (
                  <span className="text-sm text-gray-400">
                    {quickWinsRemaining} downloads remaining
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {availableQuickWins.map((quickWin, index) => {
                  const Icon = categoryIcons[quickWin.category];
                  const colorClass = categoryColors[quickWin.category];
                  const isDownloading = downloadingId === quickWin.id;
                  const canDownload = userType !== 'guest' || canUseQuickWins;

                  return (
                    <motion.div
                      key={quickWin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${colorClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 flex-shrink-0 ${colorClass.split(' ')[0]}`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{quickWin.title}</h4>
                          <p className="text-gray-400 text-sm mb-3">{quickWin.description}</p>
                          
                          <CosmicButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickWinDownload(quickWin)}
                            disabled={isDownloading || (!canDownload && userType === 'guest')}
                            className={`${!canDownload && userType === 'guest' ? 'opacity-50' : ''}`}
                          >
                            {isDownloading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 mr-2"
                                >
                                  ⟳
                                </motion.div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                {canDownload ? 'Download' : 'Upgrade to Download'}
                              </>
                            )}
                          </CosmicButton>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {result.quickWins.length > maxQuickWins && (
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl text-center">
                  <p className="text-orange-400 font-semibold mb-2">
                    {result.quickWins.length - maxQuickWins} more Quick Wins available!
                  </p>
                  <p className="text-gray-300 text-sm mb-3">
                    Upgrade to unlock all personalized recommendations
                  </p>
                  <CosmicButton
                    variant="primary"
                    onClick={onUpgradeClick}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Unlock All Quick Wins
                  </CosmicButton>
                </div>
              )}
            </div>

            {/* Upsell Section */}
            {(userType === 'guest' || userType === 'auth') && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-3">
                  Ready to Dominate Your Sport?
                </h3>
                <p className="text-gray-300 mb-4">
                  Get unlimited video analysis, personalized training programs, and pro coaching with the complete SkillSmith package.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <CosmicButton
                    variant="primary"
                    onClick={() => {/* Handle purchase */}}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    {userType === 'auth' ? 'Get 20% Off Package' : 'Upgrade Now'}
                  </CosmicButton>
                  
                  <CosmicButton
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
                  >
                    Maybe Later
                  </CosmicButton>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <CosmicButton
                variant="outline"
                onClick={onClose}
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Done
              </CosmicButton>
              
              <CosmicButton
                variant="primary"
                onClick={() => {/* Handle new analysis */}}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Analyze Another Video
              </CosmicButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 