import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Layout from '../components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
