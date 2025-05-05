import { ReactNode } from 'react';

export const metadata = {
  title: "SKRBL AI Features – AI-Powered Automation",
  description: "Explore SKRBL AI's powerful features for business automation and growth.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 