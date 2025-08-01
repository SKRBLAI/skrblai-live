'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import GlassmorphicCard from '../../components/shared/GlassmorphicCard';
import GlassmorphicForm from '../../components/shared/GlassmorphicForm';
import CosmicButton from '../../components/shared/CosmicButton';
import CosmicHeading from '../../components/shared/CosmicHeading';
import { CosmicCardGlow, CosmicCardGlass } from '../../components/shared/CosmicCard';
import { MessageCircle, Rocket, TrendingUp, Users, Zap, Clock, Star, Crown, DollarSign, Target, Phone, Mail, Calendar } from 'lucide-react';
import SkrblAiText from '../../components/shared/SkrblAiText';

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
      <ClientPageLayout>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="min-h-screen relative"
        >
          <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
            <section className="relative z-10">
              <div className="max-w-4xl mx-auto px-4 md:px-8">
                <CosmicCardGlow size="xl" className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
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
                <CosmicCardGlass className="p-6 text-center border-green-400/30">
                  <Clock className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-300">Response Time</div>
                  <div className="text-xl font-bold text-green-400">
                    {selectedOption === 'media' ? '< 1 hour' : 
                     selectedOption === 'enterprise' || selectedOption === 'investment' ? '< 2 hours' : 
                     '< 24 hours'}
                  </div>
                </CosmicCardGlass>

                <CosmicCardGlass className="p-6 text-center border-cyan-400/30">
                  <MessageCircle className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-300">Priority Level</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {selectedOption === 'media' ? 'IMMEDIATE' :
                     selectedOption === 'enterprise' || selectedOption === 'investment' ? 'URGENT' : 'HIGH'}
                  </div>
                </CosmicCardGlass>

                <CosmicCardGlass className="p-6 text-center border-purple-400/30">
                  <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-300">Next Steps</div>
                  <div className="text-xl font-bold text-purple-400">
                    {selectedOption === 'enterprise' ? 'Demo Prep' : 'Analysis'}
                  </div>
                </CosmicCardGlass>
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
                </CosmicCardGlow>
              </div>
            </section>
          </div>
        </motion.div>
      </ClientPageLayout>
    );
  }

  return (
    <ClientPageLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
          
          {/* Hero Section with Live Activity - Matching About Page Style */}
          <section className="relative z-10 mb-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <CosmicCardGlow size="xl" className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Live Activity Banner */}
                  <motion.div
                    className="flex items-center justify-center gap-4 mb-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-full"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-red-300 font-bold text-sm">
                        LIVE: {metrics.inquiriesToday} inquiries today
                      </span>
                    </motion.div>
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 rounded-full"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-bold text-sm">
                        Avg response: {metrics.responseTime} min
                      </span>
                    </motion.div>
                  </motion.div>

                  <CosmicHeading className="text-4xl md:text-6xl mb-8">
                    Ready to <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Dominate</span> Your Market?
                  </CosmicHeading>

                  <motion.p
                    className="text-xl md:text-2xl text-electric-blue mb-6 font-bold max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Whether you're ready to scale, disrupt, or explore AI automation. <SkrblAiText variant="wave" size="lg">SKRBL AI</SkrblAiText> delivers real solutions, real results, real fast.
                  </motion.p>

                  <motion.p
                    className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Percy's Contact Intelligence connects you directly to the right team member for immediate action. 
                    No forms, no waiting - just instant business transformation.
                  </motion.p>

                  <motion.div
                    className="flex items-center justify-center gap-4 mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Image
                      src="/images/agents-percy-nobg-skrblai.webp"
                      alt="Percy the AI Concierge"
                      width={80}
                      height={80}
                      className="rounded-full shadow-[0_0_30px_rgba(48,213,200,0.6)] bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border-2 border-cyan-400/50"
                      priority
                    />
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">Percy's Contact Intelligence</div>
                      <div className="text-cyan-400 text-sm font-semibold">🧠 Connecting you to the right team...</div>
                    </div>
                  </motion.div>
                </motion.div>
              </CosmicCardGlow>
            </div>
          </section>

          {/* Quick Contact Methods - Like About Page Metrics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {quickContactMethods.map((method, index) => (
              <motion.div
                key={method.method}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group cursor-pointer transition-all duration-300"
              >
                <CosmicCardGlass className="h-full p-6 text-center relative overflow-hidden">
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
                </CosmicCardGlass>
              </motion.div>
            ))}
          </motion.div>

          {/* Priority Contact Options - Like About Page Story Cards */}
          <section className="relative z-10 mb-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <CosmicCardGlass className="text-center mb-12">
                <CosmicHeading className="text-3xl md:text-4xl mb-4">
                  Choose Your <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Priority Level</span>
                </CosmicHeading>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Select the contact option that matches your urgency and business needs for the fastest response.
                </p>
              </CosmicCardGlass>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {urgentContactOptions.map((option, index) => (
                  <motion.div
                    key={option.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.9 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 60px 15px rgba(147,51,234,0.4)'
                    }}
                    onClick={() => handleQuickContact(option)}
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      selectedOption === option.action ? 'ring-4 ring-cyan-400/50' : ''
                    }`}
                  >
                    <CosmicCardGlass className="h-full p-6 relative overflow-hidden">
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
                </CosmicCardGlass>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Contact Form - Like About Page Style */}
          <section className="relative z-10 mb-16">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
              <CosmicCardGlow size="lg" className="mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  <CosmicHeading className="text-4xl md:text-5xl mb-6 text-center">
                    Send Your <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Mission Brief</span>
                  </CosmicHeading>
                  
                  <p className="text-lg text-gray-300 mb-8 text-center max-w-3xl mx-auto">
                    Ready to transform your business? Share your goals and we'll connect you with the perfect AI solution within minutes.
                  </p>
              <GlassmorphicForm onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-bold text-purple-300 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 text-lg bg-black/20 border-2 border-purple-400/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold text-purple-300 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 text-lg bg-black/20 border-2 border-purple-400/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-bold text-purple-300 mb-3">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-6 py-4 text-lg bg-black/20 border-2 border-purple-400/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-purple-300 mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-6 py-4 text-lg bg-black/20 border-2 border-purple-400/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="projectTimeline" className="block text-base font-bold text-purple-300 mb-3">
                    Project Timeline
                  </label>
                  <select
                    id="projectTimeline"
                    name="projectTimeline"
                    value={formData.projectTimeline}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg bg-black/20 border-2 border-purple-400/30 rounded-xl text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  >
                    <option value="immediate">Immediate (ASAP)</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">1-3 months</option>
                    <option value="6-months">3-6 months</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-bold text-purple-300 mb-3">
                    Tell us about your mission *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-6 py-4 text-lg bg-black/20 border-2 border-purple-400/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm resize-none"
                    placeholder="Describe your project, goals, and how SKRBL AI can help transform your business..."
                  />
                </div>

                <div className="text-center pt-4">
                  <CosmicButton
                    type="submit"
                    variant="glass"
                    size="xl"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto hover:shadow-[0_0_40px_rgba(147,51,234,0.6),0_0_80px_rgba(59,130,246,0.4)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500"
                    glowColor="purple-400"
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
                </GlassmorphicForm>
                </motion.div>
              </CosmicCardGlow>
            </div>
          </section>

          {/* CTA Section - Like About Page Style */}
          <section className="relative z-10 mb-24">
            <div className="max-w-5xl mx-auto px-4 md:px-8">
              <CosmicCardGlow size="xl" className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                Ready To Transform Your Business?
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
                Join {metrics.dealsClosedThisWeek} companies that chose <SkrblAiText variant="glow" size="md">SKRBL AI</SkrblAiText> this week. Avg project: <span className="text-cyan-400 font-bold">${metrics.avgProjectValue.toLocaleString()}</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <CosmicButton
                  href="/sign-up"
                  variant="glass"
                  size="xl"
                  className="hover:shadow-[0_0_40px_rgba(147,51,234,0.6),0_0_80px_rgba(59,130,246,0.4)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500"
                  glowColor="purple-400"
                >
                  🚀 Start Free Trial (No Credit Card)
                </CosmicButton>
                <CosmicButton
                  href="/agents"
                  variant="outline"
                  size="xl"
                  className="border-2 border-cyan-400/50 text-cyan-300 hover:border-purple-400/70 hover:text-purple-300 hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all duration-300"
                >
                  👥 Meet Your Agent League
                </CosmicButton>
              </div>
                <div className="text-base text-purple-300 bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-purple-400/20">
                  ⚡ Setup in under 5 minutes • 🎯 See results in 7 days • 💰 Cancel anytime
                </div>
                </motion.div>
              </CosmicCardGlow>
            </div>
          </section>
        </div>
              </motion.div>
      </ClientPageLayout>
  );
}