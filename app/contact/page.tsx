'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FloatingParticles from '@/components/ui/FloatingParticles';

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
          We’d love to hear from you. For urgent matters, email{' '}
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
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
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
                    variants={fieldVariants}
                    custom={5}
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold rounded-xl hover:from-electric-blue/90 hover:to-teal-400/90 transition-all duration-300 transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </motion.div>

            {/* Right: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Email</p>
                      <a href="mailto:contact@skrblai.io" className="text-white hover:text-electric-blue transition-colors">
                        contact@skrblai.io
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Location</p>
                      <p className="text-white">Remote-First, Global Team</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Response Time</p>
                      <p className="text-white">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <Link href="/features" className="block text-gray-300 hover:text-electric-blue transition-colors">
                    Features & Capabilities
                  </Link>
                  <Link href="/pricing" className="block text-gray-300 hover:text-electric-blue transition-colors">
                    Pricing Plans
                  </Link>
                  <Link href="/docs" className="block text-gray-300 hover:text-electric-blue transition-colors">
                    Documentation
                  </Link>
                  <Link href="/support" className="block text-gray-300 hover:text-electric-blue transition-colors">
                    Support Center
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
