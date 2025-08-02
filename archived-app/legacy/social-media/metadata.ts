import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Social Media | SKRBL AI Social Media Management & Automation',
  description: 'Dominate social media with SKRBL AI. Automated content creation, scheduling, engagement tracking, influencer management, and data-driven social media strategies that convert.',
  openGraph: {
    title: 'AI Social Media | SKRBL AI Social Media Management & Automation',
    description: 'Dominate social media with SKRBL AI. Automated content creation, scheduling, engagement tracking, and data-driven strategies.',
    url: 'https://skrblai.io/social-media',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Social Media - Management & Automation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Social Media | SKRBL AI Management',
    description: 'Dominate social media with SKRBL AI. Automated content creation, scheduling, and data-driven strategies.',
    images: ['/og-image.png'],
  },
  keywords: [
    'AI Social Media',
    'Social Media Automation',
    'Content Creation',
    'Social Media Management',
    'Engagement Tracking',
    'Influencer Management',
    'Social Media Strategy',
    'AI Marketing',
    'Social Analytics',
    'Digital Marketing'
  ],
};
