import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sports AI | SKRBL AI Athletic Performance & Analytics',
  description: 'Revolutionize sports performance with SKRBL AI. Advanced analytics, player tracking, performance optimization, and data-driven insights for athletes, coaches, and sports organizations.',
  openGraph: {
    title: 'Sports AI | SKRBL AI Athletic Performance & Analytics',
    description: 'Revolutionize sports performance with SKRBL AI. Advanced analytics, player tracking, and performance optimization.',
    url: 'https://skrblai.io/sports',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Sports - Athletic Performance & Analytics',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sports AI | SKRBL AI Athletic Performance',
    description: 'Revolutionize sports performance with SKRBL AI. Advanced analytics and performance optimization.',
    images: ['/og-image.png'],
  },
  keywords: [
    'Sports AI',
    'Athletic Performance',
    'Sports Analytics',
    'Player Tracking',
    'Performance Optimization',
    'Sports Data',
    'AI Coaching',
    'Sports Technology',
    'Athletic Intelligence',
    'Sports Innovation'
  ],
};
