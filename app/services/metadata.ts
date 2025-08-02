import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Services | SKRBL AI Business Solutions & Automation',
  description: 'Discover SKRBL AI\'s comprehensive business services: marketing automation, content creation, brand management, analytics, and custom AI solutions tailored for your industry.',
  openGraph: {
    title: 'AI Services | SKRBL AI Business Solutions & Automation',
    description: 'Discover SKRBL AI\'s comprehensive business services: marketing automation, content creation, brand management, and analytics.',
    url: 'https://skrblai.io/services',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Services - Business Solutions & Automation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Services | SKRBL AI Business Solutions',
    description: 'Discover SKRBL AI\'s comprehensive business services: marketing automation, content creation, and analytics.',
    images: ['/og-image.png'],
  },
  keywords: [
    'AI Services',
    'Business Solutions',
    'Marketing Automation',
    'Content Creation',
    'Brand Management',
    'Business Analytics',
    'Custom AI Solutions',
    'Digital Transformation',
    'SKRBL AI Services',
    'Enterprise Automation'
  ],
};
