import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Contact | SKRBL AI - Get in Touch with Percy & Our AI Team',
  description: 'Connect with SKRBL AI for business inquiries, support, partnerships, or custom AI solutions. Fast response times, expert consultation, and personalized service from Percy and our team.',
  openGraph: {
    title: 'Contact | SKRBL AI - Get in Touch with Percy & Our AI Team',
    description: 'Connect with SKRBL AI for business inquiries, support, partnerships, or custom AI solutions. Fast response times and expert consultation.',
    url: 'https://skrblai.io/contact',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contact SKRBL AI - Percy & AI Team Support',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | SKRBL AI - Get in Touch',
    description: 'Connect with SKRBL AI for business inquiries, support, partnerships, or custom AI solutions.',
    images: ['/og-image.png'],
  },
  keywords: [
    'Contact SKRBL AI',
    'AI Support',
    'Business Inquiries',
    'AI Consultation',
    'Customer Service',
    'Percy AI Support',
    'AI Partnerships',
    'Technical Support',
    'Custom AI Solutions',
    'Enterprise Contact'
  ],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const themeColor = '#0d1117';