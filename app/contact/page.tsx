'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/layout/PageLayout';
import CosmicBackground from '@/components/shared/CosmicBackground';
import CosmicHeading from '@/components/shared/CosmicHeading';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { MessageCircle, Rocket, TrendingUp, Users, Zap, Clock, Star, Crown, DollarSign, Target, Phone, Mail, Calendar } from 'lucide-react';
import SkrblAiText from '@/components/shared/SkrblAiText';

// Live contact metrics simulation
const useLiveContactMetrics = () => {
  const [metrics, setMetrics] = useState({
    responseTime: 24,
    inquiriesToday: 47,
    dealsClosedThisWeek: 12,
    avgProjectValue: 85000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        responseTime: Math.max(1, prev.responseTime - Math.floor(Math.random() * 2)),
        inquiriesToday: prev.inquiriesToday + Math.floor(Math.random() * 2),
        dealsClosedThisWeek: prev.dealsClosedThisWeek + (Math.random() > 0.9 ? 1 : 0),
        avgProjectValue: prev.avgProjectValue + Math.floor(Math.random() * 5000) - 2500
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};

const urgentContactOptions = [
  {
    title: 'Enterprise & Custom Solutions',
    description: 'Custom AI automation for enterprise.',
    icon: <Rocket className="w-6 h-6 sm:w-8 sm:h-8" />,
    action: 'enterprise',
    urgency: '< 2 hours',
    valueProposition: 'ROI 300%+ in 90 days',
    color: 'from-green-400 to-emerald-600',
    priority: 'URGENT'
  },
  {
    title: 'Partnership & Integration',
    description: 'Strategic partnerships that disrupt.',
    icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
    action: 'partnership',
    urgency: '< 4 hours', 
    valueProposition: 'Exclusive AI access',
    color: 'from-purple-400 to-pink-600',
    priority: 'HIGH'
  },
  {
    title: 'Media & Press',
    description: 'Cover the AI automation story.',
    icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />,
    action: 'media',
    urgency: '< 1 hour',
    valueProposition: 'Exclusive insights',
    color: 'from-orange-400 to-red-600',
    priority: 'IMMEDIATE'
  },
  {
    title: 'Investment & Funding',
    description: 'Invest in proven AI revenue.',
    icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />,
    action: 'investment',
    urgency: '< 2 hours',
    valueProposition: 'Proven revenue model',
    color: 'from-yellow-400 to-orange-600',
    priority: 'URGENT'
  }
];

const quickContactMethods = [
  {
    method: "Direct Email",
    contact: "contact@skrblai.io",
    description: "Immediate assistance",
    icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6" />,
    responseTime: "< 2 hours"
  },
  {
    method: "Enterprise Hotline",
    contact: "(844) 426-2860",
    description: "Enterprise calls",
    icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6" />,
    responseTime: "< 30 min"
  },
  {
    method: "Schedule Demo",
    contact: "contact@skrblai.io",
    description: "Platform demo",
    icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
    responseTime: "Same day"
  }
];

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.09, duration: 0.45, type: 'spring' as const, stiffness: 100, damping: 16 },
  }),
};

