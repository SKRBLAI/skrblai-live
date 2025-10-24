import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat with Percy | AI Business Advisor - SKRBL AI',
  description: 'Have an intelligent conversation with Percy, your AI business advisor. Get real-time recommendations, marketing strategies, and personalized agent suggestions powered by streaming AI.',
  
  openGraph: {
    title: 'Chat with Percy | AI Business Advisor',
    description: 'Stream real-time conversations with Percy AI. Get instant business advice, agent recommendations, and strategic insights.',
    url: 'https://skrblai.io/percy-chat',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI Percy Chat',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Chat with Percy | AI Business Advisor',
    description: 'Stream real-time conversations with Percy AI. Get instant business advice and agent recommendations.',
    images: ['/og-image.png'],
  },
  
  keywords: [
    'AI chat',
    'business advisor AI',
    'Percy AI',
    'streaming chat',
    'AI recommendations',
    'business intelligence',
    'AI agents',
    'conversational AI',
    'real-time AI',
    'SKRBL AI'
  ],
};
