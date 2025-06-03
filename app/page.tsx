'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { heroConfig } from '@/lib/config/heroConfig';
import AgentCarousel from '@/components/agents/AgentCarousel';
import FloatingParticles from '@/components/ui/FloatingParticles';
import UniversalPromptBar from '@/components/ui/UniversalPromptBar';
import CloudinaryImage from '@/components/ui/CloudinaryImage';
import type { Agent } from '@/types/agent';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Percy context for cleanup
  const percyContext = usePercyContext();
  const { setPercyIntent, closePercy } = percyContext;

  // Safe mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch agents from registry
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        import('@/lib/agents/agentRegistry')
          .then((module) => {
            const agentRegistry = module.default || [];
            setAgents(agentRegistry.filter(agent => agent && agent.visible !== false));
          })
          .catch((err) => {
            console.error('Failed to load agent registry:', err);
            setError('Failed to load agents');
          });
      }
    } catch (err) {
      console.error('Error setting up agents:', err);
      setError('Error setting up agents');
    }
  }, []);

  // Percy cleanup
  useEffect(() => {
    try {
      if (closePercy) closePercy();
      if (setPercyIntent) setPercyIntent('');
    } catch (err) {
      console.error('Error in Percy cleanup:', err);
    }
  }, [closePercy, setPercyIntent]);

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading SKRBL AI...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        <div className="text-center">
          <h1 className="text-2xl mb-4">⚠️ Loading Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white bg-[#0d1117] pt-16 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0 opacity-40">
        <FloatingParticles particleCount={48} />
      </div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15),transparent)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />

      {/* Main Content */}
      <div className="relative z-10 pt-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Hero Section with single headline at top */}
        <section className="min-h-[85vh] flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Single headline at the very top */}
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
              className="skrblai-heading text-center text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto mb-8" 
              aria-label="Meet Percy, Your AI Concierge"
            >
              Meet <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Percy</span>, Your AI Concierge
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mx-auto mb-10"
            >
              I'm here to guide you to the perfect AI solution for your business. No overwhelm, no confusion - just personalized recommendations.
            </motion.p>
            
            {/* Percy Image - Full body, centered and glowing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100 }}
              className="relative my-6 md:my-8 flex justify-center"
            >
              <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-xl animate-pulse"></div>
                <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    {/* Use CloudinaryImage when agent data loaded, otherwise fallback to normal Image */}
                    {agents.length > 0 && agents.find(a => a.id === 'percy') ? (
                      <CloudinaryImage
                        agent={agents.find(a => a.id === 'percy')!}
                        alt="Percy AI Concierge"
                        width={256}
                        height={256}
                        priority={true}
                        className="w-full h-full object-cover"
                        useCloudinary={true}
                        quality={90}
                        webp={true}
                        cloudinaryTransformation="ar_1:1,c_fill,g_face"
                        fallbackToLocal={true}
                        fallbackImagePath="/images/agents-percy-nobg-skrblai.png"
                      />
                    ) : (
                      <Image
                        src="/images/agents-percy-nobg-skrblai.png"
                        alt="Percy AI Concierge"
                        width={256}
                        height={256}
                        priority
                        className="w-full h-full object-cover cosmic-img-glow"
                      />
                    )}
                  </div>
                </div>
                
                {/* Glow effects */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping"></div>
              </div>
            </motion.div>
            
            {/* Floating glassmorphism onboarding card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-full max-w-xl mx-auto mt-8 md:mt-10 cosmic-glass p-6 md:p-8 rounded-2xl border border-white/10 shadow-[0_0_32px_rgba(30,144,255,0.2)]"
            >
              <div className="mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Start with Percy</h3>
                <p className="text-gray-300 text-sm md:text-base">Tell me what you're looking for or upload a file to get started</p>
              </div>
              
              {/* Universal Prompt Bar */}
              <UniversalPromptBar
                title="How can I help you today?"
                description="Ask me anything or upload a file to get started"
                placeholder="Enter your question or describe what you need..."
                acceptedFileTypes=".pdf,.doc,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png"
                promptLabel=""
                buttonText={isUploading ? "Uploading..." : "Submit"}
                theme="dark"
                showPrompt={true}
                minimalUI={false}
                compact={false}
                className="w-full"
                fileCategory="upload"
                intentType="ask"
                onPromptSubmit={(prompt) => {
                  console.log('Prompt submitted:', prompt);
                  // Handle redirect or intent setting
                  if (prompt.trim()) {
                    router.push(`/dashboard?prompt=${encodeURIComponent(prompt)}`);
                  }
                }}
                onFileUpload={(fileUrl, metadata) => {
                  console.log('File uploaded:', fileUrl, metadata);
                }}
                onComplete={(data) => {
                  console.log('Completed:', data);
                  setIsUploading(false);
                  if (data.prompt || data.fileUrl) {
                    router.push('/dashboard');
                  }
                }}
              />
              
              <div className="mt-6 text-center">
                <Link href="/pricing" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                  Try Premium for unlimited AI interactions and advanced features
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Agent Showcase - Below hero */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="py-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Discover Our AI Agents
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Each agent is specialized for specific tasks, ready to transform your workflow and boost productivity.
            </p>
          </div>
          
          {/* Agent Carousel for better mobile experience */}
          <div className="mb-16">
            <AgentCarousel 
              agents={agents.slice(0, 6)} 
              showPremiumBadges={true}
              onLaunch={(agent) => setSelectedAgent(agent)}
            />
          </div>
          
          <div className="mt-8 mb-12 text-center">
            <Link 
              href="/agents" 
              className="cosmic-btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl"
            >
              <span>View All Agents</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </motion.section>

        {/* Bottom CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center py-16 mb-24"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            Ready to Transform Your Business?
          </h3>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of businesses already using SKRBL AI to automate workflows, 
            generate content, and accelerate growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(56, 189, 248, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
            </Link>
            
            <Link href="/features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
