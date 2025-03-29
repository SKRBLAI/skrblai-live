'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function PricingSection() {
  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-10">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-4">Starter</h3>
            <p className="text-3xl font-bold mb-6 text-teal-500">$99/mo</p>
            <p className="text-gray-600 mb-8">Perfect for small teams</p>
            <Link href="/signup">
              <button className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-colors duration-300">
                Get Started
              </button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-4">Growth</h3>
            <p className="text-3xl font-bold mb-6 text-teal-500">$299/mo</p>
            <p className="text-gray-600 mb-8">For growing businesses</p>
            <Link href="/signup">
              <button className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-colors duration-300">
                Get Started
              </button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-4">Scale</h3>
            <p className="text-3xl font-bold mb-6 text-teal-500">$599/mo</p>
            <p className="text-gray-600 mb-8">Advanced features</p>
            <Link href="/signup">
              <button className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-colors duration-300">
                Get Started
              </button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
            <p className="text-3xl font-bold mb-6 text-teal-500">Custom</p>
            <p className="text-gray-600 mb-8">Custom solutions</p>
            <Link href="/contact">
              <button className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-colors duration-300">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}