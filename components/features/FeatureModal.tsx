/** Feature Overview Modal - April 2025 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockFeatures = [
  {
    title: 'AI Writing Assistant',
    description: 'Get real-time writing suggestions, style improvements, and creative ideas as you write.',
    benefits: ['Reduce writer\'s block', 'Improve clarity and flow', 'Save time on editing']
  },
  {
    title: 'Book Publishing',
    description: 'Transform your manuscript into a professionally published book with our end-to-end solution.',
    benefits: ['Professional formatting', 'Cover design assistance', 'Distribution support']
  },
  {
    title: 'Marketing Tools',
    description: 'Promote your work effectively with AI-powered marketing tools and analytics.',
    benefits: ['Social media content generation', 'Email campaign optimization', 'Performance tracking']
  }
];

export default function FeatureModal({ isOpen, onClose }: FeatureModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close feature overview"
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">
              How SKRBL AI Enhances Your Writing Journey
            </h2>

            <div className="space-y-8">
              {mockFeatures.map((feature, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-xl font-semibold text-electric-blue">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                  <ul className="list-disc list-inside text-gray-400 space-y-1">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-300 text-center">
                Ready to transform your writing process?{' '}
                <button
                  onClick={onClose}
                  className="text-electric-blue hover:underline focus:outline-none"
                >
                  Get started now
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
