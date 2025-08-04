import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkillSmith Sports Analysis | AI-Powered Athletic Performance',
  description: 'Get instant AI-powered sports analysis with SkillSmith. Upload your video for personalized training insights, technique improvements, and performance optimization.',
  keywords: [
    'sports analysis AI',
    'athletic performance analysis',
    'video analysis sports',
    'AI sports coaching',
    'baseball analysis',
    'basketball analysis',
    'football analysis',
    'golf analysis',
    'sports technique improvement',
    'SkillSmith AI'
  ],
  openGraph: {
    title: 'SkillSmith Sports Analysis | AI-Powered Athletic Performance',
    description: 'Upload your sports video and get instant AI analysis to improve your performance.',
    url: 'https://skrblai.io/sports',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/images/og-skillsmith.png',
        width: 1200,
        height: 630,
        alt: 'SkillSmith AI Sports Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillSmith Sports Analysis | AI-Powered Athletic Performance',
    description: 'Upload your sports video and get instant AI analysis.',
    images: ['/images/og-skillsmith.png'],
  },
  alternates: {
    canonical: 'https://skrblai.io/sports',
  },
};