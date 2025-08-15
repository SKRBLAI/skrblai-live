'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccess() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSessionId(urlParams.get('session_id'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-green-400/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Payment Successful! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-300 mb-8"
        >
          Your SkillSmith purchase is ready to use. Time to unlock your athletic potential!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 mb-8 border border-green-400/30"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-green-300 font-semibold">What's Next?</span>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <ul className="text-gray-300 space-y-2 text-left max-w-md mx-auto">
            <li>✅ Access your purchased SkillSmith tools</li>
            <li>✅ Upload videos for AI-powered analysis</li>
            <li>✅ Download your personalized Quick Wins</li>
            <li>✅ Track your progress over time</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <Link
            href="/sports#scan"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continue to Sports Page
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="text-sm text-gray-400">
            {sessionId && (
              <p>Order ID: {sessionId.slice(-12).toUpperCase()}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
