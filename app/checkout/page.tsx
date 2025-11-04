'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Lock, Zap } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '../../components/layout/PageLayout';
import { getPriceId } from '@/lib/pricing/getPriceId';
import FloatingParticles from '../../components/ui/FloatingParticles';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [planId, setPlanId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  useEffect(() => {
    setPlanId(searchParams.get('plan'));
    setPeriod(searchParams.get('period'));
  }, [searchParams]);

  // Analytics stub
  useEffect(() => {
    console.log('event:checkout_page_view', { plan: planId, period });
  }, [planId, period]);

  const planDisplayNames: Record<string, string> = {
    'rookie': 'Rookie Plan',
    'pro': 'Pro Plan',
    'allstar': 'All-Star Plan',
    'yearly': 'Yearly Plan',
    'starter': 'Starter Plan',
    'business': 'Business Plan',
    'enterprise': 'Enterprise Plan'
  };

  const planName = planId ? planDisplayNames[planId] || planId : 'Selected Plan';

  return (
    <PageLayout>
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        
        <div className="relative z-10 pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
                aria-label="Go back to pricing"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Pricing
              </Link>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Coming Soon Message */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-400/30 rounded-full px-4 py-2 text-orange-300 text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  Coming Very Soon
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Stripe Checkout
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Not Yet Enabled
                  </span>
                </h1>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  We're putting the finishing touches on our secure payment system. 
                  Your {planName} will be ready for purchase very soon!
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-6 h-6 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-green-400" />
                    </div>
                    <span>Secure SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-6 h-6 bg-blue-500/20 border border-blue-400/30 rounded-full flex items-center justify-center">
                      <CreditCard className="w-3 h-3 text-blue-400" />
                    </div>
                    <span>Powered by Stripe</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-6 h-6 bg-purple-500/20 border border-purple-400/30 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-purple-400" />
                    </div>
                    <span>Instant access after payment</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Contact Sales
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Get Notified
                  </Link>
                </div>
              </motion.div>

              {/* Right Column - Plan Summary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-br from-[rgba(30,25,50,0.8)] via-[rgba(15,20,40,0.9)] to-[rgba(25,15,45,0.8)] border-2 border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Plan:</span>
                    <span className="text-white font-semibold">{planName}</span>
                  </div>
                  {period && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Billing:</span>
                      <span className="text-white font-semibold capitalize">{period}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Status:</span>
                    <span className="text-orange-400 font-semibold">Pending Setup</span>
                  </div>
                </div>

                <div className="border-t border-gray-600/50 pt-6">
                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 text-center">
                    <p className="text-cyan-300 font-medium mb-2">
                      🚀 Early Access Bonus
                    </p>
                    <p className="text-cyan-200 text-sm">
                      Be among the first to experience our premium features when checkout goes live!
                    </p>
                  </div>
                </div>

                {/* Environment Variables Status */}
                <div className="mt-6 pt-6 border-t border-gray-600/50">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Stripe Configuration</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rookie Price ID:</span>
                      <span className="text-orange-300">{(() => { try { return getPriceId('rookie') || 'Not Set'; } catch { return 'Not Set'; } })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pro Price ID:</span>
                      <span className="text-orange-300">{(() => { try { return getPriceId('pro') || 'Not Set'; } catch { return 'Not Set'; } })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">All-Star Price ID:</span>
                      <span className="text-orange-300">{(() => { try { return getPriceId('allstar') || 'Not Set'; } catch { return 'Not Set'; } })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Yearly Price ID:</span>
                      <span className="text-orange-300">{(() => { try { return getPriceId('yearly') || 'Not Set'; } catch { return 'Not Set'; } })()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}