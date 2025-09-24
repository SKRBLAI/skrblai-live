'use client';

import React, { useState } from 'react';
import { getDisplayPlan, getDisplayPlanOrNull, formatMoney } from '../../lib/pricing/catalog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Gift, Timer, Star } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (email: string) => void;
}

export default function ExitIntentModal({ isOpen, onClose, onCapture }: ExitIntentModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();
  
  // Check if mobile/tablet
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  
  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  // Dynamic offers based on current page
  const getPageSpecificOffer = () => {
    if (pathname?.includes('/pricing')) {
      return {
        headline: "🚨 Wait! Don't Miss Your 40% Launch Discount",
        description: "You're leaving the pricing page - but you haven't seen our limited-time launch offer! Get 40% off your first 3 months.",
        buttonText: "🎯 Claim 40% Discount",
        incentive: "🔥 Only 127 discounts left!",
        urgency: "This offer expires in 23 minutes"
      };
    } else if (pathname?.includes('/agents')) {
      return {
        headline: "🤖 Unlock Agent Intelligence Before You Go",
        description: `Get instant access to our 'Agent Selection Masterclass' - a ${(() => {
          const plan = getDisplayPlanOrNull('crusher', 'monthly');
          return plan ? formatMoney(plan.amountCents, plan.currency) : '$49';
        })()} value, free for the next 15 minutes.`,
        buttonText: "📚 Get Free Masterclass",
        incentive: "✨ Plus: 7-day trial of all agents",
        urgency: "⏰ Limited time: 15 minutes remaining"
      };
    } else if (pathname?.includes('/features')) {
      return {
        headline: "⚡ Your Competitive Analysis Awaits",
        description: "Before you leave, get a free AI-powered analysis of your biggest competitor's weaknesses. Takes 30 seconds.",
        buttonText: "🎯 Analyze Competition",
        incentive: "💎 Reveals 3 attack opportunities",
        urgency: "🔥 218 businesses analyzed today"
      };
    } else {
      return {
        headline: "🚀 One More Thing Before You Go...",
        description: "We're giving away free 'Industry Domination Blueprints' for the next 12 minutes. Which industry should we analyze for you?",
        buttonText: "📈 Get My Blueprint",
        incentive: `🎁 ${(() => {
          const plan = getDisplayPlanOrNull('crusher', 'monthly');
          return plan ? formatMoney(plan.amountCents, plan.currency) : '$49';
        })()} value - completely free`,
        urgency: "⏱️ Expires in 12 minutes"
      };
    }
  };

  const offer = getPageSpecificOffer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      // Determine vertical and offer type
      const vertical = pathname?.includes('/sports') ? 'sports' : 'business';
      const offerType = pathname?.includes('/pricing') ? 'launch40' : 'exit_capture';
      
      // Submit to leads API (which handles both Supabase and analytics)
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'exit_intent',
          page_path: pathname,
          vertical,
          offer_type: offerType,
          metadata: {
            trigger: 'exit_intent_modal',
            offer_headline: offer.headline,
            user_agent: navigator.userAgent,
            referrer: document.referrer
          }
        })
      });

      if (response.ok) {
        onCapture(email);
        
        // Track successful capture
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'lead.captured',
            page_path: pathname,
            vertical,
            metadata: {
              email,
              source: 'exit_intent',
              offer_type: offerType
            },
            timestamp: new Date().toISOString()
          })
        }).catch(console.warn);
        
        // Redirect to appropriate page with the offer
        if (pathname?.includes('/pricing')) {
          window.location.href = `/?offer=launch40&email=${encodeURIComponent(email)}`;
        } else {
          window.location.href = `/?offer=exit_capture&email=${encodeURIComponent(email)}`;
        }
      } else {
        throw new Error('Lead submission failed');
      }
      
    } catch (error) {
      console.error('Exit intent capture error:', error);
      // Still redirect on error but track the failure
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'lead.capture.failed',
          page_path: pathname,
          metadata: {
            email,
            error: error instanceof Error ? error.message : String(error),
            source: 'exit_intent'
          },
          timestamp: new Date().toISOString()
        })
      }).catch(console.warn);
      
      // Still redirect to provide good UX
      window.location.href = `/?email=${encodeURIComponent(email)}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            // Only close if clicking the overlay itself, not on minor movements
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-2xl cosmic-gradient backdrop-blur-2xl rounded-3xl p-8 border border-cyan-400/50 shadow-[0_0_32px_rgba(45,212,191,0.25)]"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.85) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 15px rgba(45,212,191,0.3), 0 0 30px rgba(56,189,248,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close modal"
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors text-gray-400 hover:text-white border border-teal-400/30 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Urgency Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-orange-900/70 to-red-900/70 backdrop-blur-xl border border-orange-400/50 rounded-full text-white text-sm font-bold urgency-badge-shadow"
            >
              <Timer className="w-4 h-4 inline mr-1" />
              {offer.urgency}
            </motion.div>

            {/* Header */}
            <div className="text-center mb-8 mt-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-xl border-2 border-cyan-400/50 mb-4 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                style={{
                  boxShadow: '0 0 15px rgba(56,189,248,0.3)'
                }}
              >
                <Gift className="w-8 h-8 text-cyan-300" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white mb-4"
              >
                {offer.headline}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed"
              >
                {offer.description}
              </motion.p>
            </div>

            {/* Incentive Highlight */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 mb-8 p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-xl border border-green-400/40 rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.2)]"
              style={{
                boxShadow: '0 0 15px rgba(74,222,128,0.2)'
              }}
            >
              <Star className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">{offer.incentive}</span>
            </motion.div>

            {/* Email Capture Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <input
                  type="email"
                  placeholder="Enter your email to claim this offer"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-slate-800/40 border border-teal-400/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg backdrop-blur-md focus:bg-slate-800/60 transition-colors input-bg-blur"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>{offer.buttonText}</span>
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-400"
            >
              <span>✓ No spam, ever</span>
              <span>•</span>
              <span>✓ Unsubscribe anytime</span>
              <span>•</span>
              <span>✓ 2,847 businesses agree</span>
            </motion.div>

            {/* Maybe Later Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center mt-6"
            >
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Maybe later (continue to leave)
              </button>
            </motion.div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 