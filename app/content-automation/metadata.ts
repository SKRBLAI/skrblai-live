import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Content Automation | SKRBL AI - AI-Powered Content Creation',
  description: 'Revolutionize your content strategy with SKRBL AI. Automated blog writing, social media posts, email campaigns, video scripts, and SEO-optimized content at scale.',
  openGraph: {
    title: 'Content Automation | SKRBL AI - AI-Powered Content Creation',
    description: 'Revolutionize your content strategy with SKRBL AI. Automated blog writing, social media posts, email campaigns, and SEO-optimized content.',
    url: 'https://skrblai.io/content-automation',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Content Automation - AI-Powered Content Creation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Automation | SKRBL AI',
    description: 'Revolutionize your content strategy with SKRBL AI. Automated content creation at scale.',
    images: ['/og-image.png'],
  },
  keywords: [
    'Content Automation',
    'AI Content Creation',
    'Automated Blogging',
    'Social Media Automation',
    'Email Campaign Automation',
    'SEO Content',
    'Video Script Writing',
    'Content Strategy',
    'AI Copywriting',
    'Content Marketing Automation'
  ],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const themeColor = '#0d1117';