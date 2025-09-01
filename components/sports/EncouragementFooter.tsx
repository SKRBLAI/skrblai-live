'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Star } from 'lucide-react';
import CosmicButton from '../shared/CosmicButton';

interface EncouragementFooterProps {
  isU13Mode?: boolean;
  onStartQuickWin?: () => void;
  onSeePlans?: () => void;
}

export default function EncouragementFooter({ 
  isU13Mode = false, 
  onStartQuickWin,
  onSeePlans 
}: EncouragementFooterProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative mb-24"
    >
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              You've Got This.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-4">
              Real progress isn't easy. That's why SkillSmith gives you clear steps, a fast Quick Win, and a plan that grows with you. Coaches push. We teach. You improve.
            </p>
            
            {isU13Mode && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-cyan-300 text-base font-medium bg-cyan-900/20 border border-cyan-400/30 rounded-lg px-4 py-2 inline-block"
              >
                <Star className="w-4 h-4 inline mr-2" />
                Youth mode: we'll explain everything with visuals and simple steps.
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <CosmicButton 
              size="lg"
              onClick={onStartQuickWin}
              className="flex items-center gap-2 px-8 py-4"
            >
              <Target className="w-5 h-5" />
              Start My Quick Win
            </CosmicButton>
            
            <CosmicButton 
              variant="secondary" 
              size="lg"
              onClick={onSeePlans}
              className="flex items-center gap-2 px-8 py-4"
            >
              <Star className="w-5 h-5" />
              See Plans
            </CosmicButton>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}