import './globals.css';
import PercyProvider from '../components/assistant/PercyProvider';
import type { ReactNode } from "react";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: "SKRBL AI - Your AI-powered Automation Hub",
  description: "Transform your business with AI-powered automation. SKRBL AI helps you streamline operations, boost productivity, and unlock growth.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#0A1929",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-deep-navy min-h-screen antialiased font-sans">
        <PercyProvider>
          {children}
        </PercyProvider>
      </body>
    </html>
  );
}
