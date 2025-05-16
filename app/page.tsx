'use client';
import PageLayout from '@/components/layout/PageLayout';
import HomepageFlow from '@/components/home/HomepageFlow';
import FloatingParticles from '@/components/ui/FloatingParticles';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import WaitlistPopup from '@/components/ui/WaitlistPopup';

export default function HomePage() {
  const { setPercyIntent, closePercy } = usePercyContext();
  useEffect(() => {
    closePercy();
    setPercyIntent('');
    console.log('[Percy] Reset on HomePage mount: isOpen=false, percyIntent=\'\'');
  }, [closePercy, setPercyIntent]);

  return (
    <PageLayout>
      <Navbar />
      <div className="min-h-screen relative text-white bg-transparent">
        <div className="pt-32 px-4 md:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              SKRBL AI: Unleash the Power of Automated Intelligence
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
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
            <h2 className="text-2xl font-semibold mb-4">Automate, Create, Dominate — with SKRBL AI.</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8 text-left">
              <div>
                <h3 className="font-bold text-lg mb-2">What is SKRBL AI?</h3>
                <p>SKRBL AI is the intelligent backbone of modern business. We connect your ideas to results, turning content, marketing, analytics, and more into seamless, automated workflows. With a growing library of specialized AI agents, SKRBL AI becomes your team—working 24/7 to help you launch, grow, and scale smarter than ever.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">How does SKRBL AI work?</h3>
                <p>Tell us your goal: Content, branding, publishing, or analytics—just ask.<br />Get matched with smart AI tools: Our AI agents recommend and execute the best solution for your needs.<br />See instant results: Upload a file, type your prompt, or explore automated workflows. SKRBL handles the rest—while you stay focused on what matters.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Why SKRBL AI?</h3>
                <p>Save time. Automate repetitive work and reclaim hours in your week.<br />Work smarter. Let AI handle the heavy lifting—content creation, branding, analytics, and more.<br />Scale fast. Whether you're solo or a growing team, SKRBL AI adapts to your workflow.</p>
              </div>
            </div>
            <div className="mt-10">
              <p className="text-lg mb-4">Ready to experience creative freedom? Explore our features or chat with Percy—your personal AI concierge—right now.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/features">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-electric-blue text-white font-bold rounded-xl shadow-glow"
                  >
                    Explore Features
                  </motion.button>
                </Link>
                <Link href="/services">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 border-2 border-teal-400 text-teal-400 font-bold rounded-xl hover:bg-teal-400/10 transition-colors"
                  >
                    View AI Agents
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