export default function ContactPage() {
  const metrics = useLiveContactMetrics();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    subject: '',
    contactType: 'general',
    phoneNumber: '',
    projectTimeline: 'immediate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          urgencyLevel: selectedOption === 'enterprise' || selectedOption === 'investment' ? 'HIGH' : 'NORMAL'
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          message: '',
          company: '',
          subject: '',
          contactType: 'general',
          phoneNumber: '',
          projectTimeline: 'immediate'
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickContact = (option: any) => {
    setSelectedOption(option.action);
    setFormData(prev => ({
      ...prev,
      contactType: option.action,
      subject: option.title
    }));
  };

  if (submitted) {
    return (
      <PageLayout>
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-green-900/20 to-emerald-900/20">
            <FloatingParticles />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24 relative z-10">
            <div className="max-w-2xl sm:max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="px-4"
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Rocket className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>

                <motion.div
                  className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30 mb-6 sm:mb-8"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="text-green-300 font-bold text-sm sm:text-base">MISSION RECEIVED</span>
                </motion.div>

                <CosmicHeading level={1} className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6">
                  Your Message is <span className="text-green-400">Launched!</span>
                </CosmicHeading>
                
                <p className="text-lg sm:text-xl lg:text-2xl text-green-400 mb-4 sm:mb-6 font-bold px-2">
                  <span className="text-cyan-400 font-bold">Percy</span> and the <SkrblAiText variant="glow" size="sm">SKRBL AI</SkrblAiText> team are analyzing your request.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                  <GlassmorphicCard className="p-4 sm:p-6 border-green-400/30">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2 sm:mb-3" />
                    <div className="text-xs sm:text-sm text-gray-300">Response Time</div>
                    <div className="text-lg sm:text-xl font-bold text-green-400">
                      {selectedOption === 'media' ? '< 1 hour' : 
                       selectedOption === 'enterprise' || selectedOption === 'investment' ? '< 2 hours' : 
                       '< 24 hours'}
                    </div>
                  </GlassmorphicCard>

                  <GlassmorphicCard className="p-4 sm:p-6 border-cyan-400/30">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mx-auto mb-2 sm:mb-3" />
                    <div className="text-xs sm:text-sm text-gray-300">Priority Level</div>
                    <div className="text-lg sm:text-xl font-bold text-cyan-400">
                      {selectedOption === 'media' ? 'IMMEDIATE' :
                       selectedOption === 'enterprise' || selectedOption === 'investment' ? 'URGENT' : 'HIGH'}
                    </div>
                  </GlassmorphicCard>

                  <GlassmorphicCard className="p-4 sm:p-6 border-purple-400/30">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2 sm:mb-3" />
                    <div className="text-xs sm:text-sm text-gray-300">Next Steps</div>
                    <div className="text-lg sm:text-xl font-bold text-purple-400">
                      {selectedOption === 'enterprise' ? 'Demo Prep' : 'Analysis'}
                    </div>
                  </GlassmorphicCard>
                </div>

                <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
                  For immediate assistance:{' '}
                  <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 underline font-semibold break-all">
                    contact@skrblai.io
                  </a>
                  {' '}or call{' '}
                  <a href="tel:8444262860" className="text-electric-blue hover:text-teal-400 underline font-semibold whitespace-nowrap">
                    (844) 426-2860
                  </a>
                </p>

                <div className="flex flex-col gap-3 sm:gap-4 items-center">
                  <CosmicButton href="/" variant="primary" size="lg" className="w-full sm:w-auto">
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Return to Mission Control
                  </CosmicButton>
                  <CosmicButton href="/agents" variant="secondary" size="lg" className="w-full sm:w-auto">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Explore Agent League
                  </CosmicButton>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
          <FloatingParticles />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 relative z-10">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="px-2"
            >
              {/* Live Contact Metrics - Mobile Optimized */}
              <motion.div
                className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30 mb-6 sm:mb-8 max-w-full"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                <div className="text-cyan-300 font-bold text-sm sm:text-base text-center">
                  <span className="block sm:inline">LIVE: {metrics.inquiriesToday} inquiries today</span>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline">Avg response: {metrics.responseTime} min</span>
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse flex-shrink-0"></div>
              </motion.div>

              <CosmicHeading level={1} className="text-3xl sm:text-5xl lg:text-7xl mb-6 sm:mb-8">
                Ready to <span className="text-electric-blue">Dominate</span> Your Market?
              </CosmicHeading>
              
              <motion.p
                className="text-lg sm:text-xl lg:text-2xl text-electric-blue leading-relaxed mb-4 sm:mb-6 font-bold max-w-3xl mx-auto px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Whether you're ready to scale, disrupt, or explore AI automation.
              </motion.p>
              
              <motion.p
                className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Join {metrics.dealsClosedThisWeek} companies that chose <SkrblAiText variant="pulse" size="sm">SKRBL AI</SkrblAiText> this week. 
                <br className="sm:hidden" />
                <span className="block sm:inline mt-1 sm:mt-0">
                  Avg project: <span className="text-green-400 font-bold">${metrics.avgProjectValue.toLocaleString()}</span>
                </span>
              </motion.p>

              {/* Quick Contact Methods - Mobile Optimized */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-10 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {quickContactMethods.map((method, index) => (
                  <GlassmorphicCard key={method.method} className="p-4 sm:p-6 text-center hover:border-cyan-400/50 transition-all duration-300 min-h-[180px] sm:min-h-[200px]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-3 sm:mb-4">
                      {method.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2">{method.method}</h3>
                    <p className="text-electric-blue font-semibold mb-2 text-sm sm:text-base break-all">{method.contact}</p>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3">{method.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-green-400 font-bold">{method.responseTime}</span>
                    </div>
                  </GlassmorphicCard>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Priority Contact Options - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-6xl mx-auto mb-12 sm:mb-16"
          >
            <div className="text-center mb-8 sm:mb-12 px-2">
              <CosmicHeading className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">
                Choose Your <span className="text-electric-blue">Mission</span>
              </CosmicHeading>
              <p className="text-gray-300 text-base sm:text-lg">Select priority level for fastest response</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2">
              {urgentContactOptions.map((option, index) => (
                <motion.div
                  key={option.action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative"
                >
                  <GlassmorphicCard 
                    className={`p-4 sm:p-6 h-full cursor-pointer transition-all duration-300 hover:scale-105 min-h-[280px] sm:min-h-[320px] ${
                      selectedOption === option.action ? 'border-cyan-400 bg-cyan-400/10' : 'hover:border-cyan-400/50'
                    }`}
                    onClick={() => handleQuickContact(option)}
                  >
                    {/* Priority Badge - Mobile Optimized */}
                    <div className={`absolute -top-2 -right-2 px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${option.color} text-white`}>
                      {option.priority}
                    </div>

                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center text-white mb-4 sm:mb-6 mx-auto`}>
                      {option.icon}
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 text-center leading-tight">{option.title}</h3>
                    <p className="text-gray-300 mb-4 text-center leading-relaxed text-sm sm:text-base">{option.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-green-400 font-bold text-right">{option.urgency}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-sm text-yellow-400 font-bold text-right">{option.valueProposition}</span>
                      </div>
                    </div>

                    {selectedOption === option.action && (
                      <div className="mt-4 p-3 bg-cyan-400/20 rounded-lg border border-cyan-400/30">
                        <p className="text-sm text-cyan-300 font-bold text-center">SELECTED</p>
                      </div>
                    )}
                  </GlassmorphicCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-2xl mx-auto"
          >
            <GlassmorphicCard className="p-6 sm:p-8 lg:p-12">
              <div className="text-center mb-6 sm:mb-8">
                <CosmicHeading className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">
                  Launch Your <span className="text-electric-blue">Transformation</span>
                </CosmicHeading>
                <p className="text-gray-300 text-sm sm:text-base">Fill out the form - our team will contact you within hours</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 sm:py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors text-base"
                      placeholder="Your name"
                    />
                  </motion.div>

                  <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 sm:py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors text-base"
                      placeholder="your@email.com"
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors text-base"
                      placeholder="Your company"
                    />
                  </motion.div>

                  <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors text-base"
                      placeholder="+1 (555) 123-4567"
                    />
                  </motion.div>
                </div>

                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                  <label htmlFor="projectTimeline" className="block text-sm font-bold text-electric-blue mb-2">
                    Project Timeline
                  </label>
                  <select
                    id="projectTimeline"
                    name="projectTimeline"
                    value={formData.projectTimeline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white focus:border-electric-blue focus:outline-none transition-colors text-base"
                  >
                    <option value="immediate">Immediate (ASAP)</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">1-3 months</option>
                    <option value="6-months">3-6 months</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </motion.div>

                <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-bold text-electric-blue mb-2">
                    Tell us about your mission *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 sm:py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors resize-none text-base"
                    placeholder="Describe your project, goals, and how SKRBL AI can help transform your business..."
                  />
                </motion.div>

                <motion.div 
                  custom={6} 
                  variants={fieldVariants} 
                  initial="hidden" 
                  animate="visible"
                  className="text-center pt-2"
                >
                  <CosmicButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-h-[48px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Launching Mission...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Launch Your Transformation
                      </>
                    )}
                  </CosmicButton>

                  <p className="text-sm text-gray-400 mt-3 sm:mt-4">
                    Expected response: {selectedOption === 'media' ? '< 1 hour' : 
                                      selectedOption === 'enterprise' || selectedOption === 'investment' ? '< 2 hours' : 
                                      '< 24 hours'}
                  </p>
                </motion.div>
              </form>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}