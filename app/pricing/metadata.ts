import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | SKRBL AI Plans & Packages for Every Business',
  description: 'Choose the perfect SKRBL AI plan for your business. From startup-friendly packages to enterprise solutions. Transparent pricing, powerful AI automation, and exceptional value.',
  openGraph: {
    title: 'Pricing | SKRBL AI Plans & Packages for Every Business',
    description: 'Choose the perfect SKRBL AI plan for your business. From startup packages to enterprise solutions with transparent pricing.',
    url: 'https://skrblai.io/pricing',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Pricing Plans - AI Automation for Every Business',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | SKRBL AI Plans & Packages',
    description: 'Choose the perfect SKRBL AI plan for your business. Transparent pricing, powerful AI automation.',
    images: ['/og-image.png'],
  },
  keywords: [
    'SKRBL AI Pricing',
    'AI Automation Plans',
    'Business Packages',
    'Enterprise AI',
    'Startup AI Solutions',
    'AI Subscription',
    'Business Automation Cost',
    'AI Platform Pricing',
    'Digital Transformation',
    'AI Investment'
  ],
};
