import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Book Publishing | SKRBL AI Author & Publisher Solutions',
  description: 'Transform your publishing journey with SKRBL AI. AI-powered writing assistance, manuscript editing, marketing automation, and publishing workflow optimization for authors and publishers.',
  openGraph: {
    title: 'AI Book Publishing | SKRBL AI Author & Publisher Solutions',
    description: 'Transform your publishing journey with SKRBL AI. AI-powered writing assistance, manuscript editing, and marketing automation.',
    url: 'https://skrblai.io/book-publishing',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Book Publishing - Author & Publisher Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Book Publishing | SKRBL AI Solutions',
    description: 'Transform your publishing journey with SKRBL AI. AI-powered writing assistance and marketing automation.',
    images: ['/og-image.png'],
  },
  keywords: [
    'AI Book Publishing',
    'Author Solutions',
    'Publisher Tools',
    'AI Writing Assistant',
    'Manuscript Editing',
    'Publishing Automation',
    'Book Marketing',
    'Publishing Workflow',
    'Author Platform',
    'Publishing Technology'
  ],
};
