import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agents | SKRBL AI League of Digital Superheroes',
  description: 'Meet our AI agents: Percy, Skylar, Zara, Blaze, Nova, and Sage. Each specialized for marketing, content, branding, analytics, and business automation. Choose your AI superhero.',
  openGraph: {
    title: 'AI Agents | SKRBL AI League of Digital Superheroes',
    description: 'Meet our AI agents: Percy, Skylar, Zara, Blaze, Nova, and Sage. Each specialized for marketing, content, branding, and analytics.',
    url: 'https://skrblai.io/agents',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI League of Digital Superheroes - AI Agents',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agents | SKRBL AI League of Digital Superheroes',
    description: 'Meet our AI agents: Percy, Skylar, Zara, Blaze, Nova, and Sage. Choose your AI superhero for business automation.',
    images: ['/og-image.png'],
  },
  keywords: [
    'AI Agents',
    'Percy AI',
    'Skylar AI',
    'Zara AI',
    'Blaze AI',
    'Nova AI',
    'Sage AI',
    'Digital Superheroes',
    'Business Automation',
    'AI Marketing',
    'Content Creation',
    'Brand Management'
  ],
  alternates: {
    canonical: 'https://skrblai.io/agents',
  },
};
