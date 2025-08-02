import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academy | SKRBL AI Learning Center & Tutorials',
  description: 'Master SKRBL AI with our comprehensive learning center. Step-by-step tutorials, best practices, automation guides, and expert tips to maximize your AI-powered business transformation.',
  openGraph: {
    title: 'Academy | SKRBL AI Learning Center & Tutorials',
    description: 'Master SKRBL AI with our comprehensive learning center. Step-by-step tutorials, best practices, and automation guides.',
    url: 'https://skrblai.io/academy',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Academy - Learning Center & Tutorials',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academy | SKRBL AI Learning Center',
    description: 'Master SKRBL AI with comprehensive tutorials, best practices, and automation guides.',
    images: ['/og-image.png'],
  },
  keywords: [
    'SKRBL AI Academy',
    'AI Tutorials',
    'Automation Guides',
    'Learning Center',
    'AI Training',
    'Best Practices',
    'AI Education',
    'Business Automation Training',
    'AI Mastery',
    'Digital Transformation Learning'
  ],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const themeColor = '#0d1117';