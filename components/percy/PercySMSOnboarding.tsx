'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Crown, Star, Send, CheckCircle } from 'lucide-react';

interface PercySMSOnboardingProps {
  vipTier?: 'gold' | 'platinum' | 'diamond';
  onComplete?: (phoneNumber: string) => void;
  className?: string;
}

export default function PercySMSOnboarding({ 
  vipTier = 'gold',
  onComplete,
  className = '' 
}: PercySMSOnboardingProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'intro' | 'phone' | 'verification' | 'welcome'>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tierConfig = {
    gold: {
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-yellow-400 to-orange-500',
      name: 'VIP Gold'
    },
    platinum: {
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-gray-300 to-gray-500',
      name: 'VIP Platinum'
    },
    diamond: {
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-cyan-400 to-purple-600',
      name: 'VIP Diamond'
    }
  };

  const currentTier = tierConfig[vipTier];

  const sendSMSVerification = async (phone: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/sms/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: phone,
          vipTier,
          message: `Welcome to SKRBL AI ${currentTier.name}! Your verification code is: {CODE}. Your exclusive AI empire awaits! 🚀`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      setStep('verification');
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/sms/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          code: verificationCode,
          vipTier
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStep('welcome');
      
      // Send welcome SMS with VIP benefits
      await sendWelcomeSMS();
      
      setTimeout(() => {
        onComplete?.(phoneNumber);
      }, 3000);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeSMS = async () => {
    const welcomeMessages = {
      gold: `🎉 Welcome to SKRBL AI VIP Gold! You now have priority support, enhanced analytics, and exclusive templates. Text HELP anytime for instant assistance. Your AI empire starts now!`,
      platinum: `👑 Welcome to SKRBL AI VIP Platinum! You have white glove support, advanced AI models, and custom integrations. Your personal AI strategist is ready. Text CONCIERGE for immediate help!`,
      diamond: `💎 Welcome to SKRBL AI VIP Diamond! You have unlimited access, a dedicated account manager, and direct CEO access. Your personal AI consultant awaits. Text LUXURY for VIP services!`
    };

    try {
      await fetch('/api/sms/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          message: welcomeMessages[vipTier]
        }),
      });
    } catch (err) {
      console.error('Failed to send welcome SMS:', err);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      sendSMSVerification(phoneNumber);
    } else {
      setError('Please enter a valid phone number');
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      verifyCode();
    } else {
      setError('Please enter the 6-digit verification code');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${currentTier.gradient} mb-6`}
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 40px rgba(59, 130, 246, 0.8)',
                  '0 0 20px rgba(59, 130, 246, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentTier.icon}
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentTier.name} SMS Concierge
            </h2>
            <p className="text-gray-300 mb-6">
              Get instant access to Percy via SMS for VIP support, alerts, and exclusive features.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep('phone')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Phone className="w-5 h-5" />
              Enable SMS Access
            </motion.button>
          </motion.div>
        )}

        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-6">
              <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Enter Your Phone Number</h2>
              <p className="text-gray-300">We'll send you a verification code via SMS</p>
            </div>
            
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
                  maxLength={14}
                />
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
              
              <motion.button
                type="submit"
                disabled={isLoading || phoneNumber.length < 10}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Verification Code
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {step === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Enter Verification Code</h2>
              <p className="text-gray-300">Check your phone for the 6-digit code we sent to {phoneNumber}</p>
            </div>
            
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
              
              <motion.button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify & Activate
                  </>
                )}
              </motion.button>
              
              <button
                type="button"
                onClick={() => sendSMSVerification(phoneNumber)}
                className="w-full text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Didn't receive a code? Resend
              </button>
            </form>
          </motion.div>
        )}

        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <motion.div
              className={`inline-flex p-6 rounded-3xl bg-gradient-to-r ${currentTier.gradient} mb-6`}
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              SMS Access Activated! 🎉
            </h2>
            <p className="text-gray-300 mb-6">
              Percy is now available via SMS for instant VIP support. Check your phone for welcome instructions!
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="p-4 bg-white/10 rounded-xl border border-white/20"
            >
              <p className="text-sm text-gray-300">
                <strong className="text-white">Quick Commands:</strong><br />
                • Text "HELP" for assistance<br />
                • Text "STATUS" for account info<br />
                • Text "CONCIERGE" for VIP support
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}