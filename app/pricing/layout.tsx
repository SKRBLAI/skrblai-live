import { ReactNode } from 'react';

export const metadata = {
  title: "SKRBL AI Pricing – Choose Your Plan",
  description: "Find the perfect SKRBL AI plan for your needs. From free tier to enterprise solutions, power your business with AI automation.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PricingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
