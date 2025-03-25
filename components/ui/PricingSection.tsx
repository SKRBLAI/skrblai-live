'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const pricingTiers = [
  {
    id: 1,
    name: 'Starter',
    description: 'Perfect for small teams',
    price: '$99/mo'
  },
  {
    id: 2,
    name: 'Growth',
    description: 'For growing businesses',
    price: '$299/mo'
  },
  {
    id: 3,
    name: 'Scale',
    description: 'Advanced features',
    price: '$599/mo'
  },
  {
    id: 4,
    name: 'Enterprise',
    description: 'Custom solutions',
    price: 'Custom'
  }
];

export function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-electric-blue">
        Pricing Plans
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {pricingTiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-deep-navy/80 p-8 rounded-xl border border-electric-blue/20"
          >
            <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
            <p className="text-3xl font-bold mb-4 text-electric-blue">{tier.price}</p>
            <p className="text-soft-gray/80 mb-6">{tier.description}</p>
            <Link
              href="/pricing"
              className="btn-primary w-full text-center"
            >
              Learn More
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 