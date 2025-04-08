import React from 'react';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Layout from '../components/layout/Layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://skrblai.io'),
  title: 'SKRBL AI - AI-Powered Marketing & Content Creation',
  description: 'Automate your brand, content, and web strategy with SKRBL AI intelligent agents. Transform your business with AI-powered marketing automation.',
  keywords: 'AI marketing, content creation, automation, business growth, artificial intelligence, digital marketing',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skrblai.io',
    siteName: 'SKRBL AI',
    title: 'SKRBL AI - Transform Your Business with AI',
    description: 'Automate your brand, content, and web strategy with SKRBL AI intelligent agents.',
    images: [
      {
        url: '/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI - AI-Powered Marketing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SKRBL AI - AI-Powered Marketing',
    description: 'Transform your business with AI-powered marketing automation.',
    images: ['/social-preview.png'],
    creator: '@skrblai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} overflow-x-hidden`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[#0D1117] text-white font-sans antialiased overflow-x-hidden">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
