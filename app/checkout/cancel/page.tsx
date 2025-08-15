'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-orange-400/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-6"
        >
          <XCircle className="w-12 h-12 text-orange-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Payment Cancelled
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-300 mb-8"
        >
          No worries! Your payment was cancelled and no charges were made.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 mb-8 border border-orange-400/30"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-orange-400" />
            <span className="text-orange-300 font-semibold">Still Want to Upgrade?</span>
          </div>
          <p className="text-gray-300 text-sm">
            You can still use your 2 free scans and upgrade anytime when you're ready!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <Link
            href="/sports"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sports Page
          </Link>

          <div className="text-sm text-gray-400">
            <p>Try your free scans or browse our tools</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
