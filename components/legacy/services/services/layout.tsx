import { ReactNode } from 'react';

export const metadata = {
  title: "SKRBL AI Services – Meet Your AI Agents",
  description: "Browse and deploy AI agents tailored for your business. SKRBL AI's Agent Marketplace brings automation to your workflow.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 