'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/context/AuthContext';
import ScanResultsModal from '@/components/percy/ScanResultsModal';
import toast from 'react-hot-toast';

interface SplitHeroScannerProps {
  className?: string;
}

export default function SplitHeroScanner({ className = '' }: SplitHeroScannerProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [scansRemaining, setScansRemaining] = useState(3);
  const [liveUsers, setLiveUsers] = useState(247);

  // Live user counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check scan limits
  useEffect(() => {
    const checkScansRemaining = async () => {
      if (!user) {
        // Guest user - check localStorage
        const guestScans = parseInt(localStorage.getItem('guest_scans_used') || '0');
        setScansRemaining(3 - guestScans);
      } else {
        // Logged in user - check Supabase
        try {
          const response = await fetch('/api/trial/check-limits', {
            credentials: 'include'
          });
          const data = await response.json();
          setScansRemaining(data.scansRemaining || 0);
        } catch (error) {
          console.error('Failed to check scan limits:', error);
        }
      }
    };
    
    checkScansRemaining();
  }, [user]);

  // Handle business scan
  const handleBusinessScan = async () => {
    if (!scanInput.trim()) {
      toast.error('Please enter a URL or describe your business');
      return;
    }

    if (scansRemaining <= 0) {
      toast.error('You\'ve used all free scans. Sign up for unlimited!');
      router.push('/pricing');
      return;
    }

    setIsScanning(true);

    try {
      // Determine scan type (URL vs text)
      const isUrl = scanInput.startsWith('http') || scanInput.includes('.');
      const scanType = isUrl ? 'website' : 'business';

      // Call scan API
      const response = await fetch('/api/percy/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: scanType,
          url: isUrl ? scanInput : undefined,
          businessInput: !isUrl ? scanInput : undefined,
          userId: user?.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scan failed');
      }

      const data = await response.json();
      
      // Update scans remaining
      if (!user) {
        const guestScans = parseInt(localStorage.getItem('guest_scans_used') || '0');
        localStorage.setItem('guest_scans_used', String(guestScans + 1));
        setScansRemaining(prev => prev - 1);
      }

      // Show results
      setScanResults(data);
      setShowResults(true);
      
      toast.success('Scan complete! Check out your results 🎯');

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'scan_completed', {
          scan_type: scanType,
          scans_remaining: scansRemaining - 1
        });
      }

    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle SkillSmith route
  const handleSportsRoute = () => {
    router.push('/sports');
    
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'skillsmith_clicked', {
        source: 'split_hero'
      });
    }
  };

  return (
    <>
      <section className={`relative min-h-[600px] flex items-center justify-center py-20 px-4 ${className}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Urgency Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8 flex-wrap"
          >
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              🔥 LIVE: {liveUsers} businesses scanning now
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold">
              ✓ 3 FREE SCANS
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Scan Your Business.
              </span>
              <br />
              <span className="text-white">Find Gaps. Dominate Markets.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get instant AI analysis + <span className="text-cyan-400 font-bold">1 FREE Quick Win</span> in 15 seconds
            </p>
          </motion.div>

          {/* Split Scanner */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Percy Side (Business) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-400/50 transition-all duration-300">
                {/* Percy Image */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <Image
                      src="/images/agents-percy-nobg-skrblai.webp"
                      alt="Percy - Business AI"
                      fill
                      className="object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-center mb-2 text-white">
                  Business Intelligence
                </h3>
                <p className="text-center text-gray-300 mb-6">
                  Scan website, LinkedIn, or describe your business
                </p>

                {/* Input */}
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBusinessScan()}
                  placeholder="Paste URL or describe your business..."
                  disabled={isScanning}
                  className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all mb-4 disabled:opacity-50"
                />

                {/* Scan Button */}
                <button
                  onClick={handleBusinessScan}
                  disabled={isScanning || !scanInput.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Scan Now ({scansRemaining} Free)
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Trust Signals */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    ✓ No credit card
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Instant results
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ 1 Free Quick Win
                  </span>
                </div>
              </div>
            </motion.div>

            {/* SkillSmith Side (Sports) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-8 hover:border-orange-400/50 transition-all duration-300">
                {/* SkillSmith Image */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <Image
                      src="/images/agents-skillsmith-nobg-skrblai.webp"
                      alt="SkillSmith - Sports Performance"
                      fill
                      className="object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]"
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-center mb-2 text-white">
                  Sports Performance
                </h3>
                <p className="text-center text-gray-300 mb-6">
                  Upload video for instant technique analysis
                </p>

                {/* Sports Button */}
                <button
                  onClick={handleSportsRoute}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group mb-4"
                >
                  <Zap className="w-5 h-5" />
                  Upload Video (5 Free)
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Sports Info */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-300 text-center">
                    <span className="text-orange-400 font-bold">Perfect for athletes!</span>
                    <br />
                    Get AI feedback on form, technique, and performance
                  </p>
                </div>

                {/* Trust Signals */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    ✓ 30s clips
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ AI feedback
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Improvement tips
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scan Counter */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-8"
            >
              <p className="text-gray-400">
                🎁 You have <span className="text-cyan-400 font-bold">{scansRemaining} free scans</span> remaining
                {scansRemaining === 0 && (
                  <> · <a href="/pricing" className="text-cyan-400 hover:text-cyan-300 underline">Upgrade for unlimited</a></>
                )}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Scan Results Modal */}
      <AnimatePresence>
        {showResults && scanResults && (
          <ScanResultsModal
            isOpen={showResults}
            onClose={() => setShowResults(false)}
            results={scanResults}
            scansRemaining={scansRemaining}
          />
        )}
      </AnimatePresence>
    </>
  );
}
