'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FloatingParticles from '@/components/ui/FloatingParticles';
import BrandLogo from '@/components/ui/BrandLogo';

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.09, duration: 0.45, type: 'spring', stiffness: 100, damping: 16 },
  }),
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    subject: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen py-24 px-4 md:px-8 bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-hidden"
    >
      {/* Cosmic Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingParticles fullScreen={false} particleCount={60} speed={0.6} size={2.5} glowIntensity={0.35} />
      </div>
      <div className="container relative z-10 mx-auto max-w-4xl flex flex-col items-center justify-center">
        <BrandLogo className="skrblai-heading text-center mb-8 scale-125" animate />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="skrblai-heading text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-glow text-center"
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 text-center"
        >
          We’d love to hear from you. For urgent matters, email
          {' '}
          <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 underline transition-colors">contact@skrblai.io</a>.
        </motion.p>
        {/* Glassmorphic Card */}
        <div className="glass-card shadow-glow rounded-xl bg-white/5 backdrop-blur-xl bg-clip-padding border-2 border-teal-400/20 w-full max-w-3xl mx-auto p-6 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              aria-label="Contact form panel"
              className="flex flex-col justify-center"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 relative"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
                    className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-electric-blue to-teal-400 mb-6 shadow-lg"
                  >
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    Message Sent!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-gray-400 mb-6"
                  >
                    We'll get back to you as soon as possible.
                  </motion.p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 shadow"
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <motion.div variants={fieldVariants} custom={0} className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="Your name"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={1} className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="your@email.com"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={2} className="relative">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company (Optional)</label>
                    <motion.input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="Your company"
                    />
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={3} className="relative">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                    <motion.select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      aria-required="true"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Partnership">Partnership Opportunity</option>
                      <option value="Feature Request">Feature Request</option>
                    </motion.select>
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={4} className="relative">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <motion.textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="How can we help you?"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.button
                    variants={fieldVariants}
                    custom={5}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${isSubmitting ? 'bg-white/20 text-white/50' : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'}`}
                    aria-disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </motion.div>
            {/* Right: Info/FAQ Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col justify-center"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Email</h3>
                        <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 transition-colors duration-200">
                          contact@skrblai.io
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Website</h3>
                        <a href="https://skrblai.io" target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:text-teal-400 transition-colors duration-200">
                          skrblai.io
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl bg-white/5">
                  <h3 className="text-xl font-semibold mb-4 text-white">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white">What is SKRBL AI?</h4>
                      <p className="text-gray-400">SKRBL AI is an all-in-one interactive experience delivered by our team of AI superheroes specializing in content creation, branding, publishing, and marketing.</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">How quickly can I get started?</h4>
                      <p className="text-gray-400">Simply tap or message Percy your "Interactive AI Concierge" to get started with SKRBL AI. You'll be up and running in minutes!</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">Do you offer custom solutions?</h4>
                      <p className="text-gray-400">Absolutely, our enterprise plan includes custom AI solutions and dedicated support. <Link href="/pricing" className="text-electric-blue hover:text-teal-400">Learn more</Link>.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import Link from 'next/link';
import FloatingParticles from '@/components/ui/FloatingParticles';
import BrandLogo from '@/components/ui/BrandLogo';

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.09, duration: 0.45, type: 'spring', stiffness: 100, damping: 16 },
  }),
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    subject: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen py-24 px-4 md:px-8 bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-hidden"
    >
      {/* Cosmic Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingParticles fullScreen={false} particleCount={60} speed={0.6} size={2.5} glowIntensity={0.35} />
      </div>
      <div className="container relative z-10 mx-auto max-w-4xl flex flex-col items-center justify-center">
        <BrandLogo className="skrblai-heading text-center mb-8 scale-125" animate />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="skrblai-heading text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-glow text-center"
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 text-center"
        >
          We’d love to hear from you. For urgent matters, email
          {' '}
          <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 underline transition-colors">contact@skrblai.io</a>.
        </motion.p>
        {/* Glassmorphic Card */}
        <div className="glass-card shadow-glow rounded-xl bg-white/5 backdrop-blur-xl bg-clip-padding border-2 border-teal-400/20 w-full max-w-3xl mx-auto p-6 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              aria-label="Contact form panel"
              className="flex flex-col justify-center"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 relative"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
                    className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-electric-blue to-teal-400 mb-6 shadow-lg"
                  >
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    Message Sent!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-gray-400 mb-6"
                  >
                    We'll get back to you as soon as possible.
                  </motion.p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 shadow"
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <motion.div variants={fieldVariants} custom={0} className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="Your name"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={1} className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="your@email.com"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={2} className="relative">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company (Optional)</label>
                    <motion.input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="Your company"
                    />
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={3} className="relative">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                    <motion.select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      aria-required="true"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Partnership">Partnership Opportunity</option>
                    </motion.select>
                  </motion.div>
                  <motion.div variants={fieldVariants} custom={4} className="relative">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <motion.textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow resize-none"
                      placeholder="How can we help you?"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSubmitting}
                    className="w-full py-3 mt-2 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold rounded-lg shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue focus:ring-offset-[#161b22]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </motion.div>
            {/* Right: Info/FAQ Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col justify-center"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Email</h3>
                        <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 transition-colors duration-200">
                          contact@skrblai.io
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Website</h3>
                        <a href="https://skrblai.io" target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:text-teal-400 transition-colors duration-200">
                          skrblai.io
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl bg-white/5">
                  <h3 className="text-xl font-semibold mb-4 text-white">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white">What is SKRBL AI?</h4>
                      <p className="text-gray-400">SKRBL AI is an all-in-one interactive experience delivered by our team of AI superheroes specializing in content creation, branding, publishing, and marketing.</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">How quickly can I get started?</h4>
                      <p className="text-gray-400">Simply tap or message Percy your "Interactive AI Concierge" to get started with SKRBL AI. You'll be up and running in minutes!</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">Do you offer custom solutions?</h4>
                      <p className="text-gray-400">Absolutely, our enterprise plan includes custom AI solutions and dedicated support. <Link href="/pricing" className="text-electric-blue hover:text-teal-400">Learn more</Link>.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


import { motion } from 'framer-motion';
import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import PercyProvider from 'components/assistant/PercyProvider';
import PageLayout from '@/components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import BrandLogo from '@/components/ui/BrandLogo';

export const dynamic = 'force-dynamic';

// Framer Motion staggered variants for fields
const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.09, duration: 0.45, type: 'spring', stiffness: 100, damping: 16 },
  }),
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    subject: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
    
    // In production, this would send data to your backend or email service
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen py-24 px-6 overflow-hidden bg-gradient-to-b from-[#0d1117] to-[#161b22]"
    >
      {/* Cosmic Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingParticles fullScreen={false} particleCount={60} speed={0.6} size={2.5} glowIntensity={0.35} />
      </div>
      <div className="container relative z-10 mx-auto max-w-3xl flex flex-col items-center justify-center">
        {/* Brand Logo for consistency */}
        <BrandLogo className="skrblai-heading text-center mb-8 scale-125" animate />
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="skrblai-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-glow"
        >
          Contact Us
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-lg md:text-xl text-gray-300 mb-8"
        >
          We’d love to hear from you. For urgent matters, email <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 underline transition-colors">contact@skrblai.io</a>.
        </motion.p>

        {/* Glassmorphic Card for form/info */}
        <div className="glass-card shadow-cosmic rounded-2xl bg-white/5 backdrop-blur-xl bg-clip-padding border-2 border-teal-400/20 w-full max-w-2xl mx-auto p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: Form Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              aria-label="Contact form panel"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 relative"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
                    className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-electric-blue to-teal-400 mb-6 shadow-lg"
                  >
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                      />
                    </svg>
                  </motion.div>
                  {/* Subtle confetti animation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute inset-0 pointer-events-none z-10"
                    aria-hidden="true"
                  >
                    {[...Array(16)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: `${10 + Math.random() * 80}%`,
                          top: `${20 + Math.random() * 60}%`,
                          background: `linear-gradient(135deg, #38bdf8, #f472b6)`,
                          opacity: 0.7 + Math.random() * 0.3,
                        }}
                        initial={{ y: -20, scale: 0 }}
                        animate={{ y: [0, 24 + Math.random() * 20], scale: [0.7, 1, 0.7] }}
                        transition={{ delay: 0.8 + i * 0.05, duration: 1.2, repeat: 0 }}
                      />
                    ))}
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    Message Sent!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-gray-400 mb-6"
                  >
                    We'll get back to you as soon as possible.
                  </motion.p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 shadow"
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <motion.div
                    variants={fieldVariants}
                    custom={0}
                    className="relative"
                  >
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="Your name"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.div
                    variants={fieldVariants}
                    custom={1}
                    className="relative"
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="your@email.com"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.div
                    variants={fieldVariants}
                    custom={2}
                    className="relative"
                  >
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company (Optional)</label>
                    <motion.input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="Your company"
                    />
                  </motion.div>
                  <motion.div
                    variants={fieldVariants}
                    custom={3}
                    className="relative"
                  >
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                    <motion.select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      aria-required="true"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Partnership">Partnership Opportunity</option>
                      <option value="Feature Request">Feature Request</option>
                    </motion.select>
                  </motion.div>
                  <motion.div
                    variants={fieldVariants}
                    custom={4}
                    className="relative"
                  >
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <motion.textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                      placeholder="How can we help you?"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.button
                    variants={fieldVariants}
                    custom={5}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${isSubmitting ? 'bg-white/20 text-white/50' : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'}`}
                    aria-disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </motion.div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Email</h3>
                  <a href="mailto:contact@skrblai.io" className="text-electric-blue hover:text-teal-400 transition-colors duration-200">
                    contact@skrblai.io
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Website</h3>
                  <a href="https://skrblai.io" target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:text-teal-400 transition-colors duration-200">
                    skrblai.io
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-white/5">
            <h3 className="text-xl font-semibold mb-4 text-white">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white">What is SKRBL AI?</h4>
                <p className="text-gray-400">SKRBL AI is an all-in-one interactive experience delivered by our team of AI superheroes specializing in content creation, branding, publishing, and marketing.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">How quickly can I get started?</h4>
                <p className="text-gray-400">Simply tap or message Percy your "Interactive AI Concierge" to get started with SKRBL AI. You'll be up and running in minutes!</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Do you offer custom solutions?</h4>
                <p className="text-gray-400">Absolutely, our enterprise plan includes custom AI solutions and dedicated support. <Link href="/pricing" className="text-electric-blue hover:text-teal-400">Learn more</Link>.</p>
              </div>
            </div>
          </div>
        </div>
          </motion.div> {/* Closes Right Info Panel motion.div */}
        </div> {/* Closes the Grid div (grid grid-cols-1 md:grid-cols-2 gap-12) */}
      </div> {/* Closes the Glassmorphic Card div (glass-card shadow-cosmic...) */}
    </div> {/* Closes the Main Content Container div (container relative z-10 mx-auto max-w-3xl...) */}
  </motion.div> {/* Closes the Outermost Page Container motion.div (relative min-h-screen...) */}
);
}

                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing Question">Billing Question</option>
                    <option value="Partnership">Partnership Opportunity</option>
                    <option value="Feature Request">Feature Request</option>
                  </motion.select>
                </motion.div>
                
                <motion.div
                  variants={fieldVariants}
                  custom={4}
                  className="relative"
                >
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                  <motion.textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    whileFocus={{ boxShadow: '0 0 0 2px #38bdf8, 0 0 8px #38bdf8cc' }}
                    whileHover={{ scale: 1.01 }}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-shadow"
                    placeholder="How can we help you?"
                    aria-required="true"
                  />
                </motion.div>
                
                <motion.button
                  variants={fieldVariants}
                  custom={5}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${isSubmitting ? 'bg-white/20 text-white/50' : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'}`}
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </motion.button>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Do you offer custom solutions?</h4>
                    <p className="text-gray-400">Absolutely, our enterprise plan includes custom AI solutions and dedicated support. <Link href="/pricing" className="text-electric-blue hover:text-teal-400">Learn more</Link>.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}