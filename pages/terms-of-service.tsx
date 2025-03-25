'use client';

import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-deep-navy text-soft-gray p-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-electric-blue mb-8">
          Terms of Service
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            1. Introduction
          </h2>
          <p className="mb-4">
            Welcome to SKRBL AI! Our platform provides AI-powered tools for
            publishing automation, branding, website automation, and business
            intelligence. By using our services, you agree to these Terms of
            Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            2. Services Provided
          </h2>
          <p className="mb-4">
            SKRBL AI offers the following services:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Automated content publishing</li>
            <li>Branding and design tools</li>
            <li>Website automation solutions</li>
            <li>Business intelligence and analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            3. Account Terms
          </h2>
          <p className="mb-4">
            You are responsible for maintaining the security of your account and
            for all activities that occur under your account. You must provide
            accurate information when creating your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            4. Payments & Subscriptions
          </h2>
          <p className="mb-4">
            All transactions are managed by Paddle. By subscribing to our
            services, you agree to our billing terms and automatic renewal
            policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            5. Intellectual Property
          </h2>
          <p className="mb-4">
            You retain ownership of all content you create using our platform.
            SKRBL AI retains ownership of all platform technology and
            intellectual property.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            6. Termination
          </h2>
          <p className="mb-4">
            We may terminate or suspend your account if you violate these Terms
            of Service. You may cancel your account at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            7. Limitation of Liability
          </h2>
          <p className="mb-4">
            SKRBL AI is not liable for any indirect, incidental, or consequential
            damages arising from your use of our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            8. Changes to Terms
          </h2>
          <p className="mb-4">
            We may update these Terms of Service at any time. We will notify you
            of significant changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-electric-blue mb-4">
            9. Contact
          </h2>
          <p className="mb-4">
            For any questions about these Terms, please contact us at{' '}
            <a
              href="mailto:contact@skrblai.io"
              className="text-electric-blue hover:underline"
            >
              contact@skrblai.io
            </a>
            .
          </p>
        </section>
      </div>
    </motion.div>
  );
} 