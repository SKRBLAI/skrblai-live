import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | SKRBL AI - Your AI Command Center',
  description: 'Access your complete SKRBL AI automation suite. Manage campaigns, monitor analytics, control AI agents, track performance, and optimize your business operations from one powerful dashboard.',
  openGraph: {
    title: 'Dashboard | SKRBL AI - Your AI Command Center',
    description: 'Access your complete SKRBL AI automation suite. Manage campaigns, monitor analytics, and control AI agents from one dashboard.',
    url: 'https://skrblai.io/dashboard',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Dashboard - AI Command Center',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | SKRBL AI - AI Command Center',
    description: 'Access your complete SKRBL AI automation suite. Manage campaigns and control AI agents.',
    images: ['/og-image.png'],
  },
  keywords: [
    'SKRBL AI Dashboard',
    'AI Command Center',
    'Business Automation Dashboard',
    'AI Analytics',
    'Campaign Management',
    'AI Agent Control',
    'Performance Monitoring',
    'Business Intelligence',
    'Automation Hub',
    'AI Operations'
  ],
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}; 