'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/layout/PageLayout';
import CosmicBackground from '@/components/shared/CosmicBackground';
import CosmicHeading from '@/components/shared/CosmicHeading';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.09, duration: 0.45, type: 'spring' as const, stiffness: 100, damping: 16 },
  }),
};

const contactOptions = [
  {
    title: 'Partnership Inquiries',
    description: 'Ready to disrupt industries together? Let\'s build the future.',
    icon: '🤝',
    action: 'partnership',
    urgency: 'Response within 24 hours'
  },
  {
    title: 'Sponsorship Opportunities',
    description: 'Sponsor the AI revolution and get front-row seats to innovation.',
    icon: '💡',
    action: 'sponsorship', 
    urgency: 'Response within 12 hours'
  },
  {
    title: 'Enterprise Solutions',
    description: 'Scale beyond limits with custom AI automation architecture.',
    icon: '🏢',
    action: 'enterprise',
    urgency: 'Response within 6 hours'
  },
  {
    title: 'Media & Press',
    description: 'Cover the story that\'s reshaping how business gets done.',
    icon: '📺',
    action: 'media',
    urgency: 'Response within 2 hours'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    subject: '',
    contactType: 'general'
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
      // Submit to your backend API
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          message: '',
          company: '',
          subject: '',
          contactType: 'general'
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
        <div className="relative min-h-screen">
          <CosmicBackground />
          
          <div className="container mx-auto px-4 py-24 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
                <CosmicHeading level={1} className="mb-4">Message Sent Successfully!</CosmicHeading>
                <p className="text-xl text-green-400 mb-4">Your message has been launched into the SKRBL AI universe.</p>
                <p className="text-gray-300 mb-8">
                  Percy and the team will review your message and respond within 24 hours. For urgent matters, 
                  email us directly at <a href="mailto:contact@skrblai.io" className="text-cyan-400 underline">contact@skrblai.io</a>
                </p>
                <CosmicButton href="/" variant="primary">
                  Return to Mission Control
                </CosmicButton>
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="relative min-h-screen">
        <CosmicBackground />
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-400/30 mb-6">
                <Image
                  src="/images/agents-percy-nobg-skrblai.webp"
                  alt="Percy"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-cyan-300 font-bold">COSMIC COMMUNICATIONS PORTAL</span>
              </div>
            </motion.div>

            <CosmicHeading level={1}>Ready to Join the Revolution?</CosmicHeading>
            
            <motion.p
              className="text-xl text-electric-blue leading-relaxed mb-6 font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Whether you're looking to partner, sponsor, or just want to see what all the disruption is about.
            </motion.p>
            
            <motion.p
              className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              For urgent matters, email{' '}
              <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 underline transition-colors font-semibold">
                contact@skrblai.io
              </a>{' '}
              or choose your mission below.
            </motion.p>
          </div>

          {/* Quick Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16"
          >
            {contactOptions.map((option, index) => (
              <motion.div
                key={option.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <GlassmorphicCard
                  onClick={() => handleQuickContact(option)}
                  className={`p-6 text-center cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                    selectedOption === option.action 
                      ? 'border-cyan-400/80 bg-cyan-400/10' 
                      : 'border-gray-400/20 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h3 className="text-lg font-bold text-electric-blue mb-2">{option.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{option.description}</p>
                  <div className="text-xs text-green-400 font-semibold">{option.urgency}</div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Contact Form */}
          <div className="max-w-4xl mx-auto">
            <GlassmorphicCard className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-electric-blue mb-6 text-center">
                  Launch Your Message into the SKRBL AI Universe
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      custom={0}
                      initial="hidden"
                      animate="visible"
                      variants={fieldVariants}
                    >
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                        placeholder="Your name"
                      />
                    </motion.div>

                    <motion.div
                      custom={1}
                      initial="hidden"
                      animate="visible"
                      variants={fieldVariants}
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                        placeholder="your@email.com"
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      custom={2}
                      initial="hidden"
                      animate="visible"
                      variants={fieldVariants}
                    >
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                        placeholder="Your company"
                      />
                    </motion.div>

                    <motion.div
                      custom={3}
                      initial="hidden"
                      animate="visible"
                      variants={fieldVariants}
                    >
                      <label htmlFor="contactType" className="block text-sm font-medium text-gray-300 mb-2">
                        Contact Type
                      </label>
                      <select
                        id="contactType"
                        name="contactType"
                        value={formData.contactType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="partnership">Partnership</option>
                        <option value="sponsorship">Sponsorship</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="media">Media & Press</option>
                        <option value="support">Support</option>
                      </select>
                    </motion.div>
                  </div>

                  <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={fieldVariants}
                  >
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all"
                      placeholder="What's this about?"
                    />
                  </motion.div>

                  <motion.div
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    variants={fieldVariants}
                  >
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-all resize-vertical"
                      placeholder="Tell us about your vision, goals, or how we can help disrupt your industry..."
                    />
                  </motion.div>

                  <motion.div
                    custom={6}
                    initial="hidden"
                    animate="visible"
                    variants={fieldVariants}
                    className="text-center"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full md:w-auto px-12 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⚡</span>
                          Launching Message...
                        </>
                      ) : (
                        <>
                          Launch Message 🚀
                        </>
                      )}
                    </button>
                    
                    <p className="text-gray-400 text-sm mt-4">
                      Your message will be reviewed by Percy and the team.<br />
                      Response time: 2-24 hours depending on inquiry type.
                    </p>
                  </motion.div>
                </form>
              </motion.div>
            </GlassmorphicCard>
          </div>

          {/* Direct Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-4xl mx-auto mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-electric-blue mb-8">Or Connect Directly</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassmorphicCard className="p-6 text-center">
                <div className="text-3xl mb-3">📧</div>
                <h4 className="text-lg font-bold text-white mb-2">Email</h4>
                <a 
                  href="mailto:contact@skrblai.io" 
                  className="text-electric-blue hover:text-teal-400 transition-colors"
                >
                  contact@skrblai.io
                </a>
                <p className="text-gray-400 text-sm mt-2">Direct line to the team</p>
              </GlassmorphicCard>

              <GlassmorphicCard className="p-6 text-center">
                <div className="text-3xl mb-3">💬</div>
                <h4 className="text-lg font-bold text-white mb-2">Live Chat</h4>
                <p className="text-cyan-400 font-semibold">Available 24/7</p>
                <p className="text-gray-400 text-sm mt-2">Ask Percy anything</p>
              </GlassmorphicCard>

              <GlassmorphicCard className="p-6 text-center">
                <div className="text-3xl mb-3">📞</div>
                <h4 className="text-lg font-bold text-white mb-2">Enterprise Hotline</h4>
                <p className="text-purple-400 font-semibold">Priority Support</p>
                <p className="text-gray-400 text-sm mt-2">For enterprise customers</p>
              </GlassmorphicCard>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}