'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/layout/PageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import CosmicHeading from '@/components/shared/CosmicHeading';
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
    description: 'Custom AI automation for enterprise transformation and ROI maximization.',
    icon: <Rocket className="w-8 h-8" />,
    action: 'enterprise',
    urgency: '< 2 hours',
    valueProposition: 'ROI 300%+ in 90 days',
    color: 'from-green-600 to-emerald-500',
    priority: 'URGENT',
    href: '/enterprise',
    liveActivity: { users: 23, status: "🔥 Hot" }
  },
  {
    title: 'Partnership & Integration',
    description: 'Strategic partnerships that create market disruption and competitive advantage.',
    icon: <Users className="w-8 h-8" />,
    action: 'partnership',
    urgency: '< 4 hours', 
    valueProposition: 'Exclusive AI access',
    color: 'from-purple-600 to-pink-500',
    priority: 'HIGH',
    href: '/partnership',
    liveActivity: { users: 18, status: "🎯 Trending" }
  },
  {
    title: 'Media & Press',
    description: 'Cover the AI automation revolution and exclusive industry insights.',
    icon: <Star className="w-8 h-8" />,
    action: 'media',
    urgency: '< 1 hour',
    valueProposition: 'Exclusive insights',
    color: 'from-orange-600 to-red-500',
    priority: 'IMMEDIATE',
    href: '/media',
    liveActivity: { users: 12, status: "📝 Creating" }
  },
  {
    title: 'Investment & Funding',
    description: 'Invest in proven AI revenue generation with documented market success.',
    icon: <DollarSign className="w-8 h-8" />,
    action: 'investment',
    urgency: '< 2 hours',
    valueProposition: 'Proven revenue model',
    color: 'from-yellow-600 to-orange-500',
    priority: 'URGENT',
    href: '/investment',
    liveActivity: { users: 31, status: "🚀 Converting" }
  }
];

