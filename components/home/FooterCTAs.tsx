"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function FooterCTAs() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Start Your Athlete Journey?
        </h2>
        <p className="text-white/70 mb-8 max-w-2xl mx-auto">
          Join hundreds of young athletes and families who are training smarter, competing calmer, and growing stronger.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/athletics"
              className="btn-solid-grad px-8 py-4 inline-flex items-center gap-2 font-semibold"
            >
              <span>Explore Athletics Hub</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/pricing"
              className="border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-xl inline-flex items-center gap-2 font-semibold text-white transition-all"
            >
              View Plans
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/contact"
              className="border border-green-400/30 bg-green-500/10 hover:bg-green-500/20 px-8 py-4 rounded-xl inline-flex items-center gap-2 font-semibold text-green-300 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Questions? Contact Us</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
