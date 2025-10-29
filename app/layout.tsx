import './globals.css';
import '../styles/components.css';
import '../styles/cosmic-theme.css';
import '../styles/pseudo-3d-effects.css';
import type { ReactNode } from "react";
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { getBaseUrl } from '../lib/url';
import GoogleAnalytics from '../components/analytics/GoogleAnalytics';
import { ConditionalClerkProvider } from '../components/providers/ConditionalClerkProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl() || 'https://skrblai.io'),
  title: {
    default: 'SKRBL AI - AI-Powered Business Automation & Content Creation',
    template: '%s | SKRBL AI'
  },
  description: 'Transform your business with AI automation. From content creation to business intelligence, SKRBL AI provides cutting-edge AI agents to streamline your operations and boost productivity.',
  keywords: [
    'AI automation',
    'business intelligence',
    'content creation',
    'AI agents',
    'digital transformation',
    'productivity tools',
    'artificial intelligence',
    'business optimization'
  ],
  authors: [{ name: 'SKRBL AI Team' }],
  creator: 'SKRBL AI',
  publisher: 'SKRBL AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'SKRBL AI',
    title: 'SKRBL AI - AI-Powered Business Automation & Content Creation',
    description: 'Transform your business with AI automation. From content creation to business intelligence, SKRBL AI provides cutting-edge AI agents to streamline your operations.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI - AI-Powered Business Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SKRBL AI - AI-Powered Business Automation',
    description: 'Transform your business with AI automation. From content creation to business intelligence, SKRBL AI provides cutting-edge AI agents.',
    images: ['/images/og-image.png'],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark overflow-x-hidden h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#0b1220" />
        <meta name="theme-color" content="#0b1220" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <GoogleAnalytics />
      </head>
      <body className="text-white min-h-[100svh] antialiased font-sans overflow-x-hidden page-layout">
        <ConditionalClerkProvider>
          {/* Skip to main content link for accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Skip to main content
          </a>
          
          <ClientLayout>{children}</ClientLayout>
        </ConditionalClerkProvider>
      </body>
    </html>
  );
}
