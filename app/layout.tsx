import "./globals.css";
import PercyWrapper from "@/components/providers/PercyWrapper";
import type { ReactNode } from "react";

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
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-deep-navy min-h-screen antialiased">
        <PercyWrapper>
          {children}
        </PercyWrapper>
      </body>
    </html>
  );
}
