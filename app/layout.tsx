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
  title: 'SKRBL AI',
  description: 'Your AI-powered assistant',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skrblai.io',
    siteName: 'SKRBL AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SKRBL AI',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-deep-navy text-white">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