const quickContactMethods = [
  {
    method: "Direct Email",
    contact: "contact@skrblai.io",
    description: "Immediate assistance",
    icon: <Mail className="w-6 h-6" />,
    responseTime: "< 2 hours"
  },
  {
    method: "Enterprise Hotline",
    contact: "(844) 426-2860",
    description: "Enterprise calls",
    icon: <Phone className="w-6 h-6" />,
    responseTime: "< 30 min"
  },
  {
    method: "Schedule Demo",
    contact: "contact@skrblai.io",
    description: "Platform demo",
    icon: <Calendar className="w-6 h-6" />,
    responseTime: "Same day"
  }
];

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (submitted) {
    return (
      <PageLayout>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="min-h-screen relative"
        >
          <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🎯 MISSION RECEIVED
                </div>
                <div className="flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-bold">
                  ⚡ Processing your request
                </div>
              </div>

              <CosmicHeading className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 mobile-text-safe no-text-cutoff">
                Your Message is <span className="text-green-400">Launched!</span>
              </CosmicHeading>
              
              <p className="text-lg sm:text-xl text-teal-300 max-w-3xl mx-auto mb-6 md:mb-8 font-semibold leading-relaxed mobile-text-safe no-text-cutoff">
                <span className="text-cyan-400 font-bold">Percy</span> and the <SkrblAiText variant="glow" size="sm">SKRBL AI</SkrblAiText> team are analyzing your request.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                <GlassmorphicCard className="p-6 border-green-400/30">
                  <Clock className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-300">Response Time</div>
                  <div className="text-xl font-bold text-green-400">
                    {selectedOption === 'media' ? '< 1 hour' : 
                     selectedOption === 'enterprise' || selectedOption === 'investment' ? '< 2 hours' : 
                     '< 24 hours'}
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard className="p-6 border-cyan-400/30">
                  <MessageCircle className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-300">Priority Level</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {selectedOption === 'media' ? 'IMMEDIATE' :
                     selectedOption === 'enterprise' || selectedOption === 'investment' ? 'URGENT' : 'HIGH'}
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard className="p-6 border-purple-400/30">
                  <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-300">Next Steps</div>
                  <div className="text-xl font-bold text-purple-400">
                    {selectedOption === 'enterprise' ? 'Demo Prep' : 'Analysis'}
                  </div>
                </GlassmorphicCard>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/" className="cosmic-btn-primary px-8 py-4 rounded-xl font-bold text-lg shadow-2xl">
                  🚀 Return to Mission Control
                </Link>
                <Link href="/agents" className="cosmic-btn-secondary px-8 py-4 rounded-xl font-bold text-lg">
                  👥 Explore Agent League
                </Link>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                For immediate assistance:{' '}
                <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 underline font-semibold">
                  contact@skrblai.io
                </a>
                {' '}or call{' '}
                <a href="tel:8444262860" className="text-electric-blue hover:text-teal-400 underline font-semibold">
                  (844) 426-2860
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
          
          {/* Hero Section with Live Activity - Matching Services */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔥 LIVE: {metrics.inquiriesToday} inquiries today
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                ⚡ Avg response: {metrics.responseTime} min
              </div>
            </div>
            
            <CosmicHeading className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 mobile-text-safe no-text-cutoff">
              Ready to <span className="text-electric-blue">Dominate</span> Your Market?
            </CosmicHeading>
            <p className="text-lg sm:text-xl text-teal-300 max-w-3xl mx-auto mb-6 md:mb-8 font-semibold leading-relaxed mobile-text-safe no-text-cutoff">
              Whether you're ready to scale, disrupt, or explore AI automation. <span className="text-white font-bold">Real solutions, real results, real fast.</span>
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <Image
                src="/images/agents-percy-nobg-skrblai.webp"
                alt="Percy the AI Concierge"
                width={80}
                height={80}
                className="rounded-full shadow-cosmic bg-white/10 border-2 border-cyan-400/30"
                priority
              />
              <div className="text-left">
                <div className="text-white font-bold">Percy's Contact Intelligence</div>
                <div className="text-cyan-400 text-sm">🧠 Connecting you to the right team...</div>
              </div>
            </div>
          </motion.div>

          {/* Quick Contact Methods - Matching Services Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
          >
            {quickContactMethods.map((method, index) => (
              <motion.div
                key={method.method}
                variants={item}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group cursor-pointer transition-all duration-300"
              >
                <GlassmorphicCard className="h-full p-6 relative overflow-hidden">
                  <div className="flex flex-col items-center mb-2">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500 shadow-glow mb-2 group-hover:scale-110 transition-transform">
                      {method.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white min-h-[2.5rem] break-words text-center mb-1">
                      {method.method}
                    </h3>
                    <p className="text-electric-blue font-semibold text-center mb-2 break-all">
                      {method.contact}
                    </p>
                  </div>

                  <p className="text-gray-300 mb-4 text-center">
                    {method.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-cyan-400/20">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-bold">{method.responseTime}</span>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Priority Contact Options - Matching Services Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16"
          >
            {urgentContactOptions.map((option, index) => (
              <motion.div
                key={option.action}
                variants={item}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => handleQuickContact(option)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedOption === option.action ? 'ring-4 ring-cyan-400/50' : ''
                }`}
              >
                <GlassmorphicCard className="h-full p-6 relative overflow-hidden">
                  {/* Live Activity Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-bold">{option.liveActivity.users}</span>
                  </div>
                  
                  {/* Problem Header */}
                  <div className="flex flex-col items-center mb-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} shadow-glow mb-2 group-hover:scale-110 transition-transform`}>
                      {option.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white min-h-[2.5rem] break-words text-center mb-1">
                      {option.title}
                    </h3>
                    <p className="text-gray-400 text-sm text-center mb-2">
                      {option.priority} Priority
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4 line-clamp-2 text-center">
                    {option.description}
                  </p>

                  {/* Separated Stat Block (Premium Style) */}
                  <div className="mt-auto pt-4 border-t border-cyan-400/20">
                    <div className="flex flex-row gap-6 justify-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-green-400">{option.urgency}</span>
                        <span className="text-xs text-gray-400">Response</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-cyan-400">{option.valueProposition}</span>
                        <span className="text-xs text-gray-400">Value</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <CosmicButton 
                    variant="primary" 
                    className="w-full group-hover:shadow-xl transition-all mt-4"
                  >
                    🎯 Select This Priority
                  </CosmicButton>
                  
                  {/* Selection Indicator */}
                  {selectedOption === option.action && (
                    <div className="mt-2 p-2 bg-cyan-400/20 rounded-lg border border-cyan-400/30">
                      <p className="text-sm text-cyan-300 font-bold text-center">SELECTED</p>
                    </div>
                  )}

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl pointer-events-none`}></div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form - Matching Services Card Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <GlassmorphicCard className="p-8">
              <div className="text-center mb-8">
                <CosmicHeading className="text-2xl sm:text-3xl lg:text-4xl mb-4">
                  Launch Your <span className="text-electric-blue">Transformation</span>
                </CosmicHeading>
                <p className="text-gray-300">Fill out the form - our team will contact you within hours</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-electric-blue mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="projectTimeline" className="block text-sm font-bold text-electric-blue mb-2">
                    Project Timeline
                  </label>
                  <select
                    id="projectTimeline"
                    name="projectTimeline"
                    value={formData.projectTimeline}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white focus:border-electric-blue focus:outline-none transition-colors"
                  >
                    <option value="immediate">Immediate (ASAP)</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">1-3 months</option>
                    <option value="6-months">3-6 months</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-electric-blue mb-2">
                    Tell us about your mission *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-electric-blue focus:outline-none transition-colors resize-none"
                    placeholder="Describe your project, goals, and how SKRBL AI can help transform your business..."
                  />
                </div>

                <div className="text-center pt-2">
                  <CosmicButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
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

                  <p className="text-sm text-gray-400 mt-4">
                    Expected response: {selectedOption === 'media' ? '< 1 hour' : 
                                      selectedOption === 'enterprise' || selectedOption === 'investment' ? '< 2 hours' : 
                                      '< 24 hours'}
                  </p>
                </div>
              </form>
            </GlassmorphicCard>
          </motion.div>

          {/* CTA Section - Matching Services Style */}
          <motion.div
            className="max-w-5xl mx-auto text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl p-12 border border-purple-500/30">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready To Transform Your Business?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join {metrics.dealsClosedThisWeek} companies that chose <SkrblAiText variant="glow" size="md">SKRBL AI</SkrblAiText> this week. Avg project: <span className="text-green-400 font-bold">${metrics.avgProjectValue.toLocaleString()}</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/sign-up" className="cosmic-btn-primary px-8 py-4 rounded-xl font-bold text-lg shadow-2xl">
                  🚀 Start Free Trial (No Credit Card)
                </Link>
                <Link href="/agents" className="cosmic-btn-secondary px-8 py-4 rounded-xl font-bold text-lg">
                  👥 Meet Your Agent League
                </Link>
              </div>
              <div className="mt-6 text-sm text-gray-400">
                ⚡ Setup in under 5 minutes • 🎯 See results in 7 days • 💰 Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageLayout>
  );
}