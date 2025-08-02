import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About SKRBL AI | Meet Percy & The AI League of Digital Superheroes',
  description: 'Discover the story behind SKRBL AI, Percy the AI Concierge, and our League of Digital Superheroes. Learn how we\'re revolutionizing business automation with AI-powered solutions.',
  openGraph: {
    title: 'About SKRBL AI | Meet Percy & The AI League of Digital Superheroes',
    description: 'Discover the story behind SKRBL AI, Percy the AI Concierge, and our League of Digital Superheroes. Revolutionary business automation.',
    url: 'https://skrblai.io/about',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Percy and SKRBL AI League of Digital Superheroes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About SKRBL AI | Meet Percy & The AI League',
    description: 'Discover the story behind SKRBL AI and our League of Digital Superheroes revolutionizing business automation.',
    images: ['/og-image.png'],
  },
  keywords: [
    'SKRBL AI',
    'Percy AI Concierge',
    'AI League',
    'Digital Superheroes',
    'Business Automation',
    'AI Solutions',
    'Company Story',
    'AI Technology'
  ],
};
