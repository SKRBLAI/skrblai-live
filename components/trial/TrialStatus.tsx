'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { TrialStatus as TrialStatusType } from '../../lib/trial/trialManager';

interface TrialStatusProps {
  trialStatus: TrialStatusType;
  onUpgrade: () => void;
  compact?: boolean;
}

export default function TrialStatus({ trialStatus, onUpgrade, compact = false }: TrialStatusProps) {
  if (!trialStatus.isTrialUser) {
    return null; // Don't show for subscribed users
  }

  const getStatusColor = () => {
    if (trialStatus.trialExpired) return 'from-red-500 to-red-600';
    if (trialStatus.daysRemaining <= 1) return 'from-orange-500 to-red-500';
    return 'from-blue-500 to-purple-500';
  };

  const getProgressPercentage = (used: number, limit: number) => {
    return limit > 0 ? (used / limit) * 100 : 0;
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {trialStatus.trialExpired ? 'Trial Expired' : `${trialStatus.daysRemaining} Days Left`}
              </div>
              <div className="text-xs text-gray-400">
                {trialStatus.agentsUsedToday}/{trialStatus.agentLimit} agents used
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-shadow"
          >
            Upgrade
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full bg-gradient-to-r ${getStatusColor()}`}>
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {trialStatus.trialExpired ? 'Trial Expired' : '3-Day Free Trial'}
            </h3>
            <p className="text-gray-400">
              {trialStatus.trialExpired 
                ? 'Upgrade to continue using SKRBL AI'
                : `${trialStatus.daysRemaining} day${trialStatus.daysRemaining !== 1 ? 's' : ''} remaining`
              }
            </p>
          </div>
        </div>

        {trialStatus.trialExpired && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpgrade}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Agents Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Daily Agents</span>
            </div>
            <span className="text-sm text-gray-400">
              {trialStatus.agentsUsedToday}/{trialStatus.agentLimit}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage(trialStatus.agentsUsedToday, trialStatus.agentLimit)}%` }}
              transition={{ duration: 1, ease: 'easeOut' as const }}
              className={`h-2 rounded-full ${
                trialStatus.agentsUsedToday >= trialStatus.agentLimit
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
            />
          </div>
        </div>

        {/* Scans Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Daily Scans</span>
            </div>
            <span className="text-sm text-gray-400">
              {trialStatus.scansUsedToday}/{trialStatus.scanLimit}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage(trialStatus.scansUsedToday, trialStatus.scanLimit)}%` }}
              transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.2 }}
              className={`h-2 rounded-full ${
                trialStatus.scansUsedToday >= trialStatus.scanLimit
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!trialStatus.trialExpired && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold mb-1">
                Ready to dominate your industry?
              </p>
              <p className="text-gray-300 text-sm">
                Upgrade to Starter Hustler ($27) for unlimited agents and competitive advantage
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUpgrade}
              className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2 whitespace-nowrap"
            >
              <span>Start Dominating</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Limits Warning */}
      {(trialStatus.agentsUsedToday >= trialStatus.agentLimit || trialStatus.scansUsedToday >= trialStatus.scanLimit) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/20">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-orange-300 font-semibold">
                Daily limit reached!
              </p>
              <p className="text-orange-200 text-sm">
                You've used all your daily {trialStatus.agentsUsedToday >= trialStatus.agentLimit ? 'agents' : 'scans'}. 
                Upgrade for unlimited access or try again tomorrow.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 