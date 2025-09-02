import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agent Services | SKRBL AI - Automated Business Solutions',
  description: 'Discover SKRBL AI\'s powerful agent services. From content creation to business automation, our AI agents provide competitive advantages that make your competition extinct.',
  keywords: [
    'AI agent services',
    'business automation',
    'AI content creation',
    'automated marketing',
    'AI SEO optimization',
    'business intelligence',
    'competitive analysis',
    'SKRBL AI agents'
  ],
  openGraph: {
    title: 'AI Agent Services | SKRBL AI',
    description: 'Deploy AI agents that give you an unfair advantage over your competition.',
    url: 'https://skrblai.io/services',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/images/og-services.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Agent Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Services | SKRBL AI',
    description: 'Deploy AI agents that give you an unfair advantage.',
    images: ['/images/og-services.png'],
  },
  alternates: {
    canonical: 'https://skrblai.io/services',
  },
};