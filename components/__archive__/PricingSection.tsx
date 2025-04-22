'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeInUp, staggerContainer } from '@/utils/animations';

const PricingSection = () => {
  return (
    <section className="bg-gradient-to-b from-deep-navy to-black text-white py-32 px-6 relative overflow-hidden">
      <motion.div 
        className="max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeInUp} className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins bg-gradient-to-r from-electric-blue to-teal bg-clip-text text-transparent">
            Pricing Plans
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-inter">
            Choose the perfect plan for your business needs
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            variants={fadeInUp}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-electric-blue/50 transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold mb-4 font-poppins text-electric-blue">Starter</h3>
            <p className="text-4xl font-bold mb-6 text-white">$99<span className="text-xl">/mo</span></p>
            <ul className="space-y-4 mb-8 text-gray-300">
              <li>✓ 5 AI Agents</li>
              <li>✓ Basic Analytics</li>
              <li>✓ 100 Pages/mo</li>
              <li>✓ Email Support</li>
            </ul>
            <Link href="/signup" className="block">
              <button className="w-full px-8 py-4 bg-gradient-to-r from-electric-blue to-teal hover:from-teal hover:to-electric-blue transition-all duration-300 rounded-lg text-lg font-semibold">
                Get Started
              </button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 border-electric-blue shadow-[0_0_30px_rgba(0,149,255,0.15)] relative"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-electric-blue to-teal px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <h3 className="text-2xl font-semibold mb-4 font-poppins text-electric-blue">Growth</h3>
            <p className="text-4xl font-bold mb-6 text-white">$299<span className="text-xl">/mo</span></p>
            <ul className="space-y-4 mb-8 text-gray-300">
              <li>✓ 15 AI Agents</li>
              <li>✓ Advanced Analytics</li>
              <li>✓ 500 Pages/mo</li>
              <li>✓ Priority Support</li>
              <li>✓ Custom Branding</li>
            </ul>
            <Link href="/signup" className="block">
              <button className="w-full px-8 py-4 bg-gradient-to-r from-electric-blue to-teal hover:from-teal hover:to-electric-blue transition-all duration-300 rounded-lg text-lg font-semibold">
                Get Started
              </button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-electric-blue/50 transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold mb-4 font-poppins text-electric-blue">Enterprise</h3>
            <p className="text-4xl font-bold mb-6 text-white">Custom</p>
            <ul className="space-y-4 mb-8 text-gray-300">
              <li>✓ Unlimited AI Agents</li>
              <li>✓ Custom Analytics</li>
              <li>✓ Unlimited Pages</li>
              <li>✓ 24/7 Support</li>
              <li>✓ API Access</li>
              <li>✓ Custom Integration</li>
            </ul>
            <Link href="/contact" className="block">
              <button className="w-full px-8 py-4 bg-gradient-to-r from-electric-blue to-teal hover:from-teal hover:to-electric-blue transition-all duration-300 rounded-lg text-lg font-semibold">
                Contact Sales
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default PricingSection;