import { ReactNode } from 'react';

export const metadata = {
  title: "SKRBL AI Sports Performance – AI Athletic Training & Coaching",
  description: "Transform your athletic performance with AI-powered training programs, nutrition planning, and sports coaching. Professional training made personal.",
  keywords: "sports training, athletic performance, AI coaching, fitness plans, sports nutrition, injury prevention, performance analysis, athlete development",
  openGraph: {
    title: "SKRBL AI Sports Performance – AI Athletic Training",
    description: "Professional-grade AI sports coaching for athletes at every level. Custom training, nutrition, and performance optimization.",
    type: "website",
    images: [
      {
        url: "/images/sports-hero-og.jpg",
        width: 1200,
        height: 630,
        alt: "SKRBL AI Sports Performance Platform"
      }
    ]
  }
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SportsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 