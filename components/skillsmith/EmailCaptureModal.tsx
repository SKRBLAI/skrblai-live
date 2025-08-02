'use client';

import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Star, Zap, Gift, CheckCircle, Loader } from 'lucide-react';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import CosmicButton from '../shared/CosmicButton';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailCaptured?: (email: string) => void;
  purpose?: 'upgrade' | 'scan-results' | 'follow-up'; // What the email capture is for
  scanData?: {
    sport?: string;
    ageGroup?: 'youth' | 'teen' | 'adult' | 'senior';
    overallScore?: number;
    quickWins?: string[];
  };
}

export default function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  onEmailCaptured,
  purpose = 'upgrade',
  scanData
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { markEmailCaptured, scansRemaining, usageStats } = useSkillSmithGuest();

  // Dynamic messaging based on purpose and age group
  const getModalContent = () => {
    const ageGroup = scanData?.ageGroup || 'teen';
    
    if (purpose === 'scan-results') {
      const ageMessages = {
        youth: {
          title: "🎉 Your Amazing Results Are Ready!",
          subtitle: "Get your personalized coaching report delivered instantly!",
          benefits: [
            "🏆 Your complete performance breakdown",
            "⚡ 2 Quick Wins to improve in 24 hours", 
            "🎯 Fun training games just for you",
            "🌟 Surprise bonus tips from SkillSmith"
          ],
          cta: "Send My Super Results!"
        },
        teen: {
          title: "🔥 Your Analysis Results Are FIRE!",
          subtitle: "Get your complete performance breakdown + exclusive training secrets!",
          benefits: [
            "📊 Detailed performance analysis",
            "💪 Pro-level improvement techniques",
            "🏃‍♂️ Sport-specific training plan",
            "🎯 Exclusive access to advanced tips"
          ],
          cta: "Send My Results Now!"
        },
        adult: {
          title: "📈 Your Performance Analysis Complete",
          subtitle: "Receive your comprehensive coaching report and optimization plan",
          benefits: [
            "📋 Technical analysis breakdown",
            "⚡ Efficiency improvement strategies", 
            "📊 Performance benchmarking data",
            "🎯 Personalized training recommendations"
          ],
          cta: "Deliver My Analysis"
        },
        senior: {
          title: "🏆 Your Performance Assessment Ready",
          subtitle: "Your detailed analysis with gentle, effective improvement strategies",
          benefits: [
            "📈 Form optimization analysis",
            "🎯 Safe improvement techniques",
            "💪 Injury prevention insights",
            "🏃‍♂️ Sustainable training methods"
          ],
          cta: "Send My Report"
        }
      };
      return ageMessages[ageGroup];
    }
    
    // Default upgrade messaging
    return {
      title: "🚀 Unlock Your Full Potential!",
      subtitle: "Get unlimited access to SkillSmith's complete training system",
      benefits: [
        "🎯 Unlimited video analysis",
        "🏆 Personalized training programs", 
        "⚡ Advanced performance metrics",
        "💎 Priority coaching support"
      ],
      cta: "Upgrade My Account"
    };
  };

  const modalContent = getModalContent();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (purpose === 'scan-results') {
        // Send scan results email with upsell
        const emailData = {
          email,
          purpose: 'scan-results',
          scanData,
          timestamp: new Date().toISOString()
        };
        
        // Simulate API call to send scan results email
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Track scan results email sent
        console.log('Scan results email sent:', emailData);
        
        setIsSuccess(true);
        onEmailCaptured?.(email);
        
      } else {
        // Regular upgrade email capture
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mark email as captured in guest tracker
        markEmailCaptured();
        
        setIsSuccess(true);
        onEmailCaptured?.(email);
      }
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2500);
      
    } catch (err) {
      const errorMessage = purpose === 'scan-results' 
        ? 'Failed to send your results. Please try again.' 
        : 'Failed to upgrade your account. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-orange-500/30 rounded-2xl max-w-lg w-full backdrop-blur-xl"
          onClick={e => e.stopPropagation()}
        >
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="border-b border-orange-500/20 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {modalContent.title}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Benefits */}
                <div className="mb-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {purpose === 'scan-results' ? 'Get Your Results!' : 'Upgrade to Premium'}
                    </h3>
                    <p className="text-gray-400">
                      {modalContent.subtitle}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {modalContent.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <Zap className="w-5 h-5 text-orange-400 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-semibold text-orange-400">{benefit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email to unlock benefits"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <CosmicButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        {purpose === 'scan-results' ? 'Sending Results...' : 'Upgrading Account...'}
                      </>
                    ) : (
                      <>
                        {purpose === 'scan-results' ? <Mail className="w-5 h-5 mr-2" /> : <Star className="w-5 h-5 mr-2" />}
                        {modalContent.cta}
                      </>
                    )}
                  </CosmicButton>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    ✅ No spam • ✅ Instant upgrade • ✅ Cancel anytime
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {purpose === 'scan-results' ? 'Results Sent Successfully!' : 'Welcome to Premium!'}
              </h3>
              
              <p className="text-gray-300 mb-6">
                Your account has been upgraded successfully. You now have access to:
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <div className="font-semibold text-green-400">10 Scans</div>
                  <div className="text-gray-400">Unlocked</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <div className="font-semibold text-green-400">10 Quick Wins</div>
                  <div className="text-gray-400">Per analysis</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                  <div className="font-semibold text-purple-400">20% Off</div>
                  <div className="text-gray-400">Full package</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                  <div className="font-semibold text-blue-400">Priority</div>
                  <div className="text-gray-400">Support</div>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Closing automatically...
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 