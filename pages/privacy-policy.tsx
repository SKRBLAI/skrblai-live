'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-deep-navy text-soft-gray p-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-electric-blue mb-8">
          Privacy Policy
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            1. Data Collection
          </h2>
          <p className="mb-4">
            We collect information you provide directly, including account
            details, payment information, and content you create using our
            platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            2. Data Usage
          </h2>
          <p className="mb-4">
            Your data is used to provide and improve our services, process
            payments, and communicate with you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            3. Cookies & Tracking
          </h2>
          <p className="mb-4">
            We use cookies to enhance your experience and analyze site usage.
            You can manage cookie preferences in your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            4. Third-Party Services
          </h2>
          <p className="mb-4">
            We use Stripe and Paddle for payment processing. These services have
            their own privacy policies governing data use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            5. Data Retention
          </h2>
          <p className="mb-4">
            We retain your data as long as your account is active or as needed
            to provide services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            6. Your Rights
          </h2>
          <p className="mb-4">
            You can access, update, or delete your data. Contact us at{' '}
            <a
              href="mailto:contact@skrblai.io"
              className="text-electric-blue hover:underline"
            >
              contact@skrblai.io
            </a>{' '}
            for assistance.
          </p>
        </section>
      </div>
    </motion.div>
  );
} 