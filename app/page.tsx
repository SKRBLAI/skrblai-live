'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import WaitlistPopup from '@/components/ui/WaitlistPopup';
import BrandLogo from '@/components/ui/BrandLogo';
import SatisfactionBadge from '@/components/ui/SatisfactionBadge';
import FloatingParticles from '@/components/ui/FloatingParticles';

export default function HomePage() {
  const { setPercyIntent, closePercy } = usePercyContext();
  useEffect(() => {
    closePercy();
    setPercyIntent('');
    console.log('[Percy] Reset on HomePage mount: isOpen=false, percyIntent=\'\'');
  }, [closePercy, setPercyIntent]);

  return (
    <main className="min-h-screen relative text-white bg-[#0d1117] pt-24">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <FloatingParticles />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/95 to-[#0d1117] pointer-events-none" />

        {/* Main Content */}
        <div className="relative z-10 pt-32 px-4 md:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="flex flex-col items-center gap-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SatisfactionBadge />
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-bold space-y-4">
                <BrandLogo className="text-4xl md:text-6xl block mb-4" animate={false} />
                <span className="block text-gradient-pink">Unleash the Power of Automated Intelligence</span>
              </h1>
            </div>
            <p className="mt-6 text-lg text-teal-400 max-w-2xl mx-auto leading-relaxed">
              Your next-gen platform for creative automation, smart business workflows, and effortless productivity—powered by AI, crafted for visionaries.
            </p>
          </motion.div>
          {/* Features/Value Prop Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">SKRBL AI automates your marketing, branding, and content creation with intelligent agents that understand your business goals.</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8 text-left">
              <div className="bg-[#161b22] p-6 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                <h3 className="font-bold text-xl text-gradient-blue mb-3 hover:underline-glow">What is SKRBL AI?</h3>
                <p className="text-teal-300">SKRBL AI is the intelligent backbone of modern business. We connect your ideas to results, turning content, marketing, analytics, and more into seamless, automated workflows. With a growing library of specialized AI agents, SKRBL AI becomes your team—working 24/7 to help you launch, grow, and scale smarter than ever.</p>
              </div>
              <div className="bg-[#161b22] p-6 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                <h3 className="font-bold text-xl text-gradient-blue mb-3 hover:underline-glow">How does SKRBL AI work?</h3>
                <p className="text-teal-300">Tell us your goal: Content, branding, publishing, or analytics—just ask.<br />Get matched with smart AI tools: Our AI agents recommend and execute the best solution for your needs.<br />See instant results: Upload a file, type your prompt, or explore automated workflows. SKRBL handles the rest—while you stay focused on what matters.</p>
              </div>
              <div className="bg-[#161b22] p-6 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                <h3 className="font-bold text-xl text-gradient-blue mb-3 hover:underline-glow">Why SKRBL AI?</h3>
                <p className="text-teal-300">Save time. Automate repetitive work and reclaim hours in your week.<br />Work smarter. Let AI handle the heavy lifting—content creation, branding, analytics, and more.<br />Scale fast. Whether you're solo or a growing team, SKRBL AI adapts to your workflow.</p>
              </div>
            </div>
            <div className="mt-10">
              <p className="text-lg mb-4 text-teal-300">Ready to experience creative freedom? Explore our features or chat with Percy—your personal AI concierge—right now.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/features">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-electric-blue text-white font-semibold rounded-lg shadow-glow hover:shadow-electric-blue/50 transition-all duration-300"
                  >
                    Get 7-Day Free Trial
                  </motion.button>
                </Link>
                <Link href="/services">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    See Features
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
    </main>
  );
}
