import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface AgentWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentAvatar?: React.ReactNode;
  steps?: string[];
}

const DEFAULT_STEPS = [
  'Agent receives your request.',
  'Agent analyzes your data.',
  'Agent hands off to a specialist agent.',
  'Specialist agent completes the task.',
  'You receive results. Task complete!'
];

const AgentWalkthroughModal: React.FC<AgentWalkthroughModalProps> = ({
  isOpen,
  onClose,
  agentName,
  agentAvatar,
  steps = DEFAULT_STEPS
}) => {
  const [step, setStep] = useState(0);
  const isComplete = step >= steps.length;

  const handleNext = () => {
    if (!isComplete) setStep(s => s + 1);
  };
  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };
  const handleClose = () => {
    setStep(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-transparent backdrop-blur-xl border-2 border-teal-400/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative"
      >
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white" onClick={handleClose} aria-label="Close">
          <X className="w-6 h-6" />
        </button>
        {agentAvatar && <div className="mx-auto mb-4 flex justify-center">{agentAvatar}</div>}
        <h2 className="text-2xl font-bold mb-2">{agentName} Walkthrough</h2>
        <div className="min-h-[80px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4"
              >
                {steps[step]}
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                <div className="text-xl font-bold mb-2">Task Complete!</div>
                <div className="text-gray-600 dark:text-gray-300 mb-4">You’ve seen how {agentName} and the team work together to deliver results.</div>
                <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow" onClick={handleClose}>Close</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isComplete && (
          <div className="flex justify-between mt-6">
            <button
              className="flex items-center gap-1 px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              className="flex items-center gap-1 px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
              onClick={handleNext}
              disabled={isComplete}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AgentWalkthroughModal;