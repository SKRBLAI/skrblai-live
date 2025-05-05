import { ReactNode } from 'react';

export const metadata = {
  title: "SKRBL AI Branding – AI Brand Development",
  description: "Create and evolve your brand identity with AI-powered branding tools.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BrandingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 