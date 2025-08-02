import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Proposal | SKRBL AI Custom Solutions',
  description: 'Get a custom AI automation proposal tailored to your business needs. SKRBL AI delivers personalized solutions with detailed implementation plans and ROI projections.',
  openGraph: {
    title: 'Business Proposal | SKRBL AI Custom Solutions',
    description: 'Get a custom AI automation proposal tailored to your business needs. Personalized solutions with detailed implementation plans.',
    url: 'https://skrblai.io/proposal',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Business Proposal - Custom AI Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Proposal | SKRBL AI Custom Solutions',
    description: 'Get a custom AI automation proposal tailored to your business needs with detailed implementation plans.',
    images: ['/og-image.png'],
  },
  keywords: [
    'Business Proposal',
    'Custom AI Solutions',
    'AI Automation Proposal',
    'Implementation Plan',
    'ROI Projections',
    'Business Consultation',
    'AI Strategy',
    'Custom Development',
    'Enterprise Solutions',
    'Business Transformation'
  ],
};
